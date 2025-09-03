

export type ToolType = 'thumbnail' | 'advertisement' | 'social' | 'political';

export interface Tool {
  id: ToolType;
  title: string;
  description: string;
  enabled: boolean;
}

export interface CreatorStyle {
  id: string;
  name: string;
  tags: string;
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
  stylePrompt: string;
}

export interface AdStyle {
    id: string;
    name: string;
    tags: string;
    stylePrompt: string;
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '1.91:1';

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

export interface GeneratedConcept {
  prompt: string;
  caption?: string;
  reason: string;
  isRecommended: boolean;
}

export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

export interface TemplatePrefillData {
    // Common
    styleId: string;
    aspectRatio: AspectRatio;
    // Thumbnail
    description?: string;
    thumbnailText?: string;
    // Political
    partyId?: string;
    eventTheme?: string;
    customText?: string;
    // Ad Banner
    productDescription?: string;
    headline?: string;
    brandDetails?: string;
    // Social
    topic?: string;
    platform?: string;
    tone?: string;
    callToAction?: string;
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
