import { Link } from "react-router-dom";
import {
  CalendarDaysIcon,
  LogOutIcon,
  SettingsIcon,
  UserRoundIcon,
} from "lucide-react";
import { logout } from "@/api/auth.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const MENU_LINKS = [
  { label: "Profile", href: "/account", icon: UserRoundIcon },
  { label: "Bookings", href: "/bookings", icon: CalendarDaysIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return "U";
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function firstName(name = "") {
  return name.trim().split(/\s+/).filter(Boolean)[0] || "Account";
}

export function UserMenu({ className, variant = "header", onNavigate }) {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  if (!user) {
    return null;
  }

  async function onLogout() {
    try {
      await logout();
    } catch {
      // still clear local session
    }
    clear();
    onNavigate?.();
  }

  const name = user.name || "Account";

  if (variant === "sheet") {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <div className="flex items-center gap-3 rounded-2xl bg-muted/60 px-3 py-2.5">
          <Avatar size="sm">
            {user.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name}</p>
            {user.email ? (
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            ) : null}
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {MENU_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onNavigate}
                className="flex cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium hover:bg-muted"
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button variant="destructive" onClick={onLogout}>
          <LogOutIcon className="size-4" />
          Logout
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "hidden h-10 cursor-pointer rounded-full border-border pr-3 pl-2 sm:inline-flex",
              className,
            )}
          />
        }
      >
        <Avatar size="sm" className="size-[26px]">
          {user.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
          <AvatarFallback className="bg-linear-to-br from-primary to-rose-400 text-[10px] text-primary-foreground">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <span className="max-w-[8rem] truncate">{firstName(name)}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal text-foreground">
            <span className="block truncate text-sm font-medium">{name}</span>
            {user.email ? (
              <span className="block truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            ) : null}
            {!user.phone ? (
              <Link
                to="/account"
                className="mt-0.5 block text-xs font-medium text-primary hover:underline"
              >
                Add phone for bookings
              </Link>
            ) : null}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {MENU_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem
                key={item.href}
                className="cursor-pointer"
                render={<Link to={item.href} />}
              >
                <Icon />
                {item.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer"
            onClick={onLogout}
          >
            <LogOutIcon />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
