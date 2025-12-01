// Test setup file for Vitest
import { vi } from 'vitest';

// Mock global objects that might be needed in tests
global.self = global.self || {};

// Mock Worker API for tests
; (global as any).Worker = vi.fn().mockImplementation(function () {
  return {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
});
