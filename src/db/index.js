import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {   //async- await always returns a promise.
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\nMongooDB connected !! DB Host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MongoDB connection failed !! ",error);
        process.exit(1)
    }
}

export default connectDB