import { api, unwrap } from "@/api/api";

export function listAdmin({ page = 1, limit = 20, q, isActive } = {}) {
  return api
    .get("/admin/addons", {
      params: {
        page,
        limit,
        ...(q ? { q } : {}),
        ...(isActive === "true" || isActive === "false" ? { isActive } : {}),
      },
    })
    .then(unwrap);
}

export function getAdmin(id) {
  return api.get(`/admin/addons/${id}`).then(unwrap);
}

export function createAddon(body) {
  return api.post("/admin/addons", body).then(unwrap);
}

export function patchAddon(id, body) {
  return api.patch(`/admin/addons/${id}`, body).then(unwrap);
}

export function setAddonCityPrice(id, { cityId, pricePaise, compareAtPaise = null }) {
  return api
    .put(`/admin/addons/${id}/city-prices`, { cityId, pricePaise, compareAtPaise })
    .then(unwrap);
}

export function deleteAddonCityPrice(id, cityId) {
  return api.delete(`/admin/addons/${id}/city-prices/${cityId}`).then(unwrap);
}
