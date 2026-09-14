import { api, unwrap } from "@/api/api"

export function getNotificationChannels() {
  return api.get("/admin/settings/notifications").then(unwrap)
}

export function patchNotificationChannels(payload) {
  return api.patch("/admin/settings/notifications", payload).then(unwrap)
}

export function listNotificationTemplates() {
  return api.get("/admin/notification-templates").then(unwrap)
}

export function patchNotificationTemplate(id, payload) {
  return api.patch(`/admin/notification-templates/${id}`, payload).then(unwrap)
}

export function createNotificationTemplateVersion(id, payload) {
  return api.post(`/admin/notification-templates/${id}/versions`, payload).then(unwrap)
}

export function getPaymentMethods() {
  return api.get("/admin/settings/payments").then(unwrap)
}

export function patchPaymentMethods(payload) {
  return api.patch("/admin/settings/payments", payload).then(unwrap)
}

export function getPayoutPolicy() {
  return api.get("/admin/settings/payout-policy").then(unwrap)
}

export function patchPayoutPolicy(payload) {
  return api.patch("/admin/settings/payout-policy", payload).then(unwrap)
}
