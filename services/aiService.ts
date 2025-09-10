

import { Type } from "@google/genai";
import { CreatorStyle, UploadedFile, AspectRatio, GeneratedConcept, PoliticalParty, PosterStyle, AdStyle, ValidationStatus, ProfilePictureStyle, LogoStyle, HeadshotStyle, PassportPhotoStyle, VisitingCardStyle, EventPosterStyle, SocialCampaign, NewspaperStyle, StructuredPrompt, VideoScriptResponse, VeoPrompt } from '../types';
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

const VIDEO_SCRIPT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        script: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "A catchy, SEO-friendly title for the video." },
                hook: { type: Type.STRING, description: "A powerful opening line (3-5 seconds) to grab viewer attention." },
                intro: { type: Type.STRING, description: "A brief introduction setting up the video's premise (5-10 seconds)." },
                mainContent: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            scene: { type: Type.INTEGER, description: "The scene number." },
                            visual: { type: Type.STRING, description: "A description of the visuals for this scene." },
                            voiceover: { type: Type.STRING, description: "The voiceover script for this scene." }
                        },
                        required: ["scene", "visual", "voiceover"]
                    },
                    description: "An array of 3-5 scenes."
                },
                outro: { type: Type.STRING, description: "A concluding summary or final thought (5-10 seconds)." },
                callToAction: { type: Type.STRING, description: "A clear call to action (e.g., 'Follow for more!')." }
            },
            required: ["title", "hook", "intro", "mainContent", "outro", "callToAction"]
        },
        veoPrompt: {
            type: Type.OBJECT,
            properties: {
                prompt: { type: Type.STRING, description: "The main descriptive prompt for VEO, synthesizing the script's visual essence into a single paragraph." },
                style_directives: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "An array of stylistic keywords (e.g., 'cinematic', 'hyperrealistic', '8k', 'vintage film')."
                },
                cinematic_terms: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "An array of cinematic terms (e.g., 'dolly shot', 'wide angle lens', 'golden hour lighting')."
                },
                negative_prompt: { type: Type.STRING, description: "A negative prompt to specify what to avoid (e.g., 'blurry, ugly, deformed')." }
            },
            required: ["prompt", "style_directives", "cinematic_terms", "negative_prompt"]
        }
    },
    required: ["script", "veoPrompt"]
};


const VIDEO_TOPIC_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        topic: { type: Type.STRING, description: "A compelling, creative, and concise video topic based on the image." }
    },
    required: ["topic"]
};

interface VideoTopicResponse {
    topic: string;
}


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
   - **Color Scheme:** The poster must strictly adhere to the party's color scheme of **${party.colorScheme}**.
   ${ideologyInstruction}

**3. Creative Exploration Mandate:**
Generate three distinct concepts, each targeting a different emotional response:
- **Concept 1 (Inspirational & Hopeful):** Focus on a bright, optimistic future. Use imagery of progress, unity, and hopeful expressions.
- **Concept 2 (Strong & Decisive):** Focus on strength and leadership. Use powerful, confident poses and a bold, authoritative design.
- **Concept 3 (Grounded & Relatable):** Focus on connecting with the common person. Use authentic, emotional imagery of citizens and communities.

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique poster concepts based on the mandates above. For each, create a structured JSON object.
You will return a single JSON object. The object must contain a key "concepts", which is an array of three concept objects.
Each concept object must have a "structured_prompt", a "reason", and an "isRecommended" boolean.
Your entire response MUST be only the raw JSON object.
`;

    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generatePoster = async (prompt: string, headshots: UploadedFile[], aspectRatio: AspectRatio, party?: PoliticalParty): Promise<string | null> => {
    const finalPrompt = `
${FACIAL_LIKENESS_COMMAND}

