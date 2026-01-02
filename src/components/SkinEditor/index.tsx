import React, { useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import { FaDownload, FaPlus, FaSave, FaTrash } from 'react-icons/fa';
import { Button, AccordionPanel } from '@freee_jp/vibes';
import { useSkinEditor } from '../../hooks/useSkinEditor';
import { ColorPalette } from './ColorPalette';
import { PaintTools } from './PaintTools';
import { LayerPanel } from './LayerPanel';
import { SkinSettings } from './SkinSettings';
import { SkinEditorFlat } from './SkinEditorFlat';
import { SkinEditor3D } from './SkinEditor3D';
import { SkinEditorPreview } from './SkinEditorPreview';
import { SkinModel } from '../../types/skin';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const MainLayout = styled.div`
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 1024px) {
    flex-direction: column;
    overflow-y: auto;
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  overflow: hidden;

  @media (max-width: 1024px) {
    width: 100%;
    flex-shrink: 0;
  }
`;

const ToolsSection = styled.div`
  padding: 8px 12px;
  border-bottom: 1px solid #e5e5e5;
  flex-shrink: 0;
`;

const AccordionWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;

  & > div {
    border-radius: 0;
  }
`;

const EditorArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
`;

const MainEditorContainer = styled.div`
  flex: 1;
  min-height: 0;
  border-radius: 8px;
  overflow: hidden;
`;

const PreviewContainer = styled.div<{ $position?: 'top-left' | 'bottom-right' }>`
  position: absolute;
  ${(props) => props.$position === 'bottom-right' ? `
    bottom: 16px;
    right: 16px;
  ` : `
    top: 16px;
    left: 16px;
  `}
  width: 150px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10;
`;

const EditorWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  flex-shrink: 0;
`;

const TemplateSection = styled.div`
  padding: 8px 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  margin-bottom: 8px;
  flex-shrink: 0;
`;

const TemplateButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const TemplateButton = styled.button<{ $isSelected: boolean }>`
  flex: 1;
  padding: 6px 10px;
  border: 2px solid ${(props) => (props.$isSelected ? '#2563eb' : '#e5e5e5')};
  border-radius: 6px;
  background-color: ${(props) => (props.$isSelected ? '#eff6ff' : '#fff')};
  color: ${(props) => (props.$isSelected ? '#2563eb' : '#333')};
  font-weight: ${(props) => (props.$isSelected ? '600' : '400')};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${(props) => (props.$isSelected ? '#2563eb' : '#ccc')};
  }
