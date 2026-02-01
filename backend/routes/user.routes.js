import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    getUserProfile ,    deleteAccount
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/authmiddleware.js";

const router = Router();

// Public Routes (No token needed)
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/delete-account").delete(verifyJWT, deleteAccount);
// Secured Routes (Token required)
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getUserProfile);

export default router;