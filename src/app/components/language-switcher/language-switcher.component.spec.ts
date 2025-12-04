import { TestBed } from '@angular/core/testing';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { LanguageService } from '../../services/language.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';

describe('LanguageSwitcherComponent', () => {
  let component: LanguageSwitcherComponent;
  let languageServiceMock: any;
  let fixture: any;

  const setup = () => {
    languageServiceMock = {
      currentLanguage: signal('pl'),
      setLanguage: vi.fn(),
      getLanguageDisplayName: vi.fn().mockImplementation((lang: string) => {
        switch (lang) {
          case 'pl': return 'Polish';
          case 'es': return 'Spanish';
          default: return 'Polish';
        }
      })
    };

    TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponent],
      providers: [
        { provide: LanguageService, useValue: languageServiceMock }
      ]
    });

    fixture = TestBed.createComponent(LanguageSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    return { fixture, component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should display "Native language:" label with globe icon', () => {
    const { fixture } = setup();
    const label = fixture.nativeElement.querySelector('span.text-gray-600');

    expect(label?.textContent).toContain('Native language:');
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy(); // globe icon
  });

  it('should render language buttons', () => {
    const { fixture } = setup();
    const buttons = fixture.nativeElement.querySelectorAll('button');

    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent.trim()).toBe('PL');
    expect(buttons[1].textContent.trim()).toBe('ES');
  });

  it('should apply active styles to current native language button', () => {
    const { fixture } = setup();
    languageServiceMock.currentLanguage.set('es');
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const esButton = Array.from(buttons).find(btn => btn.textContent?.trim() === 'ES');

    expect(esButton?.classList.contains('text-indigo-600')).toBe(true);
    expect(esButton?.classList.contains('underline')).toBe(true);
  });

  it('should call setLanguage when button is clicked', () => {
    const { fixture } = setup();
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const esButton = Array.from(buttons).find(btn => btn.textContent?.trim() === 'ES');

    esButton?.click();

    expect(languageServiceMock.setLanguage).toHaveBeenCalledWith('es');
  });

  it('should have proper accessibility attributes', () => {
    const { fixture } = setup();
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const plButton = Array.from(buttons).find(btn => btn.textContent?.trim() === 'PL');

    expect(plButton?.getAttribute('aria-current')).toBe('true');
    expect(plButton?.getAttribute('aria-label')).toBe('Set native language to Polish');
  });
});
