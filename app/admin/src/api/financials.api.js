import { api, unwrap } from "@/api/api"

export function getOrderFinancials(orderId) {
  return api.get(`/admin/financials/orders/${orderId}`).then(unwrap)
}

export function getPlatformRevenue() {
  return api.get("/admin/financials/revenue").then(unwrap)
}
