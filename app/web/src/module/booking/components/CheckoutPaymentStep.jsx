import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function CheckoutPaymentStep({ value, onChange, allowCod = true, allowOnline = false }) {
  if (!allowCod && !allowOnline) {
    return (
      <p className="text-sm text-muted-foreground">
        No payment method is available for items in this bag. Try another decoration or contact
        support.
      </p>
    );
  }

  return (
    <RadioGroup
      className="gap-3"
      value={value || undefined}
      onValueChange={onChange}
    >
      {allowOnline ? (
        <FieldLabel className="w-full has-[>[data-slot=field]]:rounded-lg">
          <Field orientation="horizontal" className="rounded-lg bg-card">
            <RadioGroupItem value="online" />
            <div className="min-w-0">
              <FieldTitle>Pay online</FieldTitle>
              <p className="text-sm text-muted-foreground">UPI, card, or net banking at the next step.</p>
            </div>
          </Field>
        </FieldLabel>
      ) : null}
      {allowCod ? (
        <FieldLabel className="w-full has-[>[data-slot=field]]:rounded-lg">
          <Field orientation="horizontal" className="rounded-lg bg-card">
            <RadioGroupItem value="cod" />
            <div className="min-w-0">
              <FieldTitle>Cash on delivery</FieldTitle>
              <p className="text-sm text-muted-foreground">Pay the decorator after setup. No charge yet.</p>
            </div>
          </Field>
        </FieldLabel>
      ) : null}
    </RadioGroup>
  );
}
