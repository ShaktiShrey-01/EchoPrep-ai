import mongoose from 'mongoose';

const resumeSchema = mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    originalName: { type: String, required: true }, // "shakti_resume.pdf"
    storedName: { type: String, required: true },   // "171238823-shakti_resume.pdf" (Unique name)
    atsScore: { type: Number, default: 0 },
    feedback: {
        status: { type: String, default: "Pending" },
        message: { type: String },
        issues: [{ type: String }] // Array of issues found
    }
}, { timestamps: true });

export default mongoose.model('Resume', resumeSchema);