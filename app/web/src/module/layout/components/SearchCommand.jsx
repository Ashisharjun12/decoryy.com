import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import { categoryPath, productPath } from "@/lib/catalog-path";
import { listTopLevelCategories } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { DEMO_PRODUCTS } from "@/module/home/data/demo-products";
import { useCatalogStore } from "@/store/catalog.store";

function isMacPlatform() {
  if (typeof navigator === "undefined") return false;
  return /mac/i.test(navigator.userAgent);
}

export function SearchCommand({ variant = "bar" }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const categories = useCatalogStore((s) => s.categories);
  const items = useMemo(() => {
    const occasions = listTopLevelCategories(categories).map((category) => ({
      id: category.id,
      title: category.name,
      href: categoryPath(category),
      group: "Occasions",
    }));
    const products = DEMO_PRODUCTS.map((product) => ({
      id: product.id,
      title: product.name,
      href: productPath(product),
      group: "Setups",
    }));
    return [...occasions, ...products];
  }, [categories]);
  const shortcut = isMacPlatform() ? "⌘K" : "Ctrl K";

  useEffect(() => {
    if (variant !== "bar") return undefined;
    function onKey(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return [...map.entries()];
  }, [items]);

  const dialog = (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Search occasions and setups"
    >
      <Command>
        <CommandInput placeholder="Search themes, balloons…" />
        <CommandList>
          <CommandEmpty>No matching setup.</CommandEmpty>
          {grouped.map(([group, groupItems]) => (
            <CommandGroup key={group} heading={group}>
              {groupItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${group} ${item.title}`}
                  onSelect={() => {
                    setOpen(false);
                    navigate(item.href);
                  }}
                >
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );

  if (variant === "icon") {
    return (
      <>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(true)}
        >
          <SearchIcon />
          <span className="sr-only">Search</span>
        </Button>
        {dialog}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-10 w-full items-center gap-2.5 rounded-full border border-border bg-card px-4 text-left text-[13.5px] text-muted-foreground transition-shadow hover:shadow-sm",
        )}
      >
        <SearchIcon className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">Search themes, balloons…</span>
        <Kbd className="hidden sm:inline-flex">{shortcut}</Kbd>
      </button>
      {dialog}
    </>
  );
}
