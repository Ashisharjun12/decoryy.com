import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { sectionSchema } from "@/module/catalog/schema"
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
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SectionFormDialog({
  open,
  onOpenChange,
  section,
  onSubmit,
  submitting,
  error,
}) {
  const isEdit = Boolean(section)
  const form = useForm({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      name: "",
      slug: "",
      sortIndex: 0,
      isActive: true,
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      name: section?.name ?? "",
      slug: section?.slug ?? "",
      sortIndex: section?.sortIndex ?? 0,
      isActive: section?.isActive ?? true,
    })
  }, [open, section, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit section" : "Add section"}</DialogTitle>
          <DialogDescription>
            Section name and order. Products are picked after you save.
          </DialogDescription>
        </DialogHeader>
        <form
          id="section-form"
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
                  <FieldLabel htmlFor="section-name">Name</FieldLabel>
                  <Input {...field} id="section-name" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="section-slug">Slug</FieldLabel>
                  <Input
                    {...field}
                    id="section-slug"
                    placeholder="Generated from name if empty"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <Controller
              name="sortIndex"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="section-sort">Order</FieldLabel>
                  <Input
                    {...field}
                    id="section-sort"
                    type="number"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <Controller
              name="isActive"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="section-active">Active</FieldLabel>
                  <Switch
                    id="section-active"
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
          <Button type="submit" form="section-form" disabled={submitting}>
            {submitting ? <Spinner /> : null}
            {isEdit ? "Save" : "Add section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
