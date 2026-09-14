import { api, unwrap } from "@/api/api";

export function listOrders(params = {}) {
  return api.get("/orders", { params }).then(unwrap);
}

export function createOrder(body) {
  return api.post("/orders", body).then(unwrap);
}

export function getOrder(id) {
  return api.get(`/orders/${id}`).then(unwrap);
}
