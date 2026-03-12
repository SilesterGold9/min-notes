export type Note = {
  id: string;
  title: string;
  content: string; // HTML content
  folderId: string | null;
  updatedAt: number;
  tags?: string[];
};

export type Folder = {
  id: string;
  name: string;
};

export type UserPreferences = {
  name: string;
  themeColor: string;
  darkMode: boolean;
  language: 'en' | 'pt';
  fontSize: 'small' | 'medium' | 'large';
  enableAI: boolean;
  showSplash: boolean;
  geminiApiKey?: string;
};
