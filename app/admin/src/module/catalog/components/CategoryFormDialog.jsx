import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { categorySchema } from "@/module/catalog/schema"
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

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  kind = "category",
  parentName,
  onSubmit,
  submitting,
  error,
}) {
  const isEdit = Boolean(category)
  const isSub = kind === "subcategory"
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      isActive: true,
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      isActive: category?.isActive ?? true,
    })
  }, [open, category, form])

  const title = isEdit
    ? isSub
      ? "Edit subcategory"
      : "Edit category"
    : isSub
      ? "Add subcategory"
      : "Add category"

  const description = isEdit
    ? "Inactive rows are hidden from the public catalog tree."
    : isSub
      ? `Nested under ${parentName || "the selected category"}.`
      : "Top-level group for the customer catalog."

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          id="category-form"
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
                  <FieldLabel htmlFor="category-name">Name</FieldLabel>
                  <Input {...field} id="category-name" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category-slug">Slug</FieldLabel>
                  <Input
                    {...field}
                    id="category-slug"
                    placeholder="Generated from name if empty"
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
                  <FieldLabel htmlFor="category-active">Active</FieldLabel>
                  <Switch
                    id="category-active"
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
          <Button type="submit" form="category-form" disabled={submitting}>
            {submitting ? <Spinner /> : null}
            {isEdit ? "Save" : isSub ? "Add subcategory" : "Add category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
