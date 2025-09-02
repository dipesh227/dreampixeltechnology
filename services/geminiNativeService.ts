import { GoogleGenAI, Modality } from "@google/genai";
import { UploadedFile, AspectRatio } from '../types';
import * as apiConfigService from './apiConfigService';
import { RateLimitError, RetriableError, QuotaExceededError } from "./errors";

const getAiClient = (apiKeyOverride?: string) => {
    const apiKey = apiKeyOverride || apiConfigService.getApiKey();
    if (!apiKey) {
        // FIX: Updated error message to refer to the standard API_KEY environment variable.
        throw new Error("API key is not configured. Please ensure the API_KEY environment variable is set.");
    }
    return new GoogleGenAI({ apiKey });
};

const handleGeminiError = (error: unknown): Error => {
    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('quota exceeded') || errorMessage.includes('daily limit')) {
            return new QuotaExceededError("You have exceeded your daily Gemini API quota. Your free usage will reset tomorrow. For higher limits, you can upgrade your Google AI account to a paid plan.");
        }
        if (errorMessage.includes('api key not valid')) {
            // FIX: Updated error message to refer to the standard API_KEY environment variable.
            return new Error("The provided Gemini API key is invalid. Please check your API_KEY environment variable.");
        }
        if (errorMessage.includes('429') || errorMessage.includes('resource_exhausted')) {
            return new RateLimitError("Rate limit exceeded. You've made too many requests to the Gemini API recently. Please wait a minute and try again.");
        }
        if (errorMessage.includes('safety')) {
            return new Error("The request was blocked due to safety policies. Please adjust your prompt or images and try again.");
        }
        if (errorMessage.includes('fetch failed') || errorMessage.includes('networkerror')) {
             return new RetriableError("A network error occurred. Please check your internet connection and try again.");
        }
        return new Error(`An error occurred with the Gemini API: ${error.message}`);
    }
    return new Error("An unknown error occurred while communicating with the Gemini API.");
};

const withRetries = async <T>(apiCall: () => Promise<T>): Promise<T> => {
    const maxRetries = 2;
    const initialDelay = 1500;
    let attempt = 0;

    while (attempt <= maxRetries) {
        try {
            return await apiCall();
        } catch (error) {
            const handledError = handleGeminiError(error);
            
            // Check for the base RetriableError class to handle both rate limits and network errors
            if (attempt >= maxRetries || !(handledError instanceof RetriableError)) {
                throw handledError;
            }

            const delay = initialDelay * Math.pow(2, attempt);
            const message = (handledError instanceof RateLimitError)
                ? `Gemini API rate limit hit.`
                : `A transient network error occurred.`;
            
            console.warn(`${message} Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            attempt++;
        }
    }
    // This part should be unreachable
    throw new Error("Exceeded max retries. This should not happen.");
};

export const generateText = async (prompt: string, jsonSchema: object): Promise<string> => {
    return withRetries(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: jsonSchema,
            },
        });
        return response.text.trim();
    });
};

export const generateImage = async (prompt: string, images: UploadedFile[]): Promise<string | null> => {
     return withRetries(async () => {
        const ai = getAiClient();
        const imageParts = images.map(file => ({
            inlineData: { data: file.base64, mimeType: file.mimeType }
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    ...imageParts,
                    { text: prompt }
                ]
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT]
            }
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return part.inlineData.data;
            }
        }
        return null;
    });
};

export const generateImageFromText = async (prompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
    return withRetries(async () => {
        const ai = getAiClient();
        
        const promptWithAspectRatio = `${prompt}\n\nCRITICAL: The final image's aspect ratio MUST be precisely ${aspectRatio}.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { text: promptWithAspectRatio }
                ]
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT]
            }
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return part.inlineData.data;
            }
        }
        
        console.warn("Gemini model did not return an image for the text-only prompt.");
        return null;
    });
};

export const validateApiKey = async (apiKey: string): Promise<{ isValid: boolean, error?: string }> => {
    // FIX: Updated error message to refer to the standard API_KEY environment variable.
    if (!apiKey) return { isValid: false, error: "API key cannot be empty. Please ensure the API_KEY environment variable is set." };
    try {
        const ai = getAiClient(apiKey);
        // Use a very simple, fast model and request to validate the key
        await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "test",
            config: {
                maxOutputTokens: 1,
                thinkingConfig: { thinkingBudget: 0 } // disable thinking for speed
            },
        });
        return { isValid: true };
    } catch (error) {
        const handledError = handleGeminiError(error);
        if (handledError instanceof RateLimitError) {
             // Don't treat rate limit on validation as an invalid key
            return { isValid: true, error: 'Validation rate limited, assuming key is valid for now.' };
        }
        return { isValid: false, error: handledError.message || 'Validation failed.' };
    }
};