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
    const {content} = req.body;
    const {tweetId} = req.params;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "The content of tweet is required")
    }

    const tweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner: req.user?._id
        },
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    if(!tweet){
        throw new ApiError(404, "Tweet failed to update")
    }

    return res.status(200)
    .json(new ApiResponse(200, tweet, "Tweet update successfully"))

})

//delete tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;

    const tweet = await Tweet.deleteOne({
        _id: tweetId,
        owner: req.user?._id
    })

    if (tweet.deletedCount === 0) {
    throw new ApiError(404, "Tweet not found or unauthorized");
    }


    return res.status(200)
    .json(new ApiResponse(200, {}, "Your tweet deleted successfully"))
})


//get all users tweet
const getTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    let {page = 1, limit = 10} = req.query;

    page = Number(page);
    limit = Number(limit);

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const skip = (page - 1) * limit;

    const tweets = await Tweet.find({
        owner: userId
    }).skip(skip)
    .limit(limit)
    .populate("owner", "username, fullname")
    .sort({ createdAt: -1 })


    const totalTweet = await Tweet.countDocuments({
        owner: userId
    })

    return res.status(200)
    .json({
        suceess: true,
        totalTweet,
        tweets,
        limit,
        totalPages : Math.ceil(totalTweet/limit),
        message: "User tweets fetched successfully"
    }
        
    )
})

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getTweets
}