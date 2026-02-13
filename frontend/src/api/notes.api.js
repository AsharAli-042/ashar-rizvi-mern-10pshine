import { request } from "./client";

/**
 * Notes API wrappers.
 *
 * Important:
 * - For search/favorites the preferred flow is GET /notes?q=...&favorites=true
 * - We include Cache-Control: no-cache on list/search to avoid 304 conditional responses
 * - Defensive fallback: POST /notes/search accepts { q, favorites } in body (server supports this)
 */

export const notesApi = {
  // list notes (supports params { q, favorites, ... })
  list: (params = {}) =>
    request({
      method: "GET",
      url: "/notes",
      params,
      // force fresh response so server won't reply 304 from conditional GET
      headers: { "Cache-Control": "no-cache" },
    }),

  create: (data) =>
    request({
      method: "POST",
      url: "/notes",
      data,
    }),

  getById: (id) =>
    request({
      method: "GET",
      url: `/notes/${id}`,
      headers: { "Cache-Control": "no-cache" },
    }),

  update: (id, data) =>
    request({
      method: "PATCH",
      url: `/notes/${id}`,
      data,
    }),

  remove: (id) =>
    request({
      method: "DELETE",
      url: `/notes/${id}`,
    }),

  // pin/unpin note (backend: PATCH /notes/:id/pin)
  pinNote: (id, isPinned) =>
    request({
      method: "PATCH",
      url: `/notes/${id}/pin`,
      data: { isPinned },
    }),

  // Preferred: search favorites via GET /notes?q=...&favorites=true
  searchFavoriteNotes: (q = "") =>
    request({
      method: "GET",
      url: "/notes/favorites/search",
      params: { q },
      headers: { "Cache-Control": "no-cache" },
    }),

  // Defensive fallback: accept a POST /notes/search body { q, favorites }
  search: (q = "", favorites = false) =>
    request({
      method: "POST",
      url: "/notes/search",
      data: { q, favorites },
      headers: { "Cache-Control": "no-cache" },
    }),
};