**CREATIVE BRIEF TO EXECUTE:**
"${prompt}"

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Core Directive. The face must be a perfect match.
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
- **Overall Quality:** The image must be a high-resolution, professional, and visually striking political poster.
`;
    return geminiNativeService.generateImage(finalPrompt, headshots);
};

export const generateAdConcepts = async (productDescription: string, headline: string, style: AdStyle): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are an award-winning Creative Director at a top global advertising agency. Your task is to generate three distinct, high-impact ad banner concepts.

**1. Product & Campaign Brief:**
   - **Product Description:** "${productDescription}"
   - **Main Headline/CTA:** "${headline}"
   - **Target Style:** ${style.name} (${style.stylePrompt})

**2. Creative Exploration Mandate:**
Each concept must explore a different advertising strategy:
- **Concept 1 (Benefit-Oriented):** Focus on the core benefit for the user. How does this product make their life better, easier, or more enjoyable? The visual should clearly communicate this positive outcome.
- **Concept 2 (Intrigue/Curiosity):** Create a sense of mystery or ask a question. The visual should be intriguing and make the viewer want to learn more, without revealing everything.
- **Concept 3 (Aspirational):** Focus on the lifestyle or identity the customer aspires to. The visual should associate the product with success, creativity, or a desired feeling.

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique ad concepts based on the mandates above. For each, create a structured JSON object.
You will return a single JSON object. The object must contain a key "concepts", which is an array of three concept objects.
Each concept object must have a "structured_prompt", a "reason", and an "isRecommended" boolean.
Your entire response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateAdBanner = async (prompt: string, productImage: UploadedFile, modelHeadshot: UploadedFile, headline: string, brandDetails: string, aspectRatio: AspectRatio): Promise<string | null> => {
    let textInstruction = `TEXT INTEGRATION: The headline "${headline}" MUST be integrated onto the banner in a bold, readable, and stylistically appropriate font.`;
    if (brandDetails && brandDetails.trim()) {
        textInstruction += ` The brand name "${brandDetails}" should also be included, but more subtly.`;
    }

    const finalPrompt = `
${FACIAL_LIKENESS_COMMAND}

**Additional Asset Mandate: Product Integrity**
You are provided with a second image: the product. You must integrate this product into the final scene seamlessly and photorealistically. Do not change the product's design.

**CREATIVE BRIEF TO EXECUTE:**
"${prompt}"

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Core Directive. The model's face must be a perfect match to the headshot.
- **Product Integration:** The product must be included perfectly, as described in the brief.
- **Text Integration:** Execute the text instructions precisely: ${textInstruction}
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
- **Overall Quality:** The image must be a high-resolution, professional, and visually striking advertisement banner.
`;
    return geminiNativeService.generateImage(finalPrompt, [modelHeadshot, productImage]);
};

export const generateTopicFromImage = async (image: UploadedFile): Promise<string> => {
    const prompt = `Analyze the provided image carefully. Consider the subject, mood, setting, and potential story. Based on your analysis, generate a single, compelling, and creative video topic. The topic should be concise and suitable for a short video or documentary. Your response must be in the specified JSON format.`;
    
    const jsonText = await geminiNativeService.generateTextFromMultimodal(prompt, [image], VIDEO_TOPIC_SCHEMA);

    try {
        const result = JSON.parse(jsonText) as VideoTopicResponse;
        return result.topic;
    } catch (e) {
        console.error("Failed to parse topic from image response:", e, "Raw Text:", jsonText);
        // Fallback: if parsing fails, maybe the raw text is the topic itself
        return jsonText.trim();
    }
};

export const generateVideoScript = async (topic: string, tone: string, audience: string): Promise<VideoScriptResponse> => {
    const prompt = `
You are an expert video scriptwriter and a specialist in creating prompts for generative video models like Google VEO.
Your task is to generate a complete, structured video script and a corresponding cinematic VEO prompt based on the user's request.

**Video Request:**
- **Topic:** "${topic}"
- **Tone:** "${tone}"
- **Target Audience:** "${audience}"

