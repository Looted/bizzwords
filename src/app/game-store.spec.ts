import { TestBed } from '@angular/core/testing';
import { GameStore, Flashcard } from './game-store';
import { VocabularyStatsService } from './services/vocabulary-stats.service';
import { StorageService } from './services/storage.service';
import { PLATFORM_ID } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('GameStore', () => {
  let store: GameStore;
  let storageServiceMock: any;
  let vocabularyStatsServiceMock: any;

  beforeEach(() => {
    storageServiceMock = {
      getItem: vi.fn(),
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

    TestBed.configureTestingModule({
      providers: [
        GameStore,
        { provide: VocabularyStatsService, useValue: vocabularyStatsServiceMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    store = TestBed.inject(GameStore);
  });

  const mockCards: Flashcard[] = [
    { id: '1', english: 'Hello', polish: 'Cześć', category: 'Basic', masteryLevel: 0 },
    { id: '2', english: 'Goodbye', polish: 'Do widzenia', category: 'Basic', masteryLevel: 0 },
    { id: '3', english: 'Thank you', polish: 'Dziękuję', category: 'Basic', masteryLevel: 0 }
  ];

  describe('Initial state', () => {
    it('should start with MENU phase', () => {
      expect(store.phase()).toBe('MENU');
    });

    it('should start with RECOGNIZE_EN round', () => {
      expect(store.currentRound()).toBe('RECOGNIZE_EN');
    });

    it('should start with empty deck', () => {
      expect(store.activeDeck()).toEqual([]);
    });

    it('should start at index 0', () => {
      expect(store.currentIndex()).toBe(0);
    });

    it('should have no wrong answers initially', () => {
      expect(store.wrongAnswers()).toEqual([]);
    });

    it('should return null current card when deck is empty', () => {
      expect(store.currentCard()).toBeNull();
    });

    it('should return 0 progress when deck is empty', () => {
      expect(store.progress()).toBe(0);
    });
  });

  describe('startGame', () => {
    it('should set active deck and reset state', () => {
      store.startGame(mockCards);

      expect(store.activeDeck()).toEqual(mockCards);
      expect(store.phase()).toBe('PLAYING');
      expect(store.currentRound()).toBe('RECOGNIZE_EN');
      expect(store.currentIndex()).toBe(0);
      expect(store.wrongAnswers()).toEqual([]);
    });

    it('should set current card to first card', () => {
      store.startGame(mockCards);
      expect(store.currentCard()).toEqual(mockCards[0]);
    });
  });

  describe('progress calculation', () => {
    it('should calculate progress correctly', () => {
      store.startGame(mockCards);
      expect(store.progress()).toBeCloseTo(33.333333333333336); // 1/3

      store['currentIndex'].set(1);
      expect(store.progress()).toBeCloseTo(66.66666666666667); // 2/3

      store['currentIndex'].set(2);
      expect(store.progress()).toBe(100); // 3/3
    });
  });

  describe('handleAnswer', () => {
    beforeEach(() => {
      store.startGame(mockCards);
    });

    it('should advance to next card when correct', () => {
      store.handleAnswer(true);
      expect(store.currentIndex()).toBe(1);
      expect(store.currentCard()).toEqual(mockCards[1]);
    });

    it('should add to wrong answers when incorrect', () => {
      store.handleAnswer(false);
      expect(store.wrongAnswers()).toEqual(['1']);
    });

    it('should go to SUMMARY when completing round with all correct', () => {
      // Complete first round with all correct
      store.handleAnswer(true);
      store.handleAnswer(true);
      store.handleAnswer(true);

      expect(store.phase()).toBe('SUMMARY');
      expect(store.currentRound()).toBe('RECOGNIZE_EN'); // Round stays the same when skipping
    });

    it('should advance to second round when some answers wrong', () => {
      // Complete first round with one wrong
      store.handleAnswer(true);
      store.handleAnswer(false); // Wrong
      store.handleAnswer(true);

      expect(store.currentRound()).toBe('RECOGNIZE_PL');
      expect(store.currentIndex()).toBe(0);
      expect(store.activeDeck()).toHaveLength(1); // Only the wrong one
      expect(store.activeDeck()[0]).toEqual(mockCards[1]);
    });

    it('should advance to third round when wrong answers in both rounds', () => {
      // Complete first round with wrong answer
      store.handleAnswer(true);
      store.handleAnswer(false); // Wrong
      store.handleAnswer(true); // End round 1, go to round 2 with 1 card
      store.handleAnswer(false); // Wrong in round 2

      expect(store.currentRound()).toBe('WRITE_EN');
      expect(store.currentIndex()).toBe(0);
      expect(store.activeDeck()).toHaveLength(1); // Only the wrong one from round 2
    });

    it('should go to SUMMARY when completing all rounds', () => {
      // Complete all three rounds
      store.handleAnswer(true);
      store.handleAnswer(true);
      store.handleAnswer(true); // End round 1
      store.handleAnswer(true);
      store.handleAnswer(true);
      store.handleAnswer(true); // End round 2
      store.handleAnswer(true);
      store.handleAnswer(true);
      store.handleAnswer(true); // End round 3

      expect(store.phase()).toBe('SUMMARY');
    });
  });

  describe('skipCurrentCard', () => {
    beforeEach(() => {
      store.startGame(mockCards);
    });

    it('should mark current card as skipped in stats service', () => {
      const statsService = TestBed.inject(VocabularyStatsService);
      const markAsSkippedSpy = vi.spyOn(statsService, 'markAsSkipped');

      store.skipCurrentCard();

      expect(markAsSkippedSpy).toHaveBeenCalledWith('Hello', 'Cześć', 'Basic');
    });

    it('should remove current card from active deck', () => {
      expect(store.activeDeck()).toHaveLength(3);

      store.skipCurrentCard();

      expect(store.activeDeck()).toHaveLength(2);
      expect(store.activeDeck()).not.toContain(mockCards[0]);
    });

    it('should keep same index when skipping middle card', () => {
      store['currentIndex'].set(1); // Skip second card

      store.skipCurrentCard();

      expect(store.currentIndex()).toBe(1);
      expect(store.currentCard()).toEqual(mockCards[2]); // Now points to what was the third card
    });

    it('should continue round when skipping card not last', () => {
      store['currentIndex'].set(2); // Last card

      store.skipCurrentCard();

      expect(store.currentRound()).toBe('RECOGNIZE_EN'); // Still in same round
      expect(store.currentIndex()).toBe(2); // Index stays at 2, but deck now has 2 cards, so no current card
      expect(store.activeDeck()).toHaveLength(2); // Original 3 - 1 skipped
      expect(store.currentCard()).toBeNull(); // No card at index 2 in 2-card deck
    });

    it('should go to SUMMARY when skipping makes deck empty with no mistakes', () => {
      // Set up single card deck
      const singleCard = [mockCards[0]];
      store.startGame(singleCard);

      store.skipCurrentCard();

      expect(store.activeDeck()).toHaveLength(0);
      expect(store.phase()).toBe('SUMMARY'); // Since no wrong answers, skip rounds
      expect(store.currentRound()).toBe('RECOGNIZE_EN'); // Round stays the same
    });

    it('should not crash when no current card', () => {
      store.startGame([]);
      expect(() => store.skipCurrentCard()).not.toThrow();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      store.startGame(mockCards);
      store.handleAnswer(false);
      store['currentIndex'].set(2);

      store.reset();

      expect(store.phase()).toBe('MENU');
      expect(store.activeDeck()).toEqual([]);
      expect(store.currentIndex()).toBe(0);
      expect(store.wrongAnswers()).toEqual([]);
    });
  });
});
