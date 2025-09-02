

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
      creatorStyle: 'High-energy, vibrant colors, exaggerated expressions, and a sense of scale and spectacle. Often features money, explosions, or huge objects.',
      mood: 'Excitement, Surprise, Urgency',
      imageStyle: 'Photorealistic, hyper-saturated, dynamic lighting, wide-angle lens effect.'
    },
    {
      id: 'mkbhd',
      name: 'MKBHD',
      tags: 'Minimalist & Techy',
      creatorStyle: 'Sleek, minimalist, and clean aesthetic. Focus on product photography with clean lines, dark backgrounds, and precise lighting. Often uses matte black and red accents.',
      mood: 'Sophisticated, Professional, Minimalist',
      imageStyle: 'Studio product photography, high-detail, cinematic lighting, shallow depth of field.'
    },
    {
        id: 'casey-neistat',
        name: 'Casey Neistat',
        tags: 'Scrapbook & Authentic',
        creatorStyle: 'Gritty, authentic, scrapbook-style visuals. Often uses handwritten text, doodles, and a slightly desaturated, urban color palette. Focus on storytelling.',
        mood: 'Authentic, Energetic, Raw',
        imageStyle: 'Action shots, natural lighting, high-contrast, often with a cinematic and candid feel.'
    },
    {
      id: 'pewdiepie',
      name: 'PewDiePie',
      tags: 'Meme & Abstract',
      creatorStyle: 'Often chaotic, meme-focused, and surreal. Can range from simple reaction faces to highly edited, bizarre compositions. A slightly distorted, DIY aesthetic.',
      mood: 'Ironic, Comedic, Unpredictable',
      imageStyle: 'Mixed media, sometimes grainy, high-contrast, eclectic and colorful lighting.'
    },
    {
        id: 'ali-abdaal',
        name: 'Ali Abdaal',
        tags: 'Productivity & Clean',
        creatorStyle: 'Clean, bright, and organized. Often features Notion screenshots, book covers, and a light, airy aesthetic. Uses pastel colors and clear iconography.',
        mood: 'Productive, Inspiring, Calm',
        imageStyle: 'Bright and clean lighting, minimalist composition, use of graphics and text overlays.'
    },
    {
        id: 'linus-tech-tips',
        name: 'Linus Tech Tips',
        tags: 'Tech & In-Depth',
        creatorStyle: 'Tech-focused, informative, and often humorous. Features hardware close-ups, custom PC builds, and expressive faces. Orange and black are common brand colors.',
        mood: 'Informative, Enthusiastic, In-Depth',
        imageStyle: 'Studio lighting, sharp focus on components, dynamic angles, expressive portraits.'
    },
    {
        id: 'mark-rober',
        name: 'Mark Rober',
        tags: 'Science & Engineering',
        creatorStyle: 'Fun, educational, and epic science/engineering builds. Features explosions, crazy contraptions, and a sense of wonder. Bright and high-energy visuals.',
        mood: 'Exciting, Educational, Epic',
        imageStyle: 'Action photography, vibrant colors, clear shots of engineering projects, often outdoors.'
    },
    {
        id: 'logan-paul',
        name: 'Logan Paul',
        tags: 'High-Energy & Pop',
        creatorStyle: 'Extremely high-energy, pop-culture-centric style. Bright, often neon, colors and a very polished, almost commercial look. Action poses and dramatic expressions are key.',
        mood: 'Energetic, Bold, Sensational',
        imageStyle: 'Commercial photography look, high-saturation, crisp details, often with motion blur or dramatic lighting effects.'
    },
    {
        id: 'mrwhosetheboss',
        name: 'Mrwhosetheboss',
        tags: 'Tech & Dynamic',
        creatorStyle: 'Dynamic and engaging tech reviews. Often features creative compositions, floating products, and a sense of motion. Clean but visually interesting backgrounds.',
        mood: 'Intriguing, Techy, Polished',
        imageStyle: 'Cinematic, dramatic lighting on products, shallow depth of field, often incorporates glowing lines or abstract tech elements.'
    },
    {
        id: 'dude-perfect',
        name: 'Dude Perfect',
        tags: 'Sports & Action',
        creatorStyle: 'Epic-scale sports and action shots. Wide-angle views, high-speed photography, and a sense of camaraderie and fun. Bright, clean, and family-friendly.',
        mood: 'Epic, Fun, Action-Packed',
        imageStyle: 'High-shutter-speed photography, bright outdoor lighting, vibrant colors, dynamic team poses.'
    }
  ],
  internationalFemale: [
     {
      id: 'emma-chamberlain',
      name: 'Emma Chamberlain',
      tags: 'Vlog & Aesthetic',
      creatorStyle: 'Authentic, candid, and relatable. Often has a vintage or film-like quality. Casual poses, natural lighting, and a focus on everyday moments.',
      mood: 'Relaxed, Authentic, Aesthetic',
      imageStyle: 'Film grain, warm tones, natural lighting, slightly desaturated color palette, candid composition.'
    },
    {
        id: 'ijustine',
        name: 'iJustine',
        tags: 'Tech & Unboxing',
        creatorStyle: 'Bright, cheerful, and enthusiastic tech reviews and unboxings. Clean backgrounds, often featuring Apple products. A very positive and high-energy vibe.',
        mood: 'Enthusiastic, Fun, Techy',
        imageStyle: 'Bright studio lighting, vibrant colors (especially purple), clean product shots, expressive reactions.'
    },
    {
        id: 'lilly-singh',
        name: 'Lilly Singh',
        tags: 'Comedy & Vibrant',
        creatorStyle: 'Bold, colorful, and comedic. Often features character sketches, expressive faces, and vibrant, pop-art inspired backgrounds. High energy and confidence.',
        mood: 'Humorous, Confident, Energetic',
        imageStyle: 'Studio lighting, saturated colors, dynamic poses, often with graphic elements.'
    },
    {
        id: 'pokimane',
        name: 'Pokimane',
        tags: 'Gaming & Streamer',
        creatorStyle: 'Friendly and engaging streamer aesthetic. Often features a gaming setup, cute branding elements, and a warm, inviting atmosphere. Poses are typically friendly and approachable.',
        mood: 'Friendly, Cute, Engaging',
        imageStyle: 'Soft, diffused lighting (like from a ring light), warm color tones, often with a clean or stylized gaming room background.'
    },
    {
        id: 'safiya-nygaard',
        name: 'Safiya Nygaard',
        tags: 'Experimental & Themed',
        creatorStyle: 'Themed and experimental content, often with a slightly gothic or vintage twist. High-concept visuals that match the video\'s experiment. Very polished and well-produced.',
        mood: 'Curious, Theatrical, Polished',
        imageStyle: 'Cinematic and often dramatic lighting, color palettes that match the video\'s theme, high-resolution and detailed shots.'
    },
    {
        id: 'rosanna-pansino',
        name: 'Rosanna Pansino',
        tags: 'Baking & Cute',
        creatorStyle: 'Extremely cute, colorful, and cheerful baking content. Features adorable creations, pastel colors, and a very bright, clean aesthetic.',
        mood: 'Sweet, Cheerful, Whimsical',
        imageStyle: 'Bright and even lighting, high saturation, pastel color palette, clean kitchen background, focus on cute details.'
    }
  ],
   indianMale: [
    {
      id: 'technical-guruji',
      name: 'Technical Guruji',
      tags: 'Tech & Informative',
      creatorStyle: 'Direct-to-camera presentation with the tech product clearly visible. Bright, clean lighting. Often includes brand logos or box art in the background.',
      mood: 'Informative, Trustworthy, Clear',
      imageStyle: 'Bright studio lighting, sharp focus on product, slightly saturated colors.'
    },
    {
        id: 'carryminati',
        name: 'CarryMinati',
        tags: 'Gaming & Expressive',
        creatorStyle: 'Highly expressive and comedic reactions. Often features gaming setups, headphones, and dynamic, colorful backgrounds. Exaggerated facial expressions are key.',
        mood: 'Humorous, Energetic, Relatable',
        imageStyle: 'Dramatic lighting, high contrast, saturated colors, often with a slight fisheye effect to enhance comedy.'
    },
    {
        id: 'bhuvan-bam',
        name: 'BB Ki Vines',
        tags: 'Comedy & Characters',
        creatorStyle: 'Character-driven comedy. Thumbnails often feature multiple characters (played by him) in one frame, showcasing a funny situation. Relatable, middle-class Indian settings.',
        mood: 'Comedic, Story-driven, Relatable',
        imageStyle: 'Naturalistic lighting, composite photography, highly expressive character poses.'
    },
    {
        id: 'ashish-chanchlani',
        name: 'Ashish Chanchlani',
        tags: 'Slapstick & Vibrant',
        creatorStyle: 'Loud, vibrant, and slapstick comedy. Thumbnails are extremely colorful and feature over-the-top expressions and situations. Bold, Hindi text is common.',
        mood: 'Hilarious, Loud, Exaggerated',
        imageStyle: 'Hyper-saturated colors, dramatic wide-angle shots, high-energy compositions.'
    },
    {
        id: 'sandeep-maheshwari',
        name: 'Sandeep Maheshwari',
        tags: 'Motivational & Minimal',
        creatorStyle: 'Minimalist and impactful. Often a powerful portrait shot with a simple, clean background and a single line of inspiring text. Focus is on the expression.',
        mood: 'Inspirational, Calm, Profound',
        imageStyle: 'Professional portrait lighting, clean and uncluttered backgrounds, often monochrome or with a simple color scheme.'
    },
    {
        id: 'amit-bhadana',
        name: 'Amit Bhadana',
        tags: 'Rural Comedy & Desi',
        creatorStyle: 'Focus on "Desi" or rural/local comedy. Thumbnails often depict relatable, funny scenarios from everyday Indian life. Warm, natural tones.',
        mood: 'Funny, Rooted, Authentic',
        imageStyle: 'Natural outdoor lighting, warm color palette, focus on character interaction.'
    },
    {
        id: 'gaurav-chaudhary',
        name: 'Gaurav Chaudhary',
        tags: 'Tech & Lifestyle',
        creatorStyle: 'A blend of high-end tech and luxury lifestyle. Clean, premium aesthetic. Often features luxury cars, high-end gadgets, and a confident pose.',
        mood: 'Aspirational, Premium, Informative',
        imageStyle: 'Crisp, high-end commercial photography look, clean lighting, focus on luxury details.'
    }
  ],
  indianFemale: [
    {
        id: 'mostly-sane',
        name: 'Prajakta Koli',
        tags: 'Comedy & Relatable',
        creatorStyle: 'Relatable, slice-of-life comedy. Often features everyday settings and characters. Natural lighting and a warm, approachable feel are common.',
        mood: 'Funny, Relatable, Warm',
        imageStyle: 'Natural lighting, expressive but not overly exaggerated poses, warm color tones.'
    },
    {
        id: 'shirley-setia',
        name: 'Shirley Setia',
        tags: 'Music & Soft',
        creatorStyle: 'Soft, dreamy, and musical aesthetic. Often features a guitar or microphone. A very pleasant and friendly vibe with a focus on soft visuals.',
        mood: 'Dreamy, Sweet, Musical',
        imageStyle: 'Soft, diffused lighting, often with a bokeh background, pastel or warm color palette.'
    },
    {
        id: 'sejal-kumar',
        name: 'Sejal Kumar',
        tags: 'Fashion & Lifestyle',
        creatorStyle: 'Fashion-forward and aesthetic. Thumbnails look like they could be from a fashion magazine. Poses are confident and stylish. Clean, often urban backgrounds.',
        mood: 'Fashionable, Confident, Aesthetic',
        imageStyle: 'Magazine-style photography, often using natural light creatively, clean compositions.'
    },
    {
        id: 'anaysa',
        name: 'Anaysa',
        tags: 'Beauty & DIY',
        creatorStyle: 'Bright, clean, and informative beauty and DIY content. Often features before-and-after shots, product close-ups, and a very clear, instructional layout.',
        mood: 'Helpful, Bright, Clean',
        imageStyle: 'Bright and even studio lighting, high-key photography, vibrant and clean color palette.'
    }
  ]
};

