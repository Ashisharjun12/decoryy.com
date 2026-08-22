import { create } from "zustand";

export const useCartStore = create(() => ({
  count: 0,
}));
