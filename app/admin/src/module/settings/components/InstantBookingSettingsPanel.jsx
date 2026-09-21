import { useEffect, useMemo, useState } from "react"
import { getApiError } from "@/api/api"
import {
  getInstantDispatchPolicy,
  getInstantMapsPolicy,
  getInstantMarketplacePolicy,
  patchInstantDispatchPolicy,
  patchInstantMapsPolicy,
  patchInstantMarketplacePolicy,
  resolveInstantDispatchSystemUser,
} from "@/api/settings.api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"

function parseRadiusWaves(raw) {
  if (Array.isArray(raw)) return raw.join(", ")
  return "5, 10, 15"
}

function wavesFromInput(value) {
  return value
    .split(/[,;\s]+/)
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
}

function dispatchFormSnapshot(dispatch, radiusInput) {
  if (!dispatch) return ""
  return JSON.stringify({
    enabled: dispatch.enabled,
    systemUserId: (dispatch.systemUserId ?? "").trim() || null,
    offerTtlSec: dispatch.offerTtlSec,
    maxOffersPerOrder: dispatch.maxOffersPerOrder,
    geoCount: dispatch.geoCount,
    instantSlaMinutes: dispatch.instantSlaMinutes,
    radiusKmWaves: wavesFromInput(radiusInput),
  })
}

