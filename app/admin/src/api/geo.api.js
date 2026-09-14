import { api, unwrap } from "@/api/api";

export function resolvePincode(pincode) {
  return api.get("/geo/resolve", { params: { pincode } }).then(unwrap);
}
