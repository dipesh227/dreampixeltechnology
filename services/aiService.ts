import { Type } from "@google/genai";
import { CreatorStyle, UploadedFile, AspectRatio, GeneratedConcept, PoliticalParty, PosterStyle, AdStyle, ProfilePictureStyle, LogoStyle, HeadshotStyle, PassportPhotoStyle, VisitingCardStyle, EventPosterStyle, SocialCampaign, NewspaperStyle, StructuredPrompt, NewspaperLanguage } from '../types';
import * as geminiNativeService from './geminiNativeService';

const STRUCTURED_PROMPT_SCHEMA_PROPERTIES = {
    composition: { type: Type.STRING, description: "Detailed description of the scene's composition, framing, and camera angle." },
    lighting: { type: Type.STRING, description: "Description of the lighting style (e.g., dramatic, soft, neon)." },
    color_palette: { type: Type.STRING, description: "Description of the color grading and dominant colors." },
    subject_details: { type: Type.STRING, description: "Details about the subject's pose, expression, and clothing." },
    extra_details: { type: Type.STRING, description: "Any other stylistic elements like textures, lens effects, or background details." },
};

const CONCEPTS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        concepts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    structured_prompt: {
                        type: Type.OBJECT,
                        properties: STRUCTURED_PROMPT_SCHEMA_PROPERTIES,
                        required: ["composition", "lighting", "color_palette", "subject_details", "extra_details"]
                    },
                    reason: { type: Type.STRING, description: "Explanation of why this concept is effective." },
                    isRecommended: { type: Type.BOOLEAN, description: "Set to true for the single best concept." }
                },
                required: ["structured_prompt", "reason", "isRecommended"]
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
                     structured_prompt: {
                        type: Type.OBJECT,
                        properties: STRUCTURED_PROMPT_SCHEMA_PROPERTIES,
                        required: ["composition", "lighting", "color_palette", "subject_details", "extra_details"]
                    },
                    caption: { type: Type.STRING, description: "The written text content for the social media post caption." },
                    reason: { type: Type.STRING, description: "Explanation of why this concept is effective." },
                    isRecommended: { type: Type.BOOLEAN, description: "Set to true for the single best concept." }
                },
                required: ["structured_prompt", "caption", "reason", "isRecommended"]
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

interface ConceptsResponse {
    concepts: {
        structured_prompt: StructuredPrompt;
        caption?: string;
        reason: string;
        isRecommended: boolean;
    }[];
}

const parseAndValidateConcepts = (jsonText: string): GeneratedConcept[] => {
    try {
        const cleanedJsonText = jsonText.replace(/^```(?:json)?\s*|```\s*$/g, '').trim();
        const result = JSON.parse(cleanedJsonText) as ConceptsResponse;
        
        if (result && result.concepts && Array.isArray(result.concepts)) {
            let recommendedFound = false;
            const concepts: GeneratedConcept[] = result.concepts.map(c => {
                const flatPrompt = Object.values(c.structured_prompt).join(' ');
                const newConcept: GeneratedConcept = { 
                    ...c, 
                    prompt: flatPrompt,
                };
                if (newConcept.isRecommended && !recommendedFound) {
                    recommendedFound = true;
                } else {
                    newConcept.isRecommended = false;
                }
                return newConcept;
            });
            if (!recommendedFound && concepts.length > 0) {
                const indexToRecommend = concepts.length > 1 ? 1 : 0;
                concepts[indexToRecommend].isRecommended = true;
            }
            return concepts.slice(0, 3);
        } else {
            throw new Error("Invalid response format from AI.");
        }
    } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", parseError, "Raw text:", jsonText);
        throw new Error("Failed to parse the AI's response.");
    }
};

