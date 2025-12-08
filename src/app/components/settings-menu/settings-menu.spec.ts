import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { SettingsMenu } from './settings-menu';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';

describe('SettingsMenu', () => {
  let component: SettingsMenu;
  let fixture: ComponentFixture<SettingsMenu>;
  let themeServiceMock: any;
  let languageServiceMock: any;
  let authServiceMock: any;

  beforeEach(async () => {
    themeServiceMock = {
      themeMode: signal('system'),
      cycleTheme: vi.fn()
    };

    languageServiceMock = {
      getSupportedLanguages: vi.fn().mockReturnValue(['pl', 'es']),
      currentLanguage: signal('pl'),
      setLanguage: vi.fn(),
      getLanguageDisplayName: vi.fn().mockImplementation((lang: string) => lang === 'pl' ? 'Polski' : 'Español')
    };

    authServiceMock = {
      authStatus: signal('guest'),
      currentUser: signal(null),
      isAuthenticated: signal(false),
      isMigrating: signal(false),
      signInWithGoogle: vi.fn(),
      signOut: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [SettingsMenu],
      providers: [
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: LanguageService, useValue: languageServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsMenu);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute supportedLanguages', () => {
    expect(component.supportedLanguages()).toEqual(['pl', 'es']);
  });

  it('should compute currentLanguage', () => {
    expect(component.currentLanguage()).toBe('pl');
  });

  it('should compute currentThemeMode', () => {
    expect(component.currentThemeMode()).toBe('system');
  });

  it('should call themeService.cycleTheme on onThemeCycle', () => {
    component.onThemeCycle();
    expect(themeServiceMock.cycleTheme).toHaveBeenCalled();
  });

  it('should return correct theme icon', () => {
    expect(component.getThemeIcon()).toBe('💻');
  });

  it('should call languageService.setLanguage on onLanguageChange', () => {
    component.onLanguageChange('es');
    expect(languageServiceMock.setLanguage).toHaveBeenCalledWith('es');
  });

  it('should get language display name', () => {
    expect(component.getLanguageDisplayName('pl')).toBe('Polski');
    expect(component.getLanguageDisplayName('es')).toBe('Español');
  });

  it('should emit closeMenu on escape key when open', () => {
    const closeMenuSpy = vi.fn();
    fixture.componentRef.setInput('isOpen', true);
    component.closeMenu.subscribe(closeMenuSpy);

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    component.onEscapeKey(event);

    expect(closeMenuSpy).toHaveBeenCalled();
  });

  it('should not emit closeMenu on escape key when closed', () => {
    const closeMenuSpy = vi.fn();
    fixture.componentRef.setInput('isOpen', false);
    component.closeMenu.subscribe(closeMenuSpy);

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    component.onEscapeKey(event);

    expect(closeMenuSpy).not.toHaveBeenCalled();
  });

  it('should log placeholder actions', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    component.onUserProfileClick();
    expect(console.log).toHaveBeenCalledWith('User profile clicked');

    component.onAboutClick();
    expect(console.log).toHaveBeenCalledWith('About clicked');

    component.onPrivacyClick();
    expect(console.log).toHaveBeenCalledWith('Privacy clicked');

    await component.onSignOutClick();
    expect(console.log).toHaveBeenCalledWith('Sign out clicked');

    consoleSpy.mockRestore();
  });
});
