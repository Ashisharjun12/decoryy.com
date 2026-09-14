import { NavLink } from "react-router-dom";
import {
  BellIcon,
  CalendarDaysIcon,
  LifeBuoyIcon,
  SettingsIcon,
  UserRoundIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Profile", to: "/account", icon: UserRoundIcon, end: true },
  { label: "Bookings", to: "/account/bookings", icon: CalendarDaysIcon, end: false },
  { label: "Notifications", to: "/account/notifications", icon: BellIcon, end: false },
  { label: "Settings", to: "/account/settings", icon: SettingsIcon, end: false },
  { label: "Help", to: "/account/help", icon: LifeBuoyIcon, end: false },
];

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function NavItem({ item, mobile }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          mobile ? "shrink-0 whitespace-nowrap" : "w-full",
          isActive
            ? "bg-background text-foreground shadow-sm ring-1 ring-border"
            : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      {item.label}
    </NavLink>
  );
}

export function AccountNav({ variant = "sidebar" }) {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  if (variant === "mobile") {
    return (
      <nav className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} item={item} mobile />
        ))}
      </nav>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Account
      </p>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-3">
        <Avatar size="sm">
          {user.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.name || "Account"}</p>
          {user.email ? (
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          ) : user.phone ? (
            <p className="truncate text-xs text-muted-foreground">{user.phone}</p>
          ) : null}
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </nav>
    </div>
  );
}
