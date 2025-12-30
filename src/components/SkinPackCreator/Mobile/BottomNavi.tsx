import styled from 'styled-components';
import { Button } from '@freee_jp/vibes';

const NaviContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

const NavButton = styled.div`
  flex: 1;
`;

type BottomNaviProps = {
  onAddSkinClick: () => void;
  onDownloadClick: () => void;
  isDownloadDisabled: boolean;
};

export const BottomNavi = ({
  onAddSkinClick,
  onDownloadClick,
  isDownloadDisabled,
}: BottomNaviProps) => {
  return (
    <NaviContainer>
      <NavButton>
        <Button onClick={onAddSkinClick} appearance="secondary" width="full">
          スキンを追加
        </Button>
      </NavButton>
      <NavButton>
        <Button
          onClick={onDownloadClick}
          appearance="primary"
          disabled={isDownloadDisabled}
          width="full"
        >
          ダウンロード
        </Button>
      </NavButton>
    </NaviContainer>
  );
};
