import { useEffect, useMemo, useState } from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon, LayoutListIcon, Trash2Icon } from "lucide-react"
import { listAdmin as listProducts } from "@/api/products.api"
import { listAdmin as listCategories } from "@/api/categories.api"
import { putSectionProducts, deleteSectionCityOverride } from "@/api/sections.api"
import { getApiError } from "@/api/api"
import { toast } from "@/components/ui/toast"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { DecoryImageFallback } from "@/module/catalog/components/DecoryImageFallback"
import { cn } from "@/lib/utils"

const MAX = 24
const SEARCH_LIMIT = 10
const MIN_QUERY = 2
const DEBOUNCE_MS = 300

function coverSrc(product) {
  const cover = (product?.images ?? []).find((item) => item.kind === "image") ?? product?.images?.[0]
  return cover?.thumbnailUrl || cover?.url || cover?.publicUrl || cover?.optimizedUrl || ""
}

function SortableProductRow({ item, disabled, busy, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.productId,
    disabled,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  const src = coverSrc(item.product)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card px-3 py-2",
        isDragging && "opacity-70",
      )}
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground disabled:opacity-40"
        disabled={disabled}
        aria-label={`Reorder ${item.product?.name ?? "product"}`}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
        {src ? (
          <img src={src} alt="" className="size-full object-cover" />
        ) : (
          <DecoryImageFallback />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.product?.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {item.product?.slug}
          {item.product?.isActive === false ? " · Hidden" : ""}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled || busy}
        aria-label={`Remove ${item.product?.name ?? "product"}`}
        onClick={() => onRemove(item.productId)}
      >
        {busy ? <Spinner /> : <Trash2Icon />}
      </Button>
    </div>
  )
}

