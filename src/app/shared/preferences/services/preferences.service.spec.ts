import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { of, throwError } from 'rxjs';
import { FileMetadataI, FileUploadService } from '../../files';
import { ToastService } from '../../service/toast';
import { PreferencesRepository } from './preferences.repository';
import { PreferencesService } from './preferences.service';
import { UserPreferencesI } from '../models/preferences.model';

class FakeUpload {
  upload = vi.fn();
  deleteFile = vi.fn();
  getDownloadUrl = vi.fn();
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

describe('PreferencesService', () => {
  let service: PreferencesService;
  let upload: FakeUpload;
  let repo: FakeRepo;
  let toast: FakeToast;

  beforeEach(async () => {
    upload = new FakeUpload();
    repo = new FakeRepo();
    toast = new FakeToast();

    await TestBed.configureTestingModule({
      providers: [
        PreferencesService,
        { provide: FileUploadService, useValue: upload },
        { provide: PreferencesRepository, useValue: repo },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();
    service = TestBed.inject(PreferencesService);
  });

  describe('derived state', () => {
    it('hasCustomImage is false when no custom image is set', () => {
      expect(service.hasCustomImage()).toBe(false);
      expect(service.customNasaImageUrl()).toBeNull();
    });

    it('hasCustomImage is true when customNasaImage is set', () => {
      repo.setValue({
        id: 'singleton' as const,
        customNasaImage: {
          storagePath: 'users/u1/nasa-image/x.png',
          updatedAt: 1,
        },
      });
      expect(service.hasCustomImage()).toBe(true);
      expect(service.customNasaImageUrl()).toBe('users/u1/nasa-image/x.png');
    });
  });

  describe('setCustomNasaImage', () => {
    it('uploads, persists and reloads on happy path', async () => {
      const newMeta: FileMetadataI & { id: string } = {
        id: 'new',
        name: 'img.png',
        size: 10,
        type: 'image/png',
        storagePath: 'users/u1/nasa-image/new.png',
        uploadedAt: 1,
      };
      upload.upload.mockResolvedValue(newMeta);
      repo.setDoc.mockReturnValue(of(undefined));

      await service.setCustomNasaImage(makeFile());

      expect(upload.upload).toHaveBeenCalledWith(expect.any(File), { localId: 'nasa' });
      expect(repo.setDoc).toHaveBeenCalledWith('singleton', {
        id: 'singleton',
        customNasaImage: {
          storagePath: 'users/u1/nasa-image/new.png',
          updatedAt: expect.any(Number),
        },
      });
      expect(repo.preferences.reload).toHaveBeenCalled();
    });

    it('deletes the previous image from storage after a successful replace', async () => {
      repo.setValue({
        id: 'singleton' as const,
        customNasaImage: {
          storagePath: 'users/u1/nasa-image/old.png',
          updatedAt: 1,
        },
      });

      upload.upload.mockResolvedValue({
        id: 'new',
        name: 'img.png',
        size: 10,
        type: 'image/png',
        storagePath: 'users/u1/nasa-image/new.png',
        uploadedAt: 1,
      });
      repo.setDoc.mockReturnValue(of(undefined));
      upload.deleteFile.mockResolvedValue(undefined);

      await service.setCustomNasaImage(makeFile());

      expect(upload.deleteFile).toHaveBeenCalledWith({
        storagePath: 'users/u1/nasa-image/old.png',
      });
    });

    it('does not delete the previous image when storagePath is the same', async () => {
      const samePath = 'users/u1/nasa-image/x.png';
      repo.setValue({
        id: 'singleton' as const,
        customNasaImage: { storagePath: samePath, updatedAt: 1 },
      });

      upload.upload.mockResolvedValue({
        id: 'new',
        name: 'x.png',
        size: 10,
        type: 'image/png',
        storagePath: samePath,
        uploadedAt: 1,
      });
      repo.setDoc.mockReturnValue(of(undefined));

      await service.setCustomNasaImage(makeFile('x.png'));

      expect(upload.deleteFile).not.toHaveBeenCalled();
    });

    it('deletes the orphan upload and toasts error when setDoc fails', async () => {
      const newMeta: FileMetadataI & { id: string } = {
        id: 'new',
        name: 'img.png',
        size: 10,
        type: 'image/png',
        storagePath: 'users/u1/nasa-image/new.png',
        uploadedAt: 1,
      };
      upload.upload.mockResolvedValue(newMeta);
      repo.setDoc.mockReturnValue(throwError(() => new Error('firestore down')));
      upload.deleteFile.mockResolvedValue(undefined);

      await expect(service.setCustomNasaImage(makeFile())).rejects.toThrow('firestore down');

      expect(upload.deleteFile).toHaveBeenCalledWith({
        storagePath: 'users/u1/nasa-image/new.png',
      });
      expect(toast.error).toHaveBeenCalled();
    });

    it('toasts and rethrows when upload itself fails (no orphan to clean)', async () => {
      upload.upload.mockRejectedValue(new Error('upload failed'));

      await expect(service.setCustomNasaImage(makeFile())).rejects.toThrow('upload failed');

      expect(upload.deleteFile).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('clearCustomNasaImage', () => {
    it('clears the doc and deletes the file from storage', async () => {
      repo.setValue({
        id: 'singleton' as const,
        customNasaImage: {
          storagePath: 'users/u1/nasa-image/x.png',
          updatedAt: 1,
        },
      });
      repo.setDoc.mockReturnValue(of(undefined));
      upload.deleteFile.mockResolvedValue(undefined);

      await service.clearCustomNasaImage();

      expect(repo.setDoc).toHaveBeenCalledWith('singleton', { id: 'singleton' });
      expect(repo.preferences.reload).toHaveBeenCalled();
      expect(upload.deleteFile).toHaveBeenCalledWith({
        storagePath: 'users/u1/nasa-image/x.png',
      });
    });

    it('does not call deleteFile when there is no custom image', async () => {
      repo.setDoc.mockReturnValue(of(undefined));

      await service.clearCustomNasaImage();

      expect(upload.deleteFile).not.toHaveBeenCalled();
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

    it('resolves the download URL from getDownloadUrl when a custom path is set', async () => {
      upload.getDownloadUrl.mockResolvedValue('https://example.com/x.png');
      repo.setValue({
        id: 'singleton' as const,
        customNasaImage: {
          storagePath: 'users/u1/nasa-image/x.png',
          updatedAt: 1,
        },
      });

      await new Promise((r) => setTimeout(r, 20));

      expect(upload.getDownloadUrl).toHaveBeenCalledWith('users/u1/nasa-image/x.png');
      expect(service.resolvedUrl.hasValue()).toBe(true);
    });
  });
});
