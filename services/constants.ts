import { CreatorStyle, PoliticalParty, PosterStyle, AdStyle, ProfilePictureStyle, LogoStyle, HeadshotStyle, PassportPhotoStyle, PassportPhotoSize, VisitingCardStyle, EventPosterStyle, NewspaperStyle } from '../types';

// --- INLINED DATA FROM /data/*.json FILES ---

const creatorStylesData = {
  "internationalMale": [
    {
      "id": "mrbeast",
      "name": "MrBeast",
      "tags": "Bold & High-Contrast",
      "creatorStyle": "Explosive, high-energy spectacle. Thumbnails are meticulously designed to be the most clickable on the platform, using vibrant colors, exaggerated surprised expressions, and a massive sense of scale. Often features stacks of cash, luxury cars, or custom-built massive objects.",
      "mood": "Maximum Excitement, Shock, Urgency, Spectacle",
      "imageStyle": "Ultra-realistic photo, 8k resolution. Shot with a wide-angle lens (14mm) to create dramatic perspective distortion. Lighting is harsh and high-contrast, like a commercial studio setup, with dramatic highlights and deep shadows to make the subject pop. Hyper-saturated color grading with boosted vibrancy. Motion blur and particle effects (sparks, dust) are common."
    },
    {
      "id": "mkbhd",
      "name": "MKBHD",
      "tags": "Minimalist & Techy",
      "creatorStyle": "Sleek, minimalist, and premium tech aesthetic. Focus on flawless product photography with clean lines, dark matte backgrounds, and precise lighting that highlights texture and form. The brand colors of matte black and red are paramount.",
      "mood": "Sophisticated, Professional, Minimalist, Premium",
      "imageStyle": "Ultra-realistic studio product photo, 8k. Captured with a 50mm prime lens for a natural perspective. Lighting is soft and diffused, often from a large softbox, creating subtle gradients. Cinematic color grading with deep blacks and a specific red accent (#ff0000). Extremely shallow depth of field to isolate the subject."
    },
    {
        "id": "casey-neistat",
        "name": "Casey Neistat",
        "tags": "Scrapbook & Authentic",
        "creatorStyle": "Gritty, authentic, scrapbook-style visuals that feel raw and in-the-moment. Often uses handwritten text, doodles, and a slightly desaturated, urban color palette. Focus on telling a story with a single image.",
        "mood": "Authentic, Energetic, Raw, Unfiltered",
        "imageStyle": "Realistic photo that looks like a frame from a vlog. Shot with a slight wide-angle lens, featuring natural, often harsh, daylight. High-contrast, slightly desaturated color grade with a bit of film grain to add texture. The composition is often candid and unposed."
    },
    {
      "id": "pewdiepie",
      "name": "PewDiePie",
      "tags": "Meme & Abstract",
      "creatorStyle": "Often chaotic, meme-focused, and surreal. Can range from simple reaction faces to highly edited, bizarre compositions. A slightly distorted, DIY aesthetic that feels intentionally low-fi at times.",
      "mood": "Ironic, Comedic, Unpredictable, Surreal",
      "imageStyle": "Mixed media look, often a composite of a real photo with graphic elements. The photo part is high-contrast, sometimes with a grainy or pixelated texture. Lighting is vibrant and can be mismatched to enhance the chaotic feel. Often uses a fish-eye lens effect for comedic distortion."
    },
    {
        "id": "ali-abdaal",
        "name": "Ali Abdaal",
        "tags": "Productivity & Clean",
        "creatorStyle": "Clean, bright, and organized aesthetic focused on productivity and learning. Often features screenshots of apps like Notion, book covers, and a light, airy visual style. Uses soft pastel colors and clear iconography.",
        "mood": "Productive, Inspiring, Calm, Organized",
        "imageStyle": "Bright and airy high-key photo. Lighting is even and shadowless, as if from a large window. The composition is minimalist and well-balanced (often rule of thirds). The color palette is light, with pastel accents. The image is sharp and clean with no grain."
    },
    {
        "id": "linus-tech-tips",
        "name": "Linus Tech Tips",
        "tags": "Tech & In-Depth",
        "creatorStyle": "Tech-focused, informative, and often humorous. Features hardware close-ups, custom PC builds, and expressive, sometimes goofy, faces. Orange, black, and white are key brand colors.",
        "mood": "Informative, Enthusiastic, In-Depth, Humorous",
        "imageStyle": "Crisp and clean studio photo. Lighting is professional and designed to eliminate glare on tech components. The composition is dynamic, often using diagonal lines. Color grading features a distinct orange and teal look. The focus is tack-sharp on the main subject."
    },
    {
        "id": "mark-rober",
        "name": "Mark Rober",
        "tags": "Science & Engineering",
        "creatorStyle": "Fun, educational, and epic science/engineering builds. Features explosions, crazy contraptions, and a sense of wonder. Visuals are bright, high-energy, and clearly showcase the main invention.",
        "mood": "Exciting, Educational, Epic, Awe-Inspiring",
        "imageStyle": "High-speed action photo, captured with a fast shutter speed to freeze motion. Lighting is typically bright, natural outdoor sunlight. Colors are vibrant and saturated to create a fun, family-friendly feel. The composition is wide to capture the scale of the projects."
    },
    {
        "id": "logan-paul",
        "name": "Logan Paul",
        "tags": "High-Energy & Pop",
        "creatorStyle": "Extremely high-energy, pop-culture-centric style with a very polished, almost commercial look. Action poses, dramatic expressions, and bright, often neon, colors are key.",
        "mood": "Energetic, Bold, Sensational, Polished",
        "imageStyle": "Ultra-polished commercial photo, 8k resolution. Lighting is dramatic and high-contrast, often using colored gels (like blue and pink). High saturation and crisp details are essential. The composition often includes motion blur or dynamic lines to enhance energy."
    },
    {
        "id": "mrwhosetheboss",
        "name": "Mrwhosetheboss",
        "tags": "Tech & Dynamic",
        "creatorStyle": "Dynamic and engaging tech reviews with a highly cinematic feel. Often features creative compositions, floating products, and a sense of motion. Clean but visually interesting backgrounds are a must.",
        "mood": "Intriguing, Techy, Polished, Cinematic",
        "imageStyle": "Cinematic, moody photo. Lighting is dramatic, often a single key light from the side to create suspense. The background features an extremely shallow depth of field with beautiful bokeh. The color palette is often dark with a single vibrant accent color. May incorporate glowing lines or abstract tech elements."
    },
    {
        "id": "dude-perfect",
        "name": "Dude Perfect",
        "tags": "Sports & Action",
        "creatorStyle": "Epic-scale sports and action shots featuring incredible trick shots. Wide-angle views, high-speed photography, and a sense of camaraderie and fun. Bright, clean, and family-friendly.",
        "mood": "Epic, Fun, Action-Packed, Unbelievable",
        "imageStyle": "Ultra-realistic action photo, captured with a very high shutter speed to freeze the moment. Lighting is bright, sunny outdoor light. Colors are vibrant and clean. The composition is dynamic, often using a low angle to make the action feel larger than life."
    },
    {
      "id": "ninja",
      "name": "Ninja",
      "tags": "Gaming & Vibrant",
      "creatorStyle": "High-energy, fast-paced gaming content, particularly from the world of Fortnite. Thumbnails are extremely vibrant, colorful, and action-packed, often featuring in-game skins, dynamic poses, and bold text.",
      "mood": "Energetic, Competitive, Intense, Colorful",
      "imageStyle": "A hyper-realistic digital art style, resembling a high-quality game splash screen. Lighting is vibrant and saturated, with strong neon blues and pinks. The character pose is dynamic and action-oriented. The background is a chaotic, motion-blurred scene from a video game. Extremely sharp details."
    },
    {
      "id": "unbox-therapy",
      "name": "Unbox Therapy",
      "tags": "Tech & Unboxing",
      "creatorStyle": "Focuses on the unboxing experience with a sense of mystery and curiosity. Often features close-ups of packaging, the product partially revealed, and a clean, studio setting. The host, Lewis Hilsenteger, has an iconic seated pose.",
      "mood": "Intriguing, Minimalist, Curious, Satisfying",
      "imageStyle": "Ultra-realistic product photo. Shot from a top-down or slight angle, often showing hands interacting with the box. Lighting is soft and even, from a large overhead source. The background is a clean, textured surface like wood or a simple studio backdrop. Extremely shallow depth of field (bokeh) to focus on the product."
    },
    {
      "id": "tom-scott",
      "name": "Tom Scott",
      "tags": "Educational & Direct",
      "creatorStyle": "Clear, direct, and informative. Thumbnails usually feature him on location, pointing at or interacting with the subject of the video. The visual style is clean and professional, almost like a modern documentary. His red shirt is iconic.",
      "mood": "Informative, Fascinating, Clear, Adventurous",
      "imageStyle": "A clean, realistic photograph, like a still from a high-quality documentary. Lighting is bright, natural daylight. Color grading is true-to-life with good contrast. The composition is simple and centered, clearly showing the subject of interest. He is often seen wearing a red t-shirt."
    }
  ],
  "internationalFemale": [
     {
      "id": "emma-chamberlain",
      "name": "Emma Chamberlain",
      "tags": "Vlog & Aesthetic",
      "creatorStyle": "Authentic, candid, and relatable with a vintage or film-like quality. Casual poses, natural lighting, and a focus on everyday, unpolished moments. Feels personal and diary-like.",
      "mood": "Relaxed, Authentic, Aesthetic, Nostalgic",
      "imageStyle": "Realistic photo that looks shot on 35mm film. Features noticeable film grain, warm tones, and a slightly faded, desaturated color palette. Lighting is soft and natural, often from a window. The composition is unposed and feels like a captured moment."
    },
    {
        "id": "ijustine",
        "name": "iJustine",
        "tags": "Tech & Unboxing",
        "creatorStyle": "Bright, cheerful, and enthusiastic tech reviews and unboxings. Clean backgrounds, often featuring Apple products. A very positive and high-energy vibe. Purple is a key brand color.",
        "mood": "Enthusiastic, Fun, Techy, Joyful",
        "imageStyle": "Bright, high-key studio photo. The lighting is even and shadowless, creating a clean, commercial look. Colors are vibrant and highly saturated. The composition is centered and clear, with a sharp focus on the product and her excited expression."
    },
    {
        "id": "lilly-singh",
        "name": "Lilly Singh",
        "tags": "Comedy & Vibrant",
        "creatorStyle": "Bold, colorful, and comedic. Often features character sketches, highly expressive faces, and vibrant, pop-art inspired backgrounds. Conveys high energy and confidence.",
        "mood": "Humorous, Confident, Energetic, Bold",
        "imageStyle": "Vibrant studio photo with theatrical, multi-colored lighting (using gels). Colors are hyper-saturated, creating a pop-art feel. The composition is dynamic and posed for comedy. The image is sharp, glossy, and high-resolution."
    },
    {
        "id": "pokimane",
        "name": "Pokimane",
        "tags": "Gaming & Streamer",
        "creatorStyle": "Friendly and engaging streamer aesthetic. Often features a gaming setup, cute branding elements, and a warm, inviting atmosphere. Poses are typically friendly and approachable.",
        "mood": "Friendly, Cute, Engaging, Cozy",
        "imageStyle": "Soft, diffused photo, lit as if by a large ring light to create a flattering \"beauty\" light. The color tones are warm and inviting. The background is her clean gaming room, softly blurred with a shallow depth of field (bokeh)."
    },
    {
        "id": "safiya-nygaard",
        "name": "Safiya Nygaard",
        "tags": "Experimental & Themed",
        "creatorStyle": "Themed and experimental content, often with a slightly gothic or vintage twist. High-concept visuals that match the video's experiment. Very polished and well-produced.",
        "mood": "Curious, Theatrical, Polished, Mysterious",
        "imageStyle": "Cinematic and moody photo. The lighting is dramatic and theme-specific (e.g., deep reds for a spooky video). The color palette is carefully controlled to match the video's theme. The image is high-resolution, with sharp details and a composed, intriguing expression."
    },
    {
        "id": "rosanna-pansino",
        "name": "Rosanna Pansino",
        "tags": "Baking & Cute",
        "creatorStyle": "Extremely cute, colorful, and cheerful baking content. Features adorable creations, pastel colors, and a very bright, clean aesthetic. The mood is overwhelmingly sweet and whimsical.",
        "mood": "Sweet, Cheerful, Whimsical, Adorable",
        "imageStyle": "Bright, high-key photo with even, shadowless lighting. The color palette is hyper-saturated with pastel colors. The composition is often a flat lay or a clean shot in a pristine kitchen. The focus is tack-sharp on the cute details of the baked goods."
    },
    {
      "id": "valkyrae",
      "name": "Valkyrae",
      "tags": "Gaming & Energetic",
      "creatorStyle": "High-energy streamer style, often with a competitive and cool edge. Clean graphics, branding (100 Thieves), and a focus on expressive reactions during gameplay are central.",
      "mood": "Energetic, Competitive, Cool, Focused",
      "imageStyle": "High-contrast photo with vibrant RGB/neon lighting from monitors and LED strips, creating colored rim lights. The background is dark to make the colors pop. The composition is dynamic, and her expression is focused and competitive."
    },
    {
      "id": "huda-beauty",
      "name": "Huda Beauty",
      "tags": "Glamour & Makeup",
      "creatorStyle": "Ultra-polished, glamorous makeup tutorials and product showcases. A very luxurious and aspirational feel. Focus on flawless application, dramatic looks, and high-end products.",
      "mood": "Luxurious, Confident, Flawless, Glamorous",
      "imageStyle": "Ultra-realistic beauty photo, 8k, like a magazine cover. The lighting is perfect, soft, and shadowless, often from a large softbox or beauty dish. The shot is a macro close-up to show flawless detail. The colors are rich and saturated, and the background is clean and high-end."
    },
    {
      "id": "michelle-khare",
      "name": "Michelle Khare",
      "tags": "Challenge & Transformation",
      "creatorStyle": "Documents intense training and transformation challenges. Thumbnails often show a dramatic \"before and after\" or her in peak action. The style is cinematic and inspiring.",
      "mood": "Determined, Inspiring, Epic, Powerful",
      "imageStyle": "Cinematic action photo. The lighting is dramatic and low-key to sculpt muscles and create a gritty feel. The color grade is cinematic (e.g., desaturated with high contrast). The shot often has motion blur to convey action, and her pose is powerful and determined."
    },
    {
      "id": "liza-koshy",
      "name": "Liza Koshy",
      "tags": "Comedy & High-Energy",
      "creatorStyle": "Fast-paced, pun-filled, physical comedy. Thumbnails are extremely expressive and often use a wide-angle lens for comedic distortion. Bright, saturated, and chaotic.",
      "mood": "Goofy, Hyper-energetic, Hilarious, Chaotic",
      "imageStyle": "Bright, slightly overexposed photo with high-key lighting. Colors are hyper-saturated. A wide-angle lens (e.g., 16mm) is used up close to create comedic distortion. Her facial expression is exaggerated and goofy, and the pose is highly dynamic."
    },
    {
      "id": "nikkietutorials",
      "name": "NikkieTutorials",
      "tags": "Makeup & Glam",
      "creatorStyle": "Ultra-glamorous, high-production beauty content. Thumbnails are flawless close-ups showcasing intricate makeup looks. The style is polished, vibrant, and aspirational, with a focus on perfection.",
      "mood": "Glamorous, Flawless, Artistic, Confident",
      "imageStyle": "A perfect, high-fashion beauty shot, 8k resolution. Lighting is from a ring light or beauty dish, creating a shadowless, flawless look on the skin. The focus is a macro shot on the eyes or lips to showcase the makeup detail. Colors are hyper-saturated and vibrant. The background is often a simple, clean color to make the makeup pop."
    },
    {
      "id": "joanna-ceddia",
      "name": "Joanna Ceddia",
      "tags": "DIY & Quirky",
      "creatorStyle": "Quirky, low-fi, and comedic DIY/vlog content. The aesthetic feels very homemade and authentic, often using intentionally \"bad\" graphics, chaotic collages, and a very bright, saturated look.",
      "mood": "Chaotic, Humorous, Authentic, Low-fi",
      "imageStyle": "A slightly overexposed, high-saturation photo that looks like it was taken with a webcam or phone camera with the flash on. The composition is often a messy, chaotic collage of multiple images and hand-drawn elements. The lighting is harsh and direct. The overall vibe is intentionally amateurish and fun."
    }
  ],
   "indianMale": [
    {
      "id": "technical-guruji",
      "name": "Technical Guruji",
      "tags": "Tech & Informative",
      "creatorStyle": "Direct-to-camera presentation with the tech product clearly and professionally displayed. Bright, clean lighting. Often includes brand logos or box art in the background.",
      "mood": "Informative, Trustworthy, Clear, Professional",
      "imageStyle": "Clean, commercial studio photo. The lighting is bright and even, eliminating all shadows. The focus is tack-sharp on both his face and the product. Colors are true-to-life but slightly saturated. The pose is direct, confident, and trustworthy."
    },
    {
        "id": "carryminati",
        "name": "CarryMinati",
        "tags": "Gaming & Expressive",
        "creatorStyle": "Highly expressive and comedic reactions, often during gaming or roasts. Features gaming setups, headphones, and dynamic, colorful backgrounds. Exaggerated facial expressions are key.",
        "mood": "Humorous, Energetic, Relatable, Outrageous",
        "imageStyle": "High-contrast photo, often a close-up shot with a wide-angle lens for comedic effect. The lighting is dramatic, with colored RGB lights creating a moody, energetic feel. His expression is highly animated and exaggerated. The background is often dark to make him pop."
    },
    {
        "id": "bhuvan-bam",
        "name": "BB Ki Vines",
        "tags": "Comedy & Characters",
        "creatorStyle": "Character-driven comedy. Thumbnails often feature multiple characters (played by him) in one frame, showcasing a funny situation. Relatable, middle-class Indian settings are central.",
        "mood": "Comedic, Story-driven, Relatable, \"Desi\"",
        "imageStyle": "Realistic composite photo. The lighting is naturalistic, mimicking a real Indian home environment. Multiple versions of him in different character costumes are seamlessly blended. The expressions are key to telling the story of the skit."
    },
    {
        "id": "ashish-chanchlani",
        "name": "Ashish Chanchlani",
        "tags": "Slapstick & Vibrant",
        "creatorStyle": "Loud, vibrant, and slapstick comedy. Thumbnails are extremely colorful and feature over-the-top expressions and situations. Bold, Hindi text is a common feature.",
        "mood": "Hilarious, Loud, Exaggerated, Entertaining",
        "imageStyle": "Hyper-saturated photo with vibrant, almost neon colors. A dramatic wide-angle lens is used to create a dynamic, high-energy composition. The lighting is bright and high-contrast. His expression is over-the-top and slapstick."
    },
    {
        "id": "sandeep-maheshwari",
        "name": "Sandeep Maheshwari",
        "tags": "Motivational & Minimal",
        "creatorStyle": "Minimalist and impactful. Often a powerful portrait shot with a simple, clean background and a single line of inspiring text. The focus is on his calm and profound expression.",
        "mood": "Inspirational, Calm, Profound, Serene",
        "imageStyle": "Professional portrait photo. The lighting is a classic three-point studio setup, creating a sculpted, professional look. The background is clean and uncluttered (often gray or white). The color scheme is often monochromatic or has a simple, desaturated look."
    },
    {
        "id": "amit-bhadana",
        "name": "Amit Bhadana",
        "tags": "Rural Comedy & Desi",
        "creatorStyle": "Focus on \"Desi\" or rural/local comedy, using Haryanvi dialect. Thumbnails often depict relatable, funny scenarios from everyday North Indian life. Warm, natural tones.",
        "mood": "Funny, Rooted, Authentic, Relatable",
        "imageStyle": "Naturalistic photo, shot as if in a real village or local setting. The lighting is warm, mimicking natural sunlight. The color palette is earthy and authentic. The focus is on the humorous interaction between characters."
    },
    {
      "id": "dhruv-rathee",
      "name": "Dhruv Rathee",
      "tags": "Informative & Clean",
      "creatorStyle": "Educational and investigative content. Thumbnails are clean, minimalist, and data-driven, often featuring him alongside graphs, maps, or key journalistic images. The look is serious and credible.",
      "mood": "Serious, Informative, Trustworthy, Investigative",
      "imageStyle": "Clean, professional photo, similar to a news broadcast. The lighting is bright and even. He has a serious, trustworthy expression. The composition includes minimalist graphics, charts, or maps. The color palette is often a clean blue and white."
    },
    {
      "id": "flying-beast",
      "name": "Flying Beast",
      "tags": "Vlogging & Family",
      "creatorStyle": "Lifestyle and family vlogging with a focus on fitness, travel, and daily life. Thumbnails are warm, authentic, and happy, featuring his family in relatable situations.",
      "mood": "Wholesome, Relatable, Positive, Heartwarming",
      "imageStyle": "Bright, happy photo with natural daylight. The color grade is warm and inviting, enhancing skin tones. The composition is a candid family photo, full of genuine smiles and affection. Shot with a shallow depth of field to create a soft background."
    },
    {
      "id": "techno-gamerz",
      "name": "Techno Gamerz",
      "tags": "Gaming & Exciting",
      "creatorStyle": "Gameplay-focused content, especially GTA and other story-mode games. Thumbnails are bright, action-packed, and often feature in-game characters or vehicles with his expressive facecam reaction.",
      "mood": "Exciting, Fun, Action-Packed, Mysterious",
      "imageStyle": "Vibrant, high-contrast composite image. The background is a dramatic, action-filled scene from the game. Colors are hyper-saturated. His face is a high-quality cutout with an excited or shocked expression. Bold, glowing text is often used."
    },
    {
      "id": "harsh-beniwal",
      "name": "Harsh Beniwal",
      "tags": "Comedy & Relatable",
      "creatorStyle": "Character-driven comedy sketches about school/college life, friendships, and family. Thumbnails depict funny, relatable situations with exaggerated yet authentic expressions.",
      "mood": "Humorous, Relatable, \"Desi\", Youthful",
      "imageStyle": "Naturalistic photo that looks like a scene from the video. The lighting matches the environment (e.g., classroom, home). The color is true-to-life. The main focus is on the funny, exaggerated interactions and expressions of the characters."
    },
    {
      "id": "mumbiker-nikhil",
      "name": "Mumbiker Nikhil",
      "tags": "Vlogging & Travel",
      "creatorStyle": "Cinematic daily vlogging and travel content, often featuring superbikes and drones. Thumbnails are adventurous, aspirational, and showcase beautiful locations with a personal, story-driven feel.",
      "mood": "Adventurous, Aspirational, Cinematic, Heartfelt",
      "imageStyle": "A cinematic, wide-angle photo, often a drone shot or a low-angle shot of a bike. Lighting is typically golden hour (warm, soft sunlight). Color grading is cinematic with warm tones and high contrast. The composition is epic and highlights the scale of the location. Lens flare is a common element."
    },
    {
      "id": "mortal",
      "name": "MortaL",
      "tags": "Gaming & Intense",
      "creatorStyle": "Intense and competitive mobile gaming (BGMI/PUBG). Thumbnails are dark, gritty, and action-packed, often featuring his focused expression alongside dramatic in-game characters and effects like fire or electricity.",
      "mood": "Intense, Focused, Competitive, Gritty",
      "imageStyle": "A dark, high-contrast composite image. The lighting is moody and dramatic, with strong rim lighting in cool colors (blue, purple). His expression is serious and focused. The background is a gritty, cinematic scene from the game, with added particle effects. The overall look is polished and intense."
    },
    {
      "id": "geekyranjit",
      "name": "Geekyranjit",
      "tags": "Tech & Unbiased",
      "creatorStyle": "Clear, unbiased, and in-depth tech reviews. The style is very clean, professional, and direct. Thumbnails often show him holding the device against a clean, plain background, with clear text overlays.",
      "mood": "Trustworthy, Informative, No-Nonsense, Professional",
      "imageStyle": "A clean, professional studio photo. Lighting is bright, even, and shadowless (high-key). The background is a solid, neutral color (often white or gray). He has a neutral, trustworthy expression and holds the product clearly. The image is sharp and true-to-life in color."
    },
    {
      "id": "gaur-gopal-das",
      "name": "Gaur Gopal Das",
      "tags": "Motivational & Spiritual",
      "creatorStyle": "Calm, wise, and spiritual motivational talks. Thumbnails are serene and feature him in his monk attire, often with a gentle smile. The visuals are clean, with soft colors and often include a powerful quote.",
      "mood": "Serene, Wise, Calm, Inspirational",
      "imageStyle": "A professional portrait with soft, gentle lighting. The background is simple and uncluttered, often a soft gradient or a peaceful, out-of-focus natural setting. The color palette is warm and inviting. His expression is calm, wise, and approachable."
    },
    {
      "id": "mr-indian-hacker",
      "name": "Mr. Indian Hacker",
      "tags": "Science & Experiments",
      "creatorStyle": "Large-scale science experiments and \"life hack\" videos with a very high-energy, almost explosive feel. Thumbnails are extremely colorful and action-packed, showing the peak moment of an experiment.",
      "mood": "Exciting, Epic, Curious, Explosive",
      "imageStyle": "An action-packed, high-speed photograph, freezing a moment of explosion or reaction. Colors are hyper-saturated and vibrant. Lighting is often harsh, bright daylight. The composition is chaotic and dynamic, designed to create maximum curiosity and impact. Often uses a wide-angle lens."
    }
  ],
  "indianFemale": [
    {
        "id": "mostly-sane",
        "name": "Prajakta Koli",
        "tags": "Comedy & Relatable",
        "creatorStyle": "Relatable, slice-of-life comedy often featuring everyday settings and characters. Natural lighting and a warm, approachable feel are common. The look is authentic and not overly produced.",
        "mood": "Funny, Relatable, Warm, Charming",
        "imageStyle": "Natural, realistic photo. The lighting is soft and warm, as if from a window. The color grade is true-to-life with a slight warmth. The setting is a typical Indian home. Her expression is expressive and friendly."
    },
    {
        "id": "shirley-setia",
        "name": "Shirley Setia",
        "tags": "Music & Soft",
        "creatorStyle": "Soft, dreamy, and musical aesthetic. Often features a guitar or microphone. A very pleasant and friendly vibe with a focus on soft, almost ethereal visuals.",
        "mood": "Dreamy, Sweet, Musical, Gentle",
        "imageStyle": "Ethereal photo with soft, diffused backlighting to create a glowing halo effect. The shot has a very shallow depth of field, resulting in a beautifully blurred background with bokeh. The color palette is pastel and warm. Her expression is sweet and gentle."
    },
    {
        "id": "sejal-kumar",
        "name": "Sejal Kumar",
        "tags": "Fashion & Lifestyle",
        "creatorStyle": "Fashion-forward and aesthetic. Thumbnails look like they could be from a high-end fashion magazine. Poses are confident and stylish. Backgrounds are often clean or urban.",
        "mood": "Fashionable, Confident, Aesthetic, Chic",
        "imageStyle": "Editorial fashion photo. The lighting is high-contrast but flattering, like professional magazine photography. The composition is strong and follows fashion posing conventions. The color grade is modern and can be either desaturated or have a specific artistic tint."
    },
    {
        "id": "anaysa",
        "name": "Anaysa",
        "tags": "Beauty & DIY",
        "creatorStyle": "Bright, clean, and informative beauty and DIY content. Often features before-and-after shots, product close-ups, and a very clear, instructional layout. Aims to be helpful and trustworthy.",
        "mood": "Helpful, Bright, Clean, Trustworthy",
        "imageStyle": "Bright, high-key photo with even, shadowless lighting from a ring light. The background is clean and white or pastel. Colors are vibrant and pop. The composition is often a split-screen for before/after, with tack-sharp focus."
    },
    {
      "id": "vidya-vox",
      "name": "Vidya Vox",
      "tags": "Music & Fusion",
      "creatorStyle": "High-production music videos blending Indian and Western styles. Thumbnails are cinematic, colorful, and often set in beautiful, scenic locations, showcasing fashion.",
      "mood": "Artistic, Energetic, Global, Cinematic",
      "imageStyle": "Vibrant, cinematic photo from a music video. The lighting is professional and dramatic, with lens flares. The color grading is rich and saturated. The background is an epic, scenic location. Her pose is dynamic, powerful, and artistic."
    },
    {
      "id": "kabitas-kitchen",
      "name": "Kabita's Kitchen",
      "tags": "Cooking & Simple",
      "creatorStyle": "Simple, homely, and easy-to-follow Indian recipes. Thumbnails are clean, bright, and focus on the delicious final dish. The style is very approachable and makes cooking look easy.",
      "mood": "Appetizing, Homely, Trustworthy, Simple",
      "imageStyle": "Clean, appetizing food photo. The lighting is bright and even, often a flat lay (overhead shot) to clearly show the dish. The focus is tack-sharp on the food's texture. The background is simple and uncluttered, and the colors are warm and inviting."
    },
    {
      "id": "shruti-anand",
      "name": "Shruti Arjun Anand",
      "tags": "Comedy & Beauty",
      "creatorStyle": "A mix of relatable family comedy sketches and practical beauty/DIY content. Thumbnails are bright, expressive, and clearly communicate the video's topic, whether it's a funny situation or a beauty tip.",
      "mood": "Funny, Helpful, Relatable, Family-Oriented",
      "imageStyle": "Bright, high-key photo. The lighting is even and flattering, often from a softbox or ring light. The colors are vibrant and saturated. Her expression is highly animated for comedy skits or pleasant and clear for beauty videos."
    },
    {
      "id": "kusha-kapila",
      "name": "Kusha Kapila",
      "tags": "Satire & Comedy",
      "creatorStyle": "Satirical comedy sketches, often playing exaggerated, fashion-conscious characters like \"Billi Maasi\". Thumbnails are bold, expressive, and have an editorial quality.",
      "mood": "Witty, Sassy, Hilarious, Fashionable",
      "imageStyle": "Polished, editorial-style photo. The lighting is professional studio quality. The composition is clean and focuses on her exaggerated character expression. The color grading is modern and fashion-forward. Often uses bold, well-designed text overlays."
    },
    {
      "id": "ankita-chhetri",
      "name": "Ankita Chhetri",
      "tags": "Gaming & Lifestyle",
      "creatorStyle": "Gaming streams and lifestyle content with a cool, edgy, and sometimes \"e-girl\" vibe. Thumbnails often feature her in a gaming setup with neon lights, looking focused or having fun.",
      "mood": "Energetic, Cool, Focused, Edgy",
      "imageStyle": "Moody, high-contrast photo. The lighting is dominated by neon/RGB lights from a gaming setup, creating deep shadows and vibrant colored highlights. Her expression is focused and intense or happy and engaging. The image has a sharp, digital feel."
    },
    {
      "id": "tanya-khanijow",
      "name": "Tanya Khanijow",
      "tags": "Travel & Adventure",
      "creatorStyle": "Cinematic solo travel vlogs. Thumbnails are beautiful, aspirational, and showcase stunning landscapes with her often in the frame, looking adventurous and happy.",
      "mood": "Adventurous, Inspiring, Beautiful, Free-spirited",
      "imageStyle": "Breathtaking landscape photo with high dynamic range. The lighting is warm and natural, often captured during the golden hour (sunrise/sunset). The color grading is cinematic, enhancing the beauty of the scene. She is composed within the epic landscape (e.g., rule of thirds) with a joyful, candid expression."
    }
  ]
};

