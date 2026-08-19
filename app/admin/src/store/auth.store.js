import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  status: "idle",
  setStatus: (status) => set({ status }),
  setSession: ({ user, accessToken }) =>
    set({ user, accessToken, status: "ready" }),
  clear: () => set({ user: null, accessToken: null, status: "ready" }),
}));