**CRITICAL TASK & INSTRUCTIONS:**
1.  **Write the Script:** Create a short, engaging video script. It must include all the required sections: a catchy title, a strong hook (3-5 seconds), a clear intro, 3-5 main content scenes (each with a visual description and a voiceover script), a concise outro, and a compelling call to action.
2.  **Create the VEO JSON Prompt:** Synthesize the visual essence of your entire script into a structured JSON object for Google's VEO model. This JSON object must be cinematic and detailed.
    - The \`prompt\` field should be a single, powerful, descriptive paragraph.
    - The \`style_directives\` and \`cinematic_terms\` fields should be arrays of relevant keywords.
    - Include a helpful \`negative_prompt\`.
3.  **Format the Output:** Your entire response must be a single, raw JSON object that strictly adheres to the provided schema. Do not include any text or markdown formatting before or after the JSON object.
`;
    
    const jsonText = await geminiNativeService.generateText(prompt, VIDEO_SCRIPT_SCHEMA);
    try {
        const cleanedJsonText = jsonText.replace(/^```(?:json)?\s*|```\s*$/g, '').trim();
        return JSON.parse(cleanedJsonText) as VideoScriptResponse;
    } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", parseError, "Raw text:", jsonText);
        throw new Error("Failed to parse the AI's script response.");
    }
};

export const generateProfilePicturePrompts = async (description: string, style: ProfilePictureStyle): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are a world-class portrait photographer and digital artist. Your task is to generate three distinct concepts for a professional profile picture.

**1. Client Brief:**
   - **Purpose:** "${description}"
   - **Desired Style:** ${style.name} - The final image must strictly adhere to this style description: "${style.stylePrompt}"

**2. Creative Exploration Mandate:**
Each concept must explore a slightly different interpretation of the style:
- **Concept 1 (Classic & Centered):** A straightforward, professional interpretation. The composition should be well-balanced and centered, with classic, flattering lighting.
- **Concept 2 (Dynamic & Angled):** A more dynamic interpretation. Use a slightly off-center composition (rule of thirds) and more dramatic or high-contrast lighting to create more energy.
- **Concept 3 (Character & Mood):** A more moody and character-driven interpretation. Focus on a specific expression (e.g., thoughtful, intense, joyful) and use lighting and color to enhance that specific mood.

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique profile picture concepts. For each, create a structured JSON object.
You will return a single JSON object. The object must contain a key "concepts", which is an array of three concept objects.
Each concept object must have a "structured_prompt", a "reason", and an "isRecommended" boolean.
Your entire response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateProfilePicture = async (prompt: string, headshot: UploadedFile, aspectRatio: AspectRatio): Promise<string | null> => {
    const finalPrompt = `
${FACIAL_LIKENESS_COMMAND}

**CREATIVE BRIEF TO EXECUTE:**
"${prompt}"
This is for a profile picture, so the focus must be a high-quality, 1:1 head-and-shoulders shot.

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Core Directive. The face must be a perfect match.
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly 1:1.
- **Overall Quality:** The image must be a high-resolution, professional, and visually striking profile picture.
`;
    return geminiNativeService.generateImage(finalPrompt, [headshot]);
};


