import { SkinModel } from './skin';

/** ペイントツールの種類 */
export type PaintTool = 'brush' | 'bucket' | 'eraser' | 'eyedropper';

/** エディターの表示モード */
export type EditorMode = '3d' | 'flat';

/** スキンのサイズ */
export type SkinSize = 64 | 128;

/** レイヤーの種類 */
export type SkinLayer = 'base' | 'overlay';

/** スキンの各部位の定義 */
export interface SkinPartDefinition {
  name: string;
  uvOffset: [number, number];
  size: [number, number, number]; // width, height, depth
}

/** 本体レイヤーの部位定義（64x64基準） */
export const BASE_LAYER_PARTS: SkinPartDefinition[] = [
  { name: 'head', uvOffset: [0, 0], size: [8, 8, 8] },
  { name: 'body', uvOffset: [16, 16], size: [8, 12, 4] },
  { name: 'rightArm', uvOffset: [40, 16], size: [4, 12, 4] },
  { name: 'leftArm', uvOffset: [32, 48], size: [4, 12, 4] },
  { name: 'rightLeg', uvOffset: [0, 16], size: [4, 12, 4] },
  { name: 'leftLeg', uvOffset: [16, 48], size: [4, 12, 4] },
];

/** オーバーレイレイヤーの部位定義（64x64基準） */
export const OVERLAY_LAYER_PARTS: SkinPartDefinition[] = [
  { name: 'headOverlay', uvOffset: [32, 0], size: [8, 8, 8] },
  { name: 'bodyOverlay', uvOffset: [16, 32], size: [8, 12, 4] },
  { name: 'rightArmOverlay', uvOffset: [40, 32], size: [4, 12, 4] },
  { name: 'leftArmOverlay', uvOffset: [48, 48], size: [4, 12, 4] },
  { name: 'rightLegOverlay', uvOffset: [0, 32], size: [4, 12, 4] },
  { name: 'leftLegOverlay', uvOffset: [0, 48], size: [4, 12, 4] },
];

/** エディターの状態 */
export interface EditorState {
  /** テクスチャのBase64 DataURL */
  textureDataUrl: string;
  /** アクティブなレイヤー */
  activeLayer: SkinLayer;
  /** 選択中のツール */
  tool: PaintTool;
  /** 現在の色（hex形式） */
  color: string;
  /** 表示モード（3D or 展開図） */
  mode: EditorMode;
  /** テクスチャサイズ */
  size: SkinSize;
  /** スキンモデル */
  model: SkinModel;
  /** グリッド表示 */
  showGrid: boolean;
  /** 履歴（Undo用） */
  history: string[];
  /** 現在の履歴インデックス */
  historyIndex: number;
  /** ベースレイヤーの表示/非表示 */
  showBaseLayer: boolean;
  /** オーバーレイレイヤーの表示/非表示 */
  showOverlayLayer: boolean;
}

/** エディターの初期状態 */
export const initialEditorState: Omit<EditorState, 'textureDataUrl'> = {
  activeLayer: 'base',
  tool: 'brush',
  color: '#000000',
  mode: '3d',
  size: 64,
  model: 'normal',
  showGrid: true,
  history: [],
  historyIndex: -1,
  showBaseLayer: true,
  showOverlayLayer: true,
};

/** デフォルトのカラーパレット */
export const DEFAULT_PALETTE_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#808080', '#C0C0C0', '#800000', '#008000',
  '#000080', '#808000', '#800080', '#008080', '#FFA500', '#A52A2A',
  '#FFD700', '#90EE90', '#ADD8E6', '#FFC0CB', '#E6E6FA', '#F5DEB3',
];

/** 各部位のUV領域を取得（レイヤーに応じて） */
export function getLayerUVRegions(layer: SkinLayer, size: SkinSize): SkinPartDefinition[] {
  const scale = size / 64;
  const parts = layer === 'base' ? BASE_LAYER_PARTS : OVERLAY_LAYER_PARTS;

  return parts.map(part => ({
    ...part,
    uvOffset: [part.uvOffset[0] * scale, part.uvOffset[1] * scale] as [number, number],
    size: [part.size[0] * scale, part.size[1] * scale, part.size[2] * scale] as [number, number, number],
  }));
}
