import { api, unwrap } from '@/api/client';

export type CreateOrderBody = {
  customer: { name: string; phone: string; email: string };
  delivery: {
    pincode: string;
    address: string;
    landmark?: string;
    cityId: string;
    latitude?: number;
    longitude?: number;
  };
  paymentMethod: 'cod' | 'online';
  idempotencyKey: string;
};

export function createOrder(body: CreateOrderBody) {
  return api.post('/orders', body).then(unwrap);
}

export function getOrder(id: string) {
  return api.get(`/orders/${id}`).then(unwrap);
}
