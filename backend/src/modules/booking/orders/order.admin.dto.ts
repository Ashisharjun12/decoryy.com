import { z } from "zod";

const indianMobile = z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "invalid phone number");

export const adminCreateOrderDto = z.object({
    customer: z.object({
        name: z.string().trim().min(2).max(120),
        phone: indianMobile,
        email: z.string().trim().email().max(254).optional(),
    }),
    delivery: z.object({
        pincode: z.string().trim().regex(/^\d{6}$/),
        address: z.string().trim().min(6).max(500),
        landmark: z.string().trim().max(200).optional(),
        cityId: z.string().uuid(),
    }),
    scheduledAt: z.string().datetime({ offset: true }),
    items: z
        .array(
            z.object({
                productId: z.string().uuid(),
                quantity: z.coerce.number().int().min(1).max(10),
                addonIds: z.array(z.string().uuid()).default([]),
            }),
        )
        .min(1)
        .max(5),
    paymentMethod: z.enum(["prepaid", "cod"]),
    adminNotes: z.string().trim().max(500).optional(),
    idempotencyKey: z.string().trim().min(8).max(128),
});

export type AdminCreateOrderInput = z.infer<typeof adminCreateOrderDto>;