export const generateLogoPrompts = async (companyName: string, description: string, style: LogoStyle, slogan?: string, hasMascot?: boolean): Promise<GeneratedConcept[]> => {
    const mascotInstruction = hasMascot 
        ? "Crucially, this logo MUST feature a character mascot. The mascot's face must be a stylized but perfectly recognizable version of the person in the provided headshot."
        : "This is an abstract or typographic logo. Do NOT include any human faces or characters.";

    const fullPrompt = `
You are a world-renowned branding expert and logo designer. Your task is to generate three distinct logo concepts for a new company.

**1. Brand Brief:**
   - **Company Name:** "${companyName}"
   - **Slogan:** "${slogan || 'Not provided'}"
   - **Company Description:** "${description}"
   - **Target Style:** ${style.name} - The final logo must strictly adhere to this style description: "${style.stylePrompt}"

**2. Mascot Mandate:**
- ${mascotInstruction}

**3. Creative Exploration Mandate:**
Each concept must explore a different design direction within the chosen style:
- **Concept 1 (Literal Interpretation):** A design that directly incorporates elements from the company's name or description.
- **Concept 2 (Abstract Interpretation):** A more abstract or geometric design that represents the company's values (e.g., speed, trust, creativity).
- **Concept 3 (Typographic Focus):** A design that focuses primarily on the company name or initials, using custom typography or a unique lettermark/wordmark arrangement.

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique logo concepts. For each, create a structured JSON object. The prompt must be a detailed description for an AI image generator to create a vector-style logo on a solid white background. It MUST explicitly state that the final output should be a clean, vector logo.
You will return a single JSON object with a "concepts" key, containing an array of three concept objects.
Each object must have a "structured_prompt", a "reason", and an "isRecommended" boolean.
Your entire response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateLogo = async (prompt: string, headshot: UploadedFile | null, aspectRatio: AspectRatio): Promise<string | null> => {
    const finalPrompt = `
${headshot ? FACIAL_LIKENESS_COMMAND : ''}

**CREATIVE BRIEF TO EXECUTE:**
"${prompt}"

**FINAL EXECUTION CHECKLIST:**
- **Style:** The final output MUST be a clean, simple, vector-style logo on a solid white background. Do not create a photorealistic image.
${headshot ? '- **Facial Likeness:** If creating a mascot, adhere to the Core Directive. The face must be a perfect, stylized match.' : ''}
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly 1:1.
- **Overall Quality:** The image must be a high-resolution, professional logo.
`;
    const images = headshot ? [headshot] : [];
    return geminiNativeService.generateImage(finalPrompt, images);
};

export const enhanceImage = async (image: UploadedFile): Promise<string | null> => {
    const prompt = `
Act as a world-class photo remastering expert. Your sole task is to take the user-provided image and enhance it to its absolute maximum potential.
**CRITICAL INSTRUCTIONS:**
1.  **Upscale Resolution:** Dramatically increase the resolution and clarity of the image.
2.  **De-noise & De-blur:** Remove any noise, grain, and motion blur, making the image tack-sharp.
3.  **Relight:** Apply professional, flattering studio lighting to the subject. Correct any harsh shadows or underexposed areas.
4.  **Color Grade:** Subtly improve the color balance, contrast, and vibrancy to make the image pop.
5.  **Fidelity:** Do NOT change the subject's identity, clothing, or the core composition. This is an enhancement, not a modification. The final result must be a hyper-realistic, high-definition photograph.
`;
    return geminiNativeService.generateImage(prompt, [image]);
};

export const generateHeadshotPrompts = async (description: string, style: HeadshotStyle, photoCount: number): Promise<GeneratedConcept[]> => {
     const multiPhotoInstruction = photoCount > 1 
        ? "The user has provided multiple photos. Synthesize the best features from all provided images to create the most accurate and flattering facial likeness possible."
        : "The user has provided one photo. Use it as the absolute source of truth for the facial likeness.";

    const fullPrompt = `
You are an expert corporate and portrait photographer. Your task is to generate three distinct concepts for a professional headshot set.

**1. Client Brief:**
   - **Purpose:** "${description}"
   - **Desired Style:** ${style.name} - The final image set must strictly adhere to this style description: "${style.stylePrompt}"
   - **Source Photos:** ${multiPhotoInstruction}

**2. Creative Exploration Mandate:**
Each concept must propose a slightly different variation in expression or mood, while staying within the chosen style:
- **Concept 1 (Confident & Approachable):** A classic professional look with a gentle, confident smile.
- **Concept 2 (Thoughtful & Serious):** A more serious and contemplative look, suitable for an expert or thought leader.
- **Concept 3 (Dynamic & Energetic):** A more expressive and energetic look with a bigger, warmer smile, conveying passion and drive.

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique headshot concepts. For each, create a structured JSON object.
You will return a single JSON object with a "concepts" key, containing an array of three concept objects.
Each object must have a "structured_prompt", a "reason", and an "isRecommended" boolean.
Your entire response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};


