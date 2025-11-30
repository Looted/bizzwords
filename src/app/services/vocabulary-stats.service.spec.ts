import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';

import { VocabularyStatsService } from './vocabulary-stats.service';

describe('VocabularyStatsService', () => {
  let service: VocabularyStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VocabularyStatsService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(VocabularyStatsService);
    // Clear any existing stats from localStorage
    service.clearAllStats();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('recordEncounter', () => {
    it('should record a new word encounter', () => {
      service.recordEncounter('hello', 'cześć', 'basic', true);

      const stats = service.getStats('hello', 'cześć');
      expect(stats).toBeTruthy();
      expect(stats!.english).toBe('hello');
      expect(stats!.polish).toBe('cześć');
      expect(stats!.category).toBe('basic');
      expect(stats!.timesEncountered).toBe(1);
      expect(stats!.timesCorrect).toBe(1);
      expect(stats!.timesIncorrect).toBe(0);
      expect(stats!.masteryLevel).toBe(1);
    });

    it('should record incorrect answer', () => {
      service.recordEncounter('world', 'świat', 'basic', false);

      const stats = service.getStats('world', 'świat');
      expect(stats!.timesEncountered).toBe(1);
      expect(stats!.timesCorrect).toBe(0);
      expect(stats!.timesIncorrect).toBe(1);
      expect(stats!.masteryLevel).toBe(0);
    });

    it('should update existing word stats', () => {
      service.recordEncounter('test', 'test', 'basic', true);
      service.recordEncounter('test', 'test', 'basic', false);
      service.recordEncounter('test', 'test', 'basic', true);

      const stats = service.getStats('test', 'test');
      expect(stats!.timesEncountered).toBe(3);
      expect(stats!.timesCorrect).toBe(1);
      expect(stats!.timesIncorrect).toBe(1);
    });
  });

  describe('getWordsNeedingPractice', () => {
    it('should return words with low mastery levels', () => {
      // Add a mastered word (many correct answers)
      for (let i = 0; i < 10; i++) {
        service.recordEncounter('mastered', 'opanowany', 'basic', true);
      }

      // Add a word that needs practice (few encounters, incorrect)
      service.recordEncounter('hard', 'trudny', 'basic', false);
      service.recordEncounter('hard', 'trudny', 'basic', false);

      const needsPractice = service.getWordsNeedingPractice(10);
      expect(needsPractice.length).toBe(1);
      expect(needsPractice[0].english).toBe('hard');
    });

    it('should limit results to specified number', () => {
      for (let i = 0; i < 5; i++) {
        service.recordEncounter(`word${i}`, `słowo${i}`, 'basic', false);
      }

      const needsPractice = service.getWordsNeedingPractice(3);
      expect(needsPractice.length).toBe(3);
    });
  });

  describe('getMasteryStats', () => {
    it('should return empty stats when no words', () => {
      const stats = service.getMasteryStats();
      expect(stats.totalWords).toBe(0);
      expect(stats.mastered).toBe(0);
      expect(stats.learning).toBe(0);
      expect(stats.needsPractice).toBe(0);
      expect(stats.averageMastery).toBe(0);
    });

    it('should calculate mastery statistics correctly', () => {
      // Add mastered word (high correct rate, many encounters)
      for (let i = 0; i < 10; i++) {
        service.recordEncounter('mastered', 'opanowany', 'basic', true);
      }

      // Add learning word (some correct answers)
      for (let i = 0; i < 4; i++) {
        service.recordEncounter('learning', 'uczący się', 'basic', true);
      }

      // Add word needing practice
      service.recordEncounter('practice', 'ćwiczenie', 'basic', false);
      service.recordEncounter('practice', 'ćwiczenie', 'basic', false);

      const stats = service.getMasteryStats();
      expect(stats.totalWords).toBe(3);
      expect(stats.mastered).toBeGreaterThan(0);
      expect(stats.learning).toBeGreaterThan(0);
      expect(stats.needsPractice).toBeGreaterThan(0);
      expect(stats.averageMastery).toBeGreaterThan(0);
    });
  });



  describe('clearAllStats', () => {
    it('should clear all stats', () => {
      service.recordEncounter('clear', 'wyczyść', 'basic', true);
      expect(service.getAllStats().length).toBe(1);

      service.clearAllStats();
      expect(service.getAllStats().length).toBe(0);
    });
  });

  describe('getStatsByCategory', () => {
    it('should return stats for specific category', () => {
      service.recordEncounter('cat', 'kot', 'animals', true);
      service.recordEncounter('dog', 'pies', 'animals', true);
      service.recordEncounter('hello', 'cześć', 'basic', true);

      const animalStats = service.getStatsByCategory('animals');
      expect(animalStats.length).toBe(2);
      expect(animalStats.map(s => s.english)).toEqual(['cat', 'dog']);

      const basicStats = service.getStatsByCategory('basic');
      expect(basicStats.length).toBe(1);
      expect(basicStats[0].english).toBe('hello');
    });
  });

  describe('markAsSkipped', () => {
    it('should mark existing word as skipped', () => {
      service.recordEncounter('skip', 'pomiń', 'basic', true);
      service.markAsSkipped('skip', 'pomiń', 'basic');

      const stats = service.getStats('skip', 'pomiń');
      expect(stats!.skipped).toBe(true);
      expect(service.getAllStats().length).toBe(0); // skipped words not included
    });

    it('should mark new word as skipped', () => {
      service.markAsSkipped('newskip', 'nowy pomin', 'basic');

      const stats = service.getStats('newskip', 'nowy pomin');
      expect(stats!.skipped).toBe(true);
      expect(stats!.timesEncountered).toBe(0);
    });
  });

  describe('getWordsNeedingPractice - sorting logic', () => {
    it('should sort by mastery level first', () => {
      // Low mastery word (mastery level 0)
      service.recordEncounter('low', 'niski', 'basic', false);
      service.recordEncounter('low', 'niski', 'basic', false);

      // Medium mastery word (mastery level 1 - still needs practice)
      service.recordEncounter('medium', 'średni', 'basic', true);
      service.recordEncounter('medium', 'średni', 'basic', false); // More incorrect than correct

      const needsPractice = service.getWordsNeedingPractice(10);
      expect(needsPractice.length).toBeGreaterThan(1);
      // The low mastery word should appear before the medium mastery word
      const lowIndex = needsPractice.findIndex(w => w.english === 'low');
      const mediumIndex = needsPractice.findIndex(w => w.english === 'medium');
      expect(lowIndex).toBeLessThan(mediumIndex);
      expect(lowIndex).toBeGreaterThanOrEqual(0);
      expect(mediumIndex).toBeGreaterThanOrEqual(0);
    });

    it('should sort by error rate when mastery levels are equal', () => {
      // Both have mastery level 0, but different error rates
      service.recordEncounter('higherror', 'dużo błędów', 'basic', false);
      service.recordEncounter('higherror', 'dużo błędów', 'basic', false);
      service.recordEncounter('higherror', 'dużo błędów', 'basic', false);

      service.recordEncounter('lowerror', 'mało błędów', 'basic', false);
      service.recordEncounter('lowerror', 'mało błędów', 'basic', true);

      const needsPractice = service.getWordsNeedingPractice(10);
      expect(needsPractice.length).toBeGreaterThan(0);
      // Higher error rate word should appear first
      expect(needsPractice[0].english).toBe('higherror');
    });
  });

  describe('getMasteryStats - average calculation', () => {
    it('should calculate average mastery correctly', () => {
      // Add words with different mastery levels
      service.recordEncounter('level1', 'poziom1', 'basic', true);
      service.recordEncounter('level2', 'poziom2', 'basic', true);
      service.recordEncounter('level2', 'poziom2', 'basic', true);
      service.recordEncounter('level3', 'poziom3', 'basic', true);
      service.recordEncounter('level3', 'poziom3', 'basic', true);
      service.recordEncounter('level3', 'poziom3', 'basic', true);

      const stats = service.getMasteryStats();
      // Actual mastery levels: level1=1, level2=1, level3=2
      // Expected average: (1 + 1 + 2) / 3 = 1.33
      expect(stats.averageMastery).toBe(1.33);
    });

    it('should round average mastery to 2 decimal places', () => {
      service.recordEncounter('word1', 'słowo1', 'basic', true);
      service.recordEncounter('word2', 'słowo2', 'basic', true);
      service.recordEncounter('word2', 'słowo2', 'basic', true);

      const stats = service.getMasteryStats();
      // Mastery levels: word1=1, word2=1
      // Average should be 1.0
      expect(stats.averageMastery).toBe(1);
    });
  });

  describe('server platform behavior', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          VocabularyStatsService,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      service = TestBed.inject(VocabularyStatsService);
    });

    it('should not save stats on server platform', () => {
      service.recordEncounter('server', 'serwer', 'basic', true);
      // Should not throw error, just skip saving
      expect(() => service.recordEncounter('server', 'serwer', 'basic', true)).not.toThrow();
    });

    it('should not clear localStorage on server platform', () => {
      expect(() => service.clearAllStats()).not.toThrow();
    });
  });

  describe('localStorage operations', () => {
    it('should handle localStorage save errors gracefully', () => {
      // Mock localStorage.setItem to throw error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      service.recordEncounter('error', 'błąd', 'basic', true);

      // Should not throw error, just log warning
      expect(() => service.recordEncounter('error', 'błąd', 'basic', true)).not.toThrow();

      // Restore original
      Storage.prototype.setItem = originalSetItem;
    });

    it('should handle localStorage load errors gracefully', () => {
      // Create service with corrupted data in localStorage
      localStorage.setItem('vocabulary-stats', 'invalid json');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          VocabularyStatsService,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      // Should create service without throwing error
      expect(() => {
        service = TestBed.inject(VocabularyStatsService);
      }).not.toThrow();
    });
  });
});
