import { z } from 'zod';

export const registerLocationSchema = z.object({
  state: z.string().min(1, 'Select a state'),
  cityId: z.string().min(1, 'Select a city'),
  shopAddress: z.string().trim().min(10, 'Enter your shop address'),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit pincode'),
  shopImageUri: z.string().optional(),
});

export type RegisterLocationFormValues = z.infer<typeof registerLocationSchema>;
