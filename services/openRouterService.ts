
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

export const generateText = async (prompt: string): Promise<string> => {
    const apiKey = apiConfigService.getApiKey();
    if (!apiKey) throw new Error("OpenRouter API key is not configured.");

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
        const errorBody = await response.text();
        console.error("OpenRouter API error:", errorBody);
        throw new Error(`OpenRouter API request failed: ${response.statusText}. Details: ${errorBody}`);
    }

    const result = await response.json();
    let content = result?.choices?.[0]?.message?.content;

    if (!content) {
        console.error("Could not find text data in OpenRouter response", result);
        throw new Error("Unsupported response format from OpenRouter: No content found.");
    }
    
    if (typeof content === 'string') {
        // Attempt to clean the response by removing markdown code block fences
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            content = jsonMatch[1].trim();
        }
        return content;
    } else if (typeof content === 'object') {
        // If the API directly returns a JSON object, stringify it.
        return JSON.stringify(content);
    }

    console.error("Unexpected content type in OpenRouter response", content);
    throw new Error("Unsupported response format from OpenRouter.");
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
        const errorBody = await response.text();
        console.error("OpenRouter API error:", errorBody);
        throw new Error(`OpenRouter API request failed: ${response.statusText}`);
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
};
