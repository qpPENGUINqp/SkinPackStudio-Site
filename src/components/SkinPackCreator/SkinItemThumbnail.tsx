import { VibesBackgroundColor } from '@freee_jp/vibes';

type SkinItemThumbnailProps = {
  texture: string;
  size?: number;
  isSlim: boolean;
};

// スキンパーツの定義（64x64テクスチャ基準）
type SkinPartDef = {
  // テクスチャ上の位置とサイズ
  srcX: number;
  srcY: number;
  srcW: number;
  srcH: number;
  // 表示位置（16x32基準）
  dstX: number;
  dstY: number;
};

const getSkinParts = (isSlim: boolean): SkinPartDef[] => {
  const armWidth = isSlim ? 3 : 4;
  const slimArmOffset = isSlim ? 1 : 0;

  return [
    // ベースレイヤー
    // 左腕 (front at 44, 20)
    { srcX: 44, srcY: 20, srcW: armWidth, srcH: 12, dstX: slimArmOffset, dstY: 8 },
    // 右腕 (front at 36, 52)
    { srcX: 36, srcY: 52, srcW: armWidth, srcH: 12, dstX: 12, dstY: 8 },
    // 左脚 (front at 4, 20)
    { srcX: 4, srcY: 20, srcW: 4, srcH: 12, dstX: 4, dstY: 20 },
    // 右脚 (front at 20, 52)
    { srcX: 20, srcY: 52, srcW: 4, srcH: 12, dstX: 8, dstY: 20 },
    // 胴体 (front at 20, 20)
    { srcX: 20, srcY: 20, srcW: 8, srcH: 12, dstX: 4, dstY: 8 },
    // 頭 (front at 8, 8)
    { srcX: 8, srcY: 8, srcW: 8, srcH: 8, dstX: 4, dstY: 0 },

    // オーバーレイレイヤー
    // 左腕オーバーレイ (front at 44, 36)
    { srcX: 44, srcY: 36, srcW: armWidth, srcH: 12, dstX: slimArmOffset, dstY: 8 },
    // 右腕オーバーレイ (front at 52, 52)
    { srcX: 52, srcY: 52, srcW: armWidth, srcH: 12, dstX: 12, dstY: 8 },
    // 左脚オーバーレイ (front at 4, 36)
    { srcX: 4, srcY: 36, srcW: 4, srcH: 12, dstX: 4, dstY: 20 },
    // 右脚オーバーレイ (front at 4, 52)
    { srcX: 4, srcY: 52, srcW: 4, srcH: 12, dstX: 8, dstY: 20 },
    // 胴体オーバーレイ (front at 20, 36)
    { srcX: 20, srcY: 36, srcW: 8, srcH: 12, dstX: 4, dstY: 8 },
    // 頭オーバーレイ (front at 40, 8)
    { srcX: 40, srcY: 8, srcW: 8, srcH: 8, dstX: 4, dstY: 0 },
  ];
};

// CSSベースでテクスチャパーツを切り出して表示するコンポーネント
const SkinPart = ({
  texture,
  part,
  scale,
  offsetX,
}: {
  texture: string;
  part: SkinPartDef;
  scale: number;
  offsetX: number;
}) => {
  // 表示サイズ
  const displayW = part.srcW * scale;
  const displayH = part.srcH * scale;

  // 表示位置
  const left = offsetX + part.dstX * scale;
  const top = part.dstY * scale;

  // background-size: テクスチャ全体を表示スケールに合わせる
  const bgSize = 64 * scale;

  // background-position: 切り出し位置（負の値）
  const bgPosX = -part.srcX * scale;
  const bgPosY = -part.srcY * scale;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: displayW,
        height: displayH,
        backgroundImage: `url(${texture})`,
        backgroundSize: `${bgSize}px ${bgSize}px`,
        backgroundPosition: `${bgPosX}px ${bgPosY}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    />
  );
};

export const SkinItemThumbnail = ({ texture, size = 48, isSlim }: SkinItemThumbnailProps) => {
  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: 4,
    overflow: 'hidden',
    background: VibesBackgroundColor,
    flexShrink: 0,
    position: 'relative',
  };

  // 16x32 のスキンを size に収める
  const scale = size / 32;
  const offsetX = (size - 16 * scale) / 2;

  const parts = getSkinParts(isSlim);

  return (
    <div style={containerStyle}>
      {parts.map((part, index) => (
        <SkinPart
          key={index}
          texture={texture}
          part={part}
          scale={scale}
          offsetX={offsetX}
        />
      ))}
    </div>
  );
};
