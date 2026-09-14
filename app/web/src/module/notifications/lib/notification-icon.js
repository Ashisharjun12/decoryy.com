import {
  BellIcon,
  CalendarCheckIcon,
  MessageCircleIcon,
  PackageIcon,
  TruckIcon,
} from "lucide-react"

export function getNotificationIcon(event) {
  switch (event) {
    case "CHAT_MESSAGE":
      return MessageCircleIcon
    case "BOOKING_CONFIRMED":
      return CalendarCheckIcon
    case "VENDOR_NEW_JOB":
    case "BOOKING_ASSIGNED":
      return PackageIcon
    case "VENDOR_ON_THE_WAY":
      return TruckIcon
    default:
      return BellIcon
  }
}