export const POLITICAL_PARTIES: PoliticalParty[] = [
    { id: 'bjp', name: 'BJP', logoPrompt: "a stylized lotus flower symbol", colorScheme: "saffron, green, and white", ideologyPrompt: "nationalism, cultural heritage, and strong economic development" },
    { id: 'congress', name: 'Congress', logoPrompt: "the palm of a hand facing forward", colorScheme: "blue, green, and orange", ideologyPrompt: "secularism, inclusivity, and social welfare for all" },
    { id: 'aap', name: 'AAP', logoPrompt: "a broom symbol", colorScheme: "blue and white", ideologyPrompt: "honesty, anti-corruption, and the empowerment of the common person (Aam Aadmi)" },
    { id: 'tmc', name: 'TMC', logoPrompt: "two flowers with leaves", colorScheme: "green and white", ideologyPrompt: "regional pride, grassroots activism, and the spirit of Bengal" },
    { id: 'dmk', name: 'DMK', logoPrompt: "a rising sun symbol", colorScheme: "black and red", ideologyPrompt: "social justice, Dravidian identity, and regional autonomy" },
    { id: 'independent-india', name: 'Independent (India)', logoPrompt: "the Indian National Flag (the Tiranga) and its elements", colorScheme: "saffron, white, and green", ideologyPrompt: "national unity, patriotism, and direct citizen representation" },
    { id: 'non-political', name: 'Non-Political', logoPrompt: "no specific political logo; instead, use a subtle and modern circular emblem or no logo at all for a clean look", colorScheme: "a neutral, professional, and appealing color scheme like deep blues, greys, and whites" }
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
    ]
};