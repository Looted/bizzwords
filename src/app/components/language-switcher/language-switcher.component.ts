import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LanguageService } from '../../services/language.service';

/**
 * Native language switcher for flashcard translations.
 * Controls which language appears as translations when learning English business terms.
 * UI remains in English. Currently supports Polish and Spanish, with more languages planned.
 */
@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  private readonly languageService = inject(LanguageService);

  protected readonly currentLanguage = this.languageService.currentLanguage;

  /**
   * Available native languages for flashcard translations.
   * More languages (DE, FR, etc.) will be added in future.
   */
  protected readonly languages = [
    { code: 'pl' as const, label: 'PL', name: 'Polish' },
    { code: 'es' as const, label: 'ES', name: 'Spanish' },
  ];

  protected changeLanguage(code: 'pl' | 'es'): void {
    this.languageService.setLanguage(code);
  }
}
