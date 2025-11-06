const express = require("express");
const router = express.Router();
const { sendInvite, respondToInvite } = require("../controllers/inviteController");
const { protect } = require("../middlewares/auth");
const {authorizeRoles} = require("../middlewares/role.middleware");

const inviteRouter = express.Router()
inviteRouter.post("/send", protect, authorizeRoles("Staff") , sendInvite);

module.exports = inviteRouter