import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckIcon } from "lucide-react";
import { getApiError } from "@/api/api";
import { getPaymentMethods, verifyPayment } from "@/api/payments.api";
import { createOrder } from "@/api/orders.api";
import { openCashfreeCheckout, openRazorpayCheckout } from "@/module/booking/lib/online-checkout";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper";
import { Spinner } from "@/components/ui/spinner";
import { isValidIndianMobile } from "@/module/auth/phone-login";
import { CheckoutCustomerStep } from "@/module/booking/components/CheckoutCustomerStep";
import { CheckoutDeliveryStep } from "@/module/booking/components/CheckoutDeliveryStep";
import { CheckoutPaymentStep } from "@/module/booking/components/CheckoutPaymentStep";
import { CheckoutReviewStep } from "@/module/booking/components/CheckoutReviewStep";
import { CheckoutSummary } from "@/module/booking/components/CheckoutSummary";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";

const STEPS = [
  { step: 1, title: "Customer", description: "You" },
  { step: 2, title: "Delivery", description: "Address" },
  { step: 3, title: "Payment", description: "How to pay" },
  { step: 4, title: "Review", description: "Confirm" },
];

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const authStatus = useAuthStore((s) => s.status);
  const setLoginOpen = useAuthStore((s) => s.setLoginOpen);
  const cart = useCartStore((s) => s.cart);
  const cartStatus = useCartStore((s) => s.status);
  const load = useCartStore((s) => s.load);

  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [delivery, setDelivery] = useState({
    pincode: "",
    address: "",
    landmark: "",
    cityName: "",
    cityId: null,
    pinStatus: "idle",
    pinMessage: "",
  });
  const [payment, setPayment] = useState("");
  const [platformPay, setPlatformPay] = useState({ cod: true, online: false, provider: null });
  const [placing, setPlacing] = useState(false);
  const idempotencyKeyRef = useRef(crypto.randomUUID());

  useEffect(() => {
    void load().catch(() => {});
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    getPaymentMethods()
      .then((data) => {
        if (!cancelled) {
          setPlatformPay({
            cod: data?.cod !== false,
            online: Boolean(data?.online),
            provider: data?.provider ?? null,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authStatus === "ready" && !user) {
      setLoginOpen(true);
    }
  }, [authStatus, user, setLoginOpen]);

  useEffect(() => {
    if (!user) return;
    setCustomer((prev) => ({
      name: prev.name || user.name || "",
      phone: prev.phone || user.phone || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  useEffect(() => {
    if (cart?.pincode && !delivery.pincode) {
      setDelivery((prev) => ({ ...prev, pincode: String(cart.pincode).replace(/\D/g, "").slice(0, 6) }));
    }
    // only seed once from cart
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.pincode]);

  const hasItems = Boolean(cart.items?.length);
  const cartReady = cartStatus === "ready" || cartStatus === "error";
  const items = cart.items ?? [];
  const allowCod =
    Boolean(platformPay.cod) && items.length > 0 && items.every((item) => item.paymentCod !== false);
  const allowOnline =
    Boolean(platformPay.online) && items.length > 0 && items.every((item) => item.paymentOnline);

  useEffect(() => {
    if (payment === "cod" && !allowCod) setPayment("");
    if (payment === "online" && !allowOnline) setPayment("");
    if (!payment && allowCod && !allowOnline) setPayment("cod");
    if (!payment && allowOnline && !allowCod) setPayment("online");
  }, [allowCod, allowOnline, payment]);

  useEffect(() => {
    if (!cartReady || cartStatus === "loading") return;
    if (!hasItems) {
      navigate("/decorations", { replace: true });
    }
  }, [cartReady, cartStatus, hasItems, navigate]);

  const customerOk =
    customer.name.trim().length > 1 && isValidIndianMobile(customer.phone) && isEmail(customer.email);
  const deliveryOk = delivery.pinStatus === "ok" && delivery.address.trim().length > 5;
  const paymentOk = payment === "online" || payment === "cod";

  const canNext = step === 1 ? customerOk : step === 2 ? deliveryOk : step === 3 ? paymentOk : false;

  function goTo(next) {
    if (next < 1 || next > 4) return;
    if (next > maxStep) return;
    setStep(next);
  }

  function onNext() {
    if (!canNext) return;
    const next = Math.min(4, step + 1);
    setMaxStep((prev) => Math.max(prev, next));
    setStep(next);
  }

  async function onPlace() {
    if (placing) return;
    if (!delivery.cityId) {
      toast.add({ title: "Enter a serviceable delivery PIN", type: "error" });
      return;
    }

    setPlacing(true);
    try {
      const payload = {
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.replace(/\D/g, "").slice(-10),
          email: customer.email.trim(),
        },
        delivery: {
          pincode: delivery.pincode.replace(/\D/g, "").slice(0, 6),
          address: delivery.address.trim(),
          landmark: delivery.landmark.trim() || undefined,
          cityId: delivery.cityId,
        },
        paymentMethod: payment,
        idempotencyKey: idempotencyKeyRef.current,
      };

      const result = await createOrder(payload);
      const order = result?.order ?? result;
      const checkout = result?.checkout;

      if (payment === "online" && checkout) {
        const verifyPayload =
          checkout.provider === "razorpay"
            ? await openRazorpayCheckout(
                {
                  ...checkout,
                  decoryOrderId: order.id,
                },
                payload.customer,
              )
            : await openCashfreeCheckout(checkout);

        const confirmed = await verifyPayment(verifyPayload);
        await load().catch(() => {});
        navigate(`/checkout/success/${confirmed?.id ?? order.id}`, { replace: true });
        return;
      }

      await load().catch(() => {});
      navigate(`/checkout/success/${order.id}`, { replace: true });
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" });
    } finally {
      setPlacing(false);
    }
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[1240px] px-4 py-8 md:px-8 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle>Sign in to checkout</CardTitle>
            <CardDescription>Use the login dialog to continue your booking.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" onClick={() => setLoginOpen(true)}>
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cartReady || (cartStatus === "loading" && !hasItems)) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-8 md:px-8 md:py-12">
      <p className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        {" / "}
        <span className="text-foreground">Checkout</span>
      </p>
      <h1 className="mb-6 font-heading text-3xl font-semibold tracking-tight">Checkout</h1>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_18rem] md:items-start xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <Stepper
            value={step}
            onValueChange={goTo}
            className="space-y-8"
            indicators={{
              completed: <CheckIcon className="size-3.5" />,
            }}
          >
            <StepperNav>
              {STEPS.map((item, index) => (
                <StepperItem
                  key={item.step}
                  step={item.step}
                  completed={step > item.step}
                  disabled={item.step > maxStep}
                >
                  <StepperTrigger>
                    <StepperIndicator>{item.step}</StepperIndicator>
                    <span className="flex min-w-0 flex-col text-left">
                      <StepperTitle className="text-xs sm:text-sm">{item.title}</StepperTitle>
                      <StepperDescription className="hidden sm:block">
                        {item.description}
                      </StepperDescription>
                    </span>
                  </StepperTrigger>
                  {index < STEPS.length - 1 ? <StepperSeparator /> : null}
                </StepperItem>
              ))}
            </StepperNav>

            <StepperPanel>
              <StepperContent value={1}>
                <Card>
                  <CardHeader>
                    <CardTitle>Customer details</CardTitle>
                    <CardDescription>We’ll use this to confirm your booking.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CheckoutCustomerStep value={customer} onChange={setCustomer} />
                  </CardContent>
                </Card>
              </StepperContent>
              <StepperContent value={2}>
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery</CardTitle>
                    <CardDescription>We check the PIN against cities we serve.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CheckoutDeliveryStep
                      value={delivery}
                      onChange={setDelivery}
                      cartCityId={cart.cityId}
                    />
                  </CardContent>
                </Card>
              </StepperContent>
              <StepperContent value={3}>
                <Card>
                  <CardHeader>
                    <CardTitle>Payment</CardTitle>
                    <CardDescription>Choose how you’ll pay. Nothing is charged yet.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CheckoutPaymentStep
                      value={payment}
                      onChange={setPayment}
                      allowCod={allowCod}
                      allowOnline={allowOnline}
                    />
                  </CardContent>
                </Card>
              </StepperContent>
              <StepperContent value={4}>
                <Card>
                  <CardHeader>
                    <CardTitle>Review</CardTitle>
                    <CardDescription>Check everything before you place the booking.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CheckoutReviewStep
                      customer={customer}
                      delivery={delivery}
                      payment={payment}
                      scheduledAt={cart.scheduledAt}
                      subtotalPaise={cart.subtotalPaise}
                      discountPaise={cart.discountPaise}
                      totalPaise={cart.totalPaise}
                      appliedCoupon={cart.appliedCoupon}
                      onPlace={onPlace}
                      placing={placing}
                    />
                  </CardContent>
                </Card>
              </StepperContent>
            </StepperPanel>
          </Stepper>

          {step < 4 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={() => goTo(step - 1)}>
                  Back
                </Button>
              ) : null}
              <Button type="button" disabled={!canNext} onClick={onNext}>
                Next
              </Button>
            </div>
          ) : (
            <div className="mt-6">
              <Button type="button" variant="outline" onClick={() => goTo(3)}>
                Back
              </Button>
            </div>
          )}
        </div>

        <div className="min-w-0 md:sticky md:top-24">
          <CheckoutSummary cart={cart} paymentMethod={payment} />
        </div>
      </div>
    </div>
  );
}