const adStylesData = {
    "techAndSaaS": [
        { "id": "apple-minimalist", "name": "Apple's Minimalist", "tags": "Clean & Premium", "stylePrompt": "A hyper-clean, minimalist aesthetic. Focus on the product against a simple, light-colored background. Use elegant sans-serif fonts, generous white space, and perfect, soft studio lighting. Mood is sophisticated, premium, and calm." },
        { "id": "microsoft-fluent", "name": "Microsoft's Fluent", "tags": "Corporate & Modern", "stylePrompt": "A clean, corporate, and user-centric style. Use soft gradients, rounded corners, and clear iconography. The design should feel modern, accessible, and professional. Lighting is bright and even." },
        { "id": "slack-vibrant", "name": "Slack's Vibrant", "tags": "Colorful & Collaborative", "stylePrompt": "A vibrant and friendly style. Use a bright, playful color palette, custom illustrations, and a collaborative, human-centric tone. The design should feel energetic and approachable." },
        { "id": "notion-monochrome", "name": "Notion's Monochrome", "tags": "Elegant & Focused", "stylePrompt": "A sophisticated, monochrome style with a focus on typography and structure. Uses a black and white palette with occasional subtle accents. The design feels organized, intellectual, and focused." },
        { "id": "tesla-futuristic", "name": "Tesla's Futuristic", "tags": "Sleek & Dark", "stylePrompt": "A futuristic and sleek dark-mode aesthetic. Use dramatic, high-contrast lighting on the product, a dark, often black, background, and a sense of cutting-edge technology. Mood is aspirational and powerful." }
    ],
    "ecommerceAndRetail": [
        { "id": "nike-dynamic", "name": "Nike's Dynamic Action", "tags": "Energetic & Inspiring", "stylePrompt": "High-energy, dynamic action shots. Feature the product or model in motion. Use high contrast, gritty textures, and a motivational, empowering tone. Bold, impactful typography is key." },
        { "id": "glossier-soft", "name": "Glossier's Soft & Real", "tags": "Minimal & Authentic", "stylePrompt": "A soft, minimalist, and authentic beauty style. Use natural, dewy lighting, a pastel color palette, and a focus on real, unretouched skin. Mood is approachable, modern, and effortless." },
        { "id": "gucci-vintage", "name": "Gucci's Vintage Luxury", "tags": "Eclectic & High-Fashion", "stylePrompt": "A vintage, eclectic, and high-fashion aesthetic. Use rich, warm color grading reminiscent of 70s film. Compositions are often quirky and artistic. Mood is luxurious, confident, and unconventional." },
        { "id": "amazon-direct", "name": "Amazon's Direct & Clear", "tags": "Simple & Informative", "stylePrompt": "A clean, straightforward style with the product as the hero on a pure white background. The focus is on clarity and providing information. Often includes badges for sales or reviews. Mood is trustworthy and efficient." },
        { "id": "patagonia-adventure", "name": "Patagonia's Adventure", "tags": "Outdoors & Authentic", "stylePrompt": "Authentic, rugged outdoor photography. Feature the product in a stunning natural landscape (mountains, forests). Use natural lighting and an earthy color palette. Mood is adventurous, sustainable, and real." }
    ],
    "indianFestiveAndCraft": [
        { "id": "diwali-sale", "name": "Diwali Sale", "tags": "Festive, Vibrant, Gold", "stylePrompt": "A vibrant, festive style for Diwali. Use deep, rich colors like maroon, gold, and royal blue. Incorporate traditional Indian motifs like diyas (oil lamps), rangoli patterns, and subtle sparkles. The mood is celebratory, prosperous, and warm." },
        { "id": "holi-celebration", "name": "Holi Celebration", "tags": "Colorful, Joyful, Energetic", "stylePrompt": "An explosive, colorful style for Holi. Use a bright, powder-paint inspired color palette (pinks, blues, yellows, greens) on a clean white background. The mood is energetic, playful, and joyful." },
        { "id": "eid-mubarak", "name": "Eid Mubarak", "tags": "Elegant, Serene, Green", "stylePrompt": "An elegant and serene style for Eid. Use a sophisticated color palette of greens, golds, and creams. Incorporate Islamic geometric patterns, crescent moons, and stars. The mood is graceful, blessed, and celebratory." },
        { "id": "handicraft-showcase", "name": "Handicraft Showcase", "tags": "Artisanal, Rustic, Authentic", "stylePrompt": "An earthy, authentic style to showcase handcrafted items. Use natural textures like wood, jute, or handmade paper as a background. Lighting should be soft and natural to highlight the product's texture and craftsmanship. The mood is artisanal, rustic, and premium." },
        { "id": "royal-indian-wedding", "name": "Royal Indian Wedding", "tags": "Luxury, Opulent, Traditional", "stylePrompt": "A luxurious and opulent style for wedding-related products. Use rich jewel tones, intricate damask or brocade patterns, and elements like marigold flowers. The mood is grand, traditional, and celebratory." },
        { "id": "modern-indian-aesthetic", "name": "Modern Indian Aesthetic", "tags": "Chic, Minimalist, Rooted", "stylePrompt": "A clean, modern style that blends minimalism with Indian elements. Use a bright, airy color palette with pops of a single vibrant Indian color (like Rani pink or Saffron). Incorporate a single, subtle traditional motif. The mood is chic, contemporary, and rooted." }
    ],
    "foodAndLifestyle": [
        { "id": "starbucks-cozy", "name": "Starbucks' Cozy Comfort", "tags": "Warm & Inviting", "stylePrompt": "A warm, cozy, and inviting style. Use soft, warm lighting, rich textures like wood and coffee beans, and a shallow depth of field. The mood is comforting, familiar, and premium." },
        { "id": "mcdonalds-bold", "name": "McDonald's Bold & Graphic", "tags": "Vibrant & Playful", "stylePrompt": "A bold, graphic, and playful style. Use a high-contrast, saturated color palette (especially red and yellow). Food is shot to look perfect and delicious. Mood is fun, fast, and iconic." },
        { "id": "chobani-fresh", "name": "Chobani's Fresh & Natural", "tags": "Bright & Healthy", "stylePrompt": "A bright, clean, and natural style. Use bright, high-key lighting, fresh ingredients as props, and a feeling of health and wellness. The color palette is often white with pops of natural color from fruits." },
        { "id": "haagen-dazs-indulgent", "name": "Häagen-Dazs' Indulgent", "tags": "Luxurious & Decadent", "stylePrompt": "A dark, moody, and luxurious style focused on indulgence. Use dramatic, low-key lighting to highlight rich textures (e.g., melting chocolate). The mood is decadent, sophisticated, and sensual." },
        { "id": "coca-cola-classic", "name": "Coca-Cola's Classic Vibe", "tags": "Nostalgic & Social", "stylePrompt": "A classic, nostalgic style focused on happiness and social connection. Features people enjoying the product together. Lighting is bright and happy. Mood is timeless, joyful, and universal." }
    ],
    "healthAndWellness": [
        { "id": "calm-minimalist", "name": "Clean & Calming", "tags": "Minimal & Natural", "stylePrompt": "A clean, minimalist, and calming aesthetic. Use soft, natural lighting, a muted or pastel color palette, and imagery of nature or serene environments. The mood is peaceful, healthy, and trustworthy." },
        { "id": "active-energetic", "name": "Active & Energetic", "tags": "Dynamic & Vibrant", "stylePrompt": "A high-energy and dynamic style. Feature people in motion, engaging in fitness or activities. Use bright, vibrant colors, dynamic camera angles, and a sense of movement. The mood is motivational, strong, and lively." }
    ],
    "travelAndLeisure": [
        { "id": "luxury-travel", "name": "Exotic & Luxurious", "tags": "Aspirational & Rich", "stylePrompt": "A rich, luxurious, and aspirational travel style. Use stunning, high-resolution landscape or resort photography. Colors are deep and saturated, lighting is golden and warm. The mood is exclusive, relaxing, and high-end." },
        { "id": "adventure-travel", "name": "Budget & Adventure", "tags": "Authentic & Exciting", "stylePrompt": "An authentic, adventurous, and exciting style. Use candid-style photography of real travel experiences, not just posed shots. Imagery is vibrant and full of life. The mood is adventurous, accessible, and fun." }
    ],
    "financeAndCorporate": [
        { "id": "corporate-trust", "name": "Corporate Trust Blue", "tags": "Stable & Professional", "stylePrompt": "A classic, trustworthy corporate style. Use a clean layout with a blue and white color palette. Lighting should be professional and even. The mood is one of stability, security, and professionalism. Ideal for banks and insurance." },
        { "id": "fintech-innovative", "name": "Fintech Dark Mode", "tags": "Modern & Data-Driven", "stylePrompt": "A sleek, modern dark-mode aesthetic. Use glowing data visualizations, neon accents, and a sense of innovation. The design should feel cutting-edge, intelligent, and forward-thinking. Perfect for trading apps and tech startups." },
        { "id": "wealth-luxury", "name": "Wealth Management Gold", "tags": "Elegant & Exclusive", "stylePrompt": "An elegant and luxurious style. Use a sophisticated color palette with gold, black, and cream. Imagery should evoke exclusivity and success. The mood is aspirational, premium, and refined. Suitable for investment firms." }
    ],
    "educationAndELearning": [
        { "id": "academic-clean", "name": "Academic & Clean", "tags": "Informative & Trustworthy", "stylePrompt": "A clean, informative, and academic style. Use bright, even lighting, a structured layout, and a professional color palette. The mood is trustworthy, knowledgeable, and credible. Great for universities or formal courses." },
        { "id": "masterclass-cinematic", "name": "MasterClass Cinematic", "tags": "Aspirational & Moody", "stylePrompt": "A highly cinematic and aspirational style. Use dramatic, moody lighting to create a premium feel. The instructor is presented as an expert. The overall mood is high-production, exclusive, and inspiring." },
        { "id": "elearning-playful", "name": "E-learning Playful", "tags": "Bright & Engaging", "stylePrompt": "A bright, colorful, and engaging style for modern e-learning. Use playful illustrations, vibrant colors, and a friendly tone. The design should feel accessible, fun, and motivational. Ideal for language apps or skill platforms." }
    ],
    "realEstateAndProperty": [
        { "id": "realestate-luxury", "name": "Luxury Real Estate", "tags": "Bright & Aspirational", "stylePrompt": "A bright, airy, and luxurious style for high-end properties. Use clean lines, minimalist decor, and abundant natural light. The mood is aspirational, elegant, and exclusive." },
        { "id": "realestate-family", "name": "Family Home Comfort", "tags": "Warm & Inviting", "stylePrompt": "A warm, cozy, and family-oriented style. Use soft, warm lighting and showcase happy, candid family moments. The mood is inviting, trustworthy, and emotional. Perfect for suburban homes." },
        { "id": "realestate-urban", "name": "Urban Living", "tags": "Modern & Trendy", "stylePrompt": "A modern, trendy style for urban properties. Feature city views, contemporary design, and a dynamic, energetic vibe. The mood is cool, sophisticated, and connected." }
    ]
};

