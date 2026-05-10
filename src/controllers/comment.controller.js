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




export {
    addComment,
    updateComment
    

}