`;

const TemplateLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

export interface SkinEditorProps {
  initialTexture?: string;
  initialModel?: SkinModel;
  skinId?: string;
  skinName?: string;
  onSave?: (texture: string, model: SkinModel, name?: string) => void;
  onAddToPack?: (texture: string, model: SkinModel) => void;
}

export const SkinEditor: React.FC<SkinEditorProps> = ({
  initialTexture,
  initialModel = 'normal',
  skinId,
  skinName,
  onSave,
  onAddToPack,
}) => {
  const {
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
    canUndo,
    canRedo,
    setActiveLayer,
    setTool,
    setColor,
    setMode,
    setSize,
    setModel,
    setShowGrid,
    setShowBaseLayer,
    setShowOverlayLayer,
    undo,
    redo,
    resetToTemplate,
    clearTexture,
    updateTexture,
  } = useSkinEditor({
    initialTexture,
    initialModel,
  });

  // アコーディオンの開閉状態
  const [openPanels, setOpenPanels] = useState({
    color: true,
    layer: false,
    settings: false,
  });

  const togglePanel = (panel: 'color' | 'layer' | 'settings') => {
    setOpenPanels((prev) => ({
      ...prev,
      [panel]: !prev[panel],
    }));
  };

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
      // ツールショートカット
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            setTool('brush');
            break;
          case 'g':
            setTool('bucket');
            break;
          case 'e':
            setTool('eraser');
            break;
          case 'i':
            setTool('eyedropper');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, setTool]);

  // ダウンロード
  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = textureDataUrl;
    link.download = `skin_${Date.now()}.png`;
    link.click();
  }, [textureDataUrl]);

  // 保存
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(textureDataUrl, model, skinName);
    }
  }, [textureDataUrl, model, skinName, onSave]);

  // パックに追加
  const handleAddToPack = useCallback(() => {
    if (onAddToPack) {
      onAddToPack(textureDataUrl, model);
    }
  }, [textureDataUrl, model, onAddToPack]);

  return (
    <Container>
      {!initialTexture && (
        <TemplateSection>
          <TemplateLabel>テンプレートを選択</TemplateLabel>
          <TemplateButtons>
            <TemplateButton
              $isSelected={model === 'normal'}
              onClick={() => resetToTemplate('normal')}
            >
              Steve (ワイド)
            </TemplateButton>
            <TemplateButton
              $isSelected={model === 'slim'}
              onClick={() => resetToTemplate('slim')}
            >
              Alex (スリム)
            </TemplateButton>
          </TemplateButtons>
        </TemplateSection>
      )}

      <MainLayout>
        <LeftPanel>
          <ToolsSection>
            <PaintTools
              tool={tool}
              onToolChange={setTool}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
            />
          </ToolsSection>

          <AccordionWrapper>
            <AccordionPanel
              title="カラー"
              open={openPanels.color}
              onClick={() => togglePanel('color')}
              border="bottom"
            >
              <ColorPalette color={color} onColorChange={setColor} />
            </AccordionPanel>

            <AccordionPanel
              title="レイヤー"
              open={openPanels.layer}
              onClick={() => togglePanel('layer')}
              border="bottom"
            >
              <LayerPanel
                activeLayer={activeLayer}
                onLayerChange={setActiveLayer}
                showBaseLayer={showBaseLayer}
                showOverlayLayer={showOverlayLayer}
                onToggleBaseLayer={() => setShowBaseLayer(!showBaseLayer)}
                onToggleOverlayLayer={() => setShowOverlayLayer(!showOverlayLayer)}
              />
            </AccordionPanel>

            <AccordionPanel
              title="設定"
              open={openPanels.settings}
              onClick={() => togglePanel('settings')}
              border="bottom"
            >
              <SkinSettings
                size={size}
                model={model}
                mode={mode}
                showGrid={showGrid}
                onSizeChange={setSize}
                onModelChange={setModel}
                onModeChange={setMode}
                onGridToggle={() => setShowGrid(!showGrid)}
              />
            </AccordionPanel>
          </AccordionWrapper>
        </LeftPanel>

        <EditorArea>
          <MainEditorContainer>
            <EditorWrapper>
              {mode === '3d' ? (
                <>
                  <SkinEditor3D
                    textureDataUrl={textureDataUrl}
                    model={model}
                    showGrid={showGrid}
                    showBaseLayer={showBaseLayer}
                    showOverlayLayer={showOverlayLayer}
                    onGridToggle={() => setShowGrid(!showGrid)}
                    onBaseLayerToggle={() => setShowBaseLayer(!showBaseLayer)}
                    onOverlayLayerToggle={() => setShowOverlayLayer(!showOverlayLayer)}
                    tool={tool}
                    color={color}
                    onTextureUpdate={updateTexture}
                    onPickColor={setColor}
                  />
                  <PreviewContainer>
                    <SkinEditorFlat
                      textureDataUrl={textureDataUrl}
                      size={size}
                      showGrid={false}
                      tool={tool}
                      color={color}
                      onPickColor={setColor}
                      onTextureUpdate={updateTexture}
                      previewMode={true}
                    />
                  </PreviewContainer>
                </>
              ) : (
                <>
                  <SkinEditorFlat
                    textureDataUrl={textureDataUrl}
                    size={size}
                    showGrid={showGrid}
                    tool={tool}
                    color={color}
                    onPickColor={setColor}
                    onTextureUpdate={updateTexture}
                  />
                  <PreviewContainer $position="bottom-right">
                    <SkinEditorPreview
                      textureDataUrl={textureDataUrl}
                      model={model}
                    />
                  </PreviewContainer>
                </>
              )}
            </EditorWrapper>
          </MainEditorContainer>

          <ActionButtons>
            <Button
              onClick={handleDownload}
              IconComponent={FaDownload}
            >
              ダウンロード
            </Button>
            {onAddToPack && (
              <Button
                onClick={handleAddToPack}
                IconComponent={FaPlus}
                appearance="primary"
              >
                パックに追加
              </Button>
            )}
            {onSave && skinId && (
              <Button
                onClick={handleSave}
                IconComponent={FaSave}
                appearance="primary"
              >
                保存
              </Button>
            )}
            <Button
              onClick={clearTexture}
              IconComponent={FaTrash}
              danger
            >
              クリア
            </Button>
          </ActionButtons>
        </EditorArea>
      </MainLayout>
    </Container>
  );
};