const profilePictureStylesData = {
    "male": [
        { "id": "male-corporate-headshot", "name": "Corporate Headshot", "tags": "LinkedIn, Professional", "stylePrompt": "A classic, professional corporate headshot. The man is wearing a sharp, dark business suit with a light-colored dress shirt. He has a confident, approachable smile. The background is a modern, softly blurred office interior. Lighting is a clean, three-point studio setup that is flattering and professional." },
        { "id": "male-outdoor-candid", "name": "Outdoor Candid", "tags": "Casual, Natural", "stylePrompt": "A candid, natural-light portrait of a man outdoors. He is dressed in casual, stylish clothing like a sweater or jacket. The background is a scenic park or urban street with beautiful bokeh. The lighting is warm, golden-hour sunlight, creating a friendly and authentic feel." },
        { "id": "male-tech-startup", "name": "Tech Startup", "tags": "Modern, Confident", "stylePrompt": "A modern and confident headshot suitable for a tech entrepreneur. The man is wearing a smart-casual outfit (e.g., a high-quality t-shirt under a blazer). The background is a clean, minimalist setting, perhaps against a concrete or brick wall. Lighting is high-contrast and slightly dramatic." },
        { "id": "male-creative-studio", "name": "Creative Studio", "tags": "Artistic, Moody", "stylePrompt": "An artistic, moody portrait of a creative professional. He might be a photographer, designer, or artist. The lighting is low-key and dramatic, with strong shadows. The background is a dark, textured studio environment. His expression is thoughtful and intense." },
        { "id": "male-vibrant-avatar", "name": "Vibrant Avatar", "tags": "Gaming, Social", "stylePrompt": "A hyper-vibrant, stylized avatar. The portrait has a colorful, graphic background with neon or abstract elements. The lighting on the man is high-energy, possibly with colored gels. His expression is energetic and engaging, perfect for a gaming or social media profile." }
    ],
    "female": [
        { "id": "female-corporate-headshot", "name": "Corporate Headshot", "tags": "LinkedIn, Professional", "stylePrompt": "A classic, professional corporate headshot. The woman is wearing a tailored blazer and professional attire. She has a confident, warm smile. The background is a bright, softly blurred modern office. Lighting is soft and flattering, often from a large softbox to create a clean, approachable look." },
        { "id": "female-lifestyle-blogger", "name": "Lifestyle Blogger", "tags": "Warm, Authentic", "stylePrompt": "A warm and authentic lifestyle portrait. The woman is dressed in fashionable, casual clothing. The setting could be a chic cafe or a beautifully decorated home interior, with a shallow depth of field. The lighting is soft, natural window light, creating a bright and airy feel." },
        { "id": "female-elegant-minimalist", "name": "Elegant Minimalist", "tags": "Clean, Sophisticated", "stylePrompt": "A sophisticated and minimalist portrait. The woman has a simple, elegant look. The background is a solid, neutral color like light gray or beige. The lighting is soft and even. The overall mood is calm, confident, and high-end." },
        { "id": "female-creative-bold", "name": "Creative & Bold", "tags": "Artistic, Colorful", "stylePrompt": "A bold and creative portrait. The woman wears unique, artistic fashion and might have bold makeup. The background is vibrant and colorful, possibly a solid bright color or an interesting texture. Lighting is high-contrast and fashion-oriented." },
        { "id": "female-cozy-natural", "name": "Cozy & Natural", "tags": "Casual, Relatable", "stylePrompt": "A cozy and natural portrait. The woman is wearing comfortable clothing like a knit sweater. The background is a warm, inviting indoor space. The lighting is soft and warm, perhaps from a nearby lamp or window, creating a relatable and down-to-earth feeling." }
    ]
};

