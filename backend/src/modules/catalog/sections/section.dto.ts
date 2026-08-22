import { z } from "zod";

export const publicSectionListQueryDto = z
    .object({
        pincode: z.string().min(6).optional(),
        cityId: z.string().uuid().optional(),
    })
    .refine((query) => Boolean(query.pincode) || Boolean(query.cityId), {
        message: "pincode or cityId is required",
    });

export const createSectionDto = z.object({
    name: z.string().min(2),
    slug: z.string().min(2).optional(),
    sortIndex: z.number().int().optional(),
    isActive: z.boolean().optional(),
});

export const patchSectionDto = z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    sortIndex: z.number().int().optional(),
    isActive: z.boolean().optional(),
});

export const sectionIdParamsDto = z.object({
    id: z.string().uuid(),
});

export const sectionCityOverrideParamsDto = z.object({
    id: z.string().uuid(),
    cityId: z.string().uuid(),
});

export const adminSectionProductsQueryDto = z.object({
    cityId: z.string().uuid().optional(),
});

export const putSectionProductsDto = z.object({
    cityId: z.string().uuid().nullable(),
    productIds: z
        .array(z.string().uuid())
        .max(24)
        .refine((ids) => new Set(ids).size === ids.length, {
            message: "productIds must be unique",
        }),
});
