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
    "social-campaign": {
      "title": "AI Social Media Content Factory",
      "description": "Generate a full campaign, a single post, or content based on real-time trends, all from one powerful tool."
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
    "subtitle": "Generate a full campaign, a single post, or content based on real-time trends.",
    "modeCampaign": "Campaign Mode",
    "modeSingle": "Single Post Mode",
    "modeTrend": "Trend-Based Mode",
    "modeCampaignDesc": "Generate a full campaign for 7+ platforms from a single topic.",
    "modeSingleDesc": "Create a tailored image and caption for one specific social media platform.",
    "modeTrendDesc": "Find trending topics based on a keyword and generate a relevant post.",
    "step1Title": "1. Define Your Core Message",
    "step2Title": "2. Personalization & Style",
    "topicLabel": "Topic",
    "topicPlaceholder": "e.g., 'Launch of our new eco-friendly sneaker line'",
    "keywordsLabel": "Keywords",
    "keywordsPlaceholder": "e.g., 'sustainable fashion, sneakers, eco-friendly'",
    "linkLabel": "Link",
    "linkPlaceholder": "e.g., 'https://yourstore.com/new-sneakers'",
    "generateButton": "Generate Social Campaign",
    "generateConceptsButton": "Generate Post Concepts",
    "generatingMessage": "Building your multi-platform campaign...",
    "resultsTitle": "Your AI-Generated Social Media Campaign",
    "resultsSubtitle": "Here is tailored content for each platform. Click to generate visuals.",
    "imageSuggestion": "Image Suggestion",
    "videoSuggestion": "Video Suggestion",
    "generateImage": "Generate Image",
    "generateVideo": "Generate Video",
    "hashtags": "Hashtags",
    "cta": "Call to Action",
    "copyPost": "Copy Post",
    "errorCampaign": "Failed to generate the social media campaign. The AI may have returned an invalid format.",
    "saveCreation": "Like & Save Image",
    "saveVideo": "Like & Save Video",
    "downloadVideo": "Download Video",
    "videoGenerating": {
        "title": "Generating your video...",
        "message": "This can take a few minutes. Please keep this tab open.",
        "status1": "Warming up the video creation engine...",
        "status2": "Storyboarding the first few frames...",
        "status3": "Rendering high-definition scenes...",
        "status4": "Adding the final cinematic touches...",
        "status5": "Almost ready, preparing the video file..."
    },
    "languageLabel": "Content Language",
    "creatorNameLabel": "Name of Person/Leader",
    "creatorNamePlaceholder": "e.g., 'Narendra Modi', 'Your Name'",
    "editVideoScriptTitle": "Edit Video Script",
    "editVideoScriptDesc": "Review and edit the AI-generated script before creating your video.",
    "scriptLabel": "Video Script / Voiceover",
    "generateWithScript": "Generate Video with this Script",
    "postToPlatform": "Post to {{platform}}",
    "posting": "Posting...",
    "posted": "Posted!",
    "platformLabel": "Target Platform",
    "toneLabel": "Desired Tone",
    "callToActionLabel": "Call to Action",
    "baseKeywordLabel": "Enter a Base Keyword",
    "baseKeywordDesc": "Provide a broad keyword for your industry (e.g., 'Technology', 'Finance', 'Fashion'). The AI will find related trending topics.",
    "baseKeywordPlaceholder": "e.g., Artificial Intelligence",
    "findTrendsButton": "Find Trending Topics",
    "findingTrends": "Searching for trends...",
    "selectTrendLabel": "Select a Trending Topic",
    "selectTrendDesc": "Choose one of the current trending topics below to create a post about.",
    "noTrendsFound": "No relevant trends found. Please try a different keyword.",
    "chooseStyleLabel": "Choose a Visual Style",
    "targetAreaLabel": "Target Area/Region",
    "targetAreaPlaceholder": "e.g., 'Uttarakhand', 'Khatima'",
    "dressStyleLabel": "Dress/Outfit Style",
    "dressStylePlaceholder": "e.g., 'Traditional Kumaoni attire', 'formal business suit'",
    "headshotsLabel": "Headshots for Images",
    "uploadHeadshots": "Upload Headshots (up to 5)",
    "styleReferenceLabel": "Style Reference"
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
    "social-campaign": {
      "title": "एआई सोशल मीडिया कंटेंट फैक्ट्री",
      "description": "एक पूर्ण अभियान, एक एकल पोस्ट, या रीयल-टाइम ट्रेंड के आधार पर सामग्री उत्पन्न करें, सब कुछ एक शक्तिशाली टूल से।"
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
  "socialCampaignFactory": {
    "title": "एआई सोशल मीडिया कंटेंट फैक्ट्री",
    "subtitle": "एक पूर्ण अभियान, एक एकल पोस्ट, या रीयल-टाइम ट्रेंड के आधार पर सामग्री उत्पन्न करें।",
    "modeCampaign": "अभियान मोड",
    "modeSingle": "एकल पोस्ट मोड",
    "modeTrend": "ट्रेंड-आधारित मोड",
    "modeCampaignDesc": "एक ही विषय से 7+ प्लेटफार्मों के लिए एक पूर्ण अभियान उत्पन्न करें।",
    "modeSingleDesc": "एक विशिष्ट सोशल मीडिया प्लेटफॉर्म के लिए एक अनुकूलित छवि और कैप्शन बनाएं।",
    "modeTrendDesc": "एक कीवर्ड के आधार पर ट्रेंडिंग विषय खोजें और एक प्रासंगिक पोस्ट उत्पन्न करें।",
    "step1Title": "1. अपना मुख्य संदेश परिभाषित करें",
    "step2Title": "2. वैयक्तिकरण और शैली",
    "topicLabel": "विषय",
    "topicPlaceholder": "जैसे, 'हमारी नई पर्यावरण-अनुकूल स्नीकर लाइन का लॉन्च'",
    "keywordsLabel": "कीवर्ड",
    "keywordsPlaceholder": "जैसे, 'टिकाऊ फैशन, स्नीकर्स, पर्यावरण-अनुकूल'",
    "linkLabel": "लिंक",
    "linkPlaceholder": "जैसे, 'https://yourstore.com/new-sneakers'",
    "generateButton": "सोशल अभियान उत्पन्न करें",
    "generateConceptsButton": "पोस्ट अवधारणाएँ उत्पन्न करें",
    "generatingMessage": "आपके मल्टी-प्लेटफ़ॉर्म अभियान का निर्माण हो रहा है...",
    "resultsTitle": "आपका एआई-जनित सोशल मीडिया अभियान",
    "resultsSubtitle": "यहाँ प्रत्येक प्लेटफ़ॉर्म के लिए अनुकूलित सामग्री है। विज़ुअल बनाने के लिए क्लिक करें।",
    "imageSuggestion": "छवि सुझाव",
    "videoSuggestion": "वीडियो सुझाव",
    "generateImage": "छवि उत्पन्न करें",
    "hashtags": "हैशटैग",
    "cta": "कॉल टू एक्शन",
    "copyPost": "पोस्ट कॉपी करें",
    "errorCampaign": "सोशल मीडिया अभियान उत्पन्न करने में विफल। एआई ने अमान्य प्रारूप लौटाया हो सकता है।",
    "saveCreation": "छवि को पसंद करें और सहेजें",
    "generateVideo": "वीडियो उत्पन्न करें",
    "saveVideo": "वीडियो पसंद करें और सहेजें",
    "downloadVideo": "वीडियो डाउनलोड करें",
    "videoGenerating": {
        "title": "आपका वीडियो बन रहा है...",
        "message": "इसमें कुछ मिनट लग सकते हैं। कृपया यह टैब खुला रखें।",
        "status1": "वीडियो निर्माण इंजन शुरू हो रहा है...",
        "status2": "पहले कुछ फ्रेमों की स्टोरीबोर्डिंग हो रही है...",
        "status3": "उच्च-परिभाषा दृश्यों को प्रस्तुत किया जा रहा है...",
        "status4": "अंतिम सिनेमाई स्पर्श जोड़े जा रहे हैं...",
        "status5": "लगभग तैयार है, वीडियो फ़ाइल तैयार की जा रही है..."
    },
    "languageLabel": "सामग्री भाषा",
    "creatorNameLabel": "व्यक्ति/नेता का नाम",
    "creatorNamePlaceholder": "जैसे, 'नरेंद्र मोदी', 'आपका नाम'",
    "editVideoScriptTitle": "वीडियो स्क्रिप्ट संपादित करें",
    "editVideoScriptDesc": "अपना वीडियो बनाने से पहले AI-जनित स्क्रिप्ट की समीक्षा करें और उसे संपादित करें।",
    "scriptLabel": "वीडियो स्क्रिप्ट / वॉयसओवर",
    "generateWithScript": "इस स्क्रिप्ट के साथ वीडियो बनाएं",
    "postToPlatform": "{{platform}} पर पोस्ट करें",
    "posting": "पोस्ट हो रहा है...",
    "posted": "पोस्ट किया गया!",
    "platformLabel": "लक्षित प्लेटफार्म",
    "toneLabel": "वांछित टोन",
    "callToActionLabel": "कॉल टू एक्शन",
    "baseKeywordLabel": "एक आधार कीवर्ड दर्ज करें",
    "baseKeywordDesc": "अपने उद्योग के लिए एक व्यापक कीवर्ड प्रदान करें (जैसे, 'प्रौद्योगिकी')। एआई संबंधित ट्रेंडिंग विषय ढूंढेगा।",
    "baseKeywordPlaceholder": "जैसे, आर्टिफिशियल इंटेलिजेंस",
    "findTrendsButton": "ट्रेंडिंग विषय खोजें",
    "findingTrends": "ट्रेंड खोजा जा रहा है...",
    "selectTrendLabel": "एक ट्रेंडिंग विषय चुनें",
    "selectTrendDesc": "पोस्ट बनाने के लिए नीचे दिए गए वर्तमान ट्रेंडिंग विषयों में से एक चुनें।",
    "noTrendsFound": "कोई प्रासंगिक ट्रेंड नहीं मिला। कृपया कोई दूसरा कीवर्ड आज़माएँ।",
    "chooseStyleLabel": "एक विज़ुअल स्टाइल चुनें",
    "targetAreaLabel": "लक्षित क्षेत्र/इलाका",
    "targetAreaPlaceholder": "जैसे, 'उत्तराखंड', 'खटीमा'",
    "dressStyleLabel": "पोशाक/आउटफिट शैली",
    "dressStylePlaceholder": "जैसे, 'पारंपरिक कुमाऊंनी पोशाक', 'औपचारिक बिजनेस सूट'",
    "headshotsLabel": "छवियों के लिए हेडशॉट",
    "uploadHeadshots": "हेडशॉट अपलोड करें (5 तक)",
    "styleReferenceLabel": "शैली संदर्भ"
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
const getNestedValue = (obj: any, key: string): any => {
    return key.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [locale, setLocale] = useState('en');
    const [translations, setTranslations] = useState<any>(translationsData.en);

    useEffect(() => {
        setTranslations(translationsData[locale] || translationsData.en);
    }, [locale]);

    // FIX: Updated the `t` function to be more type-safe. The previous implementation had a logic path
    // that could lead TypeScript to infer a `string | number` return type in some cases. This new
    // implementation strictly checks if the retrieved translation value is a string before processing,
    // ensuring the function always returns a string and resolving downstream type errors.
    const t = useCallback((key: string, replacements: { [key: string]: string | number } = {}): string => {
        const translation = getNestedValue(translations, key);

        if (typeof translation !== 'string') {
            return key;
        }

        let processedTranslation = translation;

        Object.keys(replacements).forEach(placeholder => {
            const regex = new RegExp(`{{${placeholder}}}`, 'g');
            processedTranslation = processedTranslation.replace(regex, String(replacements[placeholder]));
        });
        
        return processedTranslation;
    }, [translations]);

    return (
        <LocalizationContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LocalizationContext.Provider>
    );
};
