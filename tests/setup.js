import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock window.location with full URL structure
Object.defineProperty(window, 'location', {
    value: {
        origin: 'http://localhost:5173',
        href: 'http://localhost:5173',
        protocol: 'http:',
        host: 'localhost:5173',
        hostname: 'localhost',
        port: '5173',
        pathname: '/',
        search: '',
        hash: '',
    },
    writable: true,
});

// Mock console methods to avoid noise in tests
import { vi } from 'vitest';

global.console = {
    ...console,
    warn: vi.fn(),
    error: vi.fn(),
};
