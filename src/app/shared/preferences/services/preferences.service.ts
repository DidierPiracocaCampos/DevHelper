import {
  computed,
  inject,
  Injectable,
  linkedSignal,
  resource,
  Resource,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FileMetadataI, FileUploadService } from '../../files';
import { ToastService } from '../../service/toast';
import { PreferencesRepository } from './preferences.repository';

function withPreviousValue<T>(input: Resource<T | null>, initial: T | null = null): Resource<T | null> {
  const valueSig = computed(() => input.value());
  const statusSig = computed(() => input.status());
  const key = computed(() => ({ status: statusSig(), value: valueSig() }));

  const previous = linkedSignal<{
    status: ReturnType<typeof statusSig>;
    value: ReturnType<typeof valueSig>;
  }, T | null>({
    source: key,
    computation: (snap, prev) => {
      if (
        (snap.status === 'loading' || snap.status === 'reloading') &&
        prev &&
        prev.value !== undefined
      ) {
        return prev.value;
      }
      return snap.value ?? initial;
    },
  });

  return {
    value: previous,
    status: input.status,
    error: input.error,
    isLoading: input.isLoading,
    hasValue: (() => previous() !== null && previous() !== undefined) as Resource<T | null>['hasValue'],
  };
}

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private _repo = inject(PreferencesRepository);
  private _upload = inject(FileUploadService);
  private _toast = inject(ToastService);

  readonly preferences = this._repo.preferences;

  readonly hasCustomImage = computed(() => {
    const p = this.preferences;
    return p.hasValue() ? !!p.value()?.customNasaImage : false;
  });

  readonly customNasaImageUrl = computed(() => {
    const p = this.preferences;
    return p.hasValue() ? p.value()?.customNasaImage?.storagePath ?? null : null;
  });

  private readonly _urlResource = resource({
    params: () => this.customNasaImageUrl(),
    loader: async ({ params, abortSignal }) => {
      if (!params) return null;
      const url = await this._upload.getDownloadUrl(params);
      if (abortSignal.aborted) {
        throw new Error('aborted');
      }
      return url;
    },
  });

  readonly resolvedUrl = withPreviousValue(this._urlResource, null);

  async setCustomNasaImage(file: File): Promise<void> {
    const previousPath = this.preferences.value()?.customNasaImage?.storagePath;
    let newPath: string | null = null;
    try {
      const meta = await this._upload.upload(file, { localId: 'nasa' });
      newPath = meta.storagePath;
      await firstValueFrom(
        this._repo.setDoc('singleton', {
          id: 'singleton',
          customNasaImage: {
            storagePath: meta.storagePath,
            updatedAt: Date.now(),
          },
        }),
      );
      this.preferences.reload();
      if (previousPath && previousPath !== meta.storagePath) {
        await this._safeDelete(previousPath);
      }
    } catch (err) {
      if (newPath) {
        await this._safeDelete(newPath);
      }
      this._toast.error('No se pudo guardar la imagen personalizada', String(err));
      throw err;
    }
  }

  async clearCustomNasaImage(): Promise<void> {
    const path = this.preferences.value()?.customNasaImage?.storagePath;
    try {
      await firstValueFrom(
        this._repo.setDoc('singleton', { id: 'singleton' }),
      );
      this.preferences.reload();
    } catch (err) {
      this._toast.error('No se pudo quitar la imagen personalizada', String(err));
      throw err;
    }
    if (path) {
      await this._safeDelete(path);
    }
  }

  private async _safeDelete(storagePath: string): Promise<void> {
    try {
      await this._upload.deleteFile({ storagePath } as FileMetadataI);
    } catch (err) {
      console.warn('[PreferencesService] cleanup failed', err);
    }
  }
}
