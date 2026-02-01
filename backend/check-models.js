import { GoogleGenerativeAI } from "@google/generative-ai";
// Replace with your actual key
const genAI = new GoogleGenerativeAI("AIzaSyBsm-AVz7_9bsrXY4-Pcl8cQUHSZqhPhZo"); 

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