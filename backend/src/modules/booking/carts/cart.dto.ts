import { z } from "zod";

export const addCartItemDto = z.object({
    productId: z.string().uuid(),
    addonIds: z.array(z.string().uuid()).optional(),
    quantity: z.number().int().positive().max(20).optional(),
    cityId: z.string().uuid().optional(),
    pincode: z.string().min(6).max(6).optional(),
    scheduledAt: z.string().datetime().optional().nullable(),
});

export const patchCartItemDto = z.object({
    quantity: z.number().int().positive().max(20),
});

export const cartItemIdParamsDto = z.object({
    id: z.string().uuid(),
});

export const cartLocationDto = z
    .object({
        pincode: z.string().min(6).max(6).optional(),
        cityId: z.string().uuid().optional(),
    })
    .refine((value) => Boolean(value.pincode?.trim()) || Boolean(value.cityId), {
        message: "pincode or cityId is required",
        path: ["pincode"],
    });
