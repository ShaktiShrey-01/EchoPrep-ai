// Auth middleware: extracts JWT from httpOnly cookie or Authorization header,
// verifies it, then attaches the sanitized user object to req.user.
import { asyncHandler } from "../utils/asynchandler.js"; // Note: .js extension is required
import { ApiError } from "../utils/apierror.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        // Prefer httpOnly cookie; fall back to Bearer header for flexibility
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
    
        // Throws on invalid/expired tokens; caught below
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        // Fetch a minimal user shape for downstream handlers
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});