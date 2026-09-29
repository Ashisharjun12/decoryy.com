import { api, unwrap } from '@/api/client';

export function listCities() {
  return api.get('/geo/cities').then(unwrap);
}

export function resolvePincode(pincode: string, options: { cityId?: string } = {}) {
  return api
    .get('/geo/resolve', {
      params: {
        pincode,
        ...(options.cityId ? { cityId: options.cityId } : {}),
      },
    })
    .then(unwrap);
}
