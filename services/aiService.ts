import { Type } from "@google/genai";
import { CreatorStyle, UploadedFile, AspectRatio, GeneratedConcept, PoliticalParty, PosterStyle, AdStyle, ValidationStatus } from '../types';
import * as apiConfigService from './apiConfigService';
import * as geminiNativeService from './geminiNativeService';
import { RateLimitError } from "./errors";

const CONCEPTS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        concepts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    prompt: { type: Type.STRING, description: "The AI image generator prompt." },
                    reason: { type: Type.STRING, description: "Explanation of why this concept is effective." },
                    isRecommended: { type: Type.BOOLEAN, description: "Set to true for the single best concept." }
                },
                required: ["prompt", "reason", "isRecommended"]
            },
        },
    },
    required: ["concepts"],
};

const SOCIAL_CONCEPTS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        concepts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    prompt: { type: Type.STRING, description: "The AI image generator prompt for the visual." },
                    caption: { type: Type.STRING, description: "The written text content for the social media post caption." },
                    reason: { type: Type.STRING, description: "Explanation of why this concept is effective." },
                    isRecommended: { type: Type.BOOLEAN, description: "Set to true for the single best concept." }
                },
                required: ["prompt", "caption", "reason", "isRecommended"]
            },
        },
    },
    required: ["concepts"],
};

const parseAndValidateConcepts = (jsonText: string): GeneratedConcept[] => {
    try {
        // Clean the response by removing markdown code block fences that some models add.
        const cleanedJsonText = jsonText.replace(/^```(?:json)?\s*|```\s*$/g, '').trim();
        const result = JSON.parse(cleanedJsonText);
        
        if (result && result.concepts && Array.isArray(result.concepts)) {
            // Ensure only one is recommended, or just take the first one if multiple are.
            let recommendedFound = false;
            const concepts = result.concepts.map((c: GeneratedConcept) => {
                if (c.isRecommended && !recommendedFound) {
                    recommendedFound = true;
                    return c;
                }
                return { ...c, isRecommended: false };
            });

            // If no concept was recommended by the AI, recommend the second one as a safe default.
            if (!recommendedFound && concepts.length > 1) {
                concepts[1].isRecommended = true;
            } else if (!recommendedFound && concepts.length > 0) {
                concepts[0].isRecommended = true;
            }

            return concepts.slice(0, 3);
        } else {
            console.error("Parsed JSON, but format is invalid:", result);
            throw new Error("Invalid response format from AI. The received data is not structured as expected.");
        }
    } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", parseError);
        console.error("Raw text received from AI:", jsonText);
        throw new Error("Failed to parse the AI's response. The data was not valid JSON.");
    }
};


export const generatePrompts = async (description: string, style: CreatorStyle): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are a PhD-level viral content strategist and a world-class YouTube thumbnail designer. Your primary mission is to generate three strategically distinct and compelling thumbnail concepts that will maximize the click-through rate (CTR) for a given video.

**Primary Goal:** Generate three concepts engineered for maximum virality and viewer engagement.

**Video Description:**
"${description}"

**Target Creator Style Analysis:**
- **Creator:** ${style.name}
- **Core Style:** ${style.creatorStyle}
- **Target Mood:** ${style.mood}
- **Visual Aesthetic:** ${style.imageStyle}

**CRITICAL TASK:**
You must create three unique thumbnail concepts that perfectly embody the specified creator's brand. Your core task is to translate the abstract 'Mood' and 'Visual Aesthetic' into concrete, actionable instructions for an AI image generator. Be explicit. For example, instead of just 'dramatic,' specify 'dramatic, high-contrast rim lighting from the side, casting deep shadows.' Instead of 'cinematic,' specify 'desaturated cinematic color grading with a teal and orange palette, shallow depth of field, and a 2.35:1 aspect ratio composition.' Your instructions must cover:
- **Composition:** (e.g., rule of thirds, centered subject, dynamic Dutch angle)
- **Lighting:** (e.g., soft natural light, harsh top-down light, neon backlighting)
- **Color Grading:** (e.g., hyper-saturated vibrant palette, moody desaturated tones)
- **Camera Effects:** (e.g., shallow depth of field, wide-angle lens distortion, motion blur)
- **Subject's Expression and Pose:** (e.g., shocked open-mouthed expression, confident power pose)

