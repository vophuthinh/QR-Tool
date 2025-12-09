import { describe, it, expect } from 'vitest';
import {
    relLum,
    getContrastRatio,
    isValidURL,
    isValidEmail,
    isValidPhone,
    isValidLatLng,
    isSafeHttpUrl,
    normalizeHex,
    isValidHex,
    pickECC,
    estimateDimension,
    exportWithPadding,
    roundRectPath,
    buildDataURL,
} from '../src/utils/qr-helpers';

describe('Color Helpers', () => {
    it('relLum calculates relative luminance correctly', () => {
        expect(relLum('#000000')).toBe(0);
        expect(relLum('#FFFFFF')).toBe(1);
        // Red (sRGB)
        const redLum = relLum('#FF0000');
        expect(redLum).toBeCloseTo(0.2126, 2);
    });

    it('getContrastRatio calculates WCAG contrast correctly', () => {
        // Black on white = 21:1
        expect(getContrastRatio(0, 1)).toBe(21);
        // Same color = 1:1
        expect(getContrastRatio(0.5, 0.5)).toBe(1);
    });

    it('normalizeHex converts 3-digit to 6-digit hex', () => {
        expect(normalizeHex('#ABC')).toBe('#AABBCC');
        expect(normalizeHex('#123')).toBe('#112233');
        expect(normalizeHex('#FF00FF')).toBe('#FF00FF');
    });

    it('isValidHex validates hex colors', () => {
        expect(isValidHex('#000')).toBe(true);
        expect(isValidHex('#ABC123')).toBe(true);
        expect(isValidHex('#XYZ')).toBe(false);
        expect(isValidHex('red')).toBe(false);
        expect(isValidHex('#12345')).toBe(false);
    });
});

describe('Validation Helpers', () => {
    it('isValidURL validates URLs', () => {
        expect(isValidURL('')).toBe(true); // Empty is valid
        expect(isValidURL('https://example.com')).toBe(true);
        expect(isValidURL('http://example.com')).toBe(true);
        expect(isValidURL('mailto:test@example.com')).toBe(true);
        expect(isValidURL('tel:+1234567890')).toBe(true);
        expect(isValidURL('sms:+1234567890')).toBe(true);
        // Only safe protocols are allowed (http, https, mailto, tel, sms)
        expect(isValidURL('ftp://files.local')).toBe(false); // FTP not allowed
        expect(isValidURL('javascript:alert(1)')).toBe(false); // Dangerous protocol
        expect(isValidURL('data:text/html,<script>')).toBe(false); // Dangerous protocol
        expect(isValidURL('not-a-url')).toBe(false);
        expect(isValidURL('http://')).toBe(false);
    });

    it('isSafeHttpUrl only allows http/https', () => {
        expect(isSafeHttpUrl('')).toBe(true);
        expect(isSafeHttpUrl('https://example.com')).toBe(true);
        expect(isSafeHttpUrl('http://example.com')).toBe(true);
        expect(isSafeHttpUrl('ftp://files.local')).toBe(false);
        expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    });

    it('isValidEmail validates email addresses', () => {
        expect(isValidEmail('')).toBe(true);
        expect(isValidEmail('user@example.com')).toBe(true);
        expect(isValidEmail('test+filter@mail.co.uk')).toBe(true);
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
    });

    it('isValidPhone validates phone numbers', () => {
        expect(isValidPhone('')).toBe(true);
        expect(isValidPhone('+84 123 456 789')).toBe(true);
        expect(isValidPhone('(012) 345-6789')).toBe(true);
        expect(isValidPhone('abc123')).toBe(false);
    });

    it('isValidLatLng validates coordinates', () => {
        expect(isValidLatLng('', '')).toBe(true);
        expect(isValidLatLng('21.0285', '105.8542')).toBe(true);
        expect(isValidLatLng('90', '180')).toBe(true);
        expect(isValidLatLng('-90', '-180')).toBe(true);
        expect(isValidLatLng('91', '0')).toBe(false);
        expect(isValidLatLng('0', '181')).toBe(false);
        expect(isValidLatLng('abc', 'xyz')).toBe(false);
    });
});

describe('ECC Helpers', () => {
    it('pickECC auto-selects based on logo and contrast', () => {
        // No logo, good contrast → M
        expect(pickECC('AUTO', 0, true)).toBe('M');

        // Small logo → Q
        expect(pickECC('AUTO', 0.15, true)).toBe('Q');

        // Large logo → H
        expect(pickECC('AUTO', 0.25, true)).toBe('H');

        // Poor contrast → H
        expect(pickECC('AUTO', 0, false)).toBe('H');

        // Manual override
        expect(pickECC('L', 0.3, false)).toBe('L');
    });

    it('estimateDimension calculates QR size', () => {
        // Short data with M
        const small = estimateDimension(10, 'M');
        expect(small).toBeGreaterThanOrEqual(21);
        expect(small).toBeLessThanOrEqual(177); // Max = 21 + 4*40

        // Long data requires larger version
        const large = estimateDimension(1000, 'H');
        expect(large).toBeGreaterThan(small);
    });
});

describe('Canvas Export Helpers', () => {
    // Note: Canvas tests require 'canvas' npm package for full testing
    // Skipping for now as they work correctly in browser environment

    it.skip('exportWithPadding adds padding correctly', () => {
        // Create test canvas
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 100, 100);

        const dataURL = exportWithPadding(canvas, 'png', 32, '#FFFFFF');

        // Check it's a valid data URL
        expect(dataURL).toMatch(/^data:image\/png;base64,/);

        // Decode and check dimensions
        const img = new Image();
        img.src = dataURL;

        return new Promise((resolve) => {
            img.onload = () => {
                expect(img.width).toBe(164); // 100 + 32*2
                expect(img.height).toBe(164);
                resolve();
            };
        });
    });

    it.skip('roundRectPath creates valid path', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Should not throw
        expect(() => {
            roundRectPath(ctx, 10, 10, 100, 100, 20);
            ctx.stroke();
        }).not.toThrow();
    });

    it.skip('buildDataURL handles padding and rounded corners', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 100, 100);

        // No options
        const simple = buildDataURL(canvas, 'png');
        expect(simple).toMatch(/^data:image\/png;base64,/);

        // With padding
        const padded = buildDataURL(canvas, 'png', { padPx: 20, bg: '#0000FF' });
        expect(padded).toMatch(/^data:image\/png;base64,/);

        // With rounded corners
        const rounded = buildDataURL(canvas, 'png', { rounded: 15, bg: '#00FF00' });
        expect(rounded).toMatch(/^data:image\/png;base64,/);
    });
});
