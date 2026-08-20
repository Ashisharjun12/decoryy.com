import { useEffect, useRef, useState } from "react"
import ReactCrop from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { CROP_PRESETS, getCropPreset } from "@/lib/crop-presets"
import { cn } from "@/lib/utils"

function toPixelCrop(crop, image) {
  if (!crop?.width || !crop?.height || !image) return undefined
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  const x = crop.unit === "%" ? (crop.x / 100) * image.naturalWidth : crop.x * scaleX
  const y = crop.unit === "%" ? (crop.y / 100) * image.naturalHeight : crop.y * scaleY
  const width = crop.unit === "%" ? (crop.width / 100) * image.naturalWidth : crop.width * scaleX
  const height = crop.unit === "%" ? (crop.height / 100) * image.naturalHeight : crop.height * scaleY
  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  }
}

function buildOutput(width, height) {
  const w = Number.parseInt(String(width), 10)
  const h = Number.parseInt(String(height), 10)
  const output = {}
  if (Number.isFinite(w) && w > 0) output.width = w
  if (Number.isFinite(h) && h > 0) output.height = h
  return Object.keys(output).length ? output : undefined
}

export function MediaCropDialog({ open, onOpenChange, item, onConfirm, submitting }) {
  const imgRef = useRef(null)
  const [crop, setCrop] = useState(undefined)
  const [presetId, setPresetId] = useState("free")
  const [outputWidth, setOutputWidth] = useState("")
  const [outputHeight, setOutputHeight] = useState("")

  useEffect(() => {
    if (!open) {
      setCrop(undefined)
      setPresetId("free")
      setOutputWidth("")
      setOutputHeight("")
    }
  }, [open, item?.id])

  function onImageLoad(event) {
    setCrop({
      unit: "%",
      x: 5,
      y: 5,
      width: 90,
      height: 90,
    })
  }

  function selectPreset(id) {
    const preset = getCropPreset(id)
    setPresetId(preset.id)
    if (preset.outputWidth) setOutputWidth(String(preset.outputWidth))
    else setOutputWidth("")
    if (preset.outputHeight) setOutputHeight(String(preset.outputHeight))
    else setOutputHeight("")
  }

  async function handleConfirm() {
    const pixel = toPixelCrop(crop, imgRef.current)
    if (!pixel || pixel.width <= 0 || pixel.height <= 0) return
    const output = buildOutput(outputWidth, outputHeight)
    await onConfirm(pixel, output)
  }

  const activePreset = getCropPreset(presetId)
  const cropAspect = activePreset.aspect

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Optimize image</DialogTitle>
          <DialogDescription>
            Crop the image, then convert to WebP and optimize for the library.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {CROP_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              size="sm"
              variant={presetId === preset.id ? "default" : "outline"}
              className={cn("rounded-full cursor-pointer", presetId === preset.id && "pointer-events-none")}
              onClick={() => selectPreset(preset.id)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="crop-output-width">Output width</Label>
            <Input
              id="crop-output-width"
              type="number"
              min={1}
              max={4096}
              placeholder="Optional"
              value={outputWidth}
              onChange={(event) => setOutputWidth(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="crop-output-height">Output height</Label>
            <Input
              id="crop-output-height"
              type="number"
              min={1}
              max={4096}
              placeholder="Optional"
              value={outputHeight}
              onChange={(event) => setOutputHeight(event.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Output is resized to fit within W×H without upscaling.
        </p>

        <div className="max-h-[60vh] overflow-auto rounded-2xl bg-muted p-2">
          {item?.publicUrl ? (
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              aspect={cropAspect}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={item.publicUrl}
                alt={item.filename}
                onLoad={onImageLoad}
                className="max-h-[50vh] w-full object-contain"
              />
            </ReactCrop>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={submitting || !crop}>
            {submitting ? <Spinner /> : null}
            Start optimizing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
