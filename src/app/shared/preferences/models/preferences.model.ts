export interface CustomNasaImageI {
  fileId: string;
  updatedAt: number;
}

export interface UserPreferencesI {
  id: 'singleton';
  customNasaImage?: CustomNasaImageI;
  aiAssistantEnabled?: boolean;
}
