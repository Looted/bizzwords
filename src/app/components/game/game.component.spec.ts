import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameComponent } from './game.component';
import { GameStore } from '../../game-store';
import { GameService } from '../../services/game.service';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { signal, WritableSignal } from '@angular/core';
import { vi, Mock } from 'vitest';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;

  // Define mock types
  type MockGameStore = {
    phase: WritableSignal<string>;
    currentRound: WritableSignal<string>;
    progress: WritableSignal<number>;
    currentCard: WritableSignal<any>;
    activeDeck: WritableSignal<any[]>;
    reset: Mock;
  };

  type MockGameService = {
    handleAnswer: Mock;
    skipCard: Mock;
  };

  type MockRouter = {
    navigate: Mock;
  };

  let gameStoreMock: MockGameStore;
  let gameServiceMock: MockGameService;
  let routerMock: MockRouter;
  let storageServiceMock: any;

  beforeEach(async () => {
    gameStoreMock = {
      phase: signal('PLAYING'),
      currentRound: signal('RECOGNIZE_EN'),
      progress: signal(0),
      currentCard: signal({ english: 'cat', polish: 'kot' }),
      activeDeck: signal([{ id: '1', english: 'test', polish: 'test' }]),
      reset: vi.fn()
    };
    gameServiceMock = {
      handleAnswer: vi.fn(),
      skipCard: vi.fn()
    };
    routerMock = {
      navigate: vi.fn()
    };
    storageServiceMock = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        { provide: GameStore, useValue: gameStoreMock },
        { provide: GameService, useValue: gameServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor effects', () => {
    it('should navigate to menu when phase is MENU and no active deck', () => {
      gameStoreMock.phase.set('MENU');
      gameStoreMock.activeDeck.set([]);
      fixture.detectChanges();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to summary when phase is SUMMARY', () => {
      gameStoreMock.phase.set('SUMMARY');
      fixture.detectChanges();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/summary']);
    });

    it('should disable input control when paused', () => {
      component.isPaused.set(true);
      fixture.detectChanges();
      expect(component.inputControl.disabled).toBe(true);
    });

    it('should enable input control when not paused', () => {
      component.isPaused.set(false);
      fixture.detectChanges();
      expect(component.inputControl.disabled).toBe(false);
    });
  });

  describe('handleAnswer', () => {
    it('should reset card flip and handle answer after delay', async () => {
      const mockCardComp = { resetFlip: vi.fn() };

      vi.useFakeTimers();
      component.handleAnswer(true, mockCardComp as any);

      expect(mockCardComp.resetFlip).toHaveBeenCalled();

      vi.advanceTimersByTime(500); // GAME_CONSTANTS.FLIP_DELAY
      expect(gameServiceMock.handleAnswer).toHaveBeenCalledWith(true);

      vi.useRealTimers();
    });
  });

  describe('skipCard', () => {
    it('should reset card flip and delegate to game service', () => {
      const mockCardComp = { resetFlip: vi.fn() };
      component.skipCard(mockCardComp as any);
      expect(mockCardComp.resetFlip).toHaveBeenCalled();
      expect(gameServiceMock.skipCard).toHaveBeenCalled();
    });
  });

  describe('backToMenu', () => {
    it('should reset store and navigate to menu', () => {
      component.backToMenu();
      expect(gameStoreMock.reset).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('checkTyping', () => {
    it('should do nothing when input is empty', () => {
      component.inputControl.setValue('');
      component.checkTyping();
      expect(component.typingFeedback).toBeNull();
    });

    it('should handle correct typing answer', async () => {
      component.inputControl.setValue('cat');
      gameStoreMock.currentCard.set({ english: 'cat', polish: 'kot' });

      vi.useFakeTimers();
      component.checkTyping();

      expect(component.typingFeedback).toEqual({ correct: true, msg: 'Correct!' });

      vi.advanceTimersByTime(1000); // GAME_CONSTANTS.FEEDBACK_DELAY
      expect(gameServiceMock.handleAnswer).toHaveBeenCalledWith(true);
      expect(component.inputControl.value).toBe('');
      expect(component.typingFeedback).toBeNull();

      vi.useRealTimers();
    });

    it('should handle incorrect typing answer', () => {
      component.inputControl.setValue('dog');
      gameStoreMock.currentCard.set({ english: 'cat', polish: 'kot' });

      component.checkTyping();

      expect(component.typingFeedback).toEqual({ correct: false, msg: 'Incorrect. It was: cat' });
      expect(component.isPaused()).toBe(true);
      expect(gameServiceMock.handleAnswer).not.toHaveBeenCalled();
    });

    it('should be case insensitive', () => {
      component.inputControl.setValue('CAT');
      gameStoreMock.currentCard.set({ english: 'cat', polish: 'kot' });

      component.checkTyping();

      expect(component.typingFeedback).toEqual({ correct: true, msg: 'Correct!' });
    });

    it('should trim whitespace', () => {
      component.inputControl.setValue('  cat  ');
      gameStoreMock.currentCard.set({ english: 'cat', polish: 'kot' });

      component.checkTyping();

      expect(component.typingFeedback).toEqual({ correct: true, msg: 'Correct!' });
    });
  });

  describe('continueAfterWrongAnswer', () => {
    it('should resume game and handle incorrect answer', () => {
      component.isPaused.set(true);
      component.typingFeedback = { correct: false, msg: 'Incorrect' };
      component.inputControl.setValue('wrong');

      component.continueAfterWrongAnswer();

      expect(component.isPaused()).toBe(false);
      expect(component.typingFeedback).toBeNull();
      expect(component.inputControl.value).toBe('');
      expect(gameServiceMock.handleAnswer).toHaveBeenCalledWith(false);
    });
  });
});
