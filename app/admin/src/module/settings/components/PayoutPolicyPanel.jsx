import { useEffect, useState } from "react"
import { getApiError } from "@/api/api"
import { getPayoutPolicy, patchPayoutPolicy } from "@/api/settings.api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RupeesPolicyInput } from "@/components/RupeesPolicyInput"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"

export function PayoutPolicyPanel() {
  const [policy, setPolicy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    getPayoutPolicy()
      .then((data) => {
        if (!cancelled) setPolicy(data)
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

  async function onSave() {
    if (!policy) return
    setSaving(true)
    try {
      const next = await patchPayoutPolicy(policy)
      setPolicy(next)
      toast.add({ title: "Payout policy saved", type: "success" })
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-full max-w-xl" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full max-w-xs" />
          <Skeleton className="h-10 w-full max-w-xs" />
        </CardContent>
      </Card>
    )
  }

  if (!policy) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout policy</CardTitle>
        <CardDescription>
          Commission split and vendor wallet rules. Snapshotted on each order at creation.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="platformCommissionPercent">Platform commission (%)</Label>
          <Input
            id="platformCommissionPercent"
            type="number"
            min={0}
            max={50}
            value={policy.platformCommissionPercent}
            onChange={(e) =>
              setPolicy({ ...policy, platformCommissionPercent: Number(e.target.value) })
            }
          />
        </div>
        <RupeesPolicyInput
          id="codMaxDuePaise"
          label="COD dues cap"
          valuePaise={policy.codMaxDuePaise}
          onChangePaise={(codMaxDuePaise) => setPolicy({ ...policy, codMaxDuePaise })}
          min={0}
          step={100}
          hint="Maximum cash COD commission a vendor can owe before new assignments are blocked."
        />
        <div className="space-y-2">
          <Label htmlFor="settlementHoldDays">Settlement hold (days)</Label>
          <Input
            id="settlementHoldDays"
            type="number"
            min={0}
            max={30}
            value={policy.settlementHoldDays}
            onChange={(e) => setPolicy({ ...policy, settlementHoldDays: Number(e.target.value) })}
          />
        </div>
        <RupeesPolicyInput
          id="minWithdrawalPaise"
          label="Minimum withdrawal"
          valuePaise={policy.minWithdrawalPaise}
          onChangePaise={(minWithdrawalPaise) => setPolicy({ ...policy, minWithdrawalPaise })}
          min={0}
          step={50}
          hint="Smallest amount a vendor can request in a single payout."
        />
        <div className="flex items-center justify-between rounded-lg border border-border p-4 md:col-span-2">
          <div>
            <Label htmlFor="autoNetCodFromEarnings">Auto-net COD from earnings</Label>
            <p className="text-sm text-muted-foreground">
              Available balance subtracts outstanding COD commission dues.
            </p>
          </div>
          <Switch
            id="autoNetCodFromEarnings"
            checked={policy.autoNetCodFromEarnings}
            onCheckedChange={(checked) =>
              setPolicy({ ...policy, autoNetCodFromEarnings: checked })
            }
          />
        </div>
        <div className="md:col-span-2">
          <Button onClick={() => void onSave()} disabled={saving}>
            {saving ? "Saving…" : "Save payout policy"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