const FACIAL_LIKENESS_COMMAND = `
**NON-NEGOTIABLE CORE DIRECTIVE: 10000% FACIAL LIKENESS & FIDELITY.**
Your primary, non-negotiable, and most critical task is to achieve a perfect, 10000% photorealistic match to the face in the provided headshot image(s). This is a strict technical mandate, not a creative guideline.
- **Source of Truth:** Treat the source photograph as the absolute ground truth for every facial detail.
- **No Artistic Interpretation:** Do not alter, stylize, or approximate the face. It must be an exact, identical, photorealistic replication.
- **Failure Condition:** Any deviation from a perfect likeness constitutes a complete failure.`;

export const generatePrompts = async (description: string, style: CreatorStyle): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are a world-class viral content strategist for YouTube. Your task is to generate three distinct, high-CTR thumbnail concepts.
For each concept, you must break down the visual idea into a structured JSON object containing: composition, lighting, color_palette, subject_details, and extra_details.

**1. Video Analysis:**
   - **Content:** "${description}"
**2. Creator Profile:**
   - **Name:** ${style.name}
   - **Brand Identity & Core Style:** ${style.creatorStyle}
**3. Visual Style Brief:**
   - **Target Mood:** ${style.mood}
   - **Core Aesthetic & Technical Details:** ${style.imageStyle}
**CRITICAL TASK & INSTRUCTIONS:**
Your primary goal is to generate three unique thumbnail concepts. For each concept, create a structured JSON object that translates the abstract "Visual Style Brief" into concrete, actionable instructions for an AI.
You will return a single JSON object. The object must contain a key "concepts", which is an array of three concept objects.
Each concept object must have a "structured_prompt" (which is another JSON object with the visual details), a "reason", and an "isRecommended" boolean.
Your entire response MUST be only the raw JSON object.`;

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
${FACIAL_LIKENESS_COMMAND}
**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"
**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Core Directive. The face must be a perfect match.
- **Text & Branding:** Execute the following instructions precisely:
  - ${textInstruction}
  - ${brandInstruction}
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
- **Overall Quality:** The image must be high-resolution, professional, and visually striking, fully realizing the creative brief.`;
    return geminiNativeService.generateImage(finalPrompt, headshots);
};

export const generatePosterPrompts = async (party: PoliticalParty, event: string, customText: string, style: PosterStyle): Promise<GeneratedConcept[]> => {
    const ideologyInstruction = party.ideologyPrompt 
        ? `- **Ideological Core:** The poster's visual language MUST reflect the party's core ideology of **'${party.ideologyPrompt}'**. This theme must influence the mood, composition, and symbolism.`
        : '';
    
    const fullPrompt = `
You are a world-class creative director for political campaigns. Your task is to generate three distinct, professional, and high-impact political poster concepts. For each concept, break down the visual idea into a structured JSON object.

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
Your main goal is to generate three unique poster concepts. For each, create a structured JSON object with keys: composition, lighting, color_palette, subject_details, and extra_details.
You will return a single JSON object containing a key "concepts", which is an array of three concept objects.
Each concept object must have a "structured_prompt", a "reason", and an "isRecommended" boolean.
Your entire response MUST be only the raw JSON object.`;

    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generatePoster = async (selectedPrompt: string, headshots: UploadedFile[], aspectRatio: AspectRatio, party: PoliticalParty | undefined): Promise<string | null> => {
    const finalPrompt = `
${FACIAL_LIKENESS_COMMAND}
**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"
**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Core Directive. The face must be a perfect match.
- **Branding Integrity:** The prompt contains specific branding instructions (party name, logo, colors). You MUST execute these with 10000% accuracy. The logo and colors are non-negotiable.
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
- **Overall Quality:** The image must be high-resolution, professional-grade, and suitable for a political campaign, fully realizing the creative brief.`;
    return geminiNativeService.generateImage(finalPrompt, headshots);
};

export const generateAdConcepts = async (productDescription: string, headline: string, style: AdStyle): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are an award-winning Creative Director. Your task is to generate three professional ad banner concepts. For each concept, break down the visual idea into a structured JSON object.

**1. Campaign Brief:**
   - **Product/Service:** ${productDescription}
   - **Headline:** "${headline}"
   - **Target Ad Style:** '${style.name}' (${style.stylePrompt})
   - **Mandatory Elements:** The ad must feature a person (from a headshot) and the product (from a product image).
**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique ad concepts. For each, create a structured JSON object with keys: composition, lighting, color_palette, subject_details, and extra_details.
The subject_details must describe how the person interacts with the product and their exact pose and emotion.
You will return a single JSON object containing a "concepts" key, which is an array of three concept objects.
Each concept object must have a "structured_prompt", a "reason", and an "isRecommended" boolean.
Your entire response MUST be only the raw JSON object.`;
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
- You must treat the product image as a fixed, unchangeable asset to be placed within the scene you generate.
- The final product in the ad MUST be 1000% identical to the source image. Any change is a failure.
${FACIAL_LIKENESS_COMMAND}
**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"
**FINAL EXECUTION CHECKLIST:**
- **Product Fidelity:** Adhere to the Product Directive. The PRODUCT (Image 1) must be perfectly composited, not redrawn. 1000% match.
- **Facial Likeness:** Adhere to the Headshot Directive. The face must be a perfect match to the MODEL HEADSHOT (Image 2). 1000% match.
- **Headline & Branding:** The headline "${headline}" and brand details "${brandDetails}" must be masterfully incorporated into the design. They must be legible, stylishly typeset, and placed for maximum impact with 10000% accuracy.
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
- **Overall Quality:** The image must be high-resolution, professional-grade ad creative that fully realizes the brief.`;
    return geminiNativeService.generateImage(finalPrompt, allImages);
};