const logoStylesData = {
    "general": [
        { "id": "logo-minimalist-geometric", "name": "Geometric Minimalist", "tags": "Modern, Clean, Abstract", "stylePrompt": "A clean, minimalist logo using basic geometric shapes (circles, squares, triangles). The design is abstract and symmetrical, conveying balance and modernity. Use a limited color palette of 2-3 colors on a solid white background. Flat vector graphic style." },
        { "id": "logo-vintage-emblem", "name": "Vintage Emblem", "tags": "Classic, Badge, Detailed", "stylePrompt": "A classic emblem or badge logo with a vintage, handcrafted feel. Often circular, it incorporates the company name in an elegant serif or script font. May include subtle line art illustrations like wreaths or banners. The style is detailed but clean. Monochrome or two-tone color scheme. Vector graphic on a solid background." },
        { "id": "logo-modern-lettermark", "name": "Modern Lettermark", "tags": "Monogram, Typography, Sleek", "stylePrompt": "A strong, modern lettermark (monogram) logo focusing on the company initials. The typography is custom, bold, and clean (sans-serif). The letters might be cleverly interconnected or have unique negative space elements. Single color on a solid white background. Vector graphic style." },
        { "id": "logo-playful-mascot", "name": "Playful Mascot", "tags": "Character, Fun, Friendly", "stylePrompt": "A friendly and playful character mascot logo. The character should be simple, memorable, and expressive. The style is a clean, modern cartoon with bold outlines and flat colors. The company name is integrated below or beside the mascot in a fun, rounded font. Vector illustration on a solid background." },
        { "id": "logo-organic-hand-drawn", "name": "Organic Hand-Drawn", "tags": "Natural, Rustic, Boutique", "stylePrompt": "An organic, hand-drawn logo that feels rustic and authentic. Features natural elements like leaves, branches, or imperfect, flowing lines. The typography is a script or a soft serif font that looks hand-lettered. Perfect for natural products or boutique brands. Single color on a solid background. Vector graphic." },
        { "id": "logo-tech-gradient", "name": "Tech Gradient", "tags": "SaaS, Digital, Vibrant", "stylePrompt": "A vibrant, modern logo for a tech company or app. It features an abstract shape or a stylized initial created with a smooth, bright color gradient (e.g., blue to purple, pink to orange). The font for the company name is a clean, geometric sans-serif. Vector graphic on a dark or white background." },
        { "id": "logo-luxury-serif", "name": "Luxury Serif", "tags": "Elegant, Fashion, High-End", "stylePrompt": "An elegant and luxurious wordmark logo. The entire focus is on the company name, typeset in a beautiful, high-contrast serif font with perfect kerning. The style is timeless and sophisticated. Typically black, white, or a metallic color like gold. Vector graphic on a solid background." },
        { "id": "logo-abstract-mark", "name": "Abstract Mark", "tags": "Conceptual, Unique, Versatile", "stylePrompt": "A unique and memorable abstract logo mark. The shape is non-representational but is designed to conceptually represent the brand's values (e.g., movement, connection, growth). The design is simple enough to be recognizable at any size. Paired with a clean sans-serif wordmark. Vector graphic on a solid background." },
        { "id": "logo-negative-space", "name": "Negative Space", "tags": "Clever, Smart, Minimalist", "stylePrompt": "A clever logo that uses negative space to create a dual image or reveal a hidden symbol. The design is minimalist and intelligent. For example, a letterform that contains the silhouette of an object in its counter-space. Typically single color to emphasize the effect. Flat vector graphic on a solid background." }
    ]
};

