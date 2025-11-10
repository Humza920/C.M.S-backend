const express = require("express");
const { protect } = require("../middlewares/auth");
const { authorizeRoles } = require("../middlewares/role.middleware");

const { mydocAppointments } = require("../controllers/doctorController");

const doctorRouter = express.Router();

doctorRouter.get("/mydocapp", protect, authorizeRoles("Doctor"), mydocAppointments);

module.exports = doctorRouter;