export const generateHeadshot = async (prompt: string, images: UploadedFile[]): Promise<{ angle: string; image: string; }[]> => {
    const angles = ["Front", "Slightly Left", "Slightly Right", "Candid Looking Away", "Smiling"];
    const results: { angle: string; image: string; }[] = [];
    
    // Use Promise.allSettled to ensure all requests complete, even if some fail.
    const promises = angles.map(angle => {
        const anglePrompt = `
${FACIAL_LIKENESS_COMMAND}

**CREATIVE BRIEF TO EXECUTE:**
"${prompt}"

**POSE VARIATION (MANDATORY):**
- **Angle:** The subject in this specific image MUST be posed from the **${angle}** angle.
- **Framing:** This must be a 1:1 aspect ratio, high-quality, professional head-and-shoulders shot.

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Core Directive. The face must be a perfect match, synthesizing features from all provided photos.
- **Pose:** The pose must exactly match the specified angle for this image.
- **Aspect Ratio:** 1:1.
`;
        return geminiNativeService.generateImage(anglePrompt, images)
            .then(image => {
                if (image) {
                    return { angle, image, status: 'fulfilled' as const };
                }
                return { angle, status: 'rejected' as const, reason: 'No image data returned' };
            })
            .catch(error => ({ angle, status: 'rejected' as const, reason: error.message }));
    });

    const settledResults = await Promise.allSettled(promises);

    settledResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value.status === 'fulfilled') {
            results.push({ angle: result.value.angle, image: result.value.image });
        } else {
             // Log the error for debugging but don't throw, allowing partial success.
            const reason = result.status === 'rejected' ? result.reason : (result.value as any).reason;
            console.error(`Failed to generate headshot for angle:`, reason);
        }
    });

    return results;
};


export const generatePassportPhoto = async (image: UploadedFile, outfitPrompt: string, backgroundColor: string): Promise<string | null> => {
    const prompt = `
${FACIAL_LIKENESS_COMMAND}

**TASK: Create a professional, compliant passport/visa photo.**

**EXECUTION STEPS (MANDATORY):**
1.  **Isolate Subject:** Perfectly isolate the person from their original background.
2.  **Change Outfit:** Replace the original clothing from the shoulders down with **${outfitPrompt}**. The new outfit must look completely realistic and seamlessly blended.
3.  **Set Background:** Place the subject against a solid, even, shadowless background of the color with this exact hex code: **${backgroundColor}**.
4.  **Pose & Expression:** The subject must be looking directly forward with a neutral expression (no smiling).
5.  **Framing:** The final image must be a 1:1 aspect ratio, centered, head-and-shoulders portrait.

**FINAL EXECUTION CHECKLIST:**
- **Facial Likeness:** Adhere to the Core Directive.
- **Outfit:** Must match the description exactly.
- **Background:** Must be the specified solid color.
- **Compliance:** Neutral expression, forward-facing.
- **Aspect Ratio:** 1:1.
`;
    return geminiNativeService.generateImage(prompt, [image]);
};

