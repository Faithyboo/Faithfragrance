/**
 * Optimizes and downscales images uploaded from phones (iOS / Android) or PCs
 * Ensures high visual fidelity while compressing large 10-25MB camera photos
 * down to ~60-120KB to fit seamlessly in browser storage and load instantaneously.
 */
export interface OptimizedImageResult {
  dataUrl: string;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
}

export async function optimizeImageFile(
  file: File,
  maxDimension: number = 1000,
  quality: number = 0.82
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    // Check if it's an image file or has an image extension
    const isImage = file.type.startsWith('image/') || 
      /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(file.name);

    if (!isImage && file.type) {
      reject(new Error('Selected file is not a supported image format.'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file from device.'));
    };

    reader.onload = (readerEvent) => {
      const resultDataUrl = readerEvent.target?.result as string;
      if (!resultDataUrl) {
        reject(new Error('Failed to read image data.'));
        return;
      }

      // If it's an SVG or GIF, preserve directly
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        resolve({
          dataUrl: resultDataUrl,
          originalSize: file.size,
          optimizedSize: resultDataUrl.length,
          width: 0,
          height: 0
        });
        return;
      }

      const img = new Image();

      img.onerror = () => {
        // Fallback: If canvas decoding fails, return the raw data URL
        resolve({
          dataUrl: resultDataUrl,
          originalSize: file.size,
          optimizedSize: resultDataUrl.length,
          width: 0,
          height: 0
        });
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Compute scaled dimensions maintaining aspect ratio
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to uncompressed dataUrl
            resolve({
              dataUrl: resultDataUrl,
              originalSize: file.size,
              optimizedSize: resultDataUrl.length,
              width,
              height
            });
            return;
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw white background in case of transparent png converted to jpeg
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);

          // Export as compressed JPEG
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);

          resolve({
            dataUrl: optimizedDataUrl,
            originalSize: file.size,
            optimizedSize: Math.round(optimizedDataUrl.length * 0.75),
            width,
            height
          });
        } catch (err) {
          // If canvas tainted or fails, fallback to raw reader result
          resolve({
            dataUrl: resultDataUrl,
            originalSize: file.size,
            optimizedSize: resultDataUrl.length,
            width: img.width,
            height: img.height
          });
        }
      };

      img.src = resultDataUrl;
    };

    reader.readAsDataURL(file);
  });
}
