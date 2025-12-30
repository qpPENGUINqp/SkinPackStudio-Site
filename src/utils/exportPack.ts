import JSZip from 'jszip';
import { Skin, SkinPack, ManifestJson, SkinsJson, SkinEntry } from '../types/skin';
import { generateUUID } from './uuid';

function generateManifest(packName: string): ManifestJson {
  return {
    header: {
      name: packName,
      version: [1, 0, 0],
      uuid: generateUUID(),
    },
    modules: [
      {
        type: 'skin_pack',
        version: [1, 0, 0],
        uuid: generateUUID(),
      },
    ],
    format_version: 1,
  };
}

function generateSkinsJson(skins: Skin[], packId: string): SkinsJson {
  const skinEntries: SkinEntry[] = skins.map((skin) => ({
    type: 'free',
    geometry: skin.model === 'slim' ? 'geometry.humanoid.customSlim' : 'geometry.humanoid.custom',
    localization_name: skin.id,
    texture: `${skin.id}.png`,
  }));

  return {
    skins: skinEntries,
    localization_name: packId,
    serialize_name: packId,
  };
}

function generateLangFile(packName: string, packId: string, skins: Skin[]): string {
  const lines: string[] = [];
  lines.push(`skinpack.${packId}=${packName}`);

  skins.forEach((skin) => {
    lines.push(`skin.${packId}.${skin.id}=${skin.name}`);
  });

  return lines.join('\n');
}

function dataURLToBlob(dataURL: string): Blob {
  const [header, base64] = dataURL.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

export async function exportSkinPack(skinPack: SkinPack): Promise<void> {
  const zip = new JSZip();
  const packId = `skinpack${Date.now()}`;

  // manifest.json
  const manifest = generateManifest(skinPack.name);
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // skins.json
  const skinsJson = generateSkinsJson(skinPack.skins, packId);
  zip.file('skins.json', JSON.stringify(skinsJson, null, 2));

  // texts folder
  const textsFolder = zip.folder('texts');
  if (textsFolder) {
    // en_US.lang
    const langContent = generateLangFile(skinPack.name, packId, skinPack.skins);
    textsFolder.file('en_US.lang', langContent);

    // languages.json
    textsFolder.file('languages.json', JSON.stringify(['en_US']));
  }

  // skin images
  skinPack.skins.forEach((skin) => {
    const blob = dataURLToBlob(skin.texture);
    zip.file(`${skin.id}.png`, blob);
  });

  // Generate and download
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${skinPack.name}.mcpack`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
