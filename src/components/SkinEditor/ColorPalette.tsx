import React from 'react';
import styled from 'styled-components';
import { DEFAULT_PALETTE_COLORS } from '../../types/editor';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CurrentColorSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CurrentColorPreview = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 2px solid #333;
  background-color: ${(props) => props.$color};
  background-image: ${(props) =>
    props.$color === 'transparent'
      ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
      : 'none'};
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
`;

const ColorInput = styled.input`
  width: 60px;
  height: 32px;
  padding: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;

  &::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 2px;
  }
`;

const HexInput = styled.input`
  width: 80px;
  height: 32px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
`;

const PaletteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
`;

const PaletteColor = styled.button<{ $color: string; $isSelected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid ${(props) => (props.$isSelected ? '#333' : 'transparent')};
  background-color: ${(props) => props.$color};
  cursor: pointer;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SubLabel = styled.span`
  font-size: 11px;
  color: #888;
  font-weight: 500;
`;

interface ColorPaletteProps {
  color: string;
  onColorChange: (color: string) => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  color,
  onColorChange,
}) => {
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('#')) {
      value = '#' + value;
    }
    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
      onColorChange(value);
    }
  };

  return (
    <Container>
      <CurrentColorSection>
        <CurrentColorPreview $color={color} />
        <ColorInput
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
        />
        <HexInput
          type="text"
          value={color}
          onChange={handleHexChange}
          maxLength={7}
        />
      </CurrentColorSection>

      <SubLabel>パレット</SubLabel>
      <PaletteGrid>
        {DEFAULT_PALETTE_COLORS.map((paletteColor) => (
          <PaletteColor
            key={paletteColor}
            $color={paletteColor}
            $isSelected={color.toLowerCase() === paletteColor.toLowerCase()}
            onClick={() => onColorChange(paletteColor)}
            title={paletteColor}
          />
        ))}
      </PaletteGrid>
    </Container>
  );
};
