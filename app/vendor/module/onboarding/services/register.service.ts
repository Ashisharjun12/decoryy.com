import type { VendorRegisterPayload } from '@/api/vendor.api';
import {
  completeShopImage,
  presignShopImage,
  reapplyVendor,
  registerVendor,
  uploadShopImageFile,
} from '@/api/vendor.api';
import { getAndroidOtpAppHash } from '@/lib/android-app-hash';

function guessContentType(uri: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function fileNameFromUri(uri: string) {
  const parts = uri.split('/');
  return parts[parts.length - 1] || 'shop.jpg';
}

export async function submitVendorRegistration(
  payload: VendorRegisterPayload & { shopImageUri?: string }
) {
  let shopImageUploadId = payload.shopImageUploadId;

  if (payload.shopImageUri) {
    const contentType = guessContentType(payload.shopImageUri);
    const presign = await presignShopImage({
      phone: payload.phone,
      fileName: fileNameFromUri(payload.shopImageUri),
      contentType,
    });
    await uploadShopImageFile(presign.uploadUrl, payload.shopImageUri, contentType);
    const completed = await completeShopImage(presign.uploadId);
    shopImageUploadId = completed.uploadId;
  }

  return registerVendor({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    altPhone: payload.altPhone,
    cityId: payload.cityId,
    shopAddress: payload.shopAddress,
    pincode: payload.pincode,
    shopImageUploadId,
    androidAppHash: await getAndroidOtpAppHash(),
  });
}

type ReapplyPayload = {
  name: string;
  email: string;
  phone: string;
  altPhone?: string;
  cityId: string;
  shopAddress: string;
  pincode: string;
  shopImageUri?: string;
};

export async function submitVendorReapply(payload: ReapplyPayload) {
  let shopImageUploadId: string | undefined;

  if (payload.shopImageUri && !payload.shopImageUri.startsWith('http')) {
    const contentType = guessContentType(payload.shopImageUri);
    const presign = await presignShopImage({
      phone: payload.phone,
      fileName: fileNameFromUri(payload.shopImageUri),
      contentType,
    });
    await uploadShopImageFile(presign.uploadUrl, payload.shopImageUri, contentType);
    const completed = await completeShopImage(presign.uploadId);
    shopImageUploadId = completed.uploadId;
  }

  return reapplyVendor({
    name: payload.name,
    email: payload.email,
    altPhone: payload.altPhone,
    cityId: payload.cityId,
    shopAddress: payload.shopAddress,
    pincode: payload.pincode,
    shopImageUploadId,
  });
}
