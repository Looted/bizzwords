import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoundIntroComponent } from './round-intro.component';
import { GameRoundConfig } from '../../core/models/game-config.model';
import { LanguageService } from '../../services/language.service';
import { vi, Mock } from 'vitest';

describe('RoundIntroComponent', () => {
  let component: RoundIntroComponent;
  let fixture: ComponentFixture<RoundIntroComponent>;

  let languageServiceMock: {
    nativeLanguage: string;
    getLanguageDisplayName: Mock;
  };

  beforeEach(async () => {
    languageServiceMock = {
      nativeLanguage: 'polish',
      getLanguageDisplayName: vi.fn().mockReturnValue('Polish')
    };

    await TestBed.configureTestingModule({
      imports: [RoundIntroComponent],
      providers: [
        { provide: LanguageService, useValue: languageServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoundIntroComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const roundConfig: GameRoundConfig = {
      id: 'round1',
      name: 'Round 1',
      layout: {
        templateId: 'flashcard_standard',
        dataMap: {
          primary: 'english',
          secondary: 'polish'
        }
      },
      inputSource: 'deck_start',
      completionCriteria: { requiredSuccesses: 1 },
      failureBehavior: { action: 'requeue', strategy: 'static_offset', params: [3] }
    };

    (component as any).roundConfig = () => roundConfig;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should get flashcard description for polish language', () => {
    const roundConfig: GameRoundConfig = {
      id: 'round1',
      name: 'Round 1',
      layout: {
        templateId: 'flashcard_standard',
        dataMap: {
          primary: 'english',
          secondary: 'polish'
        }
      },
      inputSource: 'deck_start',
      completionCriteria: { requiredSuccesses: 1 },
      failureBehavior: { action: 'requeue', strategy: 'static_offset', params: [3] }
    };

    (component as any).roundConfig = () => roundConfig;
    const description = component.getRoundDescription();
    expect(description).toEqual([
      'See an English word',
      'Flip to reveal the Polish translation',
      'Choose "Got It" or "Still Learning"'
    ]);
  });

  it('should get typing challenge description for spanish language', () => {
    languageServiceMock.nativeLanguage = 'spanish';
    languageServiceMock.getLanguageDisplayName.mockReturnValue('Spanish');

    const roundConfig: GameRoundConfig = {
      id: 'round3',
      name: 'Round 3',
      layout: {
        templateId: 'typing_challenge',
        dataMap: {
          primary: 'english',
          secondary: 'spanish'
        }
      },
      inputSource: 'deck_start',
      completionCriteria: { requiredSuccesses: 1 },
      failureBehavior: { action: 'requeue', strategy: 'static_offset', params: [3] }
    };

    (component as any).roundConfig = () => roundConfig;
    const description = component.getRoundDescription();
    expect(description).toEqual([
      'See an English word',
      'Type the Spanish translation',
      'Check your spelling and submit'
    ]);
  });

  it('should emit dismissed event when onDismiss is called', () => {
    const roundConfig: GameRoundConfig = {
      id: 'round1',
      name: 'Round 1',
      layout: {
        templateId: 'flashcard_standard',
        dataMap: {
          primary: 'english',
          secondary: 'polish'
        }
      },
      inputSource: 'deck_start',
      completionCriteria: { requiredSuccesses: 1 },
      failureBehavior: { action: 'requeue', strategy: 'static_offset', params: [3] }
    };

    (component as any).roundConfig = () => roundConfig;
    const dismissedSpy = vi.fn();
    component.dismissed.subscribe(dismissedSpy);

    component.onDismiss();
    expect(dismissedSpy).toHaveBeenCalled();
  });
});
