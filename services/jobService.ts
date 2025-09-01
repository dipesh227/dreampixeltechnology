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
            headshot_filename: data.headshots.length > 0 ? data.headshots[0].name : null,
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
