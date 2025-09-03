

import { CreatorStyle, PoliticalParty, PosterStyle, AdStyle } from '../types';

type CreatorStyles = {
    [key: string]: CreatorStyle[];
};

type AdStyles = {
    [key: string]: AdStyle[];
}

export const CREATOR_STYLES: CreatorStyles = {
  internationalMale: [
    {
      id: 'mrbeast',
      name: 'MrBeast',
      tags: 'Bold & High-Contrast',
      creatorStyle: 'Explosive, high-energy spectacle. Thumbnails are meticulously designed to be the most clickable on the platform, using vibrant colors, exaggerated surprised expressions, and a massive sense of scale. Often features stacks of cash, luxury cars, or custom-built massive objects.',
      mood: 'Maximum Excitement, Shock, Urgency, Spectacle',
      imageStyle: 'Ultra-realistic photo, 8k resolution. Shot with a wide-angle lens (14mm) to create dramatic perspective distortion. Lighting is harsh and high-contrast, like a commercial studio setup, with dramatic highlights and deep shadows to make the subject pop. Hyper-saturated color grading with boosted vibrancy. Motion blur and particle effects (sparks, dust) are common.'
    },
    {
      id: 'mkbhd',
      name: 'MKBHD',
      tags: 'Minimalist & Techy',
      creatorStyle: 'Sleek, minimalist, and premium tech aesthetic. Focus on flawless product photography with clean lines, dark matte backgrounds, and precise lighting that highlights texture and form. The brand colors of matte black and red are paramount.',
      mood: 'Sophisticated, Professional, Minimalist, Premium',
      imageStyle: 'Ultra-realistic studio product photo, 8k. Captured with a 50mm prime lens for a natural perspective. Lighting is soft and diffused, often from a large softbox, creating subtle gradients. Cinematic color grading with deep blacks and a specific red accent (#ff0000). Extremely shallow depth of field to isolate the subject.'
    },
    {
        id: 'casey-neistat',
        name: 'Casey Neistat',
        tags: 'Scrapbook & Authentic',
        creatorStyle: 'Gritty, authentic, scrapbook-style visuals that feel raw and in-the-moment. Often uses handwritten text, doodles, and a slightly desaturated, urban color palette. Focus on telling a story with a single image.',
        mood: 'Authentic, Energetic, Raw, Unfiltered',
        imageStyle: 'Realistic photo that looks like a frame from a vlog. Shot with a slight wide-angle lens, featuring natural, often harsh, daylight. High-contrast, slightly desaturated color grade with a bit of film grain to add texture. The composition is often candid and unposed.'
    },
    {
      id: 'pewdiepie',
      name: 'PewDiePie',
      tags: 'Meme & Abstract',
      creatorStyle: 'Often chaotic, meme-focused, and surreal. Can range from simple reaction faces to highly edited, bizarre compositions. A slightly distorted, DIY aesthetic that feels intentionally low-fi at times.',
      mood: 'Ironic, Comedic, Unpredictable, Surreal',
      imageStyle: 'Mixed media look, often a composite of a real photo with graphic elements. The photo part is high-contrast, sometimes with a grainy or pixelated texture. Lighting is vibrant and can be mismatched to enhance the chaotic feel. Often uses a fish-eye lens effect for comedic distortion.'
    },
    {
        id: 'ali-abdaal',
        name: 'Ali Abdaal',
        tags: 'Productivity & Clean',
        creatorStyle: 'Clean, bright, and organized aesthetic focused on productivity and learning. Often features screenshots of apps like Notion, book covers, and a light, airy visual style. Uses soft pastel colors and clear iconography.',
        mood: 'Productive, Inspiring, Calm, Organized',
        imageStyle: 'Bright and airy high-key photo. Lighting is even and shadowless, as if from a large window. The composition is minimalist and well-balanced (often rule of thirds). The color palette is light, with pastel accents. The image is sharp and clean with no grain.'
    },
    {
        id: 'linus-tech-tips',
        name: 'Linus Tech Tips',
        tags: 'Tech & In-Depth',
        creatorStyle: 'Tech-focused, informative, and often humorous. Features hardware close-ups, custom PC builds, and expressive, sometimes goofy, faces. Orange, black, and white are key brand colors.',
        mood: 'Informative, Enthusiastic, In-Depth, Humorous',
        imageStyle: 'Crisp and clean studio photo. Lighting is professional and designed to eliminate glare on tech components. The composition is dynamic, often using diagonal lines. Color grading features a distinct orange and teal look. The focus is tack-sharp on the main subject.'
    },
    {
        id: 'mark-rober',
        name: 'Mark Rober',
        tags: 'Science & Engineering',
        creatorStyle: 'Fun, educational, and epic science/engineering builds. Features explosions, crazy contraptions, and a sense of wonder. Visuals are bright, high-energy, and clearly showcase the main invention.',
        mood: 'Exciting, Educational, Epic, Awe-Inspiring',
        imageStyle: 'High-speed action photo, captured with a fast shutter speed to freeze motion. Lighting is typically bright, natural outdoor sunlight. Colors are vibrant and saturated to create a fun, family-friendly feel. The composition is wide to capture the scale of the projects.'
    },
    {
        id: 'logan-paul',
        name: 'Logan Paul',
        tags: 'High-Energy & Pop',
        creatorStyle: 'Extremely high-energy, pop-culture-centric style with a very polished, almost commercial look. Action poses, dramatic expressions, and bright, often neon, colors are key.',
        mood: 'Energetic, Bold, Sensational, Polished',
        imageStyle: 'Ultra-polished commercial photo, 8k resolution. Lighting is dramatic and high-contrast, often using colored gels (like blue and pink). High saturation and crisp details are essential. The composition often includes motion blur or dynamic lines to enhance energy.'
    },
    {
        id: 'mrwhosetheboss',
        name: 'Mrwhosetheboss',
        tags: 'Tech & Dynamic',
        creatorStyle: 'Dynamic and engaging tech reviews with a highly cinematic feel. Often features creative compositions, floating products, and a sense of motion. Clean but visually interesting backgrounds are a must.',
        mood: 'Intriguing, Techy, Polished, Cinematic',
        imageStyle: 'Cinematic, moody photo. Lighting is dramatic, often a single key light from the side to create suspense. The background features an extremely shallow depth of field with beautiful bokeh. The color palette is often dark with a single vibrant accent color. May incorporate glowing lines or abstract tech elements.'
    },
    {
        id: 'dude-perfect',
        name: 'Dude Perfect',
        tags: 'Sports & Action',
        creatorStyle: 'Epic-scale sports and action shots featuring incredible trick shots. Wide-angle views, high-speed photography, and a sense of camaraderie and fun. Bright, clean, and family-friendly.',
        mood: 'Epic, Fun, Action-Packed, Unbelievable',
        imageStyle: 'Ultra-realistic action photo, captured with a very high shutter speed to freeze the moment. Lighting is bright, sunny outdoor light. Colors are vibrant and clean. The composition is dynamic, often using a low angle to make the action feel larger than life.'
    }
  ],
  internationalFemale: [
     {
      id: 'emma-chamberlain',
      name: 'Emma Chamberlain',
      tags: 'Vlog & Aesthetic',
      creatorStyle: 'Authentic, candid, and relatable with a vintage or film-like quality. Casual poses, natural lighting, and a focus on everyday, unpolished moments. Feels personal and diary-like.',
      mood: 'Relaxed, Authentic, Aesthetic, Nostalgic',
      imageStyle: 'Realistic photo that looks shot on 35mm film. Features noticeable film grain, warm tones, and a slightly faded, desaturated color palette. Lighting is soft and natural, often from a window. The composition is unposed and feels like a captured moment.'
    },
    {
        id: 'ijustine',
        name: 'iJustine',
        tags: 'Tech & Unboxing',
        creatorStyle: 'Bright, cheerful, and enthusiastic tech reviews and unboxings. Clean backgrounds, often featuring Apple products. A very positive and high-energy vibe. Purple is a key brand color.',
        mood: 'Enthusiastic, Fun, Techy, Joyful',
        imageStyle: 'Bright, high-key studio photo. The lighting is even and shadowless, creating a clean, commercial look. Colors are vibrant and highly saturated. The composition is centered and clear, with a sharp focus on the product and her excited expression.'
    },
    {
        id: 'lilly-singh',
        name: 'Lilly Singh',
        tags: 'Comedy & Vibrant',
        creatorStyle: 'Bold, colorful, and comedic. Often features character sketches, highly expressive faces, and vibrant, pop-art inspired backgrounds. Conveys high energy and confidence.',
        mood: 'Humorous, Confident, Energetic, Bold',
        imageStyle: 'Vibrant studio photo with theatrical, multi-colored lighting (using gels). Colors are hyper-saturated, creating a pop-art feel. The composition is dynamic and posed for comedy. The image is sharp, glossy, and high-resolution.'
    },
    {
        id: 'pokimane',
        name: 'Pokimane',
        tags: 'Gaming & Streamer',
        creatorStyle: 'Friendly and engaging streamer aesthetic. Often features a gaming setup, cute branding elements, and a warm, inviting atmosphere. Poses are typically friendly and approachable.',
        mood: 'Friendly, Cute, Engaging, Cozy',
        imageStyle: 'Soft, diffused photo, lit as if by a large ring light to create a flattering "beauty" light. The color tones are warm and inviting. The background is her clean gaming room, softly blurred with a shallow depth of field (bokeh).'
    },
    {
        id: 'safiya-nygaard',
        name: 'Safiya Nygaard',
        tags: 'Experimental & Themed',
        creatorStyle: 'Themed and experimental content, often with a slightly gothic or vintage twist. High-concept visuals that match the video\'s experiment. Very polished and well-produced.',
        mood: 'Curious, Theatrical, Polished, Mysterious',
        imageStyle: 'Cinematic and moody photo. The lighting is dramatic and theme-specific (e.g., deep reds for a spooky video). The color palette is carefully controlled to match the video\'s theme. The image is high-resolution, with sharp details and a composed, intriguing expression.'
    },
    {
        id: 'rosanna-pansino',
        name: 'Rosanna Pansino',
        tags: 'Baking & Cute',
        creatorStyle: 'Extremely cute, colorful, and cheerful baking content. Features adorable creations, pastel colors, and a very bright, clean aesthetic. The mood is overwhelmingly sweet and whimsical.',
        mood: 'Sweet, Cheerful, Whimsical, Adorable',
        imageStyle: 'Bright, high-key photo with even, shadowless lighting. The color palette is hyper-saturated with pastel colors. The composition is often a flat lay or a clean shot in a pristine kitchen. The focus is tack-sharp on the cute details of the baked goods.'
    },
    {
      id: 'valkyrae',
      name: 'Valkyrae',
      tags: 'Gaming & Energetic',
      creatorStyle: 'High-energy streamer style, often with a competitive and cool edge. Clean graphics, branding (100 Thieves), and a focus on expressive reactions during gameplay are central.',
      mood: 'Energetic, Competitive, Cool, Focused',
      imageStyle: 'High-contrast photo with vibrant RGB/neon lighting from monitors and LED strips, creating colored rim lights. The background is dark to make the colors pop. The composition is dynamic, and her expression is focused and competitive.'
    },
    {
      id: 'huda-beauty',
      name: 'Huda Beauty',
      tags: 'Glamour & Makeup',
      creatorStyle: 'Ultra-polished, glamorous makeup tutorials and product showcases. A very luxurious and aspirational feel. Focus on flawless application, dramatic looks, and high-end products.',
      mood: 'Luxurious, Confident, Flawless, Glamorous',
      imageStyle: 'Ultra-realistic beauty photo, 8k, like a magazine cover. The lighting is perfect, soft, and shadowless, often from a large softbox or beauty dish. The shot is a macro close-up to show flawless detail. The colors are rich and saturated, and the background is clean and high-end.'
    },
    {
      id: 'michelle-khare',
      name: 'Michelle Khare',
      tags: 'Challenge & Transformation',
      creatorStyle: 'Documents intense training and transformation challenges. Thumbnails often show a dramatic "before and after" or her in peak action. The style is cinematic and inspiring.',
      mood: 'Determined, Inspiring, Epic, Powerful',
      imageStyle: 'Cinematic action photo. The lighting is dramatic and low-key to sculpt muscles and create a gritty feel. The color grade is cinematic (e.g., desaturated with high contrast). The shot often has motion blur to convey action, and her pose is powerful and determined.'
    },
    {
      id: 'liza-koshy',
      name: 'Liza Koshy',
      tags: 'Comedy & High-Energy',
      creatorStyle: 'Fast-paced, pun-filled, physical comedy. Thumbnails are extremely expressive and often use a wide-angle lens for comedic distortion. Bright, saturated, and chaotic.',
      mood: 'Goofy, Hyper-energetic, Hilarious, Chaotic',
      imageStyle: 'Bright, slightly overexposed photo with high-key lighting. Colors are hyper-saturated. A wide-angle lens (e.g., 16mm) is used up close to create comedic distortion. Her facial expression is exaggerated and goofy, and the pose is highly dynamic.'
    }
  ],
   indianMale: [
    {
      id: 'technical-guruji',
      name: 'Technical Guruji',
      tags: 'Tech & Informative',
      creatorStyle: 'Direct-to-camera presentation with the tech product clearly and professionally displayed. Bright, clean lighting. Often includes brand logos or box art in the background.',
      mood: 'Informative, Trustworthy, Clear, Professional',
      imageStyle: 'Clean, commercial studio photo. The lighting is bright and even, eliminating all shadows. The focus is tack-sharp on both his face and the product. Colors are true-to-life but slightly saturated. The pose is direct, confident, and trustworthy.'
    },
    {
        id: 'carryminati',
        name: 'CarryMinati',
        tags: 'Gaming & Expressive',
        creatorStyle: 'Highly expressive and comedic reactions, often during gaming or roasts. Features gaming setups, headphones, and dynamic, colorful backgrounds. Exaggerated facial expressions are key.',
        mood: 'Humorous, Energetic, Relatable, Outrageous',
        imageStyle: 'High-contrast photo, often a close-up shot with a wide-angle lens for comedic effect. The lighting is dramatic, with colored RGB lights creating a moody, energetic feel. His expression is highly animated and exaggerated. The background is often dark to make him pop.'
    },
    {
        id: 'bhuvan-bam',
        name: 'BB Ki Vines',
        tags: 'Comedy & Characters',
        creatorStyle: 'Character-driven comedy. Thumbnails often feature multiple characters (played by him) in one frame, showcasing a funny situation. Relatable, middle-class Indian settings are central.',
        mood: 'Comedic, Story-driven, Relatable, "Desi"',
        imageStyle: 'Realistic composite photo. The lighting is naturalistic, mimicking a real Indian home environment. Multiple versions of him in different character costumes are seamlessly blended. The expressions are key to telling the story of the skit.'
    },
    {
        id: 'ashish-chanchlani',
        name: 'Ashish Chanchlani',
        tags: 'Slapstick & Vibrant',
        creatorStyle: 'Loud, vibrant, and slapstick comedy. Thumbnails are extremely colorful and feature over-the-top expressions and situations. Bold, Hindi text is a common feature.',
        mood: 'Hilarious, Loud, Exaggerated, Entertaining',
        imageStyle: 'Hyper-saturated photo with vibrant, almost neon colors. A dramatic wide-angle lens is used to create a dynamic, high-energy composition. The lighting is bright and high-contrast. His expression is over-the-top and slapstick.'
    },
    {
        id: 'sandeep-maheshwari',
        name: 'Sandeep Maheshwari',
        tags: 'Motivational & Minimal',
        creatorStyle: 'Minimalist and impactful. Often a powerful portrait shot with a simple, clean background and a single line of inspiring text. The focus is on his calm and profound expression.',
        mood: 'Inspirational, Calm, Profound, Serene',
        imageStyle: 'Professional portrait photo. The lighting is a classic three-point studio setup, creating a sculpted, professional look. The background is clean and uncluttered (often gray or white). The color scheme is often monochromatic or has a simple, desaturated look.'
    },
    {
        id: 'amit-bhadana',
        name: 'Amit Bhadana',
        tags: 'Rural Comedy & Desi',
        creatorStyle: 'Focus on "Desi" or rural/local comedy, using Haryanvi dialect. Thumbnails often depict relatable, funny scenarios from everyday North Indian life. Warm, natural tones.',
        mood: 'Funny, Rooted, Authentic, Relatable',
        imageStyle: 'Naturalistic photo, shot as if in a real village or local setting. The lighting is warm, mimicking natural sunlight. The color palette is earthy and authentic. The focus is on the humorous interaction between characters.'
    },
    {
      id: 'dhruv-rathee',
      name: 'Dhruv Rathee',
      tags: 'Informative & Clean',
      creatorStyle: 'Educational and investigative content. Thumbnails are clean, minimalist, and data-driven, often featuring him alongside graphs, maps, or key journalistic images. The look is serious and credible.',
      mood: 'Serious, Informative, Trustworthy, Investigative',
      imageStyle: 'Clean, professional photo, similar to a news broadcast. The lighting is bright and even. He has a serious, trustworthy expression. The composition includes minimalist graphics, charts, or maps. The color palette is often a clean blue and white.'
    },
    {
      id: 'flying-beast',
      name: 'Flying Beast',
      tags: 'Vlogging & Family',
      creatorStyle: 'Lifestyle and family vlogging with a focus on fitness, travel, and daily life. Thumbnails are warm, authentic, and happy, featuring his family in relatable situations.',
      mood: 'Wholesome, Relatable, Positive, Heartwarming',
      imageStyle: 'Bright, happy photo with natural daylight. The color grade is warm and inviting, enhancing skin tones. The composition is a candid family photo, full of genuine smiles and affection. Shot with a shallow depth of field to create a soft background.'
    },
    {
      id: 'techno-gamerz',
      name: 'Techno Gamerz',
      tags: 'Gaming & Exciting',
      creatorStyle: 'Gameplay-focused content, especially GTA and other story-mode games. Thumbnails are bright, action-packed, and often feature in-game characters or vehicles with his expressive facecam reaction.',
      mood: 'Exciting, Fun, Action-Packed, Mysterious',
      imageStyle: 'Vibrant, high-contrast composite image. The background is a dramatic, action-filled scene from the game. Colors are hyper-saturated. His face is a high-quality cutout with an excited or shocked expression. Bold, glowing text is often used.'
    },
    {
      id: 'harsh-beniwal',
      name: 'Harsh Beniwal',
      tags: 'Comedy & Relatable',
      creatorStyle: 'Character-driven comedy sketches about school/college life, friendships, and family. Thumbnails depict funny, relatable situations with exaggerated yet authentic expressions.',
      mood: 'Humorous, Relatable, "Desi", Youthful',
      imageStyle: 'Naturalistic photo that looks like a scene from the video. The lighting matches the environment (e.g., classroom, home). The color is true-to-life. The main focus is on the funny, exaggerated interactions and expressions of the characters.'
    }
  ],
  indianFemale: [
    {
        id: 'mostly-sane',
        name: 'Prajakta Koli',
        tags: 'Comedy & Relatable',
        creatorStyle: 'Relatable, slice-of-life comedy often featuring everyday settings and characters. Natural lighting and a warm, approachable feel are common. The look is authentic and not overly produced.',
        mood: 'Funny, Relatable, Warm, Charming',
        imageStyle: 'Natural, realistic photo. The lighting is soft and warm, as if from a window. The color grade is true-to-life with a slight warmth. The setting is a typical Indian home. Her expression is expressive and friendly.'
    },
    {
        id: 'shirley-setia',
        name: 'Shirley Setia',
        tags: 'Music & Soft',
        creatorStyle: 'Soft, dreamy, and musical aesthetic. Often features a guitar or microphone. A very pleasant and friendly vibe with a focus on soft, almost ethereal visuals.',
        mood: 'Dreamy, Sweet, Musical, Gentle',
        imageStyle: 'Ethereal photo with soft, diffused backlighting to create a glowing halo effect. The shot has a very shallow depth of field, resulting in a beautifully blurred background with bokeh. The color palette is pastel and warm. Her expression is sweet and gentle.'
    },
    {
        id: 'sejal-kumar',
        name: 'Sejal Kumar',
        tags: 'Fashion & Lifestyle',
        creatorStyle: 'Fashion-forward and aesthetic. Thumbnails look like they could be from a high-end fashion magazine. Poses are confident and stylish. Backgrounds are often clean or urban.',
        mood: 'Fashionable, Confident, Aesthetic, Chic',
        imageStyle: 'Editorial fashion photo. The lighting is high-contrast but flattering, like professional magazine photography. The composition is strong and follows fashion posing conventions. The color grade is modern and can be either desaturated or have a specific artistic tint.'
    },
    {
        id: 'anaysa',
        name: 'Anaysa',
        tags: 'Beauty & DIY',
        creatorStyle: 'Bright, clean, and informative beauty and DIY content. Often features before-and-after shots, product close-ups, and a very clear, instructional layout. Aims to be helpful and trustworthy.',
        mood: 'Helpful, Bright, Clean, Trustworthy',
        imageStyle: 'Bright, high-key photo with even, shadowless lighting from a ring light. The background is clean and white or pastel. Colors are vibrant and pop. The composition is often a split-screen for before/after, with tack-sharp focus.'
    },
    {
      id: 'vidya-vox',
      name: 'Vidya Vox',
      tags: 'Music & Fusion',
      creatorStyle: 'High-production music videos blending Indian and Western styles. Thumbnails are cinematic, colorful, and often set in beautiful, scenic locations, showcasing fashion.',
      mood: 'Artistic, Energetic, Global, Cinematic',
      imageStyle: 'Vibrant, cinematic photo from a music video. The lighting is professional and dramatic, with lens flares. The color grading is rich and saturated. The background is an epic, scenic location. Her pose is dynamic, powerful, and artistic.'
    },
    {
      id: 'kabitas-kitchen',
      name: "Kabita's Kitchen",
      tags: 'Cooking & Simple',
      creatorStyle: 'Simple, homely, and easy-to-follow Indian recipes. Thumbnails are clean, bright, and focus on the delicious final dish. The style is very approachable and makes cooking look easy.',
      mood: 'Appetizing, Homely, Trustworthy, Simple',
      imageStyle: 'Clean, appetizing food photo. The lighting is bright and even, often a flat lay (overhead shot) to clearly show the dish. The focus is tack-sharp on the food\'s texture. The background is simple and uncluttered, and the colors are warm and inviting.'
    },
    {
      id: 'shruti-anand',
      name: 'Shruti Arjun Anand',
      tags: 'Comedy & Beauty',
      creatorStyle: 'A mix of relatable family comedy sketches and practical beauty/DIY content. Thumbnails are bright, expressive, and clearly communicate the video\'s topic, whether it\'s a funny situation or a beauty tip.',
      mood: 'Funny, Helpful, Relatable, Family-Oriented',
      imageStyle: 'Bright, high-key photo. The lighting is even and flattering, often from a softbox or ring light. The colors are vibrant and saturated. Her expression is highly animated for comedy skits or pleasant and clear for beauty videos.'
    },
    {
      id: 'kusha-kapila',
      name: 'Kusha Kapila',
      tags: 'Satire & Comedy',
      creatorStyle: 'Satirical comedy sketches, often playing exaggerated, fashion-conscious characters like "Billi Maasi". Thumbnails are bold, expressive, and have an editorial quality.',
      mood: 'Witty, Sassy, Hilarious, Fashionable',
      imageStyle: 'Polished, editorial-style photo. The lighting is professional studio quality. The composition is clean and focuses on her exaggerated character expression. The color grading is modern and fashion-forward. Often uses bold, well-designed text overlays.'
    },
    {
      id: 'ankita-chhetri',
      name: 'Ankita Chhetri',
      tags: 'Gaming & Lifestyle',
      creatorStyle: 'Gaming streams and lifestyle content with a cool, edgy, and sometimes "e-girl" vibe. Thumbnails often feature her in a gaming setup with neon lights, looking focused or having fun.',
      mood: 'Energetic, Cool, Focused, Edgy',
      imageStyle: 'Moody, high-contrast photo. The lighting is dominated by neon/RGB lights from a gaming setup, creating deep shadows and vibrant colored highlights. Her expression is focused and intense or happy and engaging. The image has a sharp, digital feel.'
    },
    {
      id: 'tanya-khanijow',
      name: 'Tanya Khanijow',
      tags: 'Travel & Adventure',
      creatorStyle: 'Cinematic solo travel vlogs. Thumbnails are beautiful, aspirational, and showcase stunning landscapes with her often in the frame, looking adventurous and happy.',
      mood: 'Adventurous, Inspiring, Beautiful, Free-spirited',
      imageStyle: 'Breathtaking landscape photo with high dynamic range. The lighting is warm and natural, often captured during the golden hour (sunrise/sunset). The color grading is cinematic, enhancing the beauty of the scene. She is composed within the epic landscape (e.g., rule of thirds) with a joyful, candid expression.'
    }
  ]
};

