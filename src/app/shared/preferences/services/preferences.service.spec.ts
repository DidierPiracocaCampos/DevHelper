import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { of, throwError } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { EncryptedFileMetadataI, FileBlobService } from '../../files/services/file-blob.service';
import { Authenticator } from '../../service/authenticator';
import { ToastService } from '../../service/toast';
import { PreferencesRepository } from './preferences.repository';
import { PreferencesService } from './preferences.service';
import { UserPreferencesI } from '../models/preferences.model';

class FakeBlob {
  upload = vi.fn();
  deleteFile = vi.fn();
  getObjectUrl = vi.fn();
}

class FakeAuth {
  readonly user = signal<{ uid: string } | null>({ uid: 'u1' });
}

class FakeRepo {
  setDoc = vi.fn();
  private _value = signal<UserPreferencesI | undefined>({
    id: 'singleton' as const,
    customNasaImage: undefined,
  });
  preferences = {
    value: () => this._value() as UserPreferencesI,
    hasValue: () => this._value() !== undefined,
    reload: vi.fn(),
  };
  setValue(v: UserPreferencesI | undefined) {
    this._value.set(v);
  }
}

class FakeToast {
  error = vi.fn();
  success = vi.fn();
  warning = vi.fn();
  info = vi.fn();
}

function makeFile(name = 'img.png', size = 10, type = 'image/png'): File {
  return new File([new Uint8Array(size)], name, { type });
}

function makeFakeFirestore(): Record<string, unknown> {
  return {
    toJSON: () => undefined,
  };
}

