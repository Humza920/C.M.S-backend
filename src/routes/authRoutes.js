const express = require("express");
const { register , login , logout, getMe } = require("../controllers/authController");
const {protect} = require("../middlewares/auth")
// const upload = require("../config/multer")
const authRouter = express.Router()

authRouter.post("/register", register)
authRouter.post("/login" , login)
authRouter.post("/logout" , logout)
authRouter.get("/getMe" , protect , getMe)

module.exports = authRouter