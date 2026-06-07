import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { UiButton } from '../../../components/ui-button/button';
import { UiAlert } from '../../../components/ui-alert/ui-alert';
import { ConfirmService } from '../../../service/confirm.service';
import { NasaPictureResource } from '../../../../home/service/nasa-picture';
import { PreferencesService } from '../../services/preferences.service';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/*';

@Component({
  selector: 'nasa-image-section',
  imports: [UiButton, UiAlert],
  templateUrl: './nasa-image-section.html',
  styleUrl: './nasa-image-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NasaImageSection {
  protected readonly accept = ACCEPT;
  protected readonly maxSizeBytes = MAX_SIZE_BYTES;

  private _prefs = inject(PreferencesService);
  private _nasa = inject(NasaPictureResource);
  private _confirm = inject(ConfirmService);

  private _picker = viewChild<ElementRef<HTMLInputElement>>('picker');

  private readonly _nasaPicture = this._nasa.getPicture();

  protected readonly resolvedUrl = this._prefs.resolvedUrl;
  protected readonly hasCustomImage = this._prefs.hasCustomImage;
  protected readonly isBusy = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly fallbackNasaUrl = computed<string | null>(() => {
    const v = this._nasaPicture.value();
    return v?.url ?? null;
  });

  protected readonly previewUrl = computed<string | null>(() => {
    const custom = this.resolvedUrl.value();
    if (custom) return custom;
    return this.fallbackNasaUrl();
  });

  protected readonly isNasaLoading = computed(
    () => this._nasaPicture.isLoading() && !this.hasCustomImage(),
  );

  protected openPicker(): void {
    if (this.isBusy()) return;
    this._picker()?.nativeElement.click();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    void this.handleFile(file);
  }

  protected async changeImage(): Promise<void> {
    if (this.isBusy()) return;
    this.openPicker();
  }

  protected async clearImage(): Promise<void> {
    if (this.isBusy() || !this.hasCustomImage()) return;
    const ok = await this._confirm.delete(
      '¿Quieres dejar de usar la imagen personalizada del widget NASA?',
    );
    if (!ok) return;
    await this._run(() => this._prefs.clearCustomNasaImage(), 'No se pudo quitar la imagen');
  }

  private async handleFile(file: File): Promise<void> {
    if (file.size > MAX_SIZE_BYTES) {
      this.errorMessage.set(`"${file.name}" excede el tamaño máximo (5 MB)`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set(`"${file.name}" no es una imagen válida`);
      return;
    }
    this.errorMessage.set(null);
    await this._run(() => this._prefs.setCustomNasaImage(file), 'No se pudo guardar la imagen');
  }

  private async _run(op: () => Promise<void>, errorMsg: string): Promise<void> {
    this.isBusy.set(true);
    try {
      await op();
      this.errorMessage.set(null);
    } catch (err) {
      this.errorMessage.set(`${errorMsg}: ${String(err)}`);
    } finally {
      this.isBusy.set(false);
    }
  }
}
