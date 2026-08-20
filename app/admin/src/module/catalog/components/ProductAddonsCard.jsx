import { useCallback, useEffect, useMemo, useState } from "react"
import { PackagePlusIcon, XIcon } from "lucide-react"
import { listAdmin as listAddons } from "@/api/addons.api"
import { mapProductAddon, unmapProductAddon } from "@/api/products.api"
import { getApiError } from "@/api/api"
import { toast } from "@/components/ui/toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { DecoryImageFallback } from "@/module/catalog/components/DecoryImageFallback"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Spinner } from "@/components/ui/spinner"

function addonImageSrc(addon) {
  const image = addon?.image
  return image?.thumbnailUrl || image?.url || image?.publicUrl || image?.optimizedUrl || ""
}

function AddonAvatar({ addon, className = "size-7" }) {
  const src = addonImageSrc(addon)
  return (
    <span className={`relative shrink-0 overflow-hidden rounded-full ${className}`}>
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <DecoryImageFallback className="rounded-full" />
      )}
    </span>
  )
}

export function ProductAddonsCard({ productId, mappedIds, onMappedIdsChange, disabled }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(Boolean(productId))
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState("")
  const [comboKey, setComboKey] = useState(0)

  const load = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    setError("")
    try {
      const data = await listAddons({ page: 1, limit: 100 })
      setItems(data.items ?? [])
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  const mapped = useMemo(() => new Set(mappedIds || []), [mappedIds])
  const mappedRows = useMemo(
    () => items.filter((row) => mapped.has(row.id)),
    [items, mapped],
  )
  const available = useMemo(
    () => items.filter((row) => !mapped.has(row.id)),
    [items, mapped],
  )

  async function add(addon) {
    if (!productId || disabled || !addon?.id) return
    setBusyId(addon.id)
    setError("")
    try {
      await mapProductAddon(productId, addon.id)
      onMappedIdsChange([...(mappedIds || []), addon.id].filter((id, index, all) => all.indexOf(id) === index))
      setComboKey((key) => key + 1)
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" })
    } finally {
      setBusyId("")
    }
  }

  async function remove(addon) {
    if (!productId || disabled) return
    setBusyId(addon.id)
    setError("")
    try {
      await unmapProductAddon(productId, addon.id)
      onMappedIdsChange((mappedIds || []).filter((id) => id !== addon.id))
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" })
    } finally {
      setBusyId("")
    }
  }

  if (!productId) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackagePlusIcon />
          </EmptyMedia>
          <EmptyTitle>Add product first</EmptyTitle>
          <EmptyDescription>Save the product, then map add-ons from the library.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          Loading add-ons…
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No add-ons in the library yet.</p>
      ) : (
        <>
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground">All library add-ons are mapped.</p>
          ) : (
            <Combobox
              key={comboKey}
              items={available}
              itemToStringLabel={(addon) => addon?.name ?? ""}
              itemToStringValue={(addon) => addon?.id ?? ""}
              isItemEqualToValue={(a, b) => a?.id === b?.id}
              onValueChange={(addon) => {
                if (addon) add(addon)
              }}
            >
              <ComboboxInput
                placeholder="Search and select an add-on"
                className="w-full"
                showClear
                disabled={disabled || Boolean(busyId)}
              />
              <ComboboxContent className="w-(--anchor-width)">
                <ComboboxEmpty>No matching add-on</ComboboxEmpty>
                <ComboboxList>
                  {(addon) => (
                    <ComboboxItem key={addon.id} value={addon}>
                      <AddonAvatar addon={addon} />
                      <span className="min-w-0 truncate">{addon.name}</span>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          )}

          {mappedRows.length ? (
            <div className="flex flex-col gap-2">
              {mappedRows.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center gap-3 rounded-2xl border px-3 py-2"
                >
                  <AddonAvatar addon={addon} className="size-8" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{addon.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{addon.slug}</span>
                  </span>
                  {addon.isActive ? null : (
                    <span className="text-xs text-muted-foreground">Inactive</span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={disabled || busyId === addon.id}
                    onClick={() => remove(addon)}
                    aria-label={`Remove ${addon.name}`}
                  >
                    {busyId === addon.id ? <Spinner /> : <XIcon />}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No add-ons mapped yet.</p>
          )}
        </>
      )}
    </div>
  )
}
