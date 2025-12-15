import React from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';

import toast from 'react-hot-toast';
import QrPreview from '../components/QrPreview';
import ExportPanel from '../components/ExportPanel';
import { useTheme } from '../hooks/useTheme';
import logoHPT from '../assets/Logo HPT.png';
import logoHPTWhite from '../assets/Logo HPT white.png';

const ErrorMessage = ({ message, className = '' }) => {
    if (!message) return null;
    return (
        <p className={`flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400 font-medium ${className}`}>
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{message}</span>
        </p>
    );
};

const WarningMessage = ({ message, className = '' }) => {
    if (!message) return null;
    return (
        <p className={`flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 font-semibold ${className}`}>
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{message}</span>
        </p>
    );
};
import {
    isValidURL,
    isValidEmail,
    isValidPhone,
    isValidLatLng,
    isSafeHttpUrl,
    normalizeHex,
    isValidHex,
    relLum,
    getContrastRatio,
    pickECC,
    estimateDimension,
    validateDataLength,
    sanitizeInput,
    isInputSafe,
} from '../utils/qr-helpers';
import { testQRScan, cleanupReader } from '../utils/qr-scanner';

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

const QR_TYPE_LABELS = {
    url: { 
        name: 'URL/Website', 
        desc: 'Liên kết web',
        explanation: 'Tạo QR code chứa liên kết website. Khi quét sẽ mở trình duyệt và điều hướng đến URL đã nhập. Hỗ trợ http:// và https://.'
    },
    text: { 
        name: 'Text', 
        desc: 'Văn bản thuần',
        explanation: 'Tạo QR code chứa văn bản thuần túy. Khi quét sẽ hiển thị nội dung text đã nhập. Phù hợp cho thông điệp, ghi chú, hoặc bất kỳ văn bản nào.'
    },
    wifi: { 
        name: 'Wi-Fi', 
        desc: 'Kết nối Wi-Fi',
        explanation: 'Tạo QR code chứa thông tin mạng Wi-Fi (SSID, mật khẩu, loại mã hóa). Khi quét trên điện thoại sẽ tự động kết nối vào mạng Wi-Fi đó.'
    },
    vcard: { 
        name: 'vCard', 
        desc: 'Danh thiếp',
        explanation: 'Tạo QR code chứa thông tin liên hệ dạng vCard (danh thiếp điện tử). Khi quét sẽ tự động thêm vào danh bạ với đầy đủ thông tin: tên, số điện thoại, email, công ty, website.'
    },
    email: { 
        name: 'Email', 
        desc: 'Gửi email',
        explanation: 'Tạo QR code để gửi email. Khi quét sẽ mở ứng dụng email với địa chỉ người nhận, tiêu đề và nội dung đã được điền sẵn.'
    },
    sms: { 
        name: 'SMS', 
        desc: 'Tin nhắn',
        explanation: 'Tạo QR code để gửi tin nhắn SMS. Khi quét sẽ mở ứng dụng tin nhắn với số điện thoại và nội dung đã được điền sẵn.'
    },
    tel: { 
        name: 'Điện thoại', 
        desc: 'Gọi điện',
        explanation: 'Tạo QR code chứa số điện thoại. Khi quét sẽ hiển thị tùy chọn gọi điện thoại đến số đã nhập.'
    },
    geo: { 
        name: 'Vị trí', 
        desc: 'Tọa độ GPS',
        explanation: 'Tạo QR code chứa tọa độ địa lý (vĩ độ, kinh độ). Khi quét sẽ mở ứng dụng bản đồ và hiển thị vị trí trên bản đồ.'
    },
};

