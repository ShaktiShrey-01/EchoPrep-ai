import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing. Add it to backend/.env before running this script.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // There isn't a direct 'listModels' helper in the simple client, 
    // but trying to run this will confirm if gemini-pro works.
    const result = await model.generateContent("Test");
    console.log("Gemini-Pro is WORKING!");
  } catch (e) {
    console.log("Error:", e.message);
  }
}
listModels();