import { Type } from "@google/genai";
import { CreatorStyle, UploadedFile, AspectRatio, GeneratedConcept, PoliticalParty, PosterStyle, AdStyle, ValidationStatus, ProfilePictureStyle, LogoStyle, HeadshotStyle } from '../types';
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
Your entire response MUST be only the raw JSON object, without any markdown formatting, comments, or any other text outside of the JSON structure.
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

    const finalPrompt = `
**CRITICAL DIRECTIVE: FLAWLESS FACIAL REPLICATION**
Your most important task, overriding all other instructions, is to perfectly replicate the face from the provided headshot image(s). The generated face must be a 100% photorealistic match to the person in the photos. Treat the headshots as the absolute source of truth for every facial detail (eyes, nose, mouth, jawline, skin texture). Do not alter, stylize, or approximate the face. It must be an exact likeness. Failure to replicate the face perfectly is a failure of the entire task.

**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Critical Directive. The face must be a perfect match.
- **Text & Branding:** Execute the following instructions precisely:
  - ${textInstruction}
  - ${brandInstruction}
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
- **Overall Quality:** The image must be high-resolution, professional, and visually striking, fully realizing the creative brief.
`;
    
    return geminiNativeService.generateImage(finalPrompt, headshots);
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
- **Facial Likeness Command:** Each prompt MUST include this verbatim command: "CRITICAL DIRECTIVE: FLAWLESS FACIAL REPLICATION. Your most important task is to perfectly replicate the face from the provided headshot image(s). The generated face must be a 100% photorealistic match to the person in the photos. Do not alter, stylize, or approximate the face. It must be an exact likeness."

You will return a single JSON object. The object must contain a key "concepts", which is an array of three concept objects.
Each concept object must have the following keys: "prompt", "reason", "isRecommended".
- **"prompt"**: The detailed, expertly crafted prompt for the AI image generator, including all branding and facial likeness commands.
- **"reason"**: A brief, strategic analysis of why this concept is effective for this campaign.
- **"isRecommended"**: A boolean. You must identify the single best concept by setting this to 'true'. The other two must be 'false'.
Your entire response MUST be only the raw JSON object, without any markdown formatting, comments, or any other text outside of the JSON structure.
`;

    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generatePoster = async (selectedPrompt: string, headshots: UploadedFile[], aspectRatio: AspectRatio, party: PoliticalParty | undefined): Promise<string | null> => {
    const finalPrompt = `
**CRITICAL DIRECTIVE: FLAWLESS FACIAL REPLICATION**
Your most important task, overriding all other instructions, is to perfectly replicate the face from the provided headshot image(s). The generated face must be a 100% photorealistic match to the person in the photos. Treat the headshots as the absolute source of truth for every facial detail (eyes, nose, mouth, jawline, skin texture). Do not alter, stylize, or approximate the face. It must be an exact likeness. Failure to replicate the face perfectly is a failure of the entire task.

**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Critical Directive. The face must be a perfect match.
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
- **Facial Likeness Command:** Each prompt MUST include this verbatim command: "CRITICAL DIRECTIVE: FLAWLESS FACIAL REPLICATION. Your most important task is to perfectly replicate the face from the provided headshot image. The generated face must be a 100% photorealistic match to the person in the photo. Do not alter, stylize, or approximate the face. It must be an exact likeness."
- **Product Integration Command:** Each prompt MUST include a command to seamlessly integrate the provided product image into the scene, making it the hero.

