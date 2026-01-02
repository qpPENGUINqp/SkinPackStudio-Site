import React, { Suspense, useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';
import { SkinModel } from '../../types/skin';
import { PaintTool } from '../../types/editor';

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 8px;
  overflow: hidden;
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const ControlsContainer = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
`;

const ControlButton = styled.button<{ $isActive: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background-color: ${(props) => (props.$isActive ? '#2563eb' : 'rgba(255, 255, 255, 0.9)')};
  color: ${(props) => (props.$isActive ? '#fff' : '#333')};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background-color: ${(props) => (props.$isActive ? '#1d4ed8' : '#fff')};
  }
`;

// UVマッピング関数
const createBoxUVs = (
  u: number,
  v: number,
  w: number,
  h: number,
  d: number,
  textureWidth: number,
  textureHeight: number
) => {
  const tw = textureWidth;
  const th = textureHeight;
  const uvs: number[] = [];

  // Right face (x+) - texture region: (u, v+d) to (u+d, v+d+h)
  uvs.push(
    (u + d) / tw, 1 - (v + d) / th,
    u / tw, 1 - (v + d) / th,
    (u + d) / tw, 1 - (v + d + h) / th,
    u / tw, 1 - (v + d + h) / th
  );

  // Left face (x-) - texture region: (u+d+w, v+d) to (u+d+w+d, v+d+h)
  uvs.push(
    (u + d + w + d) / tw, 1 - (v + d) / th,
    (u + d + w) / tw, 1 - (v + d) / th,
    (u + d + w + d) / tw, 1 - (v + d + h) / th,
    (u + d + w) / tw, 1 - (v + d + h) / th
  );

  // Top face (y+)
  uvs.push(
    (u + d) / tw, 1 - v / th,
    (u + d + w) / tw, 1 - v / th,
    (u + d) / tw, 1 - (v + d) / th,
    (u + d + w) / tw, 1 - (v + d) / th
  );

  // Bottom face (y-)
  uvs.push(
    (u + d + w) / tw, 1 - v / th,
    (u + d + w + w) / tw, 1 - v / th,
    (u + d + w) / tw, 1 - (v + d) / th,
    (u + d + w + w) / tw, 1 - (v + d) / th
  );

  // Front face (z+)
  uvs.push(
    (u + d) / tw, 1 - (v + d) / th,
    (u + d + w) / tw, 1 - (v + d) / th,
    (u + d) / tw, 1 - (v + d + h) / th,
    (u + d + w) / tw, 1 - (v + d + h) / th
  );

  // Back face (z-)
  uvs.push(
    (u + d + w + d) / tw, 1 - (v + d) / th,
    (u + d + w + d + w) / tw, 1 - (v + d) / th,
    (u + d + w + d) / tw, 1 - (v + d + h) / th,
    (u + d + w + d + w) / tw, 1 - (v + d + h) / th
  );

  return new Float32Array(uvs);
};

type BodyPartProps = {
  position: [number, number, number];
  size: [number, number, number];
  uvOffset: [number, number];
  texture: THREE.Texture;
  scale?: number;
  textureScale?: number;
  showGrid?: boolean;
  partName: string;
};

const BodyPart = ({
  position,
  size,
  uvOffset,
  texture,
  scale = 1,
  textureScale = 1,
  showGrid = false,
  partName,
}: BodyPartProps) => {
  const [w, h, d] = size;
  const [u, v] = uvOffset;
  const textureWidth = 64;
  const textureHeight = 64;

  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry((w / 8) * scale, (h / 8) * scale, (d / 8) * scale);
    const scaledU = u * textureScale;
    const scaledV = v * textureScale;
    const scaledW = w * textureScale;
    const scaledH = h * textureScale;
    const scaledD = d * textureScale;
    const scaledTW = textureWidth * textureScale;
    const scaledTH = textureHeight * textureScale;
    const uvs = createBoxUVs(scaledU, scaledV, scaledW, scaledH, scaledD, scaledTW, scaledTH);
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    return geo;
  }, [w, h, d, u, v, scale, textureScale]);

  const edgesGeometry = useMemo(() => {
    return new THREE.EdgesGeometry(geometry);
  }, [geometry]);

  return (
    <group position={position}>
      <mesh geometry={geometry} name={partName}>
        <meshBasicMaterial map={texture} side={THREE.FrontSide} alphaTest={0.1} transparent />
      </mesh>
      {showGrid && (
        <lineSegments geometry={edgesGeometry}>
          <lineBasicMaterial color={0xffffff} opacity={0.5} transparent />
        </lineSegments>
      )}
    </group>
  );
};

