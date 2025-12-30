import {
  CardBase,
  SectionTitle,
  SubSectionTitle,
  Paragraph,
  Message,
  VStack,
  StepNumber,
  HStack,
} from '@freee_jp/vibes';

const codeStyle: React.CSSProperties = {
  background: '#f5f5f5',
  padding: '0.125rem 0.375rem',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '0.875rem',
};

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: '1.5rem',
  lineHeight: 1.8,
};

const listItemStyle: React.CSSProperties = {
  marginBottom: '0.5rem',
};

export const HowToInstall = () => {
  return (
    <VStack gap={1.5}>
      <CardBase paddingSize="large">
        <HStack alignItems="center" gap={0.5} mb={1}>
          <StepNumber number={1} />
          <SectionTitle>スキンパックを作成する</SectionTitle>
        </HStack>
        <ol style={listStyle}>
          <li style={listItemStyle}>「スキンパック作成」タブでスキン画像（PNG）をアップロード</li>
          <li style={listItemStyle}>各スキンの名前を設定</li>
          <li style={listItemStyle}>モデルタイプ（Alex/Steve）を選択</li>
          <li style={listItemStyle}>パック名を設定</li>
          <li style={listItemStyle}>「パックをダウンロード」ボタンをクリック</li>
        </ol>
      </CardBase>

      <CardBase paddingSize="large">
        <HStack alignItems="center" gap={0.5} mb={1}>
          <StepNumber number={2} />
          <SectionTitle>デバイスにインストールする</SectionTitle>
        </HStack>

        <VStack gap={1}>
          <div>
            <SubSectionTitle>Windows 10/11</SubSectionTitle>
            <ol style={listStyle}>
              <li style={listItemStyle}>
                ダウンロードした <code style={codeStyle}>.mcpack</code> ファイルをダブルクリック
              </li>
              <li style={listItemStyle}>Minecraft が自動的に起動し、インポートされます</li>
            </ol>
          </div>

          <div>
            <SubSectionTitle>Android</SubSectionTitle>
            <ol style={listStyle}>
              <li style={listItemStyle}>
                ダウンロードした <code style={codeStyle}>.mcpack</code> ファイルをタップ
              </li>
              <li style={listItemStyle}>「Minecraft」で開くを選択</li>
              <li style={listItemStyle}>Minecraft が起動し、自動的にインポートされます</li>
            </ol>
            <Message info mt={0.5}>
              <strong>うまくいかない場合:</strong> ファイルマネージャーアプリから{' '}
              <code style={codeStyle}>.mcpack</code> ファイルを開いてみてください。 また、Minecraft
              アプリが最新版であることを確認してください。
            </Message>
          </div>

          <div>
            <SubSectionTitle>iOS / iPadOS</SubSectionTitle>
            <ol style={listStyle}>
              <li style={listItemStyle}>
                ダウンロードした <code style={codeStyle}>.mcpack</code> ファイルをタップ
              </li>
              <li style={listItemStyle}>共有メニューから「Minecraft」を選択</li>
              <li style={listItemStyle}>Minecraft が起動し、自動的にインポートされます</li>
            </ol>
            <Message info mt={0.5}>
              <strong>ファイルアプリを使う場合:</strong>{' '}
              「ファイル」アプリでダウンロードフォルダを開き、<code style={codeStyle}>.mcpack</code>{' '}
              ファイルを長押しして「共有」→「Minecraft」を選択します。
            </Message>
          </div>

          <div>
            <SubSectionTitle>Nintendo Switch / Xbox / PlayStation</SubSectionTitle>
            <Message error>
              <strong>ご注意:</strong> コンソール版 Minecraft
              では、カスタムスキンパックの直接インポートはサポートされていません。
              マーケットプレイスのスキンパックをご利用ください。
            </Message>
          </div>
        </VStack>
      </CardBase>

      <CardBase paddingSize="large">
        <HStack alignItems="center" gap={0.5} mb={1}>
          <StepNumber number={3} />
          <SectionTitle>スキンを使用する</SectionTitle>
        </HStack>
        <ol style={listStyle}>
          <li style={listItemStyle}>Minecraft を起動</li>
          <li style={listItemStyle}>メインメニューで「更衣室」または「プロフィール」を選択</li>
          <li style={listItemStyle}>「所有」タブでインポートしたスキンパックを探す</li>
          <li style={listItemStyle}>使いたいスキンを選択して適用</li>
        </ol>
      </CardBase>

      <CardBase paddingSize="large">
        <SectionTitle>よくある質問</SectionTitle>

        <VStack gap={1} mt={1}>
          <div>
            <SubSectionTitle>Q: スキン画像のサイズは？</SubSectionTitle>
            <Paragraph>
              64x64 ピクセル（標準）または 128x128 ピクセル（高解像度）の PNG
              画像を使用してください。
            </Paragraph>
          </div>

          <div>
            <SubSectionTitle>Q: Alex と Steve の違いは？</SubSectionTitle>
            <Paragraph>
              Alex（スリム）は腕が3ピクセル幅、Steve（通常）は腕が4ピクセル幅です。
              スキン画像に合わせて選択してください。
            </Paragraph>
          </div>

          <div>
            <SubSectionTitle>Q: インポートしたスキンが表示されない</SubSectionTitle>
            <Paragraph>
              Minecraft を再起動してみてください。それでも表示されない場合は、
              スキン画像のサイズが正しいか確認してください。
            </Paragraph>
          </div>
        </VStack>
      </CardBase>
    </VStack>
  );
};
