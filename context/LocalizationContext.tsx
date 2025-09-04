import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

// --- INLINED TRANSLATION DATA ---

const enTranslations = {
  "header": {
    "apiStatus": "API Status",
    "feedback": "Share Feedback",
    "login": "Login",
    "logout": "Sign Out",
    "loginSignup": "Login / Sign Up",
    "status": {
      "valid": "Stable",
      "invalid": "Failed",
      "validating": "Checking...",
      "unknown": "Unknown"
    }
  },
  "footer": {
    "copyright": "© {{year}} Dream Pixel Technology. All rights reserved.",
    "dbStatus": "Database Status",
    "dbConnecting": "Connecting to database...",
    "dbConnected": "Database connection stable",
    "dbFailed": "Database connection failed"
  },
  "landing": {
    "docTitle": "AI Content Creation Suite",
    "title": "The AI Content Creation Suite",
    "subtitle": "One platform for all your creative needs. Generate stunning visuals for your brand, channel, or campaign in seconds."
  },
  "tools": {
    "thumbnail": {
      "title": "YouTube Thumbnail Generator",
      "description": "Create high-impact, click-worthy thumbnails by providing a headshot and a video description."
    },
    "advertisement": {
      "title": "Ad Banner Generator",
      "description": "Instantly produce professional advertisement banners for your marketing campaigns and social media."
    },
    "social": {
      "title": "Social Media Post Generator",
      "description": "Design engaging posts with both an image and a caption, tailored for platforms like Instagram, Facebook, and X."
    },
    "political": {
      "title": "Politician's Poster Maker",
      "description": "Generate timely and impactful posters for political campaigns based on current events and topics."
    },
    "profile": {
      "title": "Profile Picture Generator",
      "description": "Craft the perfect profile picture for LinkedIn, Instagram, or any platform using your headshot."
    },
    "logo": {
      "title": "AI Logo Generator",
      "description": "Generate unique logos for your brand, with or without a mascot from a headshot."
    },
    "image-enhancer": {
      "title": "AI Image Enhancer",
      "description": "Automatically improve image quality, lighting, and clarity with a single click. Upscale and refine."
    },
    "headshot-maker": {
      "title": "HQ Headshot Maker",
      "description": "Turn any photo into a professional, studio-quality 1:1 headshot, perfect for any profile."
    },
    "passport-photo": {
      "title": "Passport Photo Maker",
      "description": "Create official, compliant passport-size photos with background and outfit changes."
    },
    "visiting-card": {
      "title": "AI Visiting Card Maker",
      "description": "Design professional business cards with your name, title, contact details, and optional logo."
    },
    "event-poster": {
      "title": "AI Event Poster Maker",
      "description": "Turn your event photos into promotional posters by adding stylish text and branding."
    },
    "trend-post": {
      "title": "AI Trend-Based Post Generator",
      "description": "Discover trending topics related to your industry and automatically generate engaging social media posts about them."
    },
    "social-campaign": {
      "title": "AI Social Media Content Factory",
      "description": "Turn a single topic into a complete, multi-platform social media campaign, generating text and images for all major networks."
    }
  },
  "toolCard": {
    "launch": "Launch Tool",
    "soon": "Coming Soon"
  },
  "historySidebar": {
    "title": "Liked Creations",
    "placeholder": "Search history...",
    "clearTooltip": "Clear all creations",
    "signInTitle": "Sign In to See Your Creations",
    "signInDescription": "Log in to save and view your liked creations across sessions.",
    "noResults": "No matching creations found.",
    "empty": "Your liked creations will appear here."
  },
  "socialConnect": {
    "connectedTitle": "You're Connected!",
    "connectTitle": "Connect Your Social Accounts",
    "connectedDescription": "You have connected {{count}} account(s). You can now leverage one-click posting in the Social Media Post Generator.",
    "connectDescription": "Enable one-click posting by connecting your social media profiles. Secure and easy to set up."
  },
  "authModal": {
    "title": "Join DreamPixel",
    "description": "Sign in to save your creations, access your history, and unlock all features.",
    "googleButton": "Sign in with Google",
    "redirecting": "Redirecting..."
  },
  "feedbackModal": {
    "title": "Share Your Feedback",
    "description": "We'd love to hear your thoughts on what's working well and what we can improve.",
    "label": "Your Feedback",
    "placeholder": "Tell us about your experience...",
    "errorMinLength": "Please provide at least 10 characters of feedback.",
    "errorMaxLength": "Feedback cannot exceed {{maxLength}} characters.",
    "submit": "Submit Feedback",
    "submitting": "Submitting...",
    "cancel": "Cancel",
    "thankYouTitle": "Thank you!",
    "thankYouDescription": "Your feedback has been received."
  },
  "templateBrowser": {
    "title": "Choose a Template",
    "empty": "No templates available for this tool yet."
  },
  "imageCropper": {
    "title": "Crop Your Image",
    "cropButton": "Crop Image",
    "croppingButton": "Cropping...",
    "cancel": "Cancel"
  },
  "common": {
    "optional": "(Optional)",
    "browseTemplates": "Browse Templates",
    "backToSettings": "Back to Settings",
    "backToConcepts": "Back to Concepts",
    "regenerate": "Regenerate",
    "likeAndSave": "Like & Save Creation",
    "saved": "Saved!",
    "download": "Download",
    "back": "Back",
    "copy": "Copy",
    "copied": "Copied!",
    "chooseConceptTitle": "Choose Your Concept",
    "chooseConceptSubtitle": "Select a concept below to generate your final creation.",
    "recommended": "Recommended",
    "reason": "Reason",
    "generatingMessage": "This can take up to a minute. Please don't close the window.",
    "uploadLabel": "Click to upload or drag & drop",
    "addMoreImages": "You can add {{count}} more images."
  },
  "toolShared": {
    "errorHeadshotRequired": "A headshot is required to generate concepts.",
    "errorImageFailed": "The AI failed to generate an image. Please try another concept.",
    "errorConceptsFailed": "Failed to generate concepts.",
    "loading": {
      "analyzing": "Analyzing details...",
      "brainstorming": "Brainstorming ideas...",
      "crafting": "Crafting concepts...",
      "finalizing": "Finalizing suggestions...",
      "generating": {
        "init": "Initializing AI design canvas...",
        "integrating": "Integrating likeness...",
        "applyingStyle": "Applying styles...",
        "rendering": "Rendering final pixels...",
        "polishing": "Polishing the masterpiece...",
        "almostDone": "Almost there..."
      }
    }
  },
  "trendPostGenerator": {
    "title": "AI Trend-Based Post Generator",
    "subtitle": "Leverage real-time trends to create relevant and timely content automatically.",
    "step1Title": "1. Enter a Base Keyword",
    "step1Desc": "Provide a broad keyword for your industry (e.g., 'Technology', 'Finance', 'Fashion'). The AI will find related trending topics.",
    "keywordPlaceholder": "e.g., Artificial Intelligence",
    "findTrendsButton": "Find Trending Topics",
    "findingTrends": "Searching for trends...",
    "step2Title": "2. Select a Trending Topic",
    "step2Desc": "Choose one of the current trending topics below to create a post about.",
    "noTrendsFound": "No relevant trends found. Please try a different keyword.",
    "step3Title": "3. Choose a Visual Style",
    "step3Desc": "Select a visual style for the image part of your post.",
    "generateConceptsButton": "Generate Post Concepts",
    "generatingConcepts": "Generating concepts...",
    "chooseConceptTitle": "Choose Your Post Concept",
    "chooseConceptSubtitle": "Select a concept to generate the final image and caption."
  },
  "thumbnailGenerator": {
    "step1Title": "1. Powered by Google Gemini",
    "step1Desc": "Using state-of-the-art models for the best results. The default API key is used for all generations.",
    "conceptGen": "Concept Generation",
    "thumbnailGen": "Thumbnail Generation",
    "step2UploadTitle": "2. Upload Headshots",
    "step2UploadDesc": "Provide 1-5 images for the best face accuracy.",
    "step3Describe": "2. Describe Your Video"
  },
  "socialCampaignFactory": {
    "title": "AI Social Media Content Factory",
    "subtitle": "Turn one idea into a full social media campaign for 7+ platforms in a single click.",
    "step1Title": "1. Define Your Core Message",
    "topicLabel": "Topic",
    "topicPlaceholder": "e.g., 'Launch of our new eco-friendly sneaker line'",
    "keywordsLabel": "Keywords",
    "keywordsPlaceholder": "e.g., 'sustainable fashion, sneakers, eco-friendly'",
    "linkLabel": "Link",
    "linkPlaceholder": "e.g., 'https://yourstore.com/new-sneakers'",
    "generateButton": "Generate Social Campaign",
    "generatingMessage": "Building your multi-platform campaign...",
    "resultsTitle": "Your AI-Generated Social Media Campaign",
    "resultsSubtitle": "Here is tailored content for each platform. Click 'Generate Image' to create visuals.",
    "imageSuggestion": "Image Suggestion",
    "videoSuggestion": "Video Suggestion",
    "generateImage": "Generate Image",
    "hashtags": "Hashtags",
    "cta": "Call to Action",
    "copyPost": "Copy Post",
    "errorCampaign": "Failed to generate the social media campaign. The AI may have returned an invalid format.",
    "saveCreation": "Like & Save Image"
  }
};

