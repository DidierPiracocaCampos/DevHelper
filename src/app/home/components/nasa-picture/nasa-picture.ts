import { Component, computed, inject } from '@angular/core';
import { NasaPictureResource } from '../../service/nasa-picture';
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

  displayUrl = computed(() => {
    const custom = this.customUrl.value();
    if (custom) return custom;
    const v = this.info.value();
    if (!v) return null;
    if (v.media_type === 'video') return v.thumbnail_url ?? null;
    return v.url;
  });

  isVideo = computed(() => !this.customUrl.value() && this.info.value()?.media_type === 'video');

  videoUrl = computed(() => this.info.value()?.url ?? null);

  isLoading = computed(() => this.info.isLoading() && !this.customUrl.value());

  /** @deprecated use displayUrl */
  imageUrl = this.displayUrl;
}