const escWiFi = (s = '') => s.replace(/([;,:\\"])/g, '\\$1');
const escVCARD = (s = '') => s.replace(/([\\;,])/g, '\\$1').replace(/\n/g, '\\n');

const generateQRContent = (type, data) => {
    switch (type) {
        case QR_TYPES.URL:
            return sanitizeInput(data.url || 'https://example.com');
        case QR_TYPES.TEXT:
            return sanitizeInput(data.text || '');
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
            let lastName = data.lastName || '';
            let firstName = data.firstName || '';
            if (!lastName && !firstName && name) {
                const seg = name.trim().split(/\s+/);
                if (seg.length > 1) {
                    lastName = seg[0];
                    firstName = seg.slice(1).join(' ');
                } else {
                    firstName = name;
                }
            }
            const lines = [
                'BEGIN:VCARD',
                'VERSION:3.0',
                `FN:${escVCARD(name)}`,
                `N:${escVCARD(lastName)};${escVCARD(firstName)};;;`,
            ];
            if (data.phone) lines.push(`TEL;TYPE=CELL:${escVCARD(data.phone)}`);
            if (data.email) lines.push(`EMAIL;TYPE=INTERNET:${escVCARD(data.email)}`);
            if (data.org) lines.push(`ORG:${escVCARD(data.org)}`);
            if (data.vcardUrl) lines.push(`URL:${escVCARD(data.vcardUrl)}`);
            lines.push('END:VCARD');
            return lines.join('\r\n');
        }
        case QR_TYPES.EMAIL:
            return `mailto:${data.email || ''}?subject=${encodeURIComponent(
                data.subject || '',
            )}&body=${encodeURIComponent(data.body || '')}`;
        case QR_TYPES.SMS: {
            const phone = data.phone || '';
            const message = data.message || '';
            if (!message) return `sms:${phone}`;
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const sep = isIOS ? '&' : '?';
            return `sms:${phone}${sep}body=${encodeURIComponent(message)}`;
        }
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

const Label = ({ children, htmlFor, hint, title }) => (
    <div className="mb-2">
        <label
            htmlFor={htmlFor}
            className="block text-base sm:text-sm font-bold text-slate-700 dark:text-slate-200 cursor-help"
            title={title}
        >
            {children}
        </label>
        {hint && <p className="mt-1 text-sm sm:text-xs text-slate-700 dark:text-slate-400 leading-relaxed">{hint}</p>}
    </div>
);

const Input = React.forwardRef(({ className = '', error, ...props }, ref) => (
    <input
        ref={ref}
        className={
            'w-full rounded-xl border-2 bg-white px-4 py-3 text-base sm:text-sm shadow-sm transition-all duration-200 ' +
            'focus:ring-4 placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
            'dark:bg-slate-800 dark:text-slate-100 ' +
            (error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-500 dark:focus:border-rose-400 dark:focus:ring-rose-900/30 '
                : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-200 dark:border-slate-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/30 ') +
            className
        }
        {...props}
    />
));
Input.displayName = 'Input';

const Select = ({ className = '', ...props }) => (
    <select
        className={
            'w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-base sm:text-sm shadow-sm transition-all duration-200 ' +
            'focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ' +
            'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 ' +
            'dark:focus:border-indigo-400 dark:focus:ring-indigo-900/30 cursor-pointer ' +
            className
        }
        {...props}
    />
);

const Button = ({ className = '', disabled, ...props }) => (
    <button
        disabled={disabled}
        className={
            'w-full rounded-xl px-5 py-3 text-base sm:text-sm font-bold shadow-lg transition-all duration-200 ' +
            'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-700 hover:to-indigo-600 ' +
            'hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ' +
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ' +
            (disabled
                ? 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:from-indigo-600 hover:to-indigo-500 '
                : '') +
            className
        }
        {...props}
    />
);

const Textarea = React.forwardRef(({ className = '', error, ...props }, ref) => (
    <textarea
        ref={ref}
        className={
            'w-full rounded-xl border-2 bg-white px-4 py-3 text-base sm:text-sm shadow-sm transition-all duration-200 ' +
            'focus:ring-4 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none ' +
            'dark:bg-slate-800 dark:text-slate-100 ' +
            (error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100 '
                : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-200 dark:border-slate-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/30 ') +
            className
        }
        {...props}
    />
));
Textarea.displayName = 'Textarea';

function useLocalStorage(key, initialValue, disabled = false) {
    const [val, setVal] = React.useState(() => {
        if (disabled) return initialValue;
        try {
            const v = localStorage.getItem(key);
            return v !== null ? JSON.parse(v) : initialValue;
        } catch {
            return initialValue;
        }
    });
    React.useEffect(() => {
        if (disabled) return;
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }, [key, val, disabled]);
    return [val, setVal];
}

function useDebounced(value, delay = 200) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function QRGenerator({ onBack }) {
    const [, setTheme, isDark] = useTheme();
    const privateMode = true;

    React.useEffect(() => {
        return () => cleanupReader();
    }, []);

    const [qrType, setQrType] = useLocalStorage('qr_type', QR_TYPES.URL, privateMode);
    const [qrData, setQrData] = React.useState({
        url: 'https://example.com',
        text: '',
        ssid: '',
        password: '',
        encryption: 'WPA',
        hidden: false,
        name: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        org: '',
        vcardUrl: '',
        subject: '',
        body: '',
        message: '',
        lat: '',
        lng: '',
        label: '',
    });

    const updateQrData = (k, v) => {
        let sanitizedValue = v;
        
        if (typeof v === 'string' && ['text', 'url', 'ssid', 'password', 'name', 'firstName', 'lastName', 'org', 'vcardUrl', 'subject', 'body', 'message', 'label'].includes(k)) {
            const safetyCheck = isInputSafe(v);
            if (!safetyCheck.safe) {
                toast.error(`Input không hợp lệ: ${safetyCheck.reason}`, { duration: 5000 });
                return;
            }
            sanitizedValue = sanitizeInput(v);
        }
        
        setQrData((prev) => ({ ...prev, [k]: sanitizedValue }));
    };

    const [validationErrors, setValidationErrors] = React.useState({});

    const qrContent = React.useMemo(() => generateQRContent(qrType, qrData), [qrType, qrData]);
    const text = useDebounced(qrContent, 200);

    const SIZE_PRESETS = [
        { id: 'web', label: 'Web/App', px: 512, desc: 'Hiển thị web' },
        { id: '3cm', label: 'Tem nhỏ 3cm', px: 354, desc: '3×3cm @300DPI' },
        { id: '5cm', label: 'Tem 5cm', px: 591, desc: '5×5cm @300DPI' },
        { id: '8cm', label: 'Tờ rơi 8cm', px: 945, desc: '8×8cm @300DPI' },
        { id: 'a4', label: 'In A4', px: 2048, desc: '17cm @300DPI' },
        { id: 'poster', label: 'Poster lớn', px: 4096, format: 'svg', desc: '35cm+ SVG' },
    ];

    const [uiMode, setUiMode] = useLocalStorage('ui_mode', 'quick', privateMode);
    const [size, setSize] = useLocalStorage('qr_size', 360, privateMode);
    const [selectedPreset, setSelectedPreset] = useLocalStorage('qr_size_preset', 'web', privateMode);
    const [eccMode, setEccMode] = useLocalStorage('qr_ecc_mode', 'AUTO', privateMode);
    const [includeMargin, setIncludeMargin] = useLocalStorage('qr_margin', true, privateMode);
    const [transparentBg, setTransparentBg] = useLocalStorage('qr_transparent_bg', false, privateMode);

    const [fgColor, setFgColor] = useLocalStorage('qr_fg', '#000000', privateMode);
    const [bgColor, setBgColor] = useLocalStorage('qr_bg', '#FFFFFF', privateMode);
    const [fgError, setFgError] = React.useState(false);
    const [bgError, setBgError] = React.useState(false);

    const [format, setFormat] = useLocalStorage('qr_fmt', 'canvas', privateMode);

    const [logoMode, setLogoMode] = useLocalStorage('qr_logo_mode', 'auto', privateMode);
    const [customLogoScale, setCustomLogoScale] = useLocalStorage('qr_logo_custom', 0.2, privateMode);
    const [showEccNotice, setShowEccNotice] = React.useState(false);
    const eccTimeoutRef = React.useRef(null);

    const [logoUrl, setLogoUrl] = React.useState('');
    const [scanResult, setScanResult] = React.useState(null);

    function scaleFromMode(mode) {
        switch (mode) {
            case 's':
                return 0.15;
            case 'm':
                return 0.22;
            case 'l':
                return 0.28;
            case 'custom':
                return customLogoScale;
            case 'auto':
            default:
                return logoUrl ? 0.2 : 0;
        }
    }
    const scale = scaleFromMode(logoMode);
    const contrastRatio = React.useMemo(() => getContrastRatio(relLum(fgColor), relLum(bgColor)), [fgColor, bgColor]);
    const level = React.useMemo(() => {
        const contrastOk = contrastRatio >= 3.5;
        return pickECC(eccMode, scale, contrastOk);
    }, [eccMode, scale, contrastRatio]);

    React.useEffect(() => {
        const e = {};
        if (qrType === QR_TYPES.URL && qrData.url) {
            const safetyCheck = isInputSafe(qrData.url);
            if (!safetyCheck.safe) {
                e.url = safetyCheck.reason;
            } else if (!isValidURL(qrData.url)) {
                e.url = 'URL không hợp lệ';
            } else if (!isSafeHttpUrl(qrData.url)) {
                e.url = 'Chỉ nên dùng http:// hoặc https://';
            } else {
                const lengthValidation = validateDataLength(qrData.url, level);
                if (!lengthValidation.valid) {
                    e.url = lengthValidation.message;
                }
            }
        }
        if (qrType === QR_TYPES.TEXT && qrData.text) {
            const safetyCheck = isInputSafe(qrData.text);
            if (!safetyCheck.safe) {
                e.text = safetyCheck.reason;
            } else {
                const lengthValidation = validateDataLength(qrData.text, level);
                if (!lengthValidation.valid) {
                    e.text = lengthValidation.message;
                }
            }
        }
        if (qrType === QR_TYPES.VCARD) {
            if (qrData.email && !isValidEmail(qrData.email)) e.vcardEmail = 'Email không hợp lệ';
            if (qrData.vcardUrl) {
                const safetyCheck = isInputSafe(qrData.vcardUrl);
                if (!safetyCheck.safe) {
                    e.vcardUrl = safetyCheck.reason;
                } else if (!isValidURL(qrData.vcardUrl)) {
                    e.vcardUrl = 'URL không hợp lệ';
                } else if (!isSafeHttpUrl(qrData.vcardUrl)) {
                    e.vcardUrl = 'Chỉ nên dùng http:// hoặc https://';
                }
            }
            if (qrData.phone && !isValidPhone(qrData.phone)) e.vcardPhone = 'Số điện thoại không hợp lệ';
            ['name', 'firstName', 'lastName', 'org'].forEach((field) => {
                if (qrData[field]) {
                    const safetyCheck = isInputSafe(qrData[field]);
                    if (!safetyCheck.safe) {
                        e[`vcard${field.charAt(0).toUpperCase() + field.slice(1)}`] = safetyCheck.reason;
                    }
                }
            });
        }
        if (qrType === QR_TYPES.EMAIL) {
            if (qrData.email && !isValidEmail(qrData.email)) e.email = 'Email không hợp lệ';
            if (qrData.subject) {
                const safetyCheck = isInputSafe(qrData.subject);
                if (!safetyCheck.safe) e.emailSubject = safetyCheck.reason;
            }
            if (qrData.body) {
                const safetyCheck = isInputSafe(qrData.body);
                if (!safetyCheck.safe) e.emailBody = safetyCheck.reason;
            }
        }
        if (qrType === QR_TYPES.SMS || qrType === QR_TYPES.TEL) {
            if (qrData.phone && !isValidPhone(qrData.phone)) e.phone = 'Số điện thoại không hợp lệ';
            if (qrType === QR_TYPES.SMS && qrData.message) {
                const safetyCheck = isInputSafe(qrData.message);
                if (!safetyCheck.safe) e.smsMessage = safetyCheck.reason;
            }
        }
        if (qrType === QR_TYPES.GEO) {
            if (!isValidLatLng(qrData.lat, qrData.lng)) e.geo = 'Tọa độ không hợp lệ (Lat: -90..90, Lng: -180..180)';
        }
        setValidationErrors(e);
    }, [qrType, qrData, level]);

    const PresetButton = ({ preset, selected }) => (
        <button
            aria-label={`${preset.label} - ${preset.desc || preset.px + 'px'}`}
            title={preset.desc || `${preset.px}×${preset.px}px`}
            className={`px-3 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-lg text-sm sm:text-xs font-medium transition-colors ${
                selected === preset.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700/50 dark:hover:bg-slate-700 dark:text-slate-300'
            }`}
            onClick={() => {
                setSize(preset.px);
                setSelectedPreset(preset.id);
                setFormat(preset.format ? preset.format : 'canvas');
            }}
        >
            {preset.label}
        </button>
    );

    const logoPx = Math.round(size * scale);
    const safety = scale === 0 ? 'none' : scale < 0.25 ? 'safe' : scale < 0.3 ? 'caution' : 'risky';

    const handleFgChange = (val) => {
        const n = normalizeHex(val);
        setFgColor(n);
        if (val.length === 4 || val.length === 7) setFgError(!isValidHex(val));
        else setFgError(false);
    };
    const handleBgChange = (val) => {
        const n = normalizeHex(val);
        setBgColor(n);
        if (val.length === 4 || val.length === 7) setBgError(!isValidHex(val));
        else setBgError(false);
    };
    React.useEffect(() => {
        setFgColor((v) => normalizeHex(v));
        setBgColor((v) => normalizeHex(v));
    }, [setFgColor, setBgColor]);

    const suggestSize = React.useMemo(() => {
        const dim = estimateDimension(text.length, level);
        const moduleMin = scale >= 0.2 ? 6 : 4;
        return Math.ceil(dim * moduleMin);
    }, [text, level, scale]);

    React.useEffect(() => {
        if (eccTimeoutRef.current) {
            clearTimeout(eccTimeoutRef.current);
            eccTimeoutRef.current = null;
        }
        if (eccMode === 'AUTO' && level === 'H' && scale >= 0.22) {
            setShowEccNotice(true);
            eccTimeoutRef.current = setTimeout(() => {
                setShowEccNotice(false);
                eccTimeoutRef.current = null;
            }, 3000);
        }
        return () => {
            if (eccTimeoutRef.current) clearTimeout(eccTimeoutRef.current);
        };
    }, [scale, logoUrl, level, eccMode]);

    const canvasWrapRef = React.useRef(null);
    const svgWrapRef = React.useRef(null);

    const qrProps = React.useMemo(() => {
        const sizeNormalized = Math.max(64, Math.floor(size / 4) * 4);

        // Validate data length before creating QR code
        const lengthValidation = validateDataLength(text, level);
        if (!lengthValidation.valid) {
            return {
                value: ' ',
                size: sizeNormalized,
                level,
                includeMargin,
                fgColor,
                bgColor: format === 'canvas' && transparentBg ? 'rgba(0,0,0,0)' : bgColor,
                imageSettings: undefined,
            };
        }

        const imageSettings = logoUrl
            ? {
                  src: logoUrl,
                  height: Math.round(sizeNormalized * scale),
                  width: Math.round(sizeNormalized * scale),
                  excavate: true,
                  crossOrigin: 'anonymous',
              }
            : undefined;

        return {
            value: text || ' ',
            size: sizeNormalized,
            level,
            includeMargin,
            fgColor,
            bgColor: format === 'canvas' && transparentBg ? 'rgba(0,0,0,0)' : bgColor,
            imageSettings,
        };
    }, [text, size, level, includeMargin, fgColor, bgColor, logoUrl, scale, format, transparentBg]);

    React.useEffect(() => {
        const canvas = canvasWrapRef.current?.querySelector('canvas');
        if (canvas && format === 'canvas') {
            try {
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (ctx && typeof ctx.getImageData === 'function' && typeof ctx.putImageData === 'function') {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    ctx.putImageData(imageData, 0, 0);
                }
            } catch {
                // Ignore canvas context errors
            }
            const t = setTimeout(async () => {
                if (size > 2048) {
                    setScanResult({ status: 'success', message: 'QR hợp lệ (bỏ kiểm tra chi tiết ở size lớn)' });
                    return;
                }
                const result = await testQRScan(canvas, includeMargin);
                setScanResult(result);
            }, 500);
            return () => clearTimeout(t);
        }
    }, [qrProps, format, includeMargin, size]);

    const revokeIfBlob = (url) => {
        if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    };
    const onPickLogo = (file) => {
        if (!file) return;

        const maxSize = 4 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error(
                `File quá lớn! Kích thước: ${(file.size / 1024 / 1024).toFixed(1)} MB. Giới hạn: 4 MB. Vui lòng chọn file nhỏ hơn.`,
                { duration: 6000 },
            );
            return;
        }

        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            toast.error('Định dạng không hỗ trợ! Chỉ chấp nhận: PNG, JPG, WebP, SVG', { duration: 5000 });
            return;
        }

        const url = URL.createObjectURL(file);
        setLogoUrl((old) => {
            revokeIfBlob(old);
            return url;
        });
    };
    const handleFileInput = (e) => onPickLogo(e.target.files?.[0]);
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        onPickLogo(file);
    };
    React.useEffect(() => () => revokeIfBlob(logoUrl), [logoUrl]);

    const handleReset = () => {
        if (confirm('Đặt lại tất cả về mặc định?')) {
            setQrType(QR_TYPES.URL);
            setQrData({
                url: 'https://example.com',
                text: '',
                ssid: '',
                password: '',
                encryption: 'WPA',
                hidden: false,
                name: '',
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                org: '',
                vcardUrl: '',
                subject: '',
                body: '',
                message: '',
                lat: '',
                lng: '',
                label: '',
            });
            setSize(360);
            setSelectedPreset('web');
            setEccMode('AUTO');
            setIncludeMargin(true);
            setTransparentBg(false);
            handleFgChange('#000000');
            handleBgChange('#FFFFFF');
            setFormat('canvas');
            setLogoMode('auto');
            revokeIfBlob(logoUrl);
            setLogoUrl('');
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900 transition-colors duration-500 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 dark:text-slate-100 overflow-hidden">
            <header className="flex-shrink-0 border-b border-slate-200 bg-white backdrop-blur-xl shadow-sm transition-all duration-300 dark:border-slate-800/50 dark:bg-slate-900/90">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-5 lg:px-8 py-2 sm:py-2.5">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <img 
                            src={isDark ? logoHPTWhite : logoHPT} 
                            alt="HPT Logo" 
                            className="h-12 w-12 sm:h-14 sm:w-14 object-contain flex-shrink-0 transition-opacity duration-300"
                        />
                        <div className="flex flex-col justify-center">
                            <h1 className="text-base sm:text-lg lg:text-xl font-black leading-tight tracking-tight">
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                    QR Generator
                                </span>
                            </h1>
                            <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5 leading-tight">
                                Tạo mã QR đa dạng & chuyên nghiệp
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-100"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                                    />
                                </svg>
                                <span>Về trang chủ</span>
                            </button>
                        )}
                        <button
                            onClick={handleReset}
                            aria-label="Đặt lại về mặc định"
                            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-800 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                        >
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            <span className="hidden sm:inline">Đặt lại</span>
                        </button>
                        <button
                            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                            aria-pressed={isDark}
                            aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                            className="relative inline-flex h-7 w-12 sm:h-7 sm:w-14 items-center rounded-full bg-gradient-to-r from-slate-200 to-slate-300 transition-all duration-300 hover:from-slate-300 hover:to-slate-400 shadow-sm hover:shadow-md dark:from-slate-700 dark:to-slate-600 dark:hover:from-slate-600 dark:hover:to-slate-500 ring-1 ring-slate-300/50 dark:ring-slate-600/50"
                        >
                            <span
                                className={`inline-flex h-6 w-6 sm:h-6 sm:w-6 transform items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-md transition-all duration-300 text-sm ${
                                    isDark ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0.5'
                                }`}
                            >
                                {isDark ? '🌙' : '☀️'}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-4 sm:gap-6 px-3 sm:px-6 py-3 sm:py-6">
                    <section className="order-1 lg:order-1 flex flex-col rounded-2xl sm:rounded-3xl border-2 border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-900/50 backdrop-blur-sm overflow-hidden">
                        <div className="flex-shrink-0 px-4 sm:px-6 py-5 sm:py-3 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                            <h2 className="text-xl sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                                Tùy chỉnh QR Code
                            </h2>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-4 space-y-3 sm:space-y-4">
                            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-700">
                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                                    Chế độ giao diện:
                                </span>
                                <div className="inline-flex rounded-lg bg-slate-200 dark:bg-slate-700 p-1 border-2 border-slate-400 dark:border-slate-600 shadow-sm">
                                    {['quick', 'pro'].map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setUiMode(m)}
                                            aria-pressed={uiMode === m}
                                            aria-label={`Chế độ ${m === 'quick' ? 'nhanh' : 'chuyên sâu'}`}
                                            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all whitespace-nowrap ${
                                                uiMode === m
                                                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300 dark:ring-indigo-500'
                                                    : 'text-slate-900 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                                            }`}
                                        >
                                            {m === 'quick' ? 'Nhanh' : 'Chuyên sâu'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label 
                                    title="Chọn loại nội dung bạn muốn mã hóa vào QR code. Mỗi loại có định dạng và cách sử dụng khác nhau."
                                >
                                    Loại QR Code
                                </Label>
                                <Select value={qrType} onChange={(e) => setQrType(e.target.value)}>
                                    {Object.entries(QR_TYPE_LABELS).map(([key, { name }]) => (
                                        <option key={key} value={key}>
                                            {name}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border-2 border-slate-300 dark:border-slate-700">
                                {qrType === QR_TYPES.URL && (
                                    <>
                                        <Label htmlFor="url">URL/Website</Label>
                                        <Input
                                            id="url"
                                            placeholder="https://example.com"
                                            value={qrData.url}
                                            onChange={(e) => updateQrData('url', e.target.value)}
                                            error={validationErrors.url}
                                        />
                                        <ErrorMessage message={validationErrors.url} />
                                    </>
                                )}
                                {qrType === QR_TYPES.TEXT && (
                                    <>
                                        <Label htmlFor="text">Văn bản</Label>
                                        <Textarea
                                            id="text"
                                            placeholder="Nhập văn bản..."
                                            value={qrData.text}
                                            onChange={(e) => updateQrData('text', e.target.value)}
                                            rows={4}
                                            error={validationErrors.text}
                                        />
                                        <ErrorMessage message={validationErrors.text} />
                                    </>
                                )}
                                {qrType === QR_TYPES.WIFI && (
                                    <>
                                        <div>
                                            <Label htmlFor="ssid">Tên Wi-Fi (SSID)</Label>
                                            <Input
                                                id="ssid"
                                                placeholder="My_WiFi"
                                                value={qrData.ssid}
                                                onChange={(e) => updateQrData('ssid', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="password">Mật khẩu</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="password123"
                                                value={qrData.password}
                                                onChange={(e) => updateQrData('password', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="encryption">Loại mã hóa</Label>
                                            <Select
                                                id="encryption"
                                                value={qrData.encryption}
                                                onChange={(e) => updateQrData('encryption', e.target.value)}
                                            >
                                                <option value="WPA">WPA/WPA2</option>
                                                <option value="WEP">WEP</option>
                                                <option value="nopass">Không mật khẩu</option>
                                            </Select>
                                        </div>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={qrData.hidden}
                                                onChange={(e) => updateQrData('hidden', e.target.checked)}
                                                className="h-4 w-4 rounded"
                                            />
                                            <span>Wi-Fi ẩn</span>
                                        </label>
                                    </>
                                )}
                                {qrType === QR_TYPES.VCARD && (
                                    <>
                                        <div>
                                            <Label htmlFor="name">Họ tên đầy đủ</Label>
                                            <Input
                                                id="name"
                                                placeholder="Nguyễn Văn A"
                                                value={qrData.name}
                                                onChange={(e) => updateQrData('name', e.target.value)}
                                            />
                                            <p className="text-xs text-slate-700 dark:text-slate-400 mt-1">
                                                Hiển thị trên danh bạ. Hoặc nhập riêng Họ/Tên bên dưới.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label htmlFor="lastName">Họ</Label>
                                                <Input
                                                    id="lastName"
                                                    placeholder="Nguyễn"
                                                    value={qrData.lastName}
                                                    onChange={(e) => updateQrData('lastName', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="firstName">Tên đệm & Tên</Label>
                                                <Input
                                                    id="firstName"
                                                    placeholder="Văn A"
                                                    value={qrData.firstName}
                                                    onChange={(e) => updateQrData('firstName', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="vcard-phone">Số điện thoại</Label>
                                            <Input
                                                id="vcard-phone"
                                                placeholder="+84 123 456 789"
                                                value={qrData.phone}
                                                onChange={(e) => updateQrData('phone', e.target.value)}
                                                error={validationErrors.vcardPhone}
                                            />
                                            <ErrorMessage message={validationErrors.vcardPhone} className="mt-1" />
                                        </div>
                                        <div>
                                            <Label htmlFor="vcard-email">Email</Label>
                                            <Input
                                                id="vcard-email"
                                                placeholder="email@example.com"
                                                value={qrData.email}
                                                onChange={(e) => updateQrData('email', e.target.value)}
                                                error={validationErrors.vcardEmail}
                                            />
                                            <ErrorMessage message={validationErrors.vcardEmail} className="mt-1" />
                                        </div>
                                        <div>
                                            <Label htmlFor="org">Công ty</Label>
                                            <Input
                                                id="org"
                                                placeholder="ABC Company"
                                                value={qrData.org}
                                                onChange={(e) => updateQrData('org', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="vcard-url">Website</Label>
                                            <Input
                                                id="vcard-url"
                                                placeholder="https://company.com"
                                                value={qrData.vcardUrl}
                                                onChange={(e) => updateQrData('vcardUrl', e.target.value)}
                                                error={validationErrors.vcardUrl}
                                            />
                                            <ErrorMessage message={validationErrors.vcardUrl} className="mt-1" />
                                        </div>
                                    </>
                                )}
                                {qrType === QR_TYPES.EMAIL && (
                                    <>
                                        <div>
                                            <Label htmlFor="email">Địa chỉ email</Label>
                                            <Input
                                                id="email"
                                                placeholder="someone@example.com"
                                                value={qrData.email}
                                                onChange={(e) => updateQrData('email', e.target.value)}
                                                error={validationErrors.email}
                                            />
                                            <ErrorMessage message={validationErrors.email} className="mt-1" />
                                        </div>
                                        <div>
                                            <Label htmlFor="subject">Tiêu đề</Label>
                                            <Input
                                                id="subject"
                                                placeholder="Chủ đề email"
                                                value={qrData.subject}
                                                onChange={(e) => updateQrData('subject', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="body">Nội dung</Label>
                                            <Textarea
                                                id="body"
                                                placeholder="Nội dung email..."
                                                value={qrData.body}
                                                onChange={(e) => updateQrData('body', e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                    </>
                                )}
                                {qrType === QR_TYPES.SMS && (
                                    <>
                                        <div>
                                            <Label htmlFor="sms-phone">Số điện thoại</Label>
                                            <Input
                                                id="sms-phone"
                                                placeholder="+84 123 456 789"
                                                value={qrData.phone}
                                                onChange={(e) => updateQrData('phone', e.target.value)}
                                                error={validationErrors.phone}
                                            />
                                            <ErrorMessage message={validationErrors.phone} className="mt-1" />
                                        </div>
                                        <div>
                                            <Label htmlFor="message">Nội dung tin nhắn</Label>
                                            <Textarea
                                                id="message"
                                                placeholder="Tin nhắn..."
                                                value={qrData.message}
                                                onChange={(e) => updateQrData('message', e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                    </>
                                )}
                                {qrType === QR_TYPES.TEL && (
                                    <>
                                        <Label htmlFor="tel-phone">Số điện thoại</Label>
                                        <Input
                                            id="tel-phone"
                                            placeholder="+84 123 456 789"
                                            value={qrData.phone}
                                            onChange={(e) => updateQrData('phone', e.target.value)}
                                            error={validationErrors.phone}
                                        />
                                        <ErrorMessage message={validationErrors.phone} className="mt-1" />
                                    </>
                                )}
                                {qrType === QR_TYPES.GEO && (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label htmlFor="lat">Vĩ độ (Lat)</Label>
                                                <Input
                                                    id="lat"
                                                    placeholder="21.0285"
                                                    value={qrData.lat}
                                                    onChange={(e) => updateQrData('lat', e.target.value)}
                                                    error={validationErrors.geo}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="lng">Kinh độ (Lng)</Label>
                                                <Input
                                                    id="lng"
                                                    placeholder="105.8542"
                                                    value={qrData.lng}
                                                    onChange={(e) => updateQrData('lng', e.target.value)}
                                                    error={validationErrors.geo}
                                                />
                                            </div>
                                        </div>
                                        <ErrorMessage message={validationErrors.geo} />
                                        <div>
                                            <Label htmlFor="geo-label">Nhãn địa điểm</Label>
                                            <Input
                                                id="geo-label"
                                                placeholder="Hà Nội, Việt Nam"
                                                value={qrData.label}
                                                onChange={(e) => updateQrData('label', e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {uiMode === 'quick' && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label title="Kích thước ảnh QR code tính bằng pixel. Kích thước lớn hơn = QR code rõ nét hơn, dễ quét hơn, nhưng file sẽ nặng hơn. Khuyên dùng theo preset hoặc đề xuất của hệ thống.">
                                            Kích thước ảnh
                                        </Label>
                                        <span className="hidden sm:inline text-xs text-slate-700 dark:text-slate-400">
                                            ≈ {(size / 118.11).toFixed(1)} cm @ 300 DPI
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {SIZE_PRESETS.map((p) => (
                                            <PresetButton key={p.id} preset={p} selected={selectedPreset} />
                                        ))}
                                    </div>
                                    <input
                                        type="range"
                                        min={192}
                                        max={4096}
                                        step={32}
                                        value={size}
                                        onChange={(e) => {
                                            setSize(Number(e.target.value));
                                            setSelectedPreset(null);
                                        }}
                                        className="w-full accent-indigo-600 cursor-pointer"
                                    />
                                    <p className="text-xs text-slate-800 dark:text-slate-400 font-medium">
                                        Đề xuất: {suggestSize}px (module ≥ {scale >= 0.2 ? '6' : '4'}px)
                                    </p>
                                </div>
                            )}

                            {uiMode === 'pro' && (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label title="Kích thước ảnh QR code tính bằng pixel. Kích thước lớn hơn = QR code rõ nét hơn, dễ quét hơn, nhưng file sẽ nặng hơn. Khuyên dùng theo preset hoặc đề xuất của hệ thống.">
                                                Kích thước ảnh (px)
                                            </Label>
                                            <span className="text-xs text-slate-700 dark:text-slate-400">
                                                ≈ {(size / 118.11).toFixed(1)} cm @ 300 DPI
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {SIZE_PRESETS.map((p) => (
                                                <PresetButton key={p.id} preset={p} selected={selectedPreset} />
                                            ))}
                                        </div>
                                        <Input
                                            type="number"
                                            min={96}
                                            max={8192}
                                            value={size}
                                            onChange={(e) => {
                                                const v = Math.min(4096, Math.max(96, Number(e.target.value) || 0));
                                                setSize(v);
                                                setSelectedPreset(null);
                                            }}
                                        />
                                        <input
                                            type="range"
                                            min={96}
                                            max={4096}
                                            step={16}
                                            value={size}
                                            onChange={(e) => {
                                                setSize(Number(e.target.value));
                                                setSelectedPreset(null);
                                            }}
                                            className="w-full accent-indigo-600 cursor-pointer mt-1"
                                        />
                                        <p className="text-xs text-slate-700 dark:text-slate-400">
                                            {size > 2048
                                                ? 'Ảnh lớn có thể chậm. Khuyên dùng SVG để in ấn nét.'
                                                : `Đề xuất: ${suggestSize}px (module ≥ ${scale >= 0.2 ? '6' : '4'}px)`}
                                        </p>
                                    </div>

                                    <div className="space-y-2" role="group" aria-labelledby="ecc-label">
                                        <div className="flex items-center justify-between">
                                            <div
                                                id="ecc-label"
                                                className="block text-base sm:text-sm font-bold text-slate-700 dark:text-slate-200 cursor-help"
                                                title="ECC = Khả năng tự sửa lỗi. Cao hơn → QR dày hơn, phù hợp khi có logo"
                                            >
                                                Độ bền (ECC)
                                            </div>
                                            {eccMode === 'AUTO' && (
                                                <span className="hidden sm:inline text-sm sm:text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                    Khuyên dùng: {level}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {['AUTO', 'L', 'M', 'Q', 'H'].map((e) => (
                                                <button
                                                    key={e}
                                                    className={`px-3 py-2 sm:py-1.5 rounded-lg text-base sm:text-sm font-medium transition-colors ${
                                                        eccMode === e
                                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md dark:from-indigo-500 dark:to-purple-500'
                                                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200'
                                                    }`}
                                                    onClick={() => setEccMode(e)}
                                                    title={
                                                        e === 'AUTO'
                                                            ? 'Tự động chọn theo logo/màu'
                                                            : e === 'L'
                                                            ? 'L ~7%: nhẹ, QR thoáng (không logo)'
                                                            : e === 'M'
                                                            ? 'M ~15%: chuẩn khuyên dùng'
                                                            : e === 'Q'
                                                            ? 'Q ~25%: bền'
                                                            : 'H ~30%: rất bền (logo/bo góc/bẩn)'
                                                    }
                                                >
                                                    {e === 'AUTO' ? 'Tự động' : e}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-700 dark:text-slate-400">
                                            Độ bền cao → QR dày đặc → cần tăng kích thước
                                        </p>
                                    </div>

                                    {showEccNotice && (
                                        <div
                                            className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-2 dark:bg-indigo-900/20 dark:border-indigo-800"
                                            role="alert"
                                            aria-live="polite"
                                        >
                                            <p className="text-xs text-indigo-700 dark:text-indigo-300">
                                                Logo lớn → tự động chọn ECC H (30%)
                                            </p>
                                        </div>
                                    )}

                                    {logoUrl && scale >= 0.1 && (
                                        <div
                                            className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 dark:bg-amber-900/20 dark:border-amber-800"
                                            role="alert"
                                            aria-live="polite"
                                        >
                                            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                                                Có logo: Dùng ECC Q/H và module ≥6px để quét tốt
                                            </p>
                                            {size < suggestSize && (
                                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                                    Gợi ý tăng lên {suggestSize}px
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label
                                                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400"
                                                title="Màu của mã QR. Nên tối để dễ quét (contrast ≥4.5:1)"
                                            >
                                                Màu QR
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={fgColor}
                                                    onChange={(e) => handleFgChange(e.target.value.toUpperCase())}
                                                    className="h-11 w-14 cursor-pointer rounded-lg border-2 border-slate-300 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:scale-105"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <Input
                                                        value={fgColor}
                                                        onChange={(e) => handleFgChange(e.target.value.toUpperCase())}
                                                        className="font-mono text-xs uppercase tracking-tight h-11"
                                                        error={fgError}
                                                        placeholder="#000000"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label
                                                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400"
                                                title="Màu nền. Nên sáng để dễ quét. Tối thiểu contrast 4.5:1"
                                            >
                                                Màu nền
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={bgColor}
                                                    onChange={(e) => handleBgChange(e.target.value.toUpperCase())}
                                                    className="h-11 w-14 cursor-pointer rounded-lg border-2 border-slate-300 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:scale-105"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <Input
                                                        value={bgColor}
                                                        onChange={(e) => handleBgChange(e.target.value.toUpperCase())}
                                                        className="font-mono text-xs uppercase tracking-tight h-11"
                                                        error={bgError}
                                                        placeholder="#FFFFFF"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-gradient-to-br from-indigo-100/50 to-purple-100/50 p-3 dark:bg-slate-800 dark:border-slate-600 border-2 border-indigo-200 dark:border-slate-600 space-y-2">
                                        <label
                                            className="flex items-center gap-2 text-sm font-bold cursor-pointer text-slate-900 dark:text-slate-100"
                                            title="Viền trắng giúp máy quét nhận biết QR dễ hơn. Khuyên bật."
                                        >
                                            <input
                                                type="checkbox"
                                                checked={includeMargin}
                                                onChange={(e) => setIncludeMargin(e.target.checked)}
                                                className="h-4 w-4 rounded-lg accent-indigo-600 dark:accent-indigo-400"
                                            />
                                            <span className="dark:text-slate-100">Thêm viền trắng (Quiet Zone)</span>
                                        </label>
                                        {format === 'canvas' && (
                                            <label
                                                className="flex items-center gap-2 text-sm font-bold cursor-pointer text-slate-900 dark:text-slate-100"
                                                title="Chỉ PNG hỗ trợ trong suốt. JPG sẽ tự chuyển nền trắng."
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={transparentBg}
                                                    onChange={(e) => setTransparentBg(e.target.checked)}
                                                    className="h-4 w-4 rounded-lg accent-indigo-600 dark:accent-indigo-400"
                                                />
                                                <span className="dark:text-slate-100">Nền trong suốt (PNG)</span>
                                            </label>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label title="PNG/JPG: ảnh pixels. SVG: vector, phóng to không vỡ, nhẹ hơn.">
                                            Định dạng
                                        </Label>
                                        <div className="flex w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1.5 border-2 border-slate-300 dark:border-slate-600 shadow-inner">
                                            {[
                                                { v: 'canvas', label: 'PNG/JPG' },
                                                { v: 'svg', label: 'SVG' },
                                            ].map(({ v, label }) => (
                                                <button
                                                    key={v}
                                                    onClick={() => setFormat(v)}
                                                    className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                                                        format === v
                                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md ring-2 ring-indigo-300/50 dark:from-indigo-500 dark:to-purple-500 dark:ring-indigo-400/30'
                                                            : 'bg-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/60'
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            hint="Logo giữa mã QR. PNG trong suốt tốt nhất."
                                            title="Logo che ≤20-25% QR. Cần ECC Q hoặc H để bù phần che."
                                        >
                                            Logo (tùy chọn)
                                        </Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileInput}
                                            className="text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 dark:file:bg-indigo-900/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-indigo-700 dark:file:text-indigo-300 cursor-pointer"
                                        />
                                        {logoUrl && (
                                            <button
                                                onClick={() => {
                                                    revokeIfBlob(logoUrl);
                                                    setLogoUrl('');
                                                }}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                                            >
                                                Xóa logo
                                            </button>
                                        )}
                                    </div>

                                    {logoUrl && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Kích thước logo</Label>
                                                <span className="text-xs text-slate-700">≈ {logoPx}px</span>
                                            </div>
                                            <div className="grid grid-cols-5 gap-2">
                                                {[
                                                    { v: 's', label: 'S', desc: 'Nhỏ 10%' },
                                                    { v: 'm', label: 'M', desc: 'Vừa 15%' },
                                                    { v: 'l', label: 'L', desc: 'Lớn 20%' },
                                                    { v: 'auto', label: 'Auto', desc: 'Tự động' },
                                                    { v: 'custom', label: 'Tùy', desc: 'Tùy chỉnh' },
                                                ].map(({ v, label, desc }) => (
                                                    <button
                                                        key={v}
                                                        onClick={() => setLogoMode(v)}
                                                        aria-label={`${label} - ${desc}`}
                                                        className={`rounded-lg px-2 py-2 text-xs font-medium ${
                                                            logoMode === v
                                                                ? 'bg-indigo-600 text-white shadow-md'
                                                                : 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                            {logoMode === 'custom' && (
                                                <>
                                                    <input
                                                        type="range"
                                                        min={0.1}
                                                        max={0.35}
                                                        step={0.01}
                                                        value={customLogoScale}
                                                        onChange={(e) => setCustomLogoScale(Number(e.target.value))}
                                                        className="w-full accent-indigo-600 cursor-pointer"
                                                    />
                                                    <div className="flex justify-between text-xs text-slate-700">
                                                        <span>10%</span>
                                                        <span className="font-medium">
                                                            {Math.round(customLogoScale * 100)}%
                                                        </span>
                                                        <span>35%</span>
                                                    </div>
                                                </>
                                            )}
                                            <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
                                                <span
                                                    className={`flex items-center gap-2 text-xs font-semibold ${
                                                        safety === 'safe'
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : safety === 'caution'
                                                            ? 'text-amber-600 dark:text-amber-400'
                                                            : 'text-rose-600 dark:text-rose-400'
                                                    }`}
                                                >
                                                    {safety === 'safe' && (
                                                        <>
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>An toàn</span>
                                                        </>
                                                    )}
                                                    {safety === 'caution' && (
                                                        <>
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>Cẩn trọng</span>
                                                        </>
                                                    )}
                                                    {safety === 'risky' && (
                                                        <>
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>Rủi ro cao</span>
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="flex-shrink-0 border-t-2 border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 space-y-2 bg-slate-50 dark:bg-slate-800/50">
                            {contrastRatio < 4.5 && (
                                <WarningMessage 
                                    message={contrastRatio < 2.5
                                        ? 'Màu khó quét (tương phản quá thấp)'
                                        : 'Màu có thể khó quét khi in ấn (khuyên dùng ≥ 4.5:1)'}
                                    className="mb-2 text-amber-600 dark:text-amber-500"
                                />
                            )}

                            <ExportPanel
                                format={format}
                                canvasRef={canvasWrapRef}
                                svgRef={svgWrapRef}
                                includeMargin={includeMargin}
                                transparentBg={transparentBg}
                                bgColor={bgColor}
                            />
                        </div>
                    </section>

                    <section className="order-2 lg:order-2 flex flex-col">
                        <div className="flex-shrink-0 mb-4 sm:mb-5">
                            <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
                                Xem trước
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-400 mt-1 font-medium">
                                {QR_TYPE_LABELS[qrType]?.desc || 'Kéo & thả logo vào khung'}
                            </p>
                        </div>

                        {qrType === QR_TYPES.URL && qrData.url && (
                            <div className="mb-4 rounded-xl px-4 py-3 text-xs bg-blue-50 border-2 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                                <p className="font-bold text-blue-800 dark:text-blue-300 mb-1">
                                    Link đích: <span className="font-mono">{qrData.url}</span>
                                </p>
                                {!isSafeHttpUrl(qrData.url) && (
                                    <WarningMessage message="Cảnh báo: Link không phải http/https - có thể nguy hiểm!" />
                                )}
                            </div>
                        )}

                        {scanResult && (
                            <div
                                className={`mb-4 rounded-xl border-2 px-4 py-3 text-sm font-bold flex items-start gap-2 ${
                                    scanResult.status === 'success'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700'
                                        : scanResult.status === 'warning'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700'
                                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-700'
                                }`}
                                role="status"
                                aria-live="polite"
                            >
                                {scanResult.status === 'success' && (
                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                                {scanResult.status === 'warning' && (
                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                )}
                                {scanResult.status === 'error' && (
                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                )}
                                <span>{scanResult.message}</span>
                            </div>
                        )}

                        {qrType === QR_TYPES.WIFI && qrData.ssid && (
                            <div className="mb-4 rounded-xl px-4 py-3 text-xs bg-amber-50 border-2 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                                <p className="font-bold text-amber-800 dark:text-amber-300">
                                    Lưu ý: Chỉ chia sẻ mật khẩu Wi-Fi với người tin cậy
                                </p>
                            </div>
                        )}

                        {(qrType === QR_TYPES.SMS || qrType === QR_TYPES.TEL) && qrData.phone && (
                            <div className="mb-4 rounded-xl px-4 py-3 text-xs bg-blue-50 border-2 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                                <p className="font-bold text-blue-800 dark:text-blue-300">
                                    Thiết bị sẽ hỏi xác nhận trước khi{' '}
                                    {qrType === QR_TYPES.SMS ? 'gửi tin nhắn' : 'gọi điện'}
                                </p>
                            </div>
                        )}

                        <QrPreview
                            qrProps={qrProps}
                            format={format}
                            canvasRef={canvasWrapRef}
                            svgRef={svgWrapRef}
                            qrContent={text}
                            onDrop={handleDrop}
                            isLoading={false}
                        />
                    </section>
                </div>
            </main>

        </div>
    );
}
