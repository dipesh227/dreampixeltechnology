import { Type } from "@google/genai";
import { CreatorStyle, UploadedFile, AspectRatio, GeneratedConcept, PoliticalParty, PosterStyle, AdStyle, ValidationStatus, ProfilePictureStyle, LogoStyle, HeadshotStyle, PassportPhotoStyle, VisitingCardStyle, EventPosterStyle, SocialCampaign, NewspaperStyle, StructuredPrompt } from '../types';
import * as apiConfigService from './apiConfigService';
import * as geminiNativeService from './geminiNativeService';
import { RateLimitError } from "./errors";

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

// Explicit type for the AI's JSON response to ensure type safety.
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
You are a world-class viral content strategist for YouTube. Your task is to generate three distinct, high-CTR thumbnail concepts based on the provided brief.

**1. Video Analysis:**
   - **Content:** "${description}"

**2. Creator Profile:**
   - **Name:** ${style.name}
   - **Brand Identity & Core Style:** ${style.creatorStyle}

**3. Visual Style Brief:**
   - **Target Mood:** ${style.mood}
   - **Core Aesthetic & Technical Details:** ${style.imageStyle}

**4. Creative Exploration Mandate:**
To ensure diversity, each of the three concepts MUST explore a different strategic angle:
- **Concept 1 (The Human Angle):** Focus on a powerful, exaggerated human emotion (e.g., shock, excitement, curiosity). The subject's expression should be the primary focal point.
- **Concept 2 (The Object/Spectacle Angle):** Focus on the core subject or spectacle of the video. Make it look larger-than-life, incredibly detailed, or visually stunning.
- **Concept 3 (The Conceptual Angle):** Represent the video's topic metaphorically or abstractly. Use intriguing symbolism or a "what if" scenario to create curiosity.

**CRITICAL TASK & INSTRUCTIONS:**
Your primary goal is to generate three unique thumbnail concepts, each following one of the Creative Exploration Mandates above. For each concept, create a structured JSON object that translates the abstract "Visual Style Brief" into concrete, actionable instructions for an AI.
You will return a single JSON object. The object must contain a key "concepts", which is an array of three concept objects.
Each concept object must have a "structured_prompt" (which is another JSON object with the visual details), a "reason", and an "isRecommended" boolean.
Your entire response MUST be only the raw JSON object.
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
${FACIAL_LIKENESS_COMMAND}

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
You are a world-class creative director for political campaigns. Your task is to generate three distinct, professional, and high-impact political poster concepts based on the brief.

**1. Campaign Brief:**
   - **Party:** ${party.name}
   - **Occasion/Theme:** '${event}'
   - **Key Slogan/Text:** "${customText}"
   - **Target Style:** '${style.name}' (${style.stylePrompt})

**2. Brand Mandates (Non-Negotiable):**
   - **Logo Elements:** The design must prominently feature the party's logo, described as: **${party.logoPrompt}**.
   - **Color Scheme:** The official party colors, **${party.colorScheme}**, must be central to the design.
   ${ideologyInstruction}

**3. Creative Exploration Mandate:**
To provide a range of strategic options, each concept MUST explore a different angle:
- **Concept 1 (Leader-Centric):** A powerful, charismatic portrait of the politician. The focus is on their strength, trustworthiness, and vision.
- **Concept 2 (People-Centric):** Show the politician interacting with or representing the people. The mood should be one of unity, hope, and grassroots connection.
- **Concept 3 (Issue-Centric):** Focus on the core message or promise of the campaign (e.g., development, change, security). Use powerful symbolism and imagery related to the theme.

