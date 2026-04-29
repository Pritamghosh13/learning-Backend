import {Router} from "express"
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
    //    {
    //     name: "avatar",
    //     maxCount: 1
    //    },
       {
        name: "coverImage",
        maxCount: 1
       } 
    ]),
registerUser)



router.route("/login").post(loginUser)


router.route("/logout").post(verifyJWT , logoutUser)


router.route("/refresh_token").post(refreshAccessToken)

router.route("/change_password").post(verifyJWT, changeCurrentPassword)

export default router

//http://localhost:8000/api/v1/users/register
