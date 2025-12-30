import { useState } from 'react';
import styled from 'styled-components';
import {
  TextField,
  Button,
  SegmentControlButton,
  VibesPrimaryCorpColor,
} from '@freee_jp/vibes';
import { Skin, SkinModel } from '../../types/skin';
import { SkinItemThumbnail } from './SkinItemThumbnail';

// 動的スタイルと :hover が必要なため styled-components を使用
const Container = styled.div<{ $isSelected: boolean; $isDragging: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 2px solid ${(props) => (props.$isSelected ? VibesPrimaryCorpColor : '#eee')};
  border-radius: 8px;
  cursor: pointer;
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};
  transition: all 0.2s;
  overflow: hidden;
  max-width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;

  &:hover {
    border-color: ${(props) => (props.$isSelected ? VibesPrimaryCorpColor : '#ccc')};
  }
`;

// :active が必要なため styled-components を使用
const DragHandle = styled.div`
  cursor: grab;
  color: #999;
  font-size: 1.25rem;
  padding: 0 0.25rem;
  flex-shrink: 0;

  &:active {
    cursor: grabbing;
  }
`;

const MoveButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
`;

const MoveButton = styled.button<{ $disabled: boolean }>`
  background: ${(props) => (props.$disabled ? '#f5f5f5' : '#fff')};
  border: 1px solid ${(props) => (props.$disabled ? '#e0e0e0' : '#ccc')};
  border-radius: 4px;
  padding: 4px 8px;
  cursor: ${(props) => (props.$disabled ? 'default' : 'pointer')};
  color: ${(props) => (props.$disabled ? '#ccc' : '#666')};
  font-size: 0.75rem;
  line-height: 1;

  &:active {
    background: ${(props) => (props.$disabled ? '#f5f5f5' : '#e8e8e8')};
  }
`;

const InfoContainer = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const InputWrapper = styled.div`
  margin-bottom: 0.25rem;
`;

const ActionsRow = styled.div<{ $isMobile: boolean }>`
  display: flex;
  gap: 0.25rem;
  flex-wrap: ${(props) => (props.$isMobile ? 'wrap' : 'nowrap')};
  justify-content: space-between;
  align-items: center;
`;

const ModelButtons = styled.div`
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
`;

const DeleteButton = styled(Button)`
  flex-shrink: 0;
`;

type SkinItemProps = {
  skin: Skin;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onNameChange: (name: string) => void;
  onModelChange: (model: SkinModel) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isMobile?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
};

export const SkinItem = ({
  skin,
  isSelected,
  onSelect,
  onRemove,
  onNameChange,
  onModelChange,
  onDragStart,
  onDragOver,
  onDrop,
  isMobile = false,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}: SkinItemProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDelete = () => {
    onRemove();
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveUp?.();
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveDown?.();
  };

  return (
    <Container
      $isSelected={isSelected}
      $isDragging={isDragging}
      draggable={!isMobile}
      onDragStart={isMobile ? undefined : handleDragStart}
      onDragEnd={isMobile ? undefined : handleDragEnd}
      onDragOver={isMobile ? undefined : onDragOver}
      onDrop={isMobile ? undefined : onDrop}
      onClick={onSelect}
    >
      {isMobile ? (
        <MoveButtonsContainer onClick={(e) => e.stopPropagation()}>
          <MoveButton $disabled={isFirst} onClick={handleMoveUp} disabled={isFirst}>
            ▲
          </MoveButton>
          <MoveButton $disabled={isLast} onClick={handleMoveDown} disabled={isLast}>
            ▼
          </MoveButton>
        </MoveButtonsContainer>
      ) : (
        <DragHandle>⋮⋮</DragHandle>
      )}
      <SkinItemThumbnail texture={skin.texture} size={48} isSlim={skin.model === 'slim'} />
      <InfoContainer>
        <InputWrapper onClick={(e) => e.stopPropagation()}>
          <TextField
            value={skin.name}
            onChange={(e) => onNameChange(e.target.value)}
            small
            width="full"
          />
        </InputWrapper>
        <ActionsRow $isMobile={isMobile}>
          <ModelButtons>
            <SegmentControlButton
              small
              current={skin.model === 'slim'}
              onClick={() => onModelChange('slim')}
            >
              スリム
            </SegmentControlButton>
            <SegmentControlButton
              small
              current={skin.model === 'normal'}
              onClick={() => onModelChange('normal')}
            >
              ワイド
            </SegmentControlButton>
          </ModelButtons>
          <DeleteButton onClick={handleDelete} appearance="tertiary" danger small>
            削除
          </DeleteButton>
        </ActionsRow>
      </InfoContainer>
    </Container>
  );
};
