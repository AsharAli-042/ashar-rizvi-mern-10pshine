const asyncHandler = require("../utils/asyncHandler");
const usersService = require("../services/users.service");

const getMe = asyncHandler(async (req, res) => {
  const user = await usersService.getMe(req.user.id);
  res.status(200).json({ success: true, data: user });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await usersService.updateMe(req.user.id, req.body);
  res.status(200).json({ success: true, data: user });
});

/* change password */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await usersService.changePassword(req.user.id, currentPassword, newPassword);
  res.status(200).json({ success: true, data: result });
});

module.exports = { getMe, updateMe, changePassword };
