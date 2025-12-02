import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  themeMode = signal<ThemeMode>('system');
  systemPrefersDark = signal<boolean>(false);

  // Computed state for UI consumption
  currentMode = signal<'light' | 'dark'>('light');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Load saved theme
      const savedTheme = localStorage.getItem('theme-mode') as ThemeMode;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        this.themeMode.set(savedTheme);
      }

      // Get initial system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemPrefersDark.set(mediaQuery.matches);

      // Listen for system changes
      mediaQuery.addEventListener('change', (e) => {
        this.systemPrefersDark.set(e.matches);
      });

      // React to changes
      effect(() => {
        const mode = this.themeMode();
        const systemDark = this.systemPrefersDark();

        const shouldBeDark = mode === 'dark' || (mode === 'system' && systemDark);

        this.currentMode.set(shouldBeDark ? 'dark' : 'light');

        if (shouldBeDark) {
          this.document.documentElement.classList.add('dark');
        } else {
          this.document.documentElement.classList.remove('dark');
        }

        localStorage.setItem('theme-mode', mode);
      });
    }
  }

  setThemeMode(mode: ThemeMode) {
    this.themeMode.set(mode);
  }

  cycleTheme() {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const nextIndex = (modes.indexOf(this.themeMode()) + 1) % modes.length;
    this.setThemeMode(modes[nextIndex]);
  }
}
