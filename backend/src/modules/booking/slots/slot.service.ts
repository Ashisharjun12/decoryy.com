import { ApiError } from "@/shared/errors/apiError.js";

/** Minimum lead time before a scheduled slot can be booked. */
export const MIN_LEAD_MS = 2 * 60 * 60 * 1000;

export function assertBookableSlot(scheduledAt: Date | null | undefined): void {
    if (!scheduledAt) {
        throw ApiError.badRequest("pick a date and time on the product page");
    }
    const minStart = Date.now() + MIN_LEAD_MS;
    if (scheduledAt.getTime() <= minStart) {
        throw ApiError.badRequest("slot too soon or in the past");
    }
}
