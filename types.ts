
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

export type ApiProvider = 'default' | 'gemini' | 'openrouter' | 'perplexity';

export interface ApiConfig {
  provider: ApiProvider;
  geminiApiKey?: string;
  openRouterApiKey?: string;
  perplexityApiKey?: string;
}

export interface GeneratedConcept {
  prompt: string;
  reason: string;
  isRecommended: boolean;
}

export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';
