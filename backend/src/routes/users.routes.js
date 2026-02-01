const express = require("express");
const usersController = require("../controllers/users.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/me", usersController.getMe);
router.patch("/me", usersController.updateMe);

router.post("/me/change-password", usersController.changePassword);

module.exports = router;
