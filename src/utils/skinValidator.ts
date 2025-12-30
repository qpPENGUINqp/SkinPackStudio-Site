export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateSkinImage = async (file: File): Promise<ValidationResult> => {
  if (!file.type.startsWith('image/png')) {
    return { valid: false, error: 'PNG画像のみアップロード可能です' };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;

      const isValid = (width === 64 && height === 64) || (width === 128 && height === 128);

      if (isValid) {
        resolve({ valid: true });
      } else {
        resolve({
          valid: false,
          error: `画像サイズが無効です (${width}x${height})。64x64 または 128x128 の画像を使用してください`,
        });
      }
    };
    img.onerror = () => {
      resolve({ valid: false, error: '画像の読み込みに失敗しました' });
    };
    img.src = URL.createObjectURL(file);
  });
};

export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
