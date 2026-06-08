export const THUMBNAIL_SIZE = 96;

export async function makeThumbnail(
  bytes: Uint8Array,
  mimeType: string,
  size = THUMBNAIL_SIZE,
): Promise<string | null> {
  if (!mimeType.startsWith('image/')) return null;
  if (typeof createImageBitmap !== 'function') return null;

  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  const blob = new Blob([buffer], { type: mimeType });

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    return null;
  }

  try {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const ratio = bitmap.width / bitmap.height;
    let w = size;
    let h = size;
    if (ratio > 1) {
      h = Math.round(size / ratio);
    } else {
      w = Math.round(size * ratio);
    }
    const dx = Math.floor((size - w) / 2);
    const dy = Math.floor((size - h) / 2);

    ctx.fillStyle = '#20201E';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(bitmap, dx, dy, w, h);

    const out = await canvas.convertToBlob({ type: 'image/png' });
    return URL.createObjectURL(out);
  } finally {
    bitmap.close();
  }
}
