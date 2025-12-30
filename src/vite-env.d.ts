/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '../node_modules/@freee_jp/vibes/vibes_2021.css';
