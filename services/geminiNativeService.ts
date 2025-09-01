
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UploadedFile } from '../types';
import * as apiConfigService from './apiConfigService';

const getAiClient = () => {
    const apiKey = apiConfigService.getApiKey();
    if (!apiKey) {
        throw new Error("API key is not configured. Please set it in API Settings or ensure the environment variable is set.");
    }
    return new GoogleGenAI({ apiKey });
};

const handleGoogleAiError = (error: unknown): never => {
    if (error instanceof Error) {
        console.error("Error with Google AI:", error.message);
        if (error.message.includes('API key not valid')) {
            throw new Error("Invalid Google AI API Key. Please check the key in your API Settings.");
        }
        if (error.message.includes('429') || error.message.toLowerCase().includes('rate limit')) {
            throw new Error("You've exceeded the Google AI API rate limit. Please wait a moment before trying again.");
        }
        if (error.message.includes('SAFETY')) {
             throw new Error("Generation was blocked due to safety policies. Please modify your prompt or images and try again.");
        }
        if (error.message.includes('timed out') || error.message.includes('Deadline exceeded')) {
            throw new Error("The request to Google AI timed out. The service might be busy or your internet connection is unstable. Please try again.");
        }
        throw new Error(`An error occurred with the Google AI service.`);
    }
    throw new Error("An unknown error occurred while communicating with Google AI.");
};

export const generateText = async (prompt: string, jsonSchema: object): Promise<string> => {
    const ai = getAiClient();
    try {
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
        handleGoogleAiError(error);
    }
};

export const generateImage = async (prompt: string, images: UploadedFile[]): Promise<string | null> => {
    const ai = getAiClient();
    try {
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
        handleGoogleAiError(error);
    }
};
