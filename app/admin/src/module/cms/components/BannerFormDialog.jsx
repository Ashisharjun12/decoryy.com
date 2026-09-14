import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { CmsFormDialogShell } from "@/module/cms/components/CmsFormDialogShell"
import { PlatformCheckboxes } from "@/module/cms/components/PlatformCheckboxes"
import { CMS_PLACEMENTS, CMS_STATUSES, PLACEMENT_LABELS } from "@/module/cms/lib/cms-constants"

const VISUAL_PLACEMENTS = CMS_PLACEMENTS.filter((value) => value !== "announcement_bar")
const FORM_ID = "banner-form"

function emptyToNull(value) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function BannerFormDialog({
  open,
  onOpenChange,
  item,
  cities = [],
  defaultPlacement = "home_hero",
  onSubmit,
  submitting,
  onPickImage,
  imagePreview,
  imageUploadId: pickedUploadId,
}) {
  const [placement, setPlacement] = useState(defaultPlacement)
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [tag, setTag] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [alt, setAlt] = useState("")
  const [href, setHref] = useState("")
  const [ctaLabel, setCtaLabel] = useState("")
  const [secondaryLabel, setSecondaryLabel] = useState("")
  const [secondaryHref, setSecondaryHref] = useState("")
  const [status, setStatus] = useState("draft")
  const [cityId, setCityId] = useState("global")
  const [platforms, setPlatforms] = useState(["web", "mobile"])
  const [imageUploadId, setImageUploadId] = useState(null)
  const [imageError, setImageError] = useState("")

  useEffect(() => {
    if (!open) return
    setPlacement(item?.placement ?? defaultPlacement)
    setTitle(item?.title ?? "")
    setSubtitle(item?.subtitle ?? "")
    setTag(item?.tag ?? "")
    setImageUrl(item?.imageUrl || imagePreview || "")
    setAlt(item?.alt ?? "")
    setHref(item?.href ?? "")
    setCtaLabel(item?.ctaLabel ?? "")
    setSecondaryLabel(item?.secondaryLabel ?? "")
    setSecondaryHref(item?.secondaryHref ?? "")
    setStatus(item?.status ?? "draft")
    setCityId(item?.cityId ?? "global")
    setPlatforms(item?.platforms ?? ["web", "mobile"])
    setImageUploadId(pickedUploadId ?? item?.imageUploadId ?? null)
    setImageError("")
  }, [open, item, defaultPlacement, imagePreview, pickedUploadId])

  function handleSubmit(event) {
    event.preventDefault()
    const resolvedUploadId = imageUploadId ?? pickedUploadId ?? item?.imageUploadId ?? null
    if (!resolvedUploadId) {
      setImageError("Pick a banner image from media.")
      return
    }
    setImageError("")
    const city = cityId === "global" ? null : cityId
    const cityName = cities.find((row) => row.id === city)?.name ?? item?.cityName ?? null
    onSubmit?.({
      placement,
      title: emptyToNull(title),
      subtitle: emptyToNull(subtitle),
      tag: emptyToNull(tag),
      imageUrl: imageUrl || imagePreview || null,
      imageUploadId: resolvedUploadId,
      alt: emptyToNull(alt),
      href: emptyToNull(href),
      ctaLabel: emptyToNull(ctaLabel),
      secondaryLabel: emptyToNull(secondaryLabel),
      secondaryHref: emptyToNull(secondaryHref),
      status,
      sortIndex: item?.sortIndex ?? 0,
      cityId: city,
      cityName,
      platforms,
      priority: 0,
    })
  }

  return (
    <CmsFormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={item ? "Edit banner" : "Add banner"}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form={FORM_ID} disabled={submitting}>
            {submitting ? <Spinner className="size-4" /> : item ? "Save" : "Create"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="grid w-full min-w-0 gap-4">
        <div className="grid gap-2">
          <Label>
            Image <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            {onPickImage ? (
              <Button type="button" variant="outline" onClick={onPickImage}>Choose from media</Button>
            ) : null}
          </div>
          {imageUrl || imagePreview ? (
            <img src={imagePreview || imageUrl} alt="" className="h-32 w-full rounded-lg object-cover" />
          ) : (
            <p className="text-xs text-muted-foreground">Banner image is required. All other fields are optional.</p>
          )}
          {imageError ? <p className="text-sm text-destructive">{imageError}</p> : null}
        </div>
        <div className="grid gap-2">
          <Label>Placement</Label>
          <Select value={placement} onValueChange={setPlacement}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {VISUAL_PLACEMENTS.map((value) => (
                <SelectItem key={value} value={value}>{PLACEMENT_LABELS[value]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Tag</Label>
          <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Optional" />
        </div>
        <div className="grid gap-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional" />
        </div>
        <div className="grid gap-2">
          <Label>Subtitle</Label>
          <Textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={2} placeholder="Optional" />
        </div>
        <div className="grid gap-2">
          <Label>Alt text</Label>
          <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Optional" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>CTA label</Label>
            <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Optional" />
          </div>
          <div className="grid gap-2">
            <Label>CTA link</Label>
            <Input value={href} onChange={(e) => setHref(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Secondary CTA</Label>
            <Input value={secondaryLabel} onChange={(e) => setSecondaryLabel(e.target.value)} placeholder="Optional" />
          </div>
          <div className="grid gap-2">
            <Label>Secondary link</Label>
            <Input value={secondaryHref} onChange={(e) => setSecondaryHref(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Scope</Label>
          <Select value={cityId} onValueChange={setCityId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global (all cities)</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Platforms</Label>
          <PlatformCheckboxes value={platforms} onChange={setPlatforms} />
        </div>
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CMS_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </form>
    </CmsFormDialogShell>
  )
}
