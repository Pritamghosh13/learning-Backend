import { asyncHandler } from "../utils/asyncHandeller.js"
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";


//get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId} = req.query;

    page = Number(page);
    limit = Number(limit);

    const filter = {};

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

    const videos = await Video.find(filter).skip(skip).limit(limit)

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






})import { asyncHandler } from "../utils/asyncHandeller.js"
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";


//get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId} = req.query;

    page = Number(page);
    limit = Number(limit);

    const filter = {};

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

    const videos = await Video.find(filter).skip(skip).limit(limit)

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
