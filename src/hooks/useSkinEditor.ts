import { useState, useCallback, useRef } from 'react';
import {
  PaintTool,
  EditorMode,
  SkinSize,
  SkinLayer,
  initialEditorState,
} from '../types/editor';
import { SkinModel } from '../types/skin';
import { getSkinTemplate, createBlankTemplate } from '../utils/skinTemplates';

const MAX_HISTORY = 50;

export interface UseSkinEditorOptions {
  initialTexture?: string;
  initialModel?: SkinModel;
  initialSize?: SkinSize;
}

export const useSkinEditor = (options: UseSkinEditorOptions = {}) => {
  const {
    initialTexture,
    initialModel = 'normal',
    initialSize = 64,
  } = options;

  // テクスチャ（Base64 DataURL）
  const [textureDataUrl, setTextureDataUrl] = useState<string>(
    initialTexture || getSkinTemplate(initialModel)
  );

  // エディター状態
  const [activeLayer, setActiveLayer] = useState<SkinLayer>(initialEditorState.activeLayer);
  const [tool, setTool] = useState<PaintTool>(initialEditorState.tool);
  const [color, setColor] = useState<string>(initialEditorState.color);
  const [mode, setMode] = useState<EditorMode>(initialEditorState.mode);
  const [size, setSize] = useState<SkinSize>(initialSize);
  const [model, setModel] = useState<SkinModel>(initialModel);
  const [showGrid, setShowGrid] = useState<boolean>(initialEditorState.showGrid);
  const [showBaseLayer, setShowBaseLayer] = useState<boolean>(initialEditorState.showBaseLayer);
  const [showOverlayLayer, setShowOverlayLayer] = useState<boolean>(initialEditorState.showOverlayLayer);

  // 履歴管理（初期テクスチャを履歴に含める）
  const [history, setHistory] = useState<string[]>([initialTexture || getSkinTemplate(initialModel)]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isUndoRedoRef = useRef<boolean>(false);

  // キャンバス参照（ペイント操作用）
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /**
   * Undo
   */
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoRef.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setTextureDataUrl(history[newIndex]);
    }
  }, [history, historyIndex]);

  /**
   * Redo
   */
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setTextureDataUrl(history[newIndex]);
    }
  }, [history, historyIndex]);

  /**
   * テクスチャを更新（履歴に追加）
   */
  const updateTexture = useCallback((newDataUrl: string) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    // 新しいテクスチャを履歴に追加
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newDataUrl);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
    setTextureDataUrl(newDataUrl);
  }, [historyIndex]);

  /**
   * ピクセルを塗る
   */
  const paintPixel = useCallback((x: number, y: number, paintColor?: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const actualColor = paintColor || color;

    // 消しゴムの場合は透明に
    if (tool === 'eraser') {
      ctx.clearRect(x, y, 1, 1);
    } else {
      ctx.fillStyle = actualColor;
      ctx.fillRect(x, y, 1, 1);
    }

    const newDataUrl = canvas.toDataURL('image/png');
    updateTexture(newDataUrl);
  }, [color, tool, updateTexture]);

  /**
   * 塗りつぶし（Flood Fill）
   */
  const floodFill = useCallback((startX: number, startY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const targetIndex = (startY * canvas.width + startX) * 4;
    const targetR = data[targetIndex];
    const targetG = data[targetIndex + 1];
    const targetB = data[targetIndex + 2];
    const targetA = data[targetIndex + 3];

    // 塗る色をRGBAに変換
    const fillColor = hexToRgba(tool === 'eraser' ? '#00000000' : color);

    // 同じ色なら何もしない
    if (
      targetR === fillColor.r &&
      targetG === fillColor.g &&
      targetB === fillColor.b &&
      targetA === fillColor.a
    ) {
      return;
    }

    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

      const idx = (y * canvas.width + x) * 4;
      if (
        data[idx] !== targetR ||
        data[idx + 1] !== targetG ||
        data[idx + 2] !== targetB ||
        data[idx + 3] !== targetA
      ) {
        continue;
      }

      visited.add(key);

      data[idx] = fillColor.r;
      data[idx + 1] = fillColor.g;
      data[idx + 2] = fillColor.b;
      data[idx + 3] = fillColor.a;

      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
    const newDataUrl = canvas.toDataURL('image/png');
    updateTexture(newDataUrl);
  }, [color, tool, updateTexture]);

  /**
   * スポイト（色を取得）
   */
  const pickColor = useCallback((x: number, y: number): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b, a] = imageData.data;

    if (a === 0) return null;

    const hex = rgbaToHex(r, g, b);
    setColor(hex);
    return hex;
  }, []);

  /**
   * テンプレートをリセット
   */
  const resetToTemplate = useCallback((templateModel?: SkinModel) => {
    const template = getSkinTemplate(templateModel || model);
    updateTexture(template);
    if (templateModel) {
      setModel(templateModel);
    }
  }, [model, updateTexture]);

  /**
   * 空白にクリア
   */
  const clearTexture = useCallback(() => {
    const blank = createBlankTemplate(size);
    updateTexture(blank);
  }, [size, updateTexture]);

  /**
   * 外部からテクスチャを読み込み
   */
  const loadTexture = useCallback((dataUrl: string, newModel?: SkinModel) => {
    updateTexture(dataUrl);
    if (newModel) {
      setModel(newModel);
    }
  }, [updateTexture]);

  /**
   * サイズ変更（テクスチャをリサイズ）
   */
  const changeSize = useCallback((newSize: SkinSize) => {
    if (newSize === size) return;

    // 現在のテクスチャをリサイズ
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = newSize;
      canvas.height = newSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // ピクセルアートなのでNearest Neighborでスケーリング
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, newSize, newSize);

      const resizedDataUrl = canvas.toDataURL('image/png');
      setSize(newSize);
      updateTexture(resizedDataUrl);
    };
    img.src = textureDataUrl;
  }, [size, textureDataUrl, updateTexture]);

  /**
   * Canvasを初期化
   */
  const initCanvas = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = textureDataUrl;
  }, [textureDataUrl]);

  return {
    // 状態
    textureDataUrl,
    activeLayer,
    tool,
    color,
    mode,
    size,
    model,
    showGrid,
    showBaseLayer,
    showOverlayLayer,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,

    // セッター
    setActiveLayer,
    setTool,
    setColor,
    setMode,
    setSize: changeSize,
    setModel,
    setShowGrid,
    setShowBaseLayer,
    setShowOverlayLayer,

    // アクション
    paintPixel,
    floodFill,
    pickColor,
    undo,
    redo,
    resetToTemplate,
    clearTexture,
    loadTexture,
    updateTexture,
    initCanvas,

    // 参照
    canvasRef,
  };
};

// ヘルパー関数
function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  // #RRGGBB or #RRGGBBAA
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0, a: 255 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: result[4] ? parseInt(result[4], 16) : 255,
  };
}

function rgbaToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}