You will return a single JSON object. The object must contain a key "concepts", which is an array of three concept objects.
Each concept object must have the following keys: "prompt", "reason", "isRecommended".
- **"prompt"**: The detailed, expertly crafted prompt for the AI image generator, including all commands.
- **"reason"**: An expert analysis of the marketing strategy behind the concept and its expected ROI.
- **"isRecommended"**: A boolean. You must identify the single best concept by setting this to 'true'. The other two must be 'false'.
Your entire response MUST be only the raw JSON object, without any markdown formatting, comments, or any other text outside of the JSON structure.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateAdBanner = async (selectedPrompt: string, productImage: UploadedFile, modelHeadshot: UploadedFile, headline: string, brandDetails: string, aspectRatio: AspectRatio): Promise<string | null> => {
    const allImages = [productImage, modelHeadshot];
    const finalPrompt = `
You will be provided with two images. Image 1 is the PRODUCT. Image 2 is the MODEL HEADSHOT.

**CRITICAL DIRECTIVE: FLAWLESS FACIAL REPLICATION**
Your most important task, overriding all other instructions, is to perfectly replicate the face from the provided MODEL HEADSHOT (Image 2). The generated face must be a 100% photorealistic match to the person in the photo. Treat the headshot as the absolute source of truth for every facial detail. Do not alter, stylize, or approximate the face. It must be an exact likeness. Failure to replicate the face perfectly is a failure of the entire task.

**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Critical Directive. The face must be a perfect match to the MODEL HEADSHOT (Image 2).
- **Product Integration:** The PRODUCT (Image 1) must be the "hero" of the ad, featured clearly and attractively as described in the brief.
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
Your entire response MUST be only the raw JSON object, without any markdown formatting, comments, or any other text outside of the JSON structure.
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

export const generateProfilePicturePrompts = async (description: string, style: ProfilePictureStyle): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are a professional portrait photographer and digital artist. Your task is to generate three distinct concepts for a social media profile picture. You must follow the specified JSON output format.

**1. Subject Brief:**
   - **Context/Goal:** "${description}"
   - **Target Style:** '${style.name}' (${style.stylePrompt})

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique profile picture concepts. For each, create a detailed prompt for an AI image generator. The final image should be a HEADSHOT (shoulders up).

Your generated prompts MUST explicitly define:
- **Composition & Framing:** (e.g., Centered close-up, rule-of-thirds, looking directly at camera, looking slightly away).
- **Lighting Design:** (e.g., Soft and flattering beauty light, dramatic Rembrandt lighting, natural golden hour sunlight).
- **Background:** Describe the background in detail (e.g., solid neutral color, softly blurred office, vibrant abstract pattern).
- **Attire & Appearance:** Suggest appropriate clothing that fits the style (e.g., professional business suit, casual knit sweater).
- **Mood & Expression:** (e.g., Confident and approachable, creative and intense, friendly and warm).
- **Facial Likeness Command:** Each prompt MUST include this verbatim command: "CRITICAL DIRECTIVE: FLAWLESS FACIAL REPLICATION. Your most important task is to perfectly replicate the face from the provided headshot image. The generated face must be a 100% photorealistic match to the person in the photo. Do not alter, stylize, or approximate the face."

You will return a single JSON object with a key "concepts", an array of three concept objects.
Each object must have "prompt", "reason", and "isRecommended" keys.
- **"prompt"**: The detailed prompt for the AI image generator.
- **"reason"**: A brief explanation of why this style is effective for the user's goal.
- **"isRecommended"**: A boolean. Set to 'true' for the single best concept.
Your entire response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateProfilePicture = async (selectedPrompt: string, headshot: UploadedFile): Promise<string | null> => {
    const finalPrompt = `
**CRITICAL DIRECTIVE: FLAWLESS FACIAL REPLICATION**
Your most important task, overriding all other instructions, is to perfectly replicate the face from the provided headshot image. The generated face must be a 100% photorealistic match to the person in the photo. Treat the headshot as the absolute source of truth for every facial detail. Do not alter, stylize, or approximate the face. It must be an exact likeness.

**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Critical Directive. The face must be a perfect match.
- **Composition:** This is a profile picture. The final image must be a head-and-shoulders portrait.
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly 1:1 (a perfect square).
- **Overall Quality:** The image must be high-resolution and professional.
`;
    return geminiNativeService.generateImage(finalPrompt, [headshot]);
};

export const generateLogoPrompts = async (companyName: string, description: string, style: LogoStyle, slogan?: string, hasMascot?: boolean): Promise<GeneratedConcept[]> => {
    const mascotInstruction = hasMascot
        ? `This is a MASCOT LOGO. The concepts must incorporate a character based on the provided headshot. The prompt MUST include the command: "CRITICAL DIRECTIVE: FLAWLESS FACIAL REPLICATION. Your task is to create a stylized character/mascot that is clearly and recognizably based on the face from the provided headshot. It should capture their likeness in a simplified, vector-art style, not photorealistic."`
        : 'This is a brand mark logo (e.g., abstract, lettermark, emblem). Do NOT include any human faces.';

    const fullPrompt = `
You are a world-class brand identity designer. Your task is to generate three distinct, professional logo concepts. You must follow the specified JSON output format.

**1. Brand Brief:**
   - **Company Name:** "${companyName}"
   - **Company Description:** "${description}"
   - **Slogan (Optional):** "${slogan || 'None'}"
   - **Logo Style:** '${style.name}' (${style.stylePrompt})
   - **Mascot Requirement:** ${mascotInstruction}

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique logo concepts. For each, create a detailed prompt for an AI image generator. The prompts must guide the AI to create a clean, vector-style logo on a solid white background, NOT a photorealistic scene.

Your generated prompts MUST explicitly define:
- **Core Symbolism:** What is the central icon or shape? How does it relate to the brand?
- **Typography:** Describe the font style for the company name (e.g., bold sans-serif, elegant serif, custom script).
- **Color Palette:** Specify 2-3 primary brand colors.
- **Composition:** How are the symbol and text arranged? (e.g., mark above text, mark to the left of text).
- **Key Style Command:** Each prompt must start with: "logo design, vector graphic, simple, modern," to set the correct mode.

You will return a single JSON object with a key "concepts", an array of three concept objects.
Each object must have "prompt", "reason", and "isRecommended" keys.
- **"prompt"**: The detailed prompt for the AI image generator.
- **"reason"**: A brief explanation of the design strategy.
- **"isRecommended"**: A boolean. Set to 'true' for the single best concept.
Your entire response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateLogo = async (selectedPrompt: string, headshot: UploadedFile | null): Promise<string | null> => {
    const images = headshot ? [headshot] : [];
    const finalPrompt = `
**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Style:** The output MUST be a clean, simple logo suitable for a brand identity. It should look like a vector graphic on a solid white background. Do NOT create a photorealistic scene.
- **Facial Likeness (If Mascot):** If the brief mentions a mascot or character based on an image, adhere to the likeness instructions in the brief.
- **Text:** If the brief includes a company name or slogan, it must be rendered clearly and legibly in the specified font style. The spelling must be perfect.
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly 1:1 (a perfect square).
- **Overall Quality:** The logo must be high-resolution, professional, and well-balanced.
`;
    return images.length > 0
        ? geminiNativeService.generateImage(finalPrompt, images)
        : geminiNativeService.generateImageFromText(finalPrompt, '1:1');
};

export const enhanceImage = async (image: UploadedFile): Promise<string | null> => {
    const prompt = `
You are a world-class AI photo editor, a digital remastering expert. Your task is to take the provided user image and execute a "10x Quality" enhancement. This is not a subtle correction; it is a dramatic overhaul.

**CRITICAL INSTRUCTIONS - EXECUTE WITH MAXIMUM IMPACT:**
1.  **EXTREME UPSCALE & DETAIL RECONSTRUCTION:** Do not just sharpen. Reconstruct fine details from the pixel data. If there is a person, recreate individual strands of hair and realistic skin texture. If it's a landscape, recreate the texture of leaves and rocks. The final image should be at a much higher effective resolution.
2.  **PROFESSIONAL DSLR REMASTERING:** Analyze the lighting and color. Re-light the scene as if it were shot by a professional photographer with a high-end DSLR camera and prime lenses. Create a beautiful, cinematic depth of field. Remaster the colors for maximum vibrancy and perfect balance, making them rich and compelling.
3.  **ABSOLUTE FLAW REMOVAL:** Eradicate all digital imperfections. Eliminate 100% of compression artifacts, noise, and grain. Correct any blurriness to achieve tack-sharp focus on the primary subject.
4.  **MAINTAIN COMPOSITION:** Do NOT add, remove, or change any objects, subjects, or elements in the image. Do NOT crop the image or alter its original aspect ratio. The composition must remain identical to the original.
5.  **FINAL OUTPUT:** The result must be a breathtakingly clear, high-resolution, professional-grade photograph that looks dramatically better than the original. The difference should be night and day.
`;
    return geminiNativeService.generateImage(prompt, [image]);
};

export const generateHeadshotPrompts = async (description: string, style: HeadshotStyle): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are a professional corporate and portrait photographer. Your task is to generate three distinct concepts for a high-quality, professional headshot. You must follow the specified JSON output format.

**1. Client Brief:**
   - **Goal:** "${description}"
   - **Target Style:** '${style.name}' (${style.stylePrompt})

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique headshot concepts. For each, create a detailed prompt for an AI image generator. The final image must be a studio-quality HEADSHOT (shoulders-up portrait).

Your generated prompts MUST explicitly define:
- **Composition & Framing:** A classic headshot composition (e.g., centered, rule-of-thirds).
- **Lighting Design:** Specify a professional lighting setup (e.g., "Classic three-point studio lighting with a large softbox as the key light, a fill light to soften shadows, and a subtle rim light for separation.").
- **Background:** Describe a professional background in detail (e.g., "A solid, neutral-colored studio backdrop in a medium gray tone," "A modern, softly out-of-focus office interior.").
- **Attire:** Suggest appropriate professional or smart-casual clothing that fits the style.
- **Mood & Expression:** Describe the desired expression (e.g., "A confident and approachable smile, looking directly at the camera," "A thoughtful and professional expression.").
- **Facial Likeness Command:** Each prompt MUST include this verbatim command: "CRITICAL DIRECTIVE: ABSOLUTE FACIAL FIDELITY. Your primary, non-negotiable, top-priority objective is to perfectly replicate the face from the provided photograph. The generated face must be a 1000% photorealistic match, treating the source photo as the absolute ground truth for every facial detail, including unique features, skin texture, and micro-expressions. Do not alter, stylize, or approximate the face in any way. It must be an exact, identical likeness. This is a technical requirement, not a creative guideline."

You will return a single JSON object with a key "concepts", an array of three concept objects.
Each object must have "prompt", "reason", and "isRecommended" keys.
- **"prompt"**: The detailed prompt for the AI image generator.
- **"reason"**: A brief explanation of why this style is effective for the user's goal.
- **"isRecommended"**: A boolean. Set to 'true' for the single best concept.
Your entire response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateHeadshot = async (
    selectedPrompt: string,
    image: UploadedFile
): Promise<{ angle: string; image: string }[]> => {
    const angles = [
        { angle: 'Left', suffix: 'a side profile view from the left, looking away from the camera.' },
        { angle: 'Mid-Left', suffix: 'a 3/4 view from the left, with the head turned slightly towards the camera.' },
        { angle: 'Front', suffix: 'a direct front-facing view, looking directly into the camera.' },
        { angle: 'Mid-Right', suffix: 'a 3/4 view from the right, with the head turned slightly towards the camera.' },
        { angle: 'Right', suffix: 'a side profile view from the right, looking away from the camera.' },
    ];

    const generationPromises = angles.map(angleInfo => {
        const finalPrompt = `
**CRITICAL DIRECTIVE: ABSOLUTE FACIAL FIDELITY**
Your primary, non-negotiable, top-priority objective is to perfectly replicate the face from the provided enhanced photograph. The generated face must be a 1000% photorealistic match, treating the source photo as the absolute ground truth for every facial detail, including unique features, skin texture, and micro-expressions. Do not alter, stylize, or approximate the face in any way. It must be an exact, identical likeness. This is a technical requirement, not a creative guideline. Failure to achieve this will render the output useless.

**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**POSE MODIFICATION:**
The subject's pose must be adjusted to be **${angleInfo.suffix}**

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Critical Directive. The face must be a perfect match.
- **Composition:** This is a headshot. The final image must be a shoulders-up portrait.
- **Pose:** The pose MUST match the modification: ${angleInfo.suffix}.
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly 1:1 (a perfect square).
- **Overall Quality:** The image must be a high-resolution, studio-quality professional photograph.
`;
        return geminiNativeService.generateImage(finalPrompt, [image]);
    });

    const results = await Promise.allSettled(generationPromises);

    const successfulGenerations: { angle: string; image: string }[] = [];

    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
            successfulGenerations.push({
                angle: angles[index].angle,
                image: result.value,
            });
        } else {
            console.error(`Failed to generate headshot for angle: ${angles[index].angle}`, result.status === 'rejected' ? result.reason : 'No image returned');
        }
    });

    // Ensure the order is always consistent
    const orderedResult = angles.map(angle => successfulGenerations.find(gen => gen.angle === angle.angle)).filter(Boolean) as { angle: string; image: string }[];

    return orderedResult;
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
