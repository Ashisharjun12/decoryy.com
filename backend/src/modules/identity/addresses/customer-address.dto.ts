import { z } from "zod";

const pincodeSchema = z
    .string()
    .trim()
    .regex(/^\d{6}$/, "pincode must be 6 digits");

export const customerAddressIdParamsDto = z.object({
    id: z.string().uuid(),
});

export const createCustomerAddressDto = z.object({
    label: z.string().trim().min(1).max(80),
    address: z.string().trim().min(6).max(500),
    landmark: z.string().trim().max(200).optional(),
    pincode: pincodeSchema,
    cityName: z.string().trim().min(1).max(120).optional(),
    cityId: z.string().uuid().optional(),
    setDefault: z.boolean().optional(),
});

export const patchCustomerAddressDto = z.object({
    label: z.string().trim().min(1).max(80).optional(),
    address: z.string().trim().min(6).max(500).optional(),
    landmark: z.string().trim().max(200).nullable().optional(),
    pincode: pincodeSchema.optional(),
    cityName: z.string().trim().min(1).max(120).optional(),
    cityId: z.string().uuid().nullable().optional(),
    setDefault: z.boolean().optional(),
});

export type CreateCustomerAddressInput = z.infer<typeof createCustomerAddressDto>;
export type PatchCustomerAddressInput = z.infer<typeof patchCustomerAddressDto>;
