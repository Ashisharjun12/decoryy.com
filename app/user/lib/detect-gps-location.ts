import { resolvePincode } from '@/api/geo.api';
import { reverseGeocode } from '@/api/maps.api';
import {
  getLocationPermissionStatus,
  requestForegroundLocationPermission,
} from '@/lib/location';
export type ServiceCity = {
  id: string;
  name: string;
  slug?: string;
};

export type GpsResolvedLocation = {
  city: ServiceCity;
  pincode: { code: string } | null;
};

function matchCityByName(cities: ServiceCity[], cityName: string | null | undefined) {
  const needle = cityName?.trim().toLowerCase();
  if (!needle) return null;
  const exact = cities.find((c) => c.name.toLowerCase() === needle);
  if (exact) return exact;
  return cities.find(
    (c) => needle.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(needle),
  );
}

/**
 * GPS → reverse geocode → service city. Pure helper (no store) — apply result in the store/UI.
 */
export async function resolveLocationFromGps(
  cities: ServiceCity[],
): Promise<GpsResolvedLocation | null> {
  const status = await getLocationPermissionStatus();
  const granted =
    status === 'granted' || (status === 'undetermined' && (await requestForegroundLocationPermission()));
  if (!granted) return null;

  const Location = await import('expo-location');
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = position.coords;
  const geo = (await reverseGeocode(latitude, longitude)) as {
    pincode?: string | null;
    cityName?: string | null;
    formattedAddress?: string;
  };

  const pincode = geo.pincode?.replace(/\D/g, '').slice(0, 6) ?? '';

  if (pincode.length === 6) {
    try {
      const resolved = (await resolvePincode(pincode)) as {
        deliverable?: boolean;
        city?: ServiceCity;
      };
      if (resolved?.deliverable && resolved.city?.id) {
        return {
          city: resolved.city,
          pincode: { code: pincode },
        };
      }
    } catch {
      // fall through to city name match
    }
  }

  const match = matchCityByName(cities, geo.cityName);
  if (match) {
    return {
      city: match,
      pincode: pincode.length === 6 ? { code: pincode } : null,
    };
  }

  return null;
}