export const POLITICAL_PARTIES: PoliticalParty[] = [
    { id: 'bjp', name: 'BJP', logoPrompt: "a stylized lotus flower symbol", colorScheme: "saffron, green, and white", ideologyPrompt: "nationalism, cultural heritage, and strong economic development" },
    { id: 'congress', name: 'Congress', logoPrompt: "the palm of a hand facing forward", colorScheme: "blue, green, and orange", ideologyPrompt: "secularism, inclusivity, and social welfare for all" },
    { id: 'aap', name: 'AAP', logoPrompt: "a broom symbol", colorScheme: "blue and white", ideologyPrompt: "honesty, anti-corruption, and the empowerment of the common person (Aam Aadmi)" },
    { id: 'tmc', name: 'TMC', logoPrompt: "two flowers with leaves", colorScheme: "green and white", ideologyPrompt: "regional pride, grassroots activism, and the spirit of Bengal" },
    { id: 'dmk', name: 'DMK', logoPrompt: "a rising sun symbol", colorScheme: "black and red", ideologyPrompt: "social justice, Dravidian identity, and regional autonomy" },
    { 
      id: 'independent-india', 
      name: 'Independent (India)', 
      logoPrompt: "the Indian National Flag (the Tiranga) and its elements", 
      colorScheme: "saffron, white, and green", 
      ideologyPrompt: "focus on the individual as a citizen leader, community engagement, patriotism, and direct citizen representation, rather than party politics." 
    },
    { 
      id: 'personal-community', 
      name: 'Personal / Community', 
      logoPrompt: "no specific political logo; instead, use a subtle and modern circular emblem or no logo at all for a clean look", 
      colorScheme: "a neutral, professional, and appealing color scheme like deep blues, greys, and whites",
      ideologyPrompt: "This is for a personal or community announcement, NOT a political campaign. The tone should be professional, celebratory, or informational. Avoid all political symbols, slogans, and imagery. Focus on themes like personal achievement, community events, or professional branding."
    }
];

