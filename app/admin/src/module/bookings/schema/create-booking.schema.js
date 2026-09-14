import { z } from "zod";

const indianMobile = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

export const createBookingSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "Name is required").max(120),
    phone: indianMobile,
    email: z.union([z.literal(""), z.string().trim().email("Invalid email")]).optional(),
  }),
  delivery: z.object({
    pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
    address: z.string().trim().min(6, "Address is required").max(500),
    landmark: z.string().trim().max(200).optional(),
    cityId: z.string().uuid("Select a city when choosing a package"),
  }),
  scheduledAt: z.string().min(1, "Pick a setup date and time"),
  productId: z.string().uuid("Select a package"),
  quantity: z.coerce.number().int().min(1).max(10).default(1),
  addonIds: z.array(z.string().uuid()).default([]),
  paymentMethod: z.enum(["prepaid", "cod"]),
  adminNotes: z.string().trim().max(500).optional(),
});

export function toCreateBookingPayload(values, idempotencyKey) {
  const scheduledAt = new Date(values.scheduledAt).toISOString();
  const email = values.customer.email?.trim();

  return {
    customer: {
      name: values.customer.name.trim(),
      phone: values.customer.phone.trim(),
      ...(email ? { email } : {}),
    },
    delivery: {
      pincode: values.delivery.pincode.trim(),
      address: values.delivery.address.trim(),
      cityId: values.delivery.cityId,
      ...(values.delivery.landmark?.trim()
        ? { landmark: values.delivery.landmark.trim() }
        : {}),
    },
    scheduledAt,
    items: [
      {
        productId: values.productId,
        quantity: values.quantity,
        addonIds: values.addonIds ?? [],
      },
    ],
    paymentMethod: values.paymentMethod,
    ...(values.adminNotes?.trim() ? { adminNotes: values.adminNotes.trim() } : {}),
    idempotencyKey,
  };
}
