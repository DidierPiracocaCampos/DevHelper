import { HttpContext, httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SKIP_ERROR_TOAST } from '../../shared/handler/http-error.interceptor';
import { environment } from '../../../environment/environment';
import { NasaPictureI } from '../domain/nasa-picture.interface';

/** Public APOD page, used as the fallback link when the API is unavailable. */
export const APOD_PAGE_URL = 'https://science.nasa.gov/apod/';

/**
 * Since apod.nasa.gov moved to science.nasa.gov/apod/, the APOD API sometimes answers 200
 * with the NASA site logo instead of the picture of the day. Treat that as "unavailable".
 */
export function isApodPlaceholder(picture: Pick<NasaPictureI, 'url'>): boolean {
  return /\/nasa-logo[^/]*\.(png|svg)$/i.test(picture.url);
}

function parseApod(raw: unknown): NasaPictureI {
  const picture = raw as NasaPictureI;
  if (!picture?.url || isApodPlaceholder(picture)) {
    throw new Error('APOD unavailable: placeholder response');
  }
  return picture;
}

@Injectable({
  providedIn: 'root',
})
export class NasaPictureResource {
  getPicture() {
    return httpResource<NasaPictureI>(
      () => ({
        url:
          'https://api.nasa.gov/planetary/apod?api_key=' + environment.nasaApiKey + '&thumbs=true',
        cache: 'force-cache',
        // The widget shows its own fallback; a global toast for a decorative image is noise.
        context: new HttpContext().set(SKIP_ERROR_TOAST, true),
      }),
      { parse: parseApod },
    );
  }
}
