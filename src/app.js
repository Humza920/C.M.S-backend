const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const authRouter = require("./routes/authRoutes")
const inviteRouter = require("./routes/inviteRoutes")
// const dashboardRouter = require("./routes/dashboardRoutes")


const app = express()
app.use(express.json())

app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
);

app.use(cookieParser())
app.use("/api/auth", authRouter)
app.use("/api/invite" , inviteRouter)
// app.use("/api/income", incomeRouter)
// app.use("/api/expense", expenseRouter)
// app.use("/api/dashboard", dashboardRouter)



module.exports = app