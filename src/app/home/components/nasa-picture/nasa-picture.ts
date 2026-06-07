import { Component, computed, inject } from '@angular/core';
import { NasaPictureResource } from '../../service/nasa-picture';
import { NgOptimizedImage } from '@angular/common';
import { PreferencesService } from '../../../shared/preferences';

@Component({
  selector: 'nasa-picture',
  imports: [NgOptimizedImage],
  templateUrl: './nasa-picture.html',
})
export class NasaPicture {
  private _service = inject(NasaPictureResource);
  private _prefs = inject(PreferencesService);

  info = this._service.getPicture();
  customUrl = this._prefs.resolvedUrl;

  imageUrl = computed(() => this.customUrl.value() ?? this.info.value()?.url ?? null);
}
