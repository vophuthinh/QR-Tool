/* ===========================
   QR Validation & Color Helpers
=========================== */

/**
 * Calculate relative luminance of hex color
 * @param {string} hex - Hex color (e.g., "#FF0000")
 * @returns {number} Relative luminance (0-1)
 */
export const relLum = (hex) => {
    const v = (c) => {
        c = parseInt(c, 16) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const r = v(hex.slice(1, 3)),
        g = v(hex.slice(3, 5)),
        b = v(hex.slice(5, 7));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Calculate WCAG contrast ratio between two colors
 * @param {number} lum1 - Relative luminance of first color
 * @param {number} lum2 - Relative luminance of second color
 * @returns {number} Contrast ratio (1-21)
 */
export const getContrastRatio = (lum1, lum2) => (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);

/**
 * Sanitize input to prevent XSS and code injection
 * Removes dangerous patterns and characters
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';
    
    // Remove null bytes
    let sanitized = input.replace(/\0/g, '');
    
    // Remove script tags and event handlers
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
    
    // Remove javascript:, data:, vbscript: protocols
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/data:text\/html/gi, '');
    sanitized = sanitized.replace(/vbscript:/gi, '');
    sanitized = sanitized.replace(/file:/gi, '');
    
    // Remove dangerous HTML entities
    sanitized = sanitized.replace(/&#x?[0-9a-f]+;/gi, (match) => {
        const code = parseInt(match.replace(/[&#;]/g, ''), 16);
        // Allow safe characters (letters, numbers, common punctuation)
        if (code >= 32 && code <= 126) return match;
        return '';
    });
    
    // Remove control characters except newline, tab, carriage return
    sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
    
    return sanitized.trim();
}

/**
 * Check if input contains potentially dangerous content
 * @param {string} input - Input to check
 * @returns {{ safe: boolean, reason?: string }}
 */
export function isInputSafe(input) {
    if (!input || typeof input !== 'string') return { safe: true };
    
    // Check for script tags
    if (/<script/i.test(input)) {
        return { safe: false, reason: 'Chứa thẻ script không được phép' };
    }
    
    // Check for event handlers
    if (/on\w+\s*=/i.test(input)) {
        return { safe: false, reason: 'Chứa event handler không được phép' };
    }
    
    // Check for dangerous protocols
    if (/javascript:|data:text\/html|vbscript:|file:/i.test(input)) {
        return { safe: false, reason: 'Chứa protocol nguy hiểm' };
    }
    
    // Check for null bytes
    if (/\0/.test(input)) {
        return { safe: false, reason: 'Chứa null byte không được phép' };
    }
    
    return { safe: true };
}

/**
 * Validate URL format and check for dangerous protocols
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid or empty
 */
export function isValidURL(url) {
    if (!url) return true;
    try {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol.toLowerCase();
        
        // Only allow safe protocols
        const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'sms:'];
        if (!allowedProtocols.includes(protocol)) {
            return false;
        }
        
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid or empty
 */
export function isValidEmail(email) {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone format
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid or empty
 */
export function isValidPhone(phone) {
    if (!phone) return true;
    return /^[\d\s+\-()]+$/.test(phone);
}

/**
 * Validate latitude/longitude coordinates
 * @param {string|number} lat - Latitude (-90 to 90)
 * @param {string|number} lng - Longitude (-180 to 180)
 * @returns {boolean} True if valid or both empty
 */
export function isValidLatLng(lat, lng) {
    if (!lat && !lng) return true;
    const la = parseFloat(lat),
        ln = parseFloat(lng);
    if (isNaN(la) || isNaN(ln)) return false;
    return la >= -90 && la <= 90 && ln >= -180 && ln <= 180;
}

/**
 * Check if URL uses safe protocol (http/https only)
 * @param {string} url - URL to check
 * @returns {boolean} True if http/https or empty
 */
export function isSafeHttpUrl(url) {
    if (!url) return true;
    try {
        const urlObj = new URL(url);
        return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
        return false;
    }
}

/**
 * Normalize hex color to 6-digit uppercase format
 * @param {string} hex - Hex color (#RGB or #RRGGBB)
 * @returns {string} Normalized hex color (#RRGGBB)
 */
export const normalizeHex = (hex) => {
    if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
        return ('#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]).toUpperCase();
    }
    return hex.toUpperCase();
};

/**
 * Validate hex color format
 * @param {string} hex - Hex color to validate
 * @returns {boolean} True if valid hex color
 */
export const isValidHex = (hex) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);

/* ===========================
   Canvas Export Helpers
=========================== */

/**
 * Draw rounded rectangle path on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {number} r - Border radius
 */
export function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

/**
 * Build data URL from canvas with optional padding and rounded corners
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {string} ext - Extension ('png' or 'jpg')
 * @param {Object} options - Export options
 * @param {number} options.padPx - Padding pixels (default: 0)
 * @param {string} options.bg - Background color
 * @param {number} options.rounded - Border radius (default: 0)
 * @returns {string} Data URL
 */
export function buildDataURL(canvas, ext, { padPx = 0, bg = '#FFFFFF', rounded = 0 } = {}) {
    if (padPx === 0 && rounded === 0) {
        return ext === 'jpg' ? canvas.toDataURL('image/jpeg', 1.0) : canvas.toDataURL('image/png', 1.0);
    }

    const w = canvas.width + padPx * 2;
    const h = canvas.height + padPx * 2;
    const temp = document.createElement('canvas');
    temp.width = w;
    temp.height = h;
    const ctx = temp.getContext('2d');

    // Disable smoothing to keep QR sharp
    ctx.imageSmoothingEnabled = false;

    // Fill background
    ctx.fillStyle = bg;
    if (rounded > 0) {
        roundRectPath(ctx, 0, 0, w, h, rounded);
        ctx.fill();
        ctx.clip();
    } else {
        ctx.fillRect(0, 0, w, h);
    }

    // Draw QR code
    ctx.drawImage(canvas, padPx, padPx);

    return ext === 'jpg' ? temp.toDataURL('image/jpeg', 1.0) : temp.toDataURL('image/png', 1.0);
}

/**
 * Build SVG blob with optional padding
 * @param {SVGElement} svgElement - Source SVG element
 * @param {Object} options - Export options
 * @param {number} options.padPx - Padding pixels (default: 0)
 * @param {string} options.bg - Background color
 * @returns {Blob} SVG blob
 */
export function buildSVGBlob(svgElement, { padPx = 0, bg = '#FFFFFF' } = {}) {
    if (padPx === 0) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        return new Blob([svgData], { type: 'image/svg+xml' });
    }

    // Clone and add padding
    const clone = svgElement.cloneNode(true);
    const origW = parseInt(clone.getAttribute('width') || '0');
    const origH = parseInt(clone.getAttribute('height') || '0');
    const newW = origW + padPx * 2;
    const newH = origH + padPx * 2;

    clone.setAttribute('width', newW);
    clone.setAttribute('height', newH);
    clone.setAttribute('viewBox', `0 0 ${newW} ${newH}`);

    // Add background rect
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', newW);
    rect.setAttribute('height', newH);
    rect.setAttribute('fill', bg);
    clone.insertBefore(rect, clone.firstChild);

    // Offset original content
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${padPx}, ${padPx})`);
    while (clone.childNodes.length > 1) {
        g.appendChild(clone.childNodes[1]);
    }
    clone.appendChild(g);

    const svgData = new XMLSerializer().serializeToString(clone);
    return new Blob([svgData], { type: 'image/svg+xml' });
}

/**
 * Download file from data URL or blob
 * @param {string|Blob} data - Data URL or Blob
 * @param {string} filename - File name
 */
export function downloadFile(data, filename) {
    const a = document.createElement('a');
    if (typeof data === 'string') {
        a.href = data;
    } else {
        a.href = URL.createObjectURL(data);
        setTimeout(() => URL.revokeObjectURL(a.href), 100);
    }
    a.download = filename;
    a.click();
}

/* ===========================
   ECC Level Selection
=========================== */

/**
 * Auto-select ECC level based on logo size and contrast
 * @param {string} mode - ECC mode ('AUTO' or 'L'/'M'/'Q'/'H')
 * @param {number} logoRatio - Logo scale ratio (0-1)
 * @param {boolean} contrastOk - Whether contrast is sufficient (≥3.5:1)
 * @returns {string} ECC level ('L'/'M'/'Q'/'H')
 */
export function pickECC(mode, logoRatio, contrastOk) {
    if (mode !== 'AUTO') return mode;
    if (logoRatio >= 0.22 || !contrastOk) return 'H';
    if (logoRatio >= 0.1) return 'Q';
    return 'M';
}

/**
 * Estimate QR code dimension (modules) based on data length
 * @param {number} dataLength - Length of data to encode
 * @param {string} ecc - ECC level ('L'/'M'/'Q'/'H')
 * @returns {number} Estimated dimension in modules
 */
export function estimateDimension(dataLength, ecc = 'M') {
    const k = { L: 1.0, M: 1.2, Q: 1.4, H: 1.6 }[ecc];
    const v = Math.ceil((dataLength * k) / 14);
    const dim = 21 + 4 * Math.max(1, Math.min(40, v));
    return dim;
}

/**
 * Get maximum data length for QR code based on ECC level
 * QR Code Version 40 (maximum) capacity:
 * - ECC L: ~7,089 bytes (alphanumeric), ~2,953 bytes (binary)
 * - ECC M: ~5,596 bytes (alphanumeric), ~2,332 bytes (binary)
 * - ECC Q: ~4,296 bytes (alphanumeric), ~1,790 bytes (binary)
 * - ECC H: ~3,391 bytes (alphanumeric), ~1,413 bytes (binary)
 * Using conservative limit for text/URL (byte mode): ~2,000 characters
 * @param {string} ecc - ECC level ('L'/'M'/'Q'/'H')
 * @returns {number} Maximum data length in characters
 */
export function getMaxDataLength(ecc = 'M') {
    // Conservative limits for byte mode encoding (text/URL)
    const limits = {
        L: 2500,
        M: 2000,
        Q: 1500,
        H: 1200,
    };
    return limits[ecc] || limits.M;
}

/**
 * Validate QR code data length
 * @param {string} data - Data to validate
 * @param {string} ecc - ECC level ('L'/'M'/'Q'/'H')
 * @returns {{ valid: boolean, maxLength: number, currentLength: number, message?: string }}
 */
export function validateDataLength(data, ecc = 'M') {
    if (!data) {
        return { valid: true, maxLength: 0, currentLength: 0 };
    }

    const maxLength = getMaxDataLength(ecc);
    const currentLength = data.length;
    const valid = currentLength <= maxLength;

    return {
        valid,
        maxLength,
        currentLength,
        message: valid
            ? undefined
            : `Dữ liệu quá dài (${currentLength} ký tự). Giới hạn: ${maxLength} ký tự với ECC ${ecc}. Vui lòng rút ngắn nội dung hoặc chọn ECC L.`,
    };
}