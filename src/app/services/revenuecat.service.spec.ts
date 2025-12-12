import { TestBed } from '@angular/core/testing';
import { RevenueCatService } from './revenuecat.service';
import { FirestoreService } from './firestore.service';
import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { vi } from 'vitest';

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn()
  }
}));

// Mock RevenueCat Plugin
vi.mock('@revenuecat/purchases-capacitor', () => ({
  Purchases: {
    configure: vi.fn(),
    setLogLevel: vi.fn(),
    getCustomerInfo: vi.fn(),
    getOfferings: vi.fn(),
    purchasePackage: vi.fn(),
    restorePurchases: vi.fn()
  },
  LOG_LEVEL: { DEBUG: 'DEBUG' }
}));

describe('RevenueCatService', () => {
  let service: RevenueCatService;
  let firestoreServiceMock: any;

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    firestoreServiceMock = {};

    TestBed.configureTestingModule({
      providers: [
        RevenueCatService,
        { provide: FirestoreService, useValue: firestoreServiceMock }
      ]
    });
    service = TestBed.inject(RevenueCatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      (Purchases.getCustomerInfo as any).mockResolvedValue({ customerInfo: {} });
      (Purchases.getOfferings as any).mockResolvedValue({ offerings: {} });

      // Re-run constructor logic by spying on prototype or just private method if accessible,
      // but simpler to check via public signals if initialized
      // For testing private initialization, we might need to manually call a method if exposed or rely on constructor

      // Since initialization is in constructor and async, we can check side effects
      // or we can invoke the private method if we cast to any
      await (service as any).initializeRevenueCat();

      expect(Purchases.configure).toHaveBeenCalled();
      expect(service.isInitialized()).toBe(true);
    });

    it('should NOT initialize on non-native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);

      await (service as any).initializeRevenueCat();

      expect(Purchases.configure).not.toHaveBeenCalled();
      // Should still be "initialized" in terms of "ready to use" (web mode)
      expect(service.isInitialized()).toBe(true);
    });
  });

  describe('Purchases', () => {
    it('should throw error on non-native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);

      await expect(service.purchaseLifetime({} as any)).rejects.toThrow('mobile app');
    });

    it('should call purchasePackage on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      (Purchases.purchasePackage as any).mockResolvedValue({ customerInfo: {} });

      const pkg = { identifier: 'test' } as any;
      await service.purchaseLifetime(pkg);

      expect(Purchases.purchasePackage).toHaveBeenCalledWith({ aPackage: pkg });
    });
  });

  describe('Restore', () => {
    it('should throw error on non-native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);

      await expect(service.restorePurchases()).rejects.toThrow('mobile app');
    });

    it('should call restorePurchases on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      (Purchases.restorePurchases as any).mockResolvedValue({ customerInfo: {} });

      await service.restorePurchases();

      expect(Purchases.restorePurchases).toHaveBeenCalled();
    });
  });
});
