import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationChannelsPanel } from "@/module/settings/components/NotificationChannelsPanel"
import { NotificationTemplatesPanel } from "@/module/settings/components/NotificationTemplatesPanel"

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Notification channels and templates for Decoryy.
        </p>
      </div>
      <Tabs defaultValue="notifications">
        <TabsList variant="line">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="notifications" className="flex flex-col gap-6 pt-4">
          <NotificationChannelsPanel />
          <NotificationTemplatesPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
