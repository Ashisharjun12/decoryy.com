import type { CouponLike } from '@/module/booking/lib/coupon-preview';

export type CartAddonLine = {
  id: string;
  name: string;
  quantity: number;
  pricePaise: number | null;
  imageUrl?: string | null;
};

export type CartItemLine = {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  lineTotalPaise: number;
  imageUrl?: string | null;
  addons?: CartAddonLine[];
  paymentCod?: boolean;
  paymentOnline?: boolean;
};

export type CartSnapshot = {
  id: string | null;
  cityId: string | null;
  pincode: string | null;
  scheduledAt: string | null;
  fulfillmentType?: 'instant' | 'scheduled' | string | null;
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
  itemCount: number;
  subtotalPaise: number;
  discountPaise: number;
  totalPaise: number;
  appliedCoupon: CouponLike | null;
  items: CartItemLine[];
};

export const emptyCart: CartSnapshot = {
  id: null,
  cityId: null,
  pincode: null,
  scheduledAt: null,
  fulfillmentType: null,
  deliveryLatitude: null,
  deliveryLongitude: null,
  itemCount: 0,
  subtotalPaise: 0,
  discountPaise: 0,
  totalPaise: 0,
  appliedCoupon: null,
  items: [],
};

export function normalizeCart(raw: unknown): CartSnapshot {
  if (!raw || typeof raw !== 'object') return emptyCart;
  const c = raw as Record<string, unknown>;
  const items = Array.isArray(c.items) ? (c.items as CartItemLine[]) : [];
  return {
    id: (c.id as string) ?? null,
    cityId: (c.cityId as string) ?? null,
    pincode: c.pincode != null ? String(c.pincode) : null,
    scheduledAt: (c.scheduledAt as string) ?? null,
    fulfillmentType: (c.fulfillmentType as string) ?? null,
    deliveryLatitude: c.deliveryLatitude as number | null | undefined ?? null,
    deliveryLongitude: c.deliveryLongitude as number | null | undefined ?? null,
    itemCount: Number(c.itemCount) || items.length,
    subtotalPaise: Number(c.subtotalPaise) || 0,
    discountPaise: Number(c.discountPaise) || 0,
    totalPaise: Number(c.totalPaise) || Number(c.subtotalPaise) || 0,
    appliedCoupon: (c.appliedCoupon as CouponLike) ?? null,
    items,
  };
}