export const POSTER_STYLES: PosterStyle[] = [
    { id: 'vikas', name: 'Vikas', tags: 'Development & Progress', stylePrompt: 'A clean, modern, and optimistic style. Use bright lighting, images of infrastructure and development, and a hopeful tone. The design should be professional and forward-looking.' },
    { id: 'jan-andolan', name: 'Jan Andolan', tags: 'Movement & Protest', stylePrompt: 'A gritty, high-energy style. Use dynamic angles, high-contrast lighting, and imagery of crowds and protests. The tone should be revolutionary and powerful.' },
    { id: 'garima', name: 'Garima', tags: 'Dignity & Tradition', stylePrompt: 'A respectful and traditional style. Use warm tones, soft lighting, and culturally significant imagery. The design should feel dignified and grounded.' },
    { id: 'yuva-shakti', name: 'Yuva Shakti', tags: 'Youth Power & Modern', stylePrompt: 'A vibrant, trendy, and energetic style. Use bold typography, modern graphics, and bright, saturated colors. The design should appeal to a younger audience and feel dynamic.' },
    { id: 'rashtriya-gaurav', name: 'Rashtriya Gaurav', tags: 'National Pride & Unity', stylePrompt: 'A patriotic and inspiring style. Use imagery of national symbols, the Indian flag, and a tone of unity and pride. The design should be grand and respectful.' },
    { id: 'samriddhi', name: 'Samriddhi', tags: 'Prosperity & Growth', stylePrompt: 'An aspirational style focusing on economic growth and prosperity. Use visuals of flourishing industries, happy families, and upward-trending graphics. Colors should be rich and positive, like gold and green.' },
    { id: 'parivartan', name: 'Parivartan', tags: 'Change & Revolution', stylePrompt: 'A bold, high-impact style that calls for change. Use stark contrasts, powerful imagery, and forward-moving arrows or symbols. The tone is urgent and compelling.' },
    { id: 'ekta', name: 'Ekta', tags: 'Unity & Harmony', stylePrompt: 'A style that promotes unity. Use images of diverse groups of people coming together, holding hands, or celebrating. The color palette should be harmonious and inclusive.' },
    { id: 'suraksha', name: 'Suraksha', tags: 'Security & Strength', stylePrompt: 'A strong, reassuring style emphasizing security and protection. Use bold, stable imagery, strong lines, and a protective color palette like deep blues. The tone is confident and dependable.' },
    { id: 'shakti', name: 'Shakti', tags: 'Strength & Empowerment', stylePrompt: 'An empowering style, often focused on women or marginalized groups. Use powerful, confident poses, strong lighting, and bold colors. The message is one of strength and capability.' },
    { id: 'nyay', name: 'Nyay', tags: 'Justice & Fairness', stylePrompt: 'A balanced and formal style focused on justice. Use symbols of law like scales, and a formal, trustworthy design. The tone should be serious, fair, and authoritative.' },
    { id: 'utsav', name: 'Utsav', tags: 'Festival & Celebration', stylePrompt: 'A vibrant, celebratory style for festivals. Use traditional motifs, bright and auspicious colors, and a joyous atmosphere. Design should feel festive and culturally rich.' },
    { id: 'desh-bhakti', name: 'Desh Bhakti', tags: 'Patriotism & Homage', stylePrompt: 'A grand and respectful style for paying homage on national days. Use solemn, powerful imagery, national colors, and a tone of deep respect and patriotism.' },
    { id: 'shubhkamnayein', name: 'Shubhkamnayein', tags: 'Good Wishes & Greetings', stylePrompt: 'A clean, elegant, and positive style for general greetings. Use soft colors, minimalist design elements, and a warm, heartfelt tone. The design should be pleasant and modern.' }
];

