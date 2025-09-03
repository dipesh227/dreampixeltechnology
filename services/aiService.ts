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
You are a world-class viral content strategist for YouTube. Your task is to generate three distinct, high-CTR thumbnail concepts based on a video description, a target creator's brand, and a specific visual style. You MUST follow the JSON output format.

**1. Video Analysis:**
   - **Content:** "${description}"

**2. Creator Profile:**
   - **Name:** ${style.name}
   - **Brand Identity & Core Style:** ${style.creatorStyle}

**3. Visual Style Brief:**
   - **Target Mood:** ${style.mood}
   - **Core Aesthetic & Technical Details:** ${style.imageStyle}

**CRITICAL TASK & INSTRUCTIONS:**
Your primary goal is to generate three unique thumbnail concepts. For each concept, create a detailed, expert-level prompt for an AI image generator. This prompt must translate the abstract "Visual Style Brief" into concrete, actionable instructions.

Your generated prompts MUST explicitly define:
- **Composition & Framing:** (e.g., Extreme close-up on face, rule-of-thirds with negative space, dynamic dutch angle).
- **Lighting Design:** (e.g., Dramatic high-contrast rim lighting, soft and even beauty lighting, neon colored gels).
- **Color Grading & Palette:** (e.g., Hyper-saturated and vibrant, desaturated cinematic with teal/orange, monochrome with a single color pop).
- **Subject's Pose & Expression:** (e.g., Exaggerated shocked expression with wide eyes, confident and aspirational gaze, humorous and relatable reaction).
- **Camera & Lens Effects:** (e.g., 85mm portrait lens with creamy bokeh, 24mm wide-angle lens with slight distortion, anamorphic lens flare).

You will return a single JSON object. The object must contain a key "concepts", which is an array of three concept objects.
Each concept object must have the following keys: "prompt", "reason", "isRecommended".
- **"prompt"**: The detailed, expertly crafted prompt for the AI image generator.
- **"reason"**: A brief, strategic explanation of why this concept will maximize clicks for this specific creator and video.
- **"isRecommended"**: A boolean. You must identify the single best concept by setting this to 'true'. The other two must be 'false'.
Your entire response must be a single, valid JSON object, without any markdown formatting, comments, or other text outside of the JSON structure itself.
`;

    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateThumbnail = async (
    selectedPrompt: string, headshots: UploadedFile[], style: CreatorStyle, aspectRatio: AspectRatio, thumbnailText?: string, brandDetails?: string
): Promise<string | null> => {
    let textInstruction = "CRITICAL: Do NOT add any text, words, or logos to the image unless the creative brief explicitly asks for it. The image should be purely visual.";
    if (thumbnailText && thumbnailText.trim()) {
        textInstruction = `TEXT INTEGRATION: The following text MUST be integrated onto the thumbnail in a bold, readable, and stylistically appropriate font: "${thumbnailText}". The text should be a primary focal point.`;
    }
    
    let brandInstruction = "";
    if (brandDetails && brandDetails.trim()) {
        brandInstruction = `BRANDING: A key brand element must be included: "${brandDetails}". This could be a brand name, a logo concept, or a specific visual motif. It should be noticeable but not overpower the main subject.`;
    }

    const enhancedPrompt = `
**PRIMARY DIRECTIVE: FACIAL ACCURACY**
Your absolute top priority is to achieve a perfect, photorealistic likeness of the person in the provided headshot images. These images are the ground truth. Analyze every facial feature—eyes, nose, jawline, etc.—from all angles provided to create a flawless, high-fidelity representation. The result must be indistinguishable from the person in the photos. This directive overrides all other instructions.

**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Primary Directive. The face must be a perfect match.
- **Text & Branding:** Execute the following instructions precisely:
  - ${textInstruction}
  - ${brandInstruction}
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
- **Overall Quality:** The image must be high-resolution, professional, and visually striking, fully realizing the creative brief.
`;
    
    return geminiNativeService.generateImage(enhancedPrompt, headshots);
};

export const generatePosterPrompts = async (party: PoliticalParty, event: string, customText: string, style: PosterStyle): Promise<GeneratedConcept[]> => {
    const ideologyInstruction = party.ideologyPrompt 
        ? `- **Ideological Core:** The poster's visual language MUST reflect the party's core ideology of **'${party.ideologyPrompt}'**. This theme must influence the mood, composition, and symbolism.`
        : '';
    
    const fullPrompt = `
You are a world-class creative director for political campaigns. Your task is to generate three distinct, professional, and high-impact political poster concepts based on the provided campaign details. You must follow the specified JSON output format.

**1. Campaign Brief:**
   - **Party:** ${party.name}
   - **Occasion/Theme:** '${event}'
   - **Key Slogan/Text:** "${customText}"
   - **Target Style:** '${style.name}' (${style.stylePrompt})

