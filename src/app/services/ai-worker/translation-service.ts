import { TranslationPipelineFactory } from './ai-pipelines';
import { Example } from './text-parser';

export class TranslationService {
  private static readonly SEPARATOR = " === ";

  static async translateExamples(examples: Example[], count: number, progressCallback: (x: any) => void): Promise<Array<{ english: string, polish: string, difficulty: 'beginner' | 'intermediate' | 'advanced' }>> {
    const translator = await TranslationPipelineFactory.getInstance(progressCallback);
    const pairs: { english: string, polish: string, difficulty: 'beginner' | 'intermediate' | 'advanced' }[] = [];

    for (const example of examples.slice(0, count)) {
      try {
        console.log(`Translating with context: "${example.vocabulary}"`);

        // Context Injection: "Sentence === Word"
        const inputWithContext = `${example.sentence}${this.SEPARATOR}${example.vocabulary}`;

        const translationResult = await translator(inputWithContext, {
          src_lang: 'eng_Latn',
          tgt_lang: 'pol_Latn'
        } as any);

        const fullTranslatedText = (translationResult as any)[0]?.translation_text;
        let polishWord = '';

        if (fullTranslatedText && fullTranslatedText.includes('===')) {
          const parts = fullTranslatedText.split('===');
          polishWord = parts[parts.length - 1].trim();
          polishWord = polishWord.replace(/[.,;!?]+$/, '');
        } else {
          console.warn('Separator lost in translation, retrying single word...');
          const retryResult = await translator(example.vocabulary, {
            src_lang: 'eng_Latn',
            tgt_lang: 'pol_Latn'
          } as any);
          polishWord = (retryResult as any)[0]?.translation_text;
        }

        if (polishWord) {
          polishWord = polishWord.toLowerCase();
          pairs.push({
            english: example.vocabulary,
            polish: polishWord,
            difficulty: example.difficulty
          });
          console.log(`Contextual success: "${example.vocabulary}" (Context: ${example.sentence}) -> "${polishWord}"`);
        } else {
          throw new Error("Empty translation");
        }

      } catch (translationError) {
        console.error(`Translation failed for "${example.vocabulary}":`, translationError);
        pairs.push({
          english: example.vocabulary,
          polish: example.vocabulary, // Fallback
          difficulty: example.difficulty
        });
      }
    }

    return pairs;
  }
}
