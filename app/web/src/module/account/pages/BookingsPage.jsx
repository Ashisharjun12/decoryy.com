import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiError } from "@/api/api";
import { listOrders } from "@/api/orders.api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountPageTitle } from "@/module/account/components/AccountPageTitle";
import {
  BookingCard,
  BookingCardSkeleton,
} from "@/module/account/components/BookingCard";
import { filterOrdersByTab } from "@/module/account/lib/booking-ui";

const ORDER_TABS = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const EMPTY_COPY = {
  all: {
    title: "No orders yet",
    body: "When you book a decoration, it will show up here.",
  },
  upcoming: {
    title: "No upcoming orders",
    body: "Active bookings will appear here.",
  },
  completed: {
    title: "No completed orders",
    body: "Finished setups will appear here.",
  },
  cancelled: {
    title: "No cancelled orders",
    body: "Cancelled bookings will appear here.",
  },
};

function OrdersEmpty({ tab }) {
  const copy = EMPTY_COPY[tab] ?? EMPTY_COPY.all;
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <p className="font-heading text-lg font-semibold tracking-tight">{copy.title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{copy.body}</p>
      <Button asChild className="mt-6">
        <Link to="/decorations">Browse decorations</Link>
      </Button>
    </div>
  );
}

export function BookingsPage() {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("all");

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

  return (
    <div className="w-full max-w-none">
      <AccountPageTitle>My Orders</AccountPageTitle>

      <Tabs value={tab} onValueChange={setTab} className="mt-8 gap-6">
        <TabsList variant="line" className="h-auto w-full justify-start gap-6 rounded-none border-b border-border bg-transparent p-0">
          {ORDER_TABS.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 pt-0 shadow-none data-active:border-foreground data-active:bg-transparent data-active:shadow-none"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {ORDER_TABS.map((item) => {
          const filtered = filterOrdersByTab(items, item.value);
          return (
          <TabsContent key={item.value} value={item.value} className="mt-0">
            {status === "loading" ? (
              <div className="flex flex-col gap-3">
                <BookingCardSkeleton />
                <BookingCardSkeleton />
              </div>
            ) : null}

            {status === "error" ? (
              <p className="text-sm text-destructive">{error || "Could not load orders."}</p>
            ) : null}

            {status === "ready" && !filtered.length ? <OrdersEmpty tab={item.value} /> : null}

            {status === "ready" && filtered.length ? (
              <div className="flex flex-col gap-5">
                {filtered.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : null}
          </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
