const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
dotenv.config()
const cookieParser = require("cookie-parser")
const connectionWithDb = require("./config/db")
const authRouter = require("./routes/authRoutes")
const inviteRouter = require("./routes/inviteRoutes")
const appointmentRouter = require("./routes/appointmentRoutes")
const dashboardRouter = require("./routes/dashboardRoutes")
const patientRouter = require("./routes/patientRoutes")
const doctorRouter = require("./routes/doctorRoutes")


const app = express()
app.use(express.json())

const allowedOrigins = [
  "http://localhost:5173",
  "https://c-m-s-frontend-6p9q.vercel.app"
];

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


app.use(cookieParser())

connectionWithDb()
app.use("/api/auth", authRouter)
app.use("/api/invite" , inviteRouter)
app.use("/api/appointment" , appointmentRouter)
app.use("/api/dashboard", dashboardRouter)
app.use("/api/patient",patientRouter)
app.use("/api/doctor",doctorRouter)
module.exports = app