export const generateSocialPostConcepts = async (topic: string, platform: string, tone: string, style: AdStyle, callToAction?: string): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are an expert social media content strategist. Your task is to generate three complete, distinct, and engaging social media post concepts (visual + caption) based on the user's brief. For each concept, break down the visual idea into a structured JSON object.

**1. Post Brief:**
   - **Core Topic:** "${topic}"
   - **Target Platform:** ${platform}
   - **Desired Tone:** ${tone}
   - **Visual Style:** '${style.name}' (${style.stylePrompt})
   - **Call to Action (Optional):** "${callToAction || 'None specified'}"
**CRITICAL TASK & INSTRUCTIONS:**
For each concept, develop a complete package: a visual idea (as a structured prompt) and an engaging caption.
**Visual Idea ("structured_prompt"):**
- Translate the 'Visual Style' into a detailed art direction as a structured JSON object (composition, lighting, etc.).
**Caption ("caption"):**
- Write a compelling, platform-aware caption that embodies the '${tone}' tone.
- Seamlessly integrate the 'Core Topic' and 'Call to Action'.
- Include 3-5 relevant and popular hashtags for the '${platform}' platform.
You will return a single JSON object with a key "concepts", an array of three concept objects.
Each object must have "structured_prompt", "caption", "reason", and "isRecommended".
Your entire response MUST be only the raw JSON object.`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, SOCIAL_CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateSocialPost = async (selectedPrompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
    const finalPrompt = `
**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"
**TECHNICAL MANDATES:**
- The final image must be high-resolution, visually stunning, and follow the creative brief precisely.
- The aspect ratio MUST be exactly ${aspectRatio}.`;
    
    return geminiNativeService.generateImageFromText(finalPrompt, aspectRatio);
};

export const generateSocialPostWithHeadshot = async (prompt: string, headshot: UploadedFile, aspectRatio: AspectRatio): Promise<string | null> => {
    const finalPrompt = `
