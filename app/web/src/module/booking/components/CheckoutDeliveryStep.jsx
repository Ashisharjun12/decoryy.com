import { useEffect } from "react";
import { getApiError } from "@/api/api";
import { resolvePincode } from "@/api/geo.api";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

export function CheckoutDeliveryStep({ value, onChange, cartCityId }) {
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
            pinMessage: getApiError(err) || "We don’t deliver to this PIN yet",
            cityName: "",
            cityId: null,
          });
        });
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // pinStatus in deps would retrigger; only pincode + cart city should resolve
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
          <FieldDescription className="inline-flex items-center gap-2">
            <Spinner className="size-3.5" />
            Checking delivery…
          </FieldDescription>
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
