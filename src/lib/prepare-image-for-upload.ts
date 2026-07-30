const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|heic|heif|bmp|tiff?)$/i;
const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.82;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** iOS Photos often yields an empty MIME type for HEIC; Android camera is usually fine. */
export function isLikelyImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return IMAGE_EXTENSIONS.test(file.name);
}

function jpegFileName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '') || 'photo';
  return `${base}.jpg`;
}

function scaleDimensions(width: number, height: number, max: number) {
  if (width <= max && height <= max) return { width, height };
  const scale = max / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Could not encode the image.'));
      },
      'image/jpeg',
      quality,
    );
  });
}

async function encodeBitmapAsJpeg(source: ImageBitmap | HTMLImageElement): Promise<Blob> {
  const { width, height } = scaleDimensions(source.width, source.height, MAX_DIMENSION);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not prepare the image.');
  context.drawImage(source, 0, 0, width, height);
  return canvasToJpegBlob(canvas, JPEG_QUALITY);
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read the image.'));
    };
    image.src = url;
  });
}

async function convertViaBitmap(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, {
    // Respect EXIF orientation from phone cameras.
    imageOrientation: 'from-image',
  } as ImageBitmapOptions);
  try {
    return await encodeBitmapAsJpeg(bitmap);
  } finally {
    bitmap.close();
  }
}

async function convertViaImageElement(file: File): Promise<Blob> {
  const image = await loadImageElement(file);
  return encodeBitmapAsJpeg(image);
}

/**
 * Normalize phone photos (HEIC / empty MIME / huge dimensions) into a JPEG
 * the existing /api/upload FormData path can accept.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (!isLikelyImageFile(file)) {
    throw new Error('Please choose an image file.');
  }

  let blob: Blob | null = null;

  try {
    blob = await convertViaBitmap(file);
  } catch {
    try {
      blob = await convertViaImageElement(file);
    } catch {
      blob = null;
    }
  }

  if (blob) {
    if (blob.size > MAX_UPLOAD_BYTES) {
      throw new Error('Images must be smaller than 10 MB.');
    }
    return new File([blob], jpegFileName(file.name), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  }

  // Last resort: pass through if the browser couldn't re-encode (rare), but
  // ensure empty MIME types get a usable type so validation downstream is happy.
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Images must be smaller than 10 MB.');
  }

  if (file.type.startsWith('image/')) return file;

  const extension = file.name.split('.').pop()?.toLowerCase();
  const mime =
    extension === 'png'
      ? 'image/png'
      : extension === 'webp'
        ? 'image/webp'
        : extension === 'gif'
          ? 'image/gif'
          : extension === 'heic' || extension === 'heif'
            ? 'image/heic'
            : 'image/jpeg';

  return new File([file], file.name, { type: mime, lastModified: file.lastModified });
}

export async function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Could not read the image.'));
    };
    reader.onerror = () => reject(new Error('Could not read the image.'));
    reader.readAsDataURL(file);
  });
}

export function prefersMobilePhotoUpload(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPod/i.test(ua)) return true;
  // iPadOS 13+ may report as MacIntel with touch.
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
  return /iPad/i.test(ua);
}
