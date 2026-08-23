import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { NasaPicture } from './nasa-picture';
import { PreferencesService } from '../../../shared/preferences';

class FakePrefs {
  resolvedUrl = { value: () => null as string | null };
}

describe('NasaPicture', () => {
  let component: NasaPicture;
  let fixture: ComponentFixture<NasaPicture>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NasaPicture],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PreferencesService, useClass: FakePrefs },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(NasaPicture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    const req = httpMock.expectOne((r) => r.url.startsWith('https://api.nasa.gov/planetary/apod'));
    req.flush({
      url: 'https://apod.nasa.gov/apod/image/test.jpg',
      title: 'Test',
      media_type: 'image',
      date: '2026-08-23',
      explanation: 'test',
      service_version: 'v1',
    });
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('NasaPicture video handling', () => {
  class FakePrefsNull {
    resolvedUrl = { value: () => null as string | null };
  }
  class FakePrefsCustom {
    resolvedUrl = { value: () => 'blob:custom-url' as string | null };
  }

  async function setup(prefsClass: new () => unknown) {
    await TestBed.configureTestingModule({
      imports: [NasaPicture],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PreferencesService, useClass: prefsClass },
      ],
    }).compileComponents();
    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(NasaPicture);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component, httpMock };
  }

  it('should use thumbnail_url when media_type is video', async () => {
    const { fixture, component, httpMock } = await setup(FakePrefsNull);
    const req = httpMock.expectOne((r) => r.url.startsWith('https://api.nasa.gov/planetary/apod'));
    req.flush({
      url: 'https://player.vimeo.com/video/11386048',
      thumbnail_url: 'https://i.vimeocdn.com/video/62374077-thumb.jpg',
      media_type: 'video',
      title: 'Cassini Approaches Saturn',
      date: '2026-08-23',
      explanation: 'test video',
      service_version: 'v1',
    });
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    httpMock.verify();
    expect(component.displayUrl()).toBe('https://i.vimeocdn.com/video/62374077-thumb.jpg');
    expect(component.isVideo()).toBe(true);
    expect(component.videoUrl()).toBe('https://player.vimeo.com/video/11386048');
    // imageUrl alias should equal displayUrl
    expect(component.imageUrl()).toBe(component.displayUrl());
  });

  it('should return null and be video when thumbnail missing', async () => {
    const { fixture, component, httpMock } = await setup(FakePrefsNull);
    const req = httpMock.expectOne((r) => r.url.startsWith('https://api.nasa.gov/planetary/apod'));
    req.flush({
      url: 'https://player.vimeo.com/video/999',
      media_type: 'video',
      title: 'No thumb',
      date: '2026-08-23',
      explanation: 'no thumb',
      service_version: 'v1',
    });
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    httpMock.verify();
    expect(component.displayUrl()).toBeNull();
    expect(component.isVideo()).toBe(true);
  });

  it('should use url for image media_type', async () => {
    const { fixture, component, httpMock } = await setup(FakePrefsNull);
    const req = httpMock.expectOne((r) => r.url.startsWith('https://api.nasa.gov/planetary/apod'));
    req.flush({
      url: 'https://apod.nasa.gov/apod/image/test2.jpg',
      media_type: 'image',
      title: 'Image',
      date: '2026-08-23',
      explanation: 'img',
      service_version: 'v1',
    });
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    httpMock.verify();
    expect(component.displayUrl()).toBe('https://apod.nasa.gov/apod/image/test2.jpg');
    expect(component.isVideo()).toBe(false);
  });

  it('should prioritize customUrl over NASA video thumbnail', async () => {
    const { fixture, component, httpMock } = await setup(FakePrefsCustom);
    const req = httpMock.expectOne((r) => r.url.startsWith('https://api.nasa.gov/planetary/apod'));
    req.flush({
      url: 'https://player.vimeo.com/video/11386048',
      thumbnail_url: 'https://i.vimeocdn.com/video/thumb.jpg',
      media_type: 'video',
      title: 'Video',
      date: '2026-08-23',
      explanation: 'video',
      service_version: 'v1',
    });
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    httpMock.verify();
    expect(component.displayUrl()).toBe('blob:custom-url');
    expect(component.isVideo()).toBe(false);
  });

  it('should render anchor with play icon for video and img for image (DOM)', async () => {
    const { fixture, httpMock } = await setup(FakePrefsNull);
    const req = httpMock.expectOne((r) => r.url.startsWith('https://api.nasa.gov/planetary/apod'));
    req.flush({
      url: 'https://player.vimeo.com/video/11386048',
      thumbnail_url: 'https://i.vimeocdn.com/video/thumb.jpg',
      media_type: 'video',
      title: 'Cassini',
      date: '2026-08-23',
      explanation: 'video',
      service_version: 'v1',
    });
    httpMock.verify();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const anchor: HTMLAnchorElement | null =
      fixture.nativeElement.querySelector('a[href*="player.vimeo"]');
    expect(anchor).not.toBeNull();
    expect(anchor?.target).toBe('_blank');
    const playIcon = fixture.nativeElement.querySelector('.material-symbols-outlined');
    expect(playIcon?.textContent).toContain('play_circle');
  });
});
