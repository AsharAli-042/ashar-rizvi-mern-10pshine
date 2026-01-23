import { request } from "./client";

export const usersApi = {
  me: () => request({ method: "GET", url: "/users/me" }),

  updateMe: (payload) =>
    request({ method: "PATCH", url: "/users/me", data: payload }),
};
