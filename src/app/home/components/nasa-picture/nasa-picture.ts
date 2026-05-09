import { Component, inject } from '@angular/core';
import { NasaPictureResource } from '../../service/nasa-picture';
import { NgOptimizedImage } from '@angular/common';
@Component({
  selector: 'nasa-picture',
  imports: [NgOptimizedImage],
  templateUrl: './nasa-picture.html',
  styleUrl: './nasa-picture.css',
})
export class NasaPicture {

  private _service = inject(NasaPictureResource);

  info = this._service.getPicture();
}
