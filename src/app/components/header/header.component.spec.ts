import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { PwaService } from '../../services/pwa.service';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let pwaServiceMock: any;
  let routerMock: any;
  let storageServiceMock: any;

  beforeEach(async () => {
    pwaServiceMock = {
      showInstallButton: signal(false),
      installPWA: vi.fn().mockResolvedValue(undefined)
    };

    routerMock = {
      navigate: vi.fn()
    };

    storageServiceMock = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: PwaService, useValue: pwaServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Bizzwords');
  });

  it('should call installPWA when button is clicked', () => {
    pwaServiceMock.showInstallButton.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(pwaServiceMock.installPWA).toHaveBeenCalled();
  });

  it('should navigate to home when logo is clicked', () => {
    const logo = fixture.nativeElement.querySelector('.flex.items-center.gap-2.cursor-pointer');
    logo.click();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });
});
