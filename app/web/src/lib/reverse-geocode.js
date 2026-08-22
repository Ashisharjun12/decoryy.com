const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

function extractIndiaPincode(postcode) {
  const digits = String(postcode ?? "").replace(/\D/g, "");
  const match = digits.match(/[1-9]\d{5}/);
  return match?.[0] ?? null;
}

export async function reverseGeocodePincode(latitude, longitude) {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: "json",
    addressdetails: "1",
  });

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Decoryy/1.0 (https://decoryy.com)",
    },
  });

  if (!response.ok) {
    throw new Error("Reverse geocoding failed");
  }

  const data = await response.json();
  const pincode = extractIndiaPincode(data?.address?.postcode);

  if (!pincode) {
    throw new Error("Could not detect pincode from location");
  }

  return pincode;
}
