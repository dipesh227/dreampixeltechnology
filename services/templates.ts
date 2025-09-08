import { Template } from '../types';

export const TEMPLATES: Template[] = [
    // Thumbnail Templates
    {
        id: 'thumb-viral-challenge',
        name: 'Viral Challenge',
        tool: 'thumbnail',
        imageUrl: 'https://placehold.co/480x270/f87171/white?text=I+Survived!',
        prefill: {
            styleId: 'mrbeast',
            aspectRatio: '16:9',
            description: 'A high-stakes challenge video where I try to do something extreme for 24 hours. Full of suspense and surprising moments.',
            thumbnailText: 'I Survived 24 Hours',
        },
    },
    {
        id: 'thumb-tech-review',
        name: 'Sleek Tech Review',
        tool: 'thumbnail',
        imageUrl: 'https://placehold.co/480x270/111827/f3f4f6?text=The+Future+is+Here',
        prefill: {
            styleId: 'mkbhd',
            aspectRatio: '16:9',
            description: 'An in-depth review of the latest flagship smartphone, focusing on its design, camera, and performance. A clean and minimalist aesthetic is key.',
            thumbnailText: 'The Future is Here',
        },
    },
    {
        id: 'thumb-vlog-story',
        name: 'Authentic Vlog',
        tool: 'thumbnail',
        imageUrl: 'https://placehold.co/480x270/d1d5db/1f2937?text=My+Story',
        prefill: {
            styleId: 'casey-neistat',
            aspectRatio: '16:9',
            description: 'A personal vlog sharing a story about a recent adventure or life lesson. The style is raw, authentic, and cinematic.',
            thumbnailText: 'My Story',
        },
    },
    // Political Poster Templates
    {
        id: 'political-vikas',
        name: 'Development & Progress',
        tool: 'political',
        imageUrl: 'https://placehold.co/400x500/3b82f6/ffffff?text=Vote+for+Progress',
        prefill: {
            partyId: 'bjp',
            eventTheme: 'General Election Campaign',
            customText: 'Vote for Progress',
            styleId: 'vikas',
            aspectRatio: '4:5',
        },
    },
    {
        id: 'political-yuva-shakti',
        name: 'Youth Power',
        tool: 'political',
        imageUrl: 'https://placehold.co/400x500/f59e0b/1e293b?text=The+Future+is+Ours',
        prefill: {
            partyId: 'congress',
            eventTheme: 'Youth Rally & Mobilization',
            customText: 'The Future is Ours',
            styleId: 'yuva-shakti',
            aspectRatio: '4:5',
        },
    },
     {
        id: 'political-parivartan',
        name: 'Call for Change',
        tool: 'political',
        imageUrl: 'https://placehold.co/400x500/ef4444/ffffff?text=Time+for+a+Change',
        prefill: {
            partyId: 'aap',
            eventTheme: 'State Assembly Election',
            customText: 'Time for a Change',
            styleId: 'parivartan',
            aspectRatio: '4:5',
        },
    },
    // Ad Banner Templates
    {
        id: 'ad-minimalist-tech',
        name: 'Minimalist Tech Ad',
        tool: 'advertisement',
        imageUrl: 'https://placehold.co/600x600/e5e7eb/111827?text=Simplicity+Perfected',
        prefill: {
            styleId: 'apple-minimalist',
            aspectRatio: '1:1',
            productDescription: 'A new, elegant smartwatch with a minimalist design and powerful features for the modern professional.',
            headline: 'Simplicity. Perfected.',
            brandDetails: 'Aura Watches',
        },
    },
    {
        id: 'ad-dynamic-fashion',
        name: 'Dynamic Fashion Ad',
        tool: 'advertisement',
        imageUrl: 'https://placehold.co/600x750/1f2937/ffffff?text=Unleash+Your+Style',
        prefill: {
            styleId: 'nike-dynamic',
            aspectRatio: '4:5',
            productDescription: 'A collection of high-performance urban streetwear designed for movement and self-expression.',
            headline: 'Unleash Your Style',
            brandDetails: 'Momentum Apparel',
        },
    },
    {
        id: 'ad-cozy-lifestyle',
        name: 'Cozy Lifestyle Ad',
        tool: 'advertisement',
        imageUrl: 'https://placehold.co/600x600/a16207/ffffff?text=Your+Morning+Ritual',
        prefill: {
            styleId: 'starbucks-cozy',
            aspectRatio: '1:1',
            productDescription: 'Artisanal, single-origin coffee beans, perfect for a warm and comforting start to your day.',
            headline: 'Your Morning Ritual',
            brandDetails: 'The Daily Grind',
        },
    },
    // Social Media Post Templates
    {
        id: 'social-inspirational-quote',
        name: 'Inspirational Quote',
// FIX: Changed tool type from 'social' to 'social-campaign' to match the valid ToolType.
        tool: 'social-campaign',
        imageUrl: 'https://placehold.co/1080x1080/8b5cf6/ffffff?text=Dream+Big',
        prefill: {
            styleId: 'calm-minimalist',
            aspectRatio: '1:1',
            topic: 'A motivational post about chasing your dreams and never giving up, featuring an inspiring quote.',
            platform: 'Instagram',
            tone: 'Inspirational',
            callToAction: 'Share your dream in the comments!',
        },
    },
    {
        id: 'social-product-launch',
        name: 'New Product Launch',
// FIX: Changed tool type from 'social' to 'social-campaign' to match the valid ToolType.
        tool: 'social-campaign',
        imageUrl: 'https://placehold.co/1080x1350/ec4899/111827?text=It\'s+Here!',
        prefill: {
            styleId: 'glossier-soft',
            aspectRatio: '4:5',
            topic: 'An announcement for our brand new skincare product, a hydrating serum with natural ingredients.',
            platform: 'Pinterest',
            tone: 'Professional',
            callToAction: 'Shop now - link in bio!',
        },
    },
    {
        id: 'social-funny-meme',
        name: 'Funny Meme Post',
// FIX: Changed tool type from 'social' to 'social-campaign' to match the valid ToolType.
        tool: 'social-campaign',
        imageUrl: 'https://placehold.co/1200x675/facc15/1e293b?text=That+Friday+Feeling',
        prefill: {
            styleId: 'mcdonalds-bold',
            aspectRatio: '16:9',
            topic: 'A funny, relatable meme about the feeling of finishing work on a Friday.',
            platform: 'X / Twitter',
            tone: 'Humorous',
            callToAction: 'Tag a coworker who needs this!',
        },
    },
    // Profile Picture Templates
    {
        id: 'profile-linkedin',
        name: 'Professional Headshot',
        tool: 'profile',
        imageUrl: 'https://placehold.co/400x400/1e40af/ffffff?text=Pro',
        prefill: {
            styleId: 'male-corporate-headshot',
            aspectRatio: '1:1',
            profileDescription: 'A professional headshot for my LinkedIn profile. I am a software engineer.',
        },
    },
    {
        id: 'profile-creative',
        name: 'Creative Portrait',
        tool: 'profile',
        imageUrl: 'https://placehold.co/400x400/be185d/ffffff?text=Art',
        prefill: {
            styleId: 'female-creative-bold',
            aspectRatio: '1:1',
            profileDescription: 'An artistic and creative profile picture for my Instagram page where I share my design work.',
        },
    },
    // Logo Templates
    {
        id: 'logo-tech',
        name: 'Modern Tech Logo',
        tool: 'logo',
        imageUrl: 'https://placehold.co/400x400/4f46e5/ffffff?text=NEXUS',
        prefill: {
            styleId: 'logo-tech-gradient',
            aspectRatio: '1:1',
            companyName: 'Nexus',
            slogan: 'Connecting Worlds',
            logoDescription: 'A modern SaaS company focused on data integration.',
        },
    },
    {
        id: 'logo-cafe',
        name: 'Cozy Cafe Logo',
        tool: 'logo',
        imageUrl: 'https://placehold.co/400x400/78350f/ffffff?text=The+Bean',
        prefill: {
            styleId: 'logo-organic-hand-drawn',
            aspectRatio: '1:1',
            companyName: 'The Daily Bean',
            slogan: 'Your Perfect Cup',
            logoDescription: 'A cozy, local coffee shop with a focus on organic, hand-roasted beans.',
        },
    },
    // Headshot Maker Templates
    {
        id: 'headshot-linkedin-corp',
        name: 'LinkedIn Corporate',
        tool: 'headshot-maker',
        imageUrl: 'https://placehold.co/400x400/1e3a8a/ffffff?text=Corporate',
        prefill: {
            styleId: 'headshot-corporate',
            aspectRatio: '1:1', // Not strictly needed for user but good for consistency
            headshotDescription: 'I need a highly professional headshot for my LinkedIn profile. I work in finance, so it should look trustworthy and confident.',
        },
    },
];