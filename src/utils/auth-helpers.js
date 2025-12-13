/**
 * Validate if user email domain is allowed (for HPT only)
 * @param {Object} user - MSAL user object
 * @param {string[]} allowedDomains - Array of allowed email domains (e.g., ['@hpt.vn', '@hpt.com.vn'])
 * @returns {boolean} True if domain is allowed or validation is disabled
 */
export function validateUserDomain(user, allowedDomains = []) {
    if (!allowedDomains || allowedDomains.length === 0) {
        return true;
    }

    if (!user) {
        return false;
    }

    const email = user.username || user.email || user.mail || '';
    if (!email) {
        return false;
    }

    return allowedDomains.some(domain => email.toLowerCase().endsWith(domain.toLowerCase()));
}

/**
 * Get user display name from MSAL account object
 * @param {Object} account - MSAL account object
 * @returns {string} Display name or fallback
 */
export function getUserDisplayName(account) {
    if (!account) return '';
    
    return account.name || 
           account.displayName || 
           account.username || 
           account.email || 
           account.mail || 
           account.id || 
           '';
}

/**
 * Check if error is a user cancellation (should not show error message)
 * @param {Error} error - MSAL error object
 * @returns {boolean} True if user cancelled
 */
export function isUserCancelledError(error) {
    if (!error) return false;
    
    const cancelledCodes = [
        'user_cancelled',
        'user_cancelled_login',
        'user_cancelled_authorization',
    ];
    
    const hasCancelledCode = error.errorCode && cancelledCodes.includes(error.errorCode);
    const hasCancelledMessage = error.message && error.message.toLowerCase().includes('user cancelled');
    
    return Boolean(hasCancelledCode || hasCancelledMessage);
}

/**
 * Check if error requires user interaction
 * @param {Error} error - MSAL error object
 * @returns {boolean} True if interaction required
 */
export function isInteractionRequiredError(error) {
    if (!error) return false;
    
    return error.errorCode === 'interaction_required' ||
           error.errorCode === 'consent_required' ||
           error.errorCode === 'login_required';
}

/**
 * Check if error is a network error
 * @param {Error} error - MSAL error object
 * @returns {boolean} True if network error
 */
export function isNetworkError(error) {
    if (!error) return false;
    
    const networkCodes = ['network_error', 'request_timeout'];
    const hasNetworkCode = error.errorCode && networkCodes.includes(error.errorCode);
    
    const message = error.message?.toLowerCase() || '';
    const hasNetworkMessage = message.includes('network') || 
                             message.includes('timeout') || 
                             message.includes('fetch');
    
    return Boolean(hasNetworkCode || hasNetworkMessage);
}

/**
 * Get user-friendly error message for authentication errors
 * @param {Error} error - MSAL error object
 * @returns {string} User-friendly error message
 */
export function getAuthErrorMessage(error) {
    if (!error) {
        return 'Đã xảy ra lỗi không xác định.';
    }

    if (isUserCancelledError(error)) {
        return null;
    }

    if (isNetworkError(error)) {
        return 'Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.';
    }

    if (isInteractionRequiredError(error)) {
        return 'Vui lòng đăng nhập lại.';
    }

    switch (error.errorCode) {
        case 'invalid_grant':
        case 'token_expired':
            return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        case 'invalid_client':
            return 'Cấu hình ứng dụng không hợp lệ. Vui lòng liên hệ quản trị viên.';
        case 'unauthorized_client':
            return 'Ứng dụng chưa được cấp quyền. Vui lòng liên hệ quản trị viên.';
        case 'access_denied':
            return 'Bạn không có quyền truy cập. Vui lòng liên hệ quản trị viên.';
        default:
            return 'Đăng nhập Microsoft thất bại. Vui lòng thử lại.';
    }
}

/**
 * Check if MSAL instance is properly configured
 * @param {string} clientId - Azure AD Client ID
 * @param {string} tenantId - Azure AD Tenant ID
 * @returns {{ valid: boolean, missing: string[] }} Validation result
 */
export function validateMsalConfig(clientId, tenantId) {
    const missing = [];
    
    if (!clientId || clientId.trim() === '') {
        missing.push('VITE_AZURE_CLIENT_ID');
    }
    
    if (!tenantId || tenantId.trim() === '') {
        missing.push('VITE_AZURE_TENANT_ID');
    }
    
    return {
        valid: missing.length === 0,
        missing,
    };
}
