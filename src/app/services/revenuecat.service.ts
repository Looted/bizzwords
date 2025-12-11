import { Injectable, inject, signal, computed, PLATFORM_ID, isDevMode } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class RevenueCatService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly firestoreService = inject(FirestoreService);

  // RevenueCat configuration
  private readonly REVENUECAT_API_KEY = 'test_OKZAyYxDIQSzNuzIShHsKFXKlkpHsK';
  private readonly ENTITLEMENT_PRO = 'bizzwords_pro';

  // Reactive signals for subscription state
  private _customerInfo = signal<any>(null);
  private _offerings = signal<any>(null);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);

  // Public signals
  readonly customerInfo = this._customerInfo.asReadonly();
  readonly offerings = this._offerings.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals for convenience
  readonly isProUser = computed(() => {
    const customerInfo = this._customerInfo();
    return customerInfo?.entitlements?.active?.[this.ENTITLEMENT_PRO] !== undefined;
  });

  readonly lifetimeOffering = computed(() => {
    const offerings = this._offerings();
    return offerings?.['default'] || null;
  });

  readonly lifetimePackage = computed(() => {
    const offering = this.lifetimeOffering();
    return offering?.lifetime || null;
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeRevenueCat();
    }
  }

  private async initializeRevenueCat(): Promise<void> {
    try {
      // TODO: Initialize RevenueCat SDK when API is clarified
      console.log('[RevenueCat] Service initialized (TODO: implement SDK integration)');

      // For now, set some mock data for development
      if (isDevMode()) {
        this._customerInfo.set({
          entitlements: {
            active: {}
          }
        });
      }

    } catch (error) {
      console.error('[RevenueCat] Failed to initialize:', error);
      this._error.set('Failed to initialize RevenueCat');
    }
  }

  /**
   * Refresh customer info from RevenueCat
   */
  async refreshCustomerInfo(): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // TODO: Implement RevenueCat customer info fetching
      console.log('[RevenueCat] TODO: Refresh customer info from RevenueCat');

      // For now, maintain current state
      const currentInfo = this._customerInfo();
      this._customerInfo.set(currentInfo);

    } catch (error) {
      console.error('[RevenueCat] Failed to refresh customer info:', error);
      this._error.set('Failed to load subscription status');
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Refresh available offerings
   */
  async refreshOfferings(): Promise<void> {
    try {
      // TODO: Implement RevenueCat offerings fetching
      console.log('[RevenueCat] TODO: Refresh offerings from RevenueCat');

      // For now, maintain current state
      const currentOfferings = this._offerings();
      this._offerings.set(currentOfferings);

    } catch (error) {
      console.error('[RevenueCat] Failed to refresh offerings:', error);
      this._error.set('Failed to load product offerings');
    }
  }

  /**
   * Check if user has Pro entitlement
   */
  hasProEntitlement(): boolean {
    return this.isProUser();
  }

  /**
   * Purchase lifetime subscription
   */
  async purchaseLifetime(): Promise<any> {
    const lifetimePackage = this.lifetimePackage();
    if (!lifetimePackage) {
      throw new Error('Lifetime package not available');
    }

    try {
      this._isLoading.set(true);
      this._error.set(null);

      // TODO: Implement RevenueCat purchase
      console.log('[RevenueCat] TODO: Purchase lifetime package');

      // Simulate successful purchase for development
      if (isDevMode()) {
        // Add pro entitlement to mock customer info
        const currentInfo = this._customerInfo() || { entitlements: { active: {} } };
        currentInfo.entitlements.active[this.ENTITLEMENT_PRO] = {
          identifier: this.ENTITLEMENT_PRO,
          isActive: true,
          willRenew: false
        };
        this._customerInfo.set(currentInfo);
      }

      return { success: true };
    } catch (error: any) {
      console.error('[RevenueCat] Purchase failed:', error);

      // Handle different error types
      if (error.userCancelled) {
        throw new Error('Purchase was cancelled');
      } else {
        this._error.set(error.message || 'Purchase failed');
        throw error;
      }
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Clear any errors
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Get current customer info synchronously
   */
  getCurrentCustomerInfo(): any {
    return this._customerInfo();
  }
}