const politicalPartiesData = [
    { "id": "bjp", "name": "BJP", "logoPrompt": "a stylized lotus flower symbol", "colorScheme": "saffron, green, and white", "ideologyPrompt": "nationalism, cultural heritage, and strong economic development" },
    { "id": "congress", "name": "Congress", "logoPrompt": "the palm of a hand facing forward", "colorScheme": "blue, green, and orange", "ideologyPrompt": "secularism, inclusivity, and social welfare for all" },
    { "id": "aap", "name": "AAP", "logoPrompt": "a broom symbol", "colorScheme": "blue and white", "ideologyPrompt": "honesty, anti-corruption, and the empowerment of the common person (Aam Aadmi)" },
    { "id": "tmc", "name": "TMC", "logoPrompt": "two flowers with leaves", "colorScheme": "green and white", "ideologyPrompt": "regional pride, grassroots activism, and the spirit of Bengal" },
    { "id": "dmk", "name": "DMK", "logoPrompt": "a rising sun symbol", "colorScheme": "black and red", "ideologyPrompt": "social justice, Dravidian identity, and regional autonomy" },
    { 
      "id": "independent-india", 
      "name": "Independent (India)", 
      "logoPrompt": "the Indian National Flag (the Tiranga) and its elements", 
      "colorScheme": "saffron, white, and green", 
      "ideologyPrompt": "focus on the individual as a citizen leader, community engagement, patriotism, and direct citizen representation, rather than party politics." 
    },
    { 
      "id": "personal-community", 
      "name": "Personal / Community", 
      "logoPrompt": "no specific political logo; instead, use a subtle and modern circular emblem or no logo at all for a clean look", 
      "colorScheme": "a neutral, professional, and appealing color scheme like deep blues, greys, and whites",
      "ideologyPrompt": "This is for a personal or community announcement, NOT a political campaign. The tone should be professional, celebratory, or informational. Avoid all political symbols, slogans, and imagery. Focus on themes like personal achievement, community events, or professional branding."
    }
];

