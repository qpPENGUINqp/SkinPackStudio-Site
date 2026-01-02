import styled from 'styled-components';
import { Button, DropdownButton } from '@freee_jp/vibes';

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
  onAddSkinFromImage: () => void;
  onAddSkinFromPack: () => void;
  onDownloadClick: () => void;
  isDownloadDisabled: boolean;
};

export const BottomNavi = ({
  onAddSkinFromImage,
  onAddSkinFromPack,
  onDownloadClick,
  isDownloadDisabled,
}: BottomNaviProps) => {
  return (
    <NaviContainer>
      <NavButton>
        <DropdownButton
          buttonLabel="スキン追加"
          appearance="secondary"
          dropdownContents={[
            {
              type: 'selectable',
              text: '画像から追加',
              onClick: onAddSkinFromImage,
            },
            {
              type: 'selectable',
              text: 'パックから追加',
              onClick: onAddSkinFromPack,
            },
          ]}
        />
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
