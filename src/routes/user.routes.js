import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";



//how to use the upload
//using middleware upload

const router = Router()

router.route("/register").post(
    upload.fields([
        {name: "avatar",
        maxCount:1
    },{
        name: "coverImage",
        maxCount:1
    }]),
    registerUser)

    router.route("/login").post(loginUser)

    //secured route

    router.route("/logout").post(verifyJWT,logoutUser)

    router.route("refresh-token").post(refreshAccessToken)


export default router