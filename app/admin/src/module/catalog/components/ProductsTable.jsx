import { useState } from "react"
import { format } from "date-fns"
import { EyeIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DecoryImageFallback } from "@/module/catalog/components/DecoryImageFallback"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

function galleryImages(product) {
  return (product.images ?? []).filter((item) => item.kind === "image")
}

function coverImage(product) {
  return galleryImages(product)[0] ?? null
}

function imageSrc(item) {
  return item?.thumbnailUrl || item?.url || item?.publicUrl || item?.optimizedUrl || ""
}

export function ProductsTable({ items, loading, onTogglePublished, onDelete }) {
  const navigate = useNavigate()
  const [preview, setPreview] = useState(null)
  const [previewIndex, setPreviewIndex] = useState(0)

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  const previewImages = preview ? galleryImages(preview) : []
  const previewCover = previewImages[previewIndex] ?? previewImages[0] ?? null

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((product) => {
            const cover = coverImage(product)
            const src = imageSrc(cover)
            const canPublish = product.canPublish !== false
            const toggleDisabled = !product.isActive && !canPublish

            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative size-10 overflow-hidden rounded-lg">
                    {src ? (
                      <img src={src} alt="" className="size-full object-cover" />
                    ) : (
                      <DecoryImageFallback />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.slug}</TableCell>
                <TableCell>{product.categoryName || "—"}</TableCell>
                <TableCell>
                  <span
                    className="inline-flex"
                    title={
                      toggleDisabled
                        ? "Add an image and a default price to publish"
                        : undefined
                    }
                  >
                    <Switch
                      checked={product.isActive}
                      disabled={toggleDisabled}
                      onCheckedChange={(checked) => onTogglePublished(product, checked)}
                      aria-label={
                        product.isActive ? `Unpublish ${product.name}` : `Publish ${product.name}`
                      }
                    />
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.updatedAt ? format(new Date(product.updatedAt), "d MMM yyyy") : "—"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${product.name}`}
                        />
                      }
                    >
                      <MoreHorizontalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/catalog/products/${product.id}`)}>
                        <PencilIcon />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!cover}
                        onClick={() => {
                          setPreview(product)
                          setPreviewIndex(0)
                        }}
                      >
                        <EyeIcon />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(product)}>
                        <Trash2Icon />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <Dialog
        open={Boolean(preview)}
        onOpenChange={(open) => {
          if (!open) {
            setPreview(null)
            setPreviewIndex(0)
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{preview?.name || "Product preview"}</DialogTitle>
            <DialogDescription>
              {previewImages.length > 1
                ? `${previewImages.length} images`
                : "Product image."}
            </DialogDescription>
          </DialogHeader>
          {previewCover ? (
            <img
              src={imageSrc(previewCover)}
              alt={previewCover.filename || preview?.name || "Image"}
              className="max-h-[70vh] w-full rounded-xl object-contain"
            />
          ) : null}
          {previewImages.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {previewImages.map((item, index) => (
                <button
                  key={item.uploadId || item.id}
                  type="button"
                  className={cn(
                    "size-14 overflow-hidden rounded-lg border bg-muted",
                    index === previewIndex ? "ring-2 ring-ring" : "",
                  )}
                  onClick={() => setPreviewIndex(index)}
                  aria-label={item.filename || "Image"}
                >
                  <img src={imageSrc(item)} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
