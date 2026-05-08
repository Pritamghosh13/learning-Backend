import { Router } from "express";
import { isPublishAVideo, getAllVideos, getVideoById } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";



const router = Router()


router.route("/getallVideos").get(verifyJWT, getAllVideos);

router.route("/publish-video").post(verifyJWT, 
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
isPublishAVideo)


router.route("/:videoId").get(getVideoById)


// router.get("/test", (req, res) => {
//     res.send("video route working");
// });


export default router;