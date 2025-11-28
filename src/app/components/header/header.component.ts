import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  pwaService = inject(PwaService);
  router = inject(Router);

  @Input() showCardCount = false;
  @Input() currentIndex = 0;
  @Input() totalCards = 0;

  onInstallClick() {
    this.pwaService.installPWA();
  }

  onLogoClick() {
    this.router.navigate(['/']);
  }
}
