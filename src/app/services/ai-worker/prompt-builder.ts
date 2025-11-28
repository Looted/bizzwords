export class PromptBuilder {
  private static readonly difficultyMap: { [key: number]: string } = {
    1: 'beginner',
    2: 'intermediate',
    3: 'advanced'
  };

  static buildPrompt(theme: string, count: number, difficulty?: number | null): any[] {
    const difficultyInstruction = difficulty
      ? `Generate words at ${this.difficultyMap[difficulty]} difficulty level only.`
      : 'Include a mix of difficulty levels: beginner, intermediate, and advanced words.';

    const prompt = `Generate exactly ${count} vocabulary learning examples for the theme "${theme}".
${difficultyInstruction}
Crucial: The 'Sentence' must clearly demonstrate the meaning of the 'Vocabulary' word. The 'Vocabulary' word should be exactly a single word or phrase, not multiple words after commas.

Format (repeat exactly for each example):
Difficulty: [beginner/intermediate/advanced]
Vocabulary: [vocabulary word]
Sentence: [complete sentence using the vocabulary word in context]

Examples:
Difficulty: beginner
Vocabulary: computer
Sentence: I use my computer every day for work.

Difficulty: intermediate
Vocabulary: algorithm
Sentence: The programmer wrote an efficient algorithm to solve the problem.

Difficulty: advanced
Vocabulary: virtualization
Sentence: Server virtualization allows multiple operating systems to run on a single physical machine.

Now generate exactly ${count} examples for theme "${theme}"${difficulty ? ` at ${this.difficultyMap[difficulty]} level` : ' with a balanced mix of difficulty levels'}:`;

    return [
      { role: "system", content: "You are an expert English teacher. Generate clear, context-rich vocabulary examples." },
      { role: "user", content: prompt }
    ];
  }
}
