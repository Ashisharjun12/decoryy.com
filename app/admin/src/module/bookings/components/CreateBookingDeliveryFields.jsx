import { useEffect, useState } from "react"
import { Controller } from "react-hook-form"
import { resolvePincode } from "@/api/geo.api"
import { getApiError } from "@/api/api"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

export function CreateBookingDeliveryFields({ form, packageCityName, onCityResolved }) {
  const [resolving, setResolving] = useState(false)
  const [resolveError, setResolveError] = useState("")
  const [pincodeCityLabel, setPincodeCityLabel] = useState("")
  const [mismatchError, setMismatchError] = useState("")

  const pincode = form.watch("delivery.pincode")
  const packageCityId = form.watch("delivery.cityId")

  useEffect(() => {
    const code = String(pincode ?? "").replace(/\D/g, "")
    if (code.length !== 6) {
      setPincodeCityLabel("")
      setResolveError("")
      setMismatchError("")
      onCityResolved?.(null)
      return
    }

    let cancelled = false
    setResolving(true)
    setResolveError("")
    setMismatchError("")

    resolvePincode(code)
      .then((data) => {
        if (cancelled) return
        if (!data?.city?.id || !data?.pincode?.isServiceable) {
          setPincodeCityLabel("")
          onCityResolved?.(null)
          setResolveError("This pincode is not serviceable")
          return
        }

        const pincodeCity = data.city
        const pincodeLabel = `${pincodeCity.name}, ${pincodeCity.state}`
        setPincodeCityLabel(pincodeLabel)
        onCityResolved?.(pincodeCity)

        if (packageCityId && packageCityId !== pincodeCity.id) {
          const packageLabel = packageCityName || "the selected package city"
          setMismatchError(
            `Pincode is in ${pincodeCity.name}, but package is priced for ${packageLabel}.`,
          )
          return
        }

        if (!packageCityId) {
          form.setValue("delivery.cityId", pincodeCity.id, { shouldValidate: true })
        }
      })
      .catch((err) => {
        if (cancelled) return
        setPincodeCityLabel("")
        onCityResolved?.(null)
        setResolveError(getApiError(err))
      })
      .finally(() => {
        if (!cancelled) setResolving(false)
      })

    return () => {
      cancelled = true
    }
  }, [pincode, packageCityId, packageCityName, form, onCityResolved])

  const cityDescription = mismatchError
    ? null
    : pincodeCityLabel
      ? pincodeCityLabel
      : packageCityId && packageCityName
        ? `Package city: ${packageCityName}`
        : null

  return (
    <FieldGroup>
      <Controller
        name="delivery.pincode"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Pincode</FieldLabel>
            <Input {...field} inputMode="numeric" placeholder="6-digit pincode" maxLength={6} />
            {resolving ? (
              <FieldDescription className="flex items-center gap-2">
                <Spinner className="size-3" />
                Checking service area…
              </FieldDescription>
            ) : cityDescription ? (
              <FieldDescription>{cityDescription}</FieldDescription>
            ) : null}
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      {resolveError ? (
        <Alert variant="destructive">
          <AlertDescription>{resolveError}</AlertDescription>
        </Alert>
      ) : null}
      {mismatchError ? (
        <Alert variant="destructive">
          <AlertDescription>{mismatchError}</AlertDescription>
        </Alert>
      ) : null}
      <Controller
        name="delivery.address"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Address</FieldLabel>
            <Input {...field} placeholder="House, street, area" />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        name="delivery.landmark"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Landmark (optional)</FieldLabel>
            <Input {...field} placeholder="Near metro, society gate, etc." />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </FieldGroup>
  )
}
