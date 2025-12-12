import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaywallComponent } from './paywall.component';
import { RevenueCatService } from '../../services/revenuecat.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { vi } from 'vitest';

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn().mockReturnValue(true) // Default to native for component tests
  },
  registerPlugin: vi.fn()
}));

describe('PaywallComponent', () => {
  let component: PaywallComponent;
  let fixture: ComponentFixture<PaywallComponent>;
  let revenueCatServiceMock: any;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    revenueCatServiceMock = {
      isLoading: signal(false),
      error: signal(null),
      isProUser: signal(false),
      lifetimePackage: signal({ product: { priceString: '$9.99' } }),
      clearError: vi.fn(),
      purchaseLifetime: vi.fn(),
      restorePurchases: vi.fn()
    };

    authServiceMock = {
      isAuthenticated: signal(true)
    };

    routerMock = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [PaywallComponent],
      providers: [
        { provide: RevenueCatService, useValue: revenueCatServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaywallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call purchaseLifetime when starting purchase', async () => {
    await component.purchaseLifetime();
    expect(revenueCatServiceMock.purchaseLifetime).toHaveBeenCalled();
    expect(component.purchaseStatus()).toBe('success'); // Assuming mock resolves successfully
  });

  it('should handle purchase error', async () => {
    revenueCatServiceMock.purchaseLifetime.mockRejectedValue(new Error('Failed'));

    await component.purchaseLifetime();
    expect(component.purchaseStatus()).toBe('error');
  });

  it('should allow restore on native platform', async () => {
    // Assuming isNative is true by default
    await component.restorePurchases();
    expect(revenueCatServiceMock.restorePurchases).toHaveBeenCalled();
  });

  it('should show web warning if not native', async () => {
    // We need to override the signal or mock behavior before component creation if checking initialization,
    // but the component reads signal(Capacitor.isNativePlatform()).
    // Re-creating component with non-native mock:
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);

    const fixtureWeb = TestBed.createComponent(PaywallComponent);
    const compWeb = fixtureWeb.componentInstance;
    fixtureWeb.detectChanges();

    expect(compWeb.isNative()).toBe(false);

    // Attempt purchase
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
    await compWeb.purchaseLifetime();

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Android app'));
    expect(revenueCatServiceMock.purchaseLifetime).not.toHaveBeenCalled();
  });
});
