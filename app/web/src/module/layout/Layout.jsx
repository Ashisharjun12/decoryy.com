import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LenisProvider } from "@/lib/lenis";
import { LoginDialog } from "@/module/layout/components/LoginDialog";
import { LocationPrompt } from "@/module/layout/components/LocationPrompt";
import { CartDrawer } from "@/module/layout/components/CartDrawer";
import { SiteFooter } from "@/module/layout/components/SiteFooter";
import { SiteShellProvider } from "@/module/site/hooks/use-site-shell.jsx";
import { AnnouncementBar } from "@/module/cms/components/AnnouncementBar";
import { SiteHeader } from "@/module/layout/components/SiteHeader";

export function Layout() {
  const { pathname } = useLocation();
  const isAccountArea = pathname.startsWith("/account");

  return (
    <LenisProvider>
      <TooltipProvider>
        <SiteShellProvider>
        <Toaster>
          <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
            <AnnouncementBar />
            <SiteHeader />
            <LocationPrompt />
            <main className={isAccountArea ? "flex min-h-0 flex-1 flex-col" : "flex-1"}>
              <Outlet />
            </main>
            {!isAccountArea ? <SiteFooter /> : null}
            <LoginDialog />
            <CartDrawer />
          </div>
        </Toaster>
        </SiteShellProvider>
      </TooltipProvider>
    </LenisProvider>
  );
}