**2. Brand Mandates (Non-Negotiable):**
   - **Logo Elements:** The design must prominently feature the party's logo, described as: **${party.logoPrompt}**.
   - **Color Scheme:** The official party colors, **${party.colorScheme}**, must be central to the design.
   ${ideologyInstruction}

**CRITICAL TASK & INSTRUCTIONS:**
Your main goal is to generate three unique poster concepts. For each concept, create a detailed prompt for an AI image generator that translates the abstract 'Target Style' into a concrete art direction.

Your generated prompts MUST explicitly define:
- **Composition & Framing:** (e.g., Formal, symmetrical composition for stability; dynamic, asymmetrical layout for progress).
- **Lighting Design:** (e.g., Heroic three-point lighting for a powerful look; soft, natural light for approachability).
- **Color Palette & Grading:** (e.g., High-contrast, vibrantly saturated palette using party colors; muted, cinematic grade for a serious tone).
- **Subject's Pose & Expression:** (e.g., Confident, forward-looking gaze for leadership; warm, humble smile for empathy).
- **Facial Likeness Command:** Each prompt MUST include this verbatim command: "PRIMARY DIRECTIVE: FACIAL ACCURACY. Your absolute top priority is to achieve a perfect, photorealistic likeness of the person in the provided headshot images. These images are the ground truth. Analyze every facial feature to create a flawless, high-fidelity representation. This directive overrides all other instructions."

You will return a single JSON object. The object must contain a key "concepts", which is an array of three concept objects.
Each concept object must have the following keys: "prompt", "reason", "isRecommended".
- **"prompt"**: The detailed, expertly crafted prompt for the AI image generator, including all branding and facial likeness commands.
- **"reason"**: A brief, strategic analysis of why this concept is effective for this campaign.
- **"isRecommended"**: A boolean. You must identify the single best concept by setting this to 'true'. The other two must be 'false'.
Your entire response must be a single, valid JSON object, without any markdown formatting, comments, or other text outside of the JSON structure itself.
`;

    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generatePoster = async (selectedPrompt: string, headshots: UploadedFile[], aspectRatio: AspectRatio, party: PoliticalParty | undefined): Promise<string | null> => {
    const finalPrompt = `
**PRIMARY DIRECTIVE: FACIAL ACCURACY**
Your absolute top priority is to achieve a perfect, photorealistic likeness of the person in the provided headshot images. These images are the ground truth. Analyze every facial feature—eyes, nose, jawline, etc.—from all angles provided to create a flawless, high-fidelity representation. The result must be indistinguishable from the person in the photos. This directive overrides all other instructions.

**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Primary Directive. The face must be a perfect match.
- **Branding Integrity:** The prompt contains specific branding instructions (party name, logo, colors). You MUST execute these with 100% accuracy.
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
- **Overall Quality:** The image must be high-resolution, professional-grade, and suitable for a political campaign, fully realizing the creative brief.
`;
    
    return geminiNativeService.generateImage(finalPrompt, headshots);
};

export const generateAdConcepts = async (productDescription: string, headline: string, style: AdStyle): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are an award-winning Creative Director at a top advertising agency. Your task is to generate three professional, visually stunning, and strategically sound ad banner concepts. You must follow the specified JSON output format.

**1. Campaign Brief:**
   - **Product/Service:** ${productDescription}
   - **Headline:** "${headline}"
   - **Target Ad Style:** '${style.name}' (${style.stylePrompt})
   - **Mandatory Elements:** The ad must feature a person (from a headshot) and the product (from a product image).

**CRITICAL TASK & INSTRUCTIONS:**
Your goal is to generate three unique ad concepts. For each, create a detailed prompt for an AI image generator that provides a complete art direction.

Your generated prompts MUST explicitly define:
- **Core Concept & Narrative:** A one-sentence story for the ad (e.g., "The moment of joyful discovery as the product solves a key problem.").
- **Model & Product Interaction:** How does the person interact with the product? (e.g., "Model confidently holds the product, presenting it to the viewer.").
- **Composition & Lighting:** Define camera angle, composition, lighting scheme (e.g., "dramatic three-point studio lighting with a soft key light"), and color grading.
- **Model's Pose & Expression:** Detail the exact pose and emotion the model should convey to connect with the target audience.
- **Facial Likeness Command:** Each prompt MUST include this verbatim command: "PRIMARY DIRECTIVE: FACIAL ACCURACY. Your absolute top priority is to achieve a perfect, photorealistic likeness of the person in the provided model headshot. The result must be indistinguishable from the person in the photo."
- **Product Integration Command:** Each prompt MUST include a command to seamlessly integrate the provided product image into the scene, making it the hero.

You will return a single JSON object. The object must contain a key "concepts", which is an array of three concept objects.
Each concept object must have the following keys: "prompt", "reason", "isRecommended".
- **"prompt"**: The detailed, expertly crafted prompt for the AI image generator, including all commands.
- **"reason"**: An expert analysis of the marketing strategy behind the concept and its expected ROI.
- **"isRecommended"**: A boolean. You must identify the single best concept by setting this to 'true'. The other two must be 'false'.
Your entire response must be a single, valid JSON object, without any markdown formatting, comments, or other text outside of the JSON structure itself.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateAdBanner = async (selectedPrompt: string, productImage: UploadedFile, modelHeadshot: UploadedFile, headline: string, brandDetails: string, aspectRatio: AspectRatio): Promise<string | null> => {
    const allImages = [productImage, modelHeadshot];
    const finalPrompt = `
