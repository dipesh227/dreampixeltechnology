import * as apiConfigService from './apiConfigService';

/**
 * Handles specific Perplexity API errors and provides user-friendly messages.
 * @param response The fetch Response object.
 * @returns A promise that resolves to an Error object.
 */
const handlePerplexityError = async (response: Response): Promise<Error> => {
    try {
        const errorData = await response.json();
        const errorMessage = errorData?.error?.message || response.statusText;

        if (response.status === 401) {
            return new Error("Invalid Perplexity API Key. Please check your key in API Settings and try again.");
        }
        if (response.status === 429) {
            return new Error("Perplexity API rate limit or quota exceeded. Please check your account usage and try again later.");
        }
        if (response.status >= 500) {
            return new Error("Perplexity's servers are experiencing issues. Please try again later.");
        }
        
        return new Error(`Perplexity API Error: ${errorMessage}`);
    } catch (e) {
        return new Error(`Perplexity API request failed with status: ${response.status} ${response.statusText}`);
    }
};

/**
 * Generates text using the Perplexity API with the Sonar model.
 * @param prompt The prompt to send to the AI.
 * @returns A promise that resolves to the generated JSON string.
 */
export const generateText = async (prompt: string): Promise<string> => {
    const apiKey = apiConfigService.getApiKey();
    if (!apiKey) {
        throw new Error("Perplexity API key is not configured. Please add it in API Settings.");
    }

    try {
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3-sonar-large-32k-chat",
                messages: [
                    { role: "system", content: "You are an expert assistant that always responds in valid, raw JSON format as requested by the user, without any markdown formatting or explanatory text." },
                    { role: "user", content: prompt }
                ],
            })
        });

        if (!response.ok) {
            throw await handlePerplexityError(response);
        }

        const result = await response.json();
        const content = result?.choices?.[0]?.message?.content;

        if (!content || typeof content !== 'string') {
            console.error("Could not find text data in Perplexity response", result);
            throw new Error("Unsupported response format from Perplexity: No content found.");
        }
        
        return content;

    } catch (error) {
        if (error instanceof Error) {
            throw error; // Re-throw known errors to be displayed in the UI
        }
        // Catch unexpected issues like network failures
        throw new Error("A network error occurred while contacting the Perplexity API. Please check your connection.");
    }
};


export const validateApiKey = async (apiKey: string): Promise<{ isValid: boolean, error?: string }> => {
    if (!apiKey) return { isValid: false };
    try {
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3-sonar-small-32k-chat", // use a cheaper model for validation
                messages: [{ role: "user", content: "test" }],
                max_tokens: 1
            })
        });

        if (response.status === 401) return { isValid: false, error: "Invalid API Key." };
        if (response.ok) return { isValid: true };
        
        const errorData = await response.json();
        return { isValid: false, error: errorData?.error?.message || "Validation failed." };
    } catch (e) {
        return { isValid: false, error: "Network error during validation." };
    }
};