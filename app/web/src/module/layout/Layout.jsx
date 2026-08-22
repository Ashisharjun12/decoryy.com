import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LenisProvider } from "@/lib/lenis";
import { LoginDialog } from "@/module/layout/components/LoginDialog";
import { LocationPrompt } from "@/module/layout/components/LocationPrompt";
import { SiteFooter } from "@/module/layout/components/SiteFooter";
import { SiteHeader } from "@/module/layout/components/SiteHeader";

export function Layout() {
  return (
    <LenisProvider>
      <TooltipProvider>
        <Toaster>
          <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
            <SiteHeader />
            <LocationPrompt />
            <main className="flex-1">
              <Outlet />
            </main>
            <SiteFooter />
            <LoginDialog />
          </div>
        </Toaster>
      </TooltipProvider>
    </LenisProvider>
  );
}
