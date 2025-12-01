import { TestBed } from '@angular/core/testing';
import { FlashcardComponent } from './flashcard.component';
import { GameStore, Flashcard } from './game-store';
import { StorageService } from './services/storage.service';
import { VocabularyStatsService } from './services/vocabulary-stats.service';
import { PLATFORM_ID } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FlashcardComponent', () => {
  let component: FlashcardComponent;
  let store: GameStore;
  let storageServiceMock: any;
  let vocabularyStatsServiceMock: any;

  const mockCards: Flashcard[] = [
    { id: '1', english: 'Hello', polish: 'Cześć', category: 'Basic', masteryLevel: 0 },
    { id: '2', english: 'Goodbye', polish: 'Do widzenia', category: 'Basic', masteryLevel: 0 }
  ];

  beforeEach(async () => {
    storageServiceMock = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };

    vocabularyStatsServiceMock = {
      markAsSkipped: vi.fn(),
      recordEncounter: vi.fn(),
      getStats: vi.fn(),
      getAllStats: vi.fn(),
      getStatsByCategory: vi.fn(),
      getWordsNeedingPractice: vi.fn(),
      getMasteryStats: vi.fn(),
      clearAllStats: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [FlashcardComponent],
      providers: [
        GameStore,
        { provide: VocabularyStatsService, useValue: vocabularyStatsServiceMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(FlashcardComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(GameStore);
  });

  describe('Round 1: RECOGNIZE_EN', () => {
    beforeEach(() => {
      store.startGame(mockCards);
    });

    it('should display English on front and Polish on back', () => {
      expect(component.frontLabel()).toBe('English');
      expect(component.frontText()).toBe('Hello');
      expect(component.backLabel()).toBe('Polish');
      expect(component.backText()).toBe('Cześć');
    });

    it('should start with card not flipped', () => {
      expect(component.isFlipped()).toBe(false);
    });

    it('should flip card when clicked', () => {
      component.flip();
      expect(component.isFlipped()).toBe(true);

      component.flip();
      expect(component.isFlipped()).toBe(false);
    });

    it('should reset flip when resetFlip is called', () => {
      component.flip();
      expect(component.isFlipped()).toBe(true);

      component.resetFlip();
      expect(component.isFlipped()).toBe(false);
    });
  });

  describe('Round 2: RECOGNIZE_PL', () => {
    beforeEach(() => {
      store.startGame(mockCards);
      // Advance to round 2 with some wrong answers
      store.handleAnswer(false); // Wrong
      store.handleAnswer(true);
    });

    it('should display Polish on front and English on back', () => {
      expect(component.frontLabel()).toBe('Polish');
      expect(component.frontText()).toBe('Cześć'); // The wrong card (Hello/Cześć)
      expect(component.backLabel()).toBe('English');
      expect(component.backText()).toBe('Hello');
    });
  });

  describe('Round 3: WRITE_EN', () => {
    beforeEach(() => {
      store.startGame(mockCards);
      // Advance to round 3 with wrong answers in both rounds
      store.handleAnswer(false); // Wrong in round 1
      store.handleAnswer(true);
      // Now in round 2 with 1 card (the wrong one)
      store.handleAnswer(false); // Wrong in round 2
    });

    it('should not flip when in WRITE_EN round', () => {
      component.flip();
      expect(component.isFlipped()).toBe(false);
    });
  });

  describe('Empty state', () => {
    it('should handle empty deck gracefully', () => {
      expect(component.frontLabel()).toBe('English');
      expect(component.frontText()).toBe('');
      expect(component.backLabel()).toBe('Polish');
      expect(component.backText()).toBe('');
    });
  });
});
