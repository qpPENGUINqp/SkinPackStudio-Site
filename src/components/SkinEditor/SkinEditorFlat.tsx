import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { PaintTool, SkinSize } from '../../types/editor';

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #1a1a2e;
  overflow: hidden;
`;

const CanvasWrapper = styled.div`
  position: relative;
`;

const MainCanvas = styled.canvas`
  image-rendering: pixelated;
  cursor: crosshair;
`;

const GridCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  image-rendering: pixelated;
`;

const ZoomControls = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
`;

const ZoomButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background-color: #fff;
  }
`;

const ZoomLabel = styled.span`
  display: flex;
  align-items: center;
  padding: 0 12px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
`;

const PartLabels = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 200px;
`;

const PartLabel = styled.span<{ $color: string }>`
  padding: 2px 6px;
  background-color: ${(props) => props.$color};
  color: #fff;
  font-size: 10px;
  border-radius: 4px;
`;

interface SkinEditorFlatProps {
  textureDataUrl: string;
  size: SkinSize;
  showGrid: boolean;
  tool: PaintTool;
  color: string;
  onPickColor: (color: string) => void;
  onTextureUpdate: (dataUrl: string) => void;
  /** プレビューモード：操作無効、全体表示 */
  previewMode?: boolean;
}

// 部位ごとの色（グリッド表示用）
const PART_COLORS: Record<string, string> = {
  head: '#ef4444',
  body: '#3b82f6',
  rightArm: '#22c55e',
  leftArm: '#84cc16',
  rightLeg: '#f59e0b',
  leftLeg: '#eab308',
  headOverlay: '#dc2626',
  bodyOverlay: '#2563eb',
  rightArmOverlay: '#16a34a',
  leftArmOverlay: '#65a30d',
  rightLegOverlay: '#d97706',
  leftLegOverlay: '#ca8a04',
};

// 64x64基準での部位領域
const SKIN_REGIONS = [
  // 本体レイヤー
  { name: '頭', x: 0, y: 0, w: 32, h: 16, color: PART_COLORS.head },
  { name: '体', x: 16, y: 16, w: 24, h: 16, color: PART_COLORS.body },
  { name: '右腕', x: 40, y: 16, w: 16, h: 16, color: PART_COLORS.rightArm },
  { name: '右脚', x: 0, y: 16, w: 16, h: 16, color: PART_COLORS.rightLeg },
  { name: '左脚', x: 16, y: 48, w: 16, h: 16, color: PART_COLORS.leftLeg },
  { name: '左腕', x: 32, y: 48, w: 16, h: 16, color: PART_COLORS.leftArm },
  // オーバーレイレイヤー
  { name: '頭(帽子)', x: 32, y: 0, w: 32, h: 16, color: PART_COLORS.headOverlay },
  { name: '体(上着)', x: 16, y: 32, w: 24, h: 16, color: PART_COLORS.bodyOverlay },
  { name: '右腕(袖)', x: 40, y: 32, w: 16, h: 16, color: PART_COLORS.rightArmOverlay },
  { name: '右脚(ズボン)', x: 0, y: 32, w: 16, h: 16, color: PART_COLORS.rightLegOverlay },
  { name: '左脚(ズボン)', x: 0, y: 48, w: 16, h: 16, color: PART_COLORS.leftLegOverlay },
  { name: '左腕(袖)', x: 48, y: 48, w: 16, h: 16, color: PART_COLORS.leftArmOverlay },
];

export const SkinEditorFlat: React.FC<SkinEditorFlatProps> = ({
  textureDataUrl,
  size,
  showGrid,
  tool,
  color,
  onPickColor,
  onTextureUpdate,
  previewMode = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(6);
  const [isPainting, setIsPainting] = useState(false);
  const lastPaintPos = useRef<{ x: number; y: number } | null>(null);

  // パン（移動）状態
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPos = useRef<{ x: number; y: number } | null>(null);

  // プレビューモード時のズーム自動計算
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!previewMode || !containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [previewMode]);

  // プレビューモード時のズーム計算
  const previewZoom = useMemo(() => {
    if (!previewMode) return zoom;
    const minDim = Math.min(containerSize.width, containerSize.height);
    return Math.max(1, Math.floor(minDim / size));
  }, [previewMode, containerSize, size, zoom]);

  const effectiveZoom = previewMode ? previewZoom : zoom;

  const scale = size / 64;

  // テクスチャを読み込んでキャンバスに描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0);
    };
    img.src = textureDataUrl;
  }, [textureDataUrl, size]);

  // グリッドを描画
  useEffect(() => {
    const gridCanvas = gridCanvasRef.current;
    if (!gridCanvas || !showGrid) return;

    const ctx = gridCanvas.getContext('2d');
    if (!ctx) return;

    gridCanvas.width = size * effectiveZoom;
    gridCanvas.height = size * effectiveZoom;
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    // 部位の枠線を描画
    ctx.lineWidth = 2;
    SKIN_REGIONS.forEach((region) => {
      const x = region.x * scale * effectiveZoom;
      const y = region.y * scale * effectiveZoom;
      const w = region.w * scale * effectiveZoom;
      const h = region.h * scale * effectiveZoom;

      ctx.strokeStyle = region.color;
      ctx.strokeRect(x, y, w, h);
    });

    // ピクセルグリッドを描画
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= size; x++) {
      ctx.beginPath();
      ctx.moveTo(x * effectiveZoom, 0);
      ctx.lineTo(x * effectiveZoom, size * effectiveZoom);
      ctx.stroke();
    }
    for (let y = 0; y <= size; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * effectiveZoom);
      ctx.lineTo(size * effectiveZoom, y * effectiveZoom);
      ctx.stroke();
    }
  }, [showGrid, size, effectiveZoom, scale]);

  // マウス座標からピクセル座標に変換
  const getPixelCoords = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / effectiveZoom);
      const y = Math.floor((e.clientY - rect.top) / effectiveZoom);

      if (x < 0 || x >= size || y < 0 || y >= size) return null;
      return { x, y };
    },
    [size, effectiveZoom]
  );

  // ピクセルを塗る
  const paintAt = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (tool === 'eraser') {
        ctx.clearRect(x, y, 1, 1);
      } else if (tool === 'brush') {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }

      const newDataUrl = canvas.toDataURL('image/png');
      onTextureUpdate(newDataUrl);
    },
    [tool, color, onTextureUpdate]
  );

  // ブレゼンハムのアルゴリズムで線を描画
  const paintLine = useCallback(
    (x0: number, y0: number, x1: number, y1: number) => {
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;

      let x = x0;
      let y = y0;

      while (true) {
        paintAt(x, y);

        if (x === x1 && y === y1) break;

        const e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x += sx;
        }
        if (e2 < dx) {
          err += dx;
          y += sy;
        }
      }
    },
    [paintAt]
  );

  // 塗りつぶし
  const floodFillAt = useCallback(
    (startX: number, startY: number) => {
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
      onTextureUpdate(newDataUrl);
    },
    [color, tool, onTextureUpdate]
  );

  // スポイト
  const pickColorAt = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const imageData = ctx.getImageData(x, y, 1, 1);
      const [r, g, b, a] = imageData.data;

      if (a === 0) return null;

      return rgbaToHex(r, g, b);
    },
    []
  );

  // ホイールでズーム（passive: falseで登録）
  useEffect(() => {
    if (previewMode) return;
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      setZoom((z) => Math.max(1, Math.min(16, z + delta)));
    };

    // 右クリックメニュー無効化
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('contextmenu', handleContextMenu);
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [previewMode]);

  // マウスダウン処理（統合）
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // 右クリック or 中ボタン → パン開始
      if (e.button === 2 || e.button === 1) {
        e.preventDefault();
        setIsPanning(true);
        lastPanPos.current = { x: e.clientX, y: e.clientY };
        return;
      }

      // 左クリック → 塗り
      if (e.button === 0) {
        const coords = getPixelCoords(e);
        if (!coords) return;

        if (tool === 'brush' || tool === 'eraser') {
          setIsPainting(true);
          lastPaintPos.current = coords;
          paintAt(coords.x, coords.y);
        } else if (tool === 'bucket') {
          floodFillAt(coords.x, coords.y);
        } else if (tool === 'eyedropper') {
          const pickedColor = pickColorAt(coords.x, coords.y);
          if (pickedColor) {
            onPickColor(pickedColor);
          }
        }
      }
    },
    [tool, getPixelCoords, paintAt, floodFillAt, pickColorAt, onPickColor]
  );

  // マウス移動処理（統合）
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // パン中
      if (isPanning && lastPanPos.current) {
        const dx = e.clientX - lastPanPos.current.x;
        const dy = e.clientY - lastPanPos.current.y;
        setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        lastPanPos.current = { x: e.clientX, y: e.clientY };
        return;
      }

      // 塗り中
      if (isPainting) {
        const coords = getPixelCoords(e);
        if (!coords) return;

        if (lastPaintPos.current) {
          paintLine(
            lastPaintPos.current.x,
            lastPaintPos.current.y,
            coords.x,
            coords.y
          );
        } else {
          paintAt(coords.x, coords.y);
        }
        lastPaintPos.current = coords;
      }
    },
    [isPanning, isPainting, getPixelCoords, paintAt, paintLine]
  );

  // マウスアップ処理（統合）
  const handleMouseUp = useCallback(() => {
    setIsPainting(false);
    lastPaintPos.current = null;
    setIsPanning(false);
    lastPanPos.current = null;
  }, []);

  // マウスリーブ処理
  const handleMouseLeave = useCallback(() => {
    setIsPainting(false);
    lastPaintPos.current = null;
    setIsPanning(false);
    lastPanPos.current = null;
  }, []);

  // リセット（ダブルクリック）
  const handleReset = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
    setZoom(6);
  }, []);

  return (
    <Container
      ref={containerRef}
      onMouseDown={previewMode ? undefined : handleMouseDown}
      onMouseMove={previewMode ? undefined : handleMouseMove}
      onMouseUp={previewMode ? undefined : handleMouseUp}
      onMouseLeave={previewMode ? undefined : handleMouseLeave}
      onDoubleClick={previewMode ? undefined : handleReset}
    >
      <CanvasWrapper
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
        }}
      >
        <MainCanvas
          ref={canvasRef}
          style={{
            width: size * effectiveZoom,
            height: size * effectiveZoom,
            cursor: previewMode ? 'default' : (isPanning ? 'grabbing' : 'crosshair'),
          }}
        />
        {showGrid && (
          <GridCanvas
            ref={gridCanvasRef}
            style={{
              width: size * effectiveZoom,
              height: size * effectiveZoom,
            }}
          />
        )}
      </CanvasWrapper>

      {!previewMode && (
        <ZoomControls>
          <ZoomButton onClick={() => setZoom((z) => Math.max(1, z - 1))}>
            −
          </ZoomButton>
          <ZoomLabel>{effectiveZoom}x</ZoomLabel>
          <ZoomButton onClick={() => setZoom((z) => Math.min(16, z + 1))}>
            +
          </ZoomButton>
        </ZoomControls>
      )}

      {showGrid && !previewMode && (
        <PartLabels>
          {SKIN_REGIONS.slice(0, 6).map((region) => (
            <PartLabel key={region.name} $color={region.color}>
              {region.name}
            </PartLabel>
          ))}
        </PartLabels>
      )}
    </Container>
  );
};

// ヘルパー関数
function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
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
