import { NextRequest, NextResponse } from "next/server";

interface ChatRequest {
    message: string;
    lessonContent: string;
    lessonTitle?: string;
    courseTitle?: string;
    conversationHistory: Array<{ role: string; text: string }>;
}

// Utility function to perform fetch with exponential backoff for robustness
async function fetchWithBackoff(url: string, options: RequestInit, maxRetries: number = 5): Promise<any> {
    let delay = 1000;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return await response.json();
            }
            if (response.status === 429 || response.status >= 500) {
                // Too Many Requests or Server Error, retry
                console.warn(`API call failed with status ${response.status}. Retrying in ${delay / 1000}s...`);
                await new Promise(res => setTimeout(res, delay));
                delay *= 2; // Exponential increase
                continue;
            }
            // Non-retryable error
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error; // Re-throw after max retries
            }
            console.error('Fetch attempt failed:', error);
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: ChatRequest = await request.json();
        const { message, lessonContent, lessonTitle, courseTitle, conversationHistory } = body;

        // Validate required fields
        if (!message) {
            return NextResponse.json(
                { success: false, error: "Message is required" },
                { status: 400 }
            );
        }

        // Get Gemini API key from environment
        const API_KEY = process.env.GEMINI_API_KEY || "";
        if (!API_KEY) {
            console.error("GEMINI_API_KEY is not set in environment variables");
            return NextResponse.json(
                { success: false, error: "AI service is not configured" },
                { status: 500 }
            );
        }

        const MODEL_NAME = "gemini-2.0-flash-exp";
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        // Build the system instruction
        const systemInstruction = `You are an AI learning assistant helping students understand lesson content. 
${lessonContent ? `The current lesson content is:\n\n${lessonContent}\n\n` : ""}
${lessonTitle ? `Lesson Title: ${lessonTitle}\n` : ""}
${courseTitle ? `Course: ${courseTitle}\n` : ""}

Your role is to:
1. Answer questions based on the lesson content provided above
2. Explain concepts clearly and concisely
3. Provide examples when helpful
4. Be encouraging and supportive
5. If asked about something not in the lesson content, politely mention that and provide general guidance if possible

Keep your responses concise and student-friendly. Use simple language and break down complex topics.`;

        // Build conversation history for context
        const contents = [];

        // Add conversation history
        if (conversationHistory && conversationHistory.length > 0) {
            for (const msg of conversationHistory) {
                contents.push({
                    role: msg.role === "user" ? "user" : "model",
                    parts: [{ text: msg.text }]
                });
            }
        }

        // Add current user message
        contents.push({
            role: "user",
            parts: [{ text: message }]
        });

        const payload = {
            contents: contents,
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            },
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        // Call Gemini API with retry logic
        const result = await fetchWithBackoff(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            const aiResponse = candidate.content.parts[0].text;

            return NextResponse.json({
                success: true,
                response: aiResponse,
            });
        } else {
            throw new Error('Could not generate a response. The model might not have returned valid content.');
        }

    } catch (error: any) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal server error"
            },
            { status: 500 }
        );
    }
}
