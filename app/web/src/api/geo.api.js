import { api, unwrap } from "@/api/api";

export function listCities() {
  return api.get("/geo/cities").then(unwrap);
}

export function resolvePincode(pincode) {
  return api.get("/geo/resolve", { params: { pincode } }).then(unwrap);
}
