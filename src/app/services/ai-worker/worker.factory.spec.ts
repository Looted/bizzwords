import { describe, it, expect, vi } from 'vitest';

// Mock the Worker constructor
const mockWorker = vi.fn().mockImplementation(function () {
  return {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
});
global.Worker = mockWorker;

describe('Worker Factory', () => {
  let createAiWorker: any;

  beforeAll(async () => {
    // Import the factory function
    const factory = await import('./worker.factory');
    createAiWorker = factory.createAiWorker;
  });

  it('should create a new Worker instance', () => {
    // Mock the Worker constructor to return a mock worker
    const mockWorkerInstance = { postMessage: vi.fn(), terminate: vi.fn() };
    mockWorker.mockImplementation(function () { return mockWorkerInstance; });

    const worker = createAiWorker();

    expect(mockWorker).toHaveBeenCalledWith(expect.any(URL), { type: 'module' });
    expect(worker).toBe(mockWorkerInstance);
  });

  it('should create worker with correct path', () => {
    const mockWorkerInstance = { postMessage: vi.fn(), terminate: vi.fn() };
    mockWorker.mockImplementation(function () { return mockWorkerInstance; });

    createAiWorker();

    expect(mockWorker).toHaveBeenCalledWith(expect.any(URL), { type: 'module' });
  });

  it('should return a worker-like object with expected methods', () => {
    const expectedMethods = ['postMessage', 'terminate', 'addEventListener', 'removeEventListener'];
    const mockWorkerInstance = expectedMethods.reduce((acc, method) => {
      acc[method] = vi.fn();
      return acc;
    }, {} as any);

    mockWorker.mockImplementation(function () { return mockWorkerInstance; });

    const worker = createAiWorker();

    expectedMethods.forEach(method => {
      expect(typeof worker[method]).toBe('function');
    });
  });
});
