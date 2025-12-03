import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameRoundConfig } from '../../core/models/game-config.model';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-round-intro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './round-intro.component.html',
  styleUrl: './round-intro.component.css'
})
export class RoundIntroComponent {
  private languageService = inject(LanguageService);

  roundConfig = input.required<GameRoundConfig>();
  dismissed = output<void>();

  getRoundDescription(): string[] {
    const templateId = this.roundConfig().layout.templateId;
    const nativeLanguageName = this.languageService.getLanguageDisplayName(this.languageService.nativeLanguage);

    // Define descriptions based on template or round ID
    const descriptions: Record<string, string[]> = {
      'flashcard_standard': [
        'See an English word',
        `Flip to reveal the ${nativeLanguageName} translation`,
        'Choose "Got It" or "Still Learning"'
      ],
      'typing_challenge': [
        'See an English word',
        `Type the ${nativeLanguageName} translation`,
        'Check your spelling and submit'
      ]
    };

    // Fallback to template-based description, or provide a default
    return descriptions[templateId] || descriptions['flashcard_standard'];
  }

  onDismiss() {
    this.dismissed.emit();
  }
}
