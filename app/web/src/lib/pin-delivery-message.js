import { getApiError } from "@/api/api";

export const NOT_DELIVERABLE_MESSAGE = "We don't deliver to this address.";

export function pinResolveErrorMessage(err) {
  const raw = getApiError(err);
  if (!raw) return NOT_DELIVERABLE_MESSAGE;
  const lower = raw.toLowerCase();
  if (lower.includes("serviceable") || lower.includes("not deliver") || lower.includes("pincode")) {
    return NOT_DELIVERABLE_MESSAGE;
  }
  return raw;
}