**CRITICAL TASK & INSTRUCTIONS:**
Your main goal is to generate three unique poster concepts, one for each Creative Exploration Mandate. For each, create a structured JSON object with keys: composition, lighting, color_palette, subject_details, and extra_details.
You will return a single JSON object containing a key "concepts", which is an array of three concept objects.
Each concept object must have a "structured_prompt", a "reason", and an "isRecommended" boolean.
Your entire response MUST be only the raw JSON object.
`;

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
- **Overall Quality:** The image must be high-resolution, professional-grade, and suitable for a political campaign, fully realizing the creative brief.
`;
    return geminiNativeService.generateImage(finalPrompt, headshots);
};

export const generateAdConcepts = async (productDescription: string, headline: string, style: AdStyle): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are an award-winning Creative Director. Your task is to generate three professional ad banner concepts based on the brief.

**1. Campaign Brief:**
   - **Product/Service:** ${productDescription}
   - **Headline:** "${headline}"
   - **Target Ad Style:** '${style.name}' (${style.stylePrompt})
   - **Mandatory Elements:** The ad must feature a person (from a headshot) and the product (from a product image).

**2. Creative Exploration Mandate:**
To ensure a diverse range of options, each of the three concepts MUST explore a different advertising strategy:
- **Concept 1 (Benefit-Oriented):** Focus on the emotional benefit for the user. Show the model experiencing the positive outcome of using the product. The mood should be aspirational.
- **Concept 2 (Product-as-Hero):** Make the product the undeniable hero. The composition should glorify the product's design and features. The model should be secondary, presenting or admiring the product.
- **Concept 3 (Bold & Graphic):** A high-impact, attention-grabbing concept. This can be more abstract, using bold typography, colors, and a dynamic composition that breaks the mold.

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique ad concepts, each following one of the Creative Exploration Mandates above. For each, create a structured JSON object with keys: composition, lighting, color_palette, subject_details, and extra_details.
The subject_details must describe how the person interacts with the product and their exact pose and emotion.
You will return a single JSON object containing a "concepts" key, which is an array of three concept objects.
Each concept object must have a "structured_prompt", a "reason", and an "isRecommended" boolean.
Your entire response MUST be only the raw JSON object.
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
- **Overall Quality:** The image must be high-resolution, professional-grade ad creative that fully realizes the brief.
`;
    return geminiNativeService.generateImage(finalPrompt, allImages);
};

export const generateSocialPostConcepts = async (topic: string, platform: string, tone: string, style: AdStyle, callToAction?: string): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are an expert social media content strategist. Your task is to generate three complete, distinct, and engaging social media post concepts (visual + caption) based on the user's brief.

**1. Post Brief:**
   - **Core Topic:** "${topic}"
   - **Target Platform:** ${platform}
   - **Desired Tone:** ${tone}
   - **Visual Style:** '${style.name}' (${style.stylePrompt})
   - **Call to Action (Optional):** "${callToAction || 'None specified'}"

**2. Creative Exploration Mandate:**
Each concept MUST explore a different engagement strategy suitable for the target platform:
- **Concept 1 (The Value Post):** Provide direct value. This could be an educational tip, a surprising fact, or an insightful take on the topic. The visual should be clean and informative.
- **Concept 2 (The Story/Emotional Post):** Tell a relatable story or evoke a specific emotion. The visual should be cinematic or authentic, aiming to connect with the audience on a personal level.
- **Concept 3 (The Engagement Post):** Directly ask a question or present a bold, slightly controversial statement to spark conversation. The visual should be attention-grabbing and provocative.

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
Your entire response MUST be only the raw JSON object.
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
    return geminiNativeService.generateImage(finalPrompt, [headshot]);
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
    return URL.createObjectURL(videoBlob);
};

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

export const generateTrendPostConcepts = async (topic: string, platform: string, style: AdStyle): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are a viral content specialist and an expert in capitalizing on trends. Your task is to generate three complete, distinct, and engaging social media post concepts (visual + caption) based on a trending topic.

**1. Post Brief:**
   - **Trending Topic:** "${topic}"
   - **Target Platform:** ${platform}
   - **Visual Style:** '${style.name}' (${style.stylePrompt})

**2. Creative Exploration Mandate:**
Each concept MUST take a different angle on the trend to maximize reach and engagement:
- **Concept 1 (The Hot Take):** Present a bold, slightly controversial, or unique opinion on the trend to spark conversation and debate. The visual should be provocative and attention-grabbing.
- **Concept 2 (The Explainer/Deep Dive):** Break down the trend for a wider audience. Explain what it is, why it's trending, and what its impact is. The visual should be informative and clear, perhaps using infographic elements.
- **Concept 3 (The Humorous/Meme Angle):** Create a funny, relatable meme or a humorous observation about the trend. The visual should be simple, shareable, and feel native to the platform.

**CRITICAL TASK & INSTRUCTIONS:**
For each concept, develop a complete package: a visual idea (as a structured prompt) and an engaging caption.

**Visual Idea ("structured_prompt"):**
- Translate the 'Visual Style' into a detailed art direction as a structured JSON object (composition, lighting, etc.).

**Caption ("caption"):**
- Write a compelling, platform-aware caption that embodies the angle of the concept.
- Seamlessly integrate the 'Trending Topic'.
- Include 3-5 highly relevant and trending hashtags for the '${platform}' platform.

You will return a single JSON object with a key "concepts", an array of three concept objects.
Each object must have "structured_prompt", "caption", "reason", and "isRecommended".
Your entire response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, SOCIAL_CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

const parseAndValidateCampaign = (jsonText: string): SocialCampaign => {
    try {
        const cleanedJsonText = jsonText.replace(/^```(?:json)?\s*|```\s*$/g, '').trim();
        const result = JSON.parse(cleanedJsonText);
        
        if (result && typeof result === 'object' && result.Instagram && result.LinkedIn) {
            return result as SocialCampaign;
        } else {
            console.error("Parsed JSON, but campaign format is invalid:", result);
            throw new Error("Invalid campaign response format from AI.");
        }
    } catch (parseError) {
        console.error("Failed to parse AI response as JSON for campaign:", parseError);
        console.error("Raw text received from AI:", jsonText);
        throw new Error("Failed to parse the AI's campaign response.");
    }
};

export const generateSocialMediaCampaign = async (topic: string, keywords: string, link: string, headshot: UploadedFile | null, sampleImage: UploadedFile | null, postLink: string, creatorName?: string): Promise<SocialCampaign> => {
    const headshotInstruction = headshot ? `
