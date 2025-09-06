import { supabase } from './supabaseClient';
import { AspectRatio, UploadedFile } from '../types';

// Thumbnail Job
interface ThumbnailJobData {
    userId: string;
    description: string;
    thumbnailText: string;
    brandDetails: string;
    styleId: string;
    aspectRatio: AspectRatio;
    headshots: UploadedFile[];
}

export const saveThumbnailJob = async (data: ThumbnailJobData): Promise<void> => {
    try {
        const { error } = await supabase.from('thumbnail_generation_jobs').insert({
            user_id: data.userId,
            description: data.description,
            thumbnail_text: data.thumbnailText,
            brand_details: data.brandDetails,
            style_id: data.styleId,
            aspect_ratio: data.aspectRatio,
            headshot_filenames: data.headshots.map(h => h.name)
        });
        if (error) throw error;
    } catch (error) {
        console.error("Failed to save thumbnail generation job", error);
        // This is a non-critical logging action, so we don't block the user by re-throwing.
    }
};

// Political Poster Job
interface PoliticalPosterJobData {
    userId: string;
    partyId: string;
    eventTheme: string;
    customText: string;
    styleId: string;
    aspectRatio: AspectRatio;
    headshots: UploadedFile[];
}

export const savePoliticalPosterJob = async (data: PoliticalPosterJobData): Promise<void> => {
    try {
        const { error } = await supabase.from('political_poster_jobs').insert({
            user_id: data.userId,
            party_id: data.partyId,
            event_theme: data.eventTheme,
            custom_text: data.customText,
            style_id: data.styleId,
            aspect_ratio: data.aspectRatio,
            headshot_filenames: data.headshots.map(h => h.name),
        });
        if (error) throw error;
    } catch (error) {
        console.error("Failed to save political poster job", error);
    }
};

// Ad Banner Job
interface AdBannerJobData {
    userId: string;
    productDescription: string;
    headline: string;
    brandDetails: string;
    styleId: string;
    aspectRatio: AspectRatio;
    productImage: UploadedFile | null;
    modelHeadshot: UploadedFile | null;
}

export const saveAdBannerJob = async (data: AdBannerJobData): Promise<void> => {
    try {
        const { error } = await supabase.from('ad_banner_jobs').insert({
            user_id: data.userId,
            product_description: data.productDescription,
            headline: data.headline,
            brand_details: data.brandDetails,
            style_id: data.styleId,
            aspect_ratio: data.aspectRatio,
            product_image_filename: data.productImage?.name || null,
            model_headshot_filename: data.modelHeadshot?.name || null,
        });
        if (error) throw error;
    } catch (error) {
        console.error("Failed to save ad banner job", error);
    }
};

// Social Media Post Job
interface SocialPostJobData {
    userId: string;
    topic: string;
    platform: string;
    tone: string;
    callToAction: string;
    styleId: string;
    aspectRatio: AspectRatio;
}

export const saveSocialPostJob = async (data: SocialPostJobData): Promise<void> => {
    try {
        const { error } = await supabase.from('social_media_post_jobs').insert({
            user_id: data.userId,
            topic: data.topic,
            platform: data.platform,
            tone: data.tone,
            call_to_action: data.callToAction,
            style_id: data.styleId,
            aspect_ratio: data.aspectRatio,
        });
        if (error) throw error;
    } catch (error) {
        console.error("Failed to save social media post job", error);
    }
};

// Trend Post Job
interface TrendPostJobData {
    userId: string;
    baseKeyword: string;
    selectedTrend: string;
    styleId: string;
    aspectRatio: AspectRatio;
}

export const saveTrendPostJob = async (data: TrendPostJobData): Promise<void> => {
    try {
        const { error } = await supabase.from('trend_post_jobs').insert({
            user_id: data.userId,
            base_keyword: data.baseKeyword,
            selected_trend: data.selectedTrend,
            style_id: data.styleId,
            aspect_ratio: data.aspectRatio,
        });
        if (error) throw error;
    } catch (error) {
        console.error("Failed to save trend post job", error);
    }
};

// Social Campaign Job
interface SocialCampaignJobData {
    userId: string;
    topic: string;
    keywords: string;
    link: string;
    creatorName?: string;
    targetArea?: string;
    dressStyle?: string;
    headshots: UploadedFile[];
    sampleImage: UploadedFile | null;
    postLink: string;
}

