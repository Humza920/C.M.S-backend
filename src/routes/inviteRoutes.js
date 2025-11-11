const express = require("express");
const router = express.Router();
const { sendInvite} = require("../controllers/inviteController");
const { protect } = require("../middlewares/auth");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { checkRoomAvailability } = require("../middlewares/checkRoomAvailability");
const inviteRouter = express.Router()
inviteRouter.post("/send", protect, authorizeRoles("Staff"), checkRoomAvailability , sendInvite);
module.exports = inviteRouter