export const generateVisitingCardPrompts = async (
    companyName: string, personName: string, title: string, contactInfo: string, style: VisitingCardStyle, hasLogo: boolean
): Promise<GeneratedConcept[]> => {
    const logoInstruction = hasLogo
        ? "The design MUST incorporate a placeholder for a user-provided logo. Leave a clean, designated space for it."
        : "The design will NOT use a separate logo file; rely on typography for the company name.";

    const fullPrompt = `
You are a master graphic designer specializing in professional branding and print design. Your task is to generate three distinct concepts for a visiting card.

**1. Client Brief:**
   - **Company Name:** "${companyName}"
   - **Person's Name:** "${personName}"
   - **Title/Designation:** "${title}"
   - **Contact Info:** "${contactInfo}"
   - **Logo Status:** ${logoInstruction}
   - **Target Style:** ${style.name} - The design must strictly adhere to this description: "${style.stylePrompt}"

**2. Creative Exploration Mandate:**
Each concept must explore a different layout approach:
- **Concept 1 (Classic Horizontal):** A traditional, balanced layout with clear information hierarchy.
- **Concept 2 (Modern Asymmetrical):** A more dynamic, asymmetrical layout that uses negative space creatively.
- **Concept 3 (Typographic Bold):** A design that makes a bold statement with typography, where the arrangement and style of the text is the primary design element.

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique visiting card concepts. For each, create a structured JSON object. The prompt must be a detailed description for an AI image generator to create a realistic, print-ready visiting card design.
You will return a single JSON object with a "concepts" key, containing an array of three concept objects.
Each object must have a "structured_prompt", a "reason", and an "isRecommended" boolean.
Your entire response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateVisitingCard = async (prompt: string, logo: UploadedFile | null, aspectRatio: AspectRatio): Promise<string | null> => {
    const finalPrompt = `
**TASK: Generate a single, print-ready visiting card based on the following creative brief.**

**CREATIVE BRIEF TO EXECUTE:**
"${prompt}"

**FINAL EXECUTION CHECKLIST:**
- **Readability:** All text must be 100% legible and accurate.
- **Logo:** If the brief mentions a logo, perfectly integrate the provided logo image. If not, do not invent one.
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly 3.5:2 (standard business card size).
- **Quality:** The output must be a clean, high-resolution graphic design, not a photograph of a card.
`;
    const images = logo ? [logo] : [];
    return geminiNativeService.generateImage(finalPrompt, images);
};

export const editEventPoster = async (
    image: UploadedFile, headline: string, branding: string, style: EventPosterStyle, details: { date: string, time: string, venue: string }, aspectRatio: AspectRatio
): Promise<string | null> => {
    
    let detailsString = [details.date, details.time, details.venue].filter(Boolean).join(' | ');

    const prompt = `
**TASK: Transform the user's photo into a professional event poster.**

**EXECUTION STEPS (MANDATORY):**
1.  **Enhance Image:** First, subtly enhance the base image quality, improving lighting and color vibrancy to make it more impactful. Do not change the content of the image.
2.  **Add Text:** Overlay the following text onto the image. The text MUST be perfectly legible and integrated into the composition in a visually appealing way.
    -   **Main Headline:** "${headline}"
    -   **Branding/Sub-headline:** "${branding}"
    -   **Event Details:** "${detailsString}"
3.  **Apply Style:** The typography and overall design of the added text must strictly adhere to the following style guide: **${style.name} - ${style.stylePrompt}**.

**FINAL EXECUTION CHECKLIST:**
- **Readability:** All text must be clear and easy to read.
- **Accuracy:** All text must be spelled exactly as provided.
- **Composition:** The text must be placed thoughtfully on the image, not just slapped on top.
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
- **Quality:** The final output must be a high-resolution, professional-looking event poster.
`;
    return geminiNativeService.generateImage(prompt, [image]);
};

export const editImage = async (base64Image: string, prompt: string): Promise<string | null> => {
    const fullPrompt = `
**TASK: Edit the provided image based on the user's instructions.**

**USER'S EDIT INSTRUCTION:**
"${prompt}"

**CRITICAL RULES:**
1.  **Follow Instructions Literally:** You MUST perform the user's edit exactly as requested.
2.  **Maintain Realism:** The edit must be seamlessly blended into the original image, maintaining photorealism.
3.  **Do Not Change Anything Else:** Only modify what the user has asked for. The rest of the image must remain identical.
`;
     const imageFile: UploadedFile = {
        base64: base64Image,
        mimeType: 'image/png',
        name: 'edit_source.png'
    };
    return geminiNativeService.generateImage(fullPrompt, [imageFile]);
};

export const generateNewspaperCutting = async (
    image: UploadedFile, headline: string, bodyText: string, language: string, style: NewspaperStyle, aspectRatio: AspectRatio, newspaperName?: string, date?: string
): Promise<string | null> => {
    
    const newspaperNamePrompt = newspaperName ? `The name of the newspaper, "${newspaperName}", should be visible at the top.` : "";
    const datePrompt = date ? `The date, "${date}", should be clearly visible.` : "";

    const prompt = `
**TASK: Create a realistic newspaper clipping.**

**EXECUTION STEPS (MANDATORY):**
1.  **Apply Style:** The entire image must be styled to look exactly like a clipping from a **${style.name}** newspaper. Strictly adhere to this style description: "${style.stylePrompt}".
2.  **Integrate Photo:** The user-provided photo must be integrated into the newspaper layout. It must be processed to match the newspaper's style (e.g., halftone, black and white, aged).
3.  **Add Text:** The following text must be typeset and placed realistically within the newspaper layout, using fonts appropriate for the chosen style and the **${language}** language.
    -   **Headline:** "${headline}"
    -   **Body Text:** "${bodyText}"
4.  **Add Details:**
    -   ${newspaperNamePrompt}
    -   ${datePrompt}
    
**FINAL EXECUTION CHECKLIST:**
- **Realism:** The final image must look like a real, physical newspaper cutting, not a flat digital design. Include paper texture, slight aging, and appropriate ink effects.
- **Text Accuracy:** All text must be included exactly as written.
- **Photo Style:** The photo must be correctly processed to match the newspaper style.
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
`;

    return geminiNativeService.generateImage(prompt, [image]);
};

// ... (rest of the social media functions, checkCurrentApiStatus)
export const getTrendingTopics = async (baseKeyword: string): Promise<string[]> => {
    const prompt = `
You are a real-time trend analysis AI. Based on the user's base keyword, find 5 currently trending, specific, and relevant topics suitable for creating social media content.
Base Keyword: "${baseKeyword}"
Return your response as a raw JSON object with a single key "topics" which is an array of 5 strings.
`;
    const jsonText = await geminiNativeService.generateText(prompt, TRENDS_SCHEMA);
    try {
        const result = JSON.parse(jsonText) as { topics: string[] };
        return result.topics || [];
    } catch (e) {
        console.error("Failed to parse trending topics:", e);
        return [];
    }
};

export const generateSocialPostConcepts = async (topic: string, platform: string, tone: string, style: AdStyle, callToAction: string): Promise<GeneratedConcept[]> => {
    const fullPrompt = `
You are a master social media content creator. Your task is to generate three distinct concepts for a social media post.

**1. Content Brief:**
   - **Topic:** "${topic}"
   - **Target Platform:** ${platform}
   - **Tone of Voice:** ${tone}
   - **Call to Action:** "${callToAction}"
   - **Visual Style:** ${style.name} (${style.stylePrompt})

**2. Creative Exploration Mandate:**
Generate three distinct concepts, each with a different creative angle:
- **Concept 1 (Direct & Informative):** Clearly state the main point or offer. The visual is clean and directly related to the topic.
- **Concept 2 (Emotional & Relatable):** Connect with the audience on an emotional level. The visual should feature people or situations that evoke a feeling.
- **Concept 3 (Intriguing & Bold):** Use a bold statement or a surprising visual to stop the scroll and create curiosity.

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique concepts. For each, create a structured JSON object which includes both a detailed visual prompt for an AI image generator AND a complete, ready-to-post caption.
You will return a single JSON object with a "concepts" key, containing an array of three concept objects.
Each object must have a "structured_prompt", a "caption", a "reason", and an "isRecommended" boolean.
Your entire response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, SOCIAL_CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateTrendPostConcepts = async (trend: string, platform: string, style: AdStyle): Promise<GeneratedConcept[]> => {
     const fullPrompt = `
You are a viral trend expert. Your task is to generate three distinct concepts for a social media post based on a trending topic.

**1. Content Brief:**
   - **Trending Topic:** "${trend}"
   - **Target Platform:** ${platform}
   - **Visual Style:** ${style.name} (${style.stylePrompt})

**2. Creative Exploration Mandate:**
Generate three distinct concepts, each with a different take on the trend:
- **Concept 1 (Direct Take):** Create a post that directly participates in or comments on the trend in a straightforward way.
- **Concept 2 (Humorous/Meme Take):** Create a funny or satirical post that uses the trend as a punchline or meme format.
- **Concept 3 (Brand Take):** Create a post that cleverly connects the trend back to a brand's product or message in a non-obvious way.

**CRITICAL TASK & INSTRUCTIONS:**
Generate three unique concepts. For each, create a structured JSON object which includes both a detailed visual prompt for an AI image generator AND a complete, ready-to-post caption that cleverly incorporates the trend.
You will return a single JSON object with a "concepts" key, containing an array of three concept objects.
Each object must have a "structured_prompt", a "caption", a "reason", and an "isRecommended" boolean.
Your entire response MUST be only the raw JSON object.
`;
    const jsonText = await geminiNativeService.generateText(fullPrompt, SOCIAL_CONCEPTS_SCHEMA);
    return parseAndValidateConcepts(jsonText);
};

export const generateSocialPost = async (prompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
     const finalPrompt = `
**CREATIVE BRIEF TO EXECUTE:**
"${prompt}"

**FINAL EXECUTION CHECKLIST:**
- **Aspect Ratio:** The final image's aspect ratio MUST be exactly ${aspectRatio}.
- **Quality:** The output must be a high-resolution, visually stunning image suitable for a social media feed.
`;
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
- **Quality:** The output must be a high-resolution, visually stunning image suitable for a social media feed.
`;
    return geminiNativeService.generateImage(finalPrompt, [headshot]);
};

export const generateSocialMediaCampaign = async (topic: string, keywords: string, link: string, headshot: UploadedFile | null, sampleImage: UploadedFile | null, postLink: string, creatorName?: string): Promise<SocialCampaign> => {
    const images = [headshot, sampleImage].filter((img): img is UploadedFile => img !== null);
    const creatorInfo = creatorName ? `The campaign should be in the voice of a creator named ${creatorName}.` : "The campaign should be in a general brand voice.";
    const headshotInfo = headshot ? "A headshot of the creator is provided. The AI-generated images should feature a person who looks exactly like the person in the headshot." : "No headshot is provided. The AI-generated images can feature diverse, stock-photo-style people or be purely graphic.";

    const prompt = `
You are a senior social media campaign manager AI. Your task is to generate a comprehensive, multi-platform social media campaign based on the provided brief.

**Campaign Brief:**
- **Core Topic:** "${topic}"
- **Keywords:** "${keywords}"
- **Target Link:** "${link}"
- **Creator/Brand Voice:** ${creatorInfo}
- **Headshot for Visuals:** ${headshotInfo}
- **Sample Post Inspiration Link:** ${postLink || "None provided"}

**CRITICAL TASK & INSTRUCTIONS:**
For EACH of the 7 platforms (LinkedIn, Instagram, Facebook, X-Twitter, TikTok, Threads, YouTube_Shorts), you must generate a complete and unique post concept tailored to that platform's audience and format.
- **Content:** Each concept must include all relevant fields: post/caption text, hashtags, call to action, etc.
- **Visuals:** For each platform, provide a highly detailed and creative prompt for an AI image generator (like Imagen 2) to create a compelling visual.
- **Video:** For TikTok and YouTube Shorts, provide a full video script.
- **Format:** Your entire response must be a single, raw JSON object that strictly adheres to the provided schema. Do not include any text or markdown formatting before or after the JSON object.
`;

    const jsonText = await geminiNativeService.generateTextFromMultimodal(prompt, images, SOCIAL_CAMPAIGN_SCHEMA);
    try {
        const cleanedJsonText = jsonText.replace(/^```(?:json)?\s*|```\s*$/g, '').trim();
        return JSON.parse(cleanedJsonText) as SocialCampaign;
    } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", parseError, "Raw text:", jsonText);
        throw new Error("Failed to parse the AI's campaign response.");
    }
};

export const generateSocialVideo = async (prompt: string): Promise<string | null> => {
    return geminiNativeService.generateVideo(prompt);
};

export const checkCurrentApiStatus = async (): Promise<{ status: ValidationStatus, error?: string }> => {
    try {
        const apiKey = apiConfigService.getApiKey();
        const validation = await geminiNativeService.validateApiKey(apiKey);
        if (validation.isValid) {
            return { status: 'valid' };
        } else {
            return { status: 'invalid', error: validation.error || "The configured API Key is invalid." };
        }
    } catch (error: any) {
        return { status: 'invalid', error: error.message };
    }
};