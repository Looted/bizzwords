import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TextGenerationPipelineFactory, TranslationPipelineFactory } from './ai-pipelines';

// Mock the @huggingface/transformers module
vi.mock('@huggingface/transformers', () => ({
  pipeline: vi.fn(),
  env: {
    allowLocalModels: false
  }
}));

// Mock navigator.gpu for WebGPU availability check
Object.defineProperty(global.navigator, 'gpu', {
  value: {
    requestAdapter: vi.fn().mockResolvedValue({})
  },
  writable: true
});

describe('TextGenerationPipelineFactory', () => {
  beforeEach(() => {
    // Reset the singleton instance before each test
    TextGenerationPipelineFactory.instance = undefined;
  });

  it('should have correct static properties', () => {
    expect(TextGenerationPipelineFactory.task).toBe('text-generation');
    expect(TextGenerationPipelineFactory.model).toBe('HuggingFaceTB/SmolLM2-360M-Instruct');
  });

  it('should return the same instance on multiple calls', async () => {
    const { pipeline } = await import('@huggingface/transformers');
    const mockPipeline = vi.fn().mockResolvedValue('mock-pipeline-instance');

    (pipeline as any).mockImplementation(mockPipeline);

    const instance1 = await TextGenerationPipelineFactory.getInstance();
    const instance2 = await TextGenerationPipelineFactory.getInstance();

    expect(instance1).toBe(instance2);
    expect(instance1).toBe('mock-pipeline-instance');
    expect(mockPipeline).toHaveBeenCalledTimes(1); // Should only create once
  });

  it('should call pipeline with correct parameters', async () => {
    const { pipeline } = await import('@huggingface/transformers');
    const mockPipeline = vi.fn().mockResolvedValue('mock-pipeline-instance');
    const mockProgressCallback = vi.fn();

    (pipeline as any).mockImplementation(mockPipeline);

    await TextGenerationPipelineFactory.getInstance(mockProgressCallback);

    expect(mockPipeline).toHaveBeenCalledWith('text-generation', 'HuggingFaceTB/SmolLM2-360M-Instruct', {
      device: 'webgpu',
      dtype: 'fp16',
      progress_callback: mockProgressCallback
    });
  });
});

describe('TranslationPipelineFactory', () => {
  beforeEach(() => {
    // Reset the singleton instance before each test
    TranslationPipelineFactory.instance = undefined;
  });

  it('should have correct static properties', () => {
    expect(TranslationPipelineFactory.task).toBe('translation');
    expect(TranslationPipelineFactory.model).toBe('Xenova/nllb-200-distilled-600M');
  });

  it('should return the same instance on multiple calls', async () => {
    const { pipeline } = await import('@huggingface/transformers');
    const mockPipeline = vi.fn().mockResolvedValue('mock-translation-instance');

    (pipeline as any).mockImplementation(mockPipeline);

    const instance1 = await TranslationPipelineFactory.getInstance();
    const instance2 = await TranslationPipelineFactory.getInstance();

    expect(instance1).toBe(instance2);
    expect(instance1).toBe('mock-translation-instance');
    expect(mockPipeline).toHaveBeenCalledTimes(1); // Should only create once
  });

  it('should call pipeline with correct parameters', async () => {
    const { pipeline } = await import('@huggingface/transformers');
    const mockPipeline = vi.fn().mockResolvedValue('mock-translation-instance');
    const mockProgressCallback = vi.fn();

    (pipeline as any).mockImplementation(mockPipeline);

    await TranslationPipelineFactory.getInstance(mockProgressCallback);

    expect(mockPipeline).toHaveBeenCalledWith('translation', 'Xenova/nllb-200-distilled-600M', {
      device: 'wasm',
      progress_callback: mockProgressCallback,
      dtype: "q8"
    });
  });
});
