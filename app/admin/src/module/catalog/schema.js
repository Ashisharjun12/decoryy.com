import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .trim()
    .refine((v) => v.length === 0 || v.length >= 2, "Slug must be at least 2 characters"),
  isActive: z.boolean(),
});

export const productFormSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    slug: z
      .string()
      .trim()
      .refine((v) => v.length === 0 || v.length >= 2, "Slug must be at least 2 characters"),
    description: z.string(),
    parentCategoryId: z.string().uuid("Select a category"),
    categoryId: z.string().uuid("Select a subcategory"),
    isActive: z.boolean(),
    scheduledEnabled: z.boolean(),
    instantEnabled: z.boolean(),
  })
  .refine((value) => value.scheduledEnabled || value.instantEnabled, {
    message: "Turn on Scheduled or Instant",
    path: ["scheduledEnabled"],
  });

export const addonFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .trim()
    .refine((v) => v.length === 0 || v.length >= 2, "Slug must be at least 2 characters"),
  description: z.string(),
  isActive: z.boolean(),
});