- **Headshot Provided (MAIN SUBJECT):** A headshot image has been provided. THIS IS THE MAIN SUBJECT. All generated 'image_suggestion' prompts MUST include the following verbatim command to ensure facial likeness of this person:
  "${FACIAL_LIKENESS_COMMAND}"
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

export const generateProfilePicturePrompts = async (description: string, style: ProfilePictureStyle): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are a master portrait photographer and digital artist. Your task is to generate three distinct concepts for a professional or creative profile picture based on the brief.

**1. User Request:**
   - **Description:** "${description}"
   - **Target Style:** '${style.name}' (${style.stylePrompt})

**2. Creative Exploration Mandate:**
Each concept MUST explore a different photographic approach:
- **Concept 1 (Classic & Professional):** Focus on perfect, clean studio lighting (e.g., three-point or Rembrandt). The background should be simple and non-distracting. The expression should be confident and approachable.
- **Concept 2 (Candid & Environmental):** Place the subject in a natural environment that reflects their profession or personality (e.g., an office, a park, a creative studio). The lighting should be soft and natural (e.g., window light).
- **Concept 3 (Bold & Artistic):** A high-impact, creative concept. Use dramatic lighting, a unique background, or a bold color scheme to make a strong statement.

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique concepts, one for each Creative Exploration Mandate. For each, create a detailed structured prompt object for an AI image generator.
You will return a single JSON object with a key "concepts", which is an array of three concept objects.
Each object must have "structured_prompt", "reason", and "isRecommended" keys.
Your entire response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateProfilePicture = async (selectedPrompt: string, headshot: UploadedFile, aspectRatio: AspectRatio): Promise<string | null> => {
    const finalPrompt = `
${FACIAL_LIKENESS_COMMAND}

**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Core Directive. The face must be a perfect match.
- **Aspect Ratio:** The final image MUST be a ${aspectRatio}. For profile pictures, this is typically '1:1'.
- **Overall Quality:** The image must be a high-resolution, professional-grade profile picture.
`;
    return geminiNativeService.generateImage(finalPrompt, [headshot]);
};

