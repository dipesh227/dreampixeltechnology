import { UploadedFile } from "../types";

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number; }
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/png');
}


/**
 * Resizes an image file if its dimensions exceed the specified maximum.
 * @param {File} file - The image file to resize.
 * @param {number} [maxSize=2048] - The maximum width or height for the image.
 * @returns {Promise<UploadedFile>} A promise that resolves to an object with the base64 string, mimeType, and name.
 */
export const resizeImage = (file: File, maxSize: number = 2048): Promise<UploadedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;
        const mimeType = file.type;

        if (width <= maxSize && height <= maxSize) {
          // No resize needed, just get base64 string
          const base64 = (reader.result as string).split(',')[1];
          return resolve({ base64, mimeType, name: file.name });
        }
        
        if (width > height) {
          if (width > maxSize) {
            height = Math.round(height * (maxSize / width));
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round(width * (maxSize / height));
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        const base64 = canvas.toDataURL(mimeType).split(',')[1];
        resolve({ base64, mimeType, name: file.name });
      };
      img.onerror = (error) => reject(new Error('Image failed to load for resizing.'));
    };
    reader.onerror = (error) => reject(new Error('File could not be read for resizing.'));
  });
};

/**
 * Takes a cropped image, resizes it to specified dimensions, and compresses it to fit within a file size range.
 * @param imageSrc The base64 source of the cropped image.
 * @param outputWidth The target width in pixels.
 * @param outputHeight The target height in pixels.
 * @param maxSizeKB The maximum allowed file size in kilobytes.
 * @returns A promise resolving to the final image's base64 data and file size.
 */
export const resizeAndCompressImage = async (
  imageSrc: string,
  outputWidth: number,
  outputHeight: number,
  maxSizeKB: number
): Promise<{ base64: string; sizeKB: number }> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, outputWidth, outputHeight);

    let low = 0.1;
    let high = 1.0;
    let quality = 0.9;
    let bestUrl = '';
    let bestSize = 0;

    // Use a binary search to find the optimal JPEG quality that meets the size constraint
    for (let i = 0; i < 10; i++) {
        quality = (low + high) / 2;
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const sizeKB = atob(dataUrl.split(',')[1]).length / 1024;

        if (sizeKB <= maxSizeKB) {
            bestUrl = dataUrl;
            bestSize = sizeKB;
            low = quality; // Try for higher quality
        } else {
            high = quality; // Need lower quality
        }
    }

    if (!bestUrl) {
        // If even the lowest quality is too big, return the lowest quality version
        bestUrl = canvas.toDataURL('image/jpeg', 0.1);
        bestSize = atob(bestUrl.split(',')[1]).length / 1024;
        console.warn(`Image size (${bestSize.toFixed(2)}KB) exceeds max size of ${maxSizeKB}KB even at lowest quality.`);
    }

    return { base64: bestUrl, sizeKB: bestSize };
};
