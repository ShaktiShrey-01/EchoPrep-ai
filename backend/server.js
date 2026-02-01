// Express app bootstrap: loads env, configures JSON/cookies, CORS, routes, and error handling
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js"; // Note the .js extension!
import { errorHandler } from "./middlewares/errormidleware.js";
// Import Routes
import userRouter from './routes/user.routes.js';
import interviewRouter from './routes/interview.routes.js';
// Note: Uncomment these only after you actually create the files to avoid crashes
// import resumeRouter from './routes/resume.routes.js';
// import interviewRouter from './routes/interview.routes.js';
import resumeRouter from './routes/resume.routes.js';

// Load env vars
dotenv.config();

// Initialize App
const app = express();

// Middleware order matters: body parsing and cookies must precede auth/CORS-sensitive routes
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies for httpOnly JWTs

// Allow dev and production frontends to send credentials (cookies)
// Configure via env: CORS_ORIGINS="http://localhost:5173,https://echoprep.netlify.app"
// Also support legacy CORS_ORIGIN
const originsEnv = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "http://localhost:5173,https://echoprep.netlify.app";
const allowedOrigins = originsEnv.split(",").map(o => o.trim());
const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (no origin)
    if (!origin) return callback(null, true);

    // Allow exact matches from env, plus any Netlify subdomain
    const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/[^/]+\.netlify\.app$/.test(origin);
    if (isAllowed) return callback(null, true);

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};
app.use(cors(corsOptions));
// Ensure preflight requests are handled
app.options("*", cors(corsOptions));

// Database Connection
connectDB();

// Test Route
app.get("/", (req, res) => {
    res.send("EchoPrep API is running...");
});

// Mount API routes under versioned prefixes
app.use('/api/v1/users', userRouter);
app.use("/api/v1/interview", interviewRouter);
app.use('/api/v1/resume', resumeRouter);
// app.use('/api/feedback', interviewRouter);

const PORT = process.env.PORT || 5000;
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});