export const generateLogoPrompts = async (companyName: string, description: string, style: LogoStyle, slogan?: string, hasMascot?: boolean): Promise<GeneratedConcept[]> => {
    const mascotInstruction = hasMascot ? `
- **Mascot Integration:** The logo MUST incorporate a character or mascot. The structured prompt must describe how to stylize the mascot to fit the logo.
` : '';

    const fullPrompt = `
You are a world-class brand identity designer. Your task is to generate three distinct, professional logo concepts based on the brief.

**1. Brand Brief:**
   - **Company Name:** "${companyName}"
   - **Slogan (Optional):** "${slogan || 'N/A'}"
   - **Company Description:** "${description}"
   - **Target Style:** '${style.name}' (${style.stylePrompt})
   ${mascotInstruction}

**2. Creative Exploration Mandate:**
Each concept MUST explore a different fundamental logo design approach:
- **Concept 1 (The Abstract Mark):** Create a unique, abstract symbol that represents the brand's core values (e.g., a geometric shape for stability, flowing lines for dynamism).
- **Concept 2 (The Combination Mark):** Combine a simple, recognizable icon (a literal or stylized representation of what the company does) with the company name.
- **Concept 3 (The Wordmark/Lettermark):** A purely typographic logo. The focus is on a custom, beautifully crafted font for the company's full name or initials.

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique logo concepts, one for each Creative Exploration Mandate. For each, create a detailed structured prompt object for an AI. The prompt should result in a vector-style logo on a clean, solid white background.

The structured prompt MUST include:
- **Core Concept:** A clear idea for the logo's iconography and composition.
- **Typography:** Suggestions for font style (e.g., "clean sans-serif font", "elegant serif typeface").
- **Color Palette:** A specific color scheme.
- **Text Integration:** Explicitly state that the logo must include the company name "${companyName}" and, if provided, the slogan "${slogan}".

You will return a single JSON object with a "concepts" key, an array of three objects.
Each object must have "structured_prompt", "reason", and "isRecommended" keys.
Your response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateLogo = async (selectedPrompt: string, headshot: UploadedFile | null, aspectRatio: AspectRatio): Promise<string | null> => {
    const mascotPrompt = headshot ? FACIAL_LIKENESS_COMMAND.replace("face in the provided headshot image(s)", "MASCOT'S FACE using the provided headshot image, but stylize it to fit the logo") : "";
    
    const finalPrompt = `
${mascotPrompt}

**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Design Style:** Execute the creative brief precisely.
- **Background:** The logo MUST be on a solid, clean, WHITE background. This is non-negotiable.
- **Text Accuracy:** Any text (company name, slogan) mentioned in the brief must be rendered with 10000% accuracy. No spelling errors.
- **Mascot Likeness:** If a headshot is provided, you must adhere to the mascot likeness directive.
- **Aspect Ratio:** The final image must be a ${aspectRatio}.
- **Format:** The final output should be a clean, high-resolution graphic, suitable for a logo.
`;
    const images = headshot ? [headshot] : [];
    if (images.length > 0) {
        return geminiNativeService.generateImage(finalPrompt, images);
    } else {
        return geminiNativeService.generateImageFromText(finalPrompt, aspectRatio);
    }
};

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

export const generateHeadshotPrompts = async (description: string, style: HeadshotStyle, imageCount: number): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are an expert corporate and portrait photographer. Generate three distinct concepts for a professional headshot based on the brief. Each concept should provide a strong, unified art direction suitable for a multi-angle set of photos.

**1. User Request:**
   - **Purpose/Description:** "${description}"
   - **Target Style:** '${style.name}' (${style.stylePrompt})
   - **User Assets:** The user has provided ${imageCount} reference photo(s).

**2. Creative Exploration Mandate:**
Each concept MUST provide a distinct art direction for the final set of photos:
- **Concept 1 (The Corporate Standard):** A clean, bright, high-key lighting setup on a simple studio background (e.g., light gray, white, or a softly blurred office). This is the safe, professional choice.
- **Concept 2 (The Moody & Cinematic):** A more dramatic, low-key lighting setup (e.g., Rembrandt, split lighting) on a dark, textured background. This conveys authority and seriousness.
- **Concept 3 (The Outdoor & Natural):** Use the soft, natural light of a golden hour setting. The background is an outdoor scene (e.g., urban street, park) with a very shallow depth of field (bokeh). This feels approachable and authentic.

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique concepts, one for each Creative Exploration Mandate. For each, create a detailed structured prompt object.
You will return a single JSON object with a "concepts" key, an array of three objects.
Each object must have "structured_prompt", "reason", and "isRecommended" keys.
Your response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

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

export const generatePassportPhoto = async (image: UploadedFile, outfit: string, backgroundColor: string): Promise<string | null> => {
    const prompt = `
**CRITICAL TASK: OFFICIAL PASSPORT PHOTO CREATION**
Your task is to convert the provided user photo into an official, compliant passport/visa photo.

${FACIAL_LIKENESS_COMMAND}

**EXECUTION STEPS:**
1.  **Isolate Subject:** Perfectly cut out the person from their original background.
2.  **Replace Background:** Create a new, completely solid, and evenly lit background using the exact hex color: **${backgroundColor}**.
3.  **Change Outfit:** Replace the person's current clothing with **${outfit}**. The new outfit should look natural and be appropriate for an official document.
4.  **Pose & Expression:** Ensure the final image is a front-facing, head-and-shoulders portrait with a neutral expression, eyes open and looking directly at the camera.
5.  **Final Image:** The output must be a clean, high-resolution image with no shadows on the background. Return only the final image.
`;
    return geminiNativeService.generateImage(prompt, [image]);
};

export const editEventPoster = async (
    image: UploadedFile,
    headline: string,
    branding: string,
    style: EventPosterStyle,
    eventDetails: { date: string; time: string; venue: string },
    aspectRatio: AspectRatio
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
7.  **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
8.  **Output:** Return only the final, edited poster image.
`;
    return geminiNativeService.generateImage(prompt, [image]);
};