export function InstantBookingSettingsPanel() {
  const [marketplace, setMarketplace] = useState(null)
  const [savedMarketplace, setSavedMarketplace] = useState(null)
  const [dispatch, setDispatch] = useState(null)
  const [savedDispatchSnapshot, setSavedDispatchSnapshot] = useState("")
  const [maps, setMaps] = useState(null)
  const [savedMaps, setSavedMaps] = useState(null)
  const [radiusInput, setRadiusInput] = useState("5, 10, 15")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState("")
  const [resolvingSystemUser, setResolvingSystemUser] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getInstantMarketplacePolicy(),
      getInstantDispatchPolicy(),
      getInstantMapsPolicy(),
    ])
      .then(([mp, dp, mpMaps]) => {
        if (cancelled) return
        setMarketplace(mp)
        setSavedMarketplace(mp)
        setDispatch(dp)
        setMaps(mpMaps)
        setSavedMaps(mpMaps)
        const radius = parseRadiusWaves(dp?.radiusKmWaves)
        setRadiusInput(radius)
        setSavedDispatchSnapshot(dispatchFormSnapshot(dp, radius))
      })
      .catch((err) => {
        if (!cancelled) toast.add({ title: getApiError(err), type: "error" })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const marketplaceDirty = useMemo(() => {
    if (!marketplace || !savedMarketplace) return false
    return JSON.stringify(marketplace) !== JSON.stringify(savedMarketplace)
  }, [marketplace, savedMarketplace])

  const dispatchDirty = useMemo(() => {
    if (!dispatch || !savedDispatchSnapshot) return false
    return dispatchFormSnapshot(dispatch, radiusInput) !== savedDispatchSnapshot
  }, [dispatch, radiusInput, savedDispatchSnapshot])

  const mapsDirty = useMemo(() => {
    if (!maps || !savedMaps) return false
    return JSON.stringify(maps) !== JSON.stringify(savedMaps)
  }, [maps, savedMaps])

  async function saveMarketplace() {
    if (!marketplace || !marketplaceDirty) return
    setSaving("marketplace")
    try {
      const next = await patchInstantMarketplacePolicy(marketplace)
      setMarketplace(next)
      setSavedMarketplace(next)
      toast.add({ title: "Instant marketplace saved", type: "success" })
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" })
    } finally {
      setSaving("")
    }
  }

  async function saveDispatch() {
    if (!dispatch || !dispatchDirty) return
    const waves = wavesFromInput(radiusInput)
    if (!waves.length) {
      toast.add({ title: "Enter at least one radius (km)", type: "error" })
      return
    }
    setSaving("dispatch")
    try {
      const next = await patchInstantDispatchPolicy({
        ...dispatch,
        radiusKmWaves: waves,
        systemUserId: dispatch.systemUserId?.trim() || null,
      })
      setDispatch(next)
      const radius = parseRadiusWaves(next.radiusKmWaves)
      setRadiusInput(radius)
      setSavedDispatchSnapshot(dispatchFormSnapshot(next, radius))
      toast.add({ title: "Instant dispatch saved", type: "success" })
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" })
    } finally {
      setSaving("")
    }
  }

  async function saveMaps() {
    if (!maps || !mapsDirty) return
    setSaving("maps")
    try {
      const next = await patchInstantMapsPolicy(maps)
      setMaps(next)
      setSavedMaps(next)
      toast.add({ title: "Map settings saved", type: "success" })
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" })
    } finally {
      setSaving("")
    }
  }

  async function onResolveSystemUser() {
    setResolvingSystemUser(true)
    try {
      const result = await resolveInstantDispatchSystemUser()
      setDispatch((current) => ({
        ...current,
        systemUserId: result.systemUserId,
      }))
      toast.add({
        title: result.created ? "System user created and filled in" : "System user ID filled in",
        type: "success",
      })
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" })
    } finally {
      setResolvingSystemUser(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!marketplace || !dispatch || !maps) {
    return (
      <p className="text-sm text-muted-foreground py-8">Could not load instant booking settings.</p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Instant marketplace</CardTitle>
          <CardDescription>
            Turns instant on for customers site-wide. Product-level Instant and copy can be prepared
            anytime in Catalog; they stay hidden until this is enabled. Save only this card when you
            change the switch below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-1">
              <Label htmlFor="instant-marketplace">Allow instant bookings</Label>
              <p className="text-sm text-muted-foreground">When off, customers cannot place instant orders.</p>
            </div>
            <Switch
              id="instant-marketplace"
              checked={marketplace.enabled}
              onCheckedChange={(checked) =>
                setMarketplace((current) => ({ ...current, enabled: checked }))
              }
            />
          </div>
          <Button
            onClick={saveMarketplace}
            disabled={!marketplaceDirty || saving === "marketplace"}
          >
            {saving === "marketplace" ? "Saving…" : "Save marketplace"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auto-dispatch</CardTitle>
          <CardDescription>
            Redis GEO matching, sequential vendor offers, and BullMQ timers. Enable when you are ready
            to auto-offer vendors (separate from marketplace save). Requires a system user UUID for
            assignment rows.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-1">
              <Label htmlFor="dispatch-enabled">Dispatch enabled</Label>
              <p className="text-sm text-muted-foreground">
                When off, instant orders stay confirmed for manual admin assign only.
              </p>
            </div>
            <Switch
              id="dispatch-enabled"
              checked={dispatch.enabled}
              onCheckedChange={(checked) =>
                setDispatch((current) => ({ ...current, enabled: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="system-user-id">System user ID (UUID)</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                id="system-user-id"
                className="font-mono text-sm"
                placeholder="00000000-0000-0000-0000-000000000000"
                value={dispatch.systemUserId ?? ""}
                onChange={(event) =>
                  setDispatch((current) => ({
                    ...current,
                    systemUserId: event.target.value,
                  }))
                }
              />
              {dispatch.enabled ? (
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  disabled={resolvingSystemUser}
                  onClick={() => void onResolveSystemUser()}
                >
                  {resolvingSystemUser ? "Loading…" : "Get system user ID"}
                </Button>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              Used as assigned_by on system offers. Dispatch stops if empty. Use the button to create
              or look up the internal service user—then save dispatch.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="offer-ttl">Offer TTL (seconds)</Label>
              <Input
                id="offer-ttl"
                type="number"
                min={15}
                max={300}
                value={dispatch.offerTtlSec}
                onChange={(event) =>
                  setDispatch((current) => ({
                    ...current,
                    offerTtlSec: Number(event.target.value) || 75,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-offers">Max offers per order</Label>
              <Input
                id="max-offers"
                type="number"
                min={1}
                max={20}
                value={dispatch.maxOffersPerOrder}
                onChange={(event) =>
                  setDispatch((current) => ({
                    ...current,
                    maxOffersPerOrder: Number(event.target.value) || 5,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="geo-count">GEO candidate cap</Label>
              <Input
                id="geo-count"
                type="number"
                min={5}
                max={100}
                value={dispatch.geoCount}
                onChange={(event) =>
                  setDispatch((current) => ({
                    ...current,
                    geoCount: Number(event.target.value) || 30,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sla-minutes">Instant SLA (minutes)</Label>
              <Input
                id="sla-minutes"
                type="number"
                min={30}
                max={480}
                value={dispatch.instantSlaMinutes}
                onChange={(event) =>
                  setDispatch((current) => ({
                    ...current,
                    instantSlaMinutes: Number(event.target.value) || 120,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="radius-waves">Radius waves (km, comma-separated)</Label>
            <Input
              id="radius-waves"
              value={radiusInput}
              onChange={(event) => setRadiusInput(event.target.value)}
              placeholder="5, 10, 15"
            />
            <p className="text-sm text-muted-foreground">
              Search nearby vendors first (e.g. 5 km), then widen (10 km, 15 km) if no one is
              available.
            </p>
          </div>

          <Button onClick={saveDispatch} disabled={!dispatchDirty || saving === "dispatch"}>
            {saving === "dispatch" ? "Saving…" : "Save dispatch"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trip maps &amp; live tracking</CardTitle>
          <CardDescription>
            Applies to instant and scheduled bookings when the partner is en route. Controls vendor and
            customer map UIs and the live GPS tracking API. Does not enable auto-dispatch for scheduled
            orders. Web map stays off by default.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {[
            {
              id: "map-customer",
              label: "Customer app map",
              key: "customerAppMapEnabled",
            },
            {
              id: "map-vendor",
              label: "Vendor app map",
              key: "vendorAppMapEnabled",
            },
            { id: "map-web", label: "Web map", key: "webMapEnabled" },
            {
              id: "live-tracking",
              label: "Live tracking API",
              key: "liveTrackingEnabled",
            },
          ].map((row) => (
            <div key={row.id} className="flex items-start justify-between gap-6">
              <Label htmlFor={row.id}>{row.label}</Label>
              <Switch
                id={row.id}
                checked={Boolean(maps[row.key])}
                onCheckedChange={(checked) =>
                  setMaps((current) => ({ ...current, [row.key]: checked }))
                }
              />
            </div>
          ))}
          <Button onClick={saveMaps} disabled={!mapsDirty || saving === "maps"}>
            {saving === "maps" ? "Saving…" : "Save maps"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