${FACIAL_LIKENESS_COMMAND}
**CREATIVE BRIEF TO EXECUTE:**
"${prompt}"
**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Core Directive. The face must be a perfect match.
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
- **Overall Quality:** The image must be high-resolution, professional, and visually striking, fully realizing the creative brief.`;
    return geminiNativeService.generateImage(finalPrompt, [headshot]);
};

export const generateSocialVideo = async (prompt: string): Promise<string | null> => {
    const downloadLink = await geminiNativeService.generateVideo(prompt);
    if (!downloadLink) return null;
    const videoBlob = await geminiNativeService.fetchVideoData(downloadLink);
    if (!videoBlob) return null;
    return URL.createObjectURL(videoBlob);
};

interface TrendsResponse { topics: string[]; }

export const getTrendingTopics = async (baseKeyword: string): Promise<string[]> => {
    const prompt = `
You are a Google Trends and social media expert. Your task is to identify the top 3 most relevant, specific, and currently trending topics related to a base keyword.

**Base Keyword:** "${baseKeyword}"

**Instructions:**
1.  Analyze recent search data, news headlines, and social media conversations related to the base keyword.
2.  Identify three distinct, highly specific sub-topics that are currently experiencing a surge in interest.
3.  Do NOT return broad or generic topics. Find niche, actionable trends. For example, if the keyword is "AI", good topics are "The release of the new Llama 3 model" or "AI's impact on the film industry", not "Artificial Intelligence".
4.  Return the topics as a JSON object containing a key "topics" which is an array of 3 strings.
5.  Your entire response must be ONLY the raw JSON object.`;

    const jsonText = await geminiNativeService.generateText(prompt, TRENDS_SCHEMA);
    try {
        const cleanedJsonText = jsonText.replace(/^```(?:json)?\s*|```\s*$/g, '').trim();
        const result = JSON.parse(cleanedJsonText) as TrendsResponse;
        if (result && result.topics && Array.isArray(result.topics)) {
            return result.topics.slice(0, 3);
        }
    } catch (e) {
        console.error("Failed to parse trending topics response:", e, "Raw text:", jsonText);
    }
    return [];
};

export const generateTrendPostConcepts = async (trend: string, platform: string, style: AdStyle): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are a viral content strategist. Your task is to generate three creative social media post concepts that connect a trending topic to a visual style.

**1. Content Brief:**
   - **Trending Topic:** "${trend}"
   - **Target Platform:** ${platform}
   - **Visual Style:** '${style.name}' (${style.stylePrompt})

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique concepts. Each concept needs a visual idea (as a structured prompt) and a caption.
- **Visual Idea:** A detailed art direction for an AI image generator.
- **Caption:** An engaging, platform-aware caption that cleverly links the '${trend}' to the visual. Must include relevant hashtags.
You will return a single JSON object with a "concepts" key, containing an array of three concept objects.
Each object must have "structured_prompt", "caption", "reason", and "isRecommended".
Your entire response MUST be only the raw JSON object.`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, SOCIAL_CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateSocialMediaCampaign = async (topic: string, keywords: string, link: string, headshot: UploadedFile | null, sampleImage: UploadedFile | null, postLink: string, creatorName?: string): Promise<SocialCampaign> => {
    const prompt = `
You are a master social media campaign manager. Create a comprehensive, multi-platform campaign based on the following brief.

**Campaign Brief:**
- **Core Topic:** ${topic}
- **Keywords:** ${keywords}
- **Primary Link/CTA:** ${link}
- **Creator/Brand Name:** ${creatorName || 'The Brand'}
- **Post to Emulate (Style/Tone):** ${postLink}

**Instructions:**
Generate a JSON object with keys for each platform: LinkedIn, Instagram, Facebook, 'X-Twitter', TikTok, Threads, YouTube_Shorts.
For each platform, create a tailored post concept including:
- A full text post/caption.
- 3-5 relevant, trending hashtags.
- A detailed, creative prompt for an AI to generate a matching image (image_suggestion).
- For TikTok/Shorts, a creative video concept (video_suggestion) and a short script (video_script).
The entire response MUST be only the raw JSON object.
`;
    const images = [headshot, sampleImage].filter((img): img is UploadedFile => !!img);
    const jsonText = await geminiNativeService.generateTextFromMultimodal(prompt, images, SOCIAL_CAMPAIGN_SCHEMA);
    const cleanedJsonText = jsonText.replace(/^```(?:json)?\s*|```\s*$/g, '').trim();
    return JSON.parse(cleanedJsonText);
};