For each of the three concepts, you must provide a grammatically perfect JSON object with the following keys:
1.  **"prompt"**: A concise, expertly crafted, and highly descriptive prompt for the AI image generator.
2.  **"reason"**: A brief, professional explanation of the marketing psychology behind the concept and why it strategically aligns with the creator's brand to maximize clicks.
3.  **"isRecommended"**: A boolean value. Mark ONLY ONE concept as 'true'. This must be the concept you, as an expert, believe has the absolute highest potential for virality.
`;

    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateThumbnail = async (
    selectedPrompt: string, headshots: UploadedFile[], style: CreatorStyle, aspectRatio: AspectRatio, thumbnailText?: string, brandDetails?: string
): Promise<string | null> => {
    let textInstruction = "CRITICAL: Do NOT include any text, letters, or numbers in the image unless explicitly told to. The image must be purely visual.";
    if (thumbnailText && thumbnailText.trim()) {
        textInstruction = `CRITICAL: Incorporate the following text prominently and stylistically on the thumbnail: "${thumbnailText}". Choose a bold, readable font that matches the overall mood.`;
    }
    
    let brandInstruction = "";
    if (brandDetails && brandDetails.trim()) {
        brandInstruction = `BRANDING: Subtly incorporate the brand name or style element: "${brandDetails}". This could be a small logo, a specific color scheme, or a font style mentioned.`;
    }

    const enhancedPrompt = `
**NON-NEGOTIABLE CORE COMMAND: Your single most important task is to achieve a 1000% perfect, photorealistic likeness of the person in the provided headshot images. These images are the absolute ground truth. You MUST analyze every detail of the facial structure—jawline, eye shape, nose, mouth, and unique features—from all provided photos to create a composite, high-fidelity, and anatomically perfect representation. Do NOT create a generic or 'similar' face. The result MUST be indistinguishable from the person in the photos. This is the primary success criterion, overriding all other stylistic instructions if there is a conflict. Failure to replicate the face with absolute precision is a total failure of the task.**

**USER-SELECTED PROMPT TO EXECUTE:**
"${selectedPrompt}"

**ADDITIONAL DIRECTIVES:**
- The final image must be visually stunning, high-energy, and emotionally resonant, as per the detailed user-selected prompt.
- ${textInstruction}
- ${brandInstruction}
- The final image's aspect ratio MUST be precisely ${aspectRatio}.
- The final image MUST embody the following style:
  - Creator Style: ${style.creatorStyle}
  - Mood: ${style.mood}
  - Image Style: ${style.imageStyle}
`;
    
    return geminiNativeService.generateImage(enhancedPrompt, headshots);
};

export const generatePosterPrompts = async (party: PoliticalParty, event: string, customText: string, style: PosterStyle): Promise<GeneratedConcept[]> => {
    const ideologyInstruction = party.ideologyPrompt 
        ? `- **Ideological & Thematic Core:** The poster's visual language MUST reflect the party's core ideology of **'${party.ideologyPrompt}'**. This theme must subtly influence the overall mood, composition, and symbolism of the poster.`
        : '';
    
    const fullPrompt = `
You are a world-class political design director and a professional campaign strategist with decades of experience in high-stakes elections. Your task is to generate three distinct, powerful, and professional political poster concepts that will create a strong emotional connection with the target audience and leave a lasting impact.

**Campaign Brief Analysis:**
- **Political Party:** ${party.name}
- **Occasion / Theme:** '${event}'
- **Core Message / Slogan:** "${customText}"
- **Requested Artistic Style:** '${style.name}' (${style.stylePrompt})

