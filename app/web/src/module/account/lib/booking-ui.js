import { format } from "date-fns";

export function formatBookingSlot(iso) {
  if (!iso) return "To be confirmed";
  try {
    return format(new Date(iso), "EEE d MMM, h a");
  } catch {
    return "To be confirmed";
  }
}

const STATUS_LABELS = {
  DRAFT: "Draft",
  PENDING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Confirmed",
  ASSIGNED: "Decorator assigned",
  EN_ROUTE: "On the way",
  ON_SITE: "On site",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
};

export function bookingStatusLabel(status) {
  return STATUS_LABELS[status] ?? String(status ?? "").replace(/_/g, " ");
}

export function bookingStatusTone(status) {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "muted";
    case "DISPUTED":
      return "warning";
    case "ASSIGNED":
    case "EN_ROUTE":
    case "ON_SITE":
      return "active";
    default:
      return "neutral";
  }
}

export function isUpcomingBooking(booking) {
  if (!booking) return false;
  if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
    return false;
  }
  const slot = new Date(booking.scheduledAt).getTime();
  return Number.isFinite(slot) && slot >= Date.now();
}

export const BOOKING_TIMELINE = [
  { key: "CONFIRMED", label: "Booking confirmed" },
  { key: "ASSIGNED", label: "Decorator assigned" },
  { key: "EN_ROUTE", label: "On the way" },
  { key: "ON_SITE", label: "Setup in progress" },
  { key: "COMPLETED", label: "Complete" },
];

const TIMELINE_RANK = {
  CONFIRMED: 0,
  ASSIGNED: 1,
  EN_ROUTE: 2,
  ON_SITE: 3,
  COMPLETED: 4,
  DISPUTED: 3,
  CANCELLED: -1,
  PENDING_PAYMENT: -1,
  DRAFT: -1,
};

export function bookingTimelineIndex(status) {
  return TIMELINE_RANK[status] ?? 0;
}
