import { api, unwrap } from "@/api/api";

export function getHomeCms({ cityId, platform = "web" } = {}) {
  return api
    .get("/catalog/cms/home", {
      params: {
        ...(cityId ? { cityId } : {}),
        platform,
      },
    })
    .then(unwrap);
}
