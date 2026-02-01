const express = require("express");
const notesController = require("../controllers/notes.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

// support search + favorites in main list endpoint
router.get("/", notesController.listNotes);

// optional compatibility route
router.get("/favorites/search", notesController.searchFavorites);

router.post("/search", notesController.searchNotes);

router.post("/", notesController.createNote);

// put :id routes AFTER the explicit ones
router.get("/:id", notesController.getNote);
router.patch("/:id", notesController.updateNote);
router.delete("/:id", notesController.deleteNote);

// explicit pin route
router.patch("/:id/pin", notesController.pinNote);

module.exports = router;
