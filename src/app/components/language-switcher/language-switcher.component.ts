import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';

/**
 * Native language switcher for flashcard translations.
 * Controls which language appears as translations when learning English business terms.
 * UI remains in English. Currently supports Polish and Spanish, with more languages planned.
 *
 * Automatically disabled during active games to prevent mid-game language changes.
 */
@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  private readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);

  protected readonly currentLanguage = this.languageService.currentLanguage;

  /**
   * Detect if user is currently in an active game
   */
  protected readonly isGameActive = computed(() => {
    return this.router.url.includes('/game');
  });

  /**
   * Available native languages for flashcard translations.
   * More languages (DE, FR, etc.) will be added in future.
   */
  protected readonly languages = [
    { code: 'pl' as const, label: 'PL', name: 'Polish' },
    { code: 'es' as const, label: 'ES', name: 'Spanish' },
  ];

  protected changeLanguage(code: 'pl' | 'es'): void {
    // Extra safety: don't allow changes during game
    if (this.isGameActive()) return;
    this.languageService.setLanguage(code);
  }
}
