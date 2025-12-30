import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Message, Note, ImageUploadIllust, VibesPrimaryCorpColor } from '@freee_jp/vibes';
import { validateSkinImage, fileToDataURL } from '../../utils/skinValidator';
import { detectModelFromDataURL } from '../../utils/skinModelDetector';
import { SkinModel } from '../../types/skin';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// 動的スタイルと :hover が必要なため styled-components を使用
const DropZone = styled.div<{ $isDragOver: boolean }>`
  border: 2px dashed ${(props) => (props.$isDragOver ? VibesPrimaryCorpColor : '#ccc')};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) => (props.$isDragOver ? '#e8f5e9' : '#fafafa')};

  &:hover {
    border-color: ${VibesPrimaryCorpColor};
  }
`;

const uploadTextStyle: React.CSSProperties = {
  margin: '0.5rem 0 0',
  color: '#666',
};

const hiddenInputStyle: React.CSSProperties = {
  display: 'none',
};

type SkinUploaderProps = {
  onSkinAdd: (name: string, texture: string, model: SkinModel) => void;
};

export const SkinUploader = ({ onSkinAdd }: SkinUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // スキンからモデルタイプを自動検出
        const model = await detectModelFromDataURL(dataURL);
        onSkinAdd(name, dataURL, model);
      }
    },
    [onSkinAdd]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  return (
    <Container>
      <DropZone
        $isDragOver={isDragOver}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('skin-input')?.click()}
      >
        <ImageUploadIllust />
        <p style={uploadTextStyle}>クリックまたはドラッグ&ドロップでスキンを追加</p>
        <Note>64x64 または 128x128 の PNG 画像</Note>
        <input
          id="skin-input"
          type="file"
          accept="image/png"
          multiple
          onChange={handleInputChange}
          style={hiddenInputStyle}
        />
      </DropZone>

      {error && <Message error>{error}</Message>}
    </Container>
  );
};
