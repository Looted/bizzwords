import { ChangeDetectionStrategy, Component, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LanguageService } from '../../services/language.service';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

@Component({
  selector: 'app-language-switcher',
  imports: [CommonModule],
  templateUrl: './language-switcher.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  private languageService = inject(LanguageService);

  isDropdownOpen = signal(false);

  // Language options - add more as needed
  availableLanguages = signal<Language[]>([
    { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'pl', name: 'Polski', nativeName: 'Polski', flag: '🇵🇱' },
  ]);

  // Computed to get current language object
  currentLanguage = computed(() => {
    const currentCode = this.languageService.currentLanguage();
    return this.availableLanguages().find(lang => lang.code === currentCode) || this.availableLanguages()[0];
  });

  toggleDropdown() {
    this.isDropdownOpen.update(open => !open);
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }

  selectLanguage(code: string) {
    this.languageService.setLanguage(code as any);
    this.closeDropdown();
  }

  getCurrentFlag(): string {
    return this.currentLanguage().flag;
  }
}
