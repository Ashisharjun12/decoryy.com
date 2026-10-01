export class OnlinePaymentIncompleteError extends Error {
  readonly orderId: string;
  readonly userCancelled: boolean;

  constructor(orderId: string, message: string, userCancelled = false) {
    super(message);
    this.name = 'OnlinePaymentIncompleteError';
    this.orderId = orderId;
    this.userCancelled = userCancelled;
  }
}

export function isPaymentCancelledMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('cancel') ||
    lower.includes('dismissed') ||
    lower.includes('user closed')
  );
}
