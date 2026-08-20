import { z } from "zod";

export const createProductDto = z.object({
    name: z.string().min(2),
    slug: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    categoryId: z.string().uuid(),
    isActive: z.boolean().optional(),
    imageUploadIds: z.array(z.string().uuid()).optional(),
});

export const patchProductDto = z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    categoryId: z.string().uuid().optional(),
    isActive: z.boolean().optional(),
    imageUploadIds: z.array(z.string().uuid()).optional(),
});

export const productIdParamsDto = z.object({
    id: z.string().uuid(),
});

export const productAddonParamsDto = z.object({
    id: z.string().uuid(),
    addonId: z.string().uuid(),
});

export const adminProductListQueryDto = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    q: z.string().optional(),
    isActive: z.enum(["true", "false"]).optional(),
    categoryId: z.string().uuid().optional(),
});

export const publicProductListQueryDto = z.object({
    pincode: z.string().min(6),
    categoryId: z.string().uuid().optional(),
});

export const cityPriceDto = z.object({
    cityId: z.string().uuid(),
    pricePaise: z.number().int(),
});

export const mapAddonDto = z.object({
    addonId: z.string().uuid(),
});
