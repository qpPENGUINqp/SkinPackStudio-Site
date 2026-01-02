import JSZip from 'jszip';
import { SkinPack, Skin, SkinModel, ManifestJson, SkinsJson } from '../types/skin';
import { generateUUID } from './uuid';

/**
 * mcpack（ZIP形式）からスキンパックを読み込む
 */
export async function importSkinPack(file: File): Promise<SkinPack> {
  const zip = await JSZip.loadAsync(file);

  // manifest.json を読み込んでパック名を取得
  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) {
    throw new Error('manifest.json が見つかりません');
  }
  const manifestContent = await manifestFile.async('string');
  const manifest: ManifestJson = JSON.parse(manifestContent);
  const packName = manifest.header.name;

  // skins.json を読み込んでスキン情報を取得
  const skinsFile = zip.file('skins.json');
  if (!skinsFile) {
    throw new Error('skins.json が見つかりません');
  }
  const skinsContent = await skinsFile.async('string');
  const skinsJson: SkinsJson = JSON.parse(skinsContent);

  // texts/en_US.lang を読み込んでスキン名を取得
  const langFile = zip.file('texts/en_US.lang');
  const skinNames: Map<string, string> = new Map();
  if (langFile) {
    const langContent = await langFile.async('string');
    const lines = langContent.split('\n');
    for (const line of lines) {
      // skin.skinpack123.skinId=表示名
      const match = line.match(/^skin\.([^.]+)\.([^=]+)=(.+)$/);
      if (match) {
        const skinId = match[2];
        const displayName = match[3].trim();
        skinNames.set(skinId, displayName);
      }
    }
  }

  // スキンを読み込む
  const skins: Skin[] = [];
  for (const skinEntry of skinsJson.skins) {
    const textureFile = zip.file(skinEntry.texture);
    if (!textureFile) {
      console.warn(`スキン画像 ${skinEntry.texture} が見つかりません`);
      continue;
    }

    // 画像をBase64 Data URLに変換
    const imageBlob = await textureFile.async('blob');
    const texture = await blobToDataURL(imageBlob);

    // モデルタイプを判定
    const model: SkinModel =
      skinEntry.geometry === 'geometry.humanoid.customSlim' ? 'slim' : 'normal';

    // スキン名を取得（langファイルから、なければlocalization_name）
    const name = skinNames.get(skinEntry.localization_name) || skinEntry.localization_name;

    // 新しいIDを生成
    const id = generateUUID().replace(/-/g, '').substring(0, 8);

    skins.push({
      id,
      name,
      texture,
      model,
    });
  }

  return {
    name: packName,
    skins,
  };
}

/**
 * BlobをData URLに変換
 */
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * mcpackファイルからスキンのみを抽出する（パック名は無視）
 */
export async function extractSkinsFromPack(file: File): Promise<Skin[]> {
  const pack = await importSkinPack(file);
  return pack.skins;
}

/**
 * ファイル選択ダイアログを開いてmcpackファイルを選択させる
 */
export function selectMcpackFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mcpack,.zip';
    input.onchange = () => {
      const file = input.files?.[0] || null;
      resolve(file);
    };
    input.click();
  });
}
