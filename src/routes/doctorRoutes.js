const express = require("express");
const { protect } = require("../middlewares/auth");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { mydocAppointments, updateAppointmentStatus } = require("../controllers/doctorController");
const doctorRouter = express.Router();
doctorRouter.get("/mydocapp", protect, authorizeRoles("Doctor"), mydocAppointments);
doctorRouter.patch("/updateStatus/:id", protect, authorizeRoles("Doctor"), updateAppointmentStatus);
module.exports = doctorRouter
