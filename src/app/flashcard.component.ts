import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameStore } from './app';

@Component({
  selector: 'app-flashcard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.css']
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
