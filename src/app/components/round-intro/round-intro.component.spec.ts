import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoundIntroComponent } from './round-intro.component';
import { vi } from 'vitest';

interface RoundIntro {
  roundNumber: number;
  title: string;
  emoji: string;
  subtitle: string;
  instructions: string[];
  ctaText: string;
}

describe('RoundIntroComponent', () => {
  let component: RoundIntroComponent;
  let fixture: ComponentFixture<RoundIntroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundIntroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoundIntroComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit continue event when onContinue is called', () => {
    const continueSpy = vi.fn();
    component.continue.subscribe(continueSpy);

    component.onContinue();

    expect(continueSpy).toHaveBeenCalled();
  });

  it('should emit skipAll event when onSkipAll is called', () => {
    const skipAllSpy = vi.fn();
    component.skipAll.subscribe(skipAllSpy);

    component.onSkipAll();

    expect(skipAllSpy).toHaveBeenCalled();
  });

  it('should emit continue event when overlay is clicked', () => {
    const continueSpy = vi.fn();
    component.continue.subscribe(continueSpy);

    component.onOverlayClick();

    expect(continueSpy).toHaveBeenCalled();
  });

  it('should render intro data correctly', () => {
    const testIntro: RoundIntro = {
      roundNumber: 2,
      title: 'Round 2',
      emoji: '🎴',
      subtitle: 'Flashcard Challenge',
      instructions: [
        'See an English word',
        'Flip to reveal the translation',
        'Choose your answer'
      ],
      ctaText: 'Start Round 2 →'
    };

    // Set the input using component fixture
    fixture.componentRef.setInput('intro', testIntro);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    // Check that the intro data is rendered
    expect(compiled.textContent).toContain('Round 2');
    expect(compiled.textContent).toContain('🎴');
    expect(compiled.textContent).toContain('Flashcard Challenge');
    expect(compiled.textContent).toContain('See an English word');
    expect(compiled.textContent).toContain('Start Round 2 →');
  });
});
