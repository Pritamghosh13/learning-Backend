import { asyncHandler } from "../utils/asyncHandeller.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.models.js";
import { Video } from "../models/video.models.js";


//create tweet
const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "The content of tweet is required")
    }


    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    if (!tweet) {
        throw new ApiError(500, "Something went wrong while creating tweet")
    }

    return res.status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"))

})


//update tweet
const updateTweet = asyncHandler(async (req, res) => {
    cont 
})

export {
    createTweet
}