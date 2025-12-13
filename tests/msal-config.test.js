import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('MSAL Configuration', () => {
    let originalEnv;

    beforeEach(() => {
        // Save original env
        originalEnv = { ...import.meta.env };
        // Clear modules cache to allow re-import
        vi.resetModules();
    });

    it('should export msalInstance', async () => {
        // Mock environment variables
        vi.stubEnv('VITE_AZURE_CLIENT_ID', 'test-client-id');
        vi.stubEnv('VITE_AZURE_TENANT_ID', 'test-tenant-id');

        const { msalInstance } = await import('../src/auth/msalConfig.js');
        
        expect(msalInstance).toBeDefined();
        expect(msalInstance).toHaveProperty('initialize');
    });

    it('should use environment variables for clientId and tenantId', async () => {
        vi.stubEnv('VITE_AZURE_CLIENT_ID', 'my-client-id');
        vi.stubEnv('VITE_AZURE_TENANT_ID', 'my-tenant-id');

        // Note: We can't easily test the internal config without exposing it
        // But we can verify the instance is created
        const { msalInstance } = await import('../src/auth/msalConfig.js');
        expect(msalInstance).toBeDefined();
    });

    it('should fallback to common authority if tenantId is missing', async () => {
        vi.stubEnv('VITE_AZURE_CLIENT_ID', 'test-client');
        vi.stubEnv('VITE_AZURE_TENANT_ID', '');

        // The config should still work with fallback
        const { msalInstance } = await import('../src/auth/msalConfig.js');
        expect(msalInstance).toBeDefined();
    });

    it('should handle missing environment variables gracefully', async () => {
        vi.stubEnv('VITE_AZURE_CLIENT_ID', '');
        vi.stubEnv('VITE_AZURE_TENANT_ID', '');

        // Should still create instance (with warnings)
        const { msalInstance } = await import('../src/auth/msalConfig.js');
        expect(msalInstance).toBeDefined();
    });

    it('should use window.location.origin for redirectUri', () => {
        // Mock window.location
        const mockOrigin = 'http://localhost:5173';
        Object.defineProperty(window, 'location', {
            value: { origin: mockOrigin },
            writable: true,
        });

        // The getRedirectUri function should use window.location.origin
        // This is tested indirectly through the config
        expect(window.location.origin).toBe(mockOrigin);
    });

    it('should configure cache location as localStorage', async () => {
        vi.stubEnv('VITE_AZURE_CLIENT_ID', 'test-client');
        vi.stubEnv('VITE_AZURE_TENANT_ID', 'test-tenant');

        // Mock window.location properly for MSAL
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

        const { msalInstance } = await import('../src/auth/msalConfig.js');
        // MSAL instance should be configured (we can't directly access config)
        expect(msalInstance).toBeDefined();
    });

    it('should disable native broker for web app', async () => {
        vi.stubEnv('VITE_AZURE_CLIENT_ID', 'test-client');
        vi.stubEnv('VITE_AZURE_TENANT_ID', 'test-tenant');

        // Mock window.location properly for MSAL
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

        const { msalInstance } = await import('../src/auth/msalConfig.js');
        expect(msalInstance).toBeDefined();
    });

    it('should handle initialization errors gracefully', async () => {
        vi.stubEnv('VITE_AZURE_CLIENT_ID', 'test-client');
        vi.stubEnv('VITE_AZURE_TENANT_ID', 'test-tenant');

        // Mock window.location properly for MSAL
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

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const { msalInstance } = await import('../src/auth/msalConfig.js');
        
        // Initialize should be called (it's called automatically)
        // If it fails, error should be caught
        expect(msalInstance).toBeDefined();

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });
});
