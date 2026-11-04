import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { Firestore } from '@angular/fire/firestore';
import { FileBlobService } from './file-blob.service';
import { Authenticator } from '../../service/authenticator';

class FakeAuthenticator {
  readonly user = signal<{ uid: string } | null>({ uid: 'u1' });
}

/** Firestore I/O seams of FileBlobService.upload (private, spied here). */
interface BlobIo {
  _writeChunk(
    uid: string,
    segments: string[],
    id: string,
    index: number,
    data: Uint8Array,
  ): Promise<void>;
  _writeMetadata(
    uid: string,
    segments: string[],
    id: string,
    data: Record<string, unknown>,
  ): Promise<void>;
  _deleteChunk(uid: string, segments: string[], id: string, index: number): Promise<void>;
}

describe('FileBlobService.upload cleanup', () => {
  let service: FileBlobService;
  let io: BlobIo;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        FileBlobService,
        { provide: Authenticator, useClass: FakeAuthenticator },
        { provide: Firestore, useValue: { __fake: true } as unknown as Firestore },
      ],
    }).compileComponents();
    service = TestBed.inject(FileBlobService);
    io = service as unknown as BlobIo;
    vi.spyOn(io, '_writeChunk').mockResolvedValue(undefined);
    vi.spyOn(io, '_writeMetadata').mockResolvedValue(undefined);
    vi.spyOn(io, '_deleteChunk').mockResolvedValue(undefined);
  });

  it('deletes already-written chunks and rethrows when the metadata write is rejected', async () => {
    const denied = Object.assign(new Error('Missing or insufficient permissions.'), {
      code: 'permission-denied',
    });
    vi.mocked(io._writeMetadata).mockRejectedValue(denied);
    // 1.2 MB -> 2 chunks of 700 KB max
    const file = new File([new Uint8Array(1200 * 1024)], 'a.png', { type: 'image/png' });

    await expect(service.upload(file, 'nasa-image')).rejects.toBe(denied);

    const [uid, segments, id] = vi.mocked(io._writeChunk).mock.calls[0];
    expect(vi.mocked(io._deleteChunk).mock.calls).toEqual([
      [uid, segments, id, 0],
      [uid, segments, id, 1],
    ]);
  });

  it('deletes the chunks written so far when a later chunk write fails', async () => {
    const boom = new Error('network');
    vi.mocked(io._writeChunk).mockResolvedValueOnce(undefined).mockRejectedValueOnce(boom);
    const file = new File([new Uint8Array(1200 * 1024)], 'a.png', { type: 'image/png' });

    await expect(service.upload(file, 'files')).rejects.toBe(boom);

    expect(io._writeMetadata).not.toHaveBeenCalled();
    expect(vi.mocked(io._deleteChunk).mock.calls.map((c) => c[3])).toEqual([0]);
  });

  it('still rethrows the original error if cleanup itself fails', async () => {
    const denied = new Error('denied');
    vi.mocked(io._writeMetadata).mockRejectedValue(denied);
    vi.mocked(io._deleteChunk).mockRejectedValue(new Error('cleanup failed'));
    const file = new File([new Uint8Array(10)], 'a.png', { type: 'image/png' });

    await expect(service.upload(file, 'files')).rejects.toBe(denied);
  });

  it('does not delete anything when the upload succeeds', async () => {
    const file = new File([new Uint8Array(10)], 'a.png', { type: 'image/png' });

    const meta = await service.upload(file, 'files');

    expect(meta.name).toBe('a.png');
    expect(io._writeMetadata).toHaveBeenCalledTimes(1);
    expect(io._deleteChunk).not.toHaveBeenCalled();
  });
});
