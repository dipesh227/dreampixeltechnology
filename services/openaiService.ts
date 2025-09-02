import { AspectRatio } from '../types';
import * as apiConfigService from './apiConfigService';
import { RateLimitError } from './errors';

/**
 * Handles specific OpenAI API errors and provides user-friendly messages.
 * @param response The fetch Response object.
 * @returns A promise that resolves to an Error object.
 */
const handleOpenAIError = async (response: Response): Promise<Error> => {
    try {
        const errorData = await response.json();
        const errorMessage = errorData?.error?.message || response.statusText;

        if (response.status === 401) {
            return new Error("Invalid OpenAI API Key. Please check your key in API Settings.");
        }
        if (response.status === 429) {
            return new RateLimitError("OpenAI API rate limit or quota exceeded. Please wait and try again. For higher limits, consider adding your own key in API Settings.");
        }
         if (response.status === 400 && errorMessage.includes('billing')) {
            return new Error("Your OpenAI account has a billing issue. Please check your OpenAI dashboard.");
        }
        if (response.status >= 500) {
            return new Error("OpenAI's servers are experiencing issues. Please try again later.");
        }
        
        return new Error(`OpenAI API Error: ${errorMessage}`);
    } catch (e) {
        return new Error(`OpenAI API request failed with status: ${response.status} ${response.statusText}`);
    }
};

const fetchWithRetries = async (url: string, options: RequestInit): Promise<Response> => {
    const maxRetries = 2;
    const initialDelay = 1500;
    let attempt = 0;

    while (attempt <= maxRetries) {
        const response = await fetch(url, options);

        if (response.ok) {
            return response;
        }
        
        const handledError = await handleOpenAIError(response);

        if (attempt >= maxRetries || !(handledError instanceof RateLimitError)) {
            throw handledError;
        }
        
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`OpenAI API rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
    }
    throw new Error("Exceeded max retries for OpenAI fetch. This should not happen.");
};

/**
 * Generates text using the OpenAI API with gpt-4-turbo.
 * @param prompt The prompt to send to the AI.
 * @returns A promise that resolves to the generated JSON string.
 */
export const generateText = async (prompt: string): Promise<string> => {
    const apiKey = apiConfigService.getApiKey();
    if (!apiKey) {
        throw new Error("OpenAI API key is not configured. Please add it in API Settings.");
    }

    try {
        const response = await fetchWithRetries("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                messages: [
                     { role: "system", content: "You are an expert assistant that always responds in valid, raw JSON format as requested by the user, without any markdown formatting or explanatory text." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            })
        });

        const result = await response.json();
        const content = result?.choices?.[0]?.message?.content;

        if (!content || typeof content !== 'string') {
            console.error("Could not find text data in OpenAI response", result);
            throw new Error("Unsupported response format from OpenAI: No content found.");
        }
        
        return content;

    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("A network error occurred while contacting the OpenAI API.");
    }
};

/**
 * Generates an image using the OpenAI DALL-E 3 model.
 * @param prompt The text prompt for image generation.
 * @param aspectRatio The desired aspect ratio for the image.
 * @returns A promise that resolves to the base64 encoded image string or null.
 */
export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
    const apiKey = apiConfigService.getApiKey();
    if (!apiKey) {
        throw new Error("OpenAI API key is not configured.");
    }

    // DALL-E 3 supports '1024x1024', '1792x1024' (landscape), '1024x1792' (portrait).
    // Map our supported aspect ratios to the closest DALL-E 3 size.
    let size: '1024x1024' | '1792x1024' | '1024x1792';
    switch (aspectRatio) {
        case '16:9':
        case '1.91:1': // Both are landscape
            size = '1792x1024';
            break;
        case '9:16':
        case '4:5': // Both are portrait
            size = '1024x1792';
            break;
        case '1:1': // Square
        default:
            size = '1024x1024';
            break;
    }
    
    // For ratios that don't perfectly match, add an instruction to the prompt.
    if (aspectRatio === '4:5' || aspectRatio === '1.91:1') {
        prompt += `\nCRITICAL: The final image composition MUST have a clear aspect ratio of ${aspectRatio}. Add letterboxing if necessary to achieve this exact ratio.`
    }

    try {
        const response = await fetchWithRetries("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: size,
                quality: "hd",
                response_format: "b64_json"
            })
        });

        const result = await response.json();
        const base64Image = result?.data?.[0]?.b64_json;

        if (base64Image) {
            return base64Image;
        }
        
        console.error("Could not find image data in OpenAI DALL-E response", result);
        throw new Error("Unsupported response format from DALL-E.");

    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("A network error occurred while contacting the OpenAI API.");
    }
};

/**
 * Validates an OpenAI API key by making a lightweight request.
 * @param apiKey The API key to validate.
 * @returns A promise resolving to an object indicating if the key is valid.
 */
export const validateApiKey = async (apiKey: string): Promise<{ isValid: boolean, error?: string }> => {
    if (!apiKey) return { isValid: false };
    try {
        const response = await fetch("https://api.openai.com/v1/models", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
            }
        });

        if (response.status === 401) return { isValid: false, error: "Invalid API Key." };
        if (response.ok) return { isValid: true };
        
        const handledError = await handleOpenAIError(response);
        if (handledError instanceof RateLimitError) {
            // Don't treat rate limit on validation as an invalid key
            return { isValid: true, error: 'Validation rate limited, assuming key is valid for now.' };
        }
        
        return { isValid: false, error: handledError.message || "Validation failed." };
    } catch (e) {
        return { isValid: false, error: "Network error during validation." };
    }
};