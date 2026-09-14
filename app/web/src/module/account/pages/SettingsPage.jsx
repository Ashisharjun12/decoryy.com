import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SettingsPage() {
  return (
    <div className="w-full max-w-3xl">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage notifications and preferences for your account.
        </p>
      </div>

      <Card className="shadow-none ring-0">
        <CardHeader>
          <CardTitle className="text-lg">Notifications</CardTitle>
          <CardDescription>Notification preferences coming soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You&apos;ll be able to choose SMS updates for booking confirmations and decorator
            assignments here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
