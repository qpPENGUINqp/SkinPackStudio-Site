import { SkinModel } from '../types/skin';

/**
 * Steve/Alexスキンのテンプレートを生成する
 * 64x64のスキンテクスチャをCanvas APIで描画し、Base64 DataURLとして返す
 */

// Steve（Normal）モデルの色定義
const STEVE_COLORS = {
  skin: '#c6a082',
  hair: '#614024',
  eyes: '#2f5280',
  shirt: '#00aaaa',
  pants: '#3d3d8e',
  shoes: '#444444',
};

// Alex（Slim）モデルの色定義
const ALEX_COLORS = {
  skin: '#f5d4b3',
  hair: '#c75c36',
  eyes: '#7cba61',
  shirt: '#6e9e40',
  pants: '#5a3a2b',
  shoes: '#343434',
};

/**
 * 指定された色でピクセルを塗る
 */
function fillRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/**
 * Steveスキンテンプレートを生成
 */
export function createSteveTemplate(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // 透明で初期化
  ctx.clearRect(0, 0, 64, 64);

  const c = STEVE_COLORS;

  // === 頭（Head） ===
  // 上面 (8, 0) - 8x8
  fillRect(ctx, 8, 0, 8, 8, c.hair);
  // 前面 (8, 8) - 8x8
  fillRect(ctx, 8, 8, 8, 8, c.skin);
  // 顔の詳細
  fillRect(ctx, 10, 12, 2, 1, c.eyes); // 左目
  fillRect(ctx, 14, 12, 2, 1, c.eyes); // 右目
  fillRect(ctx, 12, 14, 2, 1, '#a87d5f'); // 口
  // 右面 (0, 8)
  fillRect(ctx, 0, 8, 8, 8, c.skin);
  // 左面 (16, 8)
  fillRect(ctx, 16, 8, 8, 8, c.skin);
  // 背面 (24, 8)
  fillRect(ctx, 24, 8, 8, 8, c.hair);
  // 下面 (16, 0)
  fillRect(ctx, 16, 0, 8, 8, c.skin);

  // === 体（Body） ===
  // 上面 (20, 16) - 8x4
  fillRect(ctx, 20, 16, 8, 4, c.shirt);
  // 前面 (20, 20) - 8x12
  fillRect(ctx, 20, 20, 8, 12, c.shirt);
  // 右面 (16, 20) - 4x12
  fillRect(ctx, 16, 20, 4, 12, c.shirt);
  // 左面 (28, 20) - 4x12
  fillRect(ctx, 28, 20, 4, 12, c.shirt);
  // 背面 (32, 20) - 8x12
  fillRect(ctx, 32, 20, 8, 12, c.shirt);
  // 下面 (28, 16) - 8x4
  fillRect(ctx, 28, 16, 8, 4, c.shirt);

  // === 右腕（Right Arm） ===
  // 上面 (44, 16) - 4x4
  fillRect(ctx, 44, 16, 4, 4, c.shirt);
  // 前面 (44, 20) - 4x12
  fillRect(ctx, 44, 20, 4, 12, c.shirt);
  fillRect(ctx, 44, 28, 4, 4, c.skin); // 手
  // 右面 (40, 20)
  fillRect(ctx, 40, 20, 4, 12, c.shirt);
  fillRect(ctx, 40, 28, 4, 4, c.skin);
  // 左面 (48, 20)
  fillRect(ctx, 48, 20, 4, 12, c.shirt);
  fillRect(ctx, 48, 28, 4, 4, c.skin);
  // 背面 (52, 20)
  fillRect(ctx, 52, 20, 4, 12, c.shirt);
  fillRect(ctx, 52, 28, 4, 4, c.skin);
  // 下面 (48, 16)
  fillRect(ctx, 48, 16, 4, 4, c.skin);

  // === 左腕（Left Arm） ===
  // 上面 (36, 48)
  fillRect(ctx, 36, 48, 4, 4, c.shirt);
  // 前面 (36, 52)
  fillRect(ctx, 36, 52, 4, 12, c.shirt);
  fillRect(ctx, 36, 60, 4, 4, c.skin);
  // 右面 (32, 52)
  fillRect(ctx, 32, 52, 4, 12, c.shirt);
  fillRect(ctx, 32, 60, 4, 4, c.skin);
  // 左面 (40, 52)
  fillRect(ctx, 40, 52, 4, 12, c.shirt);
  fillRect(ctx, 40, 60, 4, 4, c.skin);
  // 背面 (44, 52)
  fillRect(ctx, 44, 52, 4, 12, c.shirt);
  fillRect(ctx, 44, 60, 4, 4, c.skin);
  // 下面 (40, 48)
  fillRect(ctx, 40, 48, 4, 4, c.skin);

  // === 右脚（Right Leg） ===
  // 上面 (4, 16)
  fillRect(ctx, 4, 16, 4, 4, c.pants);
  // 前面 (4, 20)
  fillRect(ctx, 4, 20, 4, 12, c.pants);
  fillRect(ctx, 4, 28, 4, 4, c.shoes);
  // 右面 (0, 20)
  fillRect(ctx, 0, 20, 4, 12, c.pants);
  fillRect(ctx, 0, 28, 4, 4, c.shoes);
  // 左面 (8, 20)
  fillRect(ctx, 8, 20, 4, 12, c.pants);
  fillRect(ctx, 8, 28, 4, 4, c.shoes);
  // 背面 (12, 20)
  fillRect(ctx, 12, 20, 4, 12, c.pants);
  fillRect(ctx, 12, 28, 4, 4, c.shoes);
  // 下面 (8, 16)
  fillRect(ctx, 8, 16, 4, 4, c.shoes);

  // === 左脚（Left Leg） ===
  // 上面 (20, 48)
  fillRect(ctx, 20, 48, 4, 4, c.pants);
  // 前面 (20, 52)
  fillRect(ctx, 20, 52, 4, 12, c.pants);
  fillRect(ctx, 20, 60, 4, 4, c.shoes);
  // 右面 (16, 52)
  fillRect(ctx, 16, 52, 4, 12, c.pants);
  fillRect(ctx, 16, 60, 4, 4, c.shoes);
  // 左面 (24, 52)
  fillRect(ctx, 24, 52, 4, 12, c.pants);
  fillRect(ctx, 24, 60, 4, 4, c.shoes);
  // 背面 (28, 52)
  fillRect(ctx, 28, 52, 4, 12, c.pants);
  fillRect(ctx, 28, 60, 4, 4, c.shoes);
  // 下面 (24, 48)
  fillRect(ctx, 24, 48, 4, 4, c.shoes);

  return canvas.toDataURL('image/png');
}

