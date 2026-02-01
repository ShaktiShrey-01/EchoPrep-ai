// Interview model: aligns with controller expectations.
// Ensures required fields (e.g., overallScore) exist in feedback.
import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    // 1. CHANGED: Renamed 'role' to 'jobRole' to match Controller
    // Removed 'required: true' to prevent crashes
    jobRole: { 
        type: String, 
        default: "Technical Interview" 
    }, 

    difficulty: {
        type: String,
        default: "Medium"
    },

    // 2. ADDED: Conversation history (needed for chat view)
    conversation: [
        {
            role: { type: String, enum: ['user', 'assistant', 'system'] },
            content: { type: String }
        }
    ],
    
    // 3. UPDATED: Structure matches the Controller logic exactly
    feedback: {
        overallScore: { type: Number, default: 0 }, 
        technicalScore: { type: Number, default: 0 },
        communicationScore: { type: Number, default: 0 },
        
        // Helper rating (0-10) often used in UI
        rating: { type: Number, default: 0 }, 

        comments: { type: String, default: "Analysis pending" },
        strengths: [{ type: String }],
        improvements: [{ type: String }],
        actions: [{ type: String }]
    }
}, { timestamps: true });

// 4. EXPORT: Named export to match "import { Interview } from. 
export const Interview = mongoose.model("Interview", interviewSchema);