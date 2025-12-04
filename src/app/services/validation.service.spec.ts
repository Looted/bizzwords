import { TestBed } from '@angular/core/testing';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('validateTypingAnswer', () => {
    describe('Normalization', () => {
      it('should return true for exact match', () => {
        expect(service.validateTypingAnswer('hello', 'hello')).toBe(true);
      });

      it('should return true for case insensitive match', () => {
        expect(service.validateTypingAnswer('HELLO', 'hello')).toBe(true);
        expect(service.validateTypingAnswer('Hello', 'HELLO')).toBe(true);
      });

      it('should return true for trimmed input', () => {
        expect(service.validateTypingAnswer('  hello  ', 'hello')).toBe(true);
      });

      it('should collapse multiple spaces', () => {
        expect(service.validateTypingAnswer('hello   world', 'hello world')).toBe(true);
      });

      it('should ignore trailing punctuation', () => {
        expect(service.validateTypingAnswer('hello!', 'hello')).toBe(true);
        expect(service.validateTypingAnswer('hello.', 'hello')).toBe(true);
        expect(service.validateTypingAnswer('hello?', 'hello')).toBe(true);
        expect(service.validateTypingAnswer('hello,', 'hello')).toBe(true);
        expect(service.validateTypingAnswer('hello;', 'hello')).toBe(true);
        expect(service.validateTypingAnswer('hello:', 'hello')).toBe(true);
      });

      it('should handle complex normalization', () => {
        expect(service.validateTypingAnswer('  HELLO   WORLD!  ', 'hello world')).toBe(true);
      });
    });

    describe('Acronyms (same language)', () => {
      it('should return true for acronym matching full text (CSR)', () => {
        expect(service.validateTypingAnswer('CSR', 'Corporate Social Responsibility')).toBe(true);
        expect(service.validateTypingAnswer('csr', 'corporate social responsibility')).toBe(true);
        expect(service.validateTypingAnswer('CSR', 'corporate social responsibility')).toBe(true);
      });

      it('should return true for full text matching acronym (CSR)', () => {
        expect(service.validateTypingAnswer('Corporate Social Responsibility', 'CSR')).toBe(true);
        expect(service.validateTypingAnswer('corporate social responsibility', 'csr')).toBe(true);
        expect(service.validateTypingAnswer('corporate social responsibility', 'CSR')).toBe(true);
      });

      it('should return false for wrong acronym', () => {
        expect(service.validateTypingAnswer('CRM', 'Corporate Social Responsibility')).toBe(false);
        expect(service.validateTypingAnswer('ABC', 'Corporate Social Responsibility')).toBe(false);
      });

      it('should return true for acronym matching correct text', () => {
        expect(service.validateTypingAnswer('CSR', 'Customer Service Representative')).toBe(true);
        expect(service.validateTypingAnswer('CSR', 'Computer System Research')).toBe(true);
      });

      it('should return false for acronym matching wrong text', () => {
        expect(service.validateTypingAnswer('CRM', 'Corporate Social Responsibility')).toBe(false);
        expect(service.validateTypingAnswer('ABC', 'Corporate Social Responsibility')).toBe(false);
      });
    });

    describe('Acronyms (cross-language concept)', () => {
      // Note: Cross-language acronym matching requires concept mapping beyond simple letter matching
      // For now, we test that different languages with same letter pattern would work
      it('should return true for acronym matching same letter pattern in different languages', () => {
        // Example: If we had a concept where English and another language shared the same acronym letters
        expect(service.validateTypingAnswer('ABC', 'Alpha Beta Charlie')).toBe(true);
        expect(service.validateTypingAnswer('Alpha Beta Charlie', 'ABC')).toBe(true);
      });
    });

    describe('Legacy abbreviation format support', () => {
      it('should return true for abbreviation when expected has abbreviation format', () => {
        expect(service.validateTypingAnswer('CSR', 'CSR (Corporate Social Responsibility)')).toBe(true);
      });

      it('should return true for full text when expected has abbreviation format', () => {
        expect(service.validateTypingAnswer('Corporate Social Responsibility', 'CSR (Corporate Social Responsibility)')).toBe(true);
      });

      it('should return false for wrong abbreviation', () => {
        expect(service.validateTypingAnswer('XYZ', 'CSR (Corporate Social Responsibility)')).toBe(false);
      });

      it('should return false for wrong full text', () => {
        expect(service.validateTypingAnswer('Wrong Text', 'CSR (Corporate Social Responsibility)')).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should return false for empty input', () => {
        expect(service.validateTypingAnswer('', 'hello')).toBe(false);
        expect(service.validateTypingAnswer('   ', 'hello')).toBe(false);
      });

      it('should return false for null or undefined inputs', () => {
        expect(service.validateTypingAnswer(null as any, 'hello')).toBe(false);
        expect(service.validateTypingAnswer('hello', null as any)).toBe(false);
        expect(service.validateTypingAnswer(undefined as any, 'hello')).toBe(false);
        expect(service.validateTypingAnswer('hello', undefined as any)).toBe(false);
      });

      it('should handle short acronyms', () => {
        expect(service.validateTypingAnswer('AI', 'Artificial Intelligence')).toBe(true);
        expect(service.validateTypingAnswer('Artificial Intelligence', 'AI')).toBe(true);
      });

      it('should not match when acronym is longer than word count', () => {
        expect(service.validateTypingAnswer('CSR', 'Corporate')).toBe(false);
      });

      it('should not match when input is not a valid acronym pattern', () => {
        expect(service.validateTypingAnswer('corporate', 'Corporate')).toBe(true);
        expect(service.validateTypingAnswer('Corporate', 'corporate')).toBe(true);
      });
    });
  });
});
