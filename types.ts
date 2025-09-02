// FIX: Manually define Vite's import.meta.env types to address missing type definitions.
// This provides type safety for environment variables accessed via `import.meta.env`.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_KEY: string;
      readonly VITE_SUPABASE_URL: string;
      readonly VITE_SUPABASE_ANON_KEY: string;
    };
  }
}



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

export type ApiProvider = 'default' | 'gemini' | 'openrouter' | 'openai';

export interface ApiConfig {
  provider: ApiProvider;
  geminiApiKey?: string;
  openRouterApiKey?: string;
  openaiApiKey?: string;
}

export interface GeneratedConcept {
  prompt: string;
  caption?: string;
  reason: string;
  isRecommended: boolean;
}

export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';