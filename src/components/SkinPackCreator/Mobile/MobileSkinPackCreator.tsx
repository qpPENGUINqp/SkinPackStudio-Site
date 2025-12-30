import { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { SectionTitle, CardBase, MarginBase, TextField, Message } from '@freee_jp/vibes';
import { SkinList } from '../SkinList';
import { BottomNavi } from './BottomNavi';
import { SkinPack, SkinModel } from '../../../types/skin';
import { exportSkinPack } from '../../../utils/exportPack';
import { validateSkinImage, fileToDataURL } from '../../../utils/skinValidator';
import { detectModelFromDataURL } from '../../../utils/skinModelDetector';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 5rem; /* BottomNaviの高さ分 */
`;

type MobileSkinPackCreatorProps = {
  skinPack: SkinPack;
  addSkin: (name: string, texture: string, model: SkinModel) => void;
  removeSkin: (id: string) => void;
  updateSkinName: (id: string, name: string) => void;
  updateSkinModel: (id: string, model: SkinModel) => void;
  updatePackName: (name: string) => void;
  reorderSkins: (fromIndex: number, toIndex: number) => void;
};

export const MobileSkinPackCreator = ({
  skinPack,
  addSkin,
  removeSkin,
  updateSkinName,
  updateSkinModel,
  updatePackName,
  reorderSkins,
}: MobileSkinPackCreatorProps) => {
  const [selectedSkinId, setSelectedSkinId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(async () => {
    if (skinPack.skins.length === 0) {
      return;
    }
    await exportSkinPack(skinPack);
  }, [skinPack]);

  const handleFiles = useCallback(
    async (files: FileList) => {
      setError(null);

      for (const file of Array.from(files)) {
        const result = await validateSkinImage(file);
        if (!result.valid) {
          setError(result.error ?? '不明なエラー');
          continue;
        }

        const dataURL = await fileToDataURL(file);
        const name = file.name.replace(/\.png$/i, '');
        const model = await detectModelFromDataURL(dataURL);
        addSkin(name, dataURL, model);
      }
    },
    [addSkin]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      // 同じファイルを再選択できるようにリセット
      e.target.value = '';
    }
  };

  const handleAddSkinClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Container>
        {/* パック名 */}
        <CardBase paddingSize="small">
          <MarginBase mb={0.5}>
            <SectionTitle>パック名</SectionTitle>
          </MarginBase>
          <TextField
            id="pack-name-mobile"
            value={skinPack.name}
            onChange={(e) => updatePackName(e.target.value)}
            placeholder="スキンパックの名前を入力"
            width="full"
          />
        </CardBase>

        {/* スキン一覧 */}
        <CardBase paddingSize="small">
          <MarginBase mb={0.5}>
            <SectionTitle>スキン一覧 ({skinPack.skins.length})</SectionTitle>
          </MarginBase>
          {error && (
            <MarginBase mb={0.5}>
              <Message error>{error}</Message>
            </MarginBase>
          )}
          <SkinList
            skins={skinPack.skins}
            selectedSkinId={selectedSkinId}
            onSkinSelect={setSelectedSkinId}
            onSkinRemove={removeSkin}
            onSkinNameChange={updateSkinName}
            onSkinModelChange={updateSkinModel}
            onReorder={reorderSkins}
          />
        </CardBase>
      </Container>

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png"
        multiple
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {/* 下部固定ナビゲーション */}
      <BottomNavi
        onAddSkinClick={handleAddSkinClick}
        onDownloadClick={handleExport}
        isDownloadDisabled={skinPack.skins.length === 0}
      />
    </>
  );
};
