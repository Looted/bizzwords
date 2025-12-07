import { Component, input, computed, ViewChild, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlashcardComponent } from './flashcard/flashcard.component';
import { TypingCardComponent } from './typing-card/typing-card.component';
import { Flashcard } from '../../../game-store';
import { LayoutPolicy } from '../../../core/models/game-config.model';

import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-card-renderer',
  standalone: true,
  imports: [CommonModule, FlashcardComponent, TypingCardComponent],
  template: `
    <!-- Wrapper to ensure width context -->
    <div class="w-full h-full flex justify-center">
      @if ((layoutConfig().templateId || 'flashcard_standard') === 'flashcard_standard') {
        <app-flashcard
          class="w-full"
          [frontText]="frontText()"
          [backText]="backText()"
          [frontLabel]="frontLabel()"
          [backLabel]="backLabel()"
          #flashcardRef>
        </app-flashcard>
      } @else if (layoutConfig().templateId === 'typing_challenge') {
        <app-typing-card
          class="w-full"
          [promptText]="frontText()"
          [expectedAnswer]="backText()"
          [label]="'Translate to ' + backLabel()"
          [placeholder]="'Type ' + backLabel() + ' word...'"
          (answerSubmitted)="onAnswerSubmitted($event)">
        </app-typing-card>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class CardRendererComponent {
  private languageService = inject(LanguageService);
  card = input.required<Flashcard>();
  layoutConfig = input.required<LayoutPolicy>();

  answerSubmitted = output<{ success: boolean }>();

  @ViewChild('flashcardRef') flashcard?: FlashcardComponent;

  frontText = computed(() => {
    const config = this.layoutConfig();
    if (!config) return '';
    const card = this.card();
    const dataMap = config.dataMap;
    const field = dataMap.primary;

    // Handle direct properties (like 'english')
    if (field === 'english') {
      return card.english;
    }

    // Handle translation fields (like 'polish', 'german', etc.)
    if (card.translations && field in card.translations) {
      return card.translations[field as keyof typeof card.translations] || '';
    }

    return '';
  });

  backText = computed(() => {
    const config = this.layoutConfig();
    if (!config) return '';
    const card = this.card();
    const dataMap = config.dataMap;
    const field = dataMap.secondary;

    // Handle direct properties (like 'english')
    if (field === 'english') {
      return card.english;
    }

    // Handle translation fields (like 'polish', 'german', etc.)
    if (card.translations && field in card.translations) {
      return card.translations[field as keyof typeof card.translations] || '';
    }

    return '';
  });

  frontLabel = computed(() => {
    const config = this.layoutConfig();
    if (!config) return 'Front';
    const dataMap = config.dataMap;
    return dataMap.primary === 'english'
      ? 'English'
      : this.languageService.getLanguageDisplayName(this.languageService.currentLanguage());
  });

  backLabel = computed(() => {
    const config = this.layoutConfig();
    if (!config) return 'Back';
    const dataMap = config.dataMap;
    // Note: Assuming 'english' is always one of the languages.
    // If we're translating TO English, field is 'english'.
    return dataMap.secondary === 'english'
      ? 'English'
      : this.languageService.getLanguageDisplayName(this.languageService.currentLanguage());
  });

  onAnswerSubmitted(event: { success: boolean }) {
    this.answerSubmitted.emit(event);
  }

  resetFlip() {
    this.flashcard?.resetFlip();
  }
}
