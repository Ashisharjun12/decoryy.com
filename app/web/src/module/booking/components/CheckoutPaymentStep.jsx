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
        <FieldLabel>
          <Field orientation="horizontal" className="rounded-3xl border border-border bg-card p-4">
            <RadioGroupItem value="online" />
            <div className="min-w-0">
              <FieldTitle>Pay online</FieldTitle>
              <p className="text-sm text-muted-foreground">UPI, card, or net banking at the next step.</p>
            </div>
          </Field>
        </FieldLabel>
      ) : null}
      {allowCod ? (
        <FieldLabel>
          <Field orientation="horizontal" className="rounded-3xl border border-border bg-card p-4">
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
