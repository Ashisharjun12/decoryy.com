import { CheckIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function IncludedList({ items }) {
  if (!items.length) {
    return <p className="text-muted-foreground">Details coming soon</p>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((point, index) => (
        <li key={`${index}-${point}`} className="flex gap-2">
          <span
            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-600 dark:text-emerald-400"
          >
            <CheckIcon className="size-3.5" />
          </span>
          <span className="text-sm">{point}</span>
        </li>
      ))}
    </ul>
  );
}

function BulletList({ items }) {
  if (!items.length) {
    return <p className="text-muted-foreground">Details coming soon</p>;
  }
  return (
    <ul className="list-disc space-y-2 pl-5 text-sm">
      {items.map((point, index) => (
        <li key={`${index}-${point}`}>{point}</li>
      ))}
    </ul>
  );
}

function FaqList({ items }) {
  if (!items.length) {
    return <p className="text-muted-foreground">Details coming soon</p>;
  }
  return (
    <Accordion multiple className="rounded-none border-none">
      {items.map((item, index) => (
        <AccordionItem
          key={item.key || `${index}-${item.question}`}
          value={item.key || String(index)}
          className="mb-2 rounded-2xl border-none bg-muted last:mb-0 data-open:bg-muted"
        >
          <AccordionTrigger className="text-foreground hover:no-underline">
            {item.question.trim()}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p className="whitespace-pre-wrap text-sm">{item.answer.trim()}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function ProductPdpDetailPanel({
  tab,
  includePoints,
  faqItems,
  deliveryPoints,
  carePoints,
}) {
  if (tab === "includes") return <IncludedList items={includePoints} />;
  if (tab === "faqs") return <FaqList items={faqItems} />;
  if (tab === "delivery") return <BulletList items={deliveryPoints} />;
  return <BulletList items={carePoints} />;
}
