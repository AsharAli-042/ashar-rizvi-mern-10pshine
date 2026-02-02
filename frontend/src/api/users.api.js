import { request } from "./client";

export const usersApi = {
  me: () => request({ method: "GET", url: "/users/me" }),
  updateMe: (data) => request({ method: "PATCH", url: "/users/me", data }),

  changePassword: (payload) =>
    request({ method: "POST", url: "/users/me/change-password", data: payload }),
};
