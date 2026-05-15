import { asyncHandler } from "../utils/asyncHandeller.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.models.js";
import { Video } from "../models/video.models.js";
import { Like } from "../models/like.models.js";
import { Comment } from "../models/comment.models.js";


//like the video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    if (!videoId) {
        throw new ApiError(400,"Video Id is required")
    }


    const exsitingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    if (exsitingLike) {
        await Like.findByIdAndDelete(exsitingLike._id)

        return res.status(200)
        .json(new ApiResponse(200, null, "video unliked successfully"))

    }

    const likedVideo = await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })

    if (!likedVideo) {
        throw new ApiError(500, "video liked is failed")
    }

    return res.status(200)
    .json(new ApiResponse(200, likedVideo, "Video is liked successfully"))


})


//like the comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params;

    if (!commentId) {
        throw new ApiError(400,"Comment Id is required")
    }


    const exsitingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })

    if (exsitingLike) {
        await Like.findByIdAndDelete(exsitingLike._id)

        return res.status(200)
        .json(new ApiResponse(200, null, "Comment unliked successfully"))

    }

    const likedComment = await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    if (!likedComment) {
        throw new ApiError(500, "Comment liked is failed")
    }

    return res.status(200)
    .json(new ApiResponse(200, likedComment, "Comment is liked successfully"))


})


// const toggleTweetLike = asyncHandler(async (req, res) => {
//     const {tweetId} = req.params
//     //TODO: toggle like on tweet
// }




export {
    toggleVideoLike,
    toggleCommentLike
}


