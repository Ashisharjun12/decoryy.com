import { Link } from "react-router-dom";
import { CameraIcon, PlayIcon, Share2Icon } from "lucide-react";
import { categoryPath } from "@/lib/catalog-path";
import { DecoryLogo } from "@/components/decory-logo";
import { DEMO_OCCASIONS } from "@/module/home/data/demo-categories";

const COMPANY = [
  { label: "About Decoryy", href: "/support" },
  { label: "Careers", href: "/support" },
  { label: "Become a partner", href: "/support" },
  { label: "Press", href: "/support" },
];

const SUPPORT = [
  { label: "Help centre", href: "/support" },
  { label: "Track order", href: "/support" },
  { label: "Cancellation policy", href: "/support" },
  { label: "Contact us", href: "/support" },
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", icon: CameraIcon },
  { label: "Facebook", href: "https://facebook.com", icon: Share2Icon },
  { label: "YouTube", href: "https://youtube.com", icon: PlayIcon },
];

function FooterLinks({ title, items }) {
  return (
    <div>
      <h5 className="mb-4 text-sm font-semibold text-foreground">{title}</h5>
      <ul className="space-y-2.5 text-sm">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              to={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-background text-foreground">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 px-4 pt-14 pb-12 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <DecoryLogo />
            <span className="font-heading text-[21px] font-extrabold tracking-tight">
              Decoryy
            </span>
          </div>
          <p className="mt-3.5 mb-5 max-w-[280px] text-sm leading-relaxed text-muted-foreground">
            City-priced decoration setups — balloons, backdrops, and lights,
            dressed for the room you have.
          </p>
          <div className="flex items-center gap-3.5">
            {SOCIALS.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-foreground/80 transition-colors hover:text-foreground"
                  aria-label={item.label}
                >
                  <Icon className="size-4" />
                </a>
              );
            })}
          </div>
        </div>
        <FooterLinks
          title="Explore"
          items={DEMO_OCCASIONS.map((category) => ({
            label: category.name,
            href: categoryPath(category),
          }))}
        />
        <FooterLinks title="Support" items={SUPPORT} />
        <FooterLinks title="Company" items={COMPANY} />
      </div>
      <div className="relative overflow-hidden border-t border-border">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-heading text-[clamp(4.5rem,18vw,9rem)] leading-none font-extrabold tracking-tight text-transparent select-none [-webkit-text-stroke:1px_var(--border)]"
        >
          Decoryy
        </span>
        <div className="relative z-10 mx-auto flex max-w-[1240px] min-h-[5.5rem] flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground md:min-h-[7rem] md:px-8">
          <span>© {new Date().getFullYear()} Decoryy</span>
          <span>All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
