import { ChangeDetectionStrategy, Component, inject, signal, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { AiWordGenerationService } from './services/ai-word-generation';
import { StaticVocabularyService } from './services/static-vocabulary.service';
import { GameStore, Flashcard } from './game-store';

import { FlashcardComponent } from './flashcard.component';

// Polyfill for crypto.randomUUID for mobile browsers
if (!crypto.randomUUID) {
  crypto.randomUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }) as `${string}-${string}-${string}-${string}-${string}`;
  };
}

// 2. MAIN APP COMPONENT
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FlashcardComponent],
  templateUrl: './app.html',
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class App implements OnInit {
  store = inject(GameStore);
  llm = inject(AiWordGenerationService);
  staticVocab = inject(StaticVocabularyService);

  useStatic = signal(true);
  selectedDifficulty = signal<number | null>(null);
  isLoading = false;
  inputControl = new FormControl('');
  typingFeedback: { correct: boolean, msg: string } | null = null;

  // PWA Install properties
  deferredPrompt: any = null;
  showInstallButton = signal(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // Only add event listeners in the browser
    if (isPlatformBrowser(this.platformId)) {
      // Listen for the beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        this.deferredPrompt = e;
        // Update UI to notify the user they can install the PWA
        this.showInstallButton.set(true);
      });

      // Listen for the appinstalled event
      window.addEventListener('appinstalled', () => {
        // Hide the install button when the PWA has been installed
        this.showInstallButton.set(false);
        this.deferredPrompt = null;
      });
    }
  }

  async installPWA() {
    if (!this.deferredPrompt) return;

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;

    // Hide the install button regardless of the outcome
    this.showInstallButton.set(false);

    // Clear the deferredPrompt
    this.deferredPrompt = null;
  }

  async selectTopic(topic: string) {
    this.isLoading = true;
    try {
      let cards: {english: string, polish: string}[];

      if (this.useStatic() && topic === 'HR') {
        cards = await this.staticVocab.generateWords(topic, 10, this.selectedDifficulty() ?? undefined).toPromise() || [];
      } else {
        cards = await this.llm.generateWords(topic, 10, undefined, this.selectedDifficulty());
      }

      const flashcards: Flashcard[] = cards.map((item, index) => ({
        id: crypto.randomUUID(),
        english: item.english,
        polish: item.polish,
        category: topic,
        masteryLevel: 0
      }));
      this.store.startGame(flashcards);
    } finally {
      this.isLoading = false;
    }
  }

  handleAnswer(correct: boolean, cardComp: FlashcardComponent) {
    cardComp.resetFlip(); // Reset flip first to hide back content
    // Small delay to ensure flip animation completes before advancing
    setTimeout(() => {
      this.store.handleAnswer(correct);
    }, 100);
  }

  checkTyping() {
    if (!this.inputControl.value) return;

    const input = this.inputControl.value.trim().toLowerCase();
    const correct = this.store.currentCard()?.english.toLowerCase();

    if (input === correct) {
      this.typingFeedback = { correct: true, msg: 'Correct!' };
      setTimeout(() => {
        this.store.handleAnswer(true);
        this.inputControl.setValue('');
        this.typingFeedback = null;
      }, 800);
    } else {
      this.typingFeedback = { correct: false, msg: `Incorrect. It was: ${correct}` };
      // User must acknowledge error or we wait a bit longer
      setTimeout(() => {
         this.store.handleAnswer(false);
         this.inputControl.setValue('');
         this.typingFeedback = null;
      }, 2000);
    }
  }
}
