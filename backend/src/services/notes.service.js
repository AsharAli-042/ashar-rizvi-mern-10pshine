const ApiError = require("../utils/ApiError");
const noteModel = require("../models/note.model");
const { logger } = require("../config/logger");

async function listNotes(userId) {
  if (!userId) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  return noteModel.listNotesByUser(userId);
}

async function createNote(userId, { title, content, isFavorite }) {
  if (!userId) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  if (!content || typeof content !== "string") {
    throw new ApiError(400, "Content is required", "VALIDATION_ERROR");
  }

  const note = await noteModel.createNote({
    userId,
    title: title && typeof title === "string" ? title : null,
    content,
    isFavorite: typeof isFavorite === "boolean" ? isFavorite : false,
  });

  logger.info({ userId, noteId: note.id }, "Note created");
  return note;
}

async function getNote(userId, noteId) {
  if (!userId) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  const note = await noteModel.findNoteByIdForUser(noteId, userId);
  if (!note) throw new ApiError(404, "Note not found", "NOTE_NOT_FOUND");
  return note;
}

async function updateNote(userId, noteId, patch) {
  if (!userId) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");

  const data = {};
  if (patch.title !== undefined) data.title = patch.title === null ? null : String(patch.title);
  if (patch.content !== undefined) {
    if (typeof patch.content !== "string") throw new ApiError(400, "Content must be a string", "VALIDATION_ERROR");
    data.content = patch.content;
  }
  if (patch.isFavorite !== undefined) data.isFavorite = Boolean(patch.isFavorite);

  const result = await noteModel.updateNoteByIdForUser(noteId, userId, data);
  if (!result || result.count === 0) throw new ApiError(404, "Note not found", "NOTE_NOT_FOUND");

  logger.info({ userId, noteId }, "Note updated");
  return getNote(userId, noteId);
}

async function deleteNote(userId, noteId) {
  if (!userId) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  const result = await noteModel.deleteNoteByIdForUser(noteId, userId);
  if (!result || result.count === 0) throw new ApiError(404, "Note not found", "NOTE_NOT_FOUND");

  logger.info({ userId, noteId }, "Note deleted");
  return { success: true };
}
/* pin/unpin note */
async function pinNote(userId, noteId, isPinned) {
  if (!userId) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  const updated = await noteModel.setPinForNoteByUser(noteId, userId, Boolean(isPinned));
  if (!updated) throw new ApiError(404, "Note not found", "NOTE_NOT_FOUND");
  logger.info({ userId, noteId, isPinned }, "Note pin state changed");
  return updated;
}

/* search favorites */
async function searchFavorites(userId, query) {
  if (!userId) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  const results = await noteModel.searchFavoriteNotesByUser(userId, query);
  return results;
}

module.exports = { listNotes, createNote, getNote, updateNote, deleteNote, pinNote, searchFavorites };