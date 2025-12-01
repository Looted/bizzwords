import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuComponent } from './menu.component';
import { GameService } from '../../services/game.service';
import { VocabularyStatsService } from '../../services/vocabulary-stats.service';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { GameMode } from '../../shared/constants';
import { vi } from 'vitest';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let gameServiceMock: any;
  let statsServiceMock: any;
  let routerMock: any;
  let storageServiceMock: any;

  beforeEach(async () => {
    gameServiceMock = {
      startGame: vi.fn().mockResolvedValue(undefined)
    };
    statsServiceMock = {
      getAllStats: vi.fn().mockReturnValue([])
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
      imports: [MenuComponent],
      providers: [
        { provide: GameService, useValue: gameServiceMock },
        { provide: VocabularyStatsService, useValue: statsServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: StorageService, useValue: storageServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set useStatic to true on mobile devices', () => {
      // Mock window.innerWidth for mobile
      const originalInnerWidth = window.innerWidth;
      Object.defineProperty(window, 'innerWidth', {
        value: 500, // Mobile width
        writable: true
      });

      component.ngOnInit();

      expect(component.useStatic()).toBe(true);

      // Restore original value
      Object.defineProperty(window, 'innerWidth', {
        value: originalInnerWidth,
        writable: true
      });
    });

    it('should not change useStatic on desktop devices', () => {
      // Mock window.innerWidth for desktop
      const originalInnerWidth = window.innerWidth;
      Object.defineProperty(window, 'innerWidth', {
        value: 1024, // Desktop width
        writable: true
      });

      component.ngOnInit();

      expect(component.useStatic()).toBe(true); // Initial value

      // Restore original value
      Object.defineProperty(window, 'innerWidth', {
        value: originalInnerWidth,
        writable: true
      });
    });
  });

  describe('selectTopic', () => {
    it('should call startGame and navigate on success', async () => {
      await component.selectTopic('IT');

      expect(gameServiceMock.startGame).toHaveBeenCalledWith('IT', GameMode.New, true, null);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/game']);
      expect(component.isLoading).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Game start failed');
      gameServiceMock.startGame.mockRejectedValue(error);

      // Spy on console.error to avoid test output pollution
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      await expect(component.selectTopic('IT')).rejects.toThrow('Game start failed');

      expect(component.isLoading).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to start game:', error);

      consoleSpy.mockRestore();
    });

    it('should pass selected options to startGame', async () => {
      component.useStatic.set(false);
      component.selectedDifficulty.set(3);
      component.selectedMode.set(GameMode.Practice);

      await component.selectTopic('HR');

      expect(gameServiceMock.startGame).toHaveBeenCalledWith('HR', GameMode.Practice, false, 3);
    });

    it('should set loading state during game start', async () => {
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      gameServiceMock.startGame.mockReturnValue(promise);

      const selectPromise = component.selectTopic('IT');
      expect(component.isLoading).toBe(true);

      resolvePromise!();
      await selectPromise;
      expect(component.isLoading).toBe(false);
    });
  });

  describe('isMobile computed', () => {
    it('should return true on mobile devices', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 500,
        writable: true
      });

      expect(component.isMobile).toBe(true);
    });

    it('should return false on desktop devices', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        writable: true
      });

      expect(component.isMobile).toBe(false);
    });

    it('should return false on server platform', () => {
      // Test with server platform
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [MenuComponent],
        providers: [
          { provide: GameService, useValue: gameServiceMock },
          { provide: VocabularyStatsService, useValue: statsServiceMock },
          { provide: Router, useValue: routerMock },
          { provide: PLATFORM_ID, useValue: 'server' },
          { provide: StorageService, useValue: storageServiceMock }
        ]
      });

      const serverComponent = TestBed.createComponent(MenuComponent).componentInstance;
      expect(serverComponent.isMobile).toBe(false);
    });
  });
});
