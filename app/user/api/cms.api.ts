import { api, unwrap } from '@/api/client';

export function getHomeCms({
  cityId,
  pincode,
  platform = 'android',
}: {
  cityId?: string;
  pincode?: string;
  platform?: 'web' | 'mobile' | 'android' | 'ios';
} = {}) {
  return api
    .get('/catalog/cms/home', {
      params: {
        platform,
        ...(cityId ? { cityId } : {}),
        ...(pincode ? { pincode } : {}),
      },
    })
    .then(unwrap);
}
