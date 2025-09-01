
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

export const generateText = async (prompt: string, jsonSchema: object): Promise<string> => {
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
        console.error("Error generating image with Gemini:", error);
        if (error instanceof Error && error.message.includes('SAFETY')) {
             throw new Error("Image generation was blocked due to safety policies. Please modify your prompt or images and try again.");
        }
        throw new Error("Failed to generate the image with Gemini. The AI model may be overloaded or the prompt might be too complex. Please try again later.");
    }
};
