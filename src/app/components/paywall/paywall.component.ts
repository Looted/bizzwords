import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevenueCatService } from '../../services/revenuecat.service';
import { AuthService } from '../../services/auth.service';
import { Capacitor } from '@capacitor/core';
import { Router } from '@angular/router';

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
  private readonly router = inject(Router);

  // Component state
  readonly isLoading = this.revenueCatService.isLoading;
  readonly error = this.revenueCatService.error;
  readonly isProUser = this.revenueCatService.isProUser;
  readonly lifetimePackage = this.revenueCatService.lifetimePackage;
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly isNative = signal(Capacitor.isNativePlatform());

  // Local state for UI feedback
  private _purchaseStatus = signal<'idle' | 'purchasing' | 'restoring' | 'success' | 'error'>('idle');
  readonly purchaseStatus = this._purchaseStatus.asReadonly();

  async purchaseLifetime(): Promise<void> {
    if (this.isProUser()) return;

    // Safety check for web
    if (!this.isNative()) {
      alert('Purchases are only available in the Android app.');
      return;
    }

    const pkg = this.lifetimePackage();
    if (!pkg) {
      this._purchaseStatus.set('error');
      return;
    }

    try {
      this._purchaseStatus.set('purchasing');
      this.revenueCatService.clearError();

      await this.revenueCatService.purchaseLifetime(pkg);

      this._purchaseStatus.set('success');
      console.log('[Paywall] Purchase completed successfully');

    } catch (error) {
      console.error('[Paywall] Purchase failed:', error);
      this._purchaseStatus.set('error');
    }
  }

  async restorePurchases(): Promise<void> {
    if (!this.isNative()) return;

    try {
      this._purchaseStatus.set('restoring');
      this.revenueCatService.clearError();

      await this.revenueCatService.restorePurchases();

      // Check if restore resulted in pro access
      if (this.isProUser()) {
        this._purchaseStatus.set('success');
      } else {
        // Restored but no active entitlement found
        this._purchaseStatus.set('idle');
        alert('No active subscriptions found to restore.');
      }

    } catch (error) {
      console.error('[Paywall] Restore failed:', error);
      this._purchaseStatus.set('error');
    }
  }

  getStatusMessage(): string {
    switch (this.purchaseStatus()) {
      case 'purchasing':
        return 'Processing your purchase...';
      case 'restoring':
        return 'Restoring your purchases...';
      case 'success':
        return 'Success! Welcome to BizzWords Pro!';
      case 'error':
        return 'Operation failed. Please try again.';
      default:
        return '';
    }
  }

  resetStatus(): void {
    this._purchaseStatus.set('idle');
  }

  getPackagePrice(pkg: any): string {
    return pkg?.product?.priceString || '$9.99';
  }

  clearError(): void {
    this.revenueCatService.clearError();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
