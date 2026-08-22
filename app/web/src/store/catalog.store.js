import { create } from "zustand";
import { listCategories } from "@/api/categories.api";

export const useCatalogStore = create((set, get) => ({
  categories: [],
  status: "idle",
  load: async () => {
    if (get().status === "loading") return;
    set({ status: "loading" });
    try {
      const categories = await listCategories();
      set({
        categories: Array.isArray(categories) ? categories : [],
        status: "ready",
      });
    } catch {
      set({ status: "error" });
    }
  },
}));
