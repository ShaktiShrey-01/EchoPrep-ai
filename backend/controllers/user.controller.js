// User controller: registration/login/logout, profile, and token refresh.
// Cookies are httpOnly with sameSite/path tuned for cross-origin dev.
import { asyncHandler } from "../utils/asynchandler.js"; 
import { ApiError } from "../utils/apierror.js"; // Standardized casing (ApiError)
import { ApiResponse } from "../utils/apiresponse.js"; // Standardized casing (ApiResponse)
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {Interview} from "../models/Interview.js";
import Resume from "../models/Resume.js";

// --- Helper to Generate Tokens ---
// Uses User instance methods to mint access/refresh tokens and persist refresh.
const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

// ================= REGISTER =================
// ================= REGISTER (UPDATED FOR AUTO-LOGIN) =================
const registerUser = asyncHandler(async (req, res) => {
    const {username, email, password} = req.body;

    if([username, email, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }
    
    const existingUser = await User.findOne({ $or: [{username}, {email}] });
    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email, 
        password
    });
    
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // --- NEW: Generate Tokens & Cookies (Auto-Login) ---
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    // Auto-login after register: issue httpOnly cookies
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res.status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                { user: createdUser, accessToken, refreshToken }, 
                "User registered and logged in successfully"
            )
        );
});

// ================= LOGIN =================
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email && !password) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // --- FIX: Works on Localhost (HTTP) and Production (HTTPS) ---
    // Works on localhost (HTTP) and production (HTTPS)
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        );
});

// ================= LOGOUT =================
const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 } 
        },
        {
            new: true
        }
    );

    // Clear both cookies with same attributes used when setting
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    };

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

// ================= GET PROFILE =================
const getUserProfile = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

// ================= REFRESH ACCESS TOKEN =================
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Accept refresh token from cookie (preferred) or body fallback
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
        
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        };

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newRefreshToken
                },
                "Access token refreshed"
            )
        );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});
const deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // 1. Delete User Data (Optional but recommended to keep DB clean)
    await Interview.deleteMany({ user: userId });
    await Resume.deleteMany({ user: userId });

    // 2. Delete the User
    await User.findByIdAndDelete(userId);

    // 3. Clear Cookies
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Account deleted successfully"));
});
export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getUserProfile,
    refreshAccessToken ,
    deleteAccount
};