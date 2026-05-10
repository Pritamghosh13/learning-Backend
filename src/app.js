import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
    
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//import Router
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"



//routes declaration
app.use("/api/v1/users", userRouter)

//video router
app.use("/api/v1/video", videoRouter)

//comment router
app.use("/api/v1/comments", commentRouter)


// app.get("/", (req, res) => {
//   res.send("Server is working")
// })

export {app}