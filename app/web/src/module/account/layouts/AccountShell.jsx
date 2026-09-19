import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { getLenis } from "@/lib/lenis-instance";
import { AccountNav } from "@/module/account/components/AccountNav";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

function isAccountChatRoute(pathname) {
  return (
    pathname.includes("/chat") ||
    /\/account\/help\/[^/]+\/chat$/.test(pathname)
  );
}

export function AccountShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const setLoginOpen = useAuthStore((s) => s.setLoginOpen);
  const isChat = isAccountChatRoute(pathname);

  useEffect(() => {
    if (status === "ready" && !user) {
      setLoginOpen(true);
      navigate("/", { replace: true });
    }
  }, [status, user, navigate, setLoginOpen]);

  useEffect(() => {
    const lenis = getLenis();
    lenis?.stop();
    return () => {
      lenis?.start();
    };
  }, []);

  if (status !== "ready" || !user) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-var(--site-header-height,4rem))] min-h-0 overflow-hidden">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-background md:flex lg:w-64">
        <div
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-8"
          data-lenis-prevent
        >
          <AccountNav variant="sidebar" />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
        <div className="shrink-0 border-b border-border p-4 md:hidden">
          <AccountNav variant="mobile" />
        </div>
        <div
          className={cn(
            "min-h-0 flex-1",
            isChat
              ? "overflow-hidden"
              : "overflow-y-auto overscroll-contain px-6 py-8 lg:px-12 lg:py-10",
          )}
          data-lenis-prevent
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
