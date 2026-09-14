import { api, unwrap } from "@/api/api"

export function listCmsBanners({ page = 1, limit = 50, placement, excludePlacement, status } = {}) {
  return api
    .get("/admin/cms/banners", {
      params: {
        page,
        limit,
        ...(placement ? { placement } : {}),
        ...(excludePlacement ? { excludePlacement } : {}),
        ...(status ? { status } : {}),
      },
    })
    .then(unwrap)
}

export function createCmsBanner(body) {
  return api.post("/admin/cms/banners", body).then(unwrap)
}

export function patchCmsBanner(id, body) {
  return api.patch(`/admin/cms/banners/${id}`, body).then(unwrap)
}

export function reorderCmsBanners({ placement, ids }) {
  return api.put("/admin/cms/banners/reorder", { placement, ids }).then(unwrap)
}

export function deleteCmsBanner(id) {
  return api.delete(`/admin/cms/banners/${id}`).then(unwrap)
}

export function listCmsTestimonials({ page = 1, limit = 50, status } = {}) {
  return api
    .get("/admin/cms/testimonials", { params: { page, limit, ...(status ? { status } : {}) } })
    .then(unwrap)
}

export function createCmsTestimonial(body) {
  return api.post("/admin/cms/testimonials", body).then(unwrap)
}

export function patchCmsTestimonial(id, body) {
  return api.patch(`/admin/cms/testimonials/${id}`, body).then(unwrap)
}

export function deleteCmsTestimonial(id) {
  return api.delete(`/admin/cms/testimonials/${id}`).then(unwrap)
}
