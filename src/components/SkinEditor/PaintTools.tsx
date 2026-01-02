import React from 'react';
import styled from 'styled-components';
import { FaPaintBrush, FaFillDrip, FaEraser, FaEyeDropper, FaUndo, FaRedo } from 'react-icons/fa';
import { IconOnlyButton } from '@freee_jp/vibes';
import { PaintTool } from '../../types/editor';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ToolGroup = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
`;

const Divider = styled.div`
  width: 1px;
  height: 32px;
  background-color: #e5e5e5;
  margin: 0 4px;
`;


interface PaintToolsProps {
  tool: PaintTool;
  onToolChange: (tool: PaintTool) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const PaintTools: React.FC<PaintToolsProps> = ({
  tool,
  onToolChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const tools: { id: PaintTool; icon: React.ReactNode; label: string }[] = [
    { id: 'brush', icon: <FaPaintBrush size={18} />, label: 'ブラシ' },
    { id: 'bucket', icon: <FaFillDrip size={18} />, label: 'バケツ' },
    { id: 'eraser', icon: <FaEraser size={18} />, label: '消しゴム' },
    { id: 'eyedropper', icon: <FaEyeDropper size={18} />, label: 'スポイト' },
  ];

  return (
    <Container>
      <ToolGroup>
        {tools.map((t) => (
          <IconOnlyButton
            key={t.id}
            IconComponent={() => t.icon}
            label={t.label}
            onClick={() => onToolChange(t.id)}
            appearance={tool === t.id ? 'primary' : 'tertiary'}
            small
          />
        ))}

        <Divider />

        <IconOnlyButton
          IconComponent={FaUndo}
          label="元に戻す (Ctrl+Z)"
          onClick={onUndo}
          disabled={!canUndo}
          appearance="tertiary"
          small
        />
        <IconOnlyButton
          IconComponent={FaRedo}
          label="やり直す (Ctrl+Y)"
          onClick={onRedo}
          disabled={!canRedo}
          appearance="tertiary"
          small
        />
      </ToolGroup>
    </Container>
  );
};