export const generateProfilePicturePrompts = async (description: string, style: ProfilePictureStyle): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are a professional portrait photographer and digital artist. Generate three distinct concepts for a profile picture.

**Client Brief:**
- **Purpose:** "${description}"
- **Desired Style:** '${style.name}' (${style.stylePrompt})

**Instructions:**
Generate three unique concepts. For each, create a structured JSON object with keys: composition, lighting, color_palette, subject_details, and extra_details.
The subject_details must describe the person's expression and attire.
Return a single JSON object with a "concepts" key, containing an array of three concept objects.
Each object must have "structured_prompt", "reason", and "isRecommended".
Your entire response MUST be only the raw JSON object.`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateProfilePicture = async (prompt: string, headshot: UploadedFile, aspectRatio: AspectRatio): Promise<string | null> => {
    const finalPrompt = `
${FACIAL_LIKENESS_COMMAND}
**CREATIVE BRIEF TO EXECUTE:**
"${prompt}"
**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Core Directive. The face must be a perfect match.
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}. It MUST be a square 1:1 image.
- **Overall Quality:** High-resolution, professional portrait quality.`;
    return geminiNativeService.generateImage(finalPrompt, [headshot]);
};

export const generateLogoPrompts = async (companyName: string, description: string, style: LogoStyle, slogan?: string, useMascot?: boolean): Promise<GeneratedConcept[]> => {
    const mascotInstruction = useMascot ? "The logo MUST incorporate a stylized character mascot based on the provided headshot. The mascot should be the central element." : "The logo should be an abstract mark or a wordmark. DO NOT create a character mascot.";
    const fullPrompt = `
You are an expert brand identity designer. Generate three unique logo concepts.

**Brand Brief:**
- **Company Name:** ${companyName}
- **Slogan:** ${slogan || 'None'}
- **Company Description:** "${description}"
- **Desired Style:** '${style.name}' (${style.stylePrompt})
- **Mascot Requirement:** ${mascotInstruction}

**Instructions:**
Generate three unique concepts. For each, create a structured JSON object with keys: composition, lighting, color_palette, subject_details (describe the mascot if applicable, otherwise 'N/A'), and extra_details.
The details should describe a vector logo on a solid background.
Return a single JSON object with a "concepts" key, containing an array of three concept objects.
Each object must have "structured_prompt", "reason", and "isRecommended".
Your entire response MUST be only the raw JSON object.`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateLogo = async (prompt: string, headshot: UploadedFile | null, aspectRatio: AspectRatio): Promise<string | null> => {
    const mascotCommand = headshot ? FACIAL_LIKENESS_COMMAND : "This is an abstract logo. DO NOT generate a person or face.";
    const finalPrompt = `
${mascotCommand}
**CREATIVE BRIEF TO EXECUTE:**
"Create a vector logo on a solid white background based on this brief: ${prompt}"
**FINAL EXECUTION CHECKLIST:**
- **Mascot Likeness:** If a mascot is required, adhere to the Core Directive. The face must match.
- **Format:** The output MUST be a clean, flat, vector-style logo.
- **Background:** The logo MUST be on a solid, clean background (preferably white).
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.`;
    return geminiNativeService.generateImage(finalPrompt, headshot ? [headshot] : []);
};

export const enhanceImage = async (image: UploadedFile): Promise<string | null> => {
    const prompt = `
