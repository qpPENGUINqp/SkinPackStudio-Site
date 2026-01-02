import styled from 'styled-components';
import { SectionTitle, CardBase, MarginBase, TextField, Button } from '@freee_jp/vibes';
import { SkinUploader } from './SkinUploader';
import { SkinList } from './SkinList';
import { MobileSkinPackCreator } from './Mobile';
import { useState, useCallback } from 'react';
import { SkinPack, Skin, SkinModel } from '../../types/skin';
import { useIsMobile } from '../../hooks/useIsMobile';
import { extractSkinsFromPack, selectMcpackFile } from '../../utils/importPack';

type SkinPackCreatorProps = {
  skinPack: SkinPack;
  addSkin: (name: string, texture: string, model: SkinModel) => void;
  addSkins: (skins: Skin[]) => void;
  removeSkin: (id: string) => void;
  updateSkinName: (id: string, name: string) => void;
  updateSkinModel: (id: string, model: SkinModel) => void;
  updatePackName: (name: string) => void;
  reorderSkins: (fromIndex: number, toIndex: number) => void;
};

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
  width: 100%;
`;

const RightColumn = styled.div`
  min-width: 0;
  width: 100%;
`;

const SkinListContainer = styled.div`
  max-height: calc(100vh - 280px);
  overflow: auto;
`;

export const SkinPackCreator = ({
  skinPack,
  addSkin,
  addSkins,
  removeSkin,
  updateSkinName,
  updateSkinModel,
  updatePackName,
  reorderSkins,
}: SkinPackCreatorProps) => {
  const [selectedSkinId, setSelectedSkinId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleAddSkinFromPack = useCallback(async () => {
    const file = await selectMcpackFile();
    if (!file) return;

    try {
      const skins = await extractSkinsFromPack(file);
      addSkins(skins);
      setError(null);
    } catch (err) {
      console.error('パックからの追加エラー:', err);
      setError('パックからの追加に失敗しました。有効なmcpackファイルを選択してください。');
    }
  }, [addSkins]);

  // モバイル用レイアウト
  if (isMobile) {
    return (
      <MobileSkinPackCreator
        skinPack={skinPack}
        addSkin={addSkin}
        addSkins={addSkins}
        removeSkin={removeSkin}
        updateSkinName={updateSkinName}
        updateSkinModel={updateSkinModel}
        updatePackName={updatePackName}
        reorderSkins={reorderSkins}
      />
    );
  }

  // PC用レイアウト
  return (
    <>
      {/* 左カラム: パック名、スキン追加 */}
      <LeftColumn>
        <CardBase paddingSize="large">
          <MarginBase mb={0.5}>
            <SectionTitle>パック名</SectionTitle>
          </MarginBase>
          <TextField
            id="pack-name"
            value={skinPack.name}
            onChange={(e) => updatePackName(e.target.value)}
            placeholder="スキンパックの名前を入力"
            width="full"
          />
        </CardBase>

        <CardBase paddingSize="large">
          <MarginBase mb={0.5}>
            <SectionTitle>スキンを追加</SectionTitle>
          </MarginBase>
          <SkinUploader onSkinAdd={addSkin} />
          <MarginBase mt={1}>
            <Button onClick={handleAddSkinFromPack} appearance="secondary" width="full">
              パックからスキンを追加
            </Button>
          </MarginBase>
          {error && (
            <MarginBase mt={0.5}>
              <span style={{ color: '#dc3545', fontSize: '0.875rem' }}>{error}</span>
            </MarginBase>
          )}
        </CardBase>
      </LeftColumn>

      {/* 右カラム: スキン一覧 */}
      <RightColumn>
        <CardBase paddingSize="large">
          <MarginBase mb={0.5}>
            <SectionTitle>スキン一覧 ({skinPack.skins.length})</SectionTitle>
          </MarginBase>
          <SkinListContainer>
            <SkinList
              skins={skinPack.skins}
              selectedSkinId={selectedSkinId}
              onSkinSelect={setSelectedSkinId}
              onSkinRemove={removeSkin}
              onSkinNameChange={updateSkinName}
              onSkinModelChange={updateSkinModel}
              onReorder={reorderSkins}
            />
          </SkinListContainer>
        </CardBase>
      </RightColumn>
    </>
  );
};