/**
 * Alexスキンテンプレートを生成（3ピクセル幅の腕）
 */
export function createAlexTemplate(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // 透明で初期化
  ctx.clearRect(0, 0, 64, 64);

  const c = ALEX_COLORS;

  // === 頭（Head） ===
  fillRect(ctx, 8, 0, 8, 8, c.hair);
  fillRect(ctx, 8, 8, 8, 8, c.skin);
  fillRect(ctx, 10, 12, 2, 1, c.eyes);
  fillRect(ctx, 14, 12, 2, 1, c.eyes);
  fillRect(ctx, 12, 14, 2, 1, '#d4a99c');
  fillRect(ctx, 0, 8, 8, 8, c.skin);
  fillRect(ctx, 16, 8, 8, 8, c.skin);
  fillRect(ctx, 24, 8, 8, 8, c.hair);
  fillRect(ctx, 16, 0, 8, 8, c.skin);

  // === 体（Body） ===
  fillRect(ctx, 20, 16, 8, 4, c.shirt);
  fillRect(ctx, 20, 20, 8, 12, c.shirt);
  fillRect(ctx, 16, 20, 4, 12, c.shirt);
  fillRect(ctx, 28, 20, 4, 12, c.shirt);
  fillRect(ctx, 32, 20, 8, 12, c.shirt);
  fillRect(ctx, 28, 16, 8, 4, c.shirt);

  // === 右腕（Right Arm）- 3ピクセル幅 ===
  fillRect(ctx, 44, 16, 3, 4, c.shirt);
  fillRect(ctx, 44, 20, 3, 12, c.shirt);
  fillRect(ctx, 44, 28, 3, 4, c.skin);
  fillRect(ctx, 40, 20, 4, 12, c.shirt);
  fillRect(ctx, 40, 28, 4, 4, c.skin);
  fillRect(ctx, 47, 20, 4, 12, c.shirt);
  fillRect(ctx, 47, 28, 4, 4, c.skin);
  fillRect(ctx, 51, 20, 3, 12, c.shirt);
  fillRect(ctx, 51, 28, 3, 4, c.skin);
  fillRect(ctx, 47, 16, 3, 4, c.skin);

  // === 左腕（Left Arm）- 3ピクセル幅 ===
  fillRect(ctx, 36, 48, 3, 4, c.shirt);
  fillRect(ctx, 36, 52, 3, 12, c.shirt);
  fillRect(ctx, 36, 60, 3, 4, c.skin);
  fillRect(ctx, 32, 52, 4, 12, c.shirt);
  fillRect(ctx, 32, 60, 4, 4, c.skin);
  fillRect(ctx, 39, 52, 4, 12, c.shirt);
  fillRect(ctx, 39, 60, 4, 4, c.skin);
  fillRect(ctx, 43, 52, 3, 12, c.shirt);
  fillRect(ctx, 43, 60, 3, 4, c.skin);
  fillRect(ctx, 39, 48, 3, 4, c.skin);

  // === 右脚（Right Leg） ===
  fillRect(ctx, 4, 16, 4, 4, c.pants);
  fillRect(ctx, 4, 20, 4, 12, c.pants);
  fillRect(ctx, 4, 28, 4, 4, c.shoes);
  fillRect(ctx, 0, 20, 4, 12, c.pants);
  fillRect(ctx, 0, 28, 4, 4, c.shoes);
  fillRect(ctx, 8, 20, 4, 12, c.pants);
  fillRect(ctx, 8, 28, 4, 4, c.shoes);
  fillRect(ctx, 12, 20, 4, 12, c.pants);
  fillRect(ctx, 12, 28, 4, 4, c.shoes);
  fillRect(ctx, 8, 16, 4, 4, c.shoes);

  // === 左脚（Left Leg） ===
  fillRect(ctx, 20, 48, 4, 4, c.pants);
  fillRect(ctx, 20, 52, 4, 12, c.pants);
  fillRect(ctx, 20, 60, 4, 4, c.shoes);
  fillRect(ctx, 16, 52, 4, 12, c.pants);
  fillRect(ctx, 16, 60, 4, 4, c.shoes);
  fillRect(ctx, 24, 52, 4, 12, c.pants);
  fillRect(ctx, 24, 60, 4, 4, c.shoes);
  fillRect(ctx, 28, 52, 4, 12, c.pants);
  fillRect(ctx, 28, 60, 4, 4, c.shoes);
  fillRect(ctx, 24, 48, 4, 4, c.shoes);

  return canvas.toDataURL('image/png');
}

/**
 * 空白（透明）のスキンテンプレートを生成
 */
export function createBlankTemplate(size: 64 | 128 = 64): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);
  return canvas.toDataURL('image/png');
}

/**
 * モデルタイプに応じたテンプレートを取得
 */
export function getSkinTemplate(model: SkinModel): string {
  return model === 'slim' ? createAlexTemplate() : createSteveTemplate();
}
