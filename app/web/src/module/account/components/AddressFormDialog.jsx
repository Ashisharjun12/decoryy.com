import { useEffect, useState } from "react";
import { resolvePincode } from "@/api/geo.api";
import { NOT_DELIVERABLE_MESSAGE, pinResolveErrorMessage } from "@/lib/pin-delivery-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";

export const emptyAddressForm = {
  label: "",
  address: "",
  landmark: "",
  pincode: "",
  cityName: "",
  cityId: null,
  isDefault: false,
};

export function AddressFormDialog({
  open,
  onOpenChange,
  title = "Add address",
  description = "We use this for delivery on your bookings.",
  submitLabel = "Save address",
  initial = emptyAddressForm,
  submitting = false,
  onSubmit,
}) {
  const [form, setForm] = useState(initial);
  const [pinStatus, setPinStatus] = useState("idle");
  const [pinMessage, setPinMessage] = useState("");

  useEffect(() => {
    if (open) {
      setForm(initial);
      setPinStatus(initial.cityId ? "ok" : "idle");
      setPinMessage(initial.cityName ? `We deliver to ${initial.cityName}` : "");
    }
  }, [open, initial]);

  useEffect(() => {
    const code = (form.pincode ?? "").replace(/\D/g, "");
    if (code.length !== 6) {
      setPinStatus("idle");
      setPinMessage("");
      return undefined;
    }

    let cancelled = false;
    setPinStatus("loading");
    const timer = window.setTimeout(() => {
      void resolvePincode(code)
        .then((data) => {
          if (cancelled) return;
          const city = data?.city;
          setForm((f) => ({
            ...f,
            cityId: city?.id ?? null,
            cityName: city?.name ?? f.cityName,
          }));
          setPinStatus("ok");
          setPinMessage(city?.name ? `We deliver to ${city.name}` : "We deliver here");
        })
        .catch((err) => {
          if (cancelled) return;
          setPinStatus("error");
          setPinMessage(pinResolveErrorMessage(err));
          setForm((f) => ({ ...f, cityId: null }));
        });
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [form.pincode]);

  function handleSubmit(event) {
    event.preventDefault();
    if (form.address.trim().length < 6) {
      toast.add({ title: "Enter a full delivery address", type: "error" });
      return;
    }
    if (form.pincode.replace(/\D/g, "").length !== 6) {
      toast.add({ title: "Enter a valid 6-digit PIN", type: "error" });
      return;
    }
    if (pinStatus === "error" || pinStatus !== "ok" || !form.cityId) {
      toast.add({ title: pinMessage || NOT_DELIVERABLE_MESSAGE, type: "error" });
      return;
    }
    onSubmit?.({
      label: form.label.trim() || "Address",
      address: form.address.trim(),
      landmark: form.landmark.trim() || undefined,
      pincode: form.pincode.replace(/\D/g, "").slice(0, 6),
      cityId: form.cityId,
      cityName: form.cityName,
      setDefault: form.isDefault,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field>
            <FieldLabel htmlFor="addr-label">Label</FieldLabel>
            <Input
              id="addr-label"
              placeholder="Home, Office, Venue…"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="addr-pin">PIN code</FieldLabel>
            <Input
              id="addr-pin"
              inputMode="numeric"
              placeholder="560001"
              maxLength={6}
              aria-invalid={pinStatus === "error"}
              value={form.pincode}
              onChange={(e) =>
                setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))
              }
            />
            {pinStatus === "loading" ? (
              <Skeleton className="mt-1 h-4 w-44 rounded-md" aria-label="Checking delivery" />
            ) : null}
            {pinStatus === "ok" ? (
              <FieldDescription className="text-emerald-700 dark:text-emerald-400">
                {pinMessage}
              </FieldDescription>
            ) : null}
            {pinStatus === "error" ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {pinMessage}
              </p>
            ) : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="addr-line">Address</FieldLabel>
            <Input
              id="addr-line"
              placeholder="Flat, street, area"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="addr-landmark">Landmark (optional)</FieldLabel>
            <Input
              id="addr-landmark"
              value={form.landmark}
              onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="size-4 rounded border-border"
            />
            Set as default address
          </label>
          <Button
            type="submit"
            className="w-full"
            disabled={
              submitting ||
              pinStatus === "loading" ||
              pinStatus === "error" ||
              pinStatus !== "ok" ||
              !form.cityId
            }
          >
            {submitting ? <Spinner className="size-4" /> : submitLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
