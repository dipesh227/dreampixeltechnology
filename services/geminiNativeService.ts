import { GoogleGenAI, Modality } from "@google/genai";
import { UploadedFile, AspectRatio } from '../types';
import * as apiConfigService from './apiConfigService';
import { RateLimitError } from "./errors";

const getAiClient = (apiKeyOverride?: string) => {
    const apiKey = apiKeyOverride || apiConfigService.getApiKey();
    if (!apiKey) {
        throw new Error("API key is not configured. Please add a default key in environment variables or your own key in Settings.");
    }
    return new GoogleGenAI({ apiKey });
};

const handleGeminiError = (error: unknown): Error => {
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            return new Error("The active API Key is invalid. Please check your key in Settings or contact the site administrator.");
        }
        if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
            return new RateLimitError("Rate limit exceeded. You've made too many requests recently. Please wait a minute and try again.");
        }
        if (error.message.includes('SAFETY')) {
            return new Error("The request was blocked due to safety policies. Please adjust your prompt or images and try again.");
        }
        if (error.message.includes('fetch failed') || error.message.includes('NetworkError')) {
             return new Error("A network error occurred. Please check your internet connection and try again.");
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
            
            if (attempt >= maxRetries || !(handledError instanceof RateLimitError)) {
                throw handledError;
            }

            const delay = initialDelay * Math.pow(2, attempt);
            console.warn(`Gemini API rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
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

export const generateTextFromMultimodal = async (prompt: string, images: UploadedFile[], jsonSchema: object): Promise<string> => {
    return withRetries(async () => {
        const ai = getAiClient();
        const imageParts = images.map(file => ({
            inlineData: { data: file.base64, mimeType: file.mimeType }
        }));

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    ...imageParts,
                    { text: prompt }
                ]
            },
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
        
        // The imagen model supports a specific set of aspect ratios. We map the app's ratios to the closest supported one.
        const validAspectRatios: { [key in AspectRatio]?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" } = {
            '1:1': '1:1',
            '16:9': '16:9',
            '9:16': '9:16',
            '4:5': '3:4',      // Map 4:5 (0.8) to closest supported value 3:4 (0.75)
            '1.91:1': '16:9', // Map 1.91:1 (~1.77) to 16:9 (1.77)
            '3.5:2': '16:9',  // Map 3.5:2 (1.75) to closest supported value 16:9 (1.77)
            '2:3.5': '9:16',  // Map 2:3.5 (~0.57) to closest value 9:16 (~0.56)
        };
        const supportedAspectRatio = validAspectRatios[aspectRatio] || '1:1';

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              aspectRatio: supportedAspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        
        console.warn("Imagen model did not return an image for the text-only prompt.");
        return null;
    });
};

export const generateVideo = async (prompt: string): Promise<string | null> => {
    // This is a long-running operation, so we don't use the standard `withRetries` wrapper
    try {
        const ai = getAiClient();
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1
            }
        });
        
        // Poll for completion, waiting 10 seconds between checks
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            console.warn("Veo model did not return a video URI.");
            return null;
        }

        return downloadLink;
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const fetchVideoData = async (downloadLink: string): Promise<Blob | null> => {
    try {
        const apiKey = apiConfigService.getApiKey();
        // The download link requires the API key to be appended for authentication
        const response = await fetch(`${downloadLink}&key=${apiKey}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch video data: ${response.statusText}`);
        }
        
        return await response.blob();
    } catch (error) {
        console.error("Error fetching video data:", error);
        throw handleGeminiError(error);
    }
};

export const validateApiKey = async (apiKey: string): Promise<{ isValid: boolean, error?: string }> => {
    if (!apiKey) return { isValid: false, error: 'API key cannot be empty.' };
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

export const editImage = async (base64Image: string, prompt: string): Promise<string | null> => {
     return withRetries(async () => {
        const ai = getAiClient();
        const imagePart = {
            inlineData: { data: base64Image, mimeType: 'image/png' }
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    imagePart,
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
        // If the model replies with text-only, that's an error in this context
        const textResponse = response.text?.trim();
        if (textResponse) {
             throw new Error(`AI Edit Failed: ${textResponse}`);
        }
        return null;
    });
};