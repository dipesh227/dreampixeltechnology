import { AspectRatio } from '../types';
import * as apiConfigService from './apiConfigService';

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
            return new Error("OpenAI API rate limit or quota exceeded. Please check your account usage and try again later.");
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
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

        if (!response.ok) {
            throw await handleOpenAIError(response);
        }

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

    // DALL-E 3 only supports '1024x1024', '1792x1024', '1024x1792'. We map our aspect ratios.
    let size: '1024x1024' | '1792x1024' | '1024x1792';
    switch (aspectRatio) {
        case '16:9':
            size = '1792x1024';
            break;
        case '9:16':
            size = '1024x1792';
            break;
        case '1:1':
        case '4:5': // DALL-E 3 doesn't support 4:5, so we use 1:1 as the closest square-like option.
        case '1.91:1': // Closest is 16:9 landscape
             size = '1024x1024';
             if (aspectRatio !== '1:1') {
                prompt += `\nCRITICAL: The final image composition MUST have a clear aspect ratio of ${aspectRatio}. Add letterboxing if necessary to achieve this exact ratio.`
             }
             if(aspectRatio === '1.91:1') size = '1792x1024';
            break;
        default:
            size = '1024x1024';
    }

    try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
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

        if (!response.ok) {
            throw await handleOpenAIError(response);
        }

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
        
        const errorData = await response.json();
        return { isValid: false, error: errorData?.error?.message || "Validation failed." };
    } catch (e) {
        return { isValid: false, error: "Network error during validation." };
    }
};