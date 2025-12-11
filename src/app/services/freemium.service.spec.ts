import { TestBed } from '@angular/core/testing';
import { FreemiumService } from './freemium.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { VocabularyStatsService } from './vocabulary-stats.service';
import { StorageService } from './storage.service';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FreemiumService', () => {
  let service: FreemiumService;

  beforeEach(() => {
    const httpClientMock = {
      get: vi.fn().mockReturnValue(of([]))
    };

    const authServiceMock = {
      isPremiumUser: vi.fn().mockReturnValue(false),
      currentUser: vi.fn().mockReturnValue({ uid: 'test-user' }),
      userProfileReady: vi.fn().mockReturnValue(true)
    };

    const vocabStatsServiceMock = {
      getAllStats: vi.fn().mockReturnValue([])
    };

    const storageServiceMock = {};

    TestBed.configureTestingModule({
      providers: [
        FreemiumService,
        { provide: HttpClient, useValue: httpClientMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: VocabularyStatsService, useValue: vocabStatsServiceMock },
        { provide: StorageService, useValue: storageServiceMock }
      ]
    });

    service = TestBed.inject(FreemiumService);
  });

  describe('initialization', () => {
    it('should create the service without errors', () => {
      expect(service).toBeTruthy();
      expect(service.isLoadingFreemiumData()).toBeDefined();
    });

    it('should initialize with empty free word maps', () => {
      expect(service['freeWordIdsByCategory']().size).toBe(5);
    });
  });
});
