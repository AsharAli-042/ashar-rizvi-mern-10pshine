import axios from "axios";
import { getToken, clearToken } from "../utils/storage";

/**
 * Base URL must be: VITE_API_URL=http://localhost:5000/api/v1
 * All endpoints used here are relative to that prefix.
 */
const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});


export function parseApiError(err) {
  const status = err?.response?.status;
  const payload = err?.response?.data;

  const message =
    payload?.error?.message ||
    err?.message ||
    "Something went wrong. Please try again.";

  const code = payload?.error?.code || "UNKNOWN_ERROR";
  const details = payload?.error?.details || null;

  return { message, code, details, status };
}

// Attach Bearer token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally per contract: clear token, redirect, show message
api.interceptors.response.use(
  (response) => response,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      clearToken();
      sessionStorage.setItem(
        "auth_message",
        "Session expired, please login again."
      );
      window.location.assign("/auth");
    }
    return Promise.reject(err);
  }
);


export async function request(config) {
  try {
    const res = await api.request(config);
    return res?.data?.data;
  } catch (err) {
    throw parseApiError(err);
  }
}
