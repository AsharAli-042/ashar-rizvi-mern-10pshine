const asyncHandler = require("../utils/asyncHandler");
const notesService = require("../services/notes.service");

const listNotes = asyncHandler(async (req, res) => {
  const notes = await notesService.listNotes(req.user.id);
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

module.exports = { listNotes, createNote, getNote, updateNote, deleteNote };
