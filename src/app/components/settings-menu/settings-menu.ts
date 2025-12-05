import { Component, input, output, inject, HostListener, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { LanguageService, SupportedLanguage } from '../../services/language.service';

@Component({
  selector: 'app-settings-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-menu.html',
  styleUrl: './settings-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsMenu {
  themeService = inject(ThemeService);
  languageService = inject(LanguageService);

  // Input signal for menu open state
  isOpen = input.required<boolean>();

  // Output event for closing menu
  closeMenu = output<void>();

  // Computed signals for display
  supportedLanguages = computed(() => this.languageService.getSupportedLanguages());
  currentLanguage = computed(() => this.languageService.currentLanguage());
  currentThemeMode = computed(() => this.themeService.themeMode());
  currentLanguageName = computed(() => {
    const current = this.languageService.currentLanguage();
    return this.languageService.getLanguageDisplayName(current);
  });

  // Host listener for escape key
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    if (this.isOpen()) {
      (event as KeyboardEvent).preventDefault();
      this.closeMenu.emit();
    }
  }

  // Methods
  onThemeCycle() {
    this.themeService.cycleTheme();
  }

  getThemeIcon(): string {
    const mode = this.currentThemeMode();
    switch (mode) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'system': return '💻';
      default: return '💻';
    }
  }

  onLanguageChange(language: SupportedLanguage) {
    this.languageService.setLanguage(language);
  }

  getLanguageDisplayName(language: SupportedLanguage): string {
    return this.languageService.getLanguageDisplayName(language);
  }

  onLanguageClick() {
    // Close menu - mobile users can use the language switcher in header
    this.closeMenu.emit();
  }

  // Placeholder methods
  onUserProfileClick() {
    // TODO: Implement user profile
    console.log('User profile clicked');
  }

  onAboutClick() {
    // TODO: Navigate to about page
    console.log('About clicked');
  }

  onPrivacyClick() {
    // TODO: Navigate to privacy page
    console.log('Privacy clicked');
  }

  onSignOutClick() {
    // TODO: Implement sign out
    console.log('Sign out clicked');
  }
}
