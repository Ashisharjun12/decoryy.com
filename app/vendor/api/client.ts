import { API_URL } from '@/lib/env';
import axios from 'axios';

let accessTokenGetter: (() => string | null) | null = null;
let partnerModeGetter: (() => 'owner' | 'field' | null) | null = null;

export function registerAccessTokenGetter(getter: () => string | null) {
  accessTokenGetter = getter;
}

export function registerPartnerModeGetter(getter: () => 'owner' | 'field' | null) {
  partnerModeGetter = getter;
}

export const api = axios.create({
  baseURL: API_URL || undefined,
  timeout: 15000,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      if (err.code === 'ECONNABORTED') {
        return 'Request timed out. Check your connection and try again.';
      }
      return 'Network error. Check that the API is reachable and try again.';
    }
    const message = err.response?.data?.message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Something went wrong';
}

export function unwrap<T>(response: { data?: { data?: T } }): T {
  return response.data?.data as T;
}

api.interceptors.request.use((config) => {
  const token = accessTokenGetter?.() ?? null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const mode = partnerModeGetter?.();
  if (mode && config.url?.startsWith('/vendor')) {
    config.headers['X-Decory-Partner-Mode'] = mode;
  }
  return config;
});