**PRIMARY DIRECTIVE: FACIAL ACCURACY**
Your absolute top priority is to achieve a perfect, photorealistic likeness of the person in the provided model headshot. This image is the ground truth. Analyze every facial feature to create a flawless, high-fidelity representation. The result must be indistinguishable from the person in the photo. This directive overrides all other instructions.

**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Primary Directive. The face must be a perfect match.
- **Product Integration:** The product from the provided image must be the "hero" of the ad, featured clearly and attractively as described in the brief.
- **Headline & Branding:** The headline "${headline}" and brand details "${brandDetails}" must be masterfully incorporated into the design. They must be legible, stylishly typeset, and placed for maximum impact.
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
- **Overall Quality:** The image must be high-resolution, professional-grade ad creative that fully realizes the brief.
`;
    
    return geminiNativeService.generateImage(finalPrompt, allImages);
};

export const generateSocialPostConcepts = async (topic: string, platform: string, tone: string, style: AdStyle, callToAction?: string): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are an expert social media content strategist. Your task is to generate three complete, distinct, and engaging social media post concepts (visual + caption) based on the user's brief. You must follow the specified JSON output format.

**1. Post Brief:**
   - **Core Topic:** "${topic}"
   - **Target Platform:** ${platform}
   - **Desired Tone:** ${tone}
   - **Visual Style:** '${style.name}' (${style.stylePrompt})
   - **Call to Action (Optional):** "${callToAction || 'None specified'}"

**CRITICAL TASK & INSTRUCTIONS:**
For each of the three concepts, develop a complete package: a compelling visual idea and an engaging caption.

**Visual Idea (for the "prompt" field):**
- Translate the 'Visual Style' into a detailed art direction for an AI image generator.
- Specify composition, subject, lighting, color, and overall vibe. The prompt should be creative and generate an eye-catching image.

**Caption (for the "caption" field):**
- Write a compelling, platform-aware caption that embodies the '${tone}' tone.
- It must be well-written, engaging, and grammatically perfect.
- Seamlessly integrate the 'Core Topic' and the 'Call to Action' (if provided).
- Include 3-5 relevant and popular hashtags for the '${platform}' platform.

You will return a single JSON object. The object must contain a key "concepts", which is an array of three concept objects.
Each concept object must have the following keys: "prompt", "caption", "reason", "isRecommended".
- **"prompt"**: The detailed prompt for the AI image generator.
- **"caption"**: The complete, ready-to-post text caption.
- **"reason"**: A brief, expert analysis of why this visual/caption combo is a strong strategy for this platform.
- **"isRecommended"**: A boolean. You must identify the single best concept by setting this to 'true'. The other two must be 'false'.
Your entire response must be a single, valid JSON object, without any markdown formatting, comments, or other text outside of the JSON structure itself.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, SOCIAL_CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateSocialPost = async (selectedPrompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
    // This is a pure text-to-image prompt.
    const finalPrompt = `
**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**TECHNICAL MANDATES:**
- The final image must be high-resolution, visually stunning, and follow the creative brief precisely.
- The aspect ratio MUST be exactly ${aspectRatio}.
`;
    
    return geminiNativeService.generateImageFromText(finalPrompt, aspectRatio);
};

export const checkCurrentApiStatus = async () => {
    try {
        const apiKey = apiConfigService.getApiKey(); // This might throw
        
        const result = await geminiNativeService.validateApiKey(apiKey);
        
        if (result.isValid) {
            return { status: 'valid' as ValidationStatus, error: result.error || null };
        }

        // Key is present but invalid
        const errorMsg = `The provided API key is invalid. ${result.error}`;
        return { status: 'invalid' as ValidationStatus, error: errorMsg };

    } catch (error: any) {
        // This will catch the error from getApiKey() if the key is missing
        return { status: 'invalid' as ValidationStatus, error: error.message };
    }
};
