import { useState } from "react";
import { Link } from "react-router-dom";
import { MenuIcon } from "lucide-react";
import { categoryPath } from "@/lib/catalog-path";
import {
  listTopLevelCategories,
  resolveCategoryIcon,
} from "@/lib/category-icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LocationPicker } from "@/module/layout/components/LocationPicker";
import { SearchCommand } from "@/module/layout/components/SearchCommand";
import { UserMenu } from "@/module/layout/components/UserMenu";
import { useAuthStore } from "@/store/auth.store";
import { useCatalogStore } from "@/store/catalog.store";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const setLoginOpen = useAuthStore((s) => s.setLoginOpen);
  const categories = useCatalogStore((s) => s.categories);
  const topLevel = listTopLevelCategories(categories);

  function close() {
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden" />
        }
      >
        <MenuIcon />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[20rem] p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100dvh-5rem)]">
          <div className="flex flex-col gap-4 p-4">
            <SearchCommand />
            <LocationPicker />
            <nav className="flex flex-col gap-1">
              {topLevel.map((category) => {
                const { Icon, iconBg } = resolveCategoryIcon({
                  iconKey: category.iconKey,
                  iconTone: category.iconTone,
                  slug: category.slug,
                });
                return (
                  <Link
                    key={category.id}
                    to={categoryPath(category)}
                    onClick={close}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
                    >
                      <Icon className="size-4" strokeWidth={1.75} />
                    </span>
                    {category.name}
                  </Link>
                );
              })}
            </nav>
            {user ? (
              <UserMenu variant="sheet" onNavigate={close} />
            ) : (
              <Button
                className="rounded-full bg-primary text-black hover:bg-primary/85 dark:text-black"
                onClick={() => {
                  close();
                  setLoginOpen(true);
                }}
              >
                Sign in
              </Button>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