export const saveSocialCampaignJob = async (data: SocialCampaignJobData): Promise<void> => {
    try {
        const { error } = await supabase.from('social_campaign_jobs').insert({
            user_id: data.userId,
            topic: data.topic,
            keywords: data.keywords,
            link: data.link,
            creator_name: data.creatorName,
            target_area: data.targetArea,
            dress_style: data.dressStyle,
            headshot_filenames: data.headshots.map(h => h.name),
            sample_image_filename: data.sampleImage?.name || null,
            post_link: data.postLink,
        });
        if (error) throw error;
    } catch (error) {
        console.error("Failed to save social campaign job", error);
    }
};


// Profile Image Job
interface ProfileImageJobData {
    userId: string;
    description: string;
    styleId: string;
    headshot: UploadedFile;
}

export const saveProfileImageJob = async (data: ProfileImageJobData): Promise<void> => {
    try {
        const { error } = await supabase.from('profile_image_generation_jobs').insert({
            user_id: data.userId,
            description: data.description,
            style_id: data.styleId,
            headshot_filenames: [data.headshot.name] // Stored as an array for consistency
        });
        if (error) throw error;
    } catch (error) {
        console.error("Failed to save profile image generation job", error);
    }
};

// Logo Job
interface LogoJobData {
    userId: string;
    companyName: string;
    slogan: string;
    description: string;
    styleId: string;
    headshot: UploadedFile | null;
}

export const saveLogoJob = async (data: LogoJobData): Promise<void> => {
    try {
        const { error } = await supabase.from('logo_generation_jobs').insert({
            user_id: data.userId,
            company_name: data.companyName,
            slogan: data.slogan,
            description: data.description,
            style_id: data.styleId,
            headshot_filename: data.headshot?.name || null
        });
        if (error) throw error;
    } catch (error) {
        console.error("Failed to save logo generation job", error);
    }
};

// Image Enhancer Job
interface ImageEnhancerJobData {
    userId: string;
    originalImageFilename: string;
}

export const saveImageEnhancerJob = async (data: ImageEnhancerJobData): Promise<void> => {
    try {
        const { error } = await supabase.from('image_enhancer_jobs').insert({
            user_id: data.userId,
            original_image_filename: data.originalImageFilename,
        });
        if (error) throw error;
    } catch (error) {
        console.error("Failed to save image enhancer job", error);
    }
};

// Headshot Maker Job
interface HeadshotMakerJobData {
    userId: string;
    description: string;
    styleId: string;
    originalImageFilename: string;
}

export const saveHeadshotMakerJob = async (data: HeadshotMakerJobData): Promise<void> => {
    try {
        const { error } = await supabase.from('headshot_maker_jobs').insert({
            user_id: data.userId,
            description: data.description,
            style_id: data.styleId,
            original_image_filename: data.originalImageFilename,
        });
        if (error) throw error;
    } catch (error) {
        console.error("Failed to save headshot maker job", error);
    }
};

// Passport Photo Job
interface PassportPhotoJobData {
    userId: string;
    styleId: string;
    sizeId: string;
    backgroundColor: string;
    photoCount: number;
    originalImageFilename: string;
}

export const savePassportPhotoJob = async (data: PassportPhotoJobData): Promise<void> => {
    try {
        const { error } = await supabase.from('passport_photo_jobs').insert({
            user_id: data.userId,
            style_id: data.styleId,
            size_id: data.sizeId,
            background_color: data.backgroundColor,
            photo_count: data.photoCount,
            original_image_filename: data.originalImageFilename,
        });
        if (error) throw error;
    } catch (error) {
        console.error("Failed to save passport photo job", error);
    }
};

// Visiting Card Job
interface VisitingCardJobData {
    userId: string;
    companyName: string;
    personName: string;
    title: string;
    contactInfo: string;
    styleId: string;
    logoFilename: string | null;
}

export const saveVisitingCardJob = async (data: VisitingCardJobData): Promise<void> => {
    try {
        const { error } = await supabase.from('visiting_card_jobs').insert({
            user_id: data.userId,
            company_name: data.companyName,
            person_name: data.personName,
            title: data.title,
            contact_info: data.contactInfo,
            style_id: data.styleId,
            logo_filename: data.logoFilename,
        });
        if (error) throw error;
    } catch (error) {
        console.error("Failed to save visiting card job", error);
    }
};

// Event Poster Job
interface EventPosterJobData {
    userId: string;
    headline: string;
    branding: string;
    styleId: string;
    originalImageFilename: string;
}

export const saveEventPosterJob = async (data: EventPosterJobData): Promise<void> => {
    try {
        const { error } = await supabase.from('event_poster_jobs').insert({
            user_id: data.userId,
            headline: data.headline,
            branding: data.branding,
            style_id: data.styleId,
            original_image_filename: data.originalImageFilename,
        });
        if (error) throw error;
    } catch (error) {
        console.error("Failed to save event poster job", error);
    }
};