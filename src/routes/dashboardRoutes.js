const express =  require("express")
const {protect} = require("../middlewares/auth")
const {dashboard , doctorsAllData} = require("../controllers/dashboardController")
// const getAISuggestion = require("../controllers/aiController")
const dashboardRouter = express.Router()

// dashboardRouter.get("/" , protect , getDashboardData)
// dashboardRouter.post("/ai" , protect , getAISuggestion)
dashboardRouter.get("/" , protect , dashboard)
dashboardRouter.get("/doctors" , doctorsAllData)



module.exports = dashboardRouter