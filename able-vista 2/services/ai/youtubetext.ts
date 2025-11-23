import { GoogleGenerativeAI } from "@google/generative-ai";
import { YoutubeTranscript } from "youtube-transcript";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function extractTextFromYoutube(videoUrl: string): Promise<string> {
    try {
        // 1. Fetch the transcript from YouTube
        // YoutubeTranscript returns an array of objects: { text: string, duration: number, offset: number }
        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoUrl);

        if (!transcriptItems || transcriptItems.length === 0) {
            throw new Error("No transcript found for this video.");
        }

        // 2. Combine the transcript into a single string
        const rawTranscript = transcriptItems.map((item) => item.text).join(" ");

        // 3. Use Gemini to clean up and format the text
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are a helpful assistant. I will provide you with a raw transcript from a YouTube video.
      Your task is to clean up the text, fix any obvious speech-to-text errors, punctuation, and formatting to make it a readable article or summary.
      Keep the original meaning and content intact.
      
      Raw Transcript:
      ${rawTranscript}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error("Error extracting text from YouTube:", error);
        throw new Error("Failed to extract text from YouTube video. The video might not have captions enabled or is restricted.");
    }
}

