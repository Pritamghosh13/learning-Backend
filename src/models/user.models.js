import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config({
    path: './.env'
})

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true, 
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, 
    },

    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true, 
    },

    // avatar: {
    //     type: String,  //cloudinary url
    //     required: true,
    // },

    coverImage: {
        type: String,
    },

    watchHistory: [
        {
        type: Schema.Types.ObjectId,
        ref: "Video"
        },
    ],

    password: {
        type: String,
        required: [true, "Password is reqiured"]
    },

    refreshToken: {
        type: String,
    }


}, 
{
    timestamps: true
})



//encypt the password.
userSchema.pre("save", async function (){       //middleware
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10)
   
})

//checking the password.
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)   //gives true, false
}


//generating access_token.
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,

        },
        process.env.ACCESS_SECRET_TOKEN,
        {
            expiresIn: process.env.ACCESS_SECRET_TOKEN_EXPIRY
        }
    )
}


//generating Refresh_token.
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_SECRET_TOKEN,
        {
            expiresIn: process.env.REFRESH_SECRET_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)