export function SectionProductsEditor({ sectionId, cityId, membership, onMembershipChange }) {
  const [query, setQuery] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [leaves, setLeaves] = useState([])
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [comboKey, setComboKey] = useState(0)
  const [busy, setBusy] = useState(false)
  const source = membership?.source ?? "global"
  const items = membership?.items ?? []
  const inheriting = Boolean(cityId) && source === "global"
  const editable = !inheriting
  const ids = items.map((row) => row.productId)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    let cancelled = false
    listCategories({ parentId: null, limit: 100 })
      .then(async (parents) => {
        const nested = await Promise.all(
          (parents.items ?? []).map(async (parent) => {
            const kids = await listCategories({ parentId: parent.id, limit: 100 })
            return (kids.items ?? []).map((child) => ({
              ...child,
              label: `${parent.name} / ${child.name}`,
            }))
          }),
        )
        if (!cancelled) setLeaves(nested.flat())
      })
      .catch((err) => {
        if (!cancelled) toast.add({ title: getApiError(err), type: "error" })
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!editable) return
    const q = query.trim()
    if (q.length === 1) return
    const searchingByName = q.length >= MIN_QUERY
    let cancelled = false
    setSearching(true)
    const handle = setTimeout(async () => {
      try {
        const data = await listProducts({
          page: 1,
          limit: SEARCH_LIMIT,
          ...(searchingByName ? { q } : {}),
          ...(categoryId ? { categoryId } : {}),
        })
        if (!cancelled) setResults(data.items ?? [])
      } catch (err) {
        if (!cancelled) {
          setResults([])
          toast.add({ title: getApiError(err), type: "error" })
        }
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, searchingByName ? DEBOUNCE_MS : 0)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [query, categoryId, editable])

  const selected = useMemo(() => new Set(ids), [ids])
  const available = useMemo(
    () => results.filter((product) => !selected.has(product.id)),
    [results, selected],
  )
  const emptyMessage = searching ? "Searching…" : "No matching product"

  async function persist(productIds) {
    setBusy(true)
    try {
      const data = await putSectionProducts(sectionId, {
        cityId: cityId || null,
        productIds,
      })
      onMembershipChange(data)
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" })
    } finally {
      setBusy(false)
    }
  }

  async function add(product) {
    if (!editable || !product?.id || ids.includes(product.id)) return
    if (ids.length >= MAX) {
      toast.add({ title: `A section can have at most ${MAX} products`, type: "error" })
      return
    }
    setComboKey((key) => key + 1)
    setQuery("")
    setResults([])
    await persist([...ids, product.id])
  }

  async function remove(productId) {
    if (!editable) return
    await persist(ids.filter((id) => id !== productId))
  }

  async function onDragEnd(event) {
    const { active, over } = event
    if (!editable || busy || !over || active.id === over.id) return
    const from = ids.indexOf(active.id)
    const to = ids.indexOf(over.id)
    if (from < 0 || to < 0) return
    await persist(arrayMove(ids, from, to))
  }

  async function customize() {
    setBusy(true)
    try {
      const data = await putSectionProducts(sectionId, {
        cityId,
        productIds: ids,
      })
      onMembershipChange(data)
      toast.add({ title: "City list created", type: "success" })
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" })
    } finally {
      setBusy(false)
    }
  }

  async function revert() {
    if (!cityId) return
    setBusy(true)
    try {
      const data = await deleteSectionCityOverride(sectionId, cityId)
      onMembershipChange(data)
      toast.add({ title: "Using global list", type: "success" })
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {inheriting ? (
        <Alert>
          <AlertTitle>Using global list</AlertTitle>
          <AlertDescription>
            This city inherits the global section. Customize to replace it, including an empty list to hide the section here.
          </AlertDescription>
          <AlertAction>
            <Button type="button" size="sm" onClick={customize} disabled={busy}>
              {busy ? <Spinner /> : null}
              Customize for this city
            </Button>
          </AlertAction>
        </Alert>
      ) : cityId ? (
        <Alert>
          <AlertTitle>City list</AlertTitle>
          <AlertDescription>
            This replaces the global section for the selected city. An empty list hides the section there.
          </AlertDescription>
          <AlertAction>
            <Button type="button" size="sm" variant="outline" onClick={revert} disabled={busy}>
              Revert to global
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      {editable ? (
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={categoryId || "all"}
            onValueChange={(value) => setCategoryId(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="All categories">
                {leaves.find((row) => row.id === categoryId)?.label || "All categories"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {leaves.map((row) => (
                <SelectItem key={row.id} value={row.id}>
                  {row.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="min-w-56 flex-1">
            <Combobox
              key={comboKey}
              items={available}
              filter={null}
              itemToStringLabel={(product) => product?.name ?? ""}
              itemToStringValue={(product) => product?.id ?? ""}
              isItemEqualToValue={(a, b) => a?.id === b?.id}
              onInputValueChange={(value) => setQuery(value)}
              onValueChange={(product) => {
                if (product) add(product)
              }}
            >
              <ComboboxInput
                placeholder={ids.length >= MAX ? `Maximum ${MAX} products` : "Search or pick a product"}
                className="w-full"
                showClear
                disabled={busy || ids.length >= MAX}
              />
              <ComboboxContent className="w-(--anchor-width)">
                <ComboboxEmpty>
                  {searching && query.trim().length >= MIN_QUERY ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner />
                      Searching…
                    </span>
                  ) : (
                    emptyMessage
                  )}
                </ComboboxEmpty>
                <ComboboxList>
                  {(product) => (
                    <ComboboxItem key={product.id} value={product}>
                      <span className="relative size-7 shrink-0 overflow-hidden rounded-md">
                        {coverSrc(product) ? (
                          <img src={coverSrc(product)} alt="" className="size-full object-cover" />
                        ) : (
                          <DecoryImageFallback />
                        )}
                      </span>
                      <span className="min-w-0 truncate">{product.name}</span>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>
      ) : null}

      {items.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayoutListIcon />
            </EmptyMedia>
            <EmptyTitle>{inheriting ? "Global list is empty" : "No products in this section"}</EmptyTitle>
            <EmptyDescription>
              {inheriting
                ? "Add products on Global, or customize this city."
                : cityId
                  ? "This city section is empty, so it will be hidden on the public home."
                  : "Search and add products, then drag to set order."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <SortableProductRow
                  key={item.productId}
                  item={item}
                  disabled={!editable || busy}
                  busy={busy}
                  onRemove={remove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
