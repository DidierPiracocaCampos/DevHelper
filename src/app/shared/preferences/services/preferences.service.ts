import {
  computed,
  inject,
  Injectable,
  linkedSignal,
  resource,
  Resource,
} from '@angular/core';
import {
  deleteField,
  doc,
  Firestore,
  getDoc,
} from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { FileBlobService } from '../../files/services/file-blob.service';
import { Authenticator } from '../../service/authenticator';
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
  private _blob = inject(FileBlobService);
  private _toast = inject(ToastService);
  private _firestore = inject(Firestore);
  private _auth = inject(Authenticator);

  readonly preferences = this._repo.preferences;

  readonly hasCustomImage = computed(() => {
    const p = this.preferences;
    return p.hasValue() ? !!p.value()?.customNasaImage : false;
  });

  readonly customNasaImageFileId = computed(() => {
    const p = this.preferences;
    return p.hasValue() ? p.value()?.customNasaImage?.fileId ?? null : null;
  });

  private readonly _urlResource = resource({
    params: () => {
      const fileId = this.customNasaImageFileId();
      const uid = this._auth.user()?.uid ?? null;
      return { fileId, uid };
    },
    loader: async ({ params, abortSignal }) => {
      if (!params.fileId || !params.uid) return null;
      const metaSnap = await getDoc(
        doc(this._firestore, 'users', params.uid, 'nasa-image', params.fileId),
      );
      if (abortSignal.aborted) throw new Error('aborted');
      if (!metaSnap.exists()) return null;
      const type =
        (metaSnap.data() as { mimeType?: string } | undefined)?.mimeType ?? 'application/octet-stream';
      const url = await this._blob.getObjectUrl('nasa-image', params.fileId, type);
      if (abortSignal.aborted) throw new Error('aborted');
      return url;
    },
  });

  readonly resolvedUrl = withPreviousValue(this._urlResource, null);

  async setCustomNasaImage(file: File): Promise<void> {
    const previousFileId = this.preferences.value()?.customNasaImage?.fileId;
    let newFileId: string | null = null;
    try {
      const meta = await this._blob.upload(file, 'nasa-image', {
        onProgress: () => {
          /* progress handled at component level via local signal */
        },
      });
      newFileId = meta.id;
      await firstValueFrom(
        this._repo.setDoc('singleton', {
          id: 'singleton',
          customNasaImage: {
            fileId: meta.id,
            updatedAt: Date.now(),
          },
        }),
      );
      this.preferences.reload();
      this._urlResource.reload();
      if (previousFileId && previousFileId !== meta.id) {
        await this._safeDelete(previousFileId);
      }
    } catch (err) {
      if (newFileId) {
        await this._safeDelete(newFileId);
      }
      this._toast.error('No se pudo guardar la imagen personalizada', String(err));
      throw err;
    }
  }

  async clearCustomNasaImage(): Promise<void> {
    const fileId = this.preferences.value()?.customNasaImage?.fileId;
    try {
      await firstValueFrom(
        this._repo.setDoc('singleton', {
          id: 'singleton',
          customNasaImage: deleteField() as unknown as undefined,
        }),
      );
      this.preferences.reload();
      this._urlResource.reload();
    } catch (err) {
      this._toast.error('No se pudo quitar la imagen personalizada', String(err));
      throw err;
    }
    if (fileId) {
      await this._safeDelete(fileId);
    }
  }

  private async _safeDelete(fileId: string): Promise<void> {
    try {
      await this._blob.deleteFile('nasa-image', fileId);
    } catch (err) {
      console.warn('[PreferencesService] cleanup failed', err);
    }
  }
}
