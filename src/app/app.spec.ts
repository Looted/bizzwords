import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { App } from './app';
import { GameStore } from './game-store';
import { PwaService } from './services/pwa.service';
import { ThemeService } from './services/theme.service';
import { PLATFORM_ID } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { vi } from 'vitest';

describe('App', () => {
  let app: App;
  let pwaServiceMock: any;

  beforeEach(async () => {
    pwaServiceMock = {
      init: vi.fn()
    };

    const mockAuth = {
      // Minimal Firebase Auth mock to avoid onAuthStateChanged errors
      app: {},
      config: {},
      name: 'mock-auth',
      onAuthStateChanged: vi.fn().mockImplementation(() => {
        // Return a function to unsubscribe
        return () => {};
      })
    };

    const mockFirestore = {
      // Minimal Firestore mock
      app: {},
      config: {},
      name: 'mock-firestore'
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, App],
      providers: [
        { provide: PwaService, useValue: pwaServiceMock },
        { provide: ThemeService, useValue: {} },
        { provide: Auth, useValue: mockAuth },
        { provide: Firestore, useValue: mockFirestore },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    app = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should initialize PWA service on init', () => {
    app.ngOnInit();

    expect(pwaServiceMock.init).toHaveBeenCalled();
  });

  it('should inject GameStore', () => {
    expect(app.store).toBeDefined();
    expect(app.store).toBeInstanceOf(GameStore);
  });

  it('should inject PwaService', () => {
    expect(app.pwaService).toBeDefined();
  });

  it('should inject ThemeService', () => {
    expect(app.themeService).toBeDefined();
  });
});
