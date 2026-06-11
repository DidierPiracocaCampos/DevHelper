import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { Firestore } from '@angular/fire/firestore';
import {
  FileBlobService,
  BlobValidationError,
} from './file-blob.service';
import { BLOB_CHUNK_SIZE, BLOB_MAX_FILE_SIZE } from '../models/blob-chunk.model';
import { Authenticator } from '../../service/authenticator';

class FakeAuthenticator {
  readonly user = signal<{ uid: string } | null>({ uid: 'u1' });
}

function makeFile(name: string, sizeBytes: number, type = 'application/octet-stream'): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

vi.spyOn(console, 'error').mockImplementation(() => {});

describe('FileBlobService', () => {
  describe('constants', () => {
    it('exposes the chunk and max-file size constants', () => {
      expect(BLOB_CHUNK_SIZE).toBe(700 * 1024);
      expect(BLOB_MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
    });
  });

  describe('splitIntoChunks (static)', () => {
    it('returns a single chunk for a small file', () => {
      const file = makeFile('a.bin', 100);
      const chunks = FileBlobService.splitIntoChunks(file);
      expect(chunks.length).toBe(1);
      expect(chunks[0]).toEqual({ index: 0, start: 0, end: 100 });
    });

    it('splits a 1.4 MB file into 2 chunks of 700 KB + 700 KB', () => {
      const file = makeFile('b.bin', 1433600);
      const chunks = FileBlobService.splitIntoChunks(file);
      expect(chunks.length).toBe(2);
      expect(chunks[0].start).toBe(0);
      expect(chunks[0].end).toBe(700 * 1024);
      expect(chunks[1].start).toBe(700 * 1024);
      expect(chunks[1].end).toBe(1433600);
    });

    it('respects a custom chunk size', () => {
      const file = makeFile('c.bin', 1000);
      const chunks = FileBlobService.splitIntoChunks(file, 300);
      expect(chunks.length).toBe(4);
      expect(chunks.map((c) => c.end - c.start)).toEqual([300, 300, 300, 100]);
    });

    it('returns one chunk of size 0 for an empty file', () => {
      const file = makeFile('e.bin', 0);
      const chunks = FileBlobService.splitIntoChunks(file);
      expect(chunks.length).toBe(1);
      expect(chunks[0].end).toBe(0);
    });
  });

  describe('computeMetadata (static)', () => {
    it('builds unencrypted metadata when no key is provided', () => {
      const file = makeFile('a.bin', 100, 'image/png');
      const { metadata, iv } = FileBlobService.computeMetadata(file, 'id-1', undefined);
      expect(metadata.encrypted).toBe(false);
      expect(iv).toBeNull();
      expect(metadata.iv).toBeNull();
      expect(metadata.chunkCount).toBe(1);
      expect(metadata.size).toBe(100);
      expect(metadata.name).toBe('a.bin');
      expect(metadata.mimeType).toBe('image/png');
      expect(metadata.tags).toEqual([]);
      expect(typeof metadata.createdAt).toBe('number');
      expect(metadata.createdAt).toBeGreaterThan(0);
    });

    it('builds encrypted metadata with a 12-byte IV when a key is provided', async () => {
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt'],
      );
      const file = makeFile('s.bin', 500);
      const { metadata, iv } = FileBlobService.computeMetadata(file, 'id-2', key);
      expect(metadata.encrypted).toBe(true);
      expect(iv).toBeInstanceOf(Uint8Array);
      expect(iv?.length).toBe(12);
      expect(typeof metadata.iv).toBe('string');
      expect((metadata.iv as string).length).toBeGreaterThan(0);
    });
  });

  describe('concatenateChunks (static)', () => {
    it('joins chunks in order', () => {
      const out = FileBlobService.concatenateChunks([
        new Uint8Array([1, 2]),
        new Uint8Array([3, 4, 5]),
      ]);
      expect(Array.from(out)).toEqual([1, 2, 3, 4, 5]);
    });

    it('returns an empty Uint8Array for empty input', () => {
      const out = FileBlobService.concatenateChunks([]);
      expect(out.length).toBe(0);
    });
  });

  describe('upload validation', () => {
    let service: FileBlobService;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        providers: [
          FileBlobService,
          { provide: Authenticator, useClass: FakeAuthenticator },
          { provide: Firestore, useValue: { __fake: true } as unknown as Firestore },
        ],
      }).compileComponents();
      service = TestBed.inject(FileBlobService);
    });

    it('throws when file exceeds MAX_FILE_SIZE', async () => {
      const big = makeFile('big.bin', 6 * 1024 * 1024);
      await expect(service.upload(big, 'files')).rejects.toBeInstanceOf(BlobValidationError);
    });

    it('throws when no user is signed in', async () => {
      const auth = TestBed.inject(Authenticator) as unknown as FakeAuthenticator;
      auth.user.set(null);
      await expect(
        service.upload(makeFile('a.bin', 10), 'files'),
      ).rejects.toThrow('No authenticated user');
    });
  });
});
