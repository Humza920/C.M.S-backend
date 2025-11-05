const express =  require("express")
const {protect} = require("../middlewares/auth")
const {getDashboardData} = require("../controllers/dashboardController")
const getAISuggestion = require("../controllers/aiController")
const dashboardRouter = express.Router()

dashboardRouter.get("/" , protect , getDashboardData)
dashboardRouter.post("/ai" , protect , getAISuggestion)


module.exports = dashboardRouter