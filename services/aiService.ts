import { Type } from "@google/genai";
// FIX: Added NewspaperStyle to imports to support the new NewspaperCuttingMaker tool.
import { CreatorStyle, UploadedFile, AspectRatio, GeneratedConcept, PoliticalParty, PosterStyle, AdStyle, ValidationStatus, ProfilePictureStyle, LogoStyle, HeadshotStyle, PassportPhotoStyle, VisitingCardStyle, EventPosterStyle, SocialCampaign, NewspaperStyle } from '../types';
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

const TRENDS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        topics: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "A single trending topic string."
            }
        }
    },
    required: ["topics"],
};

// FIX: Added schemas for the new social media campaign generation feature.
const PLATFORM_POST_CONCEPT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        post: { type: Type.STRING, description: "The main text content for the post (e.g., for LinkedIn, Facebook)." },
        caption: { type: Type.STRING, description: "A shorter caption, typically for image-based posts like Instagram." },
        hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 3-5 relevant, SEO-friendly, and trending hashtags, including the '#' prefix."
        },
        call_to_action: { type: Type.STRING, description: "A clear call to action for the audience." },
        image_suggestion: { type: Type.STRING, description: "A detailed prompt for an AI image generator to create a visual for this post. This should be creative and descriptive." },
        video_suggestion: { type: Type.STRING, description: "A brief concept for a short-form video (Reel/Short/TikTok)." },
        video_script: { type: Type.STRING, description: "A short, editable script or voiceover for the video suggestion." },
        title: { type: Type.STRING, description: "A title, typically for content like YouTube Shorts or LinkedIn articles." },
        description: { type: Type.STRING, description: "A longer description, for platforms like YouTube." },
        text_post: { type: Type.STRING, description: "A short, text-only post, suitable for platforms like Threads or X/Twitter." },
    },
};

const SOCIAL_CAMPAIGN_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        LinkedIn: { ...PLATFORM_POST_CONCEPT_SCHEMA, description: "A professional post for LinkedIn." },
        Instagram: { ...PLATFORM_POST_CONCEPT_SCHEMA, description: "A visually-focused post for Instagram." },
        Facebook: { ...PLATFORM_POST_CONCEPT_SCHEMA, description: "An engaging post for Facebook." },
        'X-Twitter': { ...PLATFORM_POST_CONCEPT_SCHEMA, description: "A concise and punchy post for X (formerly Twitter)." },
        TikTok: { ...PLATFORM_POST_CONCEPT_SCHEMA, description: "A viral video concept for TikTok." },
        Threads: { ...PLATFORM_POST_CONCEPT_SCHEMA, description: "A conversational text-based post for Threads." },
        YouTube_Shorts: { ...PLATFORM_POST_CONCEPT_SCHEMA, description: "A short-form video concept for YouTube Shorts." },
    },
    required: ["LinkedIn", "Instagram", "Facebook", "X-Twitter", "TikTok", "Threads", "YouTube_Shorts"],
};

// Explicit type for the AI's JSON response to ensure type safety.
interface ConceptsResponse {
    concepts: GeneratedConcept[];
}

