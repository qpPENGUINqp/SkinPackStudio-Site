/**
 * スキンがAlexモデル（slim）かSteveモデル（wide）かを自動検出する
 * 右腕の前面の4番目のピクセル列が透明かどうかで判定
 */
export const detectSlimModel = (imageData: ImageData, width: number): boolean => {
  const scale = width / 64;
  // 右腕の前面の4番目のピクセル列（64x64基準: x=47, y=20）
  // Alexモデルでは腕幅が3pxなので、この列は透明
  // Steveモデルでは腕幅が4pxなので、この列は不透明
  const checkX = Math.floor(47 * scale);
  const checkY = Math.floor(20 * scale);

  // ピクセルのアルファ値を確認
  const index = (checkY * width + checkX) * 4 + 3; // +3 はアルファチャンネル
  const alpha = imageData.data[index];

  // アルファが0に近い（透明）ならAlex、そうでなければSteve
  return alpha < 128;
};

/**
 * 画像のdata URLからモデルタイプを検出する
 */
export const detectModelFromDataURL = (dataURL: string): Promise<'slim' | 'normal'> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const isSlim = detectSlimModel(imageData, img.width);
        resolve(isSlim ? 'slim' : 'normal');
      } else {
        resolve('normal');
      }
    };
    img.onerror = () => {
      resolve('normal');
    };
    img.src = dataURL;
  });
};
