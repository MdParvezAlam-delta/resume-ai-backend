const express = require ("express")
const cookieParser = require("cookie-parser")

const cors = require("cors")

const app = express()

// Trust proxy to correctly detect HTTPS in production (Render, Heroku, etc.)
app.set('trust proxy', 1)

app.use(express.json())
app.use(cookieParser())

app.use(cors({
  origin: ["https://resume-ai-frontend-server.vercel.app", "http://localhost:5173"],
  credentials: true
}));

const authRouter = require("./routes/auth.routes")                                            // require all the route here 
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth",authRouter)                                                            // Using all the routes here 
app.use("/api/interview", interviewRouter)

module.exports = app;

