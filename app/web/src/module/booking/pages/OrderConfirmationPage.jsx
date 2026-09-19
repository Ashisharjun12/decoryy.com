import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeftIcon } from "lucide-react";
import { getApiError } from "@/api/api";
import { getOrder } from "@/api/orders.api";
import { Button } from "@/components/ui/button";
import { OrderConfirmationHero } from "@/module/booking/components/OrderConfirmationHero";
import { OrderConfirmationReceipt } from "@/module/booking/components/OrderConfirmationReceipt";
import { OrderConfirmationSkeleton } from "@/module/booking/components/OrderConfirmationSkeleton";

const SUMMARY_ASIDE_CLASS =
  "order-2 border-t border-border/60 bg-primary/12 px-6 py-8 dark:bg-primary/10 lg:order-2 lg:min-h-[calc(100dvh-4.5rem)] lg:border-t-0 lg:border-l lg:border-border/60 lg:px-8 lg:py-10 lg:sticky lg:top-[4.5rem] lg:self-start";

function ConfirmationTopBar() {
  return (
    <div className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-[1400px] px-6 py-4 lg:px-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
        >
          <ChevronLeftIcon className="size-4" aria-hidden />
          Home
        </Link>
      </div>
    </div>
  );
}

export function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      setError("Missing booking reference");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    void getOrder(orderId)
      .then((data) => {
        if (cancelled) return;
        setOrder(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getApiError(err));
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (status === "loading") {
    return (
      <div className="flex flex-col">
        <ConfirmationTopBar />
        <div className="mx-auto w-full max-w-[1400px]">
          <OrderConfirmationSkeleton />
        </div>
      </div>
    );
  }

  if (status === "error" || !order) {
    return (
      <div className="flex flex-col">
        <ConfirmationTopBar />
        <div className="mx-auto w-full max-w-lg px-6 py-12 lg:px-10">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Booking not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || "We couldn't load this booking."}
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ConfirmationTopBar />

      <div className="mx-auto grid w-full max-w-[1400px] lg:grid-cols-2">
        <div className="order-1 min-w-0 bg-background px-6 py-8 lg:px-10 lg:py-14">
          <OrderConfirmationHero order={order} />
        </div>
        <aside className={SUMMARY_ASIDE_CLASS}>
          <OrderConfirmationReceipt order={order} />
        </aside>
      </div>
    </div>
  );
}
