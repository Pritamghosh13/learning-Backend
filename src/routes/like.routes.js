import { Router } from "express";
import { toggleVideoLike, toggleCommentLike, getLikedVideos } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()


router.route("/video/add/:videoId").post(verifyJWT, toggleVideoLike)

router.route("/comment/add/:commentId").post(verifyJWT, toggleCommentLike)


router.route("/video/getLiked").get(verifyJWT, getLikedVideos)



export default router