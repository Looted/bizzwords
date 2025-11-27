import { pipeline, env, TextGenerationPipeline, TranslationPipeline, ProgressCallback } from "@huggingface/transformers";

// Skip local model check
env.allowLocalModels = false;

// Extend navigator interface for WebGPU support in web worker
declare global {
    interface Navigator {
        gpu?: {
            requestAdapter(): Promise<any>;
        };
    }
}

// Use the Singleton pattern to enable lazy construction of the pipeline.
export class TextGenerationSingleton {
    static task: any = 'text-generation';
    static model = 'HuggingFaceTB/SmolLM2-360M-Instruct';
    static instance?: TextGenerationPipeline = undefined;

    static async getInstance(progress_callback?: ProgressCallback): Promise<TextGenerationPipeline> {
        if (this.instance === undefined) {
            console.log('Loading AI text generation pipeline in worker...');
            // Check for WebGPU availability, fallback to WASM if not available
            const device = await navigator.gpu?.requestAdapter() ? 'webgpu' : 'wasm';
            const pipelineOptions: any = { device, progress_callback };
            if (device === 'wasm') {
                pipelineOptions.dtype = "q8"; // Use quantized model for better performance on WASM
            } else {
              pipelineOptions.dtype = "fp16"; // Use fp16 for WebGPU
            }
            this.instance = await pipeline<'text-generation'>(this.task, this.model, pipelineOptions);
            console.log('AI text generation pipeline loaded in worker.');
        }
        return this.instance;
    }
}

export class TranslationSingleton {
    static task: any = 'translation';
    static model = 'Xenova/nllb-200-distilled-600M';
    static instance?: TranslationPipeline = undefined;

    static async getInstance(progress_callback?: ProgressCallback): Promise<TranslationPipeline> {
        if (this.instance === undefined) {
            console.log('Loading AI translation pipeline in worker...');
            this.instance = await pipeline<'translation'>(this.task, this.model, { device: 'wasm', progress_callback, dtype: "q8" });
            console.log('AI translation pipeline loaded in worker.');
        }
        return this.instance;
    }
}
