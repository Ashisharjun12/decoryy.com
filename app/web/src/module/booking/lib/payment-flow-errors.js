export class OnlinePaymentIncompleteError extends Error {
  constructor(orderId, message, userCancelled = false) {
    super(message);
    this.name = "OnlinePaymentIncompleteError";
    this.orderId = orderId;
    this.userCancelled = userCancelled;
  }
}

export function isPaymentCancelledMessage(message) {
  const lower = String(message).toLowerCase();
  return lower.includes("cancel") || lower.includes("dismissed") || lower.includes("user closed");
}
