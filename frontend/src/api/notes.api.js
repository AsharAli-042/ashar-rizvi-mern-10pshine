import { request } from "./client";

export const notesApi = {
  list: () => request({ method: "GET", url: "/notes" }),

  getById: (id) => request({ method: "GET", url: `/notes/${id}` }),

  create: (payload) => request({ method: "POST", url: "/notes", data: payload }),

  update: (id, payload) =>
    request({ method: "PATCH", url: `/notes/${id}`, data: payload }),

  remove: (id) => request({ method: "DELETE", url: `/notes/${id}` }),
};
