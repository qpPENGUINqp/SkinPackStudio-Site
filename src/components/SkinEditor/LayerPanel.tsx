import React from 'react';
import styled from 'styled-components';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { SkinLayer } from '../../types/editor';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const LayerItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 2px solid ${(props) => (props.$isActive ? '#2563eb' : '#e5e5e5')};
  border-radius: 8px;
  background-color: ${(props) => (props.$isActive ? '#eff6ff' : '#fff')};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${(props) => (props.$isActive ? '#2563eb' : '#ccc')};
  }
`;

const LayerName = styled.span<{ $isActive: boolean }>`
  flex: 1;
  font-size: 14px;
  font-weight: ${(props) => (props.$isActive ? '600' : '400')};
  color: ${(props) => (props.$isActive ? '#2563eb' : '#333')};
`;

const VisibilityButton = styled.button<{ $isVisible: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  color: ${(props) => (props.$isVisible ? '#333' : '#ccc')};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

interface LayerPanelProps {
  activeLayer: SkinLayer;
  onLayerChange: (layer: SkinLayer) => void;
  showBaseLayer: boolean;
  showOverlayLayer: boolean;
  onToggleBaseLayer: () => void;
  onToggleOverlayLayer: () => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  activeLayer,
  onLayerChange,
  showBaseLayer,
  showOverlayLayer,
  onToggleBaseLayer,
  onToggleOverlayLayer,
}) => {
  return (
    <Container>
      <LayerList>
        <LayerItem
          $isActive={activeLayer === 'overlay'}
          onClick={() => onLayerChange('overlay')}
        >
          <LayerName $isActive={activeLayer === 'overlay'}>
            オーバーレイ（上着・帽子）
          </LayerName>
          <VisibilityButton
            $isVisible={showOverlayLayer}
            onClick={(e) => {
              e.stopPropagation();
              onToggleOverlayLayer();
            }}
            title={showOverlayLayer ? '非表示にする' : '表示する'}
          >
            {showOverlayLayer ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
          </VisibilityButton>
        </LayerItem>

        <LayerItem
          $isActive={activeLayer === 'base'}
          onClick={() => onLayerChange('base')}
        >
          <LayerName $isActive={activeLayer === 'base'}>
            本体（体・顔）
          </LayerName>
          <VisibilityButton
            $isVisible={showBaseLayer}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBaseLayer();
            }}
            title={showBaseLayer ? '非表示にする' : '表示する'}
          >
            {showBaseLayer ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
          </VisibilityButton>
        </LayerItem>
      </LayerList>
    </Container>
  );
};
