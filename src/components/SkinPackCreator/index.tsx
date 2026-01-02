import styled from 'styled-components';
import { SectionTitle, CardBase, MarginBase, TextField, Button } from '@freee_jp/vibes';
import { SkinUploader } from './SkinUploader';
import { SkinList } from './SkinList';
import { MobileSkinPackCreator } from './Mobile';
import { SkinEditor } from '../SkinEditor';
import { useState, useCallback } from 'react';
import { SkinPack, Skin, SkinModel } from '../../types/skin';
import { useIsMobile } from '../../hooks/useIsMobile';
import { extractSkinsFromPack, selectMcpackFile } from '../../utils/importPack';

type TabType = 'pack' | 'editor';

type SkinPackCreatorProps = {
  skinPack: SkinPack;
  addSkin: (name: string, texture: string, model: SkinModel) => void;
  addSkins: (skins: Skin[]) => void;
  removeSkin: (id: string) => void;
  updateSkinName: (id: string, name: string) => void;
  updateSkinModel: (id: string, model: SkinModel) => void;
  updateSkinTexture: (id: string, texture: string) => void;
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

const TabContainer = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e5e5e5;
  flex-shrink: 0;
`;

const Tab = styled.button<{ $isActive: boolean }>`
  padding: 12px 24px;
  border: none;
  border-bottom: 3px solid ${(props) => (props.$isActive ? '#2563eb' : 'transparent')};
  background-color: transparent;
  color: ${(props) => (props.$isActive ? '#2563eb' : '#666')};
  font-size: 15px;
  font-weight: ${(props) => (props.$isActive ? '600' : '400')};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;

  &:hover {
    color: #2563eb;
  }
`;

const PackCreatorLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 1.5rem;
  width: 100%;
`;

const EditorLayout = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const EditorContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 1rem;

  & > div {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
`;

export const SkinPackCreator = ({
  skinPack,
  addSkin,
  addSkins,
  removeSkin,
  updateSkinName,
  updateSkinModel,
  updateSkinTexture,
  updatePackName,
  reorderSkins,
}: SkinPackCreatorProps) => {
  const [selectedSkinId, setSelectedSkinId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('pack');
  const [editingSkin, setEditingSkin] = useState<Skin | null>(null);
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

  // スキン編集開始
  const handleEditSkin = useCallback((skin: Skin) => {
    setEditingSkin(skin);
    setActiveTab('editor');
  }, []);

  // エディターから保存
  const handleSaveSkin = useCallback((texture: string, model: SkinModel) => {
    if (editingSkin) {
      updateSkinTexture(editingSkin.id, texture);
      updateSkinModel(editingSkin.id, model);
      setEditingSkin(null);
      setActiveTab('pack');
    }
  }, [editingSkin, updateSkinTexture, updateSkinModel]);

  // エディターからパックに追加
  const handleAddToPack = useCallback((texture: string, model: SkinModel) => {
    const name = `スキン ${skinPack.skins.length + 1}`;
    addSkin(name, texture, model);
    setActiveTab('pack');
  }, [addSkin, skinPack.skins.length]);

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

  // PC用レイアウト - エディタータブ
  if (activeTab === 'editor') {
    return (
      <EditorLayout>
        <TabContainer>
          <Tab $isActive={false} onClick={() => setActiveTab('pack')}>
            パック作成
          </Tab>
          <Tab $isActive={true} onClick={() => { setEditingSkin(null); setActiveTab('editor'); }}>
            スキンエディター
          </Tab>
        </TabContainer>
        <EditorContent>
          <CardBase paddingSize="small">
            <SkinEditor
              initialTexture={editingSkin?.texture}
              initialModel={editingSkin?.model}
              skinId={editingSkin?.id}
              skinName={editingSkin?.name}
              onSave={editingSkin ? handleSaveSkin : undefined}
              onAddToPack={handleAddToPack}
            />
          </CardBase>
        </EditorContent>
      </EditorLayout>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <TabContainer style={{ marginBottom: '1.5rem' }}>
        <Tab $isActive={true} onClick={() => setActiveTab('pack')}>
          パック作成
        </Tab>
        <Tab $isActive={false} onClick={() => { setEditingSkin(null); setActiveTab('editor'); }}>
          スキンエディター
        </Tab>
      </TabContainer>

      <PackCreatorLayout>
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
              <MarginBase mt={0.5}>
                <Button onClick={() => setActiveTab('editor')} appearance="tertiary" width="full">
                  新しいスキンを作成
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
                  onSkinEdit={handleEditSkin}
                />
              </SkinListContainer>
            </CardBase>
          </RightColumn>
        </PackCreatorLayout>
    </div>
  );
};
