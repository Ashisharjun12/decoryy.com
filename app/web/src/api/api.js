import axios from "axios";
import { API_URL } from "@/lib/env";
import { useAuthStore } from "@/store/auth.store";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export function getApiError(err) {
  return err?.response?.data?.message || err?.message || "Something went wrong";
}

export function unwrap(response) {
  return response.data?.data;
}

function skipRefresh(url = "") {
  return (
    url.includes("/auth/google") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout")
  );
}

function isCustomer(user) {
  return user?.role === "user";
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    if (skipRefresh(original.url || "")) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = api
          .post("/auth/refresh", { clientType: "web" })
          .then((res) => {
            const payload = unwrap(res);
            if (!isCustomer(payload?.user)) {
              throw error;
            }
            useAuthStore.getState().setSession(payload);
            return payload.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const token = await refreshPromise;
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch (refreshError) {
      const { user, accessToken } = useAuthStore.getState();
      if (!user && !accessToken) {
        useAuthStore.getState().clear();
      }
      return Promise.reject(refreshError);
    }
  },
);
