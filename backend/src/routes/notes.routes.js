const express = require("express");
const notesController = require("../controllers/notes.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", notesController.listNotes);
router.post("/", notesController.createNote);

router.get("/:id", notesController.getNote);
router.patch("/:id", notesController.updateNote);
router.delete("/:id", notesController.deleteNote);

module.exports = router;
