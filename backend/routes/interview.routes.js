import { Router } from "express";
import { verifyJWT } from "../middlewares/authmiddleware.js"; 
import { 
    endInterview, 
    startInterview, 
    addMessage,
    getUserInterviews, // <--- MAKE SURE THIS IS IMPORTED
    getInterview       
} from "../controllers/interview.controller.js";

const router = Router();
router.use(verifyJWT);

// --- THIS IS THE ROUTE YOU WERE MISSING ---
router.route("/history").get(getUserInterviews);

// Existing Routes
router.route("/start").post(startInterview);
router.route("/end").post(endInterview);
router.route("/:interviewId/message").post(addMessage);

// Optional: for fetching specific feedback details
router.route("/:interviewId").get(getInterview);

export default router;