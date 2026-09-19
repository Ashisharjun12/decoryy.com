import { useEffect, useState } from "react";
import { resolvePincode } from "@/api/geo.api";
import { pinResolveErrorMessage } from "@/lib/pin-delivery-message";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckoutAddressPicker } from "@/module/booking/components/CheckoutAddressPicker";

function ManualDeliveryFields({ value, onChange, cartCityId }) {
  function patch(partial) {
    onChange({ ...value, ...partial });
  }

  useEffect(() => {
    const code = (value.pincode ?? "").replace(/\D/g, "");
    if (code.length !== 6) {
      if (value.pinStatus !== "idle") {
        patch({
          pinStatus: "idle",
          pinMessage: "",
          cityName: "",
          cityId: null,
        });
      }
      return undefined;
    }

    let cancelled = false;
    patch({ pinStatus: "loading", pinMessage: "" });

    const timer = window.setTimeout(() => {
      void resolvePincode(code)
        .then((data) => {
          if (cancelled) return;
          const city = data?.city;
          if (cartCityId && city?.id && city.id !== cartCityId) {
            patch({
              pinStatus: "error",
              pinMessage: `This PIN is in ${city.name}. Your bag is priced for a different city. Change city or bag first.`,
              cityName: city.name ?? "",
              cityId: city.id,
            });
            return;
          }
          patch({
            pinStatus: "ok",
            pinMessage: city?.name ? `We deliver to ${city.name}` : "We deliver here",
            cityName: city?.name ?? "",
            cityId: city?.id ?? null,
          });
        })
        .catch((err) => {
          if (cancelled) return;
          patch({
            pinStatus: "error",
            pinMessage: pinResolveErrorMessage(err),
            cityName: "",
            cityId: null,
          });
        });
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.pincode, cartCityId]);

  return (
    <FieldGroup className="gap-4">
      <Field>
        <FieldLabel htmlFor="checkout-pincode">Pincode</FieldLabel>
        <Input
          id="checkout-pincode"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          placeholder="6-digit PIN"
          value={value.pincode}
          onChange={(event) =>
            patch({ pincode: event.target.value.replace(/\D/g, "").slice(0, 6) })
          }
        />
        {value.pinStatus === "loading" ? (
          <Skeleton className="mt-1 h-4 w-44 rounded-md" aria-label="Checking delivery" />
        ) : null}
        {value.pinStatus === "ok" ? (
          <FieldDescription className="text-emerald-700 dark:text-emerald-400">
            {value.pinMessage}
          </FieldDescription>
        ) : null}
        {value.pinStatus === "error" ? (
          <p className="text-sm text-destructive">{value.pinMessage}</p>
        ) : null}
      </Field>
      <Field>
        <FieldLabel htmlFor="checkout-address">Address</FieldLabel>
        <Textarea
          id="checkout-address"
          autoComplete="street-address"
          placeholder="House / flat, street, area"
          value={value.address}
          onChange={(event) => patch({ address: event.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="checkout-landmark">Landmark (optional)</FieldLabel>
        <Input
          id="checkout-landmark"
          placeholder="Near landmark"
          value={value.landmark}
          onChange={(event) => patch({ landmark: event.target.value })}
        />
      </Field>
    </FieldGroup>
  );
}

function clearDeliveryForManual(value) {
  return {
    ...value,
    address: "",
    landmark: "",
    cityName: "",
    cityId: null,
    pinStatus: "idle",
    pinMessage: "",
  };
}

export function CheckoutDeliveryStep({ value, onChange, cartCityId }) {
  const [useManual, setUseManual] = useState(false);

  function startManualEntry() {
    setUseManual(true);
    onChange(clearDeliveryForManual(value));
  }

  function returnToSavedAddresses() {
    setUseManual(false);
    onChange(clearDeliveryForManual(value));
  }

  return (
    <div className="flex flex-col gap-6">
      <CheckoutAddressPicker
        value={value}
        onChange={onChange}
        cartCityId={cartCityId}
        useManual={useManual}
        onUseManualChange={startManualEntry}
        onReturnToSaved={returnToSavedAddresses}
        onExitManual={() => setUseManual(false)}
      />
      {useManual ? (
        <ManualDeliveryFields value={value} onChange={onChange} cartCityId={cartCityId} />
      ) : null}
    </div>
  );
}
