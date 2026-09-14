import { useCallback, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { ArrowLeftIcon, EyeIcon } from "lucide-react"
import { createProduct, deleteCityPrice, getAdmin, patchProduct, setCityPrice } from "@/api/products.api"
import { listAdmin as listCategories } from "@/api/categories.api"
import { listAdmin as listCities } from "@/api/cities.api"
import { getPaymentMethods } from "@/api/settings.api"
import { getApiError } from "@/api/api"
import { toSellAndCompare } from "@/lib/money"
import { productFormSchema } from "@/module/catalog/schema"
import { ProductMediaGallery, toGalleryItem } from "@/module/catalog/components/ProductMediaGallery"
import { ProductAddonsCard } from "@/module/catalog/components/ProductAddonsCard"
import { ProductAdditionalInfo } from "@/module/catalog/components/ProductAdditionalInfo"
import { ProductPdpPreview } from "@/module/catalog/components/ProductPdpPreview"
import { fromFaqRows, toFaqRows } from "@/module/catalog/components/FaqListEditor"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
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
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"

const CATALOG_PRODUCTS = "/catalog?tab=products"

export function ProductFormPage() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isPreview = searchParams.has("preview")
  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentCategoryId: "",
      categoryId: "",
      isActive: false,
      scheduledEnabled: true,
      instantEnabled: false,
      paymentCod: true,
      paymentOnline: false,
    },
  })
  const parentCategoryId = form.watch("parentCategoryId")
  const categoryId = form.watch("categoryId")
  const nameValue = form.watch("name")
  const descriptionValue = form.watch("description")
  const createReady =
    !isNew ||
    ((nameValue ?? "").trim().length >= 2 && Boolean(parentCategoryId) && Boolean(categoryId))

  const [parents, setParents] = useState([])
  const [children, setChildren] = useState([])
  const [cities, setCities] = useState([])
  const [gallery, setGallery] = useState([])
  const [includes, setIncludes] = useState([])
  const [deliverySetup, setDeliverySetup] = useState([])
  const [careInstructions, setCareInstructions] = useState([])
  const [faqs, setFaqs] = useState([])
  const [mappedAddonIds, setMappedAddonIds] = useState([])
  const [template, setTemplate] = useState(emptyPricePair())
  const [offers, setOffers] = useState({})
  const [savedPriceCityIds, setSavedPriceCityIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [productName, setProductName] = useState("")
  const [platformPay, setPlatformPay] = useState({ cod: true, online: false })

  const loadChildren = useCallback(async (parentId) => {
    if (!parentId) {
      setChildren([])
      return []
    }
    const data = await listCategories({ parentId, limit: 100, isActive: "true" })
    const items = data.items ?? []
    setChildren(items)
    return items
  }, [])

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [parentData, cityData, payData] = await Promise.all([
          listCategories({ parentId: null, limit: 100, isActive: "true" }),
          listCities({ page: 1, limit: 100 }),
          getPaymentMethods(),
        ])
        if (cancelled) return
        const parentItems = parentData.items ?? []
        setParents(parentItems)
        setCities(cityData.items ?? [])
        setPlatformPay({
          cod: payData?.cod !== false,
          online: Boolean(payData?.online),
        })

        if (isNew) {
          form.setValue("paymentCod", payData?.cod !== false)
          form.setValue("paymentOnline", Boolean(payData?.online))
          setLoading(false)
          return
        }

        const product = await getAdmin(id)
        if (cancelled) return
        let parentId = product.category?.parentId || ""
        let categoryId = product.categoryId ?? ""
        const parentActive = parentItems.some((row) => row.id === parentId)
        if (!parentActive) {
          parentId = ""
          categoryId = ""
        }
        let childItems = []
        if (parentId) childItems = await loadChildren(parentId)
        if (cancelled) return
        if (categoryId && !childItems.some((row) => row.id === categoryId)) {
          categoryId = ""
        }
        setProductName(product.name)
        form.reset({
          name: product.name ?? "",
          slug: product.slug ?? "",
          description: product.description ?? "",
          parentCategoryId: parentId,
          categoryId,
          isActive: Boolean(product.isActive),
          scheduledEnabled: product.scheduledEnabled !== false,
          instantEnabled: Boolean(product.instantEnabled),
          paymentCod: product.paymentCod !== false,
          paymentOnline: Boolean(product.paymentOnline),
        })
        setGallery((product.images ?? []).map(toGalleryItem))
        setIncludes(product.includes ?? [])
        setDeliverySetup(product.deliverySetup ?? [])
        setCareInstructions(product.careInstructions ?? [])
        setFaqs(toFaqRows(product.faqs))
        setMappedAddonIds(product.addonIds ?? [])
        if (product.pricePaise) {
          setTemplate(pairFromCityPrice({ pricePaise: product.pricePaise, compareAtPaise: product.compareAtPaise }))
        } else {
          setTemplate(emptyPricePair())
        }
        const nextOffers = {}
        for (const price of product.prices ?? []) {
          nextOffers[price.cityId] = pairFromCityPrice(price)
        }
        setOffers(nextOffers)
        setSavedPriceCityIds((product.prices ?? []).map((price) => price.cityId))
        if (!parentActive || (product.categoryId && !categoryId)) {
          setError("This product’s category is inactive. Choose an active category.")
        }
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
  }, [form, id, isNew, loadChildren])

  async function onParentChange(value) {
    form.setValue("parentCategoryId", value)
    form.setValue("categoryId", "")
    try {
      await loadChildren(value)
    } catch (err) {
      setError(getApiError(err))
    }
  }

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

  function validateOffers(publish) {
    const defaults = defaultPricePayload()
    if (defaults.error) return defaults.error
    if (publish && defaults.pricePaise == null) {
      return "Add a default price to publish"
    }
    for (const { city, pair } of selectedOffers()) {
      const result = toSellAndCompare(pair.regular, pair.discounted)
      if (result.error) return `${city.name}: ${result.error}`
    }
    if (publish && !gallery.some((item) => item.kind === "image")) {
      return "Add at least one image to publish"
    }
    return ""
  }

  async function syncPrices(productId) {
    const selected = selectedOffers()
    const selectedIds = new Set(selected.map(({ city }) => city.id))
    for (const { city, pair } of selected) {
      const result = toSellAndCompare(pair.regular, pair.discounted)
      await setCityPrice(productId, {
        cityId: city.id,
        pricePaise: result.pricePaise,
        compareAtPaise: result.compareAtPaise,
      })
    }
    for (const cityId of savedPriceCityIds) {
      if (!selectedIds.has(cityId)) {
        await deleteCityPrice(productId, cityId)
      }
    }
    setSavedPriceCityIds([...selectedIds])
  }

  async function persist(values) {
    const publish = Boolean(values.isActive)
    const message = validateOffers(publish)
    if (message) {
      setError(message)
      return
    }
    setSubmitting(true)
    setError("")
    const defaults = defaultPricePayload()
    const details = {
      name: values.name,
      description: values.description.trim() || null,
      categoryId: values.categoryId,
      imageUploadIds: gallery.map((item) => item.uploadId),
      includes,
      deliverySetup,
      careInstructions,
      faqs: fromFaqRows(faqs),
      scheduledEnabled: values.scheduledEnabled,
      instantEnabled: values.instantEnabled,
      paymentCod: values.paymentCod,
      paymentOnline: values.paymentOnline,
      pricePaise: defaults.pricePaise,
      compareAtPaise: defaults.compareAtPaise,
      ...(values.slug ? { slug: values.slug } : {}),
    }
    let productId = id
    let createdNew = false
    try {
      if (!productId) {
        const created = await createProduct({ ...details, isActive: false })
        productId = created.id
        createdNew = true
      } else {
        if (!publish) {
          await patchProduct(productId, { isActive: false })
        }
        await patchProduct(productId, details)
      }
      await syncPrices(productId)
      if (publish) {
        await patchProduct(productId, { isActive: true })
      }
      toast.add({ title: publish ? "Product published" : "Draft saved", type: "success" })
      navigate(CATALOG_PRODUCTS)
    } catch (err) {
      const messageText = getApiError(err)
      if (createdNew && productId) {
        navigate(`/catalog/products/${productId}`, { state: { error: messageText } })
        return
      }
      setError(messageText)
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

  if (isPreview) {
    const fromCatalog = Boolean(location.state?.fromCatalog)
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-x-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              fromCatalog
                ? navigate(CATALOG_PRODUCTS)
                : navigate({ pathname: location.pathname, search: "" })
            }
          >
            <ArrowLeftIcon />
            {fromCatalog ? "Back to products" : "Back to edit"}
          </Button>
          <Badge>Preview only</Badge>
        </div>
        <ProductPdpPreview
          name={nameValue}
          description={descriptionValue}
          gallery={gallery}
          template={template}
          includes={includes}
          deliverySetup={deliverySetup}
          careInstructions={careInstructions}
          faqs={faqs}
          cityName={cities[0]?.name}
          mappedAddonIds={mappedAddonIds}
        />
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
                <BreadcrumbLink render={<Link to={CATALOG_PRODUCTS} />}>Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{isNew ? "New" : productName || "Edit"}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="font-heading text-2xl font-medium tracking-tight">
            {isNew ? "New product" : productName || "Edit product"}
          </h1>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate({ pathname: location.pathname, search: "?preview" })}
        >
          <EyeIcon />
          Preview
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form className="flex flex-col gap-6" noValidate>
          <Card>
            <CardHeader>
              <CardTitle>Product details</CardTitle>
              <CardDescription>Name and copy shown on the booking menu.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-name">Name</FieldLabel>
                      <Input {...field} id="product-name" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
                <Controller
                  name="slug"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-slug">Slug</FieldLabel>
                      <Input
                        {...field}
                        id="product-slug"
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
                      <FieldLabel htmlFor="product-description">Description</FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          {...field}
                          id="product-description"
                          rows={8}
                          placeholder="Set a description for better visibility."
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
              <CardTitle>Classification</CardTitle>
              <CardDescription>Select a category, then the subcategory products attach to.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  name="parentCategoryId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Category</FieldLabel>
                      <Select value={field.value || undefined} onValueChange={onParentChange}>
                        <SelectTrigger className="w-full" aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select category">
                            {parents.find((row) => row.id === field.value)?.name || "Select category"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {parents.map((row) => (
                            <SelectItem key={row.id} value={row.id}>
                              {row.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
                <Controller
                  name="categoryId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Subcategory</FieldLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        disabled={!parentCategoryId}
                      >
                        <SelectTrigger className="w-full" aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select subcategory">
                            {children.find((row) => row.id === field.value)?.name || "Select subcategory"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {children.map((row) => (
                            <SelectItem key={row.id} value={row.id}>
                              {row.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
              </FieldGroup>
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
              <CardTitle>Product media</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductMediaGallery items={gallery} onChange={setGallery} disabled={submitting} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add-ons</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductAddonsCard
                productId={isNew ? "" : id}
                mappedIds={mappedAddonIds}
                onMappedIdsChange={setMappedAddonIds}
                disabled={submitting}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional info</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductAdditionalInfo
                includes={includes}
                onIncludesChange={setIncludes}
                deliverySetup={deliverySetup}
                onDeliverySetupChange={setDeliverySetup}
                careInstructions={careInstructions}
                onCareInstructionsChange={setCareInstructions}
                faqs={faqs}
                onFaqsChange={setFaqs}
                disabled={submitting}
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
                      value={field.value ? "published" : "draft"}
                      onValueChange={(value) => field.onChange(value === "published")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {field.value ? "Published" : "Draft"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fulfillment</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Controller
                name="scheduledEnabled"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                    <div className="flex min-w-0 flex-col gap-1">
                      <FieldLabel htmlFor="scheduled-enabled">Scheduled</FieldLabel>
                      <FieldDescription>Customer picks a slot.</FieldDescription>
                    </div>
                    <Switch
                      id="scheduled-enabled"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Field>
                )}
              />
              <Controller
                name="instantEnabled"
                control={form.control}
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <div className="flex min-w-0 flex-col gap-1">
                      <FieldLabel htmlFor="instant-enabled">Instant</FieldLabel>
                      <FieldDescription>Stored for later. Booking does not dispatch Instant yet.</FieldDescription>
                    </div>
                    <Switch
                      id="instant-enabled"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Field>
                )}
              />
              {form.formState.errors.scheduledEnabled ? (
                <FieldError errors={[form.formState.errors.scheduledEnabled]} />
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardDescription>
                Only methods enabled in Settings → Payments appear here.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {platformPay.cod ? (
                <Controller
                  name="paymentCod"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                      <div className="flex min-w-0 flex-col gap-1">
                        <FieldLabel htmlFor="payment-cod">Cash on delivery</FieldLabel>
                        <FieldDescription>Customer pays after setup.</FieldDescription>
                      </div>
                      <Switch
                        id="payment-cod"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  )}
                />
              ) : null}
              {platformPay.online ? (
                <Controller
                  name="paymentOnline"
                  control={form.control}
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <div className="flex min-w-0 flex-col gap-1">
                        <FieldLabel htmlFor="payment-online">Pay online</FieldLabel>
                        <FieldDescription>
                          Razorpay or Cashfree when those platforms are on. Capture comes later.
                        </FieldDescription>
                      </div>
                      <Switch
                        id="payment-online"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  )}
                />
              ) : null}
              {!platformPay.cod && !platformPay.online ? (
                <p className="text-sm text-muted-foreground">
                  Enable a payment platform in Settings first.
                </p>
              ) : null}
              {form.formState.errors.paymentCod ? (
                <FieldError errors={[form.formState.errors.paymentCod]} />
              ) : null}
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(CATALOG_PRODUCTS)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submitting || !createReady}
              onClick={form.handleSubmit(persist)}
            >
              {submitting ? <Spinner /> : null}
              {isNew ? "Create product" : "Save"}
            </Button>
          </div>
      </form>
    </div>
  )
}