const hiTranslations = {
  "header": {
    "apiStatus": "API स्थिति",
    "feedback": "प्रतिक्रिया साझा करें",
    "login": "लॉग इन करें",
    "logout": "साइन आउट",
    "loginSignup": "लॉग इन / साइन अप",
    "status": {
      "valid": "स्थिर",
      "invalid": "विफल",
      "validating": "जाँच हो रही है...",
      "unknown": "अज्ञात"
    }
  },
  "footer": {
    "copyright": "© {{year}} ड्रीम पिक्सल टेक्नोलॉजी। सर्वाधिकार सुरक्षित।",
    "dbStatus": "डेटाबेस स्थिति",
    "dbConnecting": "डेटाबेस से कनेक्ट हो रहा है...",
    "dbConnected": "डेटाबेस कनेक्शन स्थिर है",
    "dbFailed": "डेटाबेस कनेक्शन विफल"
  },
  "landing": {
    "docTitle": "एआई कंटेंट क्रिएशन सुइट",
    "title": "एआई कंटेंट क्रिएशन सुइट",
    "subtitle": "आपकी सभी रचनात्मक जरूरतों के लिए एक मंच। सेकंडों में अपने ब्रांड, चैनल या अभियान के लिए शानदार विज़ुअल बनाएं।"
  },
  "tools": {
    "thumbnail": {
      "title": "यूट्यूब थंबनेल जेनरेटर",
      "description": "एक हेडशॉट और वीडियो विवरण प्रदान करके उच्च-प्रभाव वाले, क्लिक-योग्य थंबनेल बनाएं।"
    },
    "advertisement": {
      "title": "विज्ञापन बैनर जेनरेटर",
      "description": "अपने मार्केटिंग अभियानों और सोशल मीडिया के लिए तुरंत पेशेवर विज्ञापन बैनर बनाएं।"
    },
    "social": {
      "title": "सोशल मीडिया पोस्ट जेनरेटर",
      "description": "इंस्टाग्राम, फेसबुक और एक्स जैसे प्लेटफार्मों के लिए छवि और कैप्शन दोनों के साथ आकर्षक पोस्ट डिज़ाइन करें।"
    },
    "political": {
      "title": "राजनेता पोस्टर मेकर",
      "description": "वर्तमान घटनाओं और विषयों के आधार पर राजनीतिक अभियानों के लिए समय पर और प्रभावशाली पोस्टर बनाएं।"
    },
    "profile": {
      "title": "प्रोफ़ाइल पिक्चर जेनरेटर",
      "description": "अपने हेडशॉट का उपयोग करके लिंक्डइन, इंस्टाग्राम या किसी भी प्लेटफ़ॉर्म के लिए सही प्रोफ़ाइल चित्र बनाएं।"
    },
    "logo": {
      "title": "एआई लोगो जेनरेटर",
      "description": "अपने ब्रांड के लिए अद्वितीय लोगो बनाएं, चाहे हेडशॉट से शुभंकर के साथ या उसके बिना।"
    },
    "image-enhancer": {
      "title": "एआई इमेज एन्हांसर",
      "description": "एक क्लिक में छवि की गुणवत्ता, प्रकाश और स्पष्टता में स्वचालित रूप से सुधार करें। अपस्केल और रिफाइन करें।"
    },
    "headshot-maker": {
      "title": "मुख्यालय हेडशॉट मेकर",
      "description": "किसी भी फोटो को एक पेशेवर, स्टूडियो-गुणवत्ता वाले 1:1 हेडशॉट में बदलें, जो किसी भी प्रोफ़ाइल के लिए एकदम सही है।"
    },
    "passport-photo": {
      "title": "पासपोर्ट फोटो मेकर",
      "description": "बैकग्राउंड और आउटफिट परिवर्तन के साथ आधिकारिक, अनुपालन पासपोर्ट आकार की तस्वीरें बनाएं।"
    },
    "visiting-card": {
      "title": "एआई विजिटिंग कार्ड मेकर",
      "description": "अपने नाम, शीर्षक, संपर्क विवरण और वैकल्पिक लोगो के साथ पेशेवर व्यवसाय कार्ड डिज़ाइन करें।"
    },
    "event-poster": {
      "title": "एआई इवेंट पोस्टर मेकर",
      "description": "स्टाइलिश टेक्स्ट और ब्रांडिंग जोड़कर अपने ईवेंट फ़ोटो को प्रचार पोस्टर में बदलें।"
    },
    "trend-post": {
      "title": "एआई ट्रेंड-आधारित पोस्ट जेनरेटर",
      "description": "अपने उद्योग से संबंधित ट्रेंडिंग विषयों की खोज करें और स्वचालित रूप से उनके बारे में आकर्षक सोशल मीडिया पोस्ट बनाएं।"
    },
    "social-campaign": {
      "title": "एआई सोशल मीडिया कंटेंट फैक्ट्री",
      "description": "एक ही विषय को एक संपूर्ण, मल्टी-प्लेटफ़ॉर्म सोशल मीडिया अभियान में बदलें, सभी प्रमुख नेटवर्कों के लिए टेक्स्ट और छवियां उत्पन्न करें।"
    }
  },
  "toolCard": {
    "launch": "टूल लॉन्च करें",
    "soon": "जल्द आ रहा है"
  },
  "historySidebar": {
    "title": "पसंद की गई रचनाएँ",
    "placeholder": "इतिहास खोजें...",
    "clearTooltip": "सभी रचनाएँ साफ़ करें",
    "signInTitle": "अपनी रचनाएँ देखने के लिए साइन इन करें",
    "signInDescription": "सत्रों में अपनी पसंद की रचनाओं को सहेजने और देखने के लिए लॉग इन करें।",
    "noResults": "कोई मेल खाने वाली रचना नहीं मिली।",
    "empty": "आपकी पसंद की गई रचनाएँ यहाँ दिखाई देंगी।"
  },
  "socialConnect": {
    "connectedTitle": "आप कनेक्टेड हैं!",
    "connectTitle": "अपने सोशल अकाउंट कनेक्ट करें",
    "connectedDescription": "आपने {{count}} अकाउंट कनेक्ट किए हैं। अब आप सोशल मीडिया पोस्ट जेनरेटर में एक-क्लिक पोस्टिंग का लाभ उठा सकते हैं।",
    "connectDescription": "अपने सोशल मीडिया प्रोफाइल को कनेक्ट करके एक-क्लिक पोस्टिंग सक्षम करें। सुरक्षित और स्थापित करने में आसान।"
  },
  "authModal": {
    "title": "ड्रीमपिक्सल से जुड़ें",
    "description": "अपनी रचनाओं को सहेजने, अपने इतिहास तक पहुंचने और सभी सुविधाओं को अनलॉक करने के लिए साइन इन करें।",
    "googleButton": "Google से साइन इन करें",
    "redirecting": "रीडायरेक्ट कर रहा है..."
  },
  "feedbackModal": {
    "title": "अपनी प्रतिक्रिया साझा करें",
    "description": "हम यह सुनना पसंद करेंगे कि क्या अच्छा काम कर रहा है और हम क्या सुधार सकते हैं।",
    "label": "आपकी प्रतिक्रिया",
    "placeholder": "हमें अपने अनुभव के बारे में बताएं...",
    "errorMinLength": "कृपया कम से कम 10 वर्णों की प्रतिक्रिया प्रदान करें।",
    "errorMaxLength": "प्रतिक्रिया {{maxLength}} वर्णों से अधिक नहीं हो सकती।",
    "submit": "प्रतिक्रिया भेजें",
    "submitting": "भेजा जा रहा है...",
    "cancel": "रद्द करें",
    "thankYouTitle": "धन्यवाद!",
    "thankYouDescription": "आपकी प्रतिक्रिया प्राप्त हो गई है।"
  },
  "templateBrowser": {
    "title": "एक टेम्पलेट चुनें",
    "empty": "इस टूल के लिए अभी तक कोई टेम्पलेट उपलब्ध नहीं है।"
  },
  "imageCropper": {
    "title": "अपनी छवि काटें",
    "cropButton": "छवि काटें",
    "croppingButton": "काट रहा है...",
    "cancel": "रद्द करें"
  },
  "common": {
    "optional": "(वैकल्पिक)",
    "browseTemplates": "टेम्पलेट ब्राउज़ करें",
    "backToSettings": "सेटिंग्स पर वापस",
    "backToConcepts": "अवधारणाओं पर वापस",
    "regenerate": "पुनः उत्पन्न करें",
    "likeAndSave": "रचना को पसंद करें और सहेजें",
    "saved": "सहेजा गया!",
    "download": "डाउनलोड",
    "back": "वापस",
    "copy": "कॉपी",
    "copied": "कॉपी किया गया!",
    "chooseConceptTitle": "अपनी अवधारणा चुनें",
    "chooseConceptSubtitle": "अपनी अंतिम रचना बनाने के लिए नीचे दी गई एक अवधारणा चुनें।",
    "recommended": "अनुशंसित",
    "reason": "कारण",
    "generatingMessage": "इसमें एक मिनट तक लग सकता है। कृपया विंडो बंद न करें।",
    "uploadLabel": "अपलोड करने के लिए क्लिक करें या खींचें और छोड़ें",
    "addMoreImages": "आप {{count}} और छवियाँ जोड़ सकते हैं।"
  },
  "trendPostGenerator": {
    "title": "एआई ट्रेंड-आधारित पोस्ट जेनरेटर",
    "subtitle": "प्रासंगिक और समय पर सामग्री बनाने के लिए रीयल-टाइम ट्रेंड का लाभ उठाएं।",
    "step1Title": "1. एक आधार कीवर्ड दर्ज करें",
    "step1Desc": "अपने उद्योग के लिए एक व्यापक कीवर्ड प्रदान करें (जैसे, 'प्रौद्योगिकी', 'वित्त', 'फैशन')। एआई संबंधित ट्रेंडिंग विषय ढूंढेगा।",
    "keywordPlaceholder": "जैसे, आर्टिफिशियल इंटेलिजेंस",
    "findTrendsButton": "ट्रेंडिंग विषय खोजें",
    "findingTrends": "ट्रेंड खोजा जा रहा है...",
    "step2Title": "2. एक ट्रेंडिंग विषय चुनें",
    "step2Desc": "पोस्ट बनाने के लिए नीचे दिए गए वर्तमान ट्रेंडिंग विषयों में से एक चुनें।",
    "noTrendsFound": "कोई प्रासंगिक ट्रेंड नहीं मिला। कृपया कोई दूसरा कीवर्ड आज़माएँ।",
    "step3Title": "3. एक विज़ुअल स्टाइल चुनें",
    "step3Desc": "अपनी पोस्ट की छवि के लिए एक विज़ुअल स्टाइल चुनें।",
    "generateConceptsButton": "पोस्ट अवधारणाएँ उत्पन्न करें",
    "generatingConcepts": "अवधारणाएँ उत्पन्न हो रही हैं...",
    "chooseConceptTitle": "अपनी पोस्ट अवधारणा चुनें",
    "chooseConceptSubtitle": "अंतिम छवि और कैप्शन बनाने के लिए एक अवधारणा चुनें।"
  },
  "socialCampaignFactory": {
    "title": "एआई सोशल मीडिया कंटेंट फैक्ट्री",
    "subtitle": "एक विचार को एक क्लिक में 7+ प्लेटफार्मों के लिए पूर्ण सोशल मीडिया अभियान में बदलें।",
    "step1Title": "1. अपना मुख्य संदेश परिभाषित करें",
    "topicLabel": "विषय",
    "topicPlaceholder": "जैसे, 'हमारी नई पर्यावरण-अनुकूल स्नीकर लाइन का लॉन्च'",
    "keywordsLabel": "कीवर्ड",
    "keywordsPlaceholder": "जैसे, 'टिकाऊ फैशन, स्नीकर्स, पर्यावरण-अनुकूल'",
    "linkLabel": "लिंक",
    "linkPlaceholder": "जैसे, 'https://yourstore.com/new-sneakers'",
    "generateButton": "सोशल अभियान उत्पन्न करें",
    "generatingMessage": "आपके मल्टी-प्लेटफ़ॉर्म अभियान का निर्माण हो रहा है...",
    "resultsTitle": "आपका एआई-जनित सोशल मीडिया अभियान",
    "resultsSubtitle": "यहाँ प्रत्येक प्लेटफ़ॉर्म के लिए अनुकूलित सामग्री है। विज़ुअल बनाने के लिए 'छवि उत्पन्न करें' पर क्लिक करें।",
    "imageSuggestion": "छवि सुझाव",
    "videoSuggestion": "वीडियो सुझाव",
    "generateImage": "छवि उत्पन्न करें",
    "hashtags": "हैशटैग",
    "cta": "कॉल टू एक्शन",
    "copyPost": "पोस्ट कॉपी करें",
    "errorCampaign": "सोशल मीडिया अभियान उत्पन्न करने में विफल। एआई ने अमान्य प्रारूप लौटाया हो सकता है।",
    "saveCreation": "छवि को पसंद करें और सहेजें"
  }
};

const translationsData: { [key: string]: any } = {
    en: enTranslations,
    hi: hiTranslations,
};

// --- CONTEXT SETUP ---

interface LocalizationContextType {
    locale: string;
    setLocale: (locale: string) => void;
    t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

export const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Helper to access nested keys like 'header.title'
const getNestedValue = (obj: any, key: string): string => {
    return key.split('.').reduce((acc, part) => acc && acc[part], obj) || key;
};

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [locale, setLocale] = useState('en');
    const [translations, setTranslations] = useState<any>(translationsData.en);

    useEffect(() => {
        setTranslations(translationsData[locale] || translationsData.en);
    }, [locale]);

    const t = useCallback((key: string, replacements: { [key: string]: string | number } = {}): string => {
        let translation = getNestedValue(translations, key);

        if (typeof translation === 'string') {
            Object.keys(replacements).forEach(placeholder => {
                const regex = new RegExp(`{{${placeholder}}}`, 'g');
                translation = translation.replace(regex, String(replacements[placeholder]));
            });
        }
        
        return translation || key;
    }, [translations]);

    return (
        <LocalizationContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LocalizationContext.Provider>
    );
};
