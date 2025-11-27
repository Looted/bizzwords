import { describe, it, expect } from 'vitest';
import { TextParser, Example } from './text-parser';

describe('TextParser', () => {
  describe('parseExamples', () => {
    it('should parse a single example correctly', () => {
      const input = `Difficulty: beginner
Vocabulary: computer
Sentence: I use a computer every day to complete my tasks.`;

      const result = TextParser.parseExamples(input);

      expect(result).toEqual([
        {
          sentence: 'I use a computer every day to complete my tasks.',
          vocabulary: 'computer',
          difficulty: 'beginner'
        }
      ]);
    });

    it('should parse multiple examples correctly', () => {
      const input = `Difficulty: beginner
Vocabulary: computer
Sentence: I use a computer every day to complete my tasks.

Difficulty: intermediate
Vocabulary: software
Sentence: The software helps me work efficiently and saves time.

Difficulty: beginner
Vocabulary: internet
Sentence: I browse the internet for information and news.`;

      const result = TextParser.parseExamples(input);

      expect(result).toEqual([
        {
          sentence: 'I use a computer every day to complete my tasks.',
          vocabulary: 'computer',
          difficulty: 'beginner'
        },
        {
          sentence: 'The software helps me work efficiently and saves time.',
          vocabulary: 'software',
          difficulty: 'intermediate'
        },
        {
          sentence: 'I browse the internet for information and news.',
          vocabulary: 'internet',
          difficulty: 'beginner'
        }
      ]);
    });

    it('should filter out theme and generate lines', () => {
      const input = `Theme: IT
Generate exactly 2 examples in this format:
Difficulty: beginner
Vocabulary: computer
Sentence: I use a computer every day to complete my tasks.

Difficulty: intermediate
Vocabulary: software
Sentence: The software helps me work efficiently and saves time.`;

      const result = TextParser.parseExamples(input);

      expect(result).toEqual([
        {
          sentence: 'I use a computer every day to complete my tasks.',
          vocabulary: 'computer',
          difficulty: 'beginner'
        },
        {
          sentence: 'The software helps me work efficiently and saves time.',
          vocabulary: 'software',
          difficulty: 'intermediate'
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
      const input = `Difficulty: beginner
Sentence: I use a computer every day to complete my tasks.`;

      const result = TextParser.parseExamples(input);
      expect(result).toEqual([]);
    });

    it('should handle incomplete examples (missing sentence)', () => {
      const input = `Difficulty: beginner
Vocabulary: computer`;

      const result = TextParser.parseExamples(input);
      expect(result).toEqual([]);
    });

    it('should handle incomplete examples (missing difficulty)', () => {
      const input = `Vocabulary: computer
Sentence: I use a computer every day to complete my tasks.`;

      const result = TextParser.parseExamples(input);
      expect(result).toEqual([]);
    });

    it('should trim whitespace from lines', () => {
      const input = `  Difficulty:   beginner
  Vocabulary:   computer
  Sentence:   I use a computer every day to complete my tasks.  `;

      const result = TextParser.parseExamples(input);

      expect(result).toEqual([
        {
          sentence: 'I use a computer every day to complete my tasks.',
          vocabulary: 'computer',
          difficulty: 'beginner'
        }
      ]);
    });

    it('should handle examples with extra whitespace and newlines', () => {
      const input = `

Difficulty: beginner
Vocabulary: computer

Sentence: I use a computer every day to complete my tasks.



Difficulty: intermediate
Vocabulary: software
Sentence: The software helps me work efficiently and saves time.
`;

      const result = TextParser.parseExamples(input);

      expect(result).toEqual([
        {
          sentence: 'I use a computer every day to complete my tasks.',
          vocabulary: 'computer',
          difficulty: 'beginner'
        },
        {
          sentence: 'The software helps me work efficiently and saves time.',
          vocabulary: 'software',
          difficulty: 'intermediate'
        }
      ]);
    });
  });
});
