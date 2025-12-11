import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { VocabularyStatsService } from './vocabulary-stats.service';
import { StorageService } from './storage.service';
import { TranslatedItem } from './static-vocabulary.service';
import { map, switchMap, of, catchError, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FreemiumService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly statsService = inject(VocabularyStatsService);
  private readonly storageService = inject(StorageService);

  // Free word IDs per category
  private readonly freeWordIdsByCategory = signal<Map<string, Set<string>>>(new Map());
  private readonly isLoading = signal<boolean>(true);

  // Public signals
  readonly isLoadingFreemiumData = this.isLoading.asReadonly();

  constructor() {
    // Load free word IDs on initialization
    this.loadFreeWordIds();

    // Listen to auth state changes to refresh premium status
    effect(() => {
      const user = this.authService.currentUser();
      const profileReady = this.authService.userProfileReady();
      if (user && profileReady) {
        this.loadFreeWordIds(); // Refresh free word list when user is authenticated
      }
    });
  }

  private async loadFreeWordIds(): Promise<void> {
    this.isLoading.set(true);
    try {
      const topics = ['technology', 'finance', 'sales', 'hr', 'strategy'];
      const freeIdsByCategory = new Map<string, Set<string>>();

      // Load all English base files to collect free word IDs per category
      const observables = topics.map(topic => {
        const filename = `${topic}_en.json`;
        const url = `/i18n/${filename}`;
        return this.http.get<TranslatedItem[]>(url).pipe(
          map(data => {
            const freeIds = new Set<string>();
            data.forEach(item => {
              if (item.isFree) {
                freeIds.add(item.id);
              }
            });
            freeIdsByCategory.set(topic, freeIds);
          }),
          catchError(error => {
            console.error(`[FreemiumService] Failed to load free words for ${topic}:`, error);
            return of(null);
          })
        );
      });

      // Execute all requests in parallel
      await forkJoin(observables).toPromise();
      this.freeWordIdsByCategory.set(freeIdsByCategory);
      console.log(`[FreemiumService] Loaded free word IDs by category`, freeIdsByCategory);
    } catch (error) {
      console.error('[FreemiumService] Failed to load free word IDs:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Get free word IDs for a specific category
  getFreeWordsForCategory(category: string): Set<string> {
    return this.freeWordIdsByCategory().get(category) || new Set();
  }

  // Get the number of free words already encountered for a category
  getEncounteredFreeWordCountForCategory(category: string): number {
    const freeIds = this.getFreeWordsForCategory(category);
    const allStats = this.statsService.getAllStats();
    const encountered = new Set<string>();

    allStats.forEach(stat => {
      if (stat.category === category && freeIds.has(stat.english.toLowerCase())) {
        encountered.add(stat.english.toLowerCase());
      }
    });

    return encountered.size;
  }

  // Get remaining free words for a category
  getRemainingFreeWordsForCategory(category: string): number {
    const totalFreeWords = this.getFreeWordsForCategory(category).size;
    const encountered = this.getEncounteredFreeWordCountForCategory(category);
    return Math.max(0, totalFreeWords - encountered);
  }

  // Check if a specific category is exhausted
  isCategoryExhausted(category: string): boolean {
    const isPremium = this.authService.isPremiumUser();
    return !isPremium && this.getRemainingFreeWordsForCategory(category) === 0;
  }

  // Check if a specific word is free (for a given category)
  isFreeWord(word: string, category: string): boolean {
    return this.getFreeWordsForCategory(category).has(word.toLowerCase());
  }

  // Get the total number of free words available for a category
  getTotalFreeWordsForCategory(category: string): number {
    return this.getFreeWordsForCategory(category).size;
  }
}
