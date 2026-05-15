import { Router } from "express";
import { toggleVideoLike, toggleCommentLike } from "../controllers/like.controller.js";

const router = Router()


router.route("/video/add/:videoId").post(toggleVideoLike)

router.route("/comment/add/:commentId").post(toggleCommentLike)






export default router