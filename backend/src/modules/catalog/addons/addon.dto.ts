import { z } from "zod";

export const createAddonDto = z.object({
    name: z.string().min(2),
    slug: z.string().min(2).optional(),
    imageUploadId: z.string().uuid().nullable().optional(),
    isActive: z.boolean().optional(),
});

export const patchAddonDto = z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    imageUploadId: z.string().uuid().nullable().optional(),
    isActive: z.boolean().optional(),
});

export const addonIdParamsDto = z.object({
    id: z.string().uuid(),
});

export const adminAddonListQueryDto = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    q: z.string().optional(),
    isActive: z.enum(["true", "false"]).optional(),
});

export const addonCityPriceDto = z.object({
    cityId: z.string().uuid(),
    pricePaise: z.number().int(),
});
