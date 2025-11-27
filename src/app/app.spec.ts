import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { App, GameStore } from './app';
import { AiWordGenerationService } from './services/ai-word-generation';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('App', () => {
  let component: App;
  let store: GameStore;
  let aiServiceSpy: any;

  const mockCards: any[] = [
    { english: 'Hello', polish: 'Cześć' },
    { english: 'Goodbye', polish: 'Do widzenia' }
  ];

  beforeEach(async () => {
    aiServiceSpy = {
      generateWords: vi.fn().mockResolvedValue(mockCards)
    };

    await TestBed.configureTestingModule({
      imports: [App, ReactiveFormsModule],
      providers: [
        { provide: AiWordGenerationService, useValue: aiServiceSpy }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    store = TestBed.inject(GameStore);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should start game after topic selection', async () => {
    await component.selectTopic('IT');

    expect(store.phase()).toBe('PLAYING');
    expect(store.activeDeck().length).toBe(2);
    expect(component.isLoading).toBe(false);
  });

  it('should check typing answer correctly', async () => {
    // Start game and advance to round 3
    store.startGame([
      { id: '1', english: 'Hello', polish: 'Cześć', category: 'IT', masteryLevel: 0 }
    ]);
    store.handleAnswer(true); // End round 1
    store.handleAnswer(true); // End round 2

    component.inputControl.setValue('hello');
    component.checkTyping();

    // Wait for feedback to be set (before it gets cleared)
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.typingFeedback?.correct).toBe(true);
    expect(component.typingFeedback?.msg).toBe('Correct!');
  });

  it('should handle incorrect typing answer', async () => {
    // Start game and advance to round 3
    store.startGame([
      { id: '1', english: 'Hello', polish: 'Cześć', category: 'IT', masteryLevel: 0 }
    ]);
    store.handleAnswer(true); // End round 1
    store.handleAnswer(true); // End round 2

    component.inputControl.setValue('wrong');
    component.checkTyping();

    // Wait for feedback to be set (before it gets cleared)
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.typingFeedback?.correct).toBe(false);
    expect(component.typingFeedback?.msg).toContain('Incorrect');
  });
});
