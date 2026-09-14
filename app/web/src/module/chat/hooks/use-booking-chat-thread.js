import { useCallback } from "react"
import { getBookingConversation } from "@/api/chat.api"
import { useChatThreadCore } from "@/module/chat/hooks/use-chat-thread-core"

export function useBookingChatThread(orderId) {
  const resolveConversation = useCallback(
    () => getBookingConversation(orderId),
    [orderId],
  )

  return useChatThreadCore({
    enabled: Boolean(orderId),
    resolveConversation,
    senderRole: "customer",
  })
}
