import { useCallback, useEffect, useState } from "react"
import { PlusIcon, PackageIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { deleteProduct, listAdmin as listProducts, patchProduct } from "@/api/products.api"
import { listAdmin as listCategories } from "@/api/categories.api"
import { getApiError } from "@/api/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { ProductsTable } from "@/module/catalog/components/ProductsTable"
import { ListPagination } from "@/module/geo/components/ListPagination"

const LIMIT = 20

export function ProductsPanel() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [q, setQ] = useState("")
  const [isActive, setIsActive] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [leaves, setLeaves] = useState([])
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleting, setDeleting] = useState(null)

  const filtered = Boolean(q.trim()) || isActive !== "" || categoryId !== ""

  const loadLeaves = useCallback(async () => {
    const parents = await listCategories({ parentId: null, limit: 100 })
    const nested = await Promise.all(
      (parents.items ?? []).map(async (parent) => {
        const kids = await listCategories({ parentId: parent.id, limit: 100 })
        return (kids.items ?? []).map((child) => ({
          ...child,
          label: `${parent.name} / ${child.name}`,
        }))
      }),
    )
    setLeaves(nested.flat())
  }, [])

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    setError("")
    try {
      const data = await listProducts({
        page,
        limit: LIMIT,
        q: q.trim() || undefined,
        isActive: isActive || undefined,
        categoryId: categoryId || undefined,
      })
      setItems(data.items ?? [])
      setTotal(data.total ?? 0)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      if (!silent) setLoading(false)
    }
  }, [page, q, isActive, categoryId])

  useEffect(() => {
    loadLeaves().catch((err) => setError(getApiError(err)))
  }, [loadLeaves])

  useEffect(() => {
    load()
  }, [load])

  async function onTogglePublished(product, nextActive) {
    const previous = items
    setItems((rows) =>
      rows.map((row) => (row.id === product.id ? { ...row, isActive: nextActive } : row)),
    )
    try {
      await patchProduct(product.id, { isActive: nextActive })
      toast.add({
        title: nextActive ? "Product published" : "Product moved to draft",
        type: "success",
      })
      await load({ silent: true })
    } catch (err) {
      setItems(previous)
      toast.add({ title: getApiError(err), type: "error" })
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteProduct(deleting.id)
      toast.add({ title: "Product deleted", type: "success" })
      setDeleting(null)
      if (items.length === 1 && page > 1) {
        setPage(page - 1)
        return
      }
      await load({ silent: true })
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" })
    }
  }

  const empty = !loading && items.length === 0

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            className="w-56"
            value={q}
            onChange={(event) => {
              setPage(1)
              setQ(event.target.value)
            }}
            placeholder="Search by name"
            aria-label="Search products"
          />
          <Select
            value={isActive || "all"}
            onValueChange={(value) => {
              setPage(1)
              setIsActive(value === "all" ? "" : value)
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All">
                {isActive === "true" ? "Published" : isActive === "false" ? "Draft" : "All"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Published</SelectItem>
              <SelectItem value="false">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={categoryId || "all"}
            onValueChange={(value) => {
              setPage(1)
              setCategoryId(value === "all" ? "" : value)
            }}
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
        </div>
        <Button type="button" onClick={() => navigate("/catalog/products/new")}>
          <PlusIcon />
          Add product
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {empty ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageIcon />
            </EmptyMedia>
            <EmptyTitle>{filtered ? "No products match" : "No products yet"}</EmptyTitle>
            <EmptyDescription>
              {filtered
                ? "Try a different name, status, or category."
                : "Create a decoration with media, a subcategory, and city prices."}
            </EmptyDescription>
          </EmptyHeader>
          {filtered ? null : (
            <EmptyContent>
              <Button type="button" onClick={() => navigate("/catalog/products/new")}>
                Add product
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          <ProductsTable
            items={items}
            loading={loading}
            onTogglePublished={onTogglePublished}
            onDelete={setDeleting}
          />
          <ListPagination page={page} limit={LIMIT} total={total} onPageChange={setPage} />
        </div>
      )}

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `${deleting.name} will be removed, including its images, city prices, and add-on mappings. Media files stay in the library.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
