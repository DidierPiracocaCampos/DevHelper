import { describe, expect, it, vi, beforeAll } from 'vitest';
import { makeThumbnail, THUMBNAIL_SIZE } from './thumbnail';

type CreateImageBitmapFn = (
  blob: Blob,
  opts?: ImageBitmapOptions,
) => Promise<ImageBitmap>;
type CreateImageBitmapHolder = { createImageBitmap?: CreateImageBitmapFn };

describe('makeThumbnail', () => {
  beforeAll(() => {
    if (typeof globalThis.URL.createObjectURL !== 'function') {
      (globalThis.URL as { createObjectURL: typeof URL.createObjectURL }).createObjectURL =
        vi.fn(() => 'blob:fake') as typeof URL.createObjectURL;
    }
    if (typeof globalThis.URL.revokeObjectURL !== 'function') {
      (globalThis.URL as { revokeObjectURL: typeof URL.revokeObjectURL }).revokeObjectURL =
        vi.fn() as typeof URL.revokeObjectURL;
    }
  });

  it('exports the standard thumbnail size', () => {
    expect(THUMBNAIL_SIZE).toBe(96);
  });

  it('returns null for non-image mime types without calling createImageBitmap', async () => {
    const spy = vi.fn();
    const holder = globalThis as CreateImageBitmapHolder;
    const orig = holder.createImageBitmap;
    holder.createImageBitmap = spy as unknown as CreateImageBitmapFn;
    try {
      const result = await makeThumbnail(new Uint8Array(10), 'application/pdf');
      expect(result).toBeNull();
      expect(spy).not.toHaveBeenCalled();
    } finally {
      holder.createImageBitmap = orig;
    }
  });

  it('returns null when createImageBitmap is not available', async () => {
    const holder = globalThis as CreateImageBitmapHolder;
    const orig = holder.createImageBitmap;
    delete holder.createImageBitmap;
    try {
      const result = await makeThumbnail(new Uint8Array(10), 'image/png');
      expect(result).toBeNull();
    } finally {
      holder.createImageBitmap = orig;
    }
  });

  it('returns a blob URL for an image mime type when createImageBitmap is available', async () => {
    const holder = globalThis as CreateImageBitmapHolder;
    const orig = holder.createImageBitmap;
    const fakeBitmap = {
      width: 200,
      height: 100,
      close: vi.fn(),
    };
    const fakeCtx = {
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    };
    const fakeCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => fakeCtx),
      convertToBlob: vi.fn(async () => new Blob([new Uint8Array(8)], { type: 'image/png' })),
    };
    const fakeOffscreen = function () {
      return fakeCanvas;
    } as unknown as typeof OffscreenCanvas;
    const origOffscreen = (globalThis as { OffscreenCanvas?: typeof OffscreenCanvas }).OffscreenCanvas;
    (globalThis as { OffscreenCanvas: typeof OffscreenCanvas }).OffscreenCanvas = fakeOffscreen;
    holder.createImageBitmap = vi.fn(async () => fakeBitmap) as unknown as CreateImageBitmapFn;
    try {
      const result = await makeThumbnail(new Uint8Array(10), 'image/png');
      expect(result).toBe('blob:fake');
      expect(fakeBitmap.close).toHaveBeenCalled();
      expect(fakeCtx.drawImage).toHaveBeenCalled();
    } finally {
      holder.createImageBitmap = orig;
      (globalThis as { OffscreenCanvas?: typeof OffscreenCanvas }).OffscreenCanvas = origOffscreen;
    }
  });
});