const posterStylesData = [
    { 
        "id": "vikas", 
        "name": "Vikas", 
        "tags": "Development & Progress", 
        "stylePrompt": "A clean, modern, and optimistic style. Use bright lighting, images of infrastructure and development, and a hopeful tone. The design should be professional and forward-looking." 
    },
    { 
        "id": "jan-andolan", 
        "name": "Jan Andolan", 
        "tags": "Movement & Protest", 
        "stylePrompt": "A gritty, high-contrast, and impactful style. Use imagery of crowds and activism. The typography should be bold and stencil-like. The mood is urgent and revolutionary." 
    },
    { 
        "id": "yuva-shakti", 
        "name": "Yuva Shakti", 
        "tags": "Youth & Energy", 
        "stylePrompt": "A vibrant, energetic, and modern style targeting the youth. Use dynamic layouts, bright colors, and images of young, aspirational people. The typography is trendy and bold." 
    },
    { 
        "id": "parivartan", 
        "name": "Parivartan", 
        "tags": "Change & Hope", 
        "stylePrompt": "A hopeful and emotional style focused on change. Use imagery of sunrises, open hands, and diverse groups of people. The color palette is often light and optimistic. The typography is clean and inspiring." 
    },
    { 
        "id": "garib-kalyan", 
        "name": "Garib Kalyan", 
        "tags": "Welfare & Empathy", 
        "stylePrompt": "An empathetic and grounded style focused on social welfare. Use authentic, emotional portraits of common people. The color palette is earthy and warm. The mood is one of care, support, and empathy." 
    },
    { 
        "id": "raksha", 
        "name": "Raksha", 
        "tags": "Security & Strength", 
        "stylePrompt": "A strong, patriotic, and bold style focused on national security. Use imagery of the military, national symbols, and strong leaders. The colors are often derived from the national flag. The typography is bold and authoritative." 
    },
    { 
        "id": "classic-propaganda", 
        "name": "Classic Propaganda", 
        "tags": "Vintage & Bold", 
        "stylePrompt": "A vintage propaganda poster style, reminiscent of old political art. Use bold, graphic illustrations, limited color palettes (e.g., red, black, beige), and strong, commanding typography. The mood is powerful and nostalgic." 
    }
];

