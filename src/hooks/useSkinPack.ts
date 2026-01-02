import { useState, useCallback } from 'react';
import { Skin, SkinPack, SkinModel } from '../types/skin';
import { generateUUID } from '../utils/uuid';

export const useSkinPack = () => {
  const [skinPack, setSkinPack] = useState<SkinPack>({
    name: 'スキンパック',
    skins: [],
  });

  const addSkin = useCallback((name: string, texture: string, model: SkinModel = 'slim') => {
    const newSkin: Skin = {
      id: generateUUID().replace(/-/g, '').substring(0, 8),
      name,
      texture,
      model,
    };
    setSkinPack((prev) => ({
      ...prev,
      skins: [...prev.skins, newSkin],
    }));
  }, []);

  const removeSkin = useCallback((id: string) => {
    setSkinPack((prev) => ({
      ...prev,
      skins: prev.skins.filter((skin) => skin.id !== id),
    }));
  }, []);

  const updateSkinName = useCallback((id: string, name: string) => {
    setSkinPack((prev) => ({
      ...prev,
      skins: prev.skins.map((skin) => (skin.id === id ? { ...skin, name } : skin)),
    }));
  }, []);

  const updateSkinModel = useCallback((id: string, model: SkinModel) => {
    setSkinPack((prev) => ({
      ...prev,
      skins: prev.skins.map((skin) => (skin.id === id ? { ...skin, model } : skin)),
    }));
  }, []);

  const updateSkinTexture = useCallback((id: string, texture: string) => {
    setSkinPack((prev) => ({
      ...prev,
      skins: prev.skins.map((skin) => (skin.id === id ? { ...skin, texture } : skin)),
    }));
  }, []);

  const updatePackName = useCallback((name: string) => {
    setSkinPack((prev) => ({
      ...prev,
      name,
    }));
  }, []);

  const reorderSkins = useCallback((fromIndex: number, toIndex: number) => {
    setSkinPack((prev) => {
      const newSkins = [...prev.skins];
      const [removed] = newSkins.splice(fromIndex, 1);
      newSkins.splice(toIndex, 0, removed);
      return { ...prev, skins: newSkins };
    });
  }, []);

  const replaceSkinPack = useCallback((newPack: SkinPack) => {
    setSkinPack(newPack);
  }, []);

  const addSkins = useCallback((skins: Skin[]) => {
    setSkinPack((prev) => ({
      ...prev,
      skins: [...prev.skins, ...skins],
    }));
  }, []);

  return {
    skinPack,
    addSkin,
    addSkins,
    removeSkin,
    updateSkinName,
    updateSkinModel,
    updateSkinTexture,
    updatePackName,
    reorderSkins,
    replaceSkinPack,
  };
};
