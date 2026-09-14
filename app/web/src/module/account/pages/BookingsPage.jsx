import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getApiError } from "@/api/api";
import { listOrders } from "@/api/orders.api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  BookingCard,
  BookingCardSkeleton,
} from "@/module/account/components/BookingCard";
import { isUpcomingBooking } from "@/module/account/lib/booking-ui";

function BookingSection({ title, items }) {
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-sm font-semibold tracking-tight text-muted-foreground uppercase">
        {title}
      </h2>
      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </section>
  );
}

export function BookingsPage() {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    void listOrders({ page: 1, limit: 50 })
      .then((data) => {
        if (cancelled) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
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
  }, []);

  const { upcoming, past } = useMemo(() => {
    const nextUpcoming = [];
    const nextPast = [];
    for (const booking of items) {
      if (isUpcomingBooking(booking)) {
        nextUpcoming.push(booking);
      } else {
        nextPast.push(booking);
      }
    }
    return { upcoming: nextUpcoming, past: nextPast };
  }, [items]);

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">Bookings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upcoming setups and past decoration bookings.
        </p>
      </div>

      {status === "loading" ? (
        <div className="flex flex-col gap-3">
          <BookingCardSkeleton />
          <BookingCardSkeleton />
        </div>
      ) : null}

      {status === "error" ? (
        <p className="text-sm text-destructive">{error || "Could not load bookings."}</p>
      ) : null}

      {status === "ready" && !items.length ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="font-heading text-lg font-semibold tracking-tight">No bookings yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            When you book a decoration, it will show up here.
          </p>
          <Button asChild className="mt-6">
            <Link to="/decorations">Browse decorations</Link>
          </Button>
        </div>
      ) : null}

      {status === "ready" && items.length ? (
        <div className="flex flex-col gap-8">
          <BookingSection title="Upcoming" items={upcoming} />
          <BookingSection title="Past" items={past} />
        </div>
      ) : null}
    </div>
  );
}
