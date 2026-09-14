import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getOrder } from "@/api/orders.api"
import { AccountChatPanel } from "@/module/chat/components/AccountChatPanel"
import { ChatThreadView } from "@/module/chat/components/ChatThreadView"
import { useBookingChatThread } from "@/module/chat/hooks/use-booking-chat-thread"

const READ_ONLY_ORDER_STATUSES = new Set(["COMPLETED", "CANCELLED"])

export function BookingChatPage() {
  const { orderId } = useParams()
  const thread = useBookingChatThread(orderId)
  const [orderStatus, setOrderStatus] = useState(null)

  useEffect(() => {
    if (!orderId) return
    void getOrder(orderId)
      .then((order) => setOrderStatus(order.status))
      .catch(() => {})
  }, [orderId])

  const vendorParticipant = thread.conversation?.participants?.find((p) => p.role === "vendor")
  const title = vendorParticipant?.name || "Decorator"
  const subtitle = thread.conversation?.orderRef
    ? `Order ${thread.conversation.orderRef}`
    : undefined

  const chatClosed =
    (orderStatus && READ_ONLY_ORDER_STATUSES.has(orderStatus)) ||
    thread.conversation?.status === "closed"

  return (
    <AccountChatPanel
      backTo={`/account/bookings/${orderId}`}
      title={title}
      subtitle={subtitle}
      peerOnline={vendorParticipant?.isOnline}
    >
      {chatClosed ? (
        <div className="shrink-0 border-b border-border bg-muted/50 px-4 py-2.5">
          <p className="text-center text-sm text-muted-foreground">
            Chat is closed for this booking. You can still read past messages.
          </p>
        </div>
      ) : null}
      <ChatThreadView
        {...thread}
        ownRole="customer"
        placeholder="Message your decorator..."
        composerDisabled={chatClosed}
      />
    </AccountChatPanel>
  )
}
