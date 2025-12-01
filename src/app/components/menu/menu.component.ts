import { Component, inject, signal, computed, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { GameService } from '../../services/game.service';
import { VocabularyStatsService } from '../../services/vocabulary-stats.service';
import { GameMode } from '../../shared/constants';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  gameService = inject(GameService);
  statsService = inject(VocabularyStatsService);
  router = inject(Router);

  useStatic = signal(true);
  selectedDifficulty = signal<number | null>(null);
  selectedMode = signal<GameMode>(GameMode.New);
  selectedCategory = signal<string | null>(null);
  isLoading = false;

  // Computed signal for AI checkbox - true when AI is enabled
  useAI = computed(() => !this.useStatic());

  categories = [
    {
      id: 'hr',
      name: 'HR Words',
      icon: '👥',
      bgClass: 'bg-purple-50 hover:bg-purple-100',
      borderClass: 'border-purple-200',
      textClass: 'text-purple-700',
      ringClass: 'ring-purple-500'
    },
    {
      id: 'pm',
      name: 'Project Management',
      icon: '📊',
      bgClass: 'bg-blue-50 hover:bg-blue-100',
      borderClass: 'border-blue-200',
      textClass: 'text-blue-700',
      ringClass: 'ring-blue-500'
    }
  ];

  GameMode = GameMode;

  get isMobile(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return window.innerWidth < 768;
    }
    return false;
  }

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.isMobile) {
        this.useStatic.set(true);
      }
    }
  }

  onAICheckboxChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.useStatic.set(!checked); // checked=true means AI on, so useStatic=false
  }

  async selectTopic(categoryId: string) {
    this.selectedCategory.set(categoryId);
    this.isLoading = true;
    try {
      await this.gameService.startGame(
        categoryId,
        this.selectedMode(),
        this.useStatic(),
        this.selectedDifficulty()
      );
      this.router.navigate(['/game']);
    } catch (error) {
      console.error('Failed to start game:', error);
      this.selectedCategory.set(null); // Reset on error
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
}
