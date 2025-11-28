import { Component, inject, signal, computed, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { GameStore } from './game-store';
import { FlashcardComponent } from './flashcard.component';
import { PwaService } from './services/pwa.service';
import { GameService } from './services/game.service';
import { VocabularyStatsService } from './services/vocabulary-stats.service';
import { GameMode, GAME_CONSTANTS } from './shared/constants';

// 2. MAIN APP COMPONENT
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FlashcardComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.component.css']
})
export class App implements OnInit {
  store = inject(GameStore);
  pwaService = inject(PwaService);
  gameService = inject(GameService);
  statsService = inject(VocabularyStatsService);

  useStatic = signal(true);
  selectedDifficulty = signal<number | null>(null);
  selectedMode = signal<GameMode>(GameMode.New);
  isLoading = false;
  inputControl = new FormControl('');
  typingFeedback: { correct: boolean, msg: string } | null = null;

  // Expose enum to template
  GameMode = GameMode;

  // Mobile detection
  isMobile = computed(() => {
    if (isPlatformBrowser(this.platformId)) {
      return window.innerWidth < 768;
    }
    return false;
  });

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit() {
    // Only add event listeners in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.pwaService.init();

      // Ensure static mode is used on mobile devices
      if (this.isMobile()) {
        this.useStatic.set(true);
      }
    }
  }

  async installPWA() {
    await this.pwaService.installPWA();
  }

  async selectTopic(topic: string) {
    this.isLoading = true;
    try {
      await this.gameService.startGame(
        topic,
        this.selectedMode(),
        this.useStatic(),
        this.selectedDifficulty()
      );
    } finally {
      this.isLoading = false;
    }
  }

  handleAnswer(correct: boolean, cardComp: FlashcardComponent) {
    cardComp.resetFlip(); // Reset flip first to hide back content
    // Small delay to ensure flip animation completes before advancing
    setTimeout(() => {
      this.gameService.handleAnswer(correct);
    }, GAME_CONSTANTS.FLIP_DELAY);
  }

  checkTyping() {
    if (!this.inputControl.value) return;

    const input = this.inputControl.value.trim().toLowerCase();
    const correct = this.store.currentCard()?.english.toLowerCase();

    if (input === correct) {
      this.typingFeedback = { correct: true, msg: 'Correct!' };
      setTimeout(() => {
        this.gameService.handleAnswer(true);
        this.inputControl.setValue('');
        this.typingFeedback = null;
      }, GAME_CONSTANTS.FEEDBACK_DELAY);
    } else {
      this.typingFeedback = { correct: false, msg: `Incorrect. It was: ${correct}` };
      // User must acknowledge error or we wait a bit longer
      setTimeout(() => {
        this.gameService.handleAnswer(false);
        this.inputControl.setValue('');
        this.typingFeedback = null;
      }, GAME_CONSTANTS.ERROR_DELAY);
    }
  }
}
