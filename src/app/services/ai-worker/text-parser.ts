export interface Example {
    sentence: string;
    vocabulary: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export class TextParser {
    static parseExamples(generatedText: string): Example[] {
        const examples: Example[] = [];
        const lines = generatedText.split('\n').map((line: string) => line.trim()).filter((line: string) => line && !line.startsWith('Theme:') && !line.includes('Generate'));

        let currentExample: { sentence?: string, vocabulary?: string, difficulty?: 'beginner' | 'intermediate' | 'advanced' } = {};

        for (const line of lines) {
            if (line.startsWith('Difficulty:')) {
                // Start new example if we have a complete previous one
                if (currentExample.sentence && currentExample.vocabulary && currentExample.difficulty) {
                    examples.push({
                        sentence: currentExample.sentence,
                        vocabulary: currentExample.vocabulary,
                        difficulty: currentExample.difficulty
                    });
                }
                const difficultyValue = line.substring(11).trim().toLowerCase();
                currentExample = {
                    difficulty: difficultyValue as 'beginner' | 'intermediate' | 'advanced'
                };
            } else if (line.startsWith('Vocabulary:')) {
                currentExample.vocabulary = line.substring(11).trim();
            } else if (line.startsWith('Sentence:')) {
                currentExample.sentence = line.substring(9).trim();
                // Add example when sentence is found (assuming all fields are present)
                if (currentExample.vocabulary && currentExample.difficulty) {
                    examples.push({
                        sentence: currentExample.sentence,
                        vocabulary: currentExample.vocabulary,
                        difficulty: currentExample.difficulty
                    });
                    currentExample = {};
                }
            }
        }

        return examples;
    }
}
