export enum AIProvider {
  GEMINI = 'GEMINI',
  OPENAI = 'OPENAI',
  GROQ = 'GROQ'
}

export interface BlogInput {
  title: string;
  content: string;
}

export interface GeneratedPrompt {
  id: number;
  overlayText: string; // Was title (Image Text Overlay)
  seoTitle: string; // Was pinTitle (SEO Metadata Title)
  tags: string[]; // SEO Keywords
  visualStyle: string;
  textColor: string;
  fontStyle: string;
  description?: string;
  isDescriptionLoading?: boolean;
}

export interface AppState {
  provider: AIProvider;
  apiKey: string;
  blogTitle: string;
  blogContent: string;
  isLoading: boolean;
  results: GeneratedPrompt[];
  error: string | null;
}