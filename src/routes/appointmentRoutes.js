const express =  require("express")
const {protect} = require("../middlewares/auth")
const { availableSlots, bookAppointment , cancelAppointment} = require("../controllers/AppointmentController")
const { authorizeRoles } = require("../middlewares/role.middleware")
const appointmentRouter = express.Router()
appointmentRouter.get("/getAvailableSlots/:id" , protect , authorizeRoles("Patient") , availableSlots)
appointmentRouter.post("/bookAppointment/:id" , protect , authorizeRoles("Patient") , bookAppointment)
appointmentRouter.delete("/:id" , protect , authorizeRoles("Patient", "Staff") , cancelAppointment)
module.exports = appointmentRouter