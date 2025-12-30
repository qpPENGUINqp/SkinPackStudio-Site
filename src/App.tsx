import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Button, MessageDialog } from '@freee_jp/vibes';
import { FaXTwitter, FaGithub } from 'react-icons/fa6';
import { SkinPackCreator } from './components/SkinPackCreator';
import { HowToInstall } from './components/HowToInstall';
import { useSkinPack } from './hooks/useSkinPack';
import { useIsMobile } from './hooks/useIsMobile';
import { exportSkinPack } from './utils/exportPack';
import './styles/layout.css';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;

  @media (max-width: 768px) {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
`;

const Header = styled.header`
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;

  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
  }
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #323232;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Main = styled.main`
  flex: 1;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 1rem 1.5rem;
  overflow: hidden;

  @media (max-width: 768px) {
    flex: none;
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem 0.75rem;
    overflow: visible;
  }

  & > * {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }
`;

const Footer = styled.footer<{ $isMobile: boolean }>`
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  color: #666;
  font-size: 0.875rem;
  border-top: 1px solid #e0e0e0;
  background: #fff;

  ${({ $isMobile }) =>
    $isMobile &&
    `
    padding: 0.75rem 1rem;
    margin-bottom: 60px;
  `}
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const SocialLink = styled.a`
  color: #666;
  transition: color 0.2s;

  &:hover {
    color: #323232;
  }

  svg {
    width: 20px;
    height: 20px;
    display: block;
  }
`;

export const App = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const skinPack = useSkinPack();
  const isMobile = useIsMobile();

  const handleExport = useCallback(async () => {
    if (skinPack.skinPack.skins.length === 0) {
      return;
    }
    await exportSkinPack(skinPack.skinPack);
  }, [skinPack.skinPack]);

  return (
    <AppContainer>
      <Header>
        <Logo>SkinPack Studio</Logo>
        <HeaderActions>
          {/* <Button onClick={() => setIsHelpOpen(true)} appearance="tertiary">
            導入方法
          </Button> */}
          {!isMobile && (
            <Button
              onClick={handleExport}
              disabled={skinPack.skinPack.skins.length === 0}
              appearance="primary"
            >
              ダウンロード
            </Button>
          )}
        </HeaderActions>
      </Header>
      <Main>
        <SkinPackCreator {...skinPack} />
      </Main>
      <Footer $isMobile={isMobile}>
        {!isMobile ? (
          <span>SkinPack Studio - Minecraft Bedrock Edition スキンパック作成ツール</span>
        ) : (
          <span>Minecraft BE スキンパック作成ツール</span>
        )}
        <SocialLinks>
          <SocialLink href="https://x.com/GAMEqpPENGUIN/" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
            <FaXTwitter />
          </SocialLink>
          <SocialLink href="https://github.com/qpPENGUINqp/" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <FaGithub />
          </SocialLink>
        </SocialLinks>
      </Footer>
      {/* 入れ方説明モーダル */}
      <MessageDialog
        isOpen={isHelpOpen}
        title="スキンパックの入れ方"
        onRequestClose={() => setIsHelpOpen(false)}
        closeButtonLabel="閉じる"
      >
        <HowToInstall />
      </MessageDialog>
    </AppContainer>
  );
};
