import { describe, it, expect } from 'vitest';

/* ===========================
   Copy functions from App.jsx for testing
=========================== */
const QR_TYPES = {
    URL: 'url',
    TEXT: 'text',
    WIFI: 'wifi',
    VCARD: 'vcard',
    EMAIL: 'email',
    SMS: 'sms',
    TEL: 'tel',
    GEO: 'geo',
};

// --- Escape helpers ---
const escWiFi = (s = '') => s.replace(/([;,:\\"])/g, '\\$1'); // escape ; , : \ "
const escVCARD = (s = '') => s.replace(/([\\;,])/g, '\\$1').replace(/\n/g, '\\n');

const generateQRContent = (type, data) => {
    switch (type) {
        case QR_TYPES.URL:
            return data.url || 'https://example.com';
        case QR_TYPES.TEXT:
            return data.text || '';
        case QR_TYPES.WIFI: {
            const T = data.encryption || 'WPA';
            const S = escWiFi(data.ssid || '');
            const parts = [`WIFI:T:${T};S:${S};`];
            if (T !== 'nopass' && data.password) parts.push(`P:${escWiFi(data.password)};`);
            if (data.hidden) parts.push('H:true;');
            parts.push(';');
            return parts.join('');
        }
        case QR_TYPES.VCARD: {
            const name = data.name || '';
            // tách Họ/Tên đơn giản: phần cuối là họ
            let last = name,
                first = '';
            const seg = name.trim().split(/\s+/);
            if (seg.length > 1) {
                last = seg.pop();
                first = seg.join(' ');
            }

            const lines = [
                'BEGIN:VCARD',
                'VERSION:3.0',
                `FN:${escVCARD(name)}`,
                `N:${escVCARD(last)};${escVCARD(first)};;;`,
            ];
            if (data.phone) lines.push(`TEL;TYPE=CELL:${escVCARD(data.phone)}`);
            if (data.email) lines.push(`EMAIL;TYPE=INTERNET:${escVCARD(data.email)}`);
            if (data.org) lines.push(`ORG:${escVCARD(data.org)}`);
            if (data.vcardUrl) lines.push(`URL:${escVCARD(data.vcardUrl)}`);
            lines.push('END:VCARD');
            // vCard 3.0 dùng CRLF an toàn hơn
            return lines.join('\r\n');
        }
        case QR_TYPES.EMAIL:
            return `mailto:${data.email || ''}?subject=${encodeURIComponent(
                data.subject || '',
            )}&body=${encodeURIComponent(data.body || '')}`;
        case QR_TYPES.SMS:
            return `sms:${data.phone || ''}?body=${encodeURIComponent(data.message || '')}`;
        case QR_TYPES.TEL:
            return `tel:${data.phone || ''}`;
        case QR_TYPES.GEO: {
            const lat = data.lat ? data.lat.toString() : '0';
            const lng = data.lng ? data.lng.toString() : '0';
            const label = data.label ? `(${data.label})` : '';
            return `geo:0,0?q=${lat},${lng}${label}`;
        }
        default:
            return data.text || '';
    }
};

/* ===========================
   Test Suites
=========================== */
describe('generateQRContent', () => {
    describe('URL type', () => {
        it('should generate valid URL', () => {
            const result = generateQRContent(QR_TYPES.URL, { url: 'https://example.com' });
            expect(result).toBe('https://example.com');
        });

        it('should use default URL when empty', () => {
            const result = generateQRContent(QR_TYPES.URL, { url: '' });
            expect(result).toBe('https://example.com');
        });
    });

    describe('TEXT type', () => {
        it('should generate plain text', () => {
            const result = generateQRContent(QR_TYPES.TEXT, { text: 'Hello World' });
            expect(result).toBe('Hello World');
        });

        it('should return empty string when no text', () => {
            const result = generateQRContent(QR_TYPES.TEXT, { text: '' });
            expect(result).toBe('');
        });
    });

    describe('WIFI type', () => {
        it('should generate WiFi QR with WPA encryption', () => {
            const data = {
                ssid: 'MyWiFi',
                password: 'password123',
                encryption: 'WPA',
                hidden: false,
            };
            const result = generateQRContent(QR_TYPES.WIFI, data);
            expect(result).toBe('WIFI:T:WPA;S:MyWiFi;P:password123;;');
        });

        it('should generate WiFi QR with hidden network', () => {
            const data = {
                ssid: 'HiddenNet',
                password: 'secret',
                encryption: 'WPA',
                hidden: true,
            };
            const result = generateQRContent(QR_TYPES.WIFI, data);
            expect(result).toBe('WIFI:T:WPA;S:HiddenNet;P:secret;H:true;;');
        });

        it('should handle WEP encryption', () => {
            const data = {
                ssid: 'OldRouter',
                password: '12345',
                encryption: 'WEP',
                hidden: false,
            };
            const result = generateQRContent(QR_TYPES.WIFI, data);
            expect(result).toBe('WIFI:T:WEP;S:OldRouter;P:12345;;');
        });

        it('should handle no password (open network)', () => {
            const data = {
                ssid: 'FreeWiFi',
                password: '',
                encryption: 'nopass',
                hidden: false,
            };
            const result = generateQRContent(QR_TYPES.WIFI, data);
            expect(result).toBe('WIFI:T:nopass;S:FreeWiFi;;');
        });

        it('should correctly encode hidden network flag as true', () => {
            const data = {
                ssid: 'SecretNet',
                password: 'password123',
                encryption: 'WPA',
                hidden: true,
            };
            const result = generateQRContent(QR_TYPES.WIFI, data);
            expect(result).toContain('H:true');
            expect(result).not.toContain('H:;');
        });

        it('should handle SSID with special characters', () => {
            const data = {
                ssid: 'WiFi:Test',
                password: 'pass;123',
                encryption: 'WPA',
                hidden: false,
            };
            const result = generateQRContent(QR_TYPES.WIFI, data);
            expect(result).toContain('S:WiFi\\:Test');
            expect(result).toContain('P:pass\\;123');
        });
    });

    describe('VCARD type', () => {
        it('should generate complete vCard', () => {
            const data = {
                name: 'Nguyen Van A',
                phone: '+84123456789',
                email: 'test@example.com',
                org: 'ABC Company',
                vcardUrl: 'https://company.com',
            };
            const result = generateQRContent(QR_TYPES.VCARD, data);
            expect(result).toContain('BEGIN:VCARD');
            expect(result).toContain('VERSION:3.0');
            expect(result).toContain('FN:Nguyen Van A');
            expect(result).toContain('N:A;Nguyen Van;;;');
            expect(result).toContain('TEL;TYPE=CELL:+84123456789');
            expect(result).toContain('EMAIL;TYPE=INTERNET:test@example.com');
            expect(result).toContain('ORG:ABC Company');
            expect(result).toContain('URL:https://company.com');
            expect(result).toContain('END:VCARD');
            // Check CRLF
            expect(result).toContain('\r\n');
        });

        it('should handle empty fields in vCard', () => {
            const data = {
                name: '',
                phone: '',
                email: '',
                org: '',
                vcardUrl: '',
            };
            const result = generateQRContent(QR_TYPES.VCARD, data);
            expect(result).toContain('FN:');
            expect(result).toContain('N:;;;');
            expect(result).not.toContain('TEL');
            expect(result).not.toContain('EMAIL');
            expect(result).not.toContain('ORG');
            expect(result).not.toContain('URL');
        });

        it('should escape special characters in vCard', () => {
            const data = {
                name: 'Name; With, Special\\Chars',
                phone: '+84123',
                email: 'test@example.com',
                org: 'Company;LLC',
                vcardUrl: 'https://example.com',
            };
            const result = generateQRContent(QR_TYPES.VCARD, data);
            expect(result).toContain('FN:Name\\; With\\, Special\\\\Chars');
            expect(result).toContain('ORG:Company\\;LLC');
        });
    });

    describe('EMAIL type', () => {
        it('should generate mailto link with subject and body', () => {
            const data = {
                email: 'contact@example.com',
                subject: 'Hello',
                body: 'This is a test email',
            };
            const result = generateQRContent(QR_TYPES.EMAIL, data);
            expect(result).toContain('mailto:contact@example.com');
            expect(result).toContain('subject=Hello');
            expect(result).toContain('body=This%20is%20a%20test%20email');
        });

        it('should handle special characters in email body', () => {
            const data = {
                email: 'test@test.com',
                subject: 'Test & Demo',
                body: 'Hello! How are you?',
            };
            const result = generateQRContent(QR_TYPES.EMAIL, data);
            expect(result).toContain('subject=Test%20%26%20Demo');
            expect(result).toContain('body=Hello!%20How%20are%20you%3F');
        });

        it('should handle Vietnamese UTF-8 characters', () => {
            const data = {
                email: 'contact@example.com',
                subject: 'Xin chào',
                body: 'Đây là email thử nghiệm',
            };
            const result = generateQRContent(QR_TYPES.EMAIL, data);
            expect(result).toContain('mailto:contact@example.com');
            expect(result).toContain('subject=Xin%20ch%C3%A0o');
            expect(result).toContain('body=%C4%90%C3%A2y%20l%C3%A0%20email%20th%E1%BB%AD%20nghi%E1%BB%87m');
        });

        it('should handle ampersand in both subject and body', () => {
            const data = {
                email: 'info@company.com',
                subject: 'Q&A Session',
                body: 'Join us for Q&A about products & services',
            };
            const result = generateQRContent(QR_TYPES.EMAIL, data);
            expect(result).toContain('subject=Q%26A%20Session');
            expect(result).toContain('body=Join%20us%20for%20Q%26A%20about%20products%20%26%20services');
        });

        it('should handle empty subject and body', () => {
            const data = {
                email: 'test@example.com',
                subject: '',
                body: '',
            };
            const result = generateQRContent(QR_TYPES.EMAIL, data);
            expect(result).toBe('mailto:test@example.com?subject=&body=');
        });
    });

    describe('SMS type', () => {
        it('should generate SMS link', () => {
            const data = {
                phone: '+84123456789',
                message: 'Hello from QR code',
            };
            const result = generateQRContent(QR_TYPES.SMS, data);
            expect(result).toBe('sms:+84123456789?body=Hello%20from%20QR%20code');
        });

        it('should handle empty message', () => {
            const data = {
                phone: '+84987654321',
                message: '',
            };
            const result = generateQRContent(QR_TYPES.SMS, data);
            expect(result).toBe('sms:+84987654321?body=');
        });
    });

    describe('TEL type', () => {
        it('should generate tel link', () => {
            const result = generateQRContent(QR_TYPES.TEL, { phone: '+84123456789' });
            expect(result).toBe('tel:+84123456789');
        });

        it('should handle empty phone', () => {
            const result = generateQRContent(QR_TYPES.TEL, { phone: '' });
            expect(result).toBe('tel:');
        });
    });

    describe('GEO type', () => {
        it('should generate geo coordinates with label', () => {
            const data = {
                lat: '21.0285',
                lng: '105.8542',
                label: 'Hanoi, Vietnam',
            };
            const result = generateQRContent(QR_TYPES.GEO, data);
            expect(result).toBe('geo:0,0?q=21.0285,105.8542(Hanoi, Vietnam)');
        });

        it('should handle coordinates without label', () => {
            const data = {
                lat: '10.762622',
                lng: '106.660172',
                label: '',
            };
            const result = generateQRContent(QR_TYPES.GEO, data);
            expect(result).toBe('geo:0,0?q=10.762622,106.660172');
        });

        it('should default to 0,0 when empty', () => {
            const data = {
                lat: '',
                lng: '',
                label: '',
            };
            const result = generateQRContent(QR_TYPES.GEO, data);
            expect(result).toBe('geo:0,0?q=0,0');
        });
    });

    describe('Edge cases', () => {
        it('should handle unknown type', () => {
            const result = generateQRContent('unknown', { text: 'fallback' });
            expect(result).toBe('fallback');
        });

        it('should handle null/undefined data', () => {
            const result = generateQRContent(QR_TYPES.TEXT, {});
            expect(result).toBe('');
        });
    });
});
