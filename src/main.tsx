import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { VibesProvider } from '@freee_jp/vibes';
import '../node_modules/@freee_jp/vibes/vibes_2021.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VibesProvider fixedLayout={false} lang="ja">
      <App />
    </VibesProvider>
  </StrictMode>
);
