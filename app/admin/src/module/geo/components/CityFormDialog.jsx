import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { citySchema, INDIA_STATES, INDIA_UNION_TERRITORIES } from "@/module/geo/schema"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CityFormDialog({ open, onOpenChange, city, onSubmit, submitting, error }) {
  const isEdit = Boolean(city)
  const form = useForm({
    resolver: zodResolver(citySchema),
    defaultValues: {
      name: "",
      state: "",
      slug: "",
      isActive: true,
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      name: city?.name ?? "",
      state: city?.state ?? "",
      slug: city?.slug ?? "",
      isActive: city?.isActive ?? true,
    })
  }, [open, city, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit city" : "Add city"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this city. Inactive cities are hidden from public lists." : "Add a city to the allowlist."}
          </DialogDescription>
        </DialogHeader>
        <form
          id="city-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4"
          noValidate
        >
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="city-name">Name</FieldLabel>
                  <Input {...field} id="city-name" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <Controller
              name="state"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>State</FieldLabel>
                  <Select value={field.value || null} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>States</SelectLabel>
                        {INDIA_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Union territories</SelectLabel>
                        {INDIA_UNION_TERRITORIES.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="city-slug">Slug</FieldLabel>
                  <Input {...field} id="city-slug" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <Controller
              name="isActive"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="city-active">Active</FieldLabel>
                  <Switch
                    id="city-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="city-form" disabled={submitting}>
            {submitting ? <Spinner /> : null}
            {isEdit ? "Save" : "Add city"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
