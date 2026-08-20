import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ImagesIcon, XIcon } from "lucide-react"
import {
  createAddon,
  deleteAddonCityPrice,
  getAdmin,
  patchAddon,
  setAddonCityPrice,
} from "@/api/addons.api"
import { listAdmin as listCities } from "@/api/cities.api"
import { getApiError } from "@/api/api"
import { toSellAndCompare } from "@/lib/money"
import { addonFormSchema } from "@/module/catalog/schema"
import { toGalleryItem } from "@/module/catalog/components/ProductMediaGallery"
import { ProductMediaPickerDialog } from "@/module/catalog/components/ProductMediaPickerDialog"
import {
  emptyPricePair,
  pairFromCityPrice,
  ProductCityPrices,
} from "@/module/catalog/components/ProductCityPrices"
import { toast } from "@/components/ui/toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"

const CATALOG_ADDONS = "/catalog?tab=addons"

export function AddonFormPage() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const form = useForm({
    resolver: zodResolver(addonFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      isActive: true,
    },
  })

  const [cities, setCities] = useState([])
  const [image, setImage] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [template, setTemplate] = useState(emptyPricePair())
  const [offers, setOffers] = useState({})
  const [savedPriceCityIds, setSavedPriceCityIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [addonName, setAddonName] = useState("")
  const nameValue = form.watch("name")
  const createReady = !isNew || (nameValue ?? "").trim().length >= 2

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const cityData = await listCities({ page: 1, limit: 100 })
        if (cancelled) return
        setCities(cityData.items ?? [])

        if (isNew) {
          setLoading(false)
          return
        }

        const addon = await getAdmin(id)
        if (cancelled) return
        setAddonName(addon.name)
        form.reset({
          name: addon.name ?? "",
          slug: addon.slug ?? "",
          description: addon.description ?? "",
          isActive: addon.isActive !== false,
        })
        if (addon.image) setImage(toGalleryItem(addon.image))
        if (addon.pricePaise) {
          setTemplate(pairFromCityPrice({ pricePaise: addon.pricePaise, compareAtPaise: addon.compareAtPaise }))
        } else {
          setTemplate(emptyPricePair())
        }
        const nextOffers = {}
        for (const price of addon.prices ?? []) {
          nextOffers[price.cityId] = pairFromCityPrice(price)
        }
        setOffers(nextOffers)
        setSavedPriceCityIds((addon.prices ?? []).map((price) => price.cityId))
      } catch (err) {
        if (!cancelled) setError(getApiError(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [form, id, isNew])

  function selectedOffers() {
    return Object.keys(offers).map((cityId) => {
      const city = cities.find((row) => row.id === cityId) || { id: cityId, name: cityId }
      return { city, pair: offers[cityId] }
    })
  }

  function defaultPricePayload() {
    if (!template.regular && !template.discounted) {
      return { pricePaise: null, compareAtPaise: null }
    }
    const result = toSellAndCompare(template.regular, template.discounted)
    if (result.error) return { error: result.error }
    return { pricePaise: result.pricePaise, compareAtPaise: result.compareAtPaise }
  }

  function validateOffers() {
    const defaults = defaultPricePayload()
    if (defaults.error) return defaults.error
    for (const { city, pair } of selectedOffers()) {
      const result = toSellAndCompare(pair.regular, pair.discounted)
      if (result.error) return `${city.name}: ${result.error}`
    }
    return ""
  }

  async function syncPrices(addonId) {
    const selected = selectedOffers()
    const selectedIds = new Set(selected.map(({ city }) => city.id))
    for (const { city, pair } of selected) {
      const result = toSellAndCompare(pair.regular, pair.discounted)
      await setAddonCityPrice(addonId, {
        cityId: city.id,
        pricePaise: result.pricePaise,
        compareAtPaise: result.compareAtPaise,
      })
    }
    for (const cityId of savedPriceCityIds) {
      if (!selectedIds.has(cityId)) {
        await deleteAddonCityPrice(addonId, cityId)
      }
    }
    setSavedPriceCityIds([...selectedIds])
  }

  async function persist(values) {
    const message = validateOffers()
    if (message) {
      setError(message)
      return
    }
    setSubmitting(true)
    setError("")
    const defaults = defaultPricePayload()
    const body = {
      name: values.name,
      description: values.description.trim() || null,
      imageUploadId: image?.uploadId || null,
      isActive: values.isActive,
      pricePaise: defaults.pricePaise,
      compareAtPaise: defaults.compareAtPaise,
      ...(values.slug ? { slug: values.slug } : {}),
    }
    try {
      let addonId = id
      if (!addonId) {
        const created = await createAddon(body)
        addonId = created.id
      } else {
        await patchAddon(addonId, body)
      }
      await syncPrices(addonId)
      toast.add({ title: isNew ? "Add-on created" : "Add-on saved", type: "success" })
      navigate(CATALOG_ADDONS)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link to="/catalog" />}>Catalog</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link to={CATALOG_ADDONS} />}>Add-ons</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{isNew ? "New" : addonName || "Edit"}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="font-heading text-2xl font-medium tracking-tight">
            {isNew ? "New add-on" : addonName || "Edit add-on"}
          </h1>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form className="flex flex-col gap-6" noValidate>
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="addon-name">Name</FieldLabel>
                      <Input {...field} id="addon-name" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
                <Controller
                  name="slug"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="addon-slug">Slug</FieldLabel>
                      <Input
                        {...field}
                        id="addon-slug"
                        placeholder="Generated from name if empty"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="addon-description">Description</FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          {...field}
                          id="addon-description"
                          rows={5}
                          aria-invalid={fieldState.invalid}
                        />
                      </InputGroup>
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button type="button" disabled={submitting} onClick={() => setPickerOpen(true)}>
                  <ImagesIcon />
                  Select media
                </Button>
              </div>
              {image ? (
                <div className="relative w-32 overflow-hidden rounded-full border bg-muted">
                  <img src={image.url} alt={image.filename || "Add-on"} className="aspect-square w-full object-cover" />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-xs"
                    className="absolute top-2 right-2"
                    onClick={() => setImage(null)}
                    aria-label="Remove image"
                    disabled={submitting}
                  >
                    <XIcon />
                  </Button>
                </div>
              ) : (
                <Empty className="border">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ImagesIcon />
                    </EmptyMedia>
                    <EmptyTitle>No media yet</EmptyTitle>
                    <EmptyDescription>Pick an image from the media library.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              <ProductMediaPickerDialog
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                attached={image ? [image] : []}
                max={1}
                kinds={["image"]}
                onAdd={(picked) => {
                  const row = picked[0] ? toGalleryItem(picked[0]) : null
                  setImage(row)
                }}
                disabled={submitting}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductCityPrices
                cities={cities}
                template={template}
                onTemplateChange={setTemplate}
                offers={offers}
                onOffersChange={setOffers}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name="isActive"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Visibility</FieldLabel>
                    <Select
                      value={field.value ? "active" : "inactive"}
                      onValueChange={(value) => field.onChange(value === "active")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>{field.value ? "Active" : "Inactive"}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(CATALOG_ADDONS)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submitting || !createReady}
              onClick={form.handleSubmit(persist)}
            >
              {submitting ? <Spinner /> : null}
              {isNew ? "Create add-on" : "Save"}
            </Button>
          </div>
      </form>
    </div>
  )
}
