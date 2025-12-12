import { Injectable, inject, signal, computed, PLATFORM_ID, isDevMode } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Purchases, PurchasesPackage, CustomerInfo, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class RevenueCatService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly firestoreService = inject(FirestoreService);

  // RevenueCat configuration
  // TODO: Replace with real API key
  private readonly REVENUECAT_API_KEY_ANDROID = 'goog_OKZAyYxDIQSzNuzIShHsKFXKlkpHsK'; // Placeholder for Android
  private readonly ENTITLEMENT_PRO = 'bizzwords_pro';

  // Reactive signals for subscription state
  private _customerInfo = signal<CustomerInfo | null>(null);
  private _offerings = signal<any>(null); // Type is complex, keeping as any for now or strictly typed if possible
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);
  private _isInitialized = signal(false);

  // Public signals
  readonly customerInfo = this._customerInfo.asReadonly();
  readonly offerings = this._offerings.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isInitialized = this._isInitialized.asReadonly();

  // Computed signals for convenience
  readonly isProUser = computed(() => {
    const customerInfo = this._customerInfo();
    return customerInfo?.entitlements?.active?.[this.ENTITLEMENT_PRO] !== undefined;
  });

  readonly lifetimeOffering = computed(() => {
    const offerings = this._offerings();
    return offerings?.current || offerings?.all?.['default'] || null;
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
      if (!Capacitor.isNativePlatform()) {
        console.warn('[RevenueCat] Not running on native platform. Payments disabled.');
        this._isInitialized.set(true);
        return;
      }

      if (isDevMode()) {
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      }

      await Purchases.configure({ apiKey: this.REVENUECAT_API_KEY_ANDROID });

      this._isInitialized.set(true);
      console.log('[RevenueCat] Service initialized');

      // Load initial data
      await this.refreshCustomerInfo();
      await this.refreshOfferings();

    } catch (error) {
      console.error('[RevenueCat] Failed to initialize:', error);
      this._error.set('Failed to initialize RevenueCat');
    }
  }

  /**
   * Refresh customer info from RevenueCat
   */
  async refreshCustomerInfo(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      this._isLoading.set(true);
      this._error.set(null);

      const { customerInfo } = await Purchases.getCustomerInfo();
      this._customerInfo.set(customerInfo);

    } catch (error) {
      console.error('[RevenueCat] Failed to refresh customer info:', error);
      // Don't set global error here to avoid blocking UI, just log it
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Refresh available offerings
   */
  async refreshOfferings(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const offerings = await Purchases.getOfferings();
      this._offerings.set(offerings);
    } catch (error) {
      console.error('[RevenueCat] Failed to refresh offerings:', error);
      this._error.set('Failed to load product offerings');
    }
  }

  /**
   * Check if user has Pro entitlement
   */
  hasProEntitlement(): boolean {
    // In dev mode on web, allow bypass if needed, or strictly enforce false
    // For now, reactive signal serves as source of truth
    return this.isProUser();
  }

  /**
   * Purchase lifetime subscription
   */
  async purchaseLifetime(pkg: PurchasesPackage): Promise<any> {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Purchases are only available on the mobile app.');
    }

    try {
      this._isLoading.set(true);
      this._error.set(null);

      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      this._customerInfo.set(customerInfo);

      return { success: true };
    } catch (error: any) {
      console.error('[RevenueCat] Purchase failed:', error);

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
   * Restore purchases
   */
  async restorePurchases(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Restore is only available on the mobile app.');
    }

    try {
      this._isLoading.set(true);
      this._error.set(null);

      const { customerInfo } = await Purchases.restorePurchases();
      this._customerInfo.set(customerInfo);

      console.log('[RevenueCat] Purchases restored');

    } catch (error: any) {
      console.error('[RevenueCat] Restore failed:', error);
      this._error.set(error.message || 'Failed to restore purchases');
      throw error;
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
}
