export type ToolType = 'thumbnail' | 'advertisement' | 'political' | 'profile' | 'logo' | 'image-enhancer' | 'headshot-maker' | 'passport-photo' | 'visiting-card' | 'event-poster' | 'social-campaign' | 'newspaper';

export type PageType = 'about' | 'contact' | 'privacy' | 'terms';
export type ViewType = ToolType | 'landing' | PageType;

export interface Tool {
  id: ToolType;
  description: string;
  enabled: boolean;
  title: string;
}

export interface CreatorStyle {
  id: string;
  name: string;
  tags: string;
  imageUrl: string;
  creatorStyle: string;
  mood: string;
  imageStyle: string;
}

export interface PoliticalParty {
  id: string;
  name: string;
  logoPrompt: string;
  colorScheme: string;
  ideologyPrompt?: string;
}

export interface PosterStyle {
  id: string;
  name: string;
  tags: string;
  imageUrl: string;
  stylePrompt: string;
}

export interface AdStyle {
    id: string;
    name: string;
    tags: string;
    imageUrl: string;
    stylePrompt: string;
}

export interface ProfilePictureStyle {
    id: string;
    name: string;
    tags: string;
    imageUrl: string;
    stylePrompt: string;
}

export interface LogoStyle {
    id: string;
    name: string;
    tags: string;
    imageUrl: string;
    stylePrompt: string;
}

export interface HeadshotStyle {
    id: string;
    name: string;
    tags: string;
    imageUrl: string;
    stylePrompt: string;
}

export interface PassportPhotoStyle {
    id: string;
    name: string;
    imageUrl: string;
    outfitPrompt: string;
}

export interface PassportPhotoSize {
    id: string;
    name: string;
    widthMM: number;
    heightMM: number;
    description: string;
}

export interface VisitingCardStyle {
    id: string;
    name: string;
    tags: string;
    imageUrl: string;
    stylePrompt: string;
}

export interface EventPosterStyle {
    id: string;
    name: string;
    tags: string;
    imageUrl: string;
    stylePrompt: string;
}

export interface NewspaperStyle {
    id: string;
    name: string;
    tags: string;
    imageUrl: string;
    stylePrompt: string;
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:5' | '1.91:1' | '3.5:2' | '2:3.5';

export interface UploadedFile {
    base64: string;
    mimeType: string;
    name: string;
}

export interface HistoryEntry {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
}

export interface StructuredPrompt {
  composition: string;
  lighting: string;
  color_palette: string;
  subject_details: string;
  extra_details: string;
}

export interface GeneratedConcept {
  prompt: string;
  structured_prompt: StructuredPrompt;
  caption?: string;
  reason: string;
  isRecommended: boolean;
}

export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

export interface TemplatePrefillData {
    styleId: string;
    aspectRatio?: AspectRatio;
    description?: string;
    thumbnailText?: string;
    partyId?: string;
    eventTheme?: string;
    customText?: string;
    productDescription?: string;
    headline?: string;
    brandDetails?: string;
    topic?: string;
    platform?: string;
    tone?: string;
    callToAction?: string;
    profileDescription?: string;
    logoDescription?: string;
    companyName?: string;
    slogan?: string;
    headshotDescription?: string;
    vcName?: string;
    vcTitle?: string;
    vcCompanyName?: string;
    vcContact?: string;
    epHeadline?: string;
    epBranding?: string;
    epDate?: string;
    epTime?: string;
    epVenue?: string;
}

export interface Template {
  id: string;
  name: string;
  tool: ToolType;
  imageUrl: string;
  prefill: TemplatePrefillData;
}

export interface ConnectedAccount {
  platform: string;
}

export interface PlatformPostConcept {
    post?: string;
    caption?: string;
    hashtags?: string[];
    call_to_action?: string;
    image_suggestion?: string;
    video_suggestion?: string;
    video_script?: string;
    title?: string;
    description?: string;
    text_post?: string;
}

export interface SocialCampaign {
    LinkedIn?: PlatformPostConcept;
    Instagram?: PlatformPostConcept;
    Facebook?: PlatformPostConcept;
    'X-Twitter'?: PlatformPostConcept;
    TikTok?: PlatformPostConcept;
    Threads?: PlatformPostConcept;
    YouTube_Shorts?: PlatformPostConcept;
}

export interface NewspaperLanguage {
  id: string;
  name: string;
}