describe('PreferencesService', () => {
  let service: PreferencesService;
  let blob: FakeBlob;
  let repo: FakeRepo;
  let toast: FakeToast;
  let auth: FakeAuth;

  beforeEach(async () => {
    blob = new FakeBlob();
    repo = new FakeRepo();
    toast = new FakeToast();
    auth = new FakeAuth();

    await TestBed.configureTestingModule({
      providers: [
        PreferencesService,
        { provide: FileBlobService, useValue: blob },
        { provide: PreferencesRepository, useValue: repo },
        { provide: ToastService, useValue: toast },
        { provide: Authenticator, useValue: auth },
        { provide: Firestore, useValue: makeFakeFirestore() },
      ],
    }).compileComponents();
    service = TestBed.inject(PreferencesService);
  });

  describe('derived state', () => {
    it('hasCustomImage is false when no custom image is set', () => {
      expect(service.hasCustomImage()).toBe(false);
      expect(service.customNasaImageFileId()).toBeNull();
    });

    it('hasCustomImage is true when customNasaImage is set', () => {
      repo.setValue({
        id: 'singleton' as const,
        customNasaImage: {
          fileId: 'nasa-1',
          updatedAt: 1,
        },
      });
      expect(service.hasCustomImage()).toBe(true);
      expect(service.customNasaImageFileId()).toBe('nasa-1');
    });
  });

  describe('setCustomNasaImage', () => {
    it('uploads to nasa-image namespace, persists fileId, and reloads', async () => {
      const newMeta: EncryptedFileMetadataI & { id: string } = {
        id: 'new-id',
        name: 'img.png',
        size: 10,
        mimeType: 'image/png',
        chunkCount: 1,
        updatedAt: 1,
        encrypted: false,
        iv: null,
        tags: [],
        createdAt: 1,
      };
      blob.upload.mockResolvedValue(newMeta);
      repo.setDoc.mockReturnValue(of(undefined));

      await service.setCustomNasaImage(makeFile());

      expect(blob.upload).toHaveBeenCalledWith(expect.any(File), 'nasa-image', expect.any(Object));
      expect(repo.setDoc).toHaveBeenCalledWith('singleton', {
        id: 'singleton',
        customNasaImage: {
          fileId: 'new-id',
          updatedAt: expect.any(Number),
        },
      });
      expect(repo.preferences.reload).toHaveBeenCalled();
    });

    it('deletes the previous fileId after a successful replace', async () => {
      repo.setValue({
        id: 'singleton' as const,
        customNasaImage: { fileId: 'old-id', updatedAt: 1 },
      });

      blob.upload.mockResolvedValue({
        id: 'new-id',
        name: 'img.png',
        size: 10,
        mimeType: 'image/png',
        chunkCount: 1,
        updatedAt: 1,
        encrypted: false,
        iv: null,
        tags: [],
        createdAt: 1,
      });
      repo.setDoc.mockReturnValue(of(undefined));
      blob.deleteFile.mockResolvedValue(undefined);

      await service.setCustomNasaImage(makeFile());

      expect(blob.deleteFile).toHaveBeenCalledWith('nasa-image', 'old-id');
    });

    it('does not delete the previous fileId when storagePath is the same', async () => {
      const sameId = 'same-id';
      repo.setValue({
        id: 'singleton' as const,
        customNasaImage: { fileId: sameId, updatedAt: 1 },
      });

      blob.upload.mockResolvedValue({
        id: sameId,
        name: 'x.png',
        size: 10,
        mimeType: 'image/png',
        chunkCount: 1,
        updatedAt: 1,
        encrypted: false,
        iv: null,
        tags: [],
        createdAt: 1,
      });
      repo.setDoc.mockReturnValue(of(undefined));

      await service.setCustomNasaImage(makeFile('x.png'));

      expect(blob.deleteFile).not.toHaveBeenCalled();
    });

    it('deletes the orphan upload and toasts error when setDoc fails', async () => {
      const newMeta: EncryptedFileMetadataI & { id: string } = {
        id: 'orphan',
        name: 'img.png',
        size: 10,
        mimeType: 'image/png',
        chunkCount: 1,
        updatedAt: 1,
        encrypted: false,
        iv: null,
        tags: [],
        createdAt: 1,
      };
      blob.upload.mockResolvedValue(newMeta);
      repo.setDoc.mockReturnValue(throwError(() => new Error('firestore down')));
      blob.deleteFile.mockResolvedValue(undefined);

      await expect(service.setCustomNasaImage(makeFile())).rejects.toThrow('firestore down');

      expect(blob.deleteFile).toHaveBeenCalledWith('nasa-image', 'orphan');
      expect(toast.error).toHaveBeenCalled();
    });

    it('toasts and rethrows when upload itself fails (no orphan to clean)', async () => {
      blob.upload.mockRejectedValue(new Error('upload failed'));

      await expect(service.setCustomNasaImage(makeFile())).rejects.toThrow('upload failed');

      expect(blob.deleteFile).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('clearCustomNasaImage', () => {
    it('clears the doc and deletes the fileId from storage', async () => {
      repo.setValue({
        id: 'singleton' as const,
        customNasaImage: { fileId: 'nasa-1', updatedAt: 1 },
      });
      repo.setDoc.mockReturnValue(of(undefined));
      blob.deleteFile.mockResolvedValue(undefined);

      await service.clearCustomNasaImage();

      expect(repo.setDoc).toHaveBeenCalledWith(
        'singleton',
        expect.objectContaining({ id: 'singleton' }),
      );
      const setCall = repo.setDoc.mock.calls.at(-1)?.[1] as Record<string, unknown>;
      expect(setCall).toHaveProperty('customNasaImage');
      expect(setCall['customNasaImage']).toBeDefined();
      expect(repo.preferences.reload).toHaveBeenCalled();
      expect(blob.deleteFile).toHaveBeenCalledWith('nasa-image', 'nasa-1');
    });

    it('does not call deleteFile when there is no custom image', async () => {
      repo.setDoc.mockReturnValue(of(undefined));

      await service.clearCustomNasaImage();

      expect(blob.deleteFile).not.toHaveBeenCalled();
    });

    it('toasts and rethrows when setDoc fails', async () => {
      repo.setDoc.mockReturnValue(throwError(() => new Error('boom')));

      await expect(service.clearCustomNasaImage()).rejects.toThrow('boom');
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('resolvedUrl (withPreviousValue)', () => {
    it('returns null and hasValue=false when there is no custom image', () => {
      expect(service.resolvedUrl.hasValue()).toBe(false);
      expect(service.resolvedUrl.value()).toBeNull();
    });

    it('does not call getObjectUrl when fileId is missing', () => {
      expect(blob.getObjectUrl).not.toHaveBeenCalled();
    });
  });
});