You are a world-class photo remastering expert AI. Your task is to take the provided image and perform a 10x enhancement.
**NON-NEGOTIABLE INSTRUCTIONS:**
- **Upscale:** Increase the resolution and clarity dramatically.
- **Denoise:** Remove all noise and grain while preserving texture.
- **Relight:** Analyze the scene and apply professional, flattering studio lighting. Fix shadows and highlights.
- **Color Correct:** Enhance colors to be vibrant but natural.
- **Sharpen:** Add crispness and fine detail.
- **No Alterations:** Do NOT change the subject of the photo. Only enhance its quality.
The final output must be just the enhanced image.
`;
    return geminiNativeService.generateImage(prompt, [image]);
};

export const generateHeadshotPrompts = async (description: string, style: HeadshotStyle, photoCount: number): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are a professional headshot photographer. Generate three distinct concepts for a professional headshot session.

**Client Brief:**
- **Purpose:** "${description}"
- **Desired Style:** '${style.name}' (${style.stylePrompt})
- **Photo Count:** The client has provided ${photoCount} source photos. The AI should synthesize these for the best likeness.

**Instructions:**
Generate three unique concepts. For each, create a structured JSON object. The details should describe the overall look for a set of headshots.
Return a single JSON object with a "concepts" key.
Each object must have "structured_prompt", "reason", and "isRecommended".
Your entire response MUST be only the raw JSON object.`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

interface HeadshotResponse {
    headshots: { angle: string; image: string; }[];
}

export const generateHeadshot = async (prompt: string, images: UploadedFile[]): Promise<{ angle: string; image: string; }[]> => {
    const angles = ["Front", "3/4 Left", "3/4 Right", "Slightly Above", "Slightly Below"];
    const results: { angle: string; image: string; }[] = [];

    const promises = angles.map(async (angle) => {
        const anglePrompt = `
${FACIAL_LIKENESS_COMMAND}
**CREATIVE BRIEF TO EXECUTE:**
"${prompt}"
**MANDATORY ANGLE:** The subject's pose MUST be: **${angle} view**.
**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Core Directive. The face must be a perfect match to ALL provided photos.
- **Aspect Ratio:** The image MUST be a 1:1 square.
- **Quality:** Professional studio headshot quality.`;
        try {
            const imageResult = await geminiNativeService.generateImage(anglePrompt, images);
            if (imageResult) {
                results.push({ angle, image: imageResult });
            }
        } catch (error) {
            console.warn(`Failed to generate headshot for angle ${angle}:`, error);
        }
    });

    await Promise.all(promises);
    return results;
};

export const generatePassportPhoto = async (image: UploadedFile, outfit: string, backgroundColor: string): Promise<string | null> => {
    const prompt = `
${FACIAL_LIKENESS_COMMAND}
**TASK: Create a professional passport photo.**
1.  **Subject:** The subject is ${outfit}.
2.  **Background:** The background MUST be a solid, even, ${backgroundColor} color. No shadows or textures.
3.  **Pose:** The subject MUST be facing directly forward, with a neutral expression, mouth closed, and eyes open. Head must be centered.
4.  **Lighting:** The lighting MUST be flat, even, and shadowless, as if from a ring light.
5.  **Composition:** This is a tight head-and-shoulders crop.
**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Perfect match is critical.
- **Background:** Solid ${backgroundColor}.
- **Pose:** Neutral, forward-facing.
- **Output:** Generate only the final image.`;
    return geminiNativeService.generateImage(prompt, [image]);
};

