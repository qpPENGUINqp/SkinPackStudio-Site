import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { VibesBackgroundColor } from '@freee_jp/vibes';

type SkinItemThumbnailProps = {
  texture: string;
  size?: number;
  isSlim: boolean;
};

type BodyPartProps = {
  position: [number, number, number];
  size: [number, number, number];
  uvOffset: [number, number];
  texture: THREE.Texture;
  scale?: number;
  textureScale?: number;
};

type ThumbnailCharacterProps = {
  texture: string;
  isSlim: boolean;
};

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

  // Right face (x+)
  uvs.push(
    (u + d + w) / tw, 1 - (v + d) / th,
    (u + d) / tw, 1 - (v + d) / th,
    (u + d + w) / tw, 1 - (v + d + h) / th,
    (u + d) / tw, 1 - (v + d + h) / th
  );

  // Left face (x-)
  uvs.push(
    u / tw, 1 - (v + d) / th,
    (u + d) / tw, 1 - (v + d) / th,
    u / tw, 1 - (v + d + h) / th,
    (u + d) / tw, 1 - (v + d + h) / th
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

const BodyPart = ({
  position,
  size,
  uvOffset,
  texture,
  scale = 1,
  textureScale = 1,
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

  return (
    <mesh position={position} geometry={geometry}>
      <meshBasicMaterial map={texture} side={THREE.FrontSide} alphaTest={0.1} transparent />
    </mesh>
  );
};

const ThumbnailCharacter = ({ texture, isSlim }: ThumbnailCharacterProps) => {
  const [textureScale, setTextureScale] = useState(1);

  const skinTexture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(texture, (loadedTex) => {
      const img = loadedTex.image;
      if (img && 'width' in img) {
        const width = (img as { width: number }).width;
        setTextureScale(width / 64);
      }
    });
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [texture]);

  const armWidth = isSlim ? 3 : 4;
  const overlayScale = 1.1;

  return (
    <group position={[0, 0, 0]} rotation={[0, Math.PI / 8, 0]}>
      <BodyPart position={[0, 1.5, 0]} size={[8, 8, 8]} uvOffset={[0, 0]} texture={skinTexture} textureScale={textureScale} />
      <BodyPart position={[0, 1.5, 0]} size={[8, 8, 8]} uvOffset={[32, 0]} texture={skinTexture} scale={overlayScale} textureScale={textureScale} />
      <BodyPart position={[0, 0.25, 0]} size={[8, 12, 4]} uvOffset={[16, 16]} texture={skinTexture} textureScale={textureScale} />
      <BodyPart position={[0, 0.25, 0]} size={[8, 12, 4]} uvOffset={[16, 32]} texture={skinTexture} scale={overlayScale} textureScale={textureScale} />
      <BodyPart position={[isSlim ? -0.6875 : -0.75, 0.25, 0]} size={[armWidth, 12, 4]} uvOffset={[40, 16]} texture={skinTexture} textureScale={textureScale} />
      <BodyPart position={[isSlim ? -0.6875 : -0.75, 0.25, 0]} size={[armWidth, 12, 4]} uvOffset={[40, 32]} texture={skinTexture} scale={overlayScale} textureScale={textureScale} />
      <BodyPart position={[isSlim ? 0.6875 : 0.75, 0.25, 0]} size={[armWidth, 12, 4]} uvOffset={[32, 48]} texture={skinTexture} textureScale={textureScale} />
      <BodyPart position={[isSlim ? 0.6875 : 0.75, 0.25, 0]} size={[armWidth, 12, 4]} uvOffset={[48, 48]} texture={skinTexture} scale={overlayScale} textureScale={textureScale} />
      <BodyPart position={[-0.25, -1.25, 0]} size={[4, 12, 4]} uvOffset={[0, 16]} texture={skinTexture} textureScale={textureScale} />
      <BodyPart position={[-0.25, -1.25, 0]} size={[4, 12, 4]} uvOffset={[0, 32]} texture={skinTexture} scale={overlayScale} textureScale={textureScale} />
      <BodyPart position={[0.25, -1.25, 0]} size={[4, 12, 4]} uvOffset={[16, 48]} texture={skinTexture} textureScale={textureScale} />
      <BodyPart position={[0.25, -1.25, 0]} size={[4, 12, 4]} uvOffset={[0, 48]} texture={skinTexture} scale={overlayScale} textureScale={textureScale} />
    </group>
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
  };

  return (
    <div style={containerStyle}>
      <Canvas
        camera={{ position: [4, 1.5, 12], fov: 20 }}
        gl={{ antialias: false, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[2, 2, 2]} intensity={0.5} />
        <Suspense fallback={null}>
          <ThumbnailCharacter texture={texture} isSlim={isSlim} />
        </Suspense>
      </Canvas>
    </div>
  );
};
