import { Router } from "express";
import multer from "multer";
import { extractTextFromPDF } from "../utils/resumeParser.js";
import { verifyJWT } from "../middlewares/authmiddleware.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { uploadResume, checkATSScore } from "../controllers/resume.controller.js";
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", verifyJWT, upload.single("resume"), async (req, res) => {
    try {
        // --- DEBUG LOGS (Check your backend terminal when you upload) ---
        console.log("1. Upload Route Hit");
        console.log("2. User ID:", req.user?._id);
        console.log("3. File Received:", req.file ? "Yes" : "No");

        if (!req.file) {
            throw new ApiError(400, "No file uploaded. Make sure the key is 'resume'");
        }

        // 4. Try Parsing
        const resumeText = await extractTextFromPDF(req.file.buffer);
        console.log("4. PDF Parsed. Text Length:", resumeText.length);

        return res.status(200).json(
            new ApiResponse(200, { resumeText }, "Resume parsed successfully")
        );
    } catch (error) {
        console.error("!!! SERVER ERROR !!!", error); // This prints the real cause
        res.status(500).json(new ApiError(500, error.message || "Server Error"));
    }
});
router.post("/ats-check", verifyJWT, upload.single("resume"), checkATSScore);
export default router;