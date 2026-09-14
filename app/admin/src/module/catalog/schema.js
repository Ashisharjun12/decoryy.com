import { z } from "zod";

export const CATEGORY_ICON_KEYS = [
  "cake",
  "heart",
  "baby",
  "gem",
  "party",
  "sparkles",
  "building",
  "heart-handshake",
  "gift",
  "flower",
];

export const CATEGORY_ICON_TONES = [
  "amber",
  "rose",
  "sky",
  "violet",
  "orange",
  "emerald",
  "slate",
  "pink",
];

export const CATEGORY_ICON_LABELS = {
  cake: "Cake",
  heart: "Heart",
  baby: "Baby",
  gem: "Gem",
  party: "Party",
  sparkles: "Sparkles",
  building: "Building",
  "heart-handshake": "Handshake",
  gift: "Gift",
  flower: "Flower",
};

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .trim()
    .refine((v) => v.length === 0 || v.length >= 2, "Slug must be at least 2 characters"),
  iconKey: z.enum(CATEGORY_ICON_KEYS).optional(),
  iconTone: z.enum(CATEGORY_ICON_TONES).optional(),
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
    paymentCod: z.boolean(),
    paymentOnline: z.boolean(),
  })
  .refine((value) => value.scheduledEnabled || value.instantEnabled, {
    message: "Turn on Scheduled or Instant",
    path: ["scheduledEnabled"],
  })
  .refine((value) => value.paymentCod || value.paymentOnline, {
    message: "Turn on COD or Online payment",
    path: ["paymentCod"],
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

export const sectionSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .trim()
    .refine((v) => v.length === 0 || v.length >= 2, "Slug must be at least 2 characters"),
  sortIndex: z.coerce.number().int(),
  isActive: z.boolean(),
});
