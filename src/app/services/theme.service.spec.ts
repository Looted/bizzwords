import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { PLATFORM_ID } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockMatchMedia: any;

  beforeEach(() => {
    // Mock matchMedia
    mockMatchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    });

    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: mockLocalStorage
    });

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default system mode', () => {
    expect(service.themeMode()).toBe('system');
  });

  it('should set theme mode', () => {
    service.setThemeMode('dark');
    expect(service.themeMode()).toBe('dark');
  });

  it('should cycle themes correctly', () => {
    service.setThemeMode('light');

    service.cycleTheme();
    expect(service.themeMode()).toBe('dark');

    service.cycleTheme();
    expect(service.themeMode()).toBe('system');

    service.cycleTheme();
    expect(service.themeMode()).toBe('light');
  });
});
