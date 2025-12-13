import { describe, it, expect } from 'vitest';
import {
    validateUserDomain,
    getUserDisplayName,
    isUserCancelledError,
    isInteractionRequiredError,
    isNetworkError,
    getAuthErrorMessage,
    validateMsalConfig,
} from '../src/utils/auth-helpers';

describe('Authentication Helpers', () => {
    describe('validateUserDomain', () => {
        it('should return true if no allowed domains specified', () => {
            const user = { username: 'user@example.com' };
            expect(validateUserDomain(user, [])).toBe(true);
            expect(validateUserDomain(user, null)).toBe(true);
            expect(validateUserDomain(user, undefined)).toBe(true);
        });

        it('should return true for allowed HPT domains', () => {
            const allowedDomains = ['@hpt.vn', '@hpt.com.vn'];
            const user1 = { username: 'user@hpt.vn' };
            const user2 = { email: 'user@hpt.com.vn' };
            const user3 = { mail: 'user@hpt.vn' };

            expect(validateUserDomain(user1, allowedDomains)).toBe(true);
            expect(validateUserDomain(user2, allowedDomains)).toBe(true);
            expect(validateUserDomain(user3, allowedDomains)).toBe(true);
        });

        it('should return false for non-allowed domains', () => {
            const allowedDomains = ['@hpt.vn', '@hpt.com.vn'];
            const user1 = { username: 'user@example.com' };
            const user2 = { email: 'user@gmail.com' };

            expect(validateUserDomain(user1, allowedDomains)).toBe(false);
            expect(validateUserDomain(user2, allowedDomains)).toBe(false);
        });

        it('should be case insensitive', () => {
            const allowedDomains = ['@hpt.vn'];
            const user1 = { username: 'user@HPT.VN' };
            const user2 = { email: 'user@Hpt.Vn' };

            expect(validateUserDomain(user1, allowedDomains)).toBe(true);
            expect(validateUserDomain(user2, allowedDomains)).toBe(true);
        });

        it('should return false if user is null or undefined', () => {
            const allowedDomains = ['@hpt.vn'];
            expect(validateUserDomain(null, allowedDomains)).toBe(false);
            expect(validateUserDomain(undefined, allowedDomains)).toBe(false);
        });

        it('should return false if user has no email', () => {
            const allowedDomains = ['@hpt.vn'];
            const user = { name: 'John Doe' };
            expect(validateUserDomain(user, allowedDomains)).toBe(false);
        });
    });

    describe('getUserDisplayName', () => {
        it('should return name if available', () => {
            const account = { name: 'John Doe' };
            expect(getUserDisplayName(account)).toBe('John Doe');
        });

        it('should return displayName if name not available', () => {
            const account = { displayName: 'John D.' };
            expect(getUserDisplayName(account)).toBe('John D.');
        });

        it('should return username if name/displayName not available', () => {
            const account = { username: 'john@example.com' };
            expect(getUserDisplayName(account)).toBe('john@example.com');
        });

        it('should return email if other fields not available', () => {
            const account = { email: 'john@example.com' };
            expect(getUserDisplayName(account)).toBe('john@example.com');
        });

        it('should return mail if other fields not available', () => {
            const account = { mail: 'john@example.com' };
            expect(getUserDisplayName(account)).toBe('john@example.com');
        });

        it('should return id as last resort', () => {
            const account = { id: 'user-id-123' };
            expect(getUserDisplayName(account)).toBe('user-id-123');
        });

        it('should return empty string if account is null/undefined', () => {
            expect(getUserDisplayName(null)).toBe('');
            expect(getUserDisplayName(undefined)).toBe('');
        });

        it('should prioritize name over other fields', () => {
            const account = {
                name: 'John Doe',
                displayName: 'John D.',
                username: 'john@example.com',
            };
            expect(getUserDisplayName(account)).toBe('John Doe');
        });
    });

    describe('isUserCancelledError', () => {
        it('should return true for user_cancelled error', () => {
            const error = { errorCode: 'user_cancelled' };
            expect(isUserCancelledError(error)).toBe(true);
        });

        it('should return true for user_cancelled_login error', () => {
            const error = { errorCode: 'user_cancelled_login' };
            expect(isUserCancelledError(error)).toBe(true);
        });

        it('should return true for user_cancelled_authorization error', () => {
            const error = { errorCode: 'user_cancelled_authorization' };
            expect(isUserCancelledError(error)).toBe(true);
        });

        it('should return true if message contains "user cancelled"', () => {
            const error = { message: 'User cancelled the operation' };
            expect(isUserCancelledError(error)).toBe(true);
        });

        it('should return false for other errors', () => {
            const error = { errorCode: 'network_error' };
            expect(isUserCancelledError(error)).toBe(false);
        });

        it('should return false for null/undefined', () => {
            expect(isUserCancelledError(null)).toBe(false);
            expect(isUserCancelledError(undefined)).toBe(false);
        });
    });

    describe('isInteractionRequiredError', () => {
        it('should return true for interaction_required', () => {
            const error = { errorCode: 'interaction_required' };
            expect(isInteractionRequiredError(error)).toBe(true);
        });

        it('should return true for consent_required', () => {
            const error = { errorCode: 'consent_required' };
            expect(isInteractionRequiredError(error)).toBe(true);
        });

        it('should return true for login_required', () => {
            const error = { errorCode: 'login_required' };
            expect(isInteractionRequiredError(error)).toBe(true);
        });

        it('should return false for other errors', () => {
            const error = { errorCode: 'network_error' };
            expect(isInteractionRequiredError(error)).toBe(false);
        });
    });

    describe('isNetworkError', () => {
        it('should return true for network_error', () => {
            const error = { errorCode: 'network_error' };
            expect(isNetworkError(error)).toBe(true);
        });

        it('should return true for request_timeout', () => {
            const error = { errorCode: 'request_timeout' };
            expect(isNetworkError(error)).toBe(true);
        });

        it('should return true if message contains "network"', () => {
            const error = { message: 'Network error occurred' };
            expect(isNetworkError(error)).toBe(true);
        });

        it('should return true if message contains "timeout"', () => {
            const error = { message: 'Request timeout' };
            expect(isNetworkError(error)).toBe(true);
        });

        it('should return true if message contains "fetch"', () => {
            const error = { message: 'Failed to fetch' };
            expect(isNetworkError(error)).toBe(true);
        });

        it('should return false for other errors', () => {
            const error = { errorCode: 'invalid_grant' };
            expect(isNetworkError(error)).toBe(false);
        });
    });

    describe('getAuthErrorMessage', () => {
        it('should return null for user cancelled errors', () => {
            const error = { errorCode: 'user_cancelled' };
            expect(getAuthErrorMessage(error)).toBeNull();
        });

        it('should return network error message', () => {
            const error = { errorCode: 'network_error' };
            expect(getAuthErrorMessage(error)).toBe('Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.');
        });

        it('should return interaction required message', () => {
            const error = { errorCode: 'interaction_required' };
            expect(getAuthErrorMessage(error)).toBe('Vui lòng đăng nhập lại.');
        });

        it('should return token expired message', () => {
            const error = { errorCode: 'token_expired' };
            expect(getAuthErrorMessage(error)).toBe('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        });

        it('should return invalid client message', () => {
            const error = { errorCode: 'invalid_client' };
            expect(getAuthErrorMessage(error)).toBe('Cấu hình ứng dụng không hợp lệ. Vui lòng liên hệ quản trị viên.');
        });

        it('should return unauthorized client message', () => {
            const error = { errorCode: 'unauthorized_client' };
            expect(getAuthErrorMessage(error)).toBe('Ứng dụng chưa được cấp quyền. Vui lòng liên hệ quản trị viên.');
        });

        it('should return access denied message', () => {
            const error = { errorCode: 'access_denied' };
            expect(getAuthErrorMessage(error)).toBe('Bạn không có quyền truy cập. Vui lòng liên hệ quản trị viên.');
        });

        it('should return default message for unknown errors', () => {
            const error = { errorCode: 'unknown_error' };
            expect(getAuthErrorMessage(error)).toBe('Đăng nhập Microsoft thất bại. Vui lòng thử lại.');
        });

        it('should return default message for null/undefined', () => {
            expect(getAuthErrorMessage(null)).toBe('Đã xảy ra lỗi không xác định.');
            expect(getAuthErrorMessage(undefined)).toBe('Đã xảy ra lỗi không xác định.');
        });
    });

    describe('validateMsalConfig', () => {
        it('should return valid for complete config', () => {
            const result = validateMsalConfig('client-id-123', 'tenant-id-456');
            expect(result.valid).toBe(true);
            expect(result.missing).toEqual([]);
        });

        it('should detect missing clientId', () => {
            const result = validateMsalConfig('', 'tenant-id-456');
            expect(result.valid).toBe(false);
            expect(result.missing).toContain('VITE_AZURE_CLIENT_ID');
        });

        it('should detect missing tenantId', () => {
            const result = validateMsalConfig('client-id-123', '');
            expect(result.valid).toBe(false);
            expect(result.missing).toContain('VITE_AZURE_TENANT_ID');
        });

        it('should detect both missing', () => {
            const result = validateMsalConfig('', '');
            expect(result.valid).toBe(false);
            expect(result.missing).toContain('VITE_AZURE_CLIENT_ID');
            expect(result.missing).toContain('VITE_AZURE_TENANT_ID');
        });

        it('should detect whitespace-only values as missing', () => {
            const result = validateMsalConfig('   ', '   ');
            expect(result.valid).toBe(false);
            expect(result.missing.length).toBe(2);
        });
    });
});
