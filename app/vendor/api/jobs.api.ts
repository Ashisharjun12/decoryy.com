import { api, unwrap } from '@/api/client';
import type {
  JobFilter,
  VendorJobDetail,
  VendorJobsResponse,
} from '@/module/bookings/lib/booking.types';

export function listVendorJobs(params?: { filter?: JobFilter; page?: number; limit?: number }) {
  return api.get('/vendor/jobs', { params }).then(unwrap<VendorJobsResponse>);
}

export function getVendorJob(orderId: string) {
  return api.get(`/vendor/jobs/${orderId}`).then(unwrap<VendorJobDetail>);
}

export function acceptVendorJob(orderId: string) {
  return api.post(`/vendor/jobs/${orderId}/accept`).then(unwrap<VendorJobDetail>);
}

export function declineVendorJob(orderId: string) {
  return api.post(`/vendor/jobs/${orderId}/decline`).then(unwrap<{ ok: boolean }>);
}

export function markVendorJobEnRoute(orderId: string) {
  return api.post(`/vendor/jobs/${orderId}/en-route`).then(unwrap<VendorJobDetail>);
}

export function markVendorJobOnSite(orderId: string) {
  return api.post(`/vendor/jobs/${orderId}/on-site`).then(unwrap<VendorJobDetail>);
}

export function sendVendorDeliveryCode(orderId: string) {
  return api.post(`/vendor/jobs/${orderId}/send-delivery-code`).then(unwrap<VendorJobDetail>);
}

export function completeVendorJob(orderId: string, code: string) {
  return api.post(`/vendor/jobs/${orderId}/complete`, { code }).then(unwrap<VendorJobDetail>);
}
