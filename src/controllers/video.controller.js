
import { asyncHandler } from "../utils/asyncHandeller.js"
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";

//get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId} = req.query;

    page = Number(page);
    limit = Number(limit);

    const filter = {};
    const sortOptions = {};

    sortOptions[sortBy] = sortType === "asc" ? 1: -1;

    if(query){
        filter.$or = [
            {tittle: {$regex: query, $options: "i"}},
            {description: {$regex: query, $options: "i"}},
            
        ]
    }

    if(userId){
        filter.owner = userId;
    }

    const skip = (page - 1) * limit;

    const videos = await Video.find(filter).skip(skip).limit(limit).sort(sortOptions)

    const totalVideos = await Video.countDocuments(filter);

    return res.status(200)
    .json({
        success: true,
        page,
        limit,
        totalVideos,
        totalPages : Math.ceil(totalVideos/limit),
        message: "Video searched successfully"

    })






})


//publish a video with thumbnail, title and description.
const isPublishAVideo = asyncHandler(async (req, res) => {
    const {tittle, description} = req.body;

    if (!tittle || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    console.log(req.files);
    console.log(videoLocalPath);
    console.log(thumbnailLocalPath);

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    

    const videoUpload = await uploadOnCloudinary(videoLocalPath);

    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoUpload){
        throw new ApiError(500, "Video upload failed");
    }

    const video = await Video.create({
        tittle, 
        description,
        videofile: videoUpload.url,
        thumbnail: thumbnailUpload.url || "",
        duration: videoUpload.duration,
        owner: req.user?._id
    });

    console.log(video._id);
    

    if (!video) {
        throw new ApiError(500, "Failed to publish video")
    }

    return res.status(200)
    .json(new ApiResponse(
        200,
        video,
        "Video published successfully"

    ))


})


//get video by its id
const getVideoById = asyncHandler(async(req, res) => {
    // console.log(req.params);
    const {videoId} = req.params;
    // console.log(videoId);
    
    const video = await Video.findById(videoId).populate("owner", "username");

    // console.log(video);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200)
    .json(new ApiResponse(200, video, "Video fetch Successfully"))
    

})


export {
    isPublishAVideo,
    getAllVideos,
    getVideoById

}

