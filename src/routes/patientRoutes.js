const express =  require("express")
const {protect} = require("../middlewares/auth")
const { myAppointments, getCaseHistories} = require("../controllers/patientController")
const { authorizeRoles } = require("../middlewares/role.middleware")
const patientRouter = express.Router()
patientRouter.get("/myapp" , protect , myAppointments)
patientRouter.get("/casehistory" , protect , authorizeRoles("Patient" , "Doctor") , getCaseHistories)
module.exports = patientRouter