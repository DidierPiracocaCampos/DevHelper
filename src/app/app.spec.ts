import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { App } from './app';
import { Authenticator } from './shared/service/authenticator';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: Authenticator,
          useValue: {
            user: signal(null),
            isLoggedIn: signal(false),
            logout: () => Promise.resolve(),
          },
        },
      ],
    })
      .overrideComponent(App, { set: { template: '<router-outlet />' } })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