type PaintableCharacterProps = {
  textureDataUrl: string;
  isSlim: boolean;
  showGrid: boolean;
  showBaseLayer: boolean;
  showOverlayLayer: boolean;
  tool: PaintTool;
  color: string;
  onTextureUpdate: (dataUrl: string) => void;
  onPickColor: (color: string) => void;
  setIsPainting: (painting: boolean) => void;
  setIsHoveringModel: (hovering: boolean) => void;
};

const PaintableCharacter = ({
  textureDataUrl,
  isSlim,
  showGrid,
  showBaseLayer,
  showOverlayLayer,
  tool,
  color,
  onTextureUpdate,
  onPickColor,
  setIsPainting,
  setIsHoveringModel,
}: PaintableCharacterProps) => {
  const [textureScale, setTextureScale] = useState(1);
  const { camera, gl, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const lastPaintPos = useRef<{ x: number; y: number } | null>(null);
  const isRotating = useRef(false);
  const isPaintingRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const [, forceUpdate] = useState(0);

  // テクスチャをキャンバスに読み込み
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0);
      }
      canvasRef.current = canvas;
      setTextureScale(img.width / 64);

      // キャンバスからテクスチャを作成
      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.colorSpace = THREE.SRGBColorSpace;
      textureRef.current = tex;
      forceUpdate((v) => v + 1);
    };
    img.src = textureDataUrl;
  }, [textureDataUrl]);

  const skinTexture = textureRef.current;
  const textureSize = textureScale * 64;

  // UV座標からテクスチャのピクセル座標を取得
  const getPixelFromUV = useCallback((uv: THREE.Vector2) => {
    const x = Math.floor(uv.x * textureSize);
    const y = Math.floor((1 - uv.y) * textureSize);
    return { x, y };
  }, [textureSize]);

  // ピクセルを塗る
  const paintPixel = useCallback((x: number, y: number) => {
    if (!canvasRef.current || !textureRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (tool === 'eraser') {
      ctx.clearRect(x, y, 1, 1);
    } else if (tool === 'brush') {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }

    textureRef.current.needsUpdate = true;
  }, [tool, color]);

  // ブレゼンハムのアルゴリズムで線を描画
  const paintLine = useCallback((x0: number, y0: number, x1: number, y1: number) => {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
      paintPixel(x, y);

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
  }, [paintPixel]);

  // スポイト - 指定座標の色を取得
  const pickColorAt = useCallback((x: number, y: number): string | null => {
    if (!canvasRef.current) return null;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return null;

    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b, a] = imageData.data;
    if (a === 0) return null;

    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, []);

  // バケツ塗りつぶし（フラッドフィル）- bounds で面の範囲を制限
  const floodFill = useCallback((
    startX: number,
    startY: number,
    fillColor: string,
    bounds?: { minX: number; minY: number; maxX: number; maxY: number }
  ) => {
    if (!canvasRef.current || !textureRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // 境界を設定（指定がなければキャンバス全体）
    const minX = bounds ? Math.max(0, Math.floor(bounds.minX)) : 0;
    const minY = bounds ? Math.max(0, Math.floor(bounds.minY)) : 0;
    const maxX = bounds ? Math.min(width, Math.ceil(bounds.maxX)) : width;
    const maxY = bounds ? Math.min(height, Math.ceil(bounds.maxY)) : height;

    const getIndex = (x: number, y: number) => (y * width + x) * 4;
    const startIndex = getIndex(startX, startY);
    const targetR = data[startIndex];
    const targetG = data[startIndex + 1];
    const targetB = data[startIndex + 2];
    const targetA = data[startIndex + 3];

    // 塗りつぶし色をパース
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      } : { r: 0, g: 0, b: 0 };
    };
    const fill = hexToRgb(fillColor);

    // 同じ色ならスキップ
    if (targetR === fill.r && targetG === fill.g && targetB === fill.b && targetA === 255) return;

    const colorMatch = (index: number) =>
      data[index] === targetR &&
      data[index + 1] === targetG &&
      data[index + 2] === targetB &&
      data[index + 3] === targetA;

    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      // 境界チェック
      if (x < minX || x >= maxX || y < minY || y >= maxY) continue;

      const index = getIndex(x, y);
      if (!colorMatch(index)) continue;

      visited.add(key);
      data[index] = fill.r;
      data[index + 1] = fill.g;
      data[index + 2] = fill.b;
      data[index + 3] = 255;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
    textureRef.current.needsUpdate = true;
  }, []);

  // 面のUV範囲を計算（faceIndex: BoxGeometryの三角形インデックス）
  const getFaceBounds = useCallback((faceIndex: number, partName: string) => {
    // パーツごとのUVオフセットとサイズ
    const partInfo: Record<string, { u: number; v: number; w: number; h: number; d: number }> = {
      head: { u: 0, v: 0, w: 8, h: 8, d: 8 },
      body: { u: 16, v: 16, w: 8, h: 12, d: 4 },
      rightArm: { u: 40, v: 16, w: isSlim ? 3 : 4, h: 12, d: 4 },
      leftArm: { u: 32, v: 48, w: isSlim ? 3 : 4, h: 12, d: 4 },
      rightLeg: { u: 0, v: 16, w: 4, h: 12, d: 4 },
      leftLeg: { u: 16, v: 48, w: 4, h: 12, d: 4 },
      headOverlay: { u: 32, v: 0, w: 8, h: 8, d: 8 },
      bodyOverlay: { u: 16, v: 32, w: 8, h: 12, d: 4 },
      rightArmOverlay: { u: 40, v: 32, w: isSlim ? 3 : 4, h: 12, d: 4 },
      leftArmOverlay: { u: 48, v: 48, w: isSlim ? 3 : 4, h: 12, d: 4 },
      rightLegOverlay: { u: 0, v: 32, w: 4, h: 12, d: 4 },
      leftLegOverlay: { u: 0, v: 48, w: 4, h: 12, d: 4 },
    };

    const info = partInfo[partName];
    if (!info) return null;

    const { u, v, w, h, d } = info;
    const scale = textureScale;

    // BoxGeometryの面順序: 0-1: +X, 2-3: -X, 4-5: +Y, 6-7: -Y, 8-9: +Z, 10-11: -Z
    const faceType = Math.floor(faceIndex / 2);

    let minX: number, minY: number, maxX: number, maxY: number;

    switch (faceType) {
      case 0: // Right (+X)
        minX = u * scale;
        minY = (v + d) * scale;
        maxX = (u + d) * scale;
        maxY = (v + d + h) * scale;
        break;
      case 1: // Left (-X)
        minX = (u + d + w) * scale;
        minY = (v + d) * scale;
        maxX = (u + d + w + d) * scale;
        maxY = (v + d + h) * scale;
        break;
      case 2: // Top (+Y)
        minX = (u + d) * scale;
        minY = v * scale;
        maxX = (u + d + w) * scale;
        maxY = (v + d) * scale;
        break;
      case 3: // Bottom (-Y)
        minX = (u + d + w) * scale;
        minY = v * scale;
        maxX = (u + d + w + w) * scale;
        maxY = (v + d) * scale;
        break;
      case 4: // Front (+Z)
        minX = (u + d) * scale;
        minY = (v + d) * scale;
        maxX = (u + d + w) * scale;
        maxY = (v + d + h) * scale;
        break;
      case 5: // Back (-Z)
        minX = (u + d + w + d) * scale;
        minY = (v + d) * scale;
        maxX = (u + d + w + d + w) * scale;
        maxY = (v + d + h) * scale;
        break;
      default:
        return null;
    }

    return { minX, minY, maxX, maxY };
  }, [isSlim, textureScale]);

  // Raycasting でクリック/ドラッグ位置のUV座標を取得
  const handlePointerEvent = useCallback((event: PointerEvent, isDown: boolean = false) => {
    if (tool !== 'brush' && tool !== 'eraser' && tool !== 'eyedropper' && tool !== 'bucket') return;
    if (!isDown && !isPaintingRef.current) return;

    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    raycaster.current.setFromCamera(mouse, camera);

    // シーン内のすべてのメッシュを取得
    const meshes: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        meshes.push(obj);
      }
    });

    const intersects = raycaster.current.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      if (intersection.uv) {
        const { x, y } = getPixelFromUV(intersection.uv);

        if (tool === 'eyedropper') {
          const pickedColor = pickColorAt(x, y);
          if (pickedColor) {
            onPickColor(pickedColor);
          }
        } else if (tool === 'bucket') {
          // 面の範囲を取得して塗りつぶし
          const partName = intersection.object.name || '';
          const faceIndex = intersection.faceIndex ?? 0;
          const bounds = getFaceBounds(faceIndex, partName);
          floodFill(x, y, color, bounds || undefined);
        } else {
          if (lastPaintPos.current && isPaintingRef.current) {
            paintLine(lastPaintPos.current.x, lastPaintPos.current.y, x, y);
          } else {
            paintPixel(x, y);
          }
          lastPaintPos.current = { x, y };
        }
      }
    }
  }, [tool, color, gl, camera, scene, getPixelFromUV, onPickColor, pickColorAt, floodFill, getFaceBounds, paintLine, paintPixel]);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    // マウスダウン時にモデルに当たっているかチェック
    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.current.setFromCamera(mouse, camera);

    const meshes: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        meshes.push(obj);
      }
    });

    const intersects = raycaster.current.intersectObjects(meshes, false);

    if (intersects.length === 0) {
      // モデル外でマウスダウン → 回転モード
      isRotating.current = true;
      return;
    }

    // モデル上でマウスダウン → ペイントモード
    isRotating.current = false;
    if (tool === 'brush' || tool === 'eraser' || tool === 'eyedropper' || tool === 'bucket') {
      isPaintingRef.current = true;
      setIsPainting(true);
      lastPaintPos.current = null;
      handlePointerEvent(event, true);
    }
  }, [tool, setIsPainting, handlePointerEvent, gl, camera, scene]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    // 回転モード中はホバー状態を更新しない（回転を継続）
    if (isRotating.current) {
      return;
    }

    // モデル上にカーソルがあるかチェック
    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.current.setFromCamera(mouse, camera);

    const meshes: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        meshes.push(obj);
      }
    });

    const intersects = raycaster.current.intersectObjects(meshes, false);
    setIsHoveringModel(intersects.length > 0);

    if (isPaintingRef.current) {
      handlePointerEvent(event, false);
    }
  }, [handlePointerEvent, gl, camera, scene, setIsHoveringModel]);

  const handlePointerUp = useCallback(() => {
    // ペイント終了時に親に同期
    if (isPaintingRef.current && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onTextureUpdate(dataUrl);
    }
    isPaintingRef.current = false;
    setIsPainting(false);
    lastPaintPos.current = null;
    isRotating.current = false;
  }, [setIsPainting, onTextureUpdate]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [gl, handlePointerDown, handlePointerMove, handlePointerUp]);

  const armWidth = isSlim ? 3 : 4;
  const overlayScale = 1.1;

  if (!skinTexture) {
    return null;
  }

  return (
    <group position={[0, 0, 0]}>
      {/* Base layer */}
      {showBaseLayer && (
        <>
          <BodyPart position={[0, 1.5, 0]} size={[8, 8, 8]} uvOffset={[0, 0]} texture={skinTexture} textureScale={textureScale} showGrid={showGrid} partName="head" />
          <BodyPart position={[0, 0.25, 0]} size={[8, 12, 4]} uvOffset={[16, 16]} texture={skinTexture} textureScale={textureScale} showGrid={showGrid} partName="body" />
          <BodyPart position={[isSlim ? -0.6875 : -0.75, 0.25, 0]} size={[armWidth, 12, 4]} uvOffset={[40, 16]} texture={skinTexture} textureScale={textureScale} showGrid={showGrid} partName="rightArm" />
          <BodyPart position={[isSlim ? 0.6875 : 0.75, 0.25, 0]} size={[armWidth, 12, 4]} uvOffset={[32, 48]} texture={skinTexture} textureScale={textureScale} showGrid={showGrid} partName="leftArm" />
          <BodyPart position={[-0.25, -1.25, 0]} size={[4, 12, 4]} uvOffset={[0, 16]} texture={skinTexture} textureScale={textureScale} showGrid={showGrid} partName="rightLeg" />
          <BodyPart position={[0.25, -1.25, 0]} size={[4, 12, 4]} uvOffset={[16, 48]} texture={skinTexture} textureScale={textureScale} showGrid={showGrid} partName="leftLeg" />
        </>
      )}
      {/* Overlay layer */}
      {showOverlayLayer && (
        <>
          <BodyPart position={[0, 1.5, 0]} size={[8, 8, 8]} uvOffset={[32, 0]} texture={skinTexture} scale={overlayScale} textureScale={textureScale} showGrid={showGrid} partName="headOverlay" />
          <BodyPart position={[0, 0.25, 0]} size={[8, 12, 4]} uvOffset={[16, 32]} texture={skinTexture} scale={overlayScale} textureScale={textureScale} showGrid={showGrid} partName="bodyOverlay" />
          <BodyPart position={[isSlim ? -0.6875 : -0.75, 0.25, 0]} size={[armWidth, 12, 4]} uvOffset={[40, 32]} texture={skinTexture} scale={overlayScale} textureScale={textureScale} showGrid={showGrid} partName="rightArmOverlay" />
          <BodyPart position={[isSlim ? 0.6875 : 0.75, 0.25, 0]} size={[armWidth, 12, 4]} uvOffset={[48, 48]} texture={skinTexture} scale={overlayScale} textureScale={textureScale} showGrid={showGrid} partName="leftArmOverlay" />
          <BodyPart position={[-0.25, -1.25, 0]} size={[4, 12, 4]} uvOffset={[0, 32]} texture={skinTexture} scale={overlayScale} textureScale={textureScale} showGrid={showGrid} partName="rightLegOverlay" />
          <BodyPart position={[0.25, -1.25, 0]} size={[4, 12, 4]} uvOffset={[0, 48]} texture={skinTexture} scale={overlayScale} textureScale={textureScale} showGrid={showGrid} partName="leftLegOverlay" />
        </>
      )}
    </group>
  );
};

