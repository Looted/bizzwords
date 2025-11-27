import { pipeline, env, TextGenerationPipeline, TranslationPipeline } from "@huggingface/transformers";

// Skip local model check
env.allowLocalModels = false;

// Use the Singleton pattern to enable lazy construction of the pipeline.
class TextGenerationSingleton {
    static task: any = 'text-generation';
    static model = 'onnx-community/granite-4.0-micro-ONNX-web';
    static instance?: TextGenerationPipeline = undefined;

  static async getInstance(progress_callback?: (x: any) => void): Promise<TextGenerationPipeline> {
    if (this.instance === undefined) {
      console.log('Loading AI text generation pipeline in worker...');
      this.instance = await pipeline<'text-generation'>(this.task, this.model, { device: 'webgpu', progress_callback, dtype: "q4f16" });
      console.log('AI text generation pipeline loaded in worker.');
    }
    return this.instance;
  }
}

class TranslationSingleton {
    static task: any = 'translation';
    static model = 'Xenova/nllb-200-distilled-600M';
    static instance?: TranslationPipeline = undefined;

  static async getInstance(progress_callback?: (x: any) => void): Promise<TranslationPipeline> {
    if (this.instance === undefined) {
      console.log('Loading AI translation pipeline in worker...');
      this.instance = await pipeline<'translation'>(this.task, this.model, { device: 'wasm', progress_callback, dtype: "q8" });
      console.log('AI translation pipeline loaded in worker.');
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {

  console.log('Worker handling AI word generation message');

  // Generate words based on the request
  console.log('Worker received request:', JSON.stringify(event.data));
  const { theme, count } = event.data;

  try {
    // Step 1: Generate English words only
    const generator = await TextGenerationSingleton.getInstance((x: any) => {
      // Forward progress updates to the main thread
      self.postMessage({ ...x, step: 'generating' });
    });

    const prompt = `Generate ${count} vocabulary learning examples for the theme "${theme}". Each example should be a short dialogue or scene that clearly identifies the vocabulary word to learn.

Format each example as:
Scene: [brief description of the scene]
Sentence: [complete sentence using the vocabulary word]
Vocabulary: [the specific word/phrase to learn]

Examples for theme "IT":
Scene: Office worker explaining daily routine
Sentence: I use a computer every day to complete my tasks.
Vocabulary: computer

Scene: Developer discussing productivity tools
Sentence: The software helps me work efficiently and saves time.
Vocabulary: software

Scene: Student researching online
Sentence: I browse the internet for information and news.
Vocabulary: internet

Scene: Database administrator explaining data storage
Sentence: The database stores important data securely.
Vocabulary: database

Theme: ${theme}
Generate exactly ${count} examples in this format:`;

    const messages = [
      { role: "system", content: "You are a helpful assistant that generates common English words for language learning themes. Generate appropriate vocabulary." },
      { role: "user", content: prompt }
    ];

    const output = await generator(messages, {
      max_new_tokens: 300,
      temperature: 0.7,
      do_sample: true
    });

    console.log('Raw English sentences response:', JSON.stringify(output));

    // Extract English examples with vocabulary words
    const generatedText = (output as any)[0].generated_text.at(-1).content;
    console.log('Generated English text to parse:', JSON.stringify(generatedText));

    const examples: { sentence: string, vocabulary: string }[] = [];
    const lines = generatedText.split('\n').map((line: string) => line.trim()).filter((line: string) => line && !line.startsWith('Theme:') && !line.includes('Generate'));

    let currentExample: { scene?: string, sentence?: string, vocabulary?: string } = {};

    for (const line of lines) {
      if (line.startsWith('Scene:')) {
        // Start new example
        if (currentExample.sentence && currentExample.vocabulary) {
          examples.push({ sentence: currentExample.sentence, vocabulary: currentExample.vocabulary });
        }
        currentExample = { scene: line.substring(6).trim() };
      } else if (line.startsWith('Sentence:')) {
        currentExample.sentence = line.substring(9).trim();
      } else if (line.startsWith('Vocabulary:')) {
        currentExample.vocabulary = line.substring(11).trim();
      }
    }

    // Add the last example
    if (currentExample.sentence && currentExample.vocabulary) {
      examples.push({ sentence: currentExample.sentence, vocabulary: currentExample.vocabulary });
    }

    console.log('Extracted examples:', JSON.stringify(examples));

    // Step 2: Translate vocabulary words directly
    const translator = await TranslationSingleton.getInstance((x: any) => {
      // Forward progress updates to the main thread
      self.postMessage({ ...x, step: 'translating' });
    });

    const pairs: {english: string, polish: string}[] = [];

    for (const example of examples.slice(0, count)) {
      try {
        console.log(`Translating vocabulary word: "${example.vocabulary}" from sentence: "${example.sentence}"`);

        // Translate the vocabulary word directly
        const translationResult = await translator(example.vocabulary, {
          src_lang: 'eng_Latn',
          tgt_lang: 'pol_Latn'
        } as any);

        console.log('Translation result:', JSON.stringify(translationResult));

        const polishWord = (translationResult as any)[0]?.translation_text;
        if (polishWord) {
          pairs.push({
            english: example.vocabulary,
            polish: polishWord
          });

          console.log(`Translated pair: "${example.vocabulary}" -> "${polishWord}"`);
        } else {
          console.error(`Failed to translate vocabulary: "${example.vocabulary}"`);
          // Fallback: keep original word
          pairs.push({
            english: example.vocabulary,
            polish: example.vocabulary
          });
        }

      } catch (translationError) {
        console.error(`Failed to translate vocabulary "${example.vocabulary}":`, translationError);
        // Fallback: keep original word
        pairs.push({
          english: example.vocabulary,
          polish: example.vocabulary
        });
      }
    }

    // Send the output back to the main thread
    console.log('Final word pairs:', JSON.stringify(pairs));
    const finalMessage = {
      status: 'complete',
      pairs: pairs
    };
    console.log('Sending final message to main thread:', JSON.stringify(finalMessage));
    self.postMessage(finalMessage);

  } catch (error) {
    console.error('Worker error:', error);
    self.postMessage({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
