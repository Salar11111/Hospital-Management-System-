import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from './types';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export interface ApiErrorBody {
  success: boolean;
  message?: string;
  errors?: Array<{ field?: string; message: string }>;
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const body = (error as AxiosError<ApiErrorBody>).response?.data;
    if (body?.message) return body.message;
    if (body?.errors?.length) return body.errors.map((e) => e.message).join(', ');
    if (error.code === 'ERR_NETWORK') return 'Cannot reach the server. Please try again.';
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function flushQueue(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    // The server rotates the auth cookies itself; any successful response
    // means the session was refreshed, so we only need a truthy marker.
    const res = await axios.post<ApiResponse<unknown>>(
      `${api.defaults.baseURL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const ok = res.data?.success === true ? 'refreshed' : null;
    flushQueue(ok);
    return ok;
  } catch {
    flushQueue(null);
    return null;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (!original) return Promise.reject(error);

    const url = original.url ?? '';
    const skipRefresh = url.includes('/auth/login') || url.includes('/auth/refresh');

    if (error.response?.status === 401 && !original._retried && !skipRefresh) {
      original._retried = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((token) => {
            if (token) {
              resolve(api(original));
            } else {
              window.dispatchEvent(new CustomEvent('auth:expired'));
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;
      const token = await refreshAccessToken();
      isRefreshing = false;

      if (token) {
        return api(original);
      }
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    return Promise.reject(error);
  }
);