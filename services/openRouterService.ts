import { UploadedFile } from '../types';
import * as apiConfigService from './apiConfigService';
import { RateLimitError } from './errors';

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

const handleOpenRouterError = async (response: Response): Promise<Error> => {
    try {
        const errorBody = await response.json();
        const errorMessage = errorBody?.error?.message || response.statusText;
        const rawMetadata = errorBody?.error?.metadata?.raw;

        if (response.status === 401) {
            return new Error("Invalid OpenRouter API Key. Please check your key in API Settings.");
        }
        if (response.status === 402) {
             return new Error("Insufficient funds in your OpenRouter account. Please add credits to your account.");
        }
        if (response.status === 429) {
            if (rawMetadata && rawMetadata.includes('rate-limited upstream')) {
                return new RateLimitError("The free model on OpenRouter is temporarily rate-limited. Please try again shortly or add your own key and credits at openrouter.ai to avoid this limit.");
            }
            return new RateLimitError("OpenRouter API rate limit exceeded. Please check your account usage and try again later.");
        }
        if (response.status >= 500) {
            return new Error("OpenRouter's servers seem to be experiencing issues. Please try again later.");
        }
        
        return new Error(`OpenRouter API request failed: ${errorMessage}`);
    } catch (e) {
        return new Error(`OpenRouter API request failed with status: ${response.status} ${response.statusText}`);
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

        const handledError = await handleOpenRouterError(response);
        
        if (attempt >= maxRetries || !(handledError instanceof RateLimitError)) {
            throw handledError;
        }
        
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`OpenRouter API rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
    }
    throw new Error("Exceeded max retries for OpenRouter fetch. This should not happen.");
};

export const generateText = async (prompt: string): Promise<string> => {
    const apiKey = apiConfigService.getApiKey();
    if (!apiKey) throw new Error("OpenRouter API key is not configured.");

    const response = await fetchWithRetries("https://openrouter.ai/api/v1/chat/completions", {
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

    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content;

    if (!content) {
        console.error("Could not find text data in OpenRouter response", result);
        throw new Error("Unsupported response format from OpenRouter: No content found.");
    }
    
    const responseText = typeof content === 'string' ? content : JSON.stringify(content);
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch && jsonMatch[0]) {
        return jsonMatch[0];
    }
    
    console.warn("Could not find a JSON object in the OpenRouter response. Returning raw text.", responseText);
    return responseText;
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

    const response = await fetchWithRetries("https://openrouter.ai/api/v1/chat/completions", {
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


export const validateApiKey = async (apiKey: string): Promise<{ isValid: boolean, error?: string }> => {
    if (!apiKey) return { isValid: false };
    try {
        const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
            }
        });

        if (response.status === 401) return { isValid: false, error: "Invalid API Key." };
        if (response.ok) return { isValid: true };
        
        const handledError = await handleOpenRouterError(response);
        if (handledError instanceof RateLimitError) {
             // Don't treat rate limit on validation as an invalid key
            return { isValid: true, error: 'Validation rate limited, assuming key is valid for now.' };
        }

        return { isValid: false, error: handledError.message || "Validation failed." };
    } catch (e) {
        return { isValid: false, error: "Network error during validation." };
    }
};