const posterThemesData = [
    "General Election Campaign",
    "State Assembly Election",
    "Tribute to a National Leader",
    "Independence Day Greetings",
    "Republic Day Greetings",
    "Party Foundation Day",
    "Youth Rally & Mobilization",
    "Major Policy Announcement",
    "Festival Greetings (Diwali, Eid, etc.)",
    "Local Community Event"
];

const headshotStylesData = [
    { "id": "headshot-corporate", "name": "Corporate", "tags": "LinkedIn, Business", "stylePrompt": "A professional corporate headshot. The subject wears a sharp business suit. The background is a modern, softly blurred office interior. Lighting is a clean three-point studio setup, creating a confident and approachable look." },
    { "id": "headshot-creative", "name": "Creative", "tags": "Portfolio, Arts", "stylePrompt": "An artistic, moody portrait. The lighting is dramatic and low-key (Rembrandt lighting). The background is a dark, textured studio environment. The expression is thoughtful and intense. Clothing is stylish and creative." },
    { "id": "headshot-casual", "name": "Outdoor/Casual", "tags": "Social Media, Friendly", "stylePrompt": "A candid, natural-light portrait outdoors. The subject is dressed in stylish, casual clothing. The background is a scenic park with beautiful bokeh. Lighting is warm, golden-hour sunlight for a friendly and authentic feel." },
    { "id": "headshot-minimalist", "name": "Minimalist", "tags": "Modern, Clean", "stylePrompt": "A sophisticated and minimalist portrait. The background is a solid, neutral color like light gray or beige. The lighting is soft and even. The overall mood is calm, confident, and high-end. Clothing is simple and elegant." },
    { "id": "headshot-dramatic", "name": "Dramatic", "tags": "Actor, Performer", "stylePrompt": "A high-contrast, black and white headshot. The lighting is dramatic, creating strong shadows that define facial features. The expression is intense and captivating. The background is solid black." }
];

