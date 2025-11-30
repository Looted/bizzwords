import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StaticVocabularyService } from './static-vocabulary.service';
import { describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom } from 'rxjs';

describe('StaticVocabularyService', () => {
  let service: StaticVocabularyService;
  let httpMock: HttpTestingController;

  const mockVocabulary = [
    { english: 'hello', polish: 'cześć', difficulty: 1 },
    { english: 'world', polish: 'świat', difficulty: 1 },
    { english: 'computer', polish: 'komputer', difficulty: 2 },
    { english: 'algorithm', polish: 'algorytm', difficulty: 3 },
    { english: 'browser', polish: 'przeglądarka', difficulty: 1 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StaticVocabularyService]
    });
    service = TestBed.inject(StaticVocabularyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('generateWords', () => {
    it('should generate vocabulary words from HTTP response', async () => {
      const resultPromise = firstValueFrom(service.generateWords('HR', 3));

      const req = httpMock.expectOne('hr_eng_pl/vocabulary.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockVocabulary);

      const result = await resultPromise;

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('english');
      expect(result[0]).toHaveProperty('polish');
      expect(result[0]).not.toHaveProperty('difficulty'); // difficulty is filtered out
    });

    it('should filter by difficulty when specified', async () => {
      const resultPromise = firstValueFrom(service.generateWords('HR', 10, 2));

      const req = httpMock.expectOne('hr_eng_pl/vocabulary.json');
      req.flush(mockVocabulary);

      const result = await resultPromise;

      expect(result).toHaveLength(1); // Only one word with difficulty 2
      expect(result[0].english).toBe('computer');
    });

    it('should fall back to all words when no words match difficulty', async () => {
      const resultPromise = firstValueFrom(service.generateWords('HR', 2, 99)); // No words have difficulty 99

      const req = httpMock.expectOne('hr_eng_pl/vocabulary.json');
      req.flush(mockVocabulary);

      const result = await resultPromise;

      expect(result).toHaveLength(2); // Falls back to all words
    });

    it('should limit results to requested count', async () => {
      const resultPromise = firstValueFrom(service.generateWords('HR', 2));

      const req = httpMock.expectOne('hr_eng_pl/vocabulary.json');
      req.flush(mockVocabulary);

      const result = await resultPromise;

      expect(result).toHaveLength(2);
    });

    it('should return all available words when count exceeds total', async () => {
      const resultPromise = firstValueFrom(service.generateWords('HR', 50));

      const req = httpMock.expectOne('hr_eng_pl/vocabulary.json');
      req.flush(mockVocabulary);

      const result = await resultPromise;

      expect(result).toHaveLength(5);
    });

    it('should return words without difficulty property', async () => {
      const resultPromise = firstValueFrom(service.generateWords('HR', 1));

      const req = httpMock.expectOne('hr_eng_pl/vocabulary.json');
      req.flush(mockVocabulary);

      const result = await resultPromise;

      expect(result[0]).toEqual({
        english: expect.any(String),
        polish: expect.any(String)
      });
      expect(result[0]).not.toHaveProperty('difficulty');
    });
  });

  describe('loadVocabulary', () => {
    it('should load vocabulary from JSON file', async () => {
      const resultPromise = firstValueFrom(service.loadVocabulary());

      const req = httpMock.expectOne('hr_eng_pl/vocabulary.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockVocabulary);

      const result = await resultPromise;

      expect(result).toEqual(mockVocabulary);
    });
  });
});
