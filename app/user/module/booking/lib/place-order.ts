import { createOrder } from '@/api/orders.api';
import { verifyPayment } from '@/api/payments.api';
import { getApiError } from '@/api/client';
import type { CheckoutCustomerForm, CheckoutDeliveryForm } from '@/module/booking/lib/checkout-form-types';
import type { CartSnapshot } from '@/module/booking/lib/cart-types';
import type { CheckoutPaymentMethod } from '@/module/booking/lib/checkout-form-types';

type RazorpayCheckoutPayload = {
  keyId: string;
  amountPaise: number;
  currency?: string;
  name?: string;
  description?: string;
  orderId: string;
  decoryOrderId: string;
  provider?: string;
};

export type PlaceOrderInput = {
  customer: CheckoutCustomerForm;
  delivery: CheckoutDeliveryForm;
  payment: CheckoutPaymentMethod;
  cart: CartSnapshot;
  idempotencyKey: string;
};

export type PlaceOrderResult = {
  orderId: string;
};

async function openRazorpayNative(
  checkout: RazorpayCheckoutPayload,
  customer: CheckoutCustomerForm,
): Promise<Record<string, unknown>> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RazorpayCheckout = require('react-native-razorpay').default as {
    open: (options: Record<string, unknown>) => Promise<{
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }>;
  };

  const response = await RazorpayCheckout.open({
    key: checkout.keyId,
    amount: checkout.amountPaise,
    currency: checkout.currency || 'INR',
    name: checkout.name || 'DeccorBuddys',
    description: checkout.description,
    order_id: checkout.orderId,
    prefill: {
      name: customer.name,
      email: customer.email,
      contact: customer.phone.replace(/\D/g, '').slice(-10),
    },
  });

  return {
    provider: 'razorpay',
    orderId: checkout.decoryOrderId,
    razorpayOrderId: response.razorpay_order_id,
    razorpayPaymentId: response.razorpay_payment_id,
    razorpaySignature: response.razorpay_signature,
  };
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const { customer, delivery, payment, cart, idempotencyKey } = input;

  if (!delivery.cityId) {
    throw new Error('Enter a serviceable delivery PIN');
  }

  const payload = {
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.replace(/\D/g, '').slice(-10),
      email: customer.email.trim(),
    },
    delivery: {
      pincode: delivery.pincode.replace(/\D/g, '').slice(0, 6),
      address: delivery.address.trim(),
      landmark: delivery.landmark.trim() || undefined,
      cityId: delivery.cityId,
      ...(cart.deliveryLatitude != null && cart.deliveryLongitude != null
        ? {
            latitude: cart.deliveryLatitude,
            longitude: cart.deliveryLongitude,
          }
        : delivery.latitude != null && delivery.longitude != null
          ? { latitude: delivery.latitude, longitude: delivery.longitude }
          : {}),
    },
    paymentMethod: payment as 'cod' | 'online',
    idempotencyKey,
  };

  const result = await createOrder(payload);
  const order = (result as { order?: { id: string }; id?: string })?.order ?? result;
  const orderId = (order as { id: string }).id;
  const checkout = (result as { checkout?: RazorpayCheckoutPayload & { paymentSessionId?: string } })
    ?.checkout;

  if (payment === 'online' && checkout) {
    if (checkout.provider === 'cashfree' || checkout.paymentSessionId) {
      throw new Error('Cashfree checkout is not available in the app yet. Try cash on delivery.');
    }
    try {
      const verifyPayload = await openRazorpayNative(
        { ...checkout, decoryOrderId: orderId },
        customer,
      );
      const confirmed = await verifyPayment(verifyPayload);
      return { orderId: (confirmed as { id?: string })?.id ?? orderId };
    } catch (err) {
      throw new Error(getApiError(err));
    }
  }

  return { orderId };
}
