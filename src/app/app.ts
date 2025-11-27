import { ChangeDetectionStrategy, Component, signal, computed, effect, inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { AiWordGenerationService } from './services/ai-word-generation';

// --- MODELS ---
export interface Flashcard {
  id: string;
  english: string;
  polish: string;
  category: string;
  masteryLevel: number;
}

export type GamePhase = 'MENU' | 'PLAYING' | 'SUMMARY';
export type RoundType = 'RECOGNIZE_EN' | 'RECOGNIZE_PL' | 'WRITE_EN';

// --- GAME STORE SERVICE (Signals) ---
@Injectable({ providedIn: 'root' })
class GameStore {
  // State Signals
  phase = signal<GamePhase>('MENU');
  currentRound = signal<RoundType>('RECOGNIZE_EN');

  activeDeck = signal<Flashcard[]>([]);
  currentIndex = signal<number>(0);

  // Track wrong answers to repeat them
  wrongAnswers = signal<string[]>([]);

  currentCard = computed(() => {
    const deck = this.activeDeck();
    const idx = this.currentIndex();
    return deck.length > idx ? deck[idx] : null;
  });

  progress = computed(() => {
    const total = this.activeDeck().length;
    const current = this.currentIndex();
    return total === 0 ? 0 : (current / total) * 100;
  });

  startGame(cards: Flashcard[]) {
    this.activeDeck.set(cards);
    this.currentIndex.set(0);
    this.wrongAnswers.set([]);
    this.currentRound.set('RECOGNIZE_EN'); // Start with Round 1
    this.phase.set('PLAYING');
  }

  handleAnswer(correct: boolean) {
    const card = this.currentCard();
    if (!card) return;

    if (!correct) {
      this.wrongAnswers.update(ids => [...ids, card.id]);
    }

    const nextIndex = this.currentIndex() + 1;
    if (nextIndex < this.activeDeck().length) {
      this.currentIndex.set(nextIndex);
    } else {
      this.advanceRound();
    }
  }

  private advanceRound() {
    const current = this.currentRound();
    if (current === 'RECOGNIZE_EN') {
      this.currentRound.set('RECOGNIZE_PL');
      this.currentIndex.set(0);
    } else if (current === 'RECOGNIZE_PL') {
      this.currentRound.set('WRITE_EN');
      this.currentIndex.set(0);
    } else {
      this.phase.set('SUMMARY');
    }
  }

  reset() {
    this.phase.set('MENU');
    this.activeDeck.set([]);
    this.currentIndex.set(0);
  }
}

// 1. CARD COMPONENT
@Component({
  selector: 'app-flashcard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="perspective-1000 w-full max-w-sm h-80 cursor-pointer group" (click)="flip()">
      <div class="relative w-full h-full transition-all duration-500 transform preserve-3d"
           [class.rotate-y-180]="isFlipped()">

        <!-- FRONT -->
        <div class="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-xl border-b-4 border-blue-200 flex flex-col items-center justify-center p-6 text-center">
          <div class="text-gray-400 text-sm font-semibold tracking-wider uppercase mb-2">
            {{ frontLabel() }}
          </div>
          <h2 class="text-3xl font-bold text-slate-800 break-words leading-tight">
            {{ frontText() }}
          </h2>
          <div class="mt-8 text-blue-500 text-sm animate-pulse">
            Tap to reveal
          </div>
        </div>

        <!-- BACK -->
        <div class="absolute w-full h-full backface-hidden bg-blue-50 rounded-2xl shadow-xl border-b-4 border-blue-300 flex flex-col items-center justify-center p-6 text-center rotate-y-180">
          <div class="text-blue-400 text-sm font-semibold tracking-wider uppercase mb-2">
            {{ backLabel() }}
          </div>
          <h2 class="text-3xl font-bold text-blue-900 break-words leading-tight">
            {{ backText() }}
          </h2>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .perspective-1000 { perspective: 1000px; }
    .preserve-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    .rotate-y-180 { transform: rotateY(180deg); }
  `]
})
export class FlashcardComponent {
  store = inject(GameStore);
  isFlipped = signal(false);

  frontLabel = computed(() => {
    const r = this.store.currentRound();
    if (r === 'RECOGNIZE_EN') return 'English';
    return 'Polish';
  });

  frontText = computed(() => {
    const card = this.store.currentCard();
    const r = this.store.currentRound();
    if (!card) return '';
    if (r === 'RECOGNIZE_EN') return card.english;
    return card.polish;
  });

  backLabel = computed(() => {
    const r = this.store.currentRound();
    if (r === 'RECOGNIZE_EN') return 'Polish';
    return 'English';
  });

  backText = computed(() => {
    const card = this.store.currentCard();
    const r = this.store.currentRound();
    if (!card) return '';
    if (r === 'RECOGNIZE_EN') return card.polish;
    return card.english;
  });

  flip() {
    if (this.store.currentRound() !== 'WRITE_EN') {
       this.isFlipped.update(v => !v);
    }
  }

  resetFlip() {
    this.isFlipped.set(false);
  }
}

// 2. MAIN APP COMPONENT
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FlashcardComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-slate-800 flex flex-col">

      <!-- HEADER -->
      <header class="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-4 py-3 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
          <h1 class="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Fiszki</h1>
        </div>
        <div *ngIf="store.phase() !== 'MENU'" class="text-sm font-medium text-slate-500">
           {{ store.currentIndex() + 1 }} / {{ store.activeDeck().length }}
        </div>
      </header>

      <main class="flex-grow flex flex-col p-4 w-full max-w-md mx-auto relative">

        <!-- VIEW: MENU -->
        @if (store.phase() === 'MENU') {
          <div class="flex flex-col gap-6 animate-fade-in mt-4">
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 class="text-2xl font-bold mb-2">Ready to learn?</h2>
              <p class="text-slate-500 mb-6">Select a topic to generate your deck using AI.</p>

              <div class="grid grid-cols-2 gap-3 mb-6">
                <button (click)="selectTopic('IT')"
                  class="p-4 rounded-xl bg-blue-50 border-2 border-blue-100 hover:border-blue-500 hover:bg-blue-100 transition-all text-center group">
                  <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">💻</div>
                  <div class="font-bold text-slate-700">IT Words</div>
                </button>
                <button (click)="selectTopic('HR')"
                  class="p-4 rounded-xl bg-purple-50 border-2 border-purple-100 hover:border-purple-500 hover:bg-purple-100 transition-all text-center group">
                  <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">👥</div>
                  <div class="font-bold text-slate-700">HR Words</div>
                </button>
              </div>

              <div *ngIf="isLoading" class="flex flex-col items-center justify-center py-8">
                 <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                 <span class="text-sm text-blue-600 font-medium">Generating Flashcards...</span>
              </div>
            </div>

            <!-- History / Stats Placeholder -->
            <div class="bg-white/60 rounded-2xl p-6 border border-slate-100">
               <h3 class="font-bold text-slate-700 mb-3">Your Progress</h3>
               <div class="flex items-center gap-3">
                 <div class="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                   <div class="h-full bg-green-500 w-2/3"></div>
                 </div>
                 <span class="text-xs font-bold text-slate-600">65% Mastered</span>
               </div>
            </div>
          </div>
        }

        <!-- VIEW: PLAYING -->
        @if (store.phase() === 'PLAYING') {
          <div class="flex-grow flex flex-col items-center justify-center w-full gap-6 animate-fade-in">

            <!-- Round Indicator -->
            <div class="w-full text-center mb-2">
               <span class="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase shadow-sm">
                 @switch (store.currentRound()) {
                   @case ('RECOGNIZE_EN') { Round 1: Recall (Eng to Pol) }
                   @case ('RECOGNIZE_PL') { Round 2: Recall (Pol to Eng) }
                   @case ('WRITE_EN') { Round 3: Typing Challenge }
                 }
               </span>
            </div>

            <!-- Progress Bar -->
            <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-4">
              <div class="h-full bg-blue-500 transition-all duration-300" [style.width.%]="store.progress()"></div>
            </div>

            <!-- THE CARD (Or Input for Round 3) -->
             @if (store.currentRound() !== 'WRITE_EN') {
                <app-flashcard #cardRef></app-flashcard>

                <!-- Controls for Rounds 1 & 2 -->
                <div class="w-full grid grid-cols-2 gap-4 mt-auto">
                  <button (click)="handleAnswer(false, cardRef)"
                    class="py-4 rounded-xl bg-red-100 text-red-600 font-bold hover:bg-red-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
                    Did not know
                  </button>
                  <button (click)="handleAnswer(true, cardRef)"
                    class="py-4 rounded-xl bg-green-100 text-green-700 font-bold hover:bg-green-200 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm border border-green-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    I knew it
                  </button>
                </div>
             } @else {
               <!-- ROUND 3: TYPING INPUT -->
               <div class="w-full max-w-sm bg-white rounded-2xl shadow-lg border-b-4 border-indigo-200 p-6 flex flex-col items-center text-center">
                  <div class="text-indigo-400 text-sm font-semibold tracking-wider uppercase mb-2">Translate to English</div>
                  <h2 class="text-3xl font-bold text-slate-800 mb-8">{{ store.currentCard()?.polish }}</h2>

                  <input type="text" [formControl]="inputControl" (keyup.enter)="checkTyping()"
                    placeholder="Type English word..."
                    class="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white outline-none text-lg text-center font-semibold text-slate-700 transition-all mb-4">

                  <button (click)="checkTyping()"
                    class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md active:translate-y-0.5 transition-all">
                    Check Answer
                  </button>

                  <div *ngIf="typingFeedback" class="mt-4 p-3 rounded-lg w-full font-medium"
                       [ngClass]="typingFeedback.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ typingFeedback.msg }}
                  </div>
               </div>
             }

          </div>
        }

        <!-- VIEW: SUMMARY -->
        @if (store.phase() === 'SUMMARY') {
           <div class="flex flex-col items-center justify-center h-full animate-fade-in text-center">
              <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">
                🎉
              </div>
              <h2 class="text-3xl font-bold text-slate-800 mb-2">Session Complete!</h2>
              <p class="text-slate-500 mb-8 max-w-xs">You've cycled through all three rounds.</p>

              <div class="w-full bg-white rounded-xl p-4 shadow-sm mb-6">
                 <div class="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                    <span class="text-slate-500">Total Cards</span>
                    <span class="font-bold">{{ store.activeDeck().length }}</span>
                 </div>
                 <div class="flex justify-between items-center text-red-500">
                    <span>Needs Practice</span>
                    <span class="font-bold">{{ store.wrongAnswers().length }}</span>
                 </div>
              </div>

              <div class="flex flex-col gap-3 w-full">
                <button (click)="store.reset()"
                  class="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all">
                  Start New Session
                </button>
              </div>
           </div>
        }

      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class App {
  store = inject(GameStore);
  llm = inject(AiWordGenerationService);

  isLoading = false;
  inputControl = new FormControl('');
  typingFeedback: { correct: boolean, msg: string } | null = null;

  async selectTopic(topic: string) {
    this.isLoading = true;
    try {
      const cards = await this.llm.generateWords(topic);
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
