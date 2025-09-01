
import * as apiConfigService from './apiConfigService';

const handlePerplexityError = async (response: Response) => {
    const errorBody = await response.json().catch(() => ({ error: { message: response.statusText } }));
    const errorMessage = errorBody?.error?.message || JSON.stringify(errorBody);

    switch (response.status) {
        case 401:
            throw new Error("Invalid Perplexity API Key. Please check the key in your API Settings.");
        case 429:
            throw new Error("You've exceeded your Perplexity API rate limit or quota. Please check your account status and try again later.");
        case 500:
            throw new Error("The Perplexity service is currently experiencing an internal server error. Please try again later.");
        default:
            throw new Error(`Perplexity API Error (${response.status}): ${errorMessage}`);
    }
};

export const generateText = async (prompt: string): Promise<string> => {
    const apiKey = apiConfigService.getApiKey();
    if (!apiKey) throw new Error("Perplexity API key is not configured. Please set it in API Settings.");

    try {
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3-sonar-large-32k-chat",
                messages: [
                    { role: "system", content: "You are an expert assistant. Your only output format is a single, valid JSON object. Do not include any other text, explanations, or markdown formatting around the JSON." },
                    { role: "user", content: prompt }
                ],
            })
        });

        if (!response.ok) {
            await handlePerplexityError(response);
        }

        const result = await response.json();
        let content = result?.choices?.[0]?.message?.content;

        if (!content) {
            console.error("Could not find text data in Perplexity response", result);
            throw new Error("Unsupported response format from Perplexity: No content found.");
        }
        
        // Clean up potential markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            content = jsonMatch[1].trim();
        }
        
        return content.trim();

    } catch (error) {
        if (error instanceof Error && (
            error.message.startsWith('Perplexity API Error') || 
            error.message.startsWith('Invalid Perplexity API Key')
        )) {
            throw error;
        }
        console.error("Network or unexpected error contacting Perplexity:", error);
        throw new Error("A network error occurred while contacting Perplexity. Please check your internet connection and try again.");
    }
};
