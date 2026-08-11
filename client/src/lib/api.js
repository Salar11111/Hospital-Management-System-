import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
function getErrorMessage(error, fallback = 'Something went wrong') {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data;
    if (body?.message) return body.message;
    if (body?.errors?.length) return body.errors.map((e) => e.message).join(', ');
    if (error.code === 'ERR_NETWORK') return 'Cannot reach the server. Please try again.';
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
let isRefreshing = false;
let pendingQueue = [];
function flushQueue(token) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}
const refreshAccessToken = async () => {
  try {
    const res = await axios.post(
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
  async (error) => {
    const original = error.config;
    if (!original) return Promise.reject(error);
    const url = original.url ?? '';
    const skipRefresh = url.includes('/auth/login') || url.includes('/auth/refresh');
    if (error.response?.status === 401 && !original._retried && !skipRefresh) {
      original._retried = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((token2) => {
            if (token2) {
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
export { api, getErrorMessage, refreshAccessToken };
