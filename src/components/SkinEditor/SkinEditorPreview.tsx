import React, { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import styled from 'styled-components';
import { SkinModel } from '../../types/skin';

const Container = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
`;

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

  uvs.push(
    (u + d + w) / tw, 1 - (v + d) / th,
    (u + d) / tw, 1 - (v + d) / th,
    (u + d + w) / tw, 1 - (v + d + h) / th,
    (u + d) / tw, 1 - (v + d + h) / th
  );

  uvs.push(
    u / tw, 1 - (v + d) / th,
    (u + d) / tw, 1 - (v + d) / th,
    u / tw, 1 - (v + d + h) / th,
    (u + d) / tw, 1 - (v + d + h) / th
  );

  uvs.push(
    (u + d) / tw, 1 - v / th,
    (u + d + w) / tw, 1 - v / th,
    (u + d) / tw, 1 - (v + d) / th,
    (u + d + w) / tw, 1 - (v + d) / th
  );

  uvs.push(
    (u + d + w) / tw, 1 - v / th,
    (u + d + w + w) / tw, 1 - v / th,
    (u + d + w) / tw, 1 - (v + d) / th,
    (u + d + w + w) / tw, 1 - (v + d) / th
  );

  uvs.push(
    (u + d) / tw, 1 - (v + d) / th,
    (u + d + w) / tw, 1 - (v + d) / th,
    (u + d) / tw, 1 - (v + d + h) / th,
    (u + d + w) / tw, 1 - (v + d + h) / th
  );

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

  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry((w / 8) * scale, (h / 8) * scale, (d / 8) * scale);
    const scaledU = u * textureScale;
    const scaledV = v * textureScale;
    const scaledW = w * textureScale;
    const scaledH = h * textureScale;
    const scaledD = d * textureScale;
    const uvs = createBoxUVs(scaledU, scaledV, scaledW, scaledH, scaledD, 64 * textureScale, 64 * textureScale);
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    return geo;
  }, [w, h, d, u, v, scale, textureScale]);

  return (
    <mesh position={position} geometry={geometry}>
      <meshBasicMaterial map={texture} side={THREE.FrontSide} alphaTest={0.1} transparent />
    </mesh>
  );
};

type CharacterProps = {
  textureDataUrl: string;
  isSlim: boolean;
};

const Character = ({ textureDataUrl, isSlim }: CharacterProps) => {
  const [textureScale, setTextureScale] = useState(1);

  const skinTexture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(textureDataUrl, (loadedTex) => {
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
  }, [textureDataUrl]);

  const armWidth = isSlim ? 3 : 4;
  const overlayScale = 1.1;

  return (
    <group position={[0, 0, 0]} rotation={[0, Math.PI / 6, 0]}>
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

interface SkinEditorPreviewProps {
  textureDataUrl: string;
  model: SkinModel;
}

export const SkinEditorPreview: React.FC<SkinEditorPreviewProps> = ({
  textureDataUrl,
  model,
}) => {
  const isSlim = model === 'slim';

  return (
    <Container>
      <Canvas
        camera={{ position: [4, 1.5, 10], fov: 25 }}
        gl={{ antialias: false, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[2, 2, 2]} intensity={0.5} />
        <Suspense fallback={null}>
          <Character textureDataUrl={textureDataUrl} isSlim={isSlim} />
        </Suspense>
      </Canvas>
    </Container>
  );
};
