import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Link, useParams } from "react-router-dom";
import { getApiError } from "@/api/api";
import { getOrder } from "@/api/orders.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { formatPaise } from "@/lib/money";

function formatSlot(iso) {
  if (!iso) return "To be confirmed";
  try {
    return format(new Date(iso), "EEE d MMM, h a");
  } catch {
    return "To be confirmed";
  }
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
      <div className="flex min-h-64 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (status === "error" || !order) {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 py-8 md:px-8 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle>Booking not found</CardTitle>
            <CardDescription>{error || "We couldn’t load this booking."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">Back to home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const payLabel = order.paymentMethod === "COD" ? "Cash on delivery" : "Pay online";

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-8 md:px-8 md:py-12">
      <Card>
        <CardHeader>
          <CardTitle>Booking confirmed</CardTitle>
          <CardDescription>
            Reference <span className="font-mono text-foreground">{order.reference}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Your decoration is scheduled. We’ll assign a decorator and share updates soon.
          </p>

          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium capitalize">{order.status.toLowerCase().replace(/_/g, " ")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Setup slot</dt>
              <dd className="font-medium">{formatSlot(order.scheduledAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="font-medium">
                {order.delivery.cityName} · {order.delivery.pincode}
              </dd>
              <dd className="whitespace-pre-wrap text-muted-foreground">{order.delivery.address}</dd>
              {order.delivery.landmark ? (
                <dd className="text-muted-foreground">Landmark: {order.delivery.landmark}</dd>
              ) : null}
            </div>
            <div>
              <dt className="text-muted-foreground">Payment</dt>
              <dd className="font-medium">{payLabel}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Total</dt>
              <dd className="text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatPaise(order.subtotalPaise ?? 0)}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to={`/account/bookings/${order.id}`}>View booking</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Continue shopping</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/decorations">Browse decorations</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
