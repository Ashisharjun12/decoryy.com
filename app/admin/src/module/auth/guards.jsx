import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/auth.store";

function FullPageSpinner() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center">
      <Spinner className="size-6" />
    </div>
  );
}

export function RequireAdmin() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  if (status === "idle" || status === "loading") {
    return <FullPageSpinner />;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function GuestOnly() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  if (status === "idle" || status === "loading") {
    return <FullPageSpinner />;
  }

  if (user?.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
