import { request } from "./client";

export const authApi = {
  register: (payload) =>
    request({ method: "POST", url: "/auth/register", data: payload }),

  login: (payload) =>
    request({ method: "POST", url: "/auth/login", data: payload }),

  forgotPassword: (payload) =>
    request({ method: "POST", url: "/auth/forgot-password", data: payload }),

  resetPassword: (payload) =>
    request({ method: "POST", url: "/auth/reset-password", data: payload }),

  // optional endpoint
  logout: () => request({ method: "POST", url: "/auth/logout" }),
};
