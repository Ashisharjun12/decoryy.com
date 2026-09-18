import { useEffect, useState } from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"
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
import { Spinner } from "@/components/ui/spinner"
import { CmsFormDialogShell } from "@/module/cms/components/CmsFormDialogShell"
import { PlatformCheckboxes } from "@/module/cms/components/PlatformCheckboxes"
import { CMS_STATUSES } from "@/module/cms/lib/cms-constants"

const FORM_ID = "footer-column-form"

export function FooterColumnFormDialog({ open, onOpenChange, item, onSubmit, submitting }) {
  const [title, setTitle] = useState("")
  const [status, setStatus] = useState("draft")
  const [platforms, setPlatforms] = useState(["web", "mobile"])
  const [links, setLinks] = useState([{ label: "", href: "" }])

  useEffect(() => {
    if (!open) return
    setTitle(item?.title ?? "")
    setStatus(item?.status ?? "draft")
    setPlatforms(item?.platforms ?? ["web", "mobile"])
    const existing = item?.links ?? []
    setLinks(existing.length ? existing.map((l) => ({ label: l.label, href: l.href })) : [{ label: "", href: "" }])
  }, [open, item])

  function updateLink(index, field, value) {
    setLinks((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function addLink() {
    setLinks((prev) => [...prev, { label: "", href: "" }])
  }

  function removeLink(index) {
    setLinks((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const cleaned = links
      .map((row) => ({ label: row.label.trim(), href: row.href.trim() }))
      .filter((row) => row.label && row.href)
    onSubmit?.({
      title,
      status,
      platforms,
      links: cleaned,
    })
  }

  return (
    <CmsFormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={item ? "Edit footer column" : "Add footer column"}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} disabled={submitting}>
            {submitting ? <Spinner className="size-4" /> : null}
            Save
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="col-title">Column title</Label>
          <Input id="col-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CMS_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <PlatformCheckboxes value={platforms} onChange={setPlatforms} />
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label>Links</Label>
            <Button type="button" variant="outline" size="sm" onClick={addLink}>
              <PlusIcon className="size-4" />
              Add link
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {links.map((row, index) => (
              <div key={index} className="flex flex-col gap-2 rounded-md border border-border p-3">
                <Input
                  placeholder="Label"
                  value={row.label}
                  onChange={(e) => updateLink(index, "label", e.target.value)}
                />
                <Input
                  placeholder="/path or https://..."
                  value={row.href}
                  onChange={(e) => updateLink(index, "href", e.target.value)}
                />
                {links.length > 1 ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeLink(index)}>
                    <Trash2Icon className="size-4" />
                    Remove
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </form>
    </CmsFormDialogShell>
  )
}
