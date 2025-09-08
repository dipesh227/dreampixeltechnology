import { CreatorStyle, PoliticalParty, PosterStyle, AdStyle, ProfilePictureStyle, LogoStyle, HeadshotStyle, PassportPhotoStyle, PassportPhotoSize, VisitingCardStyle, EventPosterStyle, NewspaperStyle, AspectRatio, NewspaperLanguage } from '../types';

// --- INLINED DATA FROM /data/*.json FILES ---

const creatorStylesData = {
  "internationalMale": [
    {
      "id": "mrbeast",
      "name": "MrBeast",
      "tags": "Bold & High-Contrast",
      "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/mrbeast.webp",
      "creatorStyle": "Explosive, high-energy spectacle. Thumbnails are meticulously designed to be the most clickable on the platform, using vibrant colors, exaggerated surprised expressions, and a massive sense of scale. Often features stacks of cash, luxury cars, or custom-built massive objects.",
      "mood": "Maximum Excitement, Shock, Urgency, Spectacle",
      "imageStyle": "Ultra-realistic photo, 8k resolution. Shot with a wide-angle lens (14mm) to create dramatic perspective distortion. Lighting is harsh and high-contrast, like a commercial studio setup, with dramatic highlights and deep shadows to make the subject pop. Hyper-saturated color grading with boosted vibrancy. Motion blur and particle effects (sparks, dust) are common."
    },
    {
      "id": "mkbhd",
      "name": "MKBHD",
      "tags": "Minimalist & Techy",
      "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/mkbhd.webp",
      "creatorStyle": "Sleek, minimalist, and premium tech aesthetic. Focus on flawless product photography with clean lines, dark matte backgrounds, and precise lighting that highlights texture and form. The brand colors of matte black and red are paramount.",
      "mood": "Sophisticated, Professional, Minimalist, Premium",
      "imageStyle": "Ultra-realistic studio product photo, 8k. Captured with a 50mm prime lens for a natural perspective. Lighting is soft and diffused, often from a large softbox, creating subtle gradients. Cinematic color grading with deep blacks and a specific red accent (#ff0000). Extremely shallow depth of field to isolate the subject."
    },
    {
        "id": "casey-neistat",
        "name": "Casey Neistat",
        "tags": "Scrapbook & Authentic",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/casey-neistat.webp",
        "creatorStyle": "Gritty, authentic, scrapbook-style visuals that feel raw and in-the-moment. Often uses handwritten text, doodles, and a slightly desaturated, urban color palette. Focus on telling a story with a single image.",
        "mood": "Authentic, Energetic, Raw, Unfiltered",
        "imageStyle": "Realistic photo that looks like a frame from a vlog. Shot with a slight wide-angle lens, featuring natural, often harsh, daylight. High-contrast, slightly desaturated color grade with a bit of film grain to add texture. The composition is often candid and unposed."
    },
    {
      "id": "pewdiepie",
      "name": "PewDiePie",
      "tags": "Meme & Abstract",
      "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/pewdiepie.webp",
      "creatorStyle": "Often chaotic, meme-focused, and surreal. Can range from simple reaction faces to highly edited, bizarre compositions. A slightly distorted, DIY aesthetic that feels intentionally low-fi at times.",
      "mood": "Ironic, Comedic, Unpredictable, Surreal",
      "imageStyle": "Mixed media look, often a composite of a real photo with graphic elements. The photo part is high-contrast, sometimes with a grainy or pixelated texture. Lighting is vibrant and can be mismatched to enhance the chaotic feel. Often uses a fish-eye lens effect for comedic distortion."
    },
    {
        "id": "ali-abdaal",
        "name": "Ali Abdaal",
        "tags": "Productivity & Clean",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/ali-abdaal.webp",
        "creatorStyle": "Clean, bright, and organized aesthetic focused on productivity and learning. Often features screenshots of apps like Notion, book covers, and a light, airy visual style. Uses soft pastel colors and clear iconography.",
        "mood": "Productive, Inspiring, Calm, Organized",
        "imageStyle": "Bright and airy high-key photo. Lighting is even and shadowless, as if from a large window. The composition is minimalist and well-balanced (often rule of thirds). The color palette is light, with pastel accents. The image is sharp and clean with no grain."
    },
    {
        "id": "linus-tech-tips",
        "name": "Linus Tech Tips",
        "tags": "Tech & In-Depth",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/linus-tech-tips.webp",
        "creatorStyle": "Tech-focused, informative, and often humorous. Features hardware close-ups, custom PC builds, and expressive, sometimes goofy, faces. Orange, black, and white are key brand colors.",
        "mood": "Informative, Enthusiastic, In-Depth, Humorous",
        "imageStyle": "Crisp and clean studio photo. Lighting is professional and designed to eliminate glare on tech components. The composition is dynamic, often using diagonal lines. Color grading features a distinct orange and teal look. The focus is tack-sharp on the main subject."
    },
    {
        "id": "mark-rober",
        "name": "Mark Rober",
        "tags": "Science & Engineering",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/mark-rober.webp",
        "creatorStyle": "Fun, educational, and epic science/engineering builds. Features explosions, crazy contraptions, and a sense of wonder. Visuals are bright, high-energy, and clearly showcase the main invention.",
        "mood": "Exciting, Educational, Epic, Awe-Inspiring",
        "imageStyle": "High-speed action photo, captured with a fast shutter speed to freeze motion. Lighting is typically bright, natural outdoor sunlight. Colors are vibrant and saturated to create a fun, family-friendly feel. The composition is wide to capture the scale of the projects."
    },
    {
        "id": "logan-paul",
        "name": "Logan Paul",
        "tags": "High-Energy & Pop",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/logan-paul.webp",
        "creatorStyle": "Extremely high-energy, pop-culture-centric style with a very polished, almost commercial look. Action poses, dramatic expressions, and bright, often neon, colors are key.",
        "mood": "Energetic, Bold, Sensational, Polished",
        "imageStyle": "Ultra-polished commercial photo, 8k resolution. Lighting is dramatic and high-contrast, often using colored gels (like blue and pink). High saturation and crisp details are essential. The composition often includes motion blur or dynamic lines to enhance energy."
    },
    {
        "id": "mrwhosetheboss",
        "name": "Mrwhosetheboss",
        "tags": "Tech & Dynamic",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/mrwhosetheboss.webp",
        "creatorStyle": "Dynamic and engaging tech reviews with a highly cinematic feel. Often features creative compositions, floating products, and a sense of motion. Clean but visually interesting backgrounds are a must.",
        "mood": "Intriguing, Techy, Polished, Cinematic",
        "imageStyle": "Cinematic, moody photo. Lighting is dramatic, often a single key light from the side to create suspense. The background features an extremely shallow depth of field with beautiful bokeh. The color palette is often dark with a single vibrant accent color. May incorporate glowing lines or abstract tech elements."
    },
    {
        "id": "dude-perfect",
        "name": "Dude Perfect",
        "tags": "Sports & Action",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/dude-perfect.webp",
        "creatorStyle": "Epic-scale sports and action shots featuring incredible trick shots. Wide-angle views, high-speed photography, and a sense of camaraderie and fun. Bright, clean, and family-friendly.",
        "mood": "Epic, Fun, Action-Packed, Unbelievable",
        "imageStyle": "Ultra-realistic action photo, captured with a very high shutter speed to freeze the moment. Lighting is bright, sunny outdoor light. Colors are vibrant and clean. The composition is dynamic, often using a low angle to make the action feel larger than life."
    }
  ],
  "internationalFemale": [
     {
      "id": "emma-chamberlain",
      "name": "Emma Chamberlain",
      "tags": "Vlog & Aesthetic",
      "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/emma-chamberlain.webp",
      "creatorStyle": "Authentic, candid, and relatable with a vintage or film-like quality. Casual poses, natural lighting, and a focus on everyday, unpolished moments. Feels personal and diary-like.",
      "mood": "Relaxed, Authentic, Aesthetic, Nostalgic",
      "imageStyle": "Realistic photo that looks shot on 35mm film. Features noticeable film grain, warm tones, and a slightly faded, desaturated color palette. Lighting is soft and natural, often from a window. The composition is unposed and feels like a captured moment."
    },
    {
        "id": "ijustine",
        "name": "iJustine",
        "tags": "Tech & Unboxing",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/ijustine.webp",
        "creatorStyle": "Bright, cheerful, and enthusiastic tech reviews and unboxings. Clean backgrounds, often featuring Apple products. A very positive and high-energy vibe. Purple is a key brand color.",
        "mood": "Enthusiastic, Fun, Techy, Joyful",
        "imageStyle": "Bright, high-key studio photo. The lighting is even and shadowless, creating a clean, commercial look. Colors are vibrant and highly saturated. The composition is centered and clear, with a sharp focus on the product and her excited expression."
    },
    {
        "id": "lilly-singh",
        "name": "Lilly Singh",
        "tags": "Comedy & Vibrant",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/lilly-singh.webp",
        "creatorStyle": "Bold, colorful, and comedic. Often features character sketches, highly expressive faces, and vibrant, pop-art inspired backgrounds. Conveys high energy and confidence.",
        "mood": "Humorous, Confident, Energetic, Bold",
        "imageStyle": "Vibrant studio photo with theatrical, multi-colored lighting (using gels). Colors are hyper-saturated, creating a pop-art feel. The composition is dynamic and posed for comedy. The image is sharp, glossy, and high-resolution."
    },
    {
        "id": "pokimane",
        "name": "Pokimane",
        "tags": "Gaming & Streamer",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/pokimane.webp",
        "creatorStyle": "Friendly and engaging streamer aesthetic. Often features a gaming setup, cute branding elements, and a warm, inviting atmosphere. Poses are typically friendly and approachable.",
        "mood": "Friendly, Cute, Engaging, Cozy",
        "imageStyle": "Soft, diffused photo, lit as if by a large ring light to create a flattering \"beauty\" light. The color tones are warm and inviting. The background is her clean gaming room, softly blurred with a shallow depth of field (bokeh)."
    },
    {
        "id": "safiya-nygaard",
        "name": "Safiya Nygaard",
        "tags": "Experimental & Themed",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/safiya-nygaard.webp",
        "creatorStyle": "Themed and experimental content, often with a slightly gothic or vintage twist. High-concept visuals that match the video's experiment. Very polished and well-produced.",
        "mood": "Curious, Theatrical, Polished, Mysterious",
        "imageStyle": "Cinematic and moody photo. The lighting is dramatic and theme-specific (e.g., deep reds for a spooky video). The color palette is carefully controlled to match the video's theme. The image is high-resolution, with sharp details and a composed, intriguing expression."
    },
    {
      "id": "nikkietutorials",
      "name": "NikkieTutorials",
      "tags": "Makeup & Glam",
      "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/nikkietutorials.webp",
      "creatorStyle": "Ultra-glamorous, high-production beauty content. Thumbnails are flawless close-ups showcasing intricate makeup looks. The style is polished, vibrant, and aspirational, with a focus on perfection.",
      "mood": "Glamorous, Flawless, Artistic, Confident",
      "imageStyle": "A perfect, high-fashion beauty shot, 8k resolution. Lighting is from a ring light or beauty dish, creating a shadowless, flawless look on the skin. The focus is a macro shot on the eyes or lips to showcase the makeup detail. Colors are hyper-saturated and vibrant. The background is often a simple, clean color to make the makeup pop."
    }
  ],
   "indianMale": [
    {
      "id": "technical-guruji",
      "name": "Technical Guruji",
      "tags": "Tech & Informative",
      "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/technical-guruji.webp",
      "creatorStyle": "Direct-to-camera presentation with the tech product clearly and professionally displayed. Bright, clean lighting. Often includes brand logos or box art in the background.",
      "mood": "Informative, Trustworthy, Clear, Professional",
      "imageStyle": "Clean, commercial studio photo. The lighting is bright and even, eliminating all shadows. The focus is tack-sharp on both his face and the product. Colors are true-to-life but slightly saturated. The pose is direct, confident, and trustworthy."
    },
    {
        "id": "carryminati",
        "name": "CarryMinati",
        "tags": "Gaming & Expressive",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/carryminati.webp",
        "creatorStyle": "Highly expressive and comedic reactions, often during gaming or roasts. Features gaming setups, headphones, and dynamic, colorful backgrounds. Exaggerated facial expressions are key.",
        "mood": "Humorous, Energetic, Relatable, Outrageous",
        "imageStyle": "High-contrast photo, often a close-up shot with a wide-angle lens for comedic effect. The lighting is dramatic, with colored RGB lights creating a moody, energetic feel. His expression is highly animated and exaggerated. The background is often dark to make him pop."
    },
    {
        "id": "bhuvan-bam",
        "name": "BB Ki Vines",
        "tags": "Comedy & Characters",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/bhuvan-bam.webp",
        "creatorStyle": "Character-driven comedy. Thumbnails often feature multiple characters (played by him) in one frame, showcasing a funny situation. Relatable, middle-class Indian settings are central.",
        "mood": "Comedic, Story-driven, Relatable, \"Desi\"",
        "imageStyle": "Realistic composite photo. The lighting is naturalistic, mimicking a real Indian home environment. Multiple versions of him in different character costumes are seamlessly blended. The expressions are key to telling the story of the skit."
    },
    {
        "id": "ashish-chanchlani",
        "name": "Ashish Chanchlani",
        "tags": "Slapstick & Vibrant",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/ashish-chanchlani.webp",
        "creatorStyle": "Loud, vibrant, and slapstick comedy. Thumbnails are extremely colorful and feature over-the-top expressions and situations. Bold, Hindi text is a common feature.",
        "mood": "Hilarious, Loud, Exaggerated, Entertaining",
        "imageStyle": "Hyper-saturated photo with vibrant, almost neon colors. A dramatic wide-angle lens is used to create a dynamic, high-energy composition. The lighting is bright and high-contrast. His expression is over-the-top and slapstick."
    },
    {
        "id": "sandeep-maheshwari",
        "name": "Sandeep Maheshwari",
        "tags": "Motivational & Minimal",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/sandeep-maheshwari.webp",
        "creatorStyle": "Minimalist and impactful. Often a powerful portrait shot with a simple, clean background and a single line of inspiring text. The focus is on his calm and profound expression.",
        "mood": "Inspirational, Calm, Profound, Serene",
        "imageStyle": "Professional portrait photo. The lighting is a classic three-point studio setup, creating a sculpted, professional look. The background is clean and uncluttered (often gray or white). The color scheme is often monochromatic or has a simple, desaturated look."
    },
    {
      "id": "dhruv-rathee",
      "name": "Dhruv Rathee",
      "tags": "Informative & Clean",
      "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/dhruv-rathee.webp",
      "creatorStyle": "Educational and investigative content. Thumbnails are clean, minimalist, and data-driven, often featuring him alongside graphs, maps, or key journalistic images. The look is serious and credible.",
      "mood": "Serious, Informative, Trustworthy, Investigative",
      "imageStyle": "Clean, professional photo, similar to a news broadcast. The lighting is bright and even. He has a serious, trustworthy expression. The composition includes minimalist graphics, charts, or maps. The color palette is often a clean blue and white."
    }
  ],
  "indianFemale": [
    {
        "id": "mostly-sane",
        "name": "Prajakta Koli",
        "tags": "Comedy & Relatable",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/mostly-sane.webp",
        "creatorStyle": "Relatable, slice-of-life comedy often featuring everyday settings and characters. Natural lighting and a warm, approachable feel are common. The look is authentic and not overly produced.",
        "mood": "Funny, Relatable, Warm, Charming",
        "imageStyle": "Natural, realistic photo. The lighting is soft and warm, as if from a window. The color grade is true-to-life with a slight warmth. The setting is a typical Indian home. Her expression is expressive and friendly."
    },
    {
        "id": "shirley-setia",
        "name": "Shirley Setia",
        "tags": "Music & Soft",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/shirley-setia.webp",
        "creatorStyle": "Soft, dreamy, and musical aesthetic. Often features a guitar or microphone. A very pleasant and friendly vibe with a focus on soft, almost ethereal visuals.",
        "mood": "Dreamy, Sweet, Musical, Gentle",
        "imageStyle": "Ethereal photo with soft, diffused backlighting to create a glowing halo effect. The shot has a very shallow depth of field, resulting in a beautifully blurred background with bokeh. The color palette is pastel and warm. Her expression is sweet and gentle."
    },
    {
        "id": "sejal-kumar",
        "name": "Sejal Kumar",
        "tags": "Fashion & Lifestyle",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/sejal-kumar.webp",
        "creatorStyle": "Fashion-forward and aesthetic. Thumbnails look like they could be from a high-end fashion magazine. Poses are confident and stylish. Backgrounds are often clean or urban.",
        "mood": "Fashionable, Confident, Aesthetic, Chic",
        "imageStyle": "Editorial fashion photo. The lighting is high-contrast but flattering, like professional magazine photography. The composition is strong and follows fashion posing conventions. The color grade is modern and can be either desaturated or have a specific artistic tint."
    },
    {
        "id": "anaysa",
        "name": "Anaysa",
        "tags": "Beauty & DIY",
        "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/anaysa.webp",
        "creatorStyle": "Bright, clean, and informative beauty and DIY content. Often features before-and-after shots, product close-ups, and a very clear, instructional layout. Aims to be helpful and trustworthy.",
        "mood": "Helpful, Bright, Clean, Trustworthy",
        "imageStyle": "Bright, high-key photo with even, shadowless lighting from a ring light. The background is clean and white or pastel. Colors are vibrant and pop. The composition is often a split-screen for before/after, with tack-sharp focus."
    },
    {
      "id": "vidya-vox",
      "name": "Vidya Vox",
      "tags": "Music & Fusion",
      "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/vidya-vox.webp",
      "creatorStyle": "High-production music videos blending Indian and Western styles. Thumbnails are cinematic, colorful, and often set in beautiful, scenic locations, showcasing fashion.",
      "mood": "Artistic, Energetic, Global, Cinematic",
      "imageStyle": "Vibrant, cinematic photo from a music video. The lighting is professional and dramatic, with lens flares. The color grading is rich and saturated. The background is an epic, scenic location. Her pose is dynamic, powerful, and artistic."
    },
    {
      "id": "kabitas-kitchen",
      "name": "Kabita's Kitchen",
      "tags": "Cooking & Simple",
      "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/creator/kabitas-kitchen.webp",
      "creatorStyle": "Simple, homely, and easy-to-follow Indian recipes. Thumbnails are clean, bright, and focus on the delicious final dish. The style is very approachable and makes cooking look easy.",
      "mood": "Appetizing, Homely, Trustworthy, Simple",
      "imageStyle": "Clean, appetizing food photo. The lighting is bright and even, often a flat lay (overhead shot) to clearly show the dish. The focus is tack-sharp on the food's texture. The background is simple and uncluttered, and the colors are warm and inviting."
    }
  ]
};

