import { TestBed } from '@angular/core/testing';
import { GameStore, Flashcard } from './app';
import { describe, it, expect, beforeEach } from 'vitest';

describe('GameStore', () => {
  let store: GameStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
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

    it('should advance round when reaching end of deck', () => {
      // Complete first round
      store.handleAnswer(true);
      store.handleAnswer(true);
      store.handleAnswer(true);

      expect(store.currentRound()).toBe('RECOGNIZE_PL');
      expect(store.currentIndex()).toBe(0);
    });

    it('should advance to second round correctly', () => {
      // Complete first round
      store.handleAnswer(true);
      store.handleAnswer(true);
      store.handleAnswer(true);

      expect(store.currentRound()).toBe('RECOGNIZE_PL');
      expect(store.currentCard()).toEqual(mockCards[0]);
    });

    it('should advance to third round correctly', () => {
      // Complete first two rounds
      store.handleAnswer(true);
      store.handleAnswer(true);
      store.handleAnswer(true); // End round 1
      store.handleAnswer(true);
      store.handleAnswer(true);
      store.handleAnswer(true); // End round 2

      expect(store.currentRound()).toBe('WRITE_EN');
      expect(store.currentIndex()).toBe(0);
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