const parseAndValidateConcepts = (jsonText: string): GeneratedConcept[] => {
    try {
        // Clean the response by removing markdown code block fences that some models add.
        const cleanedJsonText = jsonText.replace(/^```(?:json)?\s*|```\s*$/g, '').trim();
        const result = JSON.parse(cleanedJsonText) as ConceptsResponse;
        
        if (result && result.concepts && Array.isArray(result.concepts)) {
            // Ensure only one is recommended, or just take the first one if multiple are.
            let recommendedFound = false;

            const concepts: GeneratedConcept[] = result.concepts.map((c: GeneratedConcept) => {
                // Create a copy to avoid mutating the original object from the parsed JSON.
                const newConcept: GeneratedConcept = { ...c };

                if (newConcept.isRecommended && !recommendedFound) {
                    recommendedFound = true;
                    return newConcept;
                }
                return { ...newConcept, isRecommended: false };
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
- **Facial Likeness Command:** Each prompt MUST include this exact, verbatim command:
  "**NON-NEGOTIABLE CORE DIRECTIVE: 10000% FACIAL LIKENESS & FIDELITY.**
  Your primary, non-negotiable, and most critical task is to achieve a perfect, 10000% photorealistic match to the face in the provided headshot image(s). This is a strict technical mandate, not a creative guideline.
  - **Source of Truth:** Treat the source photograph as the absolute ground truth for every facial detail: eyes, nose, mouth, jawline, skin texture, and unique features.
  - **No Artistic Interpretation:** Do not alter, stylize, approximate, or "enhance" the face. It must be an exact, identical, photorealistic replication.
  - **Failure Condition:** Any deviation from a perfect likeness, no matter how small, constitutes a complete failure of the entire generation task."

You will return a single JSON object. The object must contain a key "concepts", which is an array of three concept objects.
Each concept object must have the following keys: "prompt", "reason", "isRecommended".
- **"prompt"**: The detailed, expertly crafted prompt for the AI image generator. This must be a single string of text.
- **"reason"**: A brief, strategic explanation of why this concept will maximize clicks for this specific creator and video. This must be a single string of text.
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
        brandInstruction = `BRANDING: A key brand element must be included: "${brandDetails}". This could be a brand name, a logo concept, or a specific visual motif. It must be rendered with 10000% accuracy as described.`;
    }

    const finalPrompt = `
**NON-NEGOTIABLE CORE DIRECTIVE: 10000% FACIAL LIKENESS & FIDELITY.**
Your primary, non-negotiable, and most critical task is to achieve a perfect, 10000% photorealistic match to the face in the provided headshot image(s). This is a strict technical mandate, not a creative guideline.
- **Source of Truth:** Treat the source photograph as the absolute ground truth for every facial detail: eyes, nose, mouth, jawline, skin texture, and unique features.
- **No Artistic Interpretation:** Do not alter, stylize, approximate, or "enhance" the face. It must be an exact, identical, photorealistic replication.
- **Failure Condition:** Any deviation from a perfect likeness, no matter how small, constitutes a complete failure of the entire generation task.

**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Core Directive. The face must be a perfect match.
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
- **Facial Likeness Command:** Each prompt MUST include this exact, verbatim command:
  "**NON-NEGOTIABLE CORE DIRECTIVE: 10000% FACIAL LIKENESS & FIDELITY.**
  Your primary, non-negotiable, and most critical task is to achieve a perfect, 10000% photorealistic match to the face in the provided headshot image(s). This is a strict technical mandate, not a creative guideline.
  - **Source of Truth:** Treat the source photograph as the absolute ground truth for every facial detail: eyes, nose, mouth, jawline, skin texture, and unique features.
  - **No Artistic Interpretation:** Do not alter, stylize, approximate, or "enhance" the face. It must be an exact, identical, photorealistic replication.
  - **Failure Condition:** Any deviation from a perfect likeness, no matter how small, constitutes a complete failure of the entire generation task."

You will return a single JSON object. The object must contain a key "concepts", which is an array of three concept objects.
Each concept object must have the following keys: "prompt", "reason", "isRecommended".
- **"prompt"**: The detailed, expertly crafted prompt for the AI image generator, including all branding and facial likeness commands. This must be a single string of text.
- **"reason"**: A brief, strategic analysis of why this concept is effective for this campaign. This must be a single string of text.
- **"isRecommended"**: A boolean. You must identify the single best concept by setting this to 'true'. The other two must be 'false'.
Your entire response MUST be only the raw JSON object, without any markdown formatting, comments, or any other text outside of the JSON structure.
`;

    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generatePoster = async (selectedPrompt: string, headshots: UploadedFile[], aspectRatio: AspectRatio, party: PoliticalParty | undefined): Promise<string | null> => {
    const finalPrompt = `
**NON-NEGOTIABLE CORE DIRECTIVE: 10000% FACIAL LIKENESS & FIDELITY.**
Your primary, non-negotiable, and most critical task is to achieve a perfect, 10000% photorealistic match to the face in the provided headshot image(s). This is a strict technical mandate.
- **Source of Truth:** The source photograph is the absolute ground truth for every facial detail.
- **No Artistic Interpretation:** Do not alter, stylize, or approximate the face.
- **Failure Condition:** Any deviation from a perfect likeness is a complete failure of the task.

**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Core Directive. The face must be a perfect match.
- **Branding Integrity:** The prompt contains specific branding instructions (party name, logo, colors). You MUST execute these with 10000% accuracy. The logo and colors are non-negotiable.
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
- **Facial Likeness Command:** Each prompt MUST include this exact, verbatim command:
  "**NON-NEGOTIABLE CORE DIRECTIVE: 10000% FACIAL LIKENESS & FIDELITY.**
  Your primary, non-negotiable, and most critical task is to achieve a perfect, 10000% photorealistic match to the face in the provided headshot image. This is a strict technical mandate, not a creative guideline.
  - **Source of Truth:** Treat the source photograph as the absolute ground truth for every facial detail.
  - **No Artistic Interpretation:** Do not alter, stylize, or approximate the face.
  - **Failure Condition:** Any deviation from a perfect likeness is a complete failure of the task."
- **Product Integration Command:** Each prompt MUST include a command to photorealistically composite the user's provided product image into the scene, treating it as an exact, unchangeable element.

You will return a single JSON object. The object must contain a key "concepts", which is an array of three concept objects.
Each concept object must have the following keys: "prompt", "reason", "isRecommended".
- **"prompt"**: The detailed, expertly crafted prompt for the AI image generator, including all commands. This must be a single string of text.
- **"reason"**: An expert analysis of the marketing strategy behind the concept and its expected ROI. This must be a single string of text.
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

**ABSOLUTE COMMAND: 1000% PERFECT PRODUCT MATCH. NO EXCEPTIONS.**
Your primary and most important task is to perfectly and exactly composite the provided PRODUCT image (Image 1) into the final scene.
- **DO NOT REDRAW THE PRODUCT. DO NOT ALTER THE PRODUCT. DO NOT STYLIZE THE PRODUCT. DO NOT CHANGE THE PRODUCT IN ANY WAY.**
- This is especially critical for handicraft items where the exact appearance is everything.
- You must treat the product image as a fixed, unchangeable asset to be placed within the scene you generate.
- The final product in the ad MUST be 1000% identical to the source image. This is a non-negotiable technical requirement. Any change is a failure.

**ABSOLUTE COMMAND: 1000% PERFECT HEADSHOT MATCH. NO EXCEPTIONS.**
Your second primary task is to achieve a perfect, 1000% photorealistic match to the face from the provided MODEL HEADSHOT (Image 2).
- **Source of Truth:** The headshot is the absolute ground truth for all facial features.
- **No Artistic Interpretation of the Face:** Do not alter, stylize, or approximate the face. It must be an exact, identical, photorealistic replication.
- **Failure Condition:** Any deviation from a perfect likeness is a complete failure of the task.

**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Product Fidelity:** Adhere to the Product Directive. The PRODUCT (Image 1) must be perfectly composited, not redrawn. 1000% match.
- **Facial Likeness:** Adhere to the Headshot Directive. The face must be a perfect match to the MODEL HEADSHOT (Image 2). 1000% match.
- **Headline & Branding:** The headline "${headline}" and brand details "${brandDetails}" must be masterfully incorporated into the design. They must be legible, stylishly typeset, and placed for maximum impact with 10000% accuracy.
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
- **"prompt"**: The detailed prompt for the AI image generator. This must be a single string of text.
- **"caption"**: The complete, ready-to-post text caption. This must be a single string of text.
- **"reason"**: A brief, expert analysis of why this visual/caption combo is a strong strategy for this platform. This must be a single string of text.
- **"isRecommended"**: A boolean. You must identify the single best concept by setting this to 'true'. The other two must be 'false'.
Your entire response MUST be only the raw JSON object, without any markdown formatting, comments, or any other text outside of the JSON structure.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, SOCIAL_CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateSocialPost = async (selectedPrompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
    const finalPrompt = `
**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**TECHNICAL MANDATES:**
- The final image must be high-resolution, visually stunning, and follow the creative brief precisely.
- The aspect ratio MUST be exactly ${aspectRatio}.
`;
    
    return geminiNativeService.generateImageFromText(finalPrompt, aspectRatio);
};

export const generateSocialPostWithHeadshot = async (prompt: string, headshot: UploadedFile, aspectRatio: AspectRatio): Promise<string | null> => {
    const finalPrompt = `
${prompt}

**FINAL EXECUTION CHECKLIST:**
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
- **Overall Quality:** The image must be high-resolution, professional, and visually striking, fully realizing the creative brief.
`;
    return geminiNativeService.generateImage(prompt, [headshot]);
};

export const generateSocialVideo = async (prompt: string): Promise<string | null> => {
    const downloadLink = await geminiNativeService.generateVideo(prompt);
    if (!downloadLink) {
        return null;
    }
    const videoBlob = await geminiNativeService.fetchVideoData(downloadLink);
    if (!videoBlob) {
        return null;
    }
    // Create a local URL for the blob to be used in the <video> src
    return URL.createObjectURL(videoBlob);
};

// Explicit type for the AI's JSON response to ensure type safety.
interface TrendsResponse {
    topics: string[];
}

export const getTrendingTopics = async (baseKeyword: string): Promise<string[]> => {
    const prompt = `
You are a Google Trends and social media expert. Your task is to identify the top 3 most relevant, specific, and currently trending topics related to a base keyword.

**Base Keyword:** "${baseKeyword}"

**Instructions:**
1.  Analyze recent search data, news headlines, and social media conversations related to the base keyword.
2.  Identify three distinct, highly specific sub-topics that are currently experiencing a surge in interest.
3.  Do NOT return broad or generic topics. Find niche, actionable trends. For example, if the keyword is "AI", good topics are "The release of the new Llama 3 model" or "AI's impact on the film industry", not "Artificial Intelligence".
4.  Return the topics as a JSON object containing a key "topics" which is an array of three strings.

Your entire response MUST be only the raw JSON object.
`;

    const jsonText = await geminiNativeService.generateText(prompt, TRENDS_SCHEMA);
    try {
        const cleanedJsonText = jsonText.replace(/^```(?:json)?\s*|```\s*$/g, '').trim();
        const result = JSON.parse(cleanedJsonText) as TrendsResponse;
        if (result && result.topics && Array.isArray(result.topics)) {
            return result.topics.slice(0, 3);
        }
        throw new Error("Invalid response format from AI for trends.");
    } catch (e) {
        console.error("Failed to parse trending topics response:", e);
        throw new Error("Failed to get trending topics from the AI.");
    }
};

// FIX: Completed the function by adding a prompt and return statement.
export const generateTrendPostConcepts = async (topic: string, platform: string, style: AdStyle): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are a viral content specialist. Your task is to generate three complete social media post concepts (visual + caption) to capitalize on a trending topic. You must follow the specified JSON output format.

**1. Post Brief:**
   - **Trending Topic:** "${topic}"
   - **Target Platform:** ${platform}
   - **Visual Style:** '${style.name}' (${style.stylePrompt})

**CRITICAL TASK & INSTRUCTIONS:**
For each of the three concepts, develop a complete package: a compelling visual idea and an engaging caption that taps into the trend.

**Visual Idea (for the "prompt" field):**
- Create a detailed prompt for an AI image generator that is visually arresting and directly relates to the trending topic.
- The prompt must adhere to the specified '${style.name}' visual style.

**Caption (for the "caption" field):**
- Write a short, punchy, and platform-aware caption that immediately hooks into the trend.
- Include 3-5 highly relevant and trending hashtags for the '${platform}' platform to maximize reach.

You will return a single JSON object. The object must contain a key "concepts", which is an array of three concept objects.
Each concept object must have the following keys: "prompt", "caption", "reason", "isRecommended".
- **"prompt"**: The detailed prompt for the AI image generator.
- **"caption"**: The complete, ready-to-post text caption.
- **"reason"**: A brief, expert analysis of why this angle on the trend is likely to go viral.
- **"isRecommended"**: A boolean. You must identify the single best concept by setting this to 'true'. The other two must be 'false'.
Your entire response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, SOCIAL_CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

// FIX: Added a new parsing function for the complex SocialCampaign type.
const parseAndValidateCampaign = (jsonText: string): SocialCampaign => {
    try {
        const cleanedJsonText = jsonText.replace(/^```(?:json)?\s*|```\s*$/g, '').trim();
        const result = JSON.parse(cleanedJsonText);
        
        // Basic validation to ensure it looks like the campaign object
        if (result && typeof result === 'object' && result.Instagram && result.LinkedIn) {
            return result as SocialCampaign;
        } else {
            console.error("Parsed JSON, but campaign format is invalid:", result);
            throw new Error("Invalid campaign response format from AI.");
        }
    } catch (parseError) {
        console.error("Failed to parse AI response as JSON for campaign:", parseError);
        console.error("Raw text received from AI:", jsonText);
        throw new Error("Failed to parse the AI's campaign response. The data was not valid JSON.");
    }
};

// FIX: Implemented the missing function 'generateSocialMediaCampaign'.
export const generateSocialMediaCampaign = async (topic: string, keywords: string, link: string, headshot: UploadedFile | null, sampleImage: UploadedFile | null, postLink: string, creatorName?: string): Promise<SocialCampaign> => {
    const headshotInstruction = headshot ? `
- **Headshot Provided (MAIN SUBJECT):** A headshot image has been provided. THIS IS THE MAIN SUBJECT. All generated 'image_suggestion' prompts MUST include the following verbatim command to ensure facial likeness of this person:
  "**NON-NEGOTIABLE CORE DIRECTIVE: 10000% FACIAL LIKENESS & FIDELITY.** Your primary task is to achieve a perfect, photorealistic match to the face in the provided headshot image. This is a strict technical mandate. Any deviation is a complete failure."
` : '- **No Headshot Provided:** Generate images without a specific person.';

    const styleInstruction = sampleImage || postLink.trim() ? `
- **Style Reference Provided (STYLE ONLY):** A sample image and/or post link has been provided. This is FOR STYLE REFERENCE ONLY. DO NOT replicate the content of the sample. Your PRIMARY creative task is to analyze this reference and ensure your entire campaign output (tone, writing style, and especially the 'image_suggestion' prompts) emulates this sample's aesthetic.
` : '- **No Style Reference Provided:** Use your best judgment to create a high-quality, engaging visual style.';
    
    const creatorNameInstruction = creatorName ? `
- **Creator Name:** The name of the person or leader for this campaign is "${creatorName}". Incorporate this name naturally into the post content where appropriate for a personal touch.` : '';

    const fullPrompt = `
You are a senior social media marketing manager and an expert in SEO. Your task is to generate a complete, multi-platform social media campaign based on a central topic. You must follow the specified JSON output format precisely.

**1. Campaign Brief:**
   - **Core Topic/Announcement:** "${topic}"
   - **Keywords to Include:** "${keywords}"
   - **Link to Promote (if any):** "${link}"
   - **Post Link for Style Reference (if any):** "${postLink}"

**2. CRITICAL DIRECTIVES:**
   - **LANGUAGE:** All generated text content (posts, captions, hashtags, scripts, etc.) MUST be in **ENGLISH**.
   ${creatorNameInstruction}
   ${headshotInstruction}
   ${styleInstruction}

**CRITICAL TASK & INSTRUCTIONS:**
Create a tailored post for each of the following platforms: LinkedIn, Instagram, Facebook, X-Twitter, TikTok, Threads, and YouTube_Shorts. The content must be SEO-friendly and use relevant, trending hashtags.

**Required Elements for EACH Platform:**
- **Content:** Create the main text for the post, adapted for the platform's style.
- **Hashtags:** Provide 3-5 relevant, SEO-friendly, and popular hashtags, including the '#' prefix.
- **Call to Action:** Create a clear call to action, incorporating the provided link if available.
- **Image Suggestion:** Write a detailed, creative prompt for an AI image generator. It MUST follow the headshot and style directives.
- **Video Suggestion:** For video-centric platforms (TikTok, YouTube_Shorts), provide a brief, concise video concept (under 50 words). For all other platforms, this field MUST be "N/A". This is a strict rule.
- **Video Script:** For video-centric platforms, also generate a short, editable 'video_script' containing the dialogue or voiceover text for the video. For all other platforms, this MUST be "N/A".

You will return a single JSON object. The object must contain keys for each platform.
The value for each key must be an object matching the platform post concept schema.
Your entire response MUST be only the raw JSON object, without any markdown formatting.
`;
    
    const imagesToAnalyze: UploadedFile[] = [];
    if (sampleImage) {
        imagesToAnalyze.push(sampleImage);
    }
    
    let jsonText: string;
    if (imagesToAnalyze.length > 0) {
        jsonText = await geminiNativeService.generateTextFromMultimodal(fullPrompt, imagesToAnalyze, SOCIAL_CAMPAIGN_SCHEMA);
    } else {
        jsonText = await geminiNativeService.generateText(fullPrompt, SOCIAL_CAMPAIGN_SCHEMA);
    }
    return parseAndValidateCampaign(jsonText);
};

// FIX: Implemented the missing function 'generateProfilePicturePrompts'.
export const generateProfilePicturePrompts = async (description: string, style: ProfilePictureStyle): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are a master portrait photographer and digital artist. Your task is to generate three distinct concepts for a professional or creative profile picture. You must follow the specified JSON output format.

**1. User Request:**
   - **Description:** "${description}"
   - **Target Style:** '${style.name}' (${style.stylePrompt})

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique concepts. For each, create a detailed prompt for an AI image generator.

Your generated prompts MUST explicitly define:
- **Lighting:** (e.g., "dramatic Rembrandt lighting", "soft, flattering beauty light").
- **Composition:** (e.g., "centered head-and-shoulders crop", "asymmetrical framing").
- **Background:** (e.g., "solid neutral gray background", "out-of-focus office environment").
- **Expression & Mood:** (e.g., "confident and approachable smile", "creative and introspective expression").
- **Facial Likeness Command:** Each prompt MUST include this exact, verbatim command:
  "**NON-NEGOTIABLE CORE DIRECTIVE: 10000% FACIAL LIKENESS & FIDELITY.**
  Your primary, non-negotiable, and most critical task is to achieve a perfect, 10000% photorealistic match to the face in the provided headshot image. This is a strict technical mandate, not a creative guideline.
  - **Source of Truth:** Treat the source photograph as the absolute ground truth for every facial detail.
  - **No Artistic Interpretation:** Do not alter, stylize, approximate, or "enhance" the face. It must be an exact, identical, photorealistic replication.
  - **Failure Condition:** Any deviation from a perfect likeness is a complete failure of the entire generation task."

You will return a single JSON object with a key "concepts", which is an array of three concept objects.
Each object must have "prompt", "reason", and "isRecommended" keys.
Your entire response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

// FIX: Implemented the missing function 'generateProfilePicture'.
export const generateProfilePicture = async (selectedPrompt: string, headshot: UploadedFile): Promise<string | null> => {
    const finalPrompt = `
**NON-NEGOTIABLE CORE DIRECTIVE: 10000% FACIAL LIKENESS & FIDELITY.**
Your primary, non-negotiable, and most critical task is to achieve a perfect, 10000% photorealistic match to the face in the provided headshot image. This is a strict technical mandate.
- **Source of Truth:** The provided photo is the absolute ground truth for all facial features.
- **No Artistic Interpretation of Face:** Do not alter or stylize the face. It must be a perfect, photorealistic replication.
- **Failure Condition:** Any deviation from a perfect likeness is a complete failure of the task.

**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Core Directive. The face must be a perfect match.
- **Aspect Ratio:** The final image MUST be a square (1:1 aspect ratio).
- **Overall Quality:** The image must be a high-resolution, professional-grade profile picture.
`;
    return geminiNativeService.generateImage(finalPrompt, [headshot]);
};

// FIX: Implemented the missing function 'generateLogoPrompts'.
export const generateLogoPrompts = async (companyName: string, description: string, style: LogoStyle, slogan?: string, hasMascot?: boolean): Promise<GeneratedConcept[]> => {
    const mascotInstruction = hasMascot ? `
- **Mascot Integration:** The logo MUST incorporate a character or mascot.
- **Facial Likeness Command for Mascot:** The prompt MUST include this exact, verbatim command:
  "**NON-NEGOTIABLE CORE DIRECTIVE: 10000% FACIAL LIKENESS & FIDELITY FOR MASCOT.**
  Your primary task is to achieve a perfect, 10000% photorealistic match for the MASCOT'S FACE using the provided headshot image, but stylize it to fit the logo. The rest of the logo should be designed around this mascot.
  - **Source of Truth:** The photo is the ground truth for the mascot's facial features.
  - **Artistic Interpretation:** While the likeness must be perfect, the rendering style (e.g., cartoon, illustrative) should match the overall logo aesthetic.
  - **Failure Condition:** Failure to achieve a clear likeness for the mascot is a complete failure of the task."`
        : '';

    const fullPrompt = `
You are a world-class brand identity designer. Your task is to generate three distinct, professional logo concepts. You must follow the specified JSON output format.

**1. Brand Brief:**
   - **Company Name:** "${companyName}"
   - **Slogan (Optional):** "${slogan || 'N/A'}"
   - **Company Description:** "${description}"
   - **Target Style:** '${style.name}' (${style.stylePrompt})
   ${mascotInstruction}

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique logo concepts. For each, create a detailed prompt for an AI image generator. The prompt should be a complete art direction for creating a vector-style logo on a clean, solid white background.

The prompts MUST include:
- **Core Concept:** A clear idea for the logo's iconography and composition.
- **Typography:** Suggestions for font style (e.g., "clean sans-serif font", "elegant serif typeface").
- **Color Palette:** A specific color scheme.
- **Text Integration:** Explicitly state that the logo must include the company name "${companyName}" and, if provided, the slogan "${slogan}".

You will return a single JSON object with a "concepts" key, an array of three objects.
Each object must have "prompt", "reason", and "isRecommended" keys.
Your response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

// FIX: Implemented the missing function 'generateLogo'.
export const generateLogo = async (selectedPrompt: string, headshot: UploadedFile | null): Promise<string | null> => {
    const finalPrompt = `
**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Design Style:** Execute the creative brief precisely.
- **Background:** The logo MUST be on a solid, clean, WHITE background. This is non-negotiable.
- **Text Accuracy:** Any text (company name, slogan) mentioned in the brief must be rendered with 10000% accuracy. No spelling errors.
- **Mascot Likeness:** If the brief includes the "FACIAL LIKENESS" directive, you must adhere to it for the mascot.
- **Aspect Ratio:** The final image must be a square (1:1 aspect ratio).
- **Format:** The final output should be a clean, high-resolution graphic, suitable for a logo.
`;
    const images = headshot ? [headshot] : [];
    if (images.length > 0) {
        return geminiNativeService.generateImage(finalPrompt, images);
    } else {
        return geminiNativeService.generateImageFromText(finalPrompt, '1:1');
    }
};

// FIX: Implemented the missing function 'enhanceImage'.
export const enhanceImage = async (image: UploadedFile): Promise<string | null> => {
    const prompt = `
**CRITICAL TASK: 10x IMAGE ENHANCEMENT**
Your task is to take the provided user image and perform a comprehensive, professional-grade enhancement.
1.  **Upscale Resolution:** Increase the image resolution significantly without introducing artifacts.
2.  **Denoise and Clean:** Remove any noise, grain, and compression artifacts.
3.  **Sharpen and Detail:** Intelligently sharpen the image, focusing on bringing out fine details in textures, faces, and fabrics.
4.  **Lighting and Color Correction:** Correct any color casts, improve dynamic range (contrast), and relight the scene subtly to make the subject pop. The result should look natural and professional, not overly edited.
5.  **Output:** Return only the final, enhanced image. Do not add any text or alter the composition.
`;
    return geminiNativeService.generateImage(prompt, [image]);
};

// FIX: Implemented the missing function 'generateHeadshotPrompts'.
export const generateHeadshotPrompts = async (description: string, style: HeadshotStyle, imageCount: number): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are an expert corporate and portrait photographer. Generate three distinct concepts for a professional headshot. The final output will be a set of 5 headshots from different angles (Front, 3/4 Left, 3/4 Right, Left Profile, Right Profile). Your concepts should provide a strong, unified art direction suitable for this multi-angle output. You must follow the specified JSON output format.

**1. User Request:**
   - **Purpose/Description:** "${description}"
   - **Target Style:** '${style.name}' (${style.stylePrompt})
   - **User Assets:** The user has provided ${imageCount} reference photo(s).

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique concepts. For each, create a detailed prompt for an AI image generator.

Your prompts MUST explicitly define:
- **Outfit:** Describe a suitable professional outfit.
- **Lighting:** (e.g., "professional three-point studio lighting", "soft window light").
- **Background:** (e.g., "out-of-focus modern office background", "solid, neutral-colored studio backdrop").
- **Expression & Mood:** (e.g., "a confident, friendly smile, posed at a 3/4 angle", "a powerful and serious expression, looking directly at the camera").
- **Facial Likeness Command:** Each prompt MUST include this exact, verbatim command:
  "**NON-NEGOTIABLE CORE DIRECTIVE: 10000% FACIAL LIKENESS & FIDELITY.**
  Your primary task is to achieve a perfect, 10000% photorealistic match to the face by synthesizing the best features from ALL provided reference images. This is not a creative guideline.
  - **Source of Truth:** The provided photos are the absolute ground truth for all facial features. Use the clearest details from across the entire set of images.
  - **No Artistic Interpretation:** Do not alter or stylize the face. It must be a perfect, photorealistic replication.
  - **Failure Condition:** Any deviation from a perfect likeness is a complete failure of the task."

Return a single JSON object with a "concepts" key, an array of three objects.
Each object must have "prompt", "reason", and "isRecommended" keys.
Your response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

// FIX: Implemented the missing function 'generateHeadshot'.
const HEADSHOT_ANGLES = ["Front", "3/4 Left", "3/4 Right", "Left Profile", "Right Profile"];
export const generateHeadshot = async (selectedPrompt: string, images: UploadedFile[]): Promise<{ angle: string; image: string; }[]> => {
    const generationPromises = HEADSHOT_ANGLES.map(async (angle) => {
        const anglePrompt = `
**NON-NEGOTIABLE CORE DIRECTIVE: 10000% FACIAL LIKENESS & FIDELITY.**
Your primary, non-negotiable, and most critical task is to achieve a perfect, 10000% photorealistic match to the face by synthesizing information from ALL provided reference images. This is a strict technical mandate.
- **Source of Truth:** You are provided with several reference photos. Use all of them to reconstruct the most accurate and high-fidelity facial likeness possible. The first image is the primary, enhanced reference, but you should use details from other images if they provide a clearer view of certain features (e.g., eyes, profile).
- **No Artistic Interpretation of Face:** Do not alter or stylize the face. It must be a perfect, photorealistic replication.
- **Failure Condition:** Any deviation from a perfect likeness is a complete failure of the task.

**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**MANDATORY POSE MODIFICATION:**
- You MUST render the person from a **${angle} view**. The head and body should be turned appropriately for this angle.

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Perfect match synthesized from ALL provided images.
- **Angle:** Precisely render the **${angle}** pose.
- **Aspect Ratio:** The final image MUST be a square (1:1 aspect ratio).
- **Quality:** High-resolution, professional-grade headshot.
`;
        try {
            const image = await geminiNativeService.generateImage(anglePrompt, images);
            return image ? { angle, image } : null;
        } catch (error) {
            console.error(`Failed to generate headshot for angle ${angle}:`, error);
            return null; // Don't let one failure kill the whole batch
        }
    });

    const results = await Promise.all(generationPromises);
    return results.filter((result): result is { angle: string; image: string; } => result !== null);
};

// FIX: Implemented the missing function 'generatePassportPhoto'.
export const generatePassportPhoto = async (image: UploadedFile, outfit: string, backgroundColor: string): Promise<string | null> => {
    const prompt = `
**CRITICAL TASK: OFFICIAL PASSPORT PHOTO CREATION**
Your task is to convert the provided user photo into an official, compliant passport/visa photo.

**NON-NEGOTIABLE CORE DIRECTIVE: 10000% FACIAL LIKENESS & FIDELITY.**
- Your primary task is to achieve a perfect, 10000% photorealistic match to the face in the provided image. This is a strict technical mandate. Do not alter or stylize the face. Any deviation is a complete failure.

**EXECUTION STEPS:**
1.  **Isolate Subject:** Perfectly cut out the person from their original background.
2.  **Replace Background:** Create a new, completely solid, and evenly lit background using the exact hex color: **${backgroundColor}**.
3.  **Change Outfit:** Replace the person's current clothing with **${outfit}**. The new outfit should look natural and be appropriate for an official document.
4.  **Pose & Expression:** Ensure the final image is a front-facing, head-and-shoulders portrait with a neutral expression, eyes open and looking directly at the camera.
5.  **Final Image:** The output must be a clean, high-resolution image with no shadows on the background. Return only the final image.
`;
    return geminiNativeService.generateImage(prompt, [image]);
};

// FIX: Updated function to accept eventDetails object and include them in the prompt, resolving the argument count error.
export const editEventPoster = async (
    image: UploadedFile,
    headline: string,
    branding: string,
    style: EventPosterStyle,
    eventDetails: { date: string; time: string; venue: string }
): Promise<string | null> => {
    const brandingInstruction = branding.trim() ? `Also, subtly integrate the following branding information: "${branding}".` : "";
    
    const details = [];
    if (eventDetails.date?.trim()) details.push(`Date: ${eventDetails.date}`);
    if (eventDetails.time?.trim()) details.push(`Time: ${eventDetails.time}`);
    if (eventDetails.venue?.trim()) details.push(`Venue: ${eventDetails.venue}`);
    
    const detailsInstruction = details.length > 0
        ? `In a smaller, legible font, include the following event details: ${details.join(' | ')}.`
        : "";

    const prompt = `
**TASK: TRANSFORM PHOTO INTO EVENT POSTER**
Take the provided event photograph and turn it into a stylish promotional poster.

**EXECUTION STEPS:**
1.  **Enhance Image:** First, perform a general enhancement on the photo to improve its quality, lighting, and color.
2.  **Add Headline:** Add the main headline text: "${headline}".
3.  **Apply Style:** The text's typography (font, color, layout) for the headline MUST adhere to this style guide: ${style.stylePrompt}.
4.  **Add Branding:** ${brandingInstruction}
5.  **Add Event Details:** ${detailsInstruction}
6.  **Integration:** All text elements (headline, branding, details) must be artistically integrated into the image, looking like a professional graphic designer created it. It should not look like simple text overlaid on a photo. Ensure good hierarchy and readability.
7.  **Output:** Return only the final, edited poster image.
`;
    return geminiNativeService.generateImage(prompt, [image]);
};

// FIX: Implemented the missing function 'generateNewspaperCutting' to support the NewspaperCuttingMaker tool.
export const generateNewspaperCutting = async (
    image: UploadedFile,
    headline: string,
    bodyText: string,
    newspaperName: string,
    date: string,
    style: NewspaperStyle
): Promise<string | null> => {
    const prompt = `
**CRITICAL TASK: CREATE REALISTIC NEWSPAPER CLIPPING**
Your task is to take a user-provided photo and text, and transform them into a highly realistic newspaper clipping.

**EXECUTION STEPS:**
1.  **Apply Newspaper Style:** The entire clipping MUST adhere to the following style guide: "${style.stylePrompt}". This includes the paper texture, font choices, and photo treatment (e.g., black and white, halftone).
2.  **Integrate Text:**
    -   **Newspaper Name:** Prominently feature the name of the newspaper: "${newspaperName}".
    -   **Date:** Include the date: "${date}".
    -   **Headline:** Use the main headline: "${headline}". This must be the most prominent text.
    -   **Body Text:** Use the following body text for the article, formatted into realistic newspaper columns: "${bodyText}".
3.  **Integrate Photo:**
    -   Take the user-provided image and place it within the article.
    -   The photo's style MUST be transformed to match the newspaper style (e.g., converted to grainy black and white with a halftone effect if the style is vintage).
4.  **Final Composition:**
    -   The final output should be a single image of the newspaper clipping, appearing as if it was torn or cut from a larger page.
    -   The layout should be professional and authentic to the chosen newspaper style.
    -   Return ONLY the final image of the newspaper clipping.
`;
    return geminiNativeService.generateImage(prompt, [image]);
};

// FIX: Implemented the missing function 'generateVisitingCardPrompts'.
export const generateVisitingCardPrompts = async (companyName: string, personName: string, title: string, contactInfo: string, style: VisitingCardStyle, hasLogo?: boolean): Promise<GeneratedConcept[]> => {
    const logoInstruction = hasLogo ? "The design MUST incorporate the user's provided company logo." : "The design should have a space for a logo, or create a simple typographic logo for the company name.";

    const fullPrompt = `
You are a professional graphic designer specializing in print design. Generate three distinct concepts for a professional visiting card (business card). You must follow the specified JSON output format.

**1. Card Details:**
   - **Company Name:** ${companyName}
   - **Person's Name:** ${personName}
   - **Title/Designation:** ${title}
   - **Contact Info:** ${contactInfo}
   - **Design Style:** '${style.name}' (${style.stylePrompt})
   - **Logo:** ${logoInstruction}

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique concepts. For each, create a detailed prompt for an AI image generator. The prompt should result in a standard visiting card design (3.5 x 2 inches).

The prompts MUST include:
- **Layout & Composition:** Describe the placement of all elements (logo, names, contact info).
- **Typography:** Suggest specific font styles and hierarchy for the text elements.
- **Color Palette:** Define a professional color scheme that fits the style.
- **Text Accuracy:** The prompt must explicitly command the AI to render all text details with 10000% accuracy.

You will return a single JSON object with a "concepts" key, an array of three objects.
Each object must have "prompt", "reason", and "isRecommended" keys.
Your response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

// FIX: Implemented the missing function 'generateVisitingCard'.
export const generateVisitingCard = async (selectedPrompt: string, logo: UploadedFile | null): Promise<string | null> => {
    const finalPrompt = `
**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Design:** Execute the creative brief precisely.
- **Text Accuracy:** All text details (names, company, contact info) mentioned in the brief must be rendered with 10000% PERFECT accuracy, with no spelling errors or omissions. This is the most critical part of the task.
- **Logo Integration:** If the brief mentions integrating a provided logo, you must use the image provided.
- **Aspect Ratio:** The final image MUST have a standard business card aspect ratio of **3.5:2**.
- **Quality:** The final image must be a crisp, high-resolution, print-ready design.
`;
    const images = logo ? [logo] : [];
    if (images.length > 0) {
        return geminiNativeService.generateImage(finalPrompt, images);
    } else {
        return geminiNativeService.generateImageFromText(finalPrompt, '3.5:2');
    }
};

// FIX: Implemented the missing function 'checkCurrentApiStatus'.
export const checkCurrentApiStatus = async (): Promise<{ status: ValidationStatus; error?: string | null }> => {
    try {
        const apiKey = apiConfigService.getApiKey();
        const { isValid, error } = await geminiNativeService.validateApiKey(apiKey);
        return {
            status: isValid ? 'valid' : 'invalid',
            error: error || (isValid ? null : 'The provided API key is invalid.'),
        };
    } catch (error: any) {
        return {
            status: 'invalid',
            error: error.message || 'API key is not configured.',
        };
    }
};

export const editImage = async (base64Image: string, prompt: string): Promise<string | null> => {
    const fullPrompt = `
    Perform an in-place edit on the provided image based on the user's request.
    User Request: "${prompt}"
    Your task is to return ONLY the edited image, without changing the overall composition or subject unless explicitly asked.
    `;
    return geminiNativeService.editImage(base64Image, fullPrompt);
};