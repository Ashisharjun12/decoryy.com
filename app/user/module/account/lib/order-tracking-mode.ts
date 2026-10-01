import type { OrderStatus, PublicOrder } from '@/api/orders.api';

const TRACKING_LAYOUT_STATUSES = new Set<OrderStatus>(['ASSIGNED', 'EN_ROUTE', 'ON_SITE']);

export function isOrderTrackingLayout(order: PublicOrder | undefined): boolean {
  if (!order) return false;
  return TRACKING_LAYOUT_STATUSES.has(order.status);
}
