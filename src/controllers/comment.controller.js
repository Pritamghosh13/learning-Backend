import { asyncHandler } from "../utils/asyncHandeller.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";


//adding comment to someone's video.
const addComment = asyncHandler(async (req, res) => {
    
    const {videoId} = req.params;
    const {content} = req.body;    

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "video not found")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    const createdComment = await Comment.findById(comment._id).populate("owner", "username fullname")

    if (!createdComment) {
        throw new ApiError(500, "comment does not store")
    }

    return res.status(200)
    .json(new ApiResponse(
        200, 
        createdComment,
        "Comment added successfully"
    ))




})


//updating comment
const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const {content} = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "The comment need to be changed")
    }

    const comment = await Comment.findOne({
        _id: commentId,
        owner: req.user?._id
    })

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    comment.content = content;

    await comment.save();

    return res.status(200)
    .json(new ApiResponse(200 , comment, "Comment updated successfully"))
    

})


//delete comment
const deleteComment = asyncHandler(async(req, res) => {
    const {commentId} = req.params;

    const comment = await Comment.deleteOne({
        _id: commentId,
        owner: req.user?._id
    })

    if (comment.deletedCount === 0) {
    throw new ApiError(404, "Comment not found or unauthorized");
    }

    return res.status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"))
})



//get all comment of a video
const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    let {page = 1, limit = 10} = req.query

    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;

    const comments = await Comment.find({
        video: videoId
    }).skip(skip)
    .limit(limit)
    .populate("owner", "username fullname")

    const totalComment = await Comment.countDocuments({
        video: videoId
    })

    return res.status(200).
    json({
        sucess: true,
        page,
        limit,
        totalComment,
        totalPages: Math.ceil(totalComment/limit),
        comments,
        message: "Comment fetched successfully"
    })

})




export {
    addComment,
    updateComment,
    deleteComment,
    getVideoComments
    

}