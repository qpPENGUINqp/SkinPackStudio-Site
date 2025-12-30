export type SkinModel = 'slim' | 'normal';

export interface Skin {
  id: string;
  name: string;
  texture: string; // Base64 encoded PNG data URL
  model: SkinModel;
}

export interface SkinPack {
  name: string;
  skins: Skin[];
}

export interface ManifestJson {
  header: {
    name: string;
    version: [number, number, number];
    uuid: string;
  };
  modules: {
    type: 'skin_pack';
    version: [number, number, number];
    uuid: string;
  }[];
  format_version: number;
}

export interface SkinEntry {
  type: 'free';
  geometry: 'geometry.humanoid.customSlim' | 'geometry.humanoid.custom';
  localization_name: string;
  texture: string;
}

export interface SkinsJson {
  skins: SkinEntry[];
  localization_name: string;
  serialize_name: string;
}
