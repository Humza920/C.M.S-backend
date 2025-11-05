const express =  require("express")
const {protect} = require("../middlewares/auth")
const { addIncome, getAllIncome, deleteIncome } = require("../controllers/incomeController")
const incomeRouter = express.Router()

incomeRouter.post("/add" , protect , addIncome)
incomeRouter.get("/get" , protect , getAllIncome)
incomeRouter.delete("/:id" , protect , deleteIncome)

module.exports = incomeRouter