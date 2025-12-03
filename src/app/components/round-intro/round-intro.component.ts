import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RoundIntro {
  roundNumber: number;
  title: string;
  emoji: string;
  subtitle: string;
  instructions: string[];
  ctaText: string;
}

@Component({
  selector: 'app-round-intro',
  imports: [CommonModule],
  templateUrl: './round-intro.component.html',
  styleUrl: './round-intro.component.css'
})
export class RoundIntroComponent {
  intro = input.required<RoundIntro>();
  continue = output<void>();
  skipAll = output<void>();

  onContinue() {
    this.continue.emit();
  }

  onSkipAll() {
    this.skipAll.emit();
  }

  onOverlayClick() {
    // Allow closing by clicking overlay
    this.continue.emit();
  }
}
