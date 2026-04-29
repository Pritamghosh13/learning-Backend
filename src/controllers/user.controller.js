import {asyncHandler} from "../utils/asyncHandeller.js"
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js"; 
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"



//generating access & refresh token.
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        //saving refresh token in DB
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false}) //saving

        return {accessToken, refreshToken}

    } catch (error) {
         console.log(error);
        throw new ApiError(500, "Something went wrong, while generating refresh and access token")
       
        
    }
}


//for register a new user.
const registerUser = asyncHandler (async (req, res) => {
   // get user details from frontend
   // validation - not empty
   // check if user already exists: username, email
   // check for image , avatar
   // upload them to cloudinary, avatar
   // create user object - create entry in db 
   // remove password and refresh token field from message
   // check for user creation
   // return response


   const {fullname, email, password, username } = req.body
    //    console.log("email: ", email);
    //    console.log("password: ", password);
    //    console.log("username: ", username);
    //    console.log("fullname: ", fullname);
   


    //    if(fullname === ""){
    //     throw new ApiError(400, "fullaname is required");
    //    }


    //all condition in one if statement, we can also make multiple if statement.
    if (
        [fullname, email, password, username].some((field) =>!field || field?.trim() ==="")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //check user exists or not
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    //check for image , avatar
    // const avatarLocalpath = req.files?.avatar?.[0]?.path;
    // const coverImageLocalpath = req.files?.coverImage[0]?.path;

    // const avatar = req.files?.avatar;

    // if (!avatar || !Array.isArray(avatar) || avatar.length === 0) {
    //     throw new ApiError(400, "Avatar file is required");
    // }

    // const avatarLocalpath = avatar[0].path;

    let coverImageLocalpath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalpath = req.files.coverImage[0].path;
    }

    console.log(coverImageLocalpath);
    

    // if(!avatarLocalpath){
    //     throw new ApiError(400, "Avatar file is required")
    // }


    // upload them to cloudinary, avatar
    // const Avatar = await uploadOnCloudinary(avatarLocalpath)
    const coverImage = await uploadOnCloudinary(coverImageLocalpath)

    

    // if(!avatar){
    //     throw new ApiError(400, "Avatar file is required")
        
    // }


    //create user object - create entry in db 
    const user = await User.create({
        fullname,
        // avatar: Avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })

    //for checking if the object create in db and also remove password and refreshtoken
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }


    //return response
    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})



//for (log in) a user.
const loginUser = asyncHandler(async (req, res) => {
    //req body --> data
    //username or email
    //find the user
    //check password
    //access and refresh token generate
    //send cookie
    //give response for log in

    const {email, username, password} = req.body

    console.log(email);
    console.log(username);
    
    
    //check is not the username or email empty
    if(!(username || email)){
        throw new ApiError(400, "username or email is required")
    }    

    //find the user from the database.
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exists")
    }

    //checking the password
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    //calling for generating access and refresh tokens.
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //for safty of cookies.
    const options = {
        httpOnly: true,
        secure: true,
    }

    //sending response to user.
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "user logged in successfully"

        )
    )

})



//for logged out a user.
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: null } 
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))


})



//verify the refresh_token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request") 
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_SECRET_TOKEN
        )
    
        
        const user = await User.findById(decodedToken._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token") 
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used") 
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    accessToken, 
                    refreshToken: newRefreshToken,
                },
                "Access token refreshed"
            )
        )
    } catch (err) {
        throw new ApiError(401, err?.message || "Invalid refresh token")
    }
})


//changing present password.
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword, confirmPassword} = req.body

    const user = await User.findById(req.user._id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }


    const isThePasswordCorrect = await user.isPasswordCorrect(oldPassword)
    console.log(isThePasswordCorrect);
    
    
    if (!isThePasswordCorrect) {
        throw new ApiError(400, "Invalid password");
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "Confirm Password mismatch")
        
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})


//getting the current user details.
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})


//updating text-based details of user account.
const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullname, email} = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "All fields are required");
    }

    //find and update at a same time in db.
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname: fullname,
                email: email
            }
        },
        {new: true},

    )

    return res.
    status(200)
    .json(new ApiResponse(
        200, 
        user,
        "User account details updated successfully"
    ))

})


//updating avatar of user account.

// const updateUserAvatar = asyncHandler(async(req, res) => {
//     const avatarLocalPath = req.file?.path

//     if (!avatarLocalPath) {
//         throw new ApiError(400, "Avatar file is missing");
//     }

//     const avatar = await uploadOnCloudinary(avatarLocalPath)

//     if (!avatar.url) {
//         throw new ApiError(400, "Error while uploading avatar")
//     }

//     const user = await User.findByIdAndUpdate(
//         req.user._id,
//         {
//             $set: {avatar: avatar.url}
//         },
//         {new: true}
//     ).select("-password")

    
//     return res.status(200)
//     .json(new ApiResponse(200, 
//         user,
//         "Avatar is updated successfully"
//     ))

// })



//upadate user coverImage.

// const updateUserCoverImage = asyncHandler(async(req, res) => {
//     const coverImageLocalpath = req.file?.path

//     if (!coverImageLocalpath) {
//         throw new ApiError(400, "coverImage file is missing");
//     }

//     const coverImage = await uploadOnCloudinary(coverImageLocalpath)

//     if (!coverImage.url) {
//         throw new ApiError(400, "Error while uploading coverImage")
//     }

//     const user = await User.findByIdAndUpdate(
//         req.user._id,
//         {
//             $set: {coverImage: coverImage.url}
//         },
//         {new: true}
//     ).select("-password")

//     return res.status(200)
//     .json(new ApiResponse(200, 
//         user,
//         "CoverImage is updated successfully"
//     ))

// })


const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params;

    if(!username?.trim()){
        throw new ApiError(400, "Username is missing");
    }

    const channel = await User.aggregate([
    {
        $match: {
            username: username?.toLowerCase()
        }
    },
    {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    },
    {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
        } 
    },
    {
        $addFields: {
            subscribersCount: {
                $size: "$subscribers"
            },
            channelsSubscribedToCount: {
                $size: "$subscribedTo"
            },
            isSubscribed: {
                $cond: {
                    if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                    then: true,
                    else: false
                }
            }
        }
    },
    {
        $project:{
            fullname: 1,
            username: 1,
            subscribersCount: 1,
            channelsSubscribedToCount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
            email: 1,
        }
    }
])

    if(!channel?.length){
        throw new ApiError(404, "Channel does not exists")
    }

    return res.status(200)
    .json(new ApiResponse(200, channel[0], "User channel fetched successfully"))

})








export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    // updateUserAvatar,
    // updateUserCoverImage,
    getUserChannelProfile,



}

