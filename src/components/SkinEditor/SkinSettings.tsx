import React from 'react';
import styled from 'styled-components';
import { SegmentControlButton, CheckBox } from '@freee_jp/vibes';
import { SkinSize, EditorMode } from '../../types/editor';
import { SkinModel } from '../../types/skin';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SettingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SubLabel = styled.span`
  font-size: 11px;
  color: #888;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
`;

interface SkinSettingsProps {
  size: SkinSize;
  model: SkinModel;
  mode: EditorMode;
  showGrid: boolean;
  onSizeChange: (size: SkinSize) => void;
  onModelChange: (model: SkinModel) => void;
  onModeChange: (mode: EditorMode) => void;
  onGridToggle: () => void;
}

export const SkinSettings: React.FC<SkinSettingsProps> = ({
  size,
  model,
  mode,
  showGrid,
  onSizeChange,
  onModelChange,
  onModeChange,
  onGridToggle,
}) => {
  return (
    <Container>
      <SettingGroup>
        <SubLabel>表示モード</SubLabel>
        <ButtonGroup>
          <SegmentControlButton
            current={mode === '3d'}
            onClick={() => onModeChange('3d')}
            small
          >
            3D
          </SegmentControlButton>
          <SegmentControlButton
            current={mode === 'flat'}
            onClick={() => onModeChange('flat')}
            small
          >
            展開図
          </SegmentControlButton>
        </ButtonGroup>
      </SettingGroup>

      <SettingGroup>
        <SubLabel>モデル</SubLabel>
        <ButtonGroup>
          <SegmentControlButton
            current={model === 'normal'}
            onClick={() => onModelChange('normal')}
            small
          >
            ワイド
          </SegmentControlButton>
          <SegmentControlButton
            current={model === 'slim'}
            onClick={() => onModelChange('slim')}
            small
          >
            スリム
          </SegmentControlButton>
        </ButtonGroup>
      </SettingGroup>

      <SettingGroup>
        <SubLabel>サイズ</SubLabel>
        <ButtonGroup>
          <SegmentControlButton
            current={size === 64}
            onClick={() => onSizeChange(64)}
            small
          >
            64×64
          </SegmentControlButton>
          <SegmentControlButton
            current={size === 128}
            onClick={() => onSizeChange(128)}
            small
          >
            128×128
          </SegmentControlButton>
        </ButtonGroup>
      </SettingGroup>

      <CheckboxRow>
        <CheckBox
          checked={showGrid}
          onChange={onGridToggle}
        />
        グリッド表示
      </CheckboxRow>
    </Container>
  );
};
