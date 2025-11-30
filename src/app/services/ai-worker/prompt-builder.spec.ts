import { describe, it, expect } from 'vitest';
import { PromptBuilder } from './prompt-builder';

describe('Prompt Builder', () => {
  it('should build prompt for theme', () => {
    const result = PromptBuilder.buildPrompt('IT', 3);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      role: 'system',
      content: expect.stringContaining('expert English teacher')
    });
    expect(result[1]).toMatchObject({
      role: 'user',
      content: expect.stringContaining('Generate exactly 3 vocabulary learning examples')
    });
  });

  it('should include difficulty levels in prompt when no specific difficulty set', () => {
    const result = PromptBuilder.buildPrompt('Tech', 2);

    expect(result[1].content).toContain('beginner');
    expect(result[1].content).toContain('intermediate');
    expect(result[1].content).toContain('advanced');
  });

  it('should specify requested count in prompt', () => {
    const result = PromptBuilder.buildPrompt('General', 5);

    expect(result[1].content).toContain('Generate exactly 5 vocabulary learning examples');
  });

  it('should include theme in prompt', () => {
    const result = PromptBuilder.buildPrompt('Housing', 1);

    expect(result[1].content).toContain('Housing');
  });

  it('should handle specific difficulty level', () => {
    const result = PromptBuilder.buildPrompt('Tech', 2, 1); // 1 = beginner

    expect(result[1].content).toContain('Generate words at beginner difficulty level');
    expect(result[1].content).toContain('at beginner level');
    expect(result[1].content).not.toContain('balanced mix of difficulty levels');
  });

  it('should handle different difficulty levels', () => {
    const result = PromptBuilder.buildPrompt('Advanced', 3, 3); // 3 = advanced

    expect(result[1].content).toContain('Generate words at advanced difficulty level');
    expect(result[1].content).toContain('at advanced level');
  });

  it('should include system message', () => {
    const result = PromptBuilder.buildPrompt('Any', 1);

    expect(result[0].role).toBe('system');
    expect(result[0].content).toBe('You are an expert English teacher. Generate clear, context-rich vocabulary examples.');
  });

  it('should return array with two messages', () => {
    const result = PromptBuilder.buildPrompt('Test', 4);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('role');
    expect(result[0]).toHaveProperty('content');
    expect(result[1]).toHaveProperty('role');
    expect(result[1]).toHaveProperty('content');
  });

  it('should include examples with specific format in prompt', () => {
    const result = PromptBuilder.buildPrompt('Sample', 1);

    expect(result[1].content).toMatch(/Difficulty: \[beginner\/intermediate\/advanced\]/);
    expect(result[1].content).toMatch(/Vocabulary: \[vocabulary word\]/);
    expect(result[1].content).toMatch(/Sentence: \[complete sentence/);
  });

  it('should specify count correctly for different values', () => {
    const result1 = PromptBuilder.buildPrompt('Theme', 1);
    const result10 = PromptBuilder.buildPrompt('Theme', 10);

    expect(result1[1].content).toContain('exactly 1 vocabulary learning example');
    expect(result10[1].content).toContain('exactly 10 vocabulary learning examples');
  });
});