export const generateVisitingCardPrompts = async (companyName: string, personName: string, title: string, contactInfo: string, style: VisitingCardStyle, hasLogo: boolean): Promise<GeneratedConcept[]> => {
    const logoInstruction = hasLogo ? "The design MUST incorporate the provided company logo." : "The design should use the company name as a wordmark; no logo image is provided.";
    const fullPrompt = `
You are an expert graphic designer specializing in print design. Generate three unique business card concepts.

**Card Details:**
- **Company Name:** ${companyName}
- **Person's Name:** ${personName}
- **Title:** ${title}
- **Contact Info:** ${contactInfo}
- **Desired Style:** '${style.name}' (${style.stylePrompt})
- **Logo:** ${logoInstruction}

**Instructions:**
Generate three unique concepts. For each, create a structured JSON object describing the layout, typography, and visual elements.
Return a single JSON object with a "concepts" key.
Each concept must have "structured_prompt", "reason", and "isRecommended".
Your entire response MUST be only the raw JSON object.`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateVisitingCard = async (prompt: string, logo: UploadedFile | null, aspectRatio: AspectRatio): Promise<string | null> => {
    const logoCommand = logo ? "You MUST perfectly integrate the provided logo image into the design." : "You must create a stylish text-based wordmark for the company name.";
    const finalPrompt = `
**TASK: Design a professional business card.**
**CREATIVE BRIEF TO EXECUTE:**
"${prompt}"
**TECHNICAL MANDATES:**
- ${logoCommand}
- All text on the card must be perfectly legible and accurately spelled as per the brief.
- The aspect ratio MUST be exactly ${aspectRatio}.
`;
    return geminiNativeService.generateImage(finalPrompt, logo ? [logo] : []);
};

export const editEventPoster = async (image: UploadedFile, headline: string, branding: string, style: EventPosterStyle, eventDetails: {date: string, time: string, venue: string}, aspectRatio: AspectRatio): Promise<string | null> => {
    const prompt = `
You are an expert event promotion designer. Your task is to turn the provided photo into a stunning event poster.
**CREATIVE BRIEF:**
- **Headline Text:** "${headline}"
- **Branding/Sponsor Text:** "${branding}"
- **Event Date:** "${eventDetails.date}"
- **Event Time:** "${eventDetails.time}"
- **Event Venue:** "${eventDetails.venue}"
- **Text Style:** Apply a '${style.name}' text style. The style prompt is: "${style.stylePrompt}".
**INSTRUCTIONS:**
1.  Enhance the quality of the base image (lighting, colors).
2.  Intelligently and stylishly overlay the HEADLINE, BRANDING, and all EVENT DETAILS onto the image.
3.  The text must be highly legible and aesthetically pleasing, matching the requested style.
4. The final image aspect ratio MUST be ${aspectRatio}.
5. Generate ONLY the final poster image.`;
    return geminiNativeService.generateImage(prompt, [image]);
};

export const generateNewspaperCutting = async (
    image: UploadedFile, 
    headline: string, 
    bodyText: string,
    language: string, 
    style: NewspaperStyle,
    aspectRatio: AspectRatio
): Promise<string | null> => {
    const prompt = `
**TASK: Create a realistic newspaper clipping.**
**NON-NEGOTIABLE CORE DIRECTIVE: NO BACKGROUND.**
Your primary, non-negotiable task is to generate ONLY the newspaper clipping itself. The clipping must fill the entire frame of the selected aspect ratio. Do NOT place the clipping on a table, desk, or any other background surface. The output must be just the paper object.

**CONTENT DETAILS:**
- **Language:** All text MUST be written in **${language}**.
- **Headline:** "${headline}"
- **Body Text:** "${bodyText}"
- **Photo:** The provided image must be integrated as the article's main photo.
- **Style:** Apply the '${style.name}' style. The visual prompt is: "${style.stylePrompt}". The AI must invent a plausible newspaper name and date that fits this style and language.

**FINAL EXECUTION CHECKLIST:**
1.  **No Background:** The newspaper clipping fills the entire image canvas.
2.  **Content Accuracy:** All text is in ${language} and matches the provided content.
3.  **Image Integration:** The user's photo is realistically placed in the article.
4.  **Style Adherence:** The final image perfectly matches the chosen style's description.
5.  **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
`;
    return geminiNativeService.generateImage(prompt, [image]);
};

// FIX: Added missing export for editImage function.
export const editImage = async (base64Image: string, prompt: string): Promise<string | null> => {
    return geminiNativeService.editImage(base64Image, prompt);
};
