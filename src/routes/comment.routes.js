import { Router } from "express";
import { addComment, updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()





router.route("/add/:videoId").post(verifyJWT, addComment)

router.route("/update/:commentId").patch(verifyJWT, updateComment)







export default router