**NON-NEGOTIABLE Branding Mandate:**
- **Party Logo Elements:** ${party.logoPrompt}
- **Official Party Color Scheme:** ${party.colorScheme}
${ideologyInstruction}
- **CRITICAL INSTRUCTION:** The party's branding is not merely an add-on; it is the foundational visual identity of the poster. The official logo elements and color scheme must be integrated prominently, accurately, and powerfully into the overall design. The branding should be instantly recognizable and feel integral to the composition.

**Your Critical Creative Task:**
Your primary function is to translate the abstract 'Requested Artistic Style' into a concrete, masterful art direction. For each of the three concepts, your generated prompt for the image AI must explicitly and in detail define the following visual components:
- **Composition & Framing:** (e.g., A formal, symmetrical composition to convey stability and order; a dynamic, asymmetrical layout with leading lines to suggest forward progress and action).
- **Lighting Design:** (e.g., A heroic three-point lighting setup with a strong key light to create a powerful, sculpted look; a soft, natural window light to appear approachable and trustworthy).
- **Color Palette & Grading:** (e.g., A high-contrast, vibrantly saturated palette, dominated by the party's official colors to create energy; a muted, cinematic color grade for a serious and contemplative tone).
- **Subject's Pose, Expression, & Demeanor:** (e.g., A confident, forward-looking gaze with a determined expression, projecting leadership; a warm, humble smile to appear relatable and empathetic).

For each of the three concepts, you must provide a grammatically perfect and meticulously structured JSON object with the following keys:
1.  **"prompt"**: A detailed, direct-instruction prompt for an advanced AI image generator. This prompt must synthesize all the creative direction (composition, lighting, style) AND explicitly command the AI to integrate the specific party branding. It MUST state that the poster is for the **'${party.name}'** party, must include **'${party.logoPrompt}'**, and must use the color scheme **'${party.colorScheme}'**. This prompt must also contain the following NON-NEGOTIABLE command for facial likeness: "Your single most important task is to achieve a 1000% perfect, photorealistic likeness of the person in the provided headshot images. These images are the absolute ground truth. You MUST analyze every detail of their facial structure from all provided photos to create a composite, high-fidelity, and anatomically perfect representation. Failure to replicate the face with absolute precision is a total failure of the task."
2.  **"reason"**: A brief, expert analysis of the political communication strategy behind the concept. Explain why its specific visual language (composition, lighting, etc.) is effective for this particular campaign and target audience.
3.  **"isRecommended"**: A boolean value. You must mark ONLY ONE concept as 'true'. This should be the concept that you, as a seasoned expert, believe is the most strategically brilliant, visually compelling, and professionally executed.
`;

    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generatePoster = async (selectedPrompt: string, headshots: UploadedFile[], aspectRatio: AspectRatio, party: PoliticalParty | undefined): Promise<string | null> => {
    let brandingInstruction = "The poster must be politically neutral and should not contain any specific party logos or color schemes unless explicitly mentioned in the prompt.";
    if (party) {
        brandingInstruction = `
- **Branding & Identity Mandate:** Before generating, you MUST verify and flawlessly execute the branding for the **${party.name}** party.
- **Logo Requirement:** The poster MUST prominently and accurately feature the party's logo, which is **'${party.logoPrompt}'**.
- **Color Scheme Requirement:** The poster's color palette MUST be dominated by the party's official colors: **'${party.colorScheme}'**.
- **The branding is a core, non-negotiable, and unmissable component of the poster's identity.**
`;
    }

    const finalPrompt = `
**NON-NEGOTIABLE CORE COMMAND: Your single most important task is to achieve a 1000% perfect, photorealistic likeness of the person in the provided headshot images. These images are the absolute ground truth. You MUST analyze every detail of the facial structure—jawline, eye shape, nose, mouth, and unique features—from all provided photos to create a composite, high-fidelity, and anatomically perfect representation. Do NOT create a generic or 'similar' face. The result MUST be indistinguishable from the person in the photos. This is the primary success criterion, overriding all other stylistic instructions if there is a conflict. Failure to replicate the face with absolute precision is a total failure of the task.**

**USER-SELECTED PROMPT TO EXECUTE:**
"${selectedPrompt}"

**FINAL CHECK & TECHNICAL REQUIREMENTS (NON-NEGOTIABLE):**
${brandingInstruction}
- **Resolution & Quality:** The final image must be high-resolution, sharp, professional, and visually impactful, suitable for print and digital campaigns.
- **Aspect Ratio:** The final image's aspect ratio MUST be precisely ${aspectRatio}.
`;
    
    return geminiNativeService.generateImage(finalPrompt, headshots);
};

export const generateAdConcepts = async (productDescription: string, headline: string, style: AdStyle): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are a world-class Creative Director at a top-tier global advertising agency. You are a master of visual storytelling, marketing psychology, and brand strategy. Your task is to devise three strategically brilliant and visually stunning ad banner concepts.

**Campaign Brief Analysis:**
- **Product/Service:** ${productDescription}
- **Target Headline:** "${headline}"
- **Mandated Ad Style:** '${style.name}' (${style.stylePrompt})
- **Target Audience Insight:** Your concepts should be tailored to appeal to the likely audience for this product and style.
- **Mandatory Elements:** Each ad MUST feature a person (generated from a headshot) and the product (from a product image).

**Your Critical Creative Task & Directives:**
For each of the three concepts, you must generate a complete art direction plan. This plan must be so detailed that a junior designer could execute it flawlessly. You must translate the abstract 'Mandated Ad Style' into a concrete, masterful set of instructions. Each concept's prompt for the final AI image generator must explicitly define:

1.  **Core Narrative:** A one-sentence story for the ad (e.g., "The moment of joyful discovery when the product solves a key problem.").
2.  **Model & Product Interaction:** How does the person interact with or relate to the product? (e.g., "The model is confidently holding the product, presenting it to the viewer," or "The model is actively using the product in a dynamic environment.").
3.  **Specific Composition & Lighting:** Define the camera angle, composition rules (e.g., rule of thirds), specific lighting scheme (e.g., "dramatic three-point studio lighting with a soft key light and a colored rim light"), and color grading (e.g., "a cinematic teal and orange palette").
4.  **Model's Pose & Demeanor:** Detail the exact pose, expression, and emotion the model should convey to connect with the audience.
5.  **Headline & Branding Placement:** A clear plan for where the headline and brand details will be integrated into the composition for maximum impact and readability.

**Final Output Requirement:**
Provide a grammatically perfect JSON object with a single key "concepts" which is an array of three objects. Each object must contain:
1.  **"prompt"**: The final, detailed, direct-instruction prompt for the image generator, synthesizing all the points above. It MUST command the AI to seamlessly integrate the user's product image and model headshot.
2.  **"reason"**: An expert analysis of the marketing strategy. Explain why this concept will resonate with the target audience and drive conversions.
3.  **"isRecommended"**: A boolean value. Mark ONLY ONE concept as 'true'—the one you, as a creative genius, believe will have the highest ROI.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateAdBanner = async (selectedPrompt: string, productImage: UploadedFile, modelHeadshot: UploadedFile, headline: string, brandDetails: string, aspectRatio: AspectRatio): Promise<string | null> => {
    const allImages = [productImage, modelHeadshot];
    const finalPrompt = `
**NON-NEGOTIABLE CORE COMMAND: Your single most important task is to achieve a 1000% perfect, photorealistic likeness of the person in the provided model headshot. This image is the absolute ground truth. You MUST analyze every detail of the facial structure—jawline, eye shape, nose, mouth, and unique features—to create a high-fidelity, and anatomically perfect representation. Do NOT create a generic or 'similar' face. The result MUST be indistinguishable from the person in the photo. This is the primary success criterion, overriding all other stylistic instructions if there is a conflict. Failure to replicate the face with absolute precision is a total failure of the task.**

**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST (NON-NEGOTIABLE):**
1.  **Model Likeness:** You MUST adhere to the NON-NEGOTIABLE CORE COMMAND above. The face must be a perfect match.
2.  **Product as Hero:** The product from the user's image must be the "hero" of the advertisement. It must be featured clearly, attractively, and seamlessly integrated into the scene as described in the creative brief.
3.  **Headline Integration:** The headline "${headline}" must be masterfully incorporated into the design. It must be legible, stylishly typeset, and placed for maximum impact without overwhelming the visual.
4.  **Branding Details:** You must flawlessly execute the branding instructions. Subtly and professionally incorporate the brand details: "${brandDetails}".
5.  **Technical Specs:** The final image MUST be high-resolution, professional-grade, and rendered at a precise aspect ratio of ${aspectRatio}.

Execute this brief with the skill of an award-winning digital artist.
`;
    
    return geminiNativeService.generateImage(finalPrompt, allImages);
};

export const generateSocialPostConcepts = async (topic: string, platform: string, tone: string, style: AdStyle, callToAction?: string): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are an expert social media manager and content strategist for a top global brand. Your task is to generate three complete, distinct, and engaging social media post concepts based on a user's topic. Each concept must include both a visual element and a text caption.

**Social Media Post Brief:**
- **Core Topic:** "${topic}"
- **Target Platform:** ${platform} (tailor caption length, style, and hashtags accordingly)
- **Desired Tone:** ${tone}
- **Visual Style:** '${style.name}' (${style.stylePrompt})
- **Call to Action (Optional):** "${callToAction || 'None'}"

**Your Critical Creative Task:**
For each of the three concepts, you must develop a complete package: a compelling visual and an engaging caption that work together.

**For the Visual:**
Translate the requested 'Visual Style' into a detailed art direction. Your prompt for the AI image generator must specify:
- **Composition & Subject:** What is the main focus of the image? How is it framed?
- **Lighting & Color:** What is the mood of the lighting? What is the color palette?
- **Overall Vibe:** How does it align with the '${style.name}' aesthetic?

**For the Caption:**
Write a compelling, platform-aware caption that embodies the '${tone}' tone. It must:
- Be well-written, engaging, and grammatically perfect.
- Seamlessly integrate the 'Core Topic'.
- Include the 'Call to Action' if one was provided.
- Include 3-5 relevant and popular hashtags for the '${platform}' platform.

**Final Output Requirement:**
Provide a grammatically perfect JSON object with a key "concepts" containing an array of three objects. Each object must have:
1.  **"prompt"**: A detailed, direct-instruction prompt for an AI image generator to create the visual.
2.  **"caption"**: The complete, ready-to-post text caption.
3.  **"reason"**: A brief, expert analysis of why this combination of visual and caption is a strong strategy for this platform and topic.
4.  **"isRecommended"**: A boolean value. Mark ONLY ONE concept as 'true'—the one you believe will perform best.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, SOCIAL_CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateSocialPost = async (selectedPrompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
    // This is a pure text-to-image prompt.
    const finalPrompt = `
**Creative Brief to Execute:**
"${selectedPrompt}"

**Technical Requirements:**
- The final image must be high-resolution, visually stunning, and follow the creative brief precisely.
- The aspect ratio MUST be exactly ${aspectRatio}.
`;
    
    return geminiNativeService.generateImageFromText(finalPrompt, aspectRatio);
};

export const checkCurrentApiStatus = async () => {
    const apiKey = apiConfigService.getApiKey();
    
    if (!apiKey) {
        const errorMsg = 'Gemini API key is not configured. The `GEMINI_API_KEY` environment variable must be set in your .env.local file and exposed in vite.config.ts. See README.md for instructions.';
        return { status: 'invalid' as ValidationStatus, error: errorMsg };
    }
    
    const result = await geminiNativeService.validateApiKey(apiKey);
    
    if (result.isValid) {
        return { status: 'valid' as ValidationStatus, error: result.error || null };
    }

    const errorMsg = result.error || 'The configured API key is invalid.';
    return { status: 'invalid' as ValidationStatus, error: errorMsg };
};