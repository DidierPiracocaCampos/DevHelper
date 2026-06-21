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
    });
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