export const generateNewspaperCutting = async (
    image: UploadedFile,
    headline: string,
    bodyText: string,
    language: string,
    style: NewspaperStyle,
    aspectRatio: AspectRatio,
    newspaperName: string,
    date: string
): Promise<string | null> => {
    const nameAndDateInstruction = newspaperName.trim() && date.trim()
        ? `Use the exact newspaper name "${newspaperName}" and date "${date}".`
        : "Invent a plausible newspaper name and a relevant date in the correct language and style.";

    const languageInstruction = language === 'hindi'
        ? `All text MUST be in Hindi, written using Devanagari script. Ensure the typography is culturally authentic for a real Hindi newspaper.`
        : `All text you generate (like the newspaper name) or render (headline, body) MUST be in the **${language}** language.`;

    const prompt = `
**CRITICAL TASK: CREATE REALISTIC NEWSPAPER CLIPPING**
Your task is to take a user-provided photo and text, and transform them into a highly realistic newspaper clipping.

**LANGUAGE & SCRIPT DIRECTIVE:**
${languageInstruction}

**EXECUTION STEPS:**
1.  **Use Provided Details:** ${nameAndDateInstruction}
2.  **Apply Newspaper Style:** The entire clipping MUST adhere to the following style guide: "${style.stylePrompt}". This includes the paper texture, font choices, and photo treatment.
3.  **Integrate Text:**
    -   Use the main headline: "${headline}". This must be the most prominent text.
    -   Use the following body text for the article, formatted into realistic newspaper columns: "${bodyText}".
4.  **Integrate Photo:** Place the user's photo within the article, transforming its style to match the newspaper theme (e.g., grainy black and white for vintage).
5.  **Final Composition:** The output should be a single image of the newspaper clipping, looking authentically cut or torn.
6.  **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
7.  **Return ONLY the final image.**
`;
    return geminiNativeService.generateImage(prompt, [image]);
};

