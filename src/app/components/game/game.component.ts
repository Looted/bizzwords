import { Component, inject, effect, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameStore } from '../../game-store';
import { GameService } from '../../services/game.service';
import { CardRendererComponent } from './card-renderer/card-renderer.component';
import { RoundIntroComponent } from '../round-intro/round-intro.component';
import { GAME_CONSTANTS } from '../../shared/constants';
import { LanguageService } from '../../services/language.service';

interface RoundIntro {
  roundNumber: number;
  title: string;
  emoji: string;
  subtitle: string;
  instructions: string[];
  ctaText: string;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, CardRendererComponent, RoundIntroComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
  store = inject(GameStore);
  gameService = inject(GameService);
  router = inject(Router);
  languageService = inject(LanguageService);

  @ViewChild(CardRendererComponent) cardRef?: CardRendererComponent;

  roundIntro = computed(() => {
    const config = this.store.currentRoundConfig();
    if (!config) return null;

    const roundNumber = this.store.roundIndex() + 1;
    const templateId = config.layout.templateId;
    const nativeLanguageName = this.languageService.getLanguageDisplayName(this.languageService.currentLanguage());

    // Define round intro data based on template
    const roundIntros: Record<string, Omit<RoundIntro, 'roundNumber'>> = {
      'flashcard_standard': {
        title: `Round ${roundNumber}`,
        emoji: '🎴',
        subtitle: 'Flashcard Challenge',
        instructions: [
          'See an English word',
          `Flip to reveal the ${nativeLanguageName} translation`,
          'Choose "Got It" or "Still Learning"'
        ],
        ctaText: `Start Round ${roundNumber} →`
      },
      'typing_challenge': {
        title: `Round ${roundNumber}`,
        emoji: '⌨️',
        subtitle: 'Typing Challenge',
        instructions: [
          'See an English word',
          `Type the ${nativeLanguageName} translation`,
          'Check your spelling and submit'
        ],
        ctaText: `Start Round ${roundNumber} →`
      }
    };

    const defaultIntro = roundIntros['flashcard_standard'];
    const introData = roundIntros[templateId] || defaultIntro;

    return {
      roundNumber,
      ...introData
    } as RoundIntro;
  });

  constructor() {
    // Redirect to menu if no active game
    effect(() => {
      if (this.store.phase() === 'MENU' && this.store.activeDeck().length === 0) {
        this.router.navigate(['/']);
      }
    });

    effect(() => {
      if (this.store.phase() === 'SUMMARY') {
        this.router.navigate(['/summary']);
      }
    });
  }

  handleAnswer(correct: boolean) {
    this.cardRef?.resetFlip();
    setTimeout(() => {
      this.gameService.handleAnswer(correct);
    }, GAME_CONSTANTS.FLIP_DELAY);
  }

  skipCard() {
    this.cardRef?.resetFlip();
    this.gameService.skipCard();
  }

  onTypingAnswer(event: {success: boolean}) {
    this.gameService.handleAnswer(event.success);
  }

  onIntroDismissed() {
    this.store.roundIntroShown.set(true);
  }

  onSkipAllRounds() {
    // Skip round intros for the entire session by setting roundIntroShown to true
    // and navigating to summary to end the current session
    this.store.roundIntroShown.set(true);
    this.store.phase.set('SUMMARY');
    this.router.navigate(['/summary']);
  }

  backToMenu() {
    this.store.reset();
    this.router.navigate(['/']);
  }
}
