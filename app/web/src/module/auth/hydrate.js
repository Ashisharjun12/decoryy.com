import { logout, refresh } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";

export function isCustomer(user) {
  return user?.role === "user";
}

export async function applyCustomerSession(payload) {
  if (!isCustomer(payload?.user)) {
    try {
      await logout();
    } catch {
      // cookie may already be gone
    }
    useAuthStore.getState().clear();
    throw new Error("This Google account cannot sign in here");
  }
  useAuthStore.getState().setSession(payload);
}

export async function hydrateAuth() {
  const store = useAuthStore.getState();
  store.setStatus("loading");
  try {
    const payload = await refresh();
    await applyCustomerSession(payload);
  } catch {
    const { user, accessToken } = useAuthStore.getState();
    if (!user && !accessToken) {
      store.clear();
    } else {
      store.setStatus("ready");
    }
  }
}
