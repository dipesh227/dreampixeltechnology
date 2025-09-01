
import { UploadedFile } from '../types';
import * as apiConfigService from './apiConfigService';

// Helper to get site identifiers for OpenRouter headers
const getOpenRouterSiteHeaders = () => {
    if (typeof window !== 'undefined') {
        return {
            "HTTP-Referer": window.location.origin,
            "X-Title": window.location.hostname,
        };
    }
    return {
        "HTTP-Referer": "https://dreampixel.ai",
        "X-Title": "DreamPixel Technology",
    };
};

const handleOpenRouterError = async (response: Response) => {
    const errorBody = await response.json().catch(() => ({ error: { message: response.statusText } }));
    const errorMessage = errorBody?.error?.message || JSON.stringify(errorBody);

    switch (response.status) {
        case 401:
            throw new Error("Invalid OpenRouter API Key. Please check your key in API Settings and ensure your account has funds.");
        case 402:
             throw new Error("You have insufficient funds in your OpenRouter account. Please add credits to continue.");
        case 429:
            throw new Error("You've exceeded your OpenRouter API rate limit. Please wait a moment before trying again.");
        case 500:
            throw new Error("The OpenRouter service is currently experiencing an internal server error. Please try again later.");
        default:
            throw new Error(`OpenRouter API Error (${response.status}): ${errorMessage}`);
    }
};

export const generateText = async (prompt: string): Promise<string> => {
    const apiKey = apiConfigService.getApiKey();
    if (!apiKey) throw new Error("OpenRouter API key is not configured.");

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                ...getOpenRouterSiteHeaders()
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-exp:free",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            await handleOpenRouterError(response);
        }

        const result = await response.json();
        let content = result?.choices?.[0]?.message?.content;

        if (!content) {
            console.error("Could not find text data in OpenRouter response", result);
            throw new Error("Unsupported response format from OpenRouter: No content found.");
        }
        
        if (typeof content === 'string') {
            const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
                content = jsonMatch[1].trim();
            }
            return content;
        } else if (typeof content === 'object') {
            return JSON.stringify(content);
        }

        console.error("Unexpected content type in OpenRouter response", content);
        throw new Error("Unsupported response format from OpenRouter.");

    } catch (error) {
        if (error instanceof Error) {
             // If it's one of our custom errors from handleOpenRouterError, re-throw it.
            if (error.message.startsWith("Invalid OpenRouter API Key") ||
                error.message.startsWith("You have insufficient funds") ||
                error.message.startsWith("You've exceeded your OpenRouter API rate limit") ||
                error.message.startsWith("The OpenRouter service is currently experiencing") ||
                error.message.startsWith("OpenRouter API Error")) {
                throw error;
            }
        }
        // Otherwise, assume it's a network error.
        console.error("Network or unexpected error contacting OpenRouter:", error);
        throw new Error("A network error occurred while contacting OpenRouter. Please check your internet connection and try again.");
    }
};

export const generateImage = async (prompt: string, images: UploadedFile[]): Promise<string | null> => {
    const apiKey = apiConfigService.getApiKey();
    if (!apiKey) throw new Error("OpenRouter API key is not configured.");

    const messages = [{
        role: "user",
        content: [
            { type: "text", text: prompt },
            ...images.map(img => ({ type: "image_url", image_url: { url: `data:${img.mimeType};base64,${img.base64}` } }))
        ]
    }];
    
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                ...getOpenRouterSiteHeaders()
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash-image-preview:free",
                messages: messages,
            })
        });

        if (!response.ok) {
            await handleOpenRouterError(response);
        }

        const result = await response.json();
        
        const rawContent = result?.choices?.[0]?.message?.content;
        if (!rawContent) {
            console.error("Could not find content in OpenRouter response", result);
            throw new Error("Unsupported response format from OpenRouter: No content found.");
        }

        let contentParts: any[] = [];
        
        if (Array.isArray(rawContent)) {
            contentParts = rawContent;
        } else if (typeof rawContent === 'string') {
            try {
                const parsed = JSON.parse(rawContent);
                if (Array.isArray(parsed)) {
                    contentParts = parsed;
                }
            } catch (e) {
                 console.warn("OpenRouter returned a non-JSON string content which is being ignored for image generation:", rawContent);
            }
        }
        
        if (contentParts.length > 0) {
            for (const part of contentParts) {
                if (part.type === 'image_url' && part.image_url?.url) {
                    const base64Match = part.image_url.url.match(/data:image\/\w+;base64,([\s\S]+)/);
                    if (base64Match && base64Match[1]) {
                        return base64Match[1];
                    }
                }
                if (part.inlineData && part.inlineData.data) {
                    return part.inlineData.data;
                }
            }
        }
        
        console.error("Could not find image data in OpenRouter response", result);
        throw new Error("Unsupported response format from OpenRouter. Could not extract image data from the response.");

    } catch (error) {
         if (error instanceof Error) {
            if (error.message.startsWith("Invalid OpenRouter API Key") ||
                error.message.startsWith("You have insufficient funds") ||
                error.message.startsWith("You've exceeded your OpenRouter API rate limit") ||
                error.message.startsWith("The OpenRouter service is currently experiencing") ||
                error.message.startsWith("OpenRouter API Error")) {
                throw error;
            }
        }
        console.error("Network or unexpected error contacting OpenRouter:", error);
        throw new Error("A network error occurred while contacting OpenRouter. Please check your internet connection and try again.");
    }
};