interface SkinEditor3DProps {
  textureDataUrl: string;
  model: SkinModel;
  showGrid: boolean;
  showBaseLayer: boolean;
  showOverlayLayer: boolean;
  onGridToggle: () => void;
  onBaseLayerToggle?: () => void;
  onOverlayLayerToggle?: () => void;
  tool?: PaintTool;
  color?: string;
  onTextureUpdate?: (dataUrl: string) => void;
  onPickColor?: (color: string) => void;
}

export const SkinEditor3D: React.FC<SkinEditor3DProps> = ({
  textureDataUrl,
  model,
  showGrid,
  showBaseLayer,
  showOverlayLayer,
  onGridToggle,
  onBaseLayerToggle,
  onOverlayLayerToggle,
  tool = 'brush',
  color = '#000000',
  onTextureUpdate,
  onPickColor,
}) => {
  const isSlim = model === 'slim';
  const [isHoveringModel, setIsHoveringModel] = useState(false);

  // モデル上にカーソルがある場合はOrbitControlsを無効化
  const orbitControlsEnabled = !isHoveringModel;

  const handleTextureUpdate = useCallback((dataUrl: string) => {
    if (onTextureUpdate) {
      onTextureUpdate(dataUrl);
    }
  }, [onTextureUpdate]);

  const handlePickColor = useCallback((color: string) => {
    if (onPickColor) {
      onPickColor(color);
    }
  }, [onPickColor]);

  return (
    <Container>
      <CanvasContainer>
        <Canvas
          camera={{ position: [6, 2, 10], fov: 30 }}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} />
          <directionalLight position={[-5, 3, -5]} intensity={0.3} />
          <Suspense fallback={null}>
            <PaintableCharacter
              textureDataUrl={textureDataUrl}
              isSlim={isSlim}
              showGrid={showGrid}
              showBaseLayer={showBaseLayer}
              showOverlayLayer={showOverlayLayer}
              tool={tool}
              color={color}
              onTextureUpdate={handleTextureUpdate}
              onPickColor={handlePickColor}
              setIsPainting={() => {}}
              setIsHoveringModel={setIsHoveringModel}
            />
          </Suspense>
          <OrbitControls
            enablePan={orbitControlsEnabled}
            enableZoom={true}
            enableRotate={orbitControlsEnabled}
            minDistance={3}
            maxDistance={20}
          />
        </Canvas>
      </CanvasContainer>
      <ControlsContainer>
        {onBaseLayerToggle && (
          <ControlButton $isActive={showBaseLayer} onClick={onBaseLayerToggle}>
            本体: {showBaseLayer ? 'ON' : 'OFF'}
          </ControlButton>
        )}
        {onOverlayLayerToggle && (
          <ControlButton $isActive={showOverlayLayer} onClick={onOverlayLayerToggle}>
            上着: {showOverlayLayer ? 'ON' : 'OFF'}
          </ControlButton>
        )}
        <ControlButton $isActive={showGrid} onClick={onGridToggle}>
          グリッド: {showGrid ? 'ON' : 'OFF'}
        </ControlButton>
      </ControlsContainer>
    </Container>
  );
};
