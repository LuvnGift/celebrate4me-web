import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Send httpOnly cookies automatically
});

// No request interceptor needed — cookies are sent automatically

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // On 401, try a silent token refresh via cookie
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Refresh endpoint reads refreshToken from httpOnly cookie
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true },
        );
        // Retry the original request — new accessToken cookie is already set
        return api(originalRequest);
      } catch {
        // Refresh failed — clear stale auth state then redirect to login
        if (typeof window !== 'undefined') {
          const { useAuthStore } = await import('@/store/auth.store');
          useAuthStore.getState().clearAuth();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);
