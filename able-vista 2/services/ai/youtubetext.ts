/**
 * Defines the structure for a citation source returned by the API.
 */
interface Source {
    uri: string;
    title: string;
}

/**
 * Defines the return type for the summarization function.
 */
interface SummaryResult {
    summaryText: string;
    sources: Source[];
}

// --- Utility Function: Fetch with Exponential Backoff ---

/**
 * Utility function to perform fetch with exponential backoff for robustness.
 * @param url - The API endpoint URL.
 * @param options - Fetch request options.
 * @param maxRetries - Maximum number of retries.
 * @returns The JSON response from the API.
 */
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


// --- Main Summarization Function ---

/**
 * Summarizes a YouTube video using the Gemini API with Google Search grounding.
 * @param videoUrl The URL of the YouTube video to summarize.
 * @returns A promise that resolves to an object containing the summary text and citation sources.
 */
export async function summarizeYoutubeVideo(videoUrl: string): Promise<SummaryResult> {
    // 1. Validation (optional, but good practice)
    const urlRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    if (!urlRegex.test(videoUrl)) {
        throw new Error('Invalid YouTube video URL format.');
    }

    // 2. API Setup
    const API_KEY = process.env.GEMINI_API_KEY || "";
    const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    // 3. Prompt Construction
    const systemPrompt = "You are a helpful video summarizer. Find the video content (transcript, title, description, or an existing summary) based on the provided URL. Then, summarize the content in 3-5 concise, readable bullet points, starting with a brief introductory sentence. Do not include any text before the introductory sentence.";
    const userQuery = `Find the content for the YouTube video at this URL and summarize its main points. URL: ${videoUrl}`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        // Enable Google Search grounding to find the video content/transcript
        tools: [{ "google_search": {} }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    try {
        // 4. API Call
        const result = await fetchWithBackoff(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            const summaryText = candidate.content.parts[0].text;
            let sources: Source[] = [];

            // 5. Extract Grounding Sources
            const groundingMetadata = candidate.groundingMetadata;
            if (groundingMetadata && groundingMetadata.groundingAttributions) {
                sources = groundingMetadata.groundingAttributions
                    .map(attribution => ({
                        uri: attribution.web?.uri || '',
                        title: attribution.web?.title || 'External Source',
                    }))
                    .filter(source => source.uri && source.title);
            }

            return { summaryText, sources };

        } else {
            throw new Error('Could not generate a summary. The model might not have found sufficient data.');
        }

    } catch (err: any) {
        console.error('API Error during summarization:', err);
        throw new Error(`Failed to summarize video: ${err.message || 'Unknown API error.'}`);
    }
}

// Example usage (uncomment and replace URL to test in a Node.js/Browser environment)
/*
async function runExample() {
    try {
        const exampleUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Replace with an actual video URL
        console.log(`Attempting to summarize: ${exampleUrl}`);
        const result = await summarizeYoutubeVideo(exampleUrl);

        console.log('\n--- Summary ---');
        console.log(result.summaryText);
        console.log('\n--- Sources ---');
        result.sources.forEach(s => console.log(`- ${s.title}: ${s.uri}`));

    } catch (error) {
        console.error('Operation failed:', error.message);
    }
}
// runExample();
*/