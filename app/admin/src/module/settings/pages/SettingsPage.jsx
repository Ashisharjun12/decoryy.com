import { useSearchParams } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AiPolicyPanel } from "@/module/settings/components/AiPolicyPanel"
import { BookingPolicyPanel } from "@/module/settings/components/BookingPolicyPanel"
import { NotificationChannelsPanel } from "@/module/settings/components/NotificationChannelsPanel"
import { NotificationTemplatesPanel } from "@/module/settings/components/NotificationTemplatesPanel"
import { AuditLogPage } from "@/module/settings/pages/AuditLogPage"
import { AdminAccountPanel } from "@/module/settings/components/AdminAccountPanel"

const TABS = ["account", "notifications", "booking", "ai", "audit"]

function normalizeTab(value) {
  return TABS.includes(value) ? value : "account"
}

export function SettingsPage() {
  const [params, setParams] = useSearchParams()
  const tab = normalizeTab(params.get("tab"))

  function onTabChange(next) {
    setParams({ tab: next }, { replace: true })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin account, notifications, booking policy, AI controls, and audit trail.
        </p>
      </div>

      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList variant="line">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="pt-4">
          <AdminAccountPanel />
        </TabsContent>

        <TabsContent value="notifications" className="flex flex-col gap-6 pt-4">
          <NotificationChannelsPanel />
          <NotificationTemplatesPanel />
        </TabsContent>

        <TabsContent value="booking" className="pt-4">
          <BookingPolicyPanel />
        </TabsContent>

        <TabsContent value="ai" className="pt-4">
          <AiPolicyPanel />
        </TabsContent>

        <TabsContent value="audit" className="pt-4">
          <AuditLogPage />
        </TabsContent>
      </Tabs>
    </div>
  )
}
