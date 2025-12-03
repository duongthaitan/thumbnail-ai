
export enum AspectRatio {
  RATIO_16_9 = '16:9',
  RATIO_4_3 = '4:3',
  RATIO_1_1 = '1:1',
  RATIO_9_16 = '9:16'
}

export enum ThumbnailStyle {
  CINEMATIC_3D = '3D Cinematic Animation (Pixar/Disney Style)',
  ANIME = 'Anime / Manga Style',
  REALISTIC = 'Hyper Realistic 4K',
  VECTOR_ART = 'Flat Vector Art',
  COMIC_BOOK = 'Comic Book / Pop Art',
  HYPER_VIRAL = 'Hyper-Viral (MrBeast Style - High Contrast, Shocked Face)',
  GTA_ART = 'GTA V Loading Screen Art Style',
  NEON_GAMING = 'Neon Cyberpunk Gaming (Valorant/LoL Style)',
  HORROR = 'Dark Horror / Creepypasta',
  TECH_MINIMALIST = 'Tech Review Minimalist (MKBHD Style)'
}

export interface ThumbnailRequest {
  mainText: string;
  subText: string;
  aspectRatio: AspectRatio;
  style: ThumbnailStyle;
  userPrompt: string;
  referenceImages: string[]; // Base64 strings
  apiKey?: string;
}

export interface GeneratedThumbnail {
  imageUrl: string;
  promptUsed: string;
}

export interface HistoryItem {
  id: string;
  imageUrl: string;
  mainText: string;
  timestamp: number;
  aspectRatio: AspectRatio;
}

export type Language = 'vi' | 'en';
export type Theme = 'light' | 'dark';
