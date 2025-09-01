import { GoogleGenAI, Modality } from "@google/genai";
import { UploadedFile, AspectRatio } from '../types';
import * as apiConfigService from './apiConfigService';

const getAiClient = (apiKeyOverride?: string) => {
    const apiKey = apiKeyOverride || apiConfigService.getApiKey();
    if (!apiKey) {
        throw new Error("API key is not configured. Please set it in API Settings or ensure the environment variable is set.");
    }
    return new GoogleGenAI({ apiKey });
};

const handleGeminiError = (error: unknown): Error => {
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            return new Error("Invalid Gemini API Key. Please check the key in your API Settings.");
        }
        if (error.message.includes('429')) {
            return new Error("You have exceeded your Gemini API request quota. Please wait and try again later, or check your Google AI Studio dashboard.");
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


export const generateText = async (prompt: string, jsonSchema: object): Promise<string> => {
    try {
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
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const generateImage = async (prompt: string, images: UploadedFile[]): Promise<string | null> => {
     try {
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

    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        throw handleGeminiError(error);
    }
};

export const generateImageFromText = async (prompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: aspectRatio.replace(':', ' / ') as any, // Convert '16:9' to '16 / 9'
            },
        });

        const base64ImageBytes: string | undefined = response.generatedImages[0]?.image.imageBytes;

        if (base64ImageBytes) {
            return base64ImageBytes;
        }

        return null;
    } catch (error) {
        console.error("Error generating image from text with Gemini:", error);
        throw handleGeminiError(error);
    }
};

export const validateApiKey = async (apiKey: string): Promise<{ isValid: boolean, error?: string }> => {
    if (!apiKey) return { isValid: false };
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
        if (error instanceof Error && error.message.includes('API key not valid')) {
            return { isValid: false, error: 'Invalid API Key.' };
        }
        return { isValid: false, error: 'Validation failed.' };
    }
};
