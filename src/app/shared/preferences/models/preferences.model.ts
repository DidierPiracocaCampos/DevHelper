export interface CustomNasaImageI {
  storagePath: string;
  updatedAt: number;
}

export interface UserPreferencesI {
  id: 'singleton';
  customNasaImage?: CustomNasaImageI;
}
