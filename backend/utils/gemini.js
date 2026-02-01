import { GoogleGenerativeAI } from "@google/generative-ai";
export const generateFeedback = async (promptText) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing in .env file");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // --- CRITICAL FIX: Use the newer 2.0 model ---
        // gemini-1.5-flash is deprecated/retired as of late 2025.
        // gemini-2.0-flash is the current standard.
        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest", 
            generationConfig: { temperature: 0.2 } 
        });

        const result = await model.generateContent(promptText);
        const rawText = result.response.text();

        console.log("--- GEMINI RAW RESPONSE ---");
        // console.log(rawText); // Uncomment if you need to debug raw output

        // --- JSON CLEANER ---
        let jsonString = rawText.replace(/```json/g, "").replace(/```/g, "");
        const firstOpen = jsonString.indexOf('{');
        const lastClose = jsonString.lastIndexOf('}');

        if (firstOpen !== -1 && lastClose !== -1) {
            jsonString = jsonString.substring(firstOpen, lastClose + 1);
        }

        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Gemini Error:", error.message);
        
        // Fallback for valid flow even if AI fails
        return {
            overallScore: 75, 
            technicalScore: 75,
            communicationScore: 75,
            summary: "AI analysis unavailable (Model Error). Please check backend logs.",
            strengths: ["Participation"],
            improvements: ["Retry later"],
            actions: ["Check API Quota"]
        };
    }
};