const passportPhotoSizesData = [
    { "id": "in-passport", "name": "Indian Passport", "widthMM": 35, "heightMM": 45, "description": "3.5 x 4.5 cm" },
    { "id": "in-visa", "name": "Indian Visa", "widthMM": 51, "heightMM": 51, "description": "2 x 2 inch" },
    { "id": "upsc", "name": "UPSC Exam", "widthMM": 35, "heightMM": 45, "description": "3.5 x 4.5 cm" },
    { "id": "ssc", "name": "SSC Exam", "widthMM": 35, "heightMM": 45, "description": "3.5 x 4.5 cm" }
];

const passportPhotoStylesData = [
    { "id": "male-black-suit", "name": "Man: Black Suit", "outfitPrompt": "a man wearing a professional black business suit, white dress shirt, and a simple dark tie." },
    { "id": "male-navy-suit", "name": "Man: Navy Suit", "outfitPrompt": "a man wearing a professional navy blue business suit, white dress shirt, and a simple blue tie." },
    { "id": "male-grey-suit", "name": "Man: Grey Suit", "outfitPrompt": "a man wearing a professional charcoal grey business suit, white dress shirt, and a simple grey tie." },
    { "id": "male-black-blazer", "name": "Man: Black Blazer", "outfitPrompt": "a man wearing a smart black blazer over a light blue dress shirt, no tie." },
    { "id": "male-navy-blazer", "name": "Man: Navy Blazer", "outfitPrompt": "a man wearing a smart navy blue blazer over a white dress shirt, no tie." },
    { "id": "male-formal-shirt-blue", "name": "Man: Blue Formal Shirt", "outfitPrompt": "a man wearing a crisp, light blue formal dress shirt, buttoned to the collar." },
    { "id": "male-formal-shirt-white", "name": "Man: White Formal Shirt", "outfitPrompt": "a man wearing a crisp, white formal dress shirt, buttoned to the collar." },
    { "id": "male-kurta-white", "name": "Man: White Kurta", "outfitPrompt": "a man wearing a simple and elegant white formal kurta." },
    { "id": "male-kurta-blue", "name": "Man: Light Blue Kurta", "outfitPrompt": "a man wearing a simple and elegant light blue formal kurta." },
    { "id": "male-nehru-jacket", "name": "Man: Nehru Jacket", "outfitPrompt": "a man wearing a dark Nehru jacket over a light-colored formal shirt." },
    { "id": "female-black-suit", "name": "Woman: Black Suit", "outfitPrompt": "a woman wearing a professional black business suit jacket over a simple white blouse." },
    { "id": "female-navy-suit", "name": "Woman: Navy Suit", "outfitPrompt": "a woman wearing a professional navy blue business suit jacket over a simple cream blouse." },
    { "id": "female-grey-suit", "name": "Woman: Grey Suit", "outfitPrompt": "a woman wearing a professional charcoal grey business suit jacket over a simple white blouse." },
    { "id": "female-black-blazer", "name": "Woman: Black Blazer", "outfitPrompt": "a woman wearing a smart black blazer over a professional, non-distracting top." },
    { "id": "female-navy-blazer", "name": "Woman: Navy Blazer", "outfitPrompt": "a woman wearing a smart navy blue blazer over a professional, non-distracting top." },
    { "id": "female-saree-formal", "name": "Woman: Formal Saree", "outfitPrompt": "a woman wearing a simple and elegant formal saree in a solid, neutral color like beige or light grey." },
    { "id": "female-saree-blue", "name": "Woman: Blue Saree", "outfitPrompt": "a woman wearing a simple and elegant formal saree in a solid, professional blue color." },
    { "id": "female-kurti-white", "name": "Woman: White Kurti", "outfitPrompt": "a woman wearing a simple and professional white formal kurti." },
    { "id": "female-kurti-blue", "name": "Woman: Light Blue Kurti", "outfitPrompt": "a woman wearing a simple and professional light blue formal kurti." },
    { "id": "female-formal-blouse", "name": "Woman: Formal Blouse", "outfitPrompt": "a woman wearing a professional, high-necked formal blouse in a solid, neutral color." }
];

const visitingCardStylesData = [
    { "id": "vc-minimalist", "name": "Minimalist", "tags": "Clean, Modern", "stylePrompt": "A clean, minimalist design with lots of white space. Uses a modern sans-serif font like Helvetica or Inter. The layout is simple and balanced. The color palette is monochrome or uses one subtle accent color." },
    { "id": "vc-corporate", "name": "Corporate", "tags": "Professional, Trustworthy", "stylePrompt": "A professional and traditional corporate design. Uses a classic serif or sans-serif font like Times New Roman or Arial. The layout is structured and grid-based. The color palette is typically blue, grey, and white, conveying stability." },
    { "id": "vc-creative", "name": "Creative", "tags": "Bold, Artistic", "stylePrompt": "A bold, artistic, and unconventional design. Uses unique typography, possibly a script or display font. The layout is asymmetrical and dynamic. The color palette is vibrant and uses bold color combinations." },
    { "id": "vc-luxury", "name": "Luxury", "tags": "Elegant, Premium", "stylePrompt": "An elegant and luxurious design. Uses a sophisticated serif font and may incorporate a monogram. The design might feature high-quality textures like marble or linen. The color palette includes rich colors like black, gold, silver, or deep jewel tones." }
];

const eventPosterStylesData = [
    { "id": "ep-modern", "name": "Modern & Clean", "tags": "Sleek, Minimal", "stylePrompt": "Use a clean, bold sans-serif font. The text should be placed with a clear hierarchy and generous spacing. The overall effect should be modern, sleek, and highly legible." },
    { "id": "ep-grunge", "name": "Grunge & Edgy", "tags": "Urban, Textured", "stylePrompt": "Use a distressed, textured, or stencil font. The text can be overlaid with a gritty texture. The colors should be high-contrast and slightly desaturated. The layout can be chaotic and energetic." },
    { "id": "ep-corporate", "name": "Corporate & Formal", "tags": "Professional, Elegant", "stylePrompt": "Use a classic serif or a clean sans-serif font. The text layout should be structured and professional. The color palette should be conservative, such as blues, greys, and whites. Add a subtle drop shadow for readability." },
    { "id": "ep-festive", "name": "Festive & Fun", "tags": "Playful, Colorful", "stylePrompt": "Use a playful, rounded, or script font. The text should be vibrant and can have a slight glow or outline. The layout should be fun and dynamic, possibly with text at an angle. Use bright, cheerful colors." }
];

const newspaperStylesData = [
    { "id": "vintage-broadsheet", "name": "Vintage Broadsheet", "tags": "Classic, Aged, Formal", "stylePrompt": "Create a classic, vintage newspaper look from the early 20th century. The paper should be yellowed and aged with a visible textured grain. Use a classic serif font like Times New Roman. The photo should be converted to a grainy black and white with a clear halftone dot pattern." },
    { "id": "modern-tabloid", "name": "Modern Tabloid", "tags": "Bold, Sensational, Color", "stylePrompt": "Create a modern, sensational tabloid newspaper style. Use bold, impactful sans-serif fonts for the headline. The paper should be clean and white. The user's photo should be in full color, sharp, and prominently featured." },
    { "id": "local-community", "name": "Local Community Paper", "tags": "Simple, Clean, Friendly", "stylePrompt": "Create the look of a friendly, local community newspaper. The design should be simple and clean, with a mix of serif and sans-serif fonts. The paper is slightly off-white. The photo should be in color but with a slightly muted, natural look." }
];

// --- EXPORTED CONSTANTS ---

type CreatorStyles = {
    [key: string]: CreatorStyle[];
};

type AdStyles = {
    [key: string]: AdStyle[];
};

type ProfilePictureStyles = {
    [key: string]: ProfilePictureStyle[];
}

type LogoStyles = {
    [key: string]: LogoStyle[];
}

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
export const NEWSPAPER_STYLES: NewspaperStyle[] = newspaperStylesData;