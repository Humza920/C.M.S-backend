const express =  require("express")
const {protect} = require("../middlewares/auth")
const { myAppointments} = require("../controllers/patientController")
const patientRouter = express.Router()

patientRouter.get("/myapp" , protect , myAppointments)


module.exports = patientRouter