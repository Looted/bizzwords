import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit, signal } from '@angular/core';
import { AiWordGenerationService } from './services/ai-word-generation';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

interface WordPair {
  english: string;
  polish: string;
}

@Component({
  selector: 'app-learning',
  imports: [CommonModule],
  templateUrl: './learning.component.html',
  styleUrl: './learning.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningComponent implements OnInit, AfterViewInit {
  protected readonly words = signal<WordPair[]>([]);
  protected readonly currentIndex = signal(0);
  protected readonly showTranslation = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly isGenerating = signal(false);
  protected readonly selectedTheme = signal<string>('IT');
  protected readonly selectedMode = signal<'new' | 'practice'>('new');

  constructor(
    private aiService: AiWordGenerationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get query parameters
    this.route.queryParams.subscribe(params => {
      this.selectedTheme.set(params['theme'] || 'IT');
      this.selectedMode.set(params['mode'] || 'new');
    });
  }

  async ngAfterViewInit() {
    // Delay word generation until we're definitely in browser context
    await this.generateWords();
  }

  private async generateWords() {
    this.isGenerating.set(true);
    try {
      const theme = this.selectedTheme();
      const generatedWords = await this.aiService.generateWords(theme, 20);
      console.log('Generated words:', JSON.stringify(generatedWords));
      this.words.set(generatedWords);
    } catch (error) {
      console.error('Failed to generate words:', error);
      // No fallback words - let it fail to test the worker
    } finally {
      this.isGenerating.set(false);
    }
  }

  get currentWord(): WordPair | undefined {
    return this.words()[this.currentIndex()];
  }

  get isLastWord(): boolean {
    return this.currentIndex() >= this.words().length - 1;
  }

  get progress(): number {
    if (this.words().length === 0) return 0;
    return ((this.currentIndex() + 1) / this.words().length) * 100;
  }

  revealTranslation() {
    this.showTranslation.set(true);
  }

  markCorrect() {
    this.showTranslation.set(false);
    if (!this.isLastWord) {
      this.currentIndex.update(i => i + 1);
    } else {
      // TODO: Handle completion
      alert('Learning session complete!');
    }
  }

  markIncorrect() {
    this.showTranslation.set(false);
    if (!this.isLastWord) {
      this.currentIndex.update(i => i + 1);
    } else {
      // TODO: Handle completion
      alert('Learning session complete!');
    }
  }
}
