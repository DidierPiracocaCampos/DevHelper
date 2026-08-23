import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { NasaImageSection } from './nasa-image-section';
import { PreferencesService } from '../../services/preferences.service';
import { ConfirmService } from '../../../service/confirm.service';
import { NasaPictureResource } from '../../../../home/service/nasa-picture';

class FakePrefs {
  // mimic Resource<string|null> with .value()
  private _url = signal<string | null>(null);
  resolvedUrl = Object.assign(this._url, {
    value: () => this._url(),
  }) as unknown as ReturnType<typeof signal<string | null>> & { value: () => string | null };
  hasCustomImage = signal(false);
  setCustomNasaImage = vi.fn();
  clearCustomNasaImage = vi.fn();
  setResolvedUrl(v: string | null) {
    this._url.set(v);
  }
}

class FakeNasa {
  private _value = signal<unknown>(null);
  getPicture = () => ({ value: this._value, isLoading: () => false });
  setPicture(v: unknown) {
    this._value.set(v);
  }
}

class FakeConfirm {
  delete = vi.fn().mockResolvedValue(true);
}

function callProtected<T extends object>(obj: T, method: string, ...args: unknown[]): unknown {
  const fn = (obj as unknown as Record<string, (...a: unknown[]) => unknown>)[method];
  return fn.apply(obj, args);
}

