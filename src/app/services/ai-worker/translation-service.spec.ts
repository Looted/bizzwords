import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TranslationService } from './translation-service';
import { Example } from './text-parser';
import { TranslationPipelineFactory } from './ai-pipelines';
import { pipeline } from '@huggingface/transformers';

// Mock the @huggingface/transformers module
vi.mock('@huggingface/transformers', () => ({
  pipeline: vi.fn(),
  env: {
    allowLocalModels: false
  }
}));

describe('TranslationService', () => {
  let mockTranslator: any;
  let mockProgressCallback: any;

  beforeEach(() => {
    // Reset the singleton instance
    TranslationPipelineFactory.instance = undefined;

    mockTranslator = vi.fn();
    mockProgressCallback = vi.fn();

    // Mock the pipeline function to return our mock translator
    (vi.mocked(pipeline) as any).mockResolvedValue(mockTranslator);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('translateExamples', () => {
    it('should translate examples successfully with context', async () => {
      const examples: Example[] = [
        {
          sentence: 'I need to buy some milk.',
          vocabulary: 'milk',
          difficulty: 'beginner'
        }
      ];

      mockTranslator.mockResolvedValue([
        { translation_text: 'Potrzebuję kupić trochę mleka. === mleko' }
      ]);

      const result = await TranslationService.translateExamples(examples, 1, mockProgressCallback);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        english: 'milk',
        polish: 'mleko',
        difficulty: 'beginner'
      });
      expect(mockTranslator).toHaveBeenCalledWith('I need to buy some milk. === milk', {
        src_lang: 'eng_Latn',
        tgt_lang: 'pol_Latn'
      });
    });

    it('should handle multiple examples', async () => {
      const examples: Example[] = [
        {
          sentence: 'The cat is sleeping.',
          vocabulary: 'cat',
          difficulty: 'beginner'
        },
        {
          sentence: 'I love programming.',
          vocabulary: 'programming',
          difficulty: 'intermediate'
        }
      ];

      mockTranslator
        .mockResolvedValueOnce([{ translation_text: 'Kot śpi. === kot' }])
        .mockResolvedValueOnce([{ translation_text: 'Kocham programowanie. === programowanie' }]);

      const result = await TranslationService.translateExamples(examples, 2, mockProgressCallback);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        english: 'cat',
        polish: 'kot',
        difficulty: 'beginner'
      });
      expect(result[1]).toEqual({
        english: 'programming',
        polish: 'programowanie',
        difficulty: 'intermediate'
      });
    });

    it('should limit examples by count parameter', async () => {
      const examples: Example[] = [
        {
          sentence: 'Hello world.',
          vocabulary: 'hello',
          difficulty: 'beginner'
        },
        {
          sentence: 'Goodbye world.',
          vocabulary: 'goodbye',
          difficulty: 'beginner'
        },
        {
          sentence: 'Thank you.',
          vocabulary: 'thank',
          difficulty: 'beginner'
        }
      ];

      mockTranslator.mockResolvedValue([{ translation_text: 'Cześć świecie. === cześć' }]);

      const result = await TranslationService.translateExamples(examples, 1, mockProgressCallback);

      expect(result).toHaveLength(1);
      expect(result[0].english).toBe('hello');
      expect(mockTranslator).toHaveBeenCalledTimes(1);
    });

    it('should retry with single word when separator is lost', async () => {
      const examples: Example[] = [
        {
          sentence: 'The weather is nice.',
          vocabulary: 'weather',
          difficulty: 'intermediate'
        }
      ];

      mockTranslator
        .mockResolvedValueOnce([{ translation_text: 'Pogoda jest ładna.' }]) // No separator
        .mockResolvedValueOnce([{ translation_text: 'pogoda' }]); // Retry result

      const result = await TranslationService.translateExamples(examples, 1, mockProgressCallback);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        english: 'weather',
        polish: 'pogoda',
        difficulty: 'intermediate'
      });
      expect(mockTranslator).toHaveBeenCalledTimes(2);
      expect(mockTranslator).toHaveBeenNthCalledWith(1, 'The weather is nice. === weather', {
        src_lang: 'eng_Latn',
        tgt_lang: 'pol_Latn'
      });
      expect(mockTranslator).toHaveBeenNthCalledWith(2, 'weather', {
        src_lang: 'eng_Latn',
        tgt_lang: 'pol_Latn'
      });
    });

    it('should convert polish translation to lowercase', async () => {
      const examples: Example[] = [
        {
          sentence: 'I see a Dog.',
          vocabulary: 'Dog',
          difficulty: 'beginner'
        }
      ];

      mockTranslator.mockResolvedValue([
        { translation_text: 'Widzę Psa. === Pies' }
      ]);

      const result = await TranslationService.translateExamples(examples, 1, mockProgressCallback);

      expect(result[0].polish).toBe('pies');
    });

    it('should remove punctuation from end of polish word', async () => {
      const examples: Example[] = [
        {
          sentence: 'What is this?',
          vocabulary: 'this',
          difficulty: 'beginner'
        }
      ];

      mockTranslator.mockResolvedValue([
        { translation_text: 'Co to jest? === to.' }
      ]);

      const result = await TranslationService.translateExamples(examples, 1, mockProgressCallback);

      expect(result[0].polish).toBe('to');
    });

    it('should handle translation failure and use fallback', async () => {
      const examples: Example[] = [
        {
          sentence: 'Complex sentence.',
          vocabulary: 'complex',
          difficulty: 'advanced'
        }
      ];

      mockTranslator.mockRejectedValue(new Error('Translation failed'));

      const result = await TranslationService.translateExamples(examples, 1, mockProgressCallback);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        english: 'complex',
        polish: 'complex', // Fallback to original
        difficulty: 'advanced'
      });
    });

    it('should handle empty translation result', async () => {
      const examples: Example[] = [
        {
          sentence: 'Test sentence.',
          vocabulary: 'test',
          difficulty: 'beginner'
        }
      ];

      mockTranslator.mockResolvedValue([{ translation_text: '' }]);

      const result = await TranslationService.translateExamples(examples, 1, mockProgressCallback);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        english: 'test',
        polish: 'test', // Fallback to original
        difficulty: 'beginner'
      });
    });

    it('should handle missing translation_text property', async () => {
      const examples: Example[] = [
        {
          sentence: 'Another test.',
          vocabulary: 'another',
          difficulty: 'intermediate'
        }
      ];

      mockTranslator.mockResolvedValue([{}]);

      const result = await TranslationService.translateExamples(examples, 1, mockProgressCallback);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        english: 'another',
        polish: 'another', // Fallback to original
        difficulty: 'intermediate'
      });
    });

    it('should pass progress callback to TranslationPipelineFactory', async () => {
      const examples: Example[] = [
        {
          sentence: 'Progress test.',
          vocabulary: 'progress',
          difficulty: 'beginner'
        }
      ];

      mockTranslator.mockResolvedValue([{ translation_text: 'Test postępu. === postęp' }]);

      // We need to spy on the factory method
      const factorySpy = vi.spyOn(TranslationPipelineFactory, 'getInstance');

      await TranslationService.translateExamples(examples, 1, mockProgressCallback);

      expect(factorySpy).toHaveBeenCalledWith(mockProgressCallback);
    });

    it('should handle multiple separator occurrences and use last part', async () => {
      const examples: Example[] = [
        {
          sentence: 'Test === multiple === separators.',
          vocabulary: 'separators',
          difficulty: 'advanced'
        }
      ];

      mockTranslator.mockResolvedValue([
        { translation_text: 'Test === wielokrotne === separatory. === separatory' }
      ]);

      const result = await TranslationService.translateExamples(examples, 1, mockProgressCallback);

      expect(result[0].polish).toBe('separatory');
    });
  });
});
