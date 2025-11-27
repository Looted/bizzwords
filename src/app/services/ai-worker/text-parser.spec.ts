import { describe, it, expect } from 'vitest';
import { TextParser, Example } from './text-parser';

describe('TextParser', () => {
  describe('parseExamples', () => {
    it('should parse a single example correctly', () => {
      const input = `Vocabulary: computer
Sentence: I use a computer every day to complete my tasks.`;

      const result = TextParser.parseExamples(input);

      expect(result).toEqual([
        {
          sentence: 'I use a computer every day to complete my tasks.',
          vocabulary: 'computer'
        }
      ]);
    });

    it('should parse multiple examples correctly', () => {
      const input = `Vocabulary: computer
Sentence: I use a computer every day to complete my tasks.

Vocabulary: software
Sentence: The software helps me work efficiently and saves time.

Vocabulary: internet
Sentence: I browse the internet for information and news.`;

      const result = TextParser.parseExamples(input);

      expect(result).toEqual([
        {
          sentence: 'I use a computer every day to complete my tasks.',
          vocabulary: 'computer'
        },
        {
          sentence: 'The software helps me work efficiently and saves time.',
          vocabulary: 'software'
        },
        {
          sentence: 'I browse the internet for information and news.',
          vocabulary: 'internet'
        }
      ]);
    });

    it('should filter out theme and generate lines', () => {
      const input = `Theme: IT
Generate exactly 2 examples in this format:
Vocabulary: computer
Sentence: I use a computer every day to complete my tasks.

Vocabulary: software
Sentence: The software helps me work efficiently and saves time.`;

      const result = TextParser.parseExamples(input);

      expect(result).toEqual([
        {
          sentence: 'I use a computer every day to complete my tasks.',
          vocabulary: 'computer'
        },
        {
          sentence: 'The software helps me work efficiently and saves time.',
          vocabulary: 'software'
        }
      ]);
    });

    it('should handle empty input', () => {
      const result = TextParser.parseExamples('');
      expect(result).toEqual([]);
    });

    it('should handle input with only filtered lines', () => {
      const input = `Theme: IT
Generate exactly 2 examples in this format:`;

      const result = TextParser.parseExamples(input);
      expect(result).toEqual([]);
    });

    it('should handle incomplete examples (missing vocabulary)', () => {
      const input = `Sentence: I use a computer every day to complete my tasks.`;

      const result = TextParser.parseExamples(input);
      expect(result).toEqual([]);
    });

    it('should handle incomplete examples (missing sentence)', () => {
      const input = `Vocabulary: computer`;

      const result = TextParser.parseExamples(input);
      expect(result).toEqual([]);
    });

    it('should trim whitespace from lines', () => {
      const input = `  Vocabulary:   computer
  Sentence:   I use a computer every day to complete my tasks.  `;

      const result = TextParser.parseExamples(input);

      expect(result).toEqual([
        {
          sentence: 'I use a computer every day to complete my tasks.',
          vocabulary: 'computer'
        }
      ]);
    });

    it('should handle examples with extra whitespace and newlines', () => {
      const input = `

Vocabulary: computer

Sentence: I use a computer every day to complete my tasks.



Vocabulary: software
Sentence: The software helps me work efficiently and saves time.
`;

      const result = TextParser.parseExamples(input);

      expect(result).toEqual([
        {
          sentence: 'I use a computer every day to complete my tasks.',
          vocabulary: 'computer'
        },
        {
          sentence: 'The software helps me work efficiently and saves time.',
          vocabulary: 'software'
        }
      ]);
    });
  });
});
