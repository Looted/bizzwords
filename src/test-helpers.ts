import { vi } from 'vitest';

/**
 * Creates a mock StorageService for use in tests
 */
export function createStorageServiceMock() {
  return {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };
}