export const POSTER_THEMES: string[] = [
    "General Election Campaign",
    "State Assembly Election",
    "Tribute to a National Leader",
    "Independence Day Greetings",
    "Republic Day Greetings",
    "Party Foundation Day",
    "Youth Rally & Mobilization",
    "Major Policy Announcement",
    "Festival Greetings (Diwali, Eid, etc.)",
    "Local Community Event",
];

export const AD_STYLES: AdStyles = {
    techAndSaaS: [
        { id: 'apple-minimalist', name: "Apple's Minimalist", tags: 'Clean & Premium', stylePrompt: 'A hyper-clean, minimalist aesthetic. Focus on the product against a simple, light-colored background. Use elegant sans-serif fonts, generous white space, and perfect, soft studio lighting. Mood is sophisticated, premium, and calm.' },
        { id: 'microsoft-fluent', name: "Microsoft's Fluent", tags: 'Corporate & Modern', stylePrompt: 'A clean, corporate, and user-centric style. Use soft gradients, rounded corners, and clear iconography. The design should feel modern, accessible, and professional. Lighting is bright and even.' },
        { id: 'slack-vibrant', name: "Slack's Vibrant", tags: 'Colorful & Collaborative', stylePrompt: 'A vibrant and friendly style. Use a bright, playful color palette, custom illustrations, and a collaborative, human-centric tone. The design should feel energetic and approachable.' },
        { id: 'notion-monochrome', name: "Notion's Monochrome", tags: 'Elegant & Focused', stylePrompt: 'A sophisticated, monochrome style with a focus on typography and structure. Uses a black and white palette with occasional subtle accents. The design feels organized, intellectual, and focused.' },
        { id: 'tesla-futuristic', name: "Tesla's Futuristic", tags: 'Sleek & Dark', stylePrompt: 'A futuristic and sleek dark-mode aesthetic. Use dramatic, high-contrast lighting on the product, a dark, often black, background, and a sense of cutting-edge technology. Mood is aspirational and powerful.' }
    ],
    ecommerceAndRetail: [
        { id: 'nike-dynamic', name: "Nike's Dynamic Action", tags: 'Energetic & Inspiring', stylePrompt: 'High-energy, dynamic action shots. Feature the product or model in motion. Use high contrast, gritty textures, and a motivational, empowering tone. Bold, impactful typography is key.' },
        { id: 'glossier-soft', name: "Glossier's Soft & Real", tags: 'Minimal & Authentic', stylePrompt: 'A soft, minimalist, and authentic beauty style. Use natural, dewy lighting, a pastel color palette, and a focus on real, unretouched skin. Mood is approachable, modern, and effortless.' },
        { id: 'gucci-vintage', name: "Gucci's Vintage Luxury", tags: 'Eclectic & High-Fashion', stylePrompt: 'A vintage, eclectic, and high-fashion aesthetic. Use rich, warm color grading reminiscent of 70s film. Compositions are often quirky and artistic. Mood is luxurious, confident, and unconventional.' },
        { id: 'amazon-direct', name: "Amazon's Direct & Clear", tags: 'Simple & Informative', stylePrompt: 'A clean, straightforward style with the product as the hero on a pure white background. The focus is on clarity and providing information. Often includes badges for sales or reviews. Mood is trustworthy and efficient.' },
        { id: 'patagonia-adventure', name: "Patagonia's Adventure", tags: 'Outdoors & Authentic', stylePrompt: 'Authentic, rugged outdoor photography. Feature the product in a stunning natural landscape (mountains, forests). Use natural lighting and an earthy color palette. Mood is adventurous, sustainable, and real.' }
    ],
    foodAndLifestyle: [
        { id: 'starbucks-cozy', name: "Starbucks' Cozy Comfort", tags: 'Warm & Inviting', stylePrompt: 'A warm, cozy, and inviting style. Use soft, warm lighting, rich textures like wood and coffee beans, and a shallow depth of field. The mood is comforting, familiar, and premium.' },
        { id: 'mcdonalds-bold', name: "McDonald's Bold & Graphic", tags: 'Vibrant & Playful', stylePrompt: 'A bold, graphic, and playful style. Use a high-contrast, saturated color palette (especially red and yellow). Food is shot to look perfect and delicious. Mood is fun, fast, and iconic.' },
        { id: 'chobani-fresh', name: "Chobani's Fresh & Natural", tags: 'Bright & Healthy', stylePrompt: 'A bright, clean, and natural style. Use bright, high-key lighting, fresh ingredients as props, and a feeling of health and wellness. The color palette is often white with pops of natural color from fruits.' },
        { id: 'haagen-dazs-indulgent', name: "Häagen-Dazs' Indulgent", tags: 'Luxurious & Decadent', stylePrompt: 'A dark, moody, and luxurious style focused on indulgence. Use dramatic, low-key lighting to highlight rich textures (e.g., melting chocolate). The mood is decadent, sophisticated, and sensual.' },
        { id: 'coca-cola-classic', name: "Coca-Cola's Classic Vibe", tags: 'Nostalgic & Social', stylePrompt: 'A classic, nostalgic style focused on happiness and social connection. Features people enjoying the product together. Lighting is bright and happy. Mood is timeless, joyful, and universal.' }
    ],
    healthAndWellness: [
        { id: 'calm-minimalist', name: "Clean & Calming", tags: 'Minimal & Natural', stylePrompt: 'A clean, minimalist, and calming aesthetic. Use soft, natural lighting, a muted or pastel color palette, and imagery of nature or serene environments. The mood is peaceful, healthy, and trustworthy.' },
        { id: 'active-energetic', name: "Active & Energetic", tags: 'Dynamic & Vibrant', stylePrompt: 'A high-energy and dynamic style. Feature people in motion, engaging in fitness or activities. Use bright, vibrant colors, dynamic camera angles, and a sense of movement. The mood is motivational, strong, and lively.' }
    ],
    travelAndLeisure: [
        { id: 'luxury-travel', name: "Exotic & Luxurious", tags: 'Aspirational & Rich', stylePrompt: 'A rich, luxurious, and aspirational travel style. Use stunning, high-resolution landscape or resort photography. Colors are deep and saturated, lighting is golden and warm. The mood is exclusive, relaxing, and high-end.' },
        { id: 'adventure-travel', name: "Budget & Adventure", tags: 'Authentic & Exciting', stylePrompt: 'An authentic, adventurous, and exciting style. Use candid-style photography of real travel experiences, not just posed shots. Imagery is vibrant and full of life. The mood is adventurous, accessible, and fun.' }
    ],
    financeAndCorporate: [
        { id: 'corporate-trust', name: "Corporate Trust Blue", tags: 'Stable & Professional', stylePrompt: 'A classic, trustworthy corporate style. Use a clean layout with a blue and white color palette. Lighting should be professional and even. The mood is one of stability, security, and professionalism. Ideal for banks and insurance.' },
        { id: 'fintech-innovative', name: "Fintech Dark Mode", tags: 'Modern & Data-Driven', stylePrompt: 'A sleek, modern dark-mode aesthetic. Use glowing data visualizations, neon accents, and a sense of innovation. The design should feel cutting-edge, intelligent, and forward-thinking. Perfect for trading apps and tech startups.' },
        { id: 'wealth-luxury', name: "Wealth Management Gold", tags: 'Elegant & Exclusive', stylePrompt: 'An elegant and luxurious style. Use a sophisticated color palette with gold, black, and cream. Imagery should evoke exclusivity and success. The mood is aspirational, premium, and refined. Suitable for investment firms.' }
    ],
    educationAndELearning: [
        { id: 'academic-clean', name: "Academic & Clean", tags: 'Informative & Trustworthy', stylePrompt: 'A clean, informative, and academic style. Use bright, even lighting, a structured layout, and a professional color palette. The mood is trustworthy, knowledgeable, and credible. Great for universities or formal courses.' },
        { id: 'masterclass-cinematic', name: "MasterClass Cinematic", tags: 'Aspirational & Moody', stylePrompt: 'A highly cinematic and aspirational style. Use dramatic, moody lighting to create a premium feel. The instructor is presented as an expert. The overall mood is high-production, exclusive, and inspiring.' },
        { id: 'elearning-playful', name: "E-learning Playful", tags: 'Bright & Engaging', stylePrompt: 'A bright, colorful, and engaging style for modern e-learning. Use playful illustrations, vibrant colors, and a friendly tone. The design should feel accessible, fun, and motivational. Ideal for language apps or skill platforms.' }
    ],
    realEstateAndProperty: [
        { id: 'realestate-luxury', name: "Luxury Real Estate", tags: 'Bright & Aspirational', stylePrompt: 'A bright, airy, and luxurious style for high-end properties. Use clean lines, minimalist decor, and abundant natural light. The mood is aspirational, elegant, and exclusive.' },
        { id: 'realestate-family', name: "Family Home Comfort", tags: 'Warm & Inviting', stylePrompt: 'A warm, cozy, and family-oriented style. Use soft, warm lighting and showcase happy, candid family moments. The mood is inviting, trustworthy, and emotional. Perfect for suburban homes.' },
        { id: 'realestate-urban', name: "Urban Living", tags: 'Modern & Trendy', stylePrompt: 'A modern, trendy style for urban properties. Feature city views, contemporary design, and a dynamic, energetic vibe. The mood is cool, sophisticated, and connected.' }
    ]
};