export const generateVisitingCardPrompts = async (companyName: string, personName: string, title: string, contactInfo: string, style: VisitingCardStyle, hasLogo?: boolean): Promise<GeneratedConcept[]> => {
    const logoInstruction = hasLogo ? "The design MUST incorporate the user's provided company logo." : "The design should have a space for a logo, or create a simple typographic logo for the company name.";

    const fullPrompt = `
You are a professional graphic designer specializing in print design. Generate three distinct concepts for a professional visiting card (business card).

**1. Card Details:**
   - **Company Name:** ${companyName}
   - **Person's Name:** ${personName}
   - **Title/Designation:** ${title}
   - **Contact Info:** ${contactInfo}
   - **Design Style:** '${style.name}' (${style.stylePrompt})
   - **Logo:** ${logoInstruction}

**2. Creative Exploration Mandate:**
Each concept MUST explore a different design philosophy:
- **Concept 1 (Information First):** A clean, minimalist layout that prioritizes legibility and clarity. Uses a simple grid and lots of white space.
- **Concept 2 (Brand First):** A bold, graphic design where the brand's logo and colors are the hero. The layout is more expressive and makes a strong visual statement.
- **Concept 3 (Elegant & Tactile):** A design that evokes luxury and high quality. It might simulate a premium paper texture (like linen or cotton) and use elegant typography and a refined color palette.

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique concepts, one for each Mandate. For each, create a detailed structured prompt object for an AI image generator. The prompt should result in a standard visiting card design.

The structured prompt must include:
- **Layout & Composition:** Describe the placement of all elements (logo, names, contact info).
- **Typography:** Suggest specific font styles and hierarchy for the text elements.
- **Color Palette:** Define a professional color scheme that fits the style.
- **Text Accuracy:** The prompt must explicitly command the AI to render all text details with 10000% accuracy.

You will return a single JSON object with a "concepts" key, an array of three objects.
Each object must have "structured_prompt", "reason", and "isRecommended" keys.
Your response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateVisitingCard = async (selectedPrompt: string, logo: UploadedFile | null, aspectRatio: AspectRatio): Promise<string | null> => {
    const finalPrompt = `
**CREATIVE BRIEF TO EXECUTE:**
"${selectedPrompt}"

**FINAL EXECUTION CHECKLIST:**
- **Design:** Execute the creative brief precisely.
- **Text Accuracy:** All text details (names, company, contact info) mentioned in the brief must be rendered with 10000% PERFECT accuracy, with no spelling errors or omissions. This is the most critical part of the task.
- **Logo Integration:** If the brief mentions integrating a provided logo, you must use the image provided.
- **Aspect Ratio:** The final image MUST have the aspect ratio of **${aspectRatio}**.
- **Quality:** The final image must be a crisp, high-resolution, print-ready design.
`;
    const images = logo ? [logo] : [];
    if (images.length > 0) {
        return geminiNativeService.generateImage(finalPrompt, images);
    } else {
        return geminiNativeService.generateImageFromText(finalPrompt, aspectRatio);
    }
};

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