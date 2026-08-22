import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { productPath } from "@/lib/catalog-path";
import { formatPaise } from "@/lib/money";
import { DecoryImageFallback } from "@/components/decory-image-fallback";
import { staggerItem } from "@/lib/motion-variants";

export function HomeProductCard({ product }) {
  const [broken, setBroken] = useState(false);
  const reduce = useReducedMotion();
  const src = product.imageUrl ?? product.images?.[0]?.url;

  return (
    <motion.div
      variants={reduce ? undefined : staggerItem}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.2 }}
      className="min-w-0"
    >
      <Link
        to={productPath(product)}
        className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-card transition-shadow hover:shadow-lg"
      >
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
          {src && !broken ? (
            <img
              src={src}
              alt=""
              className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
              onError={() => setBroken(true)}
            />
          ) : (
            <DecoryImageFallback />
          )}
        </div>
        <div className="flex flex-1 flex-col px-2.5 pt-2.5 pb-3 md:px-[18px] md:pt-4 md:pb-5">
          <h3 className="line-clamp-2 min-h-[2.5em] font-heading text-[13px] leading-tight font-bold tracking-tight md:min-h-[2.6em] md:text-[16.5px] md:leading-snug">
            {product.name}
          </h3>
          <div className="mt-1.5 flex min-h-[1.25rem] items-center gap-1.5 text-[11px] text-muted-foreground md:mt-2 md:min-h-0 md:text-[13px]">
            <span className="font-bold text-amber-800 dark:text-primary">
              ★ {product.rating}
            </span>
            {product.tag ? (
              <span className="truncate rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-amber-800 md:px-2.5 md:py-1 md:text-[11px] dark:text-primary">
                {product.tag}
              </span>
            ) : null}
          </div>
          <div className="mt-auto pt-2 text-sm font-extrabold md:text-lg">
            {formatPaise(product.pricePaise)}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
