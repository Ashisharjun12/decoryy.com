import { z } from "zod";

const defaultPriceFields = {
    pricePaise: z.number().int().positive().nullable().optional(),
    compareAtPaise: z.number().int().positive().nullable().optional(),
};

function defaultPriceOk(value: { pricePaise?: number | null; compareAtPaise?: number | null }) {
    if (value.pricePaise == null || value.compareAtPaise == null) return true;
    return value.compareAtPaise >= value.pricePaise;
}

export const createProductDto = z
    .object({
        name: z.string().min(2),
        slug: z.string().min(2).optional(),
        description: z.string().optional().nullable(),
        categoryId: z.string().uuid(),
        isActive: z.boolean().optional(),
        scheduledEnabled: z.boolean().optional(),
        instantEnabled: z.boolean().optional(),
        imageUploadIds: z.array(z.string().uuid()).optional(),
        ...defaultPriceFields,
    })
    .refine(defaultPriceOk, {
        message: "compareAtPaise must be greater than or equal to pricePaise",
        path: ["compareAtPaise"],
    });

export const patchProductDto = z
    .object({
        name: z.string().min(2).optional(),
        slug: z.string().min(2).optional(),
        description: z.string().optional().nullable(),
        categoryId: z.string().uuid().optional(),
        isActive: z.boolean().optional(),
        scheduledEnabled: z.boolean().optional(),
        instantEnabled: z.boolean().optional(),
        imageUploadIds: z.array(z.string().uuid()).optional(),
        ...defaultPriceFields,
    })
    .refine(defaultPriceOk, {
        message: "compareAtPaise must be greater than or equal to pricePaise",
        path: ["compareAtPaise"],
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

export const cityPriceDto = z
    .object({
        cityId: z.string().uuid(),
        pricePaise: z.number().int().positive(),
        compareAtPaise: z.number().int().positive().nullable().optional(),
    })
    .refine((value) => value.compareAtPaise == null || value.compareAtPaise >= value.pricePaise, {
        message: "compareAtPaise must be greater than or equal to pricePaise",
        path: ["compareAtPaise"],
    });

export const productCityPriceParamsDto = z.object({
    id: z.string().uuid(),
    cityId: z.string().uuid(),
});

export const mapAddonDto = z.object({
    addonId: z.string().uuid(),
});