describe('NasaImageSection', () => {
  let fixture: ComponentFixture<NasaImageSection>;
  let component: NasaImageSection;
  let prefs: FakePrefs;
  let confirm: FakeConfirm;
  let nasa: FakeNasa;

  beforeEach(async () => {
    prefs = new FakePrefs();
    confirm = new FakeConfirm();
    nasa = new FakeNasa();
    await TestBed.configureTestingModule({
      imports: [NasaImageSection],
      providers: [
        { provide: PreferencesService, useValue: prefs },
        { provide: ConfirmService, useValue: confirm },
        { provide: NasaPictureResource, useValue: nasa },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(NasaImageSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not render an img when there is no preview', () => {
    prefs.hasCustomImage.set(false);
    nasa.setPicture(null);
    fixture.detectChanges();
    const img: HTMLImageElement | null = fixture.nativeElement.querySelector('img');
    expect(img).toBeNull();
  });

  it('does not render the "Quitar" button when there is no custom image', () => {
    prefs.hasCustomImage.set(false);
    fixture.detectChanges();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('ui-button'),
    );
    const quitar = buttons.find((b) => b.textContent?.includes('Quitar'));
    expect(quitar).toBeUndefined();
  });

  it('renders the "Quitar" button when hasCustomImage is true', () => {
    prefs.hasCustomImage.set(true);
    fixture.detectChanges();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('ui-button'),
    );
    const quitar = buttons.find((b) => b.textContent?.includes('Quitar'));
    expect(quitar).toBeDefined();
  });

  it('asks for confirmation and clears the image when confirmed', async () => {
    prefs.hasCustomImage.set(true);
    prefs.clearCustomNasaImage.mockResolvedValue(undefined);
    confirm.delete.mockResolvedValue(true);
    fixture.detectChanges();

    await callProtected(component, 'clearImage');
    expect(confirm.delete).toHaveBeenCalled();
    expect(prefs.clearCustomNasaImage).toHaveBeenCalled();
  });

  it('does not clear when the user cancels the confirmation', async () => {
    prefs.hasCustomImage.set(true);
    confirm.delete.mockResolvedValue(false);
    fixture.detectChanges();

    await callProtected(component, 'clearImage');
    expect(prefs.clearCustomNasaImage).not.toHaveBeenCalled();
  });

  it('skips confirmation and is a no-op when no custom image', async () => {
    prefs.hasCustomImage.set(false);
    fixture.detectChanges();

    await callProtected(component, 'clearImage');
    expect(confirm.delete).not.toHaveBeenCalled();
    expect(prefs.clearCustomNasaImage).not.toHaveBeenCalled();
  });

  it('shows error when an oversized file is selected', async () => {
    const big = new File([new Uint8Array(6 * 1024 * 1024)], 'big.png', {
      type: 'image/png',
    });
    await (component as unknown as { handleFile: (f: File) => Promise<void> }).handleFile(big);
    const err = (component as unknown as { errorMessage: () => string | null }).errorMessage();
    expect(err).toContain('excede el tamaño');
  });

  it('shows error when a non-image file is selected', async () => {
    const doc = new File([new Uint8Array(10)], 'doc.pdf', { type: 'application/pdf' });
    await (component as unknown as { handleFile: (f: File) => Promise<void> }).handleFile(doc);
    const err = (component as unknown as { errorMessage: () => string | null }).errorMessage();
    expect(err).toContain('no es una imagen');
  });

  it('uses thumbnail_url for video fallback and shows VIDEO badge', () => {
    prefs.hasCustomImage.set(false);
    prefs.setResolvedUrl(null);
    nasa.setPicture({
      url: 'https://player.vimeo.com/video/11386048',
      thumbnail_url: 'https://i.vimeocdn.com/video/thumb.jpg',
      media_type: 'video',
      title: 'Cassini',
    });
    fixture.detectChanges();
    const comp = component as unknown as {
      fallbackNasaUrl: () => string | null;
      previewUrl: () => string | null;
      isFallbackVideo: () => boolean;
      fallbackVideoUrl: () => string | null;
    };
    expect(comp.fallbackNasaUrl()).toBe('https://i.vimeocdn.com/video/thumb.jpg');
    expect(comp.previewUrl()).toBe('https://i.vimeocdn.com/video/thumb.jpg');
    expect(comp.isFallbackVideo()).toBe(true);
    expect(comp.fallbackVideoUrl()).toBe('https://player.vimeo.com/video/11386048');
    const img: HTMLImageElement | null = fixture.nativeElement.querySelector('img');
    expect(img?.src).toContain('i.vimeocdn.com');
    const badge = fixture.nativeElement.textContent as string;
    expect(badge).toContain('VIDEO');
  });

  it('returns null fallback when video has no thumbnail', () => {
    prefs.hasCustomImage.set(false);
    prefs.setResolvedUrl(null);
    nasa.setPicture({
      url: 'https://player.vimeo.com/video/999',
      media_type: 'video',
      title: 'No thumb',
    });
    fixture.detectChanges();
    const comp = component as unknown as {
      fallbackNasaUrl: () => string | null;
      previewUrl: () => string | null;
      isFallbackVideo: () => boolean;
    };
    expect(comp.fallbackNasaUrl()).toBeNull();
    expect(comp.previewUrl()).toBeNull();
    expect(comp.isFallbackVideo()).toBe(true);
    const img: HTMLImageElement | null = fixture.nativeElement.querySelector('img');
    expect(img).toBeNull();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Sin miniatura');
  });

  it('uses url for image media_type fallback', () => {
    prefs.hasCustomImage.set(false);
    prefs.setResolvedUrl(null);
    nasa.setPicture({
      url: 'https://apod.nasa.gov/apod/image/test.jpg',
      media_type: 'image',
      title: 'Test',
    });
    fixture.detectChanges();
    const comp = component as unknown as {
      fallbackNasaUrl: () => string | null;
      previewUrl: () => string | null;
      isFallbackVideo: () => boolean;
    };
    expect(comp.fallbackNasaUrl()).toBe('https://apod.nasa.gov/apod/image/test.jpg');
    expect(comp.previewUrl()).toBe('https://apod.nasa.gov/apod/image/test.jpg');
    expect(comp.isFallbackVideo()).toBe(false);
  });

  it('prefers custom image over NASA video thumbnail', () => {
    prefs.hasCustomImage.set(true);
    prefs.setResolvedUrl('blob:custom');
    nasa.setPicture({
      url: 'https://player.vimeo.com/video/11386048',
      thumbnail_url: 'https://i.vimeocdn.com/video/thumb.jpg',
      media_type: 'video',
      title: 'Video',
    });
    fixture.detectChanges();
    const comp = component as unknown as {
      previewUrl: () => string | null;
      isFallbackVideo: () => boolean;
    };
    expect(comp.previewUrl()).toBe('blob:custom');
    expect(comp.isFallbackVideo()).toBe(false);
    const img: HTMLImageElement | null = fixture.nativeElement.querySelector('img');
    expect(img?.src).toContain('blob:custom');
  });
});
