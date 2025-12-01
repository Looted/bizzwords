import { TestBed } from '@angular/core/testing';
import { FlashcardComponent } from './flashcard.component';
import { GameStore } from './game-store';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FlashcardComponent', () => {
  let component: FlashcardComponent;
  let fixture: any;
  let mockStore: any;

  beforeEach(async () => {
    mockStore = {
      currentRoundConfig: vi.fn(),
      currentCard: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [FlashcardComponent],
      providers: [
        { provide: GameStore, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FlashcardComponent);
    component = fixture.componentInstance;
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

  describe('displayFrontLabel', () => {
    it('should return provided frontLabel when available', () => {
      (component as any).frontLabel = () => 'Custom Front';
      expect(component.displayFrontLabel()).toBe('Custom Front');
    });

    it('should return "English" when primary is english', () => {
      mockStore.currentRoundConfig.mockReturnValue({
        layout: { dataMap: { primary: 'english' } }
      });
      expect(component.displayFrontLabel()).toBe('English');
    });

    it('should return "Polish" when primary is polish', () => {
      mockStore.currentRoundConfig.mockReturnValue({
        layout: { dataMap: { primary: 'polish' } }
      });
      expect(component.displayFrontLabel()).toBe('Polish');
    });

    it('should return "Front" when no config available', () => {
      mockStore.currentRoundConfig.mockReturnValue(null);
      expect(component.displayFrontLabel()).toBe('Front');
    });
  });

  describe('displayFrontText', () => {
    it('should return provided frontText when available', () => {
      (component as any).frontText = () => 'Custom Text';
      expect(component.displayFrontText()).toBe('Custom Text');
    });

    it('should return english text when primary is english', () => {
      mockStore.currentCard.mockReturnValue({ english: 'hello', polish: 'cześć' });
      mockStore.currentRoundConfig.mockReturnValue({
        layout: { dataMap: { primary: 'english' } }
      });
      expect(component.displayFrontText()).toBe('hello');
    });

    it('should return polish text when primary is polish', () => {
      mockStore.currentCard.mockReturnValue({ english: 'hello', polish: 'cześć' });
      mockStore.currentRoundConfig.mockReturnValue({
        layout: { dataMap: { primary: 'polish' } }
      });
      expect(component.displayFrontText()).toBe('cześć');
    });

    it('should return empty string when no card or config', () => {
      mockStore.currentCard.mockReturnValue(null);
      mockStore.currentRoundConfig.mockReturnValue(null);
      expect(component.displayFrontText()).toBe('');
    });
  });

  describe('displayBackLabel', () => {
    it('should return provided backLabel when available', () => {
      (component as any).backLabel = () => 'Custom Back';
      expect(component.displayBackLabel()).toBe('Custom Back');
    });

    it('should return "English" when secondary is english', () => {
      mockStore.currentRoundConfig.mockReturnValue({
        layout: { dataMap: { secondary: 'english' } }
      });
      expect(component.displayBackLabel()).toBe('English');
    });

    it('should return "Polish" when secondary is polish', () => {
      mockStore.currentRoundConfig.mockReturnValue({
        layout: { dataMap: { secondary: 'polish' } }
      });
      expect(component.displayBackLabel()).toBe('Polish');
    });

    it('should return "Back" when no config available', () => {
      mockStore.currentRoundConfig.mockReturnValue(null);
      expect(component.displayBackLabel()).toBe('Back');
    });
  });

  describe('displayBackText', () => {
    it('should return provided backText when available', () => {
      (component as any).backText = () => 'Custom Text';
      expect(component.displayBackText()).toBe('Custom Text');
    });

    it('should return english text when secondary is english', () => {
      mockStore.currentCard.mockReturnValue({ english: 'hello', polish: 'cześć' });
      mockStore.currentRoundConfig.mockReturnValue({
        layout: { dataMap: { secondary: 'english' } }
      });
      expect(component.displayBackText()).toBe('hello');
    });

    it('should return polish text when secondary is polish', () => {
      mockStore.currentCard.mockReturnValue({ english: 'hello', polish: 'cześć' });
      mockStore.currentRoundConfig.mockReturnValue({
        layout: { dataMap: { secondary: 'polish' } }
      });
      expect(component.displayBackText()).toBe('cześć');
    });

    it('should return empty string when no card or config', () => {
      mockStore.currentCard.mockReturnValue(null);
      mockStore.currentRoundConfig.mockReturnValue(null);
      expect(component.displayBackText()).toBe('');
    });
  });
});
