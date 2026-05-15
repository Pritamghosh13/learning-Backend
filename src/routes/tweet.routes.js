import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, updateTweet, deleteTweet, getTweets } from "../controllers/tweet.controller.js";


const router = Router()


router.route("/add").post(verifyJWT, createTweet)

router.route("/update/:tweetId").patch(verifyJWT, updateTweet)

router.route("/delete/:tweetId").delete(verifyJWT, deleteTweet)

router.route("/getall/:userId").get(verifyJWT, getTweets)




export default router