const adStylesData = {
    "techAndSaaS": [
        { "id": "apple-minimalist", "name": "Apple's Minimalist", "tags": "Clean & Premium", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/apple-minimalist.webp", "stylePrompt": "A hyper-clean, minimalist aesthetic. Focus on the product against a simple, light-colored background. Use elegant sans-serif fonts, generous white space, and perfect, soft studio lighting. Mood is sophisticated, premium, and calm." },
        { "id": "microsoft-fluent", "name": "Microsoft's Fluent", "tags": "Corporate & Modern", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/microsoft-fluent.webp", "stylePrompt": "A clean, corporate, and user-centric style. Use soft gradients, rounded corners, and clear iconography. The design should feel modern, accessible, and professional. Lighting is bright and even." },
        { "id": "slack-vibrant", "name": "Slack's Vibrant", "tags": "Colorful & Collaborative", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/slack-vibrant.webp", "stylePrompt": "A vibrant and friendly style. Use a bright, playful color palette, custom illustrations, and a collaborative, human-centric tone. The design should feel energetic and approachable." },
        { "id": "notion-monochrome", "name": "Notion's Monochrome", "tags": "Elegant & Focused", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/notion-monochrome.webp", "stylePrompt": "A sophisticated, monochrome style with a focus on typography and structure. Uses a black and white palette with occasional subtle accents. The design feels organized, intellectual, and focused." },
        { "id": "tesla-futuristic", "name": "Tesla's Futuristic", "tags": "Sleek & Dark", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/tesla-futuristic.webp", "stylePrompt": "A futuristic and sleek dark-mode aesthetic. Use dramatic, high-contrast lighting on the product, a dark, often black, background, and a sense of cutting-edge technology. Mood is aspirational and powerful." }
    ],
    "ecommerceAndRetail": [
        { "id": "nike-dynamic", "name": "Nike's Dynamic Action", "tags": "Energetic & Inspiring", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/nike-dynamic.webp", "stylePrompt": "High-energy, dynamic action shots. Feature the product or model in motion. Use high contrast, gritty textures, and a motivational, empowering tone. Bold, impactful typography is key." },
        { "id": "glossier-soft", "name": "Glossier's Soft & Real", "tags": "Minimal & Authentic", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/glossier-soft.webp", "stylePrompt": "A soft, minimalist, and authentic beauty style. Use natural, dewy lighting, a pastel color palette, and a focus on real, unretouched skin. Mood is approachable, modern, and effortless." },
        { "id": "gucci-vintage", "name": "Gucci's Vintage Luxury", "tags": "Eclectic & High-Fashion", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/gucci-vintage.webp", "stylePrompt": "A vintage, eclectic, and high-fashion aesthetic. Use rich, warm color grading reminiscent of 70s film. Compositions are often quirky and artistic. Mood is luxurious, confident, and unconventional." },
        { "id": "amazon-direct", "name": "Amazon's Direct & Clear", "tags": "Simple & Informative", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/amazon-direct.webp", "stylePrompt": "A clean, straightforward style with the product as the hero on a pure white background. The focus is on clarity and providing information. Often includes badges for sales or reviews. Mood is trustworthy and efficient." },
        { "id": "patagonia-adventure", "name": "Patagonia's Adventure", "tags": "Outdoors & Authentic", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/patagonia-adventure.webp", "stylePrompt": "Authentic, rugged outdoor photography. Feature the product in a stunning natural landscape (mountains, forests). Use natural lighting and an earthy color palette. Mood is adventurous, sustainable, and real." }
    ],
    "indianFestiveAndCraft": [
        { "id": "diwali-sale", "name": "Diwali Sale", "tags": "Festive, Vibrant, Gold", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/diwali-sale.webp", "stylePrompt": "A vibrant, festive style for Diwali. Use deep, rich colors like maroon, gold, and royal blue. Incorporate traditional Indian motifs like diyas (oil lamps), rangoli patterns, and subtle sparkles. The mood is celebratory, prosperous, and warm." },
        { "id": "holi-celebration", "name": "Holi Celebration", "tags": "Colorful, Joyful, Energetic", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/holi-celebration.webp", "stylePrompt": "An explosive, colorful style for Holi. Use a bright, powder-paint inspired color palette (pinks, blues, yellows, greens) on a clean white background. The mood is energetic, playful, and joyful." },
        { "id": "eid-mubarak", "name": "Eid Mubarak", "tags": "Elegant, Serene, Green", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/eid-mubarak.webp", "stylePrompt": "An elegant and serene style for Eid. Use a sophisticated color palette of greens, golds, and creams. Incorporate Islamic geometric patterns, crescent moons, and stars. The mood is graceful, blessed, and celebratory." },
        { "id": "handicraft-showcase", "name": "Handicraft Showcase", "tags": "Artisanal, Rustic", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/handicraft-showcase.webp", "stylePrompt": "An earthy, authentic style to showcase handcrafted items. Use natural textures like wood, jute, or handmade paper as a background. Lighting should be soft and natural to highlight the product's texture and craftsmanship. The mood is artisanal, rustic, and premium." },
        { "id": "royal-indian-wedding", "name": "Royal Indian Wedding", "tags": "Luxury, Opulent", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/royal-indian-wedding.webp", "stylePrompt": "A luxurious and opulent style for wedding-related products. Use rich jewel tones, intricate damask or brocade patterns, and elements like marigold flowers. The mood is grand, traditional, and celebratory." },
        { "id": "modern-indian-aesthetic", "name": "Modern Indian Aesthetic", "tags": "Chic, Minimalist", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/modern-indian-aesthetic.webp", "stylePrompt": "A clean, modern style that blends minimalism with Indian elements. Use a bright, airy color palette with pops of a single vibrant Indian color (like Rani pink or Saffron). Incorporate a single, subtle traditional motif. The mood is chic, contemporary, and rooted." }
    ],
    "foodAndLifestyle": [
        { "id": "starbucks-cozy", "name": "Starbucks' Cozy Comfort", "tags": "Warm & Inviting", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/starbucks-cozy.webp", "stylePrompt": "A warm, cozy, and inviting style. Use soft, warm lighting, rich textures like wood and coffee beans, and a shallow depth of field. The mood is comforting, familiar, and premium." },
        { "id": "mcdonalds-bold", "name": "McDonald's Bold & Graphic", "tags": "Vibrant & Playful", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/mcdonalds-bold.webp", "stylePrompt": "A bold, graphic, and playful style. Use a high-contrast, saturated color palette (especially red and yellow). Food is shot to look perfect and delicious. Mood is fun, fast, and iconic." },
        { "id": "chobani-fresh", "name": "Chobani's Fresh & Natural", "tags": "Bright & Healthy", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/chobani-fresh.webp", "stylePrompt": "A bright, clean, and natural style. Use bright, high-key lighting, fresh ingredients as props, and a feeling of health and wellness. The color palette is often white with pops of natural color from fruits." },
        { "id": "haagen-dazs-indulgent", "name": "Häagen-Dazs' Indulgent", "tags": "Luxurious & Decadent", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/haagen-dazs-indulgent.webp", "stylePrompt": "A dark, moody, and luxurious style focused on indulgence. Use dramatic, low-key lighting to highlight rich textures (e.g., melting chocolate). The mood is decadent, sophisticated, and sensual." },
        { "id": "coca-cola-classic", "name": "Coca-Cola's Classic Vibe", "tags": "Nostalgic & Social", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/ads/coca-cola-classic.webp", "stylePrompt": "A classic, nostalgic style focused on happiness and social connection. Features people enjoying the product together. Lighting is bright and happy. Mood is timeless, joyful, and universal." }
    ]
};

const profilePictureStylesData = {
    "professional": [
        { "id": "male-corporate-headshot", "name": "Corporate Headshot", "tags": "LinkedIn, Business", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/profile/male-corporate-headshot.webp", "stylePrompt": "A classic, professional corporate headshot. The man is wearing a sharp, dark business suit with a light-colored dress shirt. He has a confident, approachable smile. The background is a modern, softly blurred office interior. Lighting is a clean, three-point studio setup that is flattering and professional." },
        { "id": "female-corporate-headshot", "name": "Corporate Headshot", "tags": "LinkedIn, Business", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/profile/female-corporate-headshot.webp", "stylePrompt": "A classic, professional corporate headshot. The woman is wearing a tailored blazer and professional attire. She has a confident, warm smile. The background is a bright, softly blurred modern office. Lighting is soft and flattering, often from a large softbox to create a clean, approachable look." },
        { "id": "male-tech-startup", "name": "Tech Startup", "tags": "Modern, Confident", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/profile/male-tech-startup.webp", "stylePrompt": "A modern and confident headshot suitable for a tech entrepreneur. The man is wearing a smart-casual outfit (e.g., a high-quality t-shirt under a blazer). The background is a clean, minimalist setting, perhaps against a concrete or brick wall. Lighting is high-contrast and slightly dramatic." },
        { "id": "female-elegant-minimalist", "name": "Elegant Minimalist", "tags": "Clean, Sophisticated", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/profile/female-elegant-minimalist.webp", "stylePrompt": "A sophisticated and minimalist portrait. The woman has a simple, elegant look. The background is a solid, neutral color like light gray or beige. The lighting is soft and even. The overall mood is calm, confident, and high-end." }
    ],
    "creativeAndCasual": [
        { "id": "male-outdoor-candid", "name": "Outdoor Candid", "tags": "Casual, Natural", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/profile/male-outdoor-candid.webp", "stylePrompt": "A candid, natural-light portrait of a man outdoors. He is dressed in casual, stylish clothing like a sweater or jacket. The background is a scenic park or urban street with beautiful bokeh. The lighting is warm, golden-hour sunlight, creating a friendly and authentic feel." },
        { "id": "female-lifestyle-blogger", "name": "Lifestyle Blogger", "tags": "Warm, Authentic", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/profile/female-lifestyle-blogger.webp", "stylePrompt": "A warm and authentic lifestyle portrait. The woman is dressed in fashionable, casual clothing. The setting could be a chic cafe or a beautifully decorated home interior, with a shallow depth of field. The lighting is soft, natural window light, creating a bright and airy feel." },
        { "id": "male-creative-studio", "name": "Creative Studio", "tags": "Artistic, Moody", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/profile/male-creative-studio.webp", "stylePrompt": "An artistic, moody portrait of a creative professional. He might be a photographer, designer, or artist. The lighting is low-key and dramatic, with strong shadows. The background is a dark, textured studio environment. His expression is thoughtful and intense." },
        { "id": "female-creative-bold", "name": "Creative & Bold", "tags": "Artistic, Colorful", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/profile/female-creative-bold.webp", "stylePrompt": "A bold and creative portrait. The woman wears unique, artistic fashion and might have bold makeup. The background is vibrant and colorful, possibly a solid bright color or an interesting texture. Lighting is high-contrast and fashion-oriented." },
        { "id": "male-vibrant-avatar", "name": "Vibrant Avatar", "tags": "Gaming, Social", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/profile/male-vibrant-avatar.webp", "stylePrompt": "A hyper-vibrant, stylized avatar. The portrait has a colorful, graphic background with neon or abstract elements. The lighting on the man is high-energy, possibly with colored gels. His expression is energetic and engaging, perfect for a gaming or social media profile." },
        { "id": "female-cozy-natural", "name": "Cozy & Natural", "tags": "Casual, Relatable", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/profile/female-cozy-natural.webp", "stylePrompt": "A cozy and natural portrait. The woman is wearing comfortable clothing like a knit sweater. The background is a warm, inviting indoor space. The lighting is soft and warm, perhaps from a nearby lamp or window, creating a relatable and down-to-earth feeling." }
    ]
};

const logoStylesData = {
    "general": [
        { "id": "logo-minimalist-geometric", "name": "Geometric Minimalist", "tags": "Modern, Clean, Abstract", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/logo/minimalist-geometric.webp", "stylePrompt": "A clean, minimalist logo using basic geometric shapes (circles, squares, triangles). The design is abstract and symmetrical, conveying balance and modernity. Use a limited color palette of 2-3 colors on a solid white background. Flat vector graphic style." },
        { "id": "logo-vintage-emblem", "name": "Vintage Emblem", "tags": "Classic, Badge, Detailed", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/logo/vintage-emblem.webp", "stylePrompt": "A classic emblem or badge logo with a vintage, handcrafted feel. Often circular, it incorporates the company name in an elegant serif or script font. May include subtle line art illustrations like wreaths or banners. The style is detailed but clean. Monochrome or two-tone color scheme. Vector graphic on a solid background." },
        { "id": "logo-modern-lettermark", "name": "Modern Lettermark", "tags": "Monogram, Typography", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/logo/modern-lettermark.webp", "stylePrompt": "A strong, modern lettermark (monogram) logo focusing on the company initials. The typography is custom, bold, and clean (sans-serif). The letters might be cleverly interconnected or have unique negative space elements. Single color on a solid white background. Vector graphic style." },
        { "id": "logo-playful-mascot", "name": "Playful Mascot", "tags": "Character, Fun, Friendly", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/logo/playful-mascot.webp", "stylePrompt": "A friendly and playful character mascot logo. The character should be simple, memorable, and expressive. The style is a clean, modern cartoon with bold outlines and flat colors. The company name is integrated below or beside the mascot in a fun, rounded font. Vector illustration on a solid background." },
        { "id": "logo-organic-hand-drawn", "name": "Organic Hand-Drawn", "tags": "Natural, Rustic", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/logo/organic-hand-drawn.webp", "stylePrompt": "An organic, hand-drawn logo that feels rustic and authentic. Features natural elements like leaves, branches, or imperfect, flowing lines. The typography is a script or a soft serif font that looks hand-lettered. Perfect for natural products or boutique brands. Single color on a solid background. Vector graphic." },
        { "id": "logo-tech-gradient", "name": "Tech Gradient", "tags": "SaaS, Digital, Vibrant", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/logo/tech-gradient.webp", "stylePrompt": "A vibrant, modern logo for a tech company or app. It features an abstract shape or a stylized initial created with a smooth, bright color gradient (e.g., blue to purple, pink to orange). The font for the company name is a clean, geometric sans-serif. Vector graphic on a dark or white background." },
        { "id": "logo-luxury-serif", "name": "Luxury Serif", "tags": "Elegant, Fashion", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/logo/luxury-serif.webp", "stylePrompt": "An elegant and luxurious wordmark logo. The entire focus is on the company name, typeset in a beautiful, high-contrast serif font with perfect kerning. The style is timeless and sophisticated. Typically black, white, or a metallic color like gold. Vector graphic on a solid background." },
        { "id": "logo-abstract-mark", "name": "Abstract Mark", "tags": "Conceptual, Unique", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/logo/abstract-mark.webp", "stylePrompt": "A unique and memorable abstract logo mark. The shape is non-representational but is designed to conceptually represent the brand's values (e.g., movement, connection, growth). The design is simple enough to be recognizable at any size. Paired with a clean sans-serif wordmark. Vector graphic on a solid background." },
        { "id": "logo-negative-space", "name": "Negative Space", "tags": "Clever, Smart", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/logo/negative-space.webp", "stylePrompt": "A clever logo that uses negative space to create a dual image or reveal a hidden symbol. The design is minimalist and intelligent. For example, a letterform that contains the silhouette of an object in its counter-space. Typically single color to emphasize the effect. Flat vector graphic on a solid background." },
        { "id": "logo-foodie", "name": "Foodie", "tags": "Restaurant, Cafe", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/logo/foodie.webp", "stylePrompt": "A charming and appetizing logo for a restaurant or food brand. Often incorporates illustrations of food items or utensils in a clean, modern style. The typography is friendly and legible. The color palette is warm and inviting. Vector graphic." }
    ]
};

const politicalPartiesData = [
    { "id": "bjp", "name": "BJP", "logoPrompt": "a stylized lotus flower symbol", "colorScheme": "saffron, green, and white", "ideologyPrompt": "nationalism, cultural heritage, and strong economic development" },
    { "id": "congress", "name": "Congress", "logoPrompt": "the palm of a hand facing forward", "colorScheme": "blue, green, and orange", "ideologyPrompt": "secularism, inclusivity, and social welfare for all" },
    { "id": "aap", "name": "AAP", "logoPrompt": "a broom symbol", "colorScheme": "blue and white", "ideologyPrompt": "honesty, anti-corruption, and the empowerment of the common person (Aam Aadmi)" },
    { "id": "tmc", "name": "TMC", "logoPrompt": "two flowers with leaves", "colorScheme": "green and white", "ideologyPrompt": "regional pride, grassroots activism, and the spirit of Bengal" },
    { "id": "dmk", "name": "DMK", "logoPrompt": "a rising sun symbol", "colorScheme": "black and red", "ideologyPrompt": "social justice, Dravidian identity, and regional autonomy" },
    { "id": "independent-india", "name": "Independent (India)", "logoPrompt": "the Indian National Flag (the Tiranga) and its elements", "colorScheme": "saffron, white, and green", "ideologyPrompt": "focus on the individual as a citizen leader, community engagement, patriotism, and direct citizen representation, rather than party politics." },
    { "id": "personal-community", "name": "Personal / Community", "logoPrompt": "no specific political logo; instead, use a subtle and modern circular emblem or no logo at all for a clean look", "colorScheme": "a neutral, professional, and appealing color scheme like deep blues, greys, and whites", "ideologyPrompt": "This is for a personal or community announcement, NOT a political campaign. The tone should be professional, celebratory, or informational. Avoid all political symbols, slogans, and imagery. Focus on themes like personal achievement, community events, or professional branding." }
];

const posterStylesData = [
    { "id": "vikas", "name": "Vikas", "tags": "Development & Progress", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/poster/vikas.webp", "stylePrompt": "A clean, modern, and optimistic style. Use bright lighting, images of infrastructure and development, and a hopeful tone. The design should be professional and forward-looking." },
    { "id": "jan-andolan", "name": "Jan Andolan", "tags": "Movement & Protest", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/poster/jan-andolan.webp", "stylePrompt": "A gritty, high-contrast, and impactful style. Use imagery of crowds and activism. The typography should be bold and stencil-like. The mood is urgent and revolutionary." },
    { "id": "yuva-shakti", "name": "Yuva Shakti", "tags": "Youth & Energy", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/poster/yuva-shakti.webp", "stylePrompt": "A vibrant, energetic, and modern style targeting the youth. Use dynamic layouts, bright colors, and images of young, aspirational people. The typography is trendy and bold." },
    { "id": "parivartan", "name": "Parivartan", "tags": "Change & Hope", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/poster/parivartan.webp", "stylePrompt": "A hopeful and emotional style focused on change. Use imagery of sunrises, open hands, and diverse groups of people. The color palette is often light and optimistic. The typography is clean and inspiring." },
    { "id": "garib-kalyan", "name": "Garib Kalyan", "tags": "Welfare & Empathy", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/poster/garib-kalyan.webp", "stylePrompt": "An empathetic and grounded style focused on social welfare. Use authentic, emotional portraits of common people. The color palette is earthy and warm. The mood is one of care, support, and empathy." },
    { "id": "raksha", "name": "Raksha", "tags": "Security & Strength", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/poster/raksha.webp", "stylePrompt": "A strong, patriotic, and bold style focused on national security. Use imagery of the military, national symbols, and strong leaders. The colors are often derived from the national flag. The typography is bold and authoritative." },
    { "id": "classic-propaganda", "name": "Classic Propaganda", "tags": "Vintage & Bold", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/poster/classic-propaganda.webp", "stylePrompt": "A vintage propaganda poster style, reminiscent of old political art. Use bold, graphic illustrations, limited color palettes (e.g., red, black, beige), and strong, commanding typography. The mood is powerful and nostalgic." }
];

const posterThemesData = [
    "General Election Campaign", "State Assembly Election", "Tribute to a National Leader", "Independence Day Greetings", "Republic Day Greetings", "Party Foundation Day", "Youth Rally & Mobilization", "Major Policy Announcement", "Festival Greetings (Diwali, Eid, etc.)", "Local Community Event"
];

const headshotStylesData = [
    { "id": "headshot-corporate", "name": "Corporate", "tags": "LinkedIn, Business", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/headshot/corporate.webp", "stylePrompt": "A professional corporate headshot. The subject wears a sharp business suit. The background is a modern, softly blurred office interior. Lighting is a clean three-point studio setup, creating a confident and approachable look." },
    { "id": "headshot-creative", "name": "Creative", "tags": "Portfolio, Arts", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/headshot/creative.webp", "stylePrompt": "An artistic, moody portrait. The lighting is dramatic and low-key (Rembrandt lighting). The background is a dark, textured studio environment. The expression is thoughtful and intense. Clothing is stylish and creative." },
    { "id": "headshot-casual", "name": "Outdoor/Casual", "tags": "Social Media", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/headshot/casual.webp", "stylePrompt": "A candid, natural-light portrait outdoors. The subject is dressed in stylish, casual clothing. The background is a scenic park with beautiful bokeh. Lighting is warm, golden-hour sunlight for a friendly and authentic feel." },
    { "id": "headshot-minimalist", "name": "Minimalist", "tags": "Modern, Clean", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/headshot/minimalist.webp", "stylePrompt": "A sophisticated and minimalist portrait. The background is a solid, neutral color like light gray or beige. The lighting is soft and even. The overall mood is calm, confident, and high-end. Clothing is simple and elegant." },
    { "id": "headshot-dramatic", "name": "Dramatic", "tags": "Actor, Performer", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/headshot/dramatic.webp", "stylePrompt": "A high-contrast, black and white headshot. The lighting is dramatic, creating strong shadows that define facial features. The expression is intense and captivating. The background is solid black." }
];

const passportPhotoSizesData = [
    { "id": "in-passport", "name": "Indian Passport", "widthMM": 35, "heightMM": 45, "description": "3.5 x 4.5 cm" },
    { "id": "in-visa", "name": "Indian Visa", "widthMM": 51, "heightMM": 51, "description": "2 x 2 inch" },
    { "id": "upsc", "name": "UPSC Exam", "widthMM": 35, "heightMM": 45, "description": "3.5 x 4.5 cm" },
    { "id": "ssc", "name": "SSC Exam", "widthMM": 35, "heightMM": 45, "description": "3.5 x 4.5 cm" }
];

const passportPhotoStylesData = [
    { "id": "male-black-suit", "name": "Man: Black Suit", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/passport/male-black-suit.webp", "outfitPrompt": "a man wearing a professional black business suit, white dress shirt, and a simple dark tie." },
    { "id": "male-navy-suit", "name": "Man: Navy Suit", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/passport/male-navy-suit.webp", "outfitPrompt": "a man wearing a professional navy blue business suit, white dress shirt, and a simple blue tie." },
    { "id": "male-grey-suit", "name": "Man: Grey Suit", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/passport/male-grey-suit.webp", "outfitPrompt": "a man wearing a professional charcoal grey business suit, white dress shirt, and a simple grey tie." },
    { "id": "female-black-suit", "name": "Woman: Black Suit", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/passport/female-black-suit.webp", "outfitPrompt": "a woman wearing a professional black business suit jacket over a simple white blouse." },
    { "id": "female-saree-formal", "name": "Woman: Formal Saree", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/passport/female-saree-formal.webp", "outfitPrompt": "a woman wearing a simple and elegant formal saree in a solid, neutral color like beige or light grey." },
    { "id": "female-kurti-white", "name": "Woman: White Kurti", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/passport/female-kurti-white.webp", "outfitPrompt": "a woman wearing a simple and professional white formal kurti." }
];

const visitingCardStylesData = [
    { "id": "vc-minimalist", "name": "Minimalist", "tags": "Clean, Modern", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/visiting-card/minimalist.webp", "stylePrompt": "A clean, minimalist design with lots of white space. Uses a modern sans-serif font like Helvetica or Inter. The layout is simple and balanced. The color palette is monochrome or uses one subtle accent color." },
    { "id": "vc-corporate", "name": "Corporate", "tags": "Professional", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/visiting-card/corporate.webp", "stylePrompt": "A professional and traditional corporate design. Uses a classic serif or sans-serif font like Times New Roman or Arial. The layout is structured and grid-based. The color palette is typically blue, grey, and white, conveying stability." },
    { "id": "vc-creative", "name": "Creative", "tags": "Bold, Artistic", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/visiting-card/creative.webp", "stylePrompt": "A bold, artistic, and unconventional design. Uses unique typography, possibly a script or display font. The layout is asymmetrical and dynamic. The color palette is vibrant and uses bold color combinations." },
    { "id": "vc-luxury", "name": "Luxury", "tags": "Elegant, Premium", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/visiting-card/luxury.webp", "stylePrompt": "An elegant and luxurious design. Uses a sophisticated serif font and may incorporate a monogram. The design might feature high-quality textures like marble or linen. The color palette includes rich colors like black, gold, silver, or deep jewel tones." }
];

const eventPosterStylesData = [
    { "id": "ep-modern", "name": "Modern & Clean", "tags": "Sleek, Minimal", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/event-poster/modern.webp", "stylePrompt": "Use a clean, bold sans-serif font. The text should be placed with a clear hierarchy and generous spacing. The overall effect should be modern, sleek, and highly legible." },
    { "id": "ep-grunge", "name": "Grunge & Edgy", "tags": "Urban, Textured", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/event-poster/grunge.webp", "stylePrompt": "Use a distressed, textured, or stencil font. The text can be overlaid with a gritty texture. The colors should be high-contrast and slightly desaturated. The layout can be chaotic and energetic." },
    { "id": "ep-corporate", "name": "Corporate & Formal", "tags": "Professional, Elegant", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/event-poster/corporate.webp", "stylePrompt": "Use a classic serif or a clean sans-serif font. The text layout should be structured and professional. The color palette should be conservative, such as blues, greys, and whites. Add a subtle drop shadow for readability." },
    { "id": "ep-festive", "name": "Festive & Fun", "tags": "Playful, Colorful", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/event-poster/festive.webp", "stylePrompt": "Use a playful, rounded, or script font. The text should be vibrant and can have a slight glow or outline. The layout should be fun and dynamic, possibly with text at an angle. Use bright, cheerful colors." }
];

const newspaperStylesData = {
    "indian": [
      { "id": "hindi-broadsheet", "name": "Classic Hindi Broadsheet", "tags": "Formal, Devanagari", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/newspaper/hindi-broadsheet.webp", "stylePrompt": "A classic, formal Hindi broadsheet newspaper style. The paper is slightly off-white and textured. Use a classic Devanagari serif font for headlines and body. The photo should be converted to a grainy, high-contrast black and white with a visible halftone pattern." },
      { "id": "english-indian-daily", "name": "Modern Indian Daily (English)", "tags": "Clean, Professional", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/newspaper/english-indian-daily.webp", "stylePrompt": "A clean, modern Indian daily newspaper style in English. The layout is professional and grid-based, similar to the Times of India. Use a mix of serif (for body) and sans-serif (for headlines) fonts. The photo should be in full, crisp color." },
      { "id": "marathi-local", "name": "Marathi Local Paper", "tags": "Regional, Vibrant", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/newspaper/marathi-local.webp", "stylePrompt": "A vibrant Marathi local newspaper style. Use bold Devanagari fonts. The layout can be dense and energetic. The paper is standard newsprint. The photo is in color, but with slightly boosted saturation typical of regional papers." },
      { "id": "punjabi-bold", "name": "Bold Punjabi Tabloid", "tags": "Impactful, Gurmukhi", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/newspaper/punjabi-bold.webp", "stylePrompt": "A bold, impactful Punjabi tabloid style. Use large, heavy Gurmukhi fonts for the headline. The paper is white and clean. The photo is a prominent, full-color image." },
      { "id": "tamil-weekly", "name": "Tamil Weekly Magazine", "tags": "Glossy, Colorful", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/newspaper/tamil-weekly.webp", "stylePrompt": "A glossy, colorful Tamil weekly magazine or newspaper style. The paper is brighter and of higher quality. Use stylish Tamil fonts. The photo is a high-quality, vibrant color photograph." },
    ],
    "international": [
      { "id": "us-broadsheet", "name": "Classic American Broadsheet", "tags": "Vintage, NYT-style", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/newspaper/us-broadsheet.webp", "stylePrompt": "A classic American broadsheet newspaper from the 1940s-50s. The paper is aged, yellowed, with a visible texture. Use a classic serif font like Times New Roman or Bodoni. The photo must be a grainy black and white with a clear halftone dot pattern." },
      { "id": "uk-tabloid", "name": "British Red-Top Tabloid", "tags": "Sensational, Bold", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/newspaper/uk-tabloid.webp", "stylePrompt": "A sensational, modern British red-top tabloid style. Use huge, bold, sans-serif fonts for a shocking headline. The layout is chaotic and loud. The photo is a slightly paparazzi-style, full-color, and dramatic image." },
      { "id": "french-le-monde", "name": "French Le Monde Style", "tags": "Elegant, Minimalist", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/newspaper/french-le-monde.webp", "stylePrompt": "An elegant, minimalist, and intellectual newspaper style like Le Monde. Use a sophisticated serif font. The layout is clean, with lots of white space. The photo is a beautifully composed, often moody, black and white photograph." },
      { "id": "japanese-daily", "name": "Japanese Daily", "tags": "Dense, Vertical Text", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/newspaper/japanese-daily.webp", "stylePrompt": "A traditional Japanese newspaper style. The layout is dense with a mix of horizontal and vertical text using Japanese characters (Kanji, Hiragana). The paper is standard newsprint. The photo is a clean, standard color news photo." },
      { "id": "soviet-propaganda", "name": "Soviet Propaganda Paper", "tags": "Constructivist, Red", "imageUrl": "https://storage.googleapis.com/dreampixel-assets/styles/newspaper/soviet-propaganda.webp", "stylePrompt": "A Soviet-era propaganda newspaper like 'Pravda'. Use bold, constructivist typography (often Cyrillic-style fonts). The color palette is limited to red, black, and the aged paper color. The photo should be a heroic, heavily contrasted black and white image." }
    ]
  };

const newspaperLanguagesData = [
    { id: 'english', name: 'English' }, { id: 'hindi', name: 'Hindi (हिन्दी)' }, { id: 'marathi', name: 'Marathi (मराठी)' }, { id: 'punjabi', name: 'Punjabi (ਪੰਜਾਬੀ)' }, { id: 'tamil', name: 'Tamil (தமிழ்)' }, { id: 'spanish', name: 'Spanish (Español)' }, { id: 'french', name: 'French (Français)' }, { id: 'german', name: 'German (Deutsch)' }, { id: 'japanese', name: 'Japanese (日本語)' },
];

const aspectRatiosData: { id: AspectRatio; name: string; icon: string }[] = [
    { id: '1:1', name: 'Square', icon: 'M13 13V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1z' },
    { id: '16:9', name: 'Landscape', icon: 'M21 5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5z' },
    { id: "9:16", name: "Portrait", icon: "M5 21a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5z" },
    { id: '4:5', name: 'Social', icon: 'M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6z' },
    { id: '1.91:1', name: 'Widescreen', icon: 'M21 7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7z' }
];

type CreatorStyles = { [key: string]: CreatorStyle[] };
type AdStyles = { [key: string]: AdStyle[] };
type ProfilePictureStyles = { [key: string]: ProfilePictureStyle[] };
type LogoStyles = { [key: string]: LogoStyle[] };
type NewspaperStyles = { [key: string]: NewspaperStyle[] };

export const CREATOR_STYLES: CreatorStyles = creatorStylesData;
export const POLITICAL_PARTIES: PoliticalParty[] = politicalPartiesData;
export const POSTER_STYLES: PosterStyle[] = posterStylesData;
export const POSTER_THEMES: string[] = posterThemesData;
export const AD_STYLES: AdStyles = adStylesData;
export const PROFILE_PICTURE_STYLES: ProfilePictureStyles = profilePictureStylesData;
export const LOGO_STYLES: LogoStyles = logoStylesData;
export const HEADSHOT_STYLES: HeadshotStyle[] = headshotStylesData;
export const PASSPORT_PHOTO_SIZES: PassportPhotoSize[] = passportPhotoSizesData;
export const PASSPORT_PHOTO_STYLES: PassportPhotoStyle[] = passportPhotoStylesData;
export const VISITING_CARD_STYLES: VisitingCardStyle[] = visitingCardStylesData;
export const EVENT_POSTER_STYLES: EventPosterStyle[] = eventPosterStylesData;
export const NEWSPAPER_STYLES: NewspaperStyles = newspaperStylesData;
export const NEWSPAPER_LANGUAGES: NewspaperLanguage[] = newspaperLanguagesData;
export const ASPECT_RATIOS: { id: AspectRatio; name: string; icon: string }[] = aspectRatiosData;