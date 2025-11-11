const express =  require("express")
const {protect} = require("../middlewares/auth")
const { myAppointments, getMyCaseHistories} = require("../controllers/patientController")
const { authorizeRoles } = require("../middlewares/role.middleware")
const patientRouter = express.Router()
patientRouter.get("/myapp" , protect , myAppointments)
patientRouter.get("/casehistory" , protect , authorizeRoles("Patient") , getMyCaseHistories)
module.exports = patientRouter