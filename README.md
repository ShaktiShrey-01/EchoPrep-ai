# 🎙️ EchoPrep AI - The Future of Technical Interview Preparation

![EchoPrep AI Banner](https://via.placeholder.com/1200x400?text=EchoPrep+AI+|+MERN+%2B+Generative+AI)

> **"Master Your Interview Before You Walk In the Door."**
> A sophisticated **MERN Stack + GenAI** platform that creates realistic, voice-based technical interviews tailored to your unique resume.

---

## 🚀 Live Demonstration
experience the future of interview prep here:
- **🌐 Live App:** [https://echoprep.netlify.app/]


---

## 📖 Project Overview

### 🛑 The Problem
Job hunting is stressful. Candidates often face:
1.  **Interview Anxiety:** The fear of speaking technically under pressure.
2.  **Lack of Feedback:** Rejections often come without explanation.
3.  **Generic Preparation:** standard "Top 100 questions" lists don't account for a candidate's specific project experience or resume gaps.

### ✅ The EchoPrep Solution
**EchoPrep AI** is not just a chatbot; it is an **AI-powered Interview Simulator**. It bridges the gap between preparation and performance by creating a hyper-realistic interview environment.

Users upload their PDF resumes, and our **Generative AI engine** instantly analyzes their tech stack (e.g., React, Node, Python). It then orchestrates a **voice-to-voice** conversation where an AI interviewer asks relevant, probing questions, listens to the candidate's spoken answers, and provides a comprehensive performance report—just like a real hiring manager would.

---

## 🌟 Key Features

### 1. 📄 Intelligent Resume Parsing
* **PDF Analysis:** Automatically extracts key skills, projects, and experience using Node.js buffers and regex logic.
* **Contextual Understanding:** The AI understands that a "MERN Developer" should be asked about *React Hooks* and *MongoDB Aggregations*, not just generic coding questions.

### 2. 🗣️ Ultra-Low Latency Voice Interface
* **Real-Time Conversation:** Speaks and listens instantly using **Vapi AI**, minimizing the awkward "bot pause."
* **Interruption Handling:** You can cut the AI off to correct yourself or add a point, just like in a real human conversation.
* **Visual Feedback:** Dynamic audio visualizers (using Web Audio API) react to the user's voice volume for an immersive UI experience.

### 3. 🤖 Smart ATS (Applicant Tracking System) Scanner
* **Scoring Engine:** Rates your resume from 0-100 based on industry-standard parsing logic.
* **Gap Analysis:** Identifies missing keywords (e.g., "CI/CD," "Docker") that might be getting you rejected.
* **Actionable Fixes:** Provides specific bullet-point advice to improve your CV's impact.

### 4. 📊 Comprehensive Performance Report
* **Multi-Metric Grading:** Scores candidates on **Technical Accuracy**, **Communication Clarity**, and **Subject Depth**.
* **JSON-Structured Data:** Uses Gemini 2.0 to guarantee consistent, parsable feedback data every time.

---

## 🧠 Technical Architecture & Design Decisions

Building an AI wrapper is easy; building a seamless AI *experience* is hard. Here is why we chose this specific stack:

### 🎤 Why Vapi AI for Voice? (The Orchestrator)
We considered building a custom pipeline using Deepgram (STT) + OpenAI (LLM) + ElevenLabs (TTS), but we chose **Vapi AI** for three reasons:
1.  **Latency:** Vapi optimizes the "Time to First Byte" (TTFB), ensuring the AI responds in milliseconds, not seconds.
2.  **Turn-Taking Logic:** Vapi handles the complex logic of "Is the user done talking?" vs. "Is the user just pausing to think?", which is incredibly difficult to code manually.
3.  **State Management:** It maintains the conversation history automatically during the active call.

### 🧠 Why Google Gemini 2.0 for Feedback? (The Analyst)
While Vapi handles the *chat*, we delegate the heavy lifting of *analysis* to **Google Gemini**.
* **Cost Efficiency:** Gemini 2.0 Flash offers a massive context window at a fraction of the cost of GPT-4, allowing us to send the *entire* interview transcript for analysis.
* **Structured JSON Output:** We rely heavily on Gemini's ability to output strict JSON. This ensures our frontend charts always render correctly, preventing the "white screen of death" caused by malformed AI responses.

### ⚛️ Why the MERN Stack?
* **React (Vite):** Needed for the complex, high-frequency state updates required by the audio visualizers and real-time timers.
* **Node/Express:** The non-blocking I/O model is perfect for handling concurrent API requests to Vapi and Gemini without freezing the server.
* **MongoDB:** Its flexible schema allows us to store varied interview structures (different lengths, different question types) without rigid SQL migrations.

---

## 🛠️ Complete Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | Client-side rendering & State management |
| **Styling** | Tailwind CSS | Rapid, responsive UI development & Animations |
| **Icons** | Lucide React | Modern, clean SVG iconography |
| **Backend** | Node.js & Express | API Gateway & Business Logic |
| **Database** | MongoDB Atlas | Cloud NoSQL Database |
| **Auth** | JWT (JSON Web Tokens) | Stateless, secure user authentication |
| **File Handling** | Multer | Processing PDF uploads in memory buffers |
| **Voice AI** | Vapi SDK | Voice activity detection & speech synthesis |
| **LLM** | Google Gemini 2.0 Flash | Transcript analysis & ATS Scoring |
| **Deployment** | Render (Back) / Netlify (Front) | CI/CD Pipeline & Hosting |

---

## 🚦 How It Works (User Journey)

1.  **Registration:** User creates an account (JWT Token issued).
2.  **Resume Upload:** User uploads `resume.pdf`. Backend parses text and caches it.
3.  **Interview Initialization:**
    * Frontend initializes Vapi with the parsed resume as "System Context."
    * Microphone permission is granted.
4.  **The Interview:**
    * AI asks a question based on the resume.
    * User answers via microphone.
    * Vapi transcribes audio -> sends to LLM -> speaks response.
5.  **Session End:**
    * User clicks "End Interview."
    * Frontend retrieves the full conversation transcript from Vapi.
    * Transcript is sent to the `/api/v1/interview/end` endpoint.
6.  **Analysis:**
    * Backend sends transcript + Resume to **Gemini**.
    * Gemini grades the interview and returns JSON.
    * Result is saved to MongoDB and displayed to the user.

---

## ⚙️ Local Development Guide

Want to run this on your machine?

### Prerequisites
* Node.js v18+
* MongoDB Atlas Account
* Google AI Studio Key
* Vapi.ai Account

### 1. Backend Setup
```bash
git clone [https://github.com/your-username/echoprep-ai.git](https://github.com/your-username/echoprep-ai.git)
cd echoprep-ai/backend
npm install

# Create .env file
echo "PORT=5000" >> .env
echo "MONGODB_URI=mongodb+srv://..." >> .env
echo "GEMINI_API_KEY=AIzaSy..." >> .env
echo "ACCESS_TOKEN_SECRET=your_secret_key" >> .env
echo "REFRESH_TOKEN_SECRET=your_refresh_key" >> .env
echo "CORS_ORIGIN=http://localhost:5173" >> .env

npm run dev

cd ../frontend
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:5000/api/v1" >> .env
echo "VITE_VAPI_PUBLIC_KEY=your_vapi_public_key" >> .env

npm run dev
