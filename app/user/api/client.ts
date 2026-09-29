import { API_URL } from '@/lib/env';
import { loadAccessToken } from '@/lib/secure-storage';
import axios from 'axios';

let accessTokenGetter: (() => string | null) | null = null;

export function registerAccessTokenGetter(getter: () => string | null) {
  accessTokenGetter = getter;
}

export const api = axios.create({
  baseURL: API_URL || undefined,
  timeout: 15000,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

type ApiErrorBody = {
  message?: string;
  errors?: { path?: (string | number)[]; message?: string }[];
};

function formatValidationErrors(errors: ApiErrorBody['errors']) {
  if (!errors?.length) return '';
  return errors
    .map((issue) => {
      const path = Array.isArray(issue?.path) ? issue.path.join('.') : '';
      const msg = issue?.message ?? '';
      return path ? `${path}: ${msg}` : msg;
    })
    .filter(Boolean)
    .join(' · ');
}

export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      if (err.code === 'ECONNABORTED') {
        return 'Request timed out. Check your connection and try again.';
      }
      return 'Network error. Check that the API is reachable and try again.';
    }
    const data = err.response.data as ApiErrorBody | undefined;
    if (data?.message === 'validation failed') {
      const detail = formatValidationErrors(data.errors);
      if (detail) return detail;
    }
    const message = data?.message;
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

api.interceptors.request.use(async (config) => {
  let token = accessTokenGetter?.() ?? null;
  if (!token) {
    token = (await loadAccessToken()) ?? null;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
