// Controller responsibilities:
// - Start sessions, append messages, sanitize transcripts
// - Generate structured feedback via AI
// - Persist records respecting schema (e.g., overallScore required)
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import  {Interview } from "../models/Interview.js";
import { generateFeedback } from "../utils/gemini.js";

// 1. Start a New Interview
const startInterview = asyncHandler(async (req, res) => {
    const { jobRole, techStack, difficulty } = req.body;

    if (!jobRole) {
        throw new ApiError(400, "Job Role is required");
    }

    // Create the initial session
    const interview = await Interview.create({
        user: req.user._id,
        jobRole,
        techStack: techStack || [],
        difficulty: difficulty || "Medium",
        conversation: [
            {
                role: "system", 
                content: `You are an interviewer for a ${jobRole} position.`
            },
            {
                role: "assistant", 
                content: `Hello! I see you are applying for the ${jobRole} role. Are you ready to begin?`
            }
        ]
    });

    return res.status(201).json(
        new ApiResponse(200, interview, "Interview started successfully")
    );
});

// 2. Add Message (User Answer -> AI Reply)
const addMessage = asyncHandler(async (req, res) => {
    const { interviewId } = req.params;
    const { role, content } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
        throw new ApiError(404, "Interview not found");
    }

    if (interview.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this interview");
    }

    // A. Save User's Message
    interview.conversation.push({ role, content });

    // B. Trigger AI Response if the user just spoke
    if (role === "user") {
        try {
            const aiReply = await generateAIResponse(
                interview.conversation, // Pass updated history
                interview.jobRole,
                interview.techStack
            );

            // C. Save AI Response
            interview.conversation.push({ role: "assistant", content: aiReply });
        } catch (error) {
            console.error("AI Generation failed:", error);
            // Optional: Add a fallback message if AI fails
            interview.conversation.push({ 
                role: "assistant", 
                content: "I'm having trouble processing that. Could you repeat?" 
            });
        }
    }

    // D. Save to DB
    await interview.save();

    return res.status(200).json(
        new ApiResponse(200, interview, "Message added")
    );
});

// 3. Get Single Interview
const getInterview = asyncHandler(async (req, res) => {
    const { interviewId } = req.params;
    const interview = await Interview.findById(interviewId);

    if (!interview) {
        throw new ApiError(404, "Interview not found");
    }

    return res.status(200).json(
        new ApiResponse(200, interview, "Interview fetched successfully")
    );
});

// 4. Get User's Interview History
const getUserInterviews = asyncHandler(async (req, res) => {
    const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, interviews, "History fetched successfully")
    );
});

// 5. End Interview & Generate Feedback
const endInterview = asyncHandler(async (req, res) => {
    const { transcript, resumeText, jobRole } = req.body;

    console.log("--- End Interview Request Received ---");

    // 1) SANITIZE TRANSCRIPT
    // Normalize shape so Mongoose validators ('role','content') won't fail
    let cleanConversation = [];
    if (transcript && Array.isArray(transcript)) {
        cleanConversation = transcript.map(msg => ({
            // FORCE 'role' to exist. If missing, default to 'user'
            role: (msg.role === 'model' || msg.role === 'assistant') ? 'assistant' : 'user',
            // FORCE 'content' to exist. If missing, default to empty string
            content: msg.content ? String(msg.content) : ""
        }));
    }

    // If transcript was empty/null, add one dummy msg to satisfy DB
    if (cleanConversation.length === 0) {
        cleanConversation.push({ role: "user", content: "Session started" });
    }

    // 2) GENERATE AI FEEDBACK
    // Wrap with safe defaults to withstand upstream AI outages
    let feedbackData = {
        overallScore: 0,
        technicalScore: 0,
        communicationScore: 0,
        summary: "Analysis pending.",
        strengths: [],
        improvements: [],
        actions: []
    };

    try {
        const prompt = `
            Analyze this interview. Resume: "${resumeText ? resumeText.substring(0, 300) : "N/A"}".
            Transcript: ${JSON.stringify(cleanConversation)}
            
            Return strictly valid JSON:
            {
                "overallScore": 50,
                "technicalScore": 50,
                "communicationScore": 50,
                "summary": "Summary here",
                "strengths": ["Point 1"],
                "improvements": ["Point 1"],
                "actions": ["Action 1"]
            }
        `;
        const aiResult = await generateFeedback(prompt);
        // If AI worked, overwrite defaults
        if (aiResult) feedbackData = { ...feedbackData, ...aiResult };

    } catch (err) {
        console.error("Gemini Error (Check API Key):", err.message);
        feedbackData.summary = "AI Service Unavailable (Check Server Logs)";
    }

    // 3) SAVE TO DB
    // Coerce numeric fields and supply required values to match schema
    try {
        const interviewRecord = await Interview.create({
            user: req.user._id,
            jobRole: jobRole || "Technical Interview",
            difficulty: "Medium",
            conversation: cleanConversation, 
            feedback: {
                // FORCE valid numbers. If undefined, use 0.
                overallScore: Number(feedbackData.overallScore) || 0,
                rating: Math.round((Number(feedbackData.overallScore) || 0) / 10),
                technicalScore: Number(feedbackData.technicalScore) || 0,
                communicationScore: Number(feedbackData.communicationScore) || 0,
                
                comments: feedbackData.summary || "No summary generated",
                strengths: feedbackData.strengths || [],
                improvements: feedbackData.improvements || []
            }
        });

        console.log("Saved Interview ID:", interviewRecord._id);

        return res.status(200).json(
            new ApiResponse(200, { 
                feedback: feedbackData, 
                interviewId: interviewRecord._id 
            }, "Feedback generated and saved")
        );

    } catch (dbError) {
        console.error("FATAL DB ERROR:", dbError);
        // Even if DB fails, return data to user so app doesn't crash
        return res.status(200).json(
            new ApiResponse(200, { feedback: feedbackData }, "Feedback generated (Save Failed)")
        );
    }
});
export { endInterview, startInterview, addMessage, getInterview, getUserInterviews };