import { Component, computed, inject } from '@angular/core';
import { APOD_PAGE_URL, NasaPictureResource } from '../../service/nasa-picture';
import { PreferencesService } from '../../../shared/preferences';

@Component({
  selector: 'nasa-picture',
  imports: [],
  templateUrl: './nasa-picture.html',
})
export class NasaPicture {
  private _service = inject(NasaPictureResource);
  private _prefs = inject(PreferencesService);

  info = this._service.getPicture();
  customUrl = this._prefs.resolvedUrl;

  readonly apodPageUrl = APOD_PAGE_URL;

  /** APOD data, or undefined while loading / on error (resource.value() throws in error state). */
  picture = computed(() => (this.info.hasValue() ? this.info.value() : undefined));

  displayUrl = computed(() => {
    const custom = this.customUrl.value();
    if (custom) return custom;
    const v = this.picture();
    if (!v) return null;
    if (v.media_type === 'video') return v.thumbnail_url ?? null;
    return v.url;
  });

  isVideo = computed(() => !this.customUrl.value() && this.picture()?.media_type === 'video');

  videoUrl = computed(() => this.picture()?.url ?? null);

  isLoading = computed(() => this.info.isLoading() && !this.customUrl.value());

  /** APOD failed (HTTP error or placeholder response) and there is no custom image to show. */
  hasError = computed(() => !this.customUrl.value() && !!this.info.error());

  /** @deprecated use displayUrl */
  imageUrl = this.displayUrl;
}
