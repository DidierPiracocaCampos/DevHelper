import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { NasaImageSection } from './nasa-image-section';
import { PreferencesService } from '../../services/preferences.service';
import { ConfirmService } from '../../../service/confirm.service';
import { NasaPictureResource } from '../../../../home/service/nasa-picture';

class FakePrefs {
  resolvedUrl = { value: () => null as string | null, hasValue: () => false };
  hasCustomImage = signal(false);
  setCustomNasaImage = vi.fn();
  clearCustomNasaImage = vi.fn();
}

class FakeNasa {
  getPicture = () => ({ value: () => null, isLoading: () => false });
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

  beforeEach(async () => {
    prefs = new FakePrefs();
    confirm = new FakeConfirm();
    await TestBed.configureTestingModule({
      imports: [NasaImageSection],
      providers: [
        { provide: PreferencesService, useValue: prefs },
        { provide: ConfirmService, useValue: confirm },
        { provide: NasaPictureResource, useClass: FakeNasa },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(NasaImageSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not render an img when there is no preview', () => {
    prefs.hasCustomImage.set(false);
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
});
