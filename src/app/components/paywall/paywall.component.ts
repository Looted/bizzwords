import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevenueCatService } from '../../services/revenuecat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-paywall',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paywall.component.html',
  styleUrls: ['./paywall.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaywallComponent {
  private readonly revenueCatService = inject(RevenueCatService);
  private readonly authService = inject(AuthService);

  // Component state
  readonly isLoading = this.revenueCatService.isLoading;
  readonly error = this.revenueCatService.error;
  readonly isProUser = this.revenueCatService.isProUser;
  readonly lifetimePackage = this.revenueCatService.lifetimePackage;
  readonly isAuthenticated = this.authService.isAuthenticated;

  // Local state for UI feedback
  private _purchaseStatus = signal<'idle' | 'purchasing' | 'success' | 'error'>('idle');
  readonly purchaseStatus = this._purchaseStatus.asReadonly();

  async purchaseLifetime(): Promise<void> {
    if (this.isProUser()) {
      return; // Already has pro access
    }

    try {
      this._purchaseStatus.set('purchasing');
      this.revenueCatService.clearError();

      await this.revenueCatService.purchaseLifetime();

      this._purchaseStatus.set('success');
      console.log('[Paywall] Purchase completed successfully');

    } catch (error) {
      console.error('[Paywall] Purchase failed:', error);
      this._purchaseStatus.set('error');
    }
  }

  getStatusMessage(): string {
    switch (this.purchaseStatus()) {
      case 'purchasing':
        return 'Processing your purchase...';
      case 'success':
        return 'Purchase successful! Welcome to BizzWords Pro!';
      case 'error':
        return 'Purchase failed. Please try again.';
      default:
        return '';
    }
  }

  resetStatus(): void {
    this._purchaseStatus.set('idle');
  }

  getPackagePrice(pkg: any): string {
    // TODO: Implement proper price formatting when RevenueCat is fully integrated
    return '$9.99'; // Placeholder price
  }

  clearError(): void {
    this.revenueCatService.clearError();
  }
}
