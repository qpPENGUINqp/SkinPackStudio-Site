import { Paragraph, VStack } from '@freee_jp/vibes';
import { Skin, SkinModel } from '../../types/skin';
import { SkinItem } from './SkinItem';
import { useIsMobile } from '../../hooks/useIsMobile';

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '2rem',
};

type SkinListProps = {
  skins: Skin[];
  selectedSkinId: string | null;
  onSkinSelect: (id: string) => void;
  onSkinRemove: (id: string) => void;
  onSkinNameChange: (id: string, name: string) => void;
  onSkinModelChange: (id: string, model: SkinModel) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
};

export const SkinList = ({
  skins,
  selectedSkinId,
  onSkinSelect,
  onSkinRemove,
  onSkinNameChange,
  onSkinModelChange,
  onReorder,
}: SkinListProps) => {
  const isMobile = useIsMobile();

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      onReorder(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < skins.length - 1) {
      onReorder(index, index + 1);
    }
  };

  if (skins.length === 0) {
    return (
      <div style={emptyStateStyle}>
        <VStack alignItems="center">
          <Paragraph>スキンがありません</Paragraph>
        </VStack>
      </div>
    );
  }

  return (
    <div style={listStyle}>
      {skins.map((skin, index) => (
        <SkinItem
          key={skin.id}
          skin={skin}
          isSelected={skin.id === selectedSkinId}
          onSelect={() => onSkinSelect(skin.id)}
          onRemove={() => onSkinRemove(skin.id)}
          onNameChange={(name) => onSkinNameChange(skin.id, name)}
          onModelChange={(model) => onSkinModelChange(skin.id, model)}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          isMobile={isMobile}
          onMoveUp={() => handleMoveUp(index)}
          onMoveDown={() => handleMoveDown(index)}
          isFirst={index === 0}
          isLast={index === skins.length - 1}
        />
      ))}
    </div>
  );
};
