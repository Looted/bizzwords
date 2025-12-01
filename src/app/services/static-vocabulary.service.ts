import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, throwError } from 'rxjs';

export interface VocabularyItem {
  english: string;
  polish: string;
  difficulty: number;
}

@Injectable({
  providedIn: 'root'
})
export class StaticVocabularyService {
  constructor(private http: HttpClient) {}

  loadVocabulary(topic: string): Observable<VocabularyItem[]> {
    const topicMap: Record<string, string> = {
      'hr': 'hr_eng_pl/vocabulary.json',
      'pm': 'pm_eng_pl/vocabulary.json' // For future PM vocabulary
    };

    const url = topicMap[topic.toLowerCase()] || 'hr_eng_pl/vocabulary.json';
    console.log('[StaticVocabulary] Loading from URL:', url);

    return this.http.get<VocabularyItem[]>(url).pipe(
      tap(data => console.log('[StaticVocabulary] Successfully loaded', data.length, 'items')),
      catchError(error => {
        console.error('[StaticVocabulary] Failed to load from:', url);
        console.error('[StaticVocabulary] Error:', error);
        return throwError(() => error);
      })
    );
  }

  generateWords(theme: string, count: number, difficulty?: number): Observable<{english: string, translations: Record<string, string>}[]> {
    console.log('[StaticVocabulary] generateWords called:', { theme, count, difficulty });

    return this.loadVocabulary(theme).pipe(
      map(vocab => {
        console.log('[StaticVocabulary] Processing vocab:', vocab.length, 'items');

        // Filter by theme if needed, but since it's HR, just return random
        let filtered = vocab;

        // Filter by difficulty if specified
        if (difficulty !== undefined) {
          filtered = vocab.filter(item => item.difficulty === difficulty);
          console.log('[StaticVocabulary] Filtered by difficulty', difficulty, ':', filtered.length, 'items');
        }

        // If no words match the difficulty, fall back to all words
        if (filtered.length === 0) {
          console.warn('[StaticVocabulary] No words match difficulty, using all words');
          filtered = vocab;
        }

        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);

        console.log('[StaticVocabulary] Returning', selected.length, 'cards');

        return selected.map(item => ({
          english: item.english,
          translations: { polish: item.polish }
        }));
      })
    );
  }
}
