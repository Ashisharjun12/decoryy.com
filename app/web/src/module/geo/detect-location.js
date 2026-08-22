import { resolvePincode } from "@/api/geo.api";
import { getDeviceCoords } from "@/lib/geolocation";
import { reverseGeocodePincode } from "@/lib/reverse-geocode";

export async function detectLocationFromDevice() {
  const coords = await getDeviceCoords();
  const code = await reverseGeocodePincode(coords.latitude, coords.longitude);
  const data = await resolvePincode(code);

  return {
    city: data.city,
    pincode: data.pincode,
    source: "gps",
  };
}

export async function resolveLocationFromPincode(pincode) {
  const data = await resolvePincode(pincode);

  return {
    city: data.city,
    pincode: data.pincode,
    source: "manual",
  };
}
