const asyncHandler = require("../utils/asyncHandler");
const notesService = require("../services/notes.service");

const listNotes = asyncHandler(async (req, res) => {
  // support query params:
  //  - q=<search term>
  //  - favorites=true
  const { q } = req.query;
  const favorites = req.query.favorites; // e.g. "true" or undefined

  const notes = await notesService.listNotes(req.user.id, { q, favorites });
  res.status(200).json({ success: true, data: notes });
});

const createNote = asyncHandler(async (req, res) => {
  const note = await notesService.createNote(req.user.id, req.body);
  res.status(201).json({ success: true, data: note });
});

const getNote = asyncHandler(async (req, res) => {
  const note = await notesService.getNote(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: note });
});

const updateNote = asyncHandler(async (req, res) => {
  const note = await notesService.updateNote(req.user.id, req.params.id, req.body);
  res.status(200).json({ success: true, data: note });
});

const deleteNote = asyncHandler(async (req, res) => {
  const result = await notesService.deleteNote(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: result });
});

const pinNote = asyncHandler(async (req, res) => {
  // expects body: { isPinned: true/false }
  const isPinned = req.body.isPinned;
  const note = await notesService.pinNote(req.user.id, req.params.id, isPinned);
  res.status(200).json({ success: true, data: note });
});

const searchFavorites = asyncHandler(async (req, res) => {
  const q = String(req.query.q || "");
  const results = await notesService.searchFavorites(req.user.id, q);
  res.status(200).json({ success: true, data: results });
});

const searchNotes = asyncHandler(async (req, res) => {
  // prefer body.q (if frontend sent body), fallback to query.q
  const q = typeof req.body?.q !== "undefined" ? String(req.body.q || "") : String(req.query.q || "");
  // favorites can be boolean or string "true"/"false" in either place
  const favBody = req.body?.favorites;
  const favQuery = req.query?.favorites;
  const favorites =
    typeof favBody !== "undefined" ? favBody : typeof favQuery !== "undefined" ? favQuery : undefined;

  const notes = await require("../services/notes.service").listNotes(req.user.id, { q, favorites });
  res.status(200).json({ success: true, data: notes });
});


module.exports = { listNotes, createNote, getNote, updateNote, deleteNote, pinNote, searchFavorites, searchNotes };

