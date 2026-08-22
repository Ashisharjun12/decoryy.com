import { useState } from "react";
import { Link } from "react-router-dom";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { cn } from "@/lib/utils";
import { DecoryLogo } from "@/components/decory-logo";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { CategoryBar } from "@/module/catalog/components/CategoryBar";
import { CartButton } from "@/module/layout/components/CartButton";
import { LocationPicker } from "@/module/layout/components/LocationPicker";
import { MobileNav } from "@/module/layout/components/MobileNav";
import { SearchCommand } from "@/module/layout/components/SearchCommand";
import { SupportButton } from "@/module/layout/components/SupportButton";
import { UserMenu } from "@/module/layout/components/UserMenu";
import { useAuthStore } from "@/store/auth.store";

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [compact, setCompact] = useState(false);
  const user = useAuthStore((s) => s.user);
  const setLoginOpen = useAuthStore((s) => s.setLoginOpen);

  useMotionValueEvent(scrollY, "change", (value) => {
    setCompact(value > 24);
  });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div
        className={cn(
          "mx-auto flex max-w-[1240px] items-center gap-3 px-4 transition-[padding] duration-200 md:gap-4 md:px-8",
          compact ? "py-2" : "pt-4 pb-3",
        )}
      >
        <MobileNav />
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <DecoryLogo />
          <span className="hidden font-heading text-[21px] font-extrabold tracking-tight sm:inline">
            Decoryy
          </span>
        </Link>
        <LocationPicker />
        <div className="mx-auto hidden min-w-0 max-w-[340px] flex-1 md:block">
          <SearchCommand />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          <SearchCommand variant="icon" />
          <SupportButton />
          <CartButton />
          {user ? (
            <UserMenu />
          ) : (
            <Button
              size="sm"
              className="hidden h-10 rounded-full bg-primary px-4 text-black hover:bg-primary/85 dark:text-black sm:inline-flex"
              onClick={() => setLoginOpen(true)}
            >
              Sign in
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
      <div className="hidden border-t border-border md:block">
        <div className="mx-auto max-w-[1240px] px-4 md:px-8">
          <CategoryBar />
        </div>
      </div>
    </header>
  );
}
