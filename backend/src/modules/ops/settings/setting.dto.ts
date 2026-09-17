import { z } from "zod";

export const patchNotificationChannelsDto = z
    .object({
        sms: z.boolean().optional(),
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        inApp: z.boolean().optional(),
        whatsapp: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
        message: "at least one channel is required",
    });

export const patchPaymentMethodsDto = z
    .object({
        razorpay: z.boolean().optional(),
        cashfree: z.boolean().optional(),
        cod: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
        message: "at least one payment method is required",
    });

export const patchPayoutPolicyDto = z
    .object({
        platformCommissionPercent: z.number().min(0).max(50).optional(),
        codMaxDuePaise: z.number().int().min(0).optional(),
        settlementHoldDays: z.number().int().min(0).max(30).optional(),
        autoNetCodFromEarnings: z.boolean().optional(),
        minWithdrawalPaise: z.number().int().min(0).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
        message: "at least one payout policy field is required",
    });

export const patchBookingPolicyDto = z
    .object({
        acceptingBookings: z.boolean().optional(),
        operatingHoursStart: z
            .string()
            .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
            .optional(),
        operatingHoursEnd: z
            .string()
            .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
            .optional(),
        minLeadHours: z.number().int().min(0).max(72).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
        message: "at least one booking policy field is required",
    });
