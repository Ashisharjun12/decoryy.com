import { getApiError } from '@/api/client';
import { getPaymentMethods } from '@/api/payments.api';
import { Screen, TabScreenTitle } from '@/components/shell';
import { SmoothScrollView } from '@/components/shell/SmoothScrollView';
import { useGoBack } from '@/lib/use-go-back';
import { CheckoutCustomerSection } from '@/module/booking/components/CheckoutCustomerSection';
import { CheckoutDeliverySection } from '@/module/booking/components/CheckoutDeliverySection';
import { CheckoutOrderSummary } from '@/module/booking/components/CheckoutOrderSummary';
import { CheckoutPayBar } from '@/module/booking/components/CheckoutPayBar';
import { CheckoutPaymentSection } from '@/module/booking/components/CheckoutPaymentSection';
import { CheckoutSuccessSheet } from '@/module/booking/components/CheckoutSuccessSheet';
import { useCartData, useCartMutations, useCartQuery } from '@/module/booking/hooks/use-cart-query';
import {
  customerFormValid,
  deliveryFormValid,
} from '@/module/booking/lib/checkout-validation';
import type {
  CheckoutCustomerForm,
  CheckoutDeliveryForm,
  CheckoutPaymentMethod,
} from '@/module/booking/lib/checkout-form-types';
import { getCouponPaymentWarning } from '@/module/booking/lib/coupon-eligibility';
import { placeOrder } from '@/module/booking/lib/place-order';
import { useAddressesQuery } from '@/module/account/hooks/use-addresses-query';
import { useAuthStore } from '@/store/auth.store';
import { type Href, router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const initialDelivery: CheckoutDeliveryForm = {
  pincode: '',
  address: '',
  landmark: '',
  cityName: '',
  cityId: null,
  pinStatus: 'idle',
  pinMessage: '',
  latitude: null,
  longitude: null,
  deliveryGeoConfirmed: false,
};

export function CheckoutScreen() {
  const user = useAuthStore((s) => s.user);
  const onBack = useGoBack({ orHome: true });
  const insets = useSafeAreaInsets();
  const { cart, isLoading } = useCartData();
  useCartQuery(Boolean(user));
  const { refresh } = useCartMutations();
  const { data: addresses = [] } = useAddressesQuery(Boolean(user));

  const [customer, setCustomer] = useState<CheckoutCustomerForm>({
    name: '',
    phone: '',
    email: '',
  });
  const [delivery, setDelivery] = useState<CheckoutDeliveryForm>(initialDelivery);
  const [payment, setPayment] = useState<CheckoutPaymentMethod>('');
  const [platformPay, setPlatformPay] = useState({ cod: true, online: false });
  const [placing, setPlacing] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const idempotencyKeyRef = useRef(`mobile-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!user) {
      router.replace('/(onboarding)/login' as Href);
      return;
    }
    setCustomer((prev) => ({
      name: prev.name || user.name || '',
      phone: prev.phone || user.phone || '',
      email: prev.email || user.email || '',
    }));
  }, [user]);

  useEffect(() => {
    void getPaymentMethods()
      .then((data) => {
        setPlatformPay({
          cod: data?.cod !== false,
          online: Boolean(data?.online),
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoading && cart.items.length === 0) {
      router.replace('/(app)/cart' as Href);
    }
  }, [isLoading, cart.items.length]);

  const items = cart.items;
  const allowCod =
    platformPay.cod && items.length > 0 && items.every((item) => item.paymentCod !== false);
  const allowOnline =
    platformPay.online && items.length > 0 && items.every((item) => item.paymentOnline);

  useEffect(() => {
    if (payment === 'cod' && !allowCod) setPayment('');
    if (payment === 'online' && !allowOnline) setPayment('');
    if (!payment && allowCod && !allowOnline) setPayment('cod');
    if (!payment && allowOnline && !allowCod) setPayment('online');
  }, [allowCod, allowOnline, payment]);

  const isInstantCart = cart.fulfillmentType === 'instant';
  const paymentWarning = useMemo(
    () => getCouponPaymentWarning(cart.appliedCoupon, payment),
    [cart.appliedCoupon, payment],
  );

  const canPay =
    customerFormValid(customer) &&
    deliveryFormValid(delivery, isInstantCart) &&
    (payment === 'cod' || payment === 'online') &&
    !paymentWarning;

  async function onPlace() {
    if (!canPay || placing) return;
    setPlacing(true);
    try {
      const result = await placeOrder({
        customer,
        delivery,
        payment,
        cart,
        idempotencyKey: idempotencyKeyRef.current,
      });
      setOrderId(result.orderId);
      await refresh();
      setSuccessOpen(true);
    } catch (err) {
      Alert.alert('Could not place order', getApiError(err));
    } finally {
      setPlacing(false);
    }
  }

  if (isLoading && items.length === 0) {
    return (
      <Screen edges={['top', 'left', 'right']} gutter contentClassName="flex-1">
        <ActivityIndicator className="mt-10" />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'left', 'right']} gutter contentClassName="flex-1">
      <TabScreenTitle title="Checkout" showBack onBack={onBack} insetFromParentGutter />
      <SmoothScrollView
        className="flex-1"
        contentContainerClassName="gap-5 pb-4 pt-2"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        <CheckoutCustomerSection value={customer} onChange={setCustomer} />
        <CheckoutDeliverySection
          value={delivery}
          onChange={setDelivery}
          addresses={addresses}
          cartPincode={cart.pincode}
        />
        <CheckoutPaymentSection
          value={payment}
          onChange={setPayment}
          allowCod={allowCod}
          allowOnline={allowOnline}
          paymentWarning={paymentWarning}
        />
        <CheckoutOrderSummary cart={cart} />
      </SmoothScrollView>
      <View className="absolute inset-x-0 bottom-0 px-5" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
        <CheckoutPayBar
          totalPaise={cart.totalPaise}
          placing={placing}
          disabled={!canPay}
          onPress={() => void onPlace()}
        />
      </View>
      <CheckoutSuccessSheet
        visible={successOpen}
        orderId={orderId}
        onClose={() => setSuccessOpen(false)}
      />
    </Screen>
  );
}
