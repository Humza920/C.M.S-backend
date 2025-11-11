const express =  require("express")
const {protect} = require("../middlewares/auth")
const {dashboard , doctorsAllData} = require("../controllers/dashboardController")
const dashboardRouter = express.Router()
dashboardRouter.get("/" , protect , dashboard)
dashboardRouter.get("/doctors" , doctorsAllData)
module.exports = dashboardRouter