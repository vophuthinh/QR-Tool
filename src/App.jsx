import React from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';

import QrPreview from './components/QrPreview';
import ExportPanel from './components/ExportPanel';
import { useToast } from './hooks/useToast.jsx';
import { useTheme } from './hooks/useTheme';
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
} from './utils/qr-helpers';
import { testQRScan, cleanupReader } from './utils/qr-scanner';

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
    url: { name: 'URL/Website', icon: '🔗', desc: 'Liên kết web' },
    text: { name: 'Text', icon: '📝', desc: 'Văn bản thuần' },
    wifi: { name: 'Wi-Fi', icon: '📶', desc: 'Kết nối Wi-Fi' },
    vcard: { name: 'vCard', icon: '👤', desc: 'Danh thiếp' },
    email: { name: 'Email', icon: '📧', desc: 'Gửi email' },
    sms: { name: 'SMS', icon: '💬', desc: 'Tin nhắn' },
    tel: { name: 'Điện thoại', icon: '☎️', desc: 'Gọi điện' },
    geo: { name: 'Vị trí', icon: '📍', desc: 'Tọa độ GPS' },
};

const escWiFi = (s = '') => s.replace(/([;,:\\"])/g, '\\$1');
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
        {hint && <p className="mt-1 text-sm sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{hint}</p>}
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
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 dark:border-slate-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/30 ') +
            className
        }
        {...props}
    />
));
Input.displayName = 'Input';

const Select = ({ className = '', ...props }) => (
    <select
        className={
            'w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base sm:text-sm shadow-sm transition-all duration-200 ' +
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
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 dark:border-slate-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/30 ') +
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

export default function App() {
    const { showToast, ToastContainer } = useToast();
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

    const updateQrData = (k, v) => setQrData((prev) => ({ ...prev, [k]: v }));

    const [validationErrors, setValidationErrors] = React.useState({});

    React.useEffect(() => {
        const e = {};
        if (qrType === QR_TYPES.URL && qrData.url) {
            if (!isValidURL(qrData.url)) e.url = 'URL không hợp lệ';
            else if (!isSafeHttpUrl(qrData.url)) e.url = '⚠️ Chỉ nên dùng http:// hoặc https://';
        }
        if (qrType === QR_TYPES.VCARD) {
            if (qrData.email && !isValidEmail(qrData.email)) e.vcardEmail = 'Email không hợp lệ';
            if (qrData.vcardUrl && !isValidURL(qrData.vcardUrl)) e.vcardUrl = 'URL không hợp lệ';
            else if (qrData.vcardUrl && !isSafeHttpUrl(qrData.vcardUrl))
                e.vcardUrl = '⚠️ Chỉ nên dùng http:// hoặc https://';
            if (qrData.phone && !isValidPhone(qrData.phone)) e.vcardPhone = 'Số điện thoại không hợp lệ';
        }
        if (qrType === QR_TYPES.EMAIL) {
            if (qrData.email && !isValidEmail(qrData.email)) e.email = 'Email không hợp lệ';
        }
        if (qrType === QR_TYPES.SMS || qrType === QR_TYPES.TEL) {
            if (qrData.phone && !isValidPhone(qrData.phone)) e.phone = 'Số điện thoại không hợp lệ';
        }
        if (qrType === QR_TYPES.GEO) {
            if (!isValidLatLng(qrData.lat, qrData.lng)) e.geo = 'Tọa độ không hợp lệ (Lat: -90..90, Lng: -180..180)';
        }
        setValidationErrors(e);
    }, [qrType, qrData]);

    const qrContent = React.useMemo(() => generateQRContent(qrType, qrData), [qrType, qrData]);
    const text = useDebounced(qrContent, 200);

    const SIZE_PRESETS = [
        { id: 'web', label: '🌐 Web/App', px: 512, desc: 'Hiển thị web' },
        { id: '3cm', label: '📱 Tem nhỏ 3cm', px: 354, desc: '3×3cm @300DPI' },
        { id: '5cm', label: '🎫 Tem 5cm', px: 591, desc: '5×5cm @300DPI' },
        { id: '8cm', label: '📄 Tờ rơi 8cm', px: 945, desc: '8×8cm @300DPI' },
        { id: 'a4', label: '📃 In A4', px: 2048, desc: '17cm @300DPI' },
        { id: 'poster', label: '🖼️ Poster lớn', px: 4096, format: 'svg', desc: '35cm+ SVG' },
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
    // normalize once on mount
    React.useEffect(() => {
        setFgColor((v) => normalizeHex(v));
        setBgColor((v) => normalizeHex(v));
    }, [setFgColor, setBgColor]);

    const contrastRatio = React.useMemo(() => getContrastRatio(relLum(fgColor), relLum(bgColor)), [fgColor, bgColor]);

    const level = React.useMemo(() => {
        const contrastOk = contrastRatio >= 3.5;
        return pickECC(eccMode, scale, contrastOk);
    }, [eccMode, scale, contrastRatio]);

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
                // Ignore
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

        // Limit file size to 4MB
        const maxSize = 4 * 1024 * 1024; // 4MB
        if (file.size > maxSize) {
            showToast(
                `❌ File quá lớn! Kích thước: ${(file.size / 1024 / 1024).toFixed(1)} MB. Giới hạn: 4 MB. Vui lòng chọn file nhỏ hơn.`,
                'error',
                6000,
            );
            return;
        }

        // Check file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            showToast('❌ Định dạng không hỗ trợ! Chỉ chấp nhận: PNG, JPG, WebP, SVG', 'error', 5000);
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
        <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-slate-900 transition-colors duration-500 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 dark:text-slate-100 overflow-hidden">
            <header className="flex-shrink-0 border-b border-indigo-100/50 bg-white/90 backdrop-blur-xl shadow-lg transition-all duration-300 dark:border-slate-800/50 dark:bg-slate-900/90">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/30 ring-2 ring-white dark:ring-slate-900">
                            <svg
                                className="h-7 w-7 sm:h-8 sm:w-8 text-white drop-shadow-lg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                                QR Generator Pro
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                Tạo mã QR đa dạng & chuyên nghiệp
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={handleReset}
                            aria-label="Đặt lại về mặc định"
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm hover:shadow-md"
                        >
                            <span className="text-base">🔄</span>
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                        <button
                            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                            aria-pressed={isDark}
                            aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                            className="relative inline-flex h-9 w-16 sm:h-10 sm:w-[4.5rem] items-center rounded-full bg-gradient-to-r from-slate-200 to-slate-300 transition-all duration-300 hover:from-slate-300 hover:to-slate-400 shadow-md hover:shadow-lg dark:from-slate-700 dark:to-slate-600 dark:hover:from-slate-600 dark:hover:to-slate-500 ring-2 ring-slate-300/50 dark:ring-slate-600/50"
                        >
                            <span
                                className={`inline-flex h-7 w-7 sm:h-8 sm:w-8 transform items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-lg transition-all duration-300 text-base sm:text-lg ${
                                    isDark ? 'translate-x-8 sm:translate-x-9' : 'translate-x-1'
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
                    <section className="order-1 lg:order-1 flex flex-col rounded-2xl sm:rounded-3xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 shadow-2xl dark:border-slate-700 dark:from-slate-900 dark:to-slate-800/50 backdrop-blur-sm overflow-hidden">
                        <div className="flex-shrink-0 px-4 sm:px-6 py-5 sm:py-3 border-b border-indigo-100 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-3">
                                <h2 className="text-xl sm:text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-shrink-0">
                                    <span className="text-2xl sm:text-lg">⚙️</span>
                                    <span className="whitespace-nowrap">Tùy chỉnh QR Code</span>
                                </h2>
                                <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline whitespace-nowrap">
                                        Giao diện:
                                    </span>
                                    <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 w-full sm:w-auto">
                                        {['quick', 'pro'].map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setUiMode(m)}
                                                aria-pressed={uiMode === m}
                                                aria-label={`Chế độ ${m === 'quick' ? 'nhanh' : 'chuyên sâu'}`}
                                                className={`flex-1 sm:flex-none px-6 py-2.5 sm:px-3 sm:py-1.5 text-sm sm:text-xs font-bold rounded-lg transition whitespace-nowrap ${
                                                    uiMode === m
                                                        ? 'bg-indigo-600 text-white shadow-md'
                                                        : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                {m === 'quick' ? '🚀 Nhanh' : '⚡ Chuyên sâu'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-4 space-y-3 sm:space-y-4">
                            <div className="space-y-2">
                                <Label>Loại QR Code</Label>
                                <Select value={qrType} onChange={(e) => setQrType(e.target.value)}>
                                    {Object.entries(QR_TYPE_LABELS).map(([key, { name, icon }]) => (
                                        <option key={key} value={key}>
                                            {icon} {name}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 p-4 border border-slate-200 dark:border-slate-700">
                                {qrType === QR_TYPES.URL && (
                                    <>
                                        <Label htmlFor="url">🔗 URL/Website</Label>
                                        <Input
                                            id="url"
                                            placeholder="https://example.com"
                                            value={qrData.url}
                                            onChange={(e) => updateQrData('url', e.target.value)}
                                            error={validationErrors.url}
                                        />
                                        {validationErrors.url && (
                                            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                                                ⚠️ {validationErrors.url}
                                            </p>
                                        )}
                                    </>
                                )}
                                {qrType === QR_TYPES.TEXT && (
                                    <>
                                        <Label htmlFor="text">📝 Văn bản</Label>
                                        <Textarea
                                            id="text"
                                            placeholder="Nhập văn bản..."
                                            value={qrData.text}
                                            onChange={(e) => updateQrData('text', e.target.value)}
                                            rows={4}
                                        />
                                    </>
                                )}
                                {qrType === QR_TYPES.WIFI && (
                                    <>
                                        <div>
                                            <Label htmlFor="ssid">📶 Tên Wi-Fi (SSID)</Label>
                                            <Input
                                                id="ssid"
                                                placeholder="My_WiFi"
                                                value={qrData.ssid}
                                                onChange={(e) => updateQrData('ssid', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="password">🔐 Mật khẩu</Label>
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
                                            <Label htmlFor="name">👤 Họ tên đầy đủ</Label>
                                            <Input
                                                id="name"
                                                placeholder="Nguyễn Văn A"
                                                value={qrData.name}
                                                onChange={(e) => updateQrData('name', e.target.value)}
                                            />
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
                                            <Label htmlFor="vcard-phone">☎️ Số điện thoại</Label>
                                            <Input
                                                id="vcard-phone"
                                                placeholder="+84 123 456 789"
                                                value={qrData.phone}
                                                onChange={(e) => updateQrData('phone', e.target.value)}
                                                error={validationErrors.vcardPhone}
                                            />
                                            {validationErrors.vcardPhone && (
                                                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                                                    ⚠️ {validationErrors.vcardPhone}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="vcard-email">📧 Email</Label>
                                            <Input
                                                id="vcard-email"
                                                placeholder="email@example.com"
                                                value={qrData.email}
                                                onChange={(e) => updateQrData('email', e.target.value)}
                                                error={validationErrors.vcardEmail}
                                            />
                                            {validationErrors.vcardEmail && (
                                                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                                                    ⚠️ {validationErrors.vcardEmail}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="org">🏢 Công ty</Label>
                                            <Input
                                                id="org"
                                                placeholder="ABC Company"
                                                value={qrData.org}
                                                onChange={(e) => updateQrData('org', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="vcard-url">🔗 Website</Label>
                                            <Input
                                                id="vcard-url"
                                                placeholder="https://company.com"
                                                value={qrData.vcardUrl}
                                                onChange={(e) => updateQrData('vcardUrl', e.target.value)}
                                                error={validationErrors.vcardUrl}
                                            />
                                            {validationErrors.vcardUrl && (
                                                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                                                    ⚠️ {validationErrors.vcardUrl}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                                {qrType === QR_TYPES.EMAIL && (
                                    <>
                                        <div>
                                            <Label htmlFor="email">📧 Địa chỉ email</Label>
                                            <Input
                                                id="email"
                                                placeholder="someone@example.com"
                                                value={qrData.email}
                                                onChange={(e) => updateQrData('email', e.target.value)}
                                                error={validationErrors.email}
                                            />
                                            {validationErrors.email && (
                                                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                                                    ⚠️ {validationErrors.email}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="subject">📝 Tiêu đề</Label>
                                            <Input
                                                id="subject"
                                                placeholder="Chủ đề email"
                                                value={qrData.subject}
                                                onChange={(e) => updateQrData('subject', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="body">💬 Nội dung</Label>
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
                                            <Label htmlFor="sms-phone">☎️ Số điện thoại</Label>
                                            <Input
                                                id="sms-phone"
                                                placeholder="+84 123 456 789"
                                                value={qrData.phone}
                                                onChange={(e) => updateQrData('phone', e.target.value)}
                                                error={validationErrors.phone}
                                            />
                                            {validationErrors.phone && (
                                                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                                                    ⚠️ {validationErrors.phone}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="message">💬 Nội dung tin nhắn</Label>
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
                                        <Label htmlFor="tel-phone">☎️ Số điện thoại</Label>
                                        <Input
                                            id="tel-phone"
                                            placeholder="+84 123 456 789"
                                            value={qrData.phone}
                                            onChange={(e) => updateQrData('phone', e.target.value)}
                                            error={validationErrors.phone}
                                        />
                                        {validationErrors.phone && (
                                            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                                                ⚠️ {validationErrors.phone}
                                            </p>
                                        )}
                                    </>
                                )}
                                {qrType === QR_TYPES.GEO && (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label htmlFor="lat">📍 Vĩ độ (Lat)</Label>
                                                <Input
                                                    id="lat"
                                                    placeholder="21.0285"
                                                    value={qrData.lat}
                                                    onChange={(e) => updateQrData('lat', e.target.value)}
                                                    error={validationErrors.geo}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="lng">📍 Kinh độ (Lng)</Label>
                                                <Input
                                                    id="lng"
                                                    placeholder="105.8542"
                                                    value={qrData.lng}
                                                    onChange={(e) => updateQrData('lng', e.target.value)}
                                                    error={validationErrors.geo}
                                                />
                                            </div>
                                        </div>
                                        {validationErrors.geo && (
                                            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                                                ⚠️ {validationErrors.geo}
                                            </p>
                                        )}
                                        <div>
                                            <Label htmlFor="geo-label">🏷️ Nhãn địa điểm</Label>
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
                                        <Label>📏 Kích thước ảnh</Label>
                                        <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
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
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                        Đề xuất: {suggestSize}px (module ≥ {scale >= 0.2 ? '6' : '4'}px)
                                    </p>
                                </div>
                            )}

                            {uiMode === 'pro' && (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>📏 Kích thước ảnh (px)</Label>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
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
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {size > 2048
                                                ? '⚠️ Ảnh lớn có thể chậm. Khuyên dùng SVG để in ấn nét.'
                                                : `Đề xuất: ${suggestSize}px (module ≥ ${scale >= 0.2 ? '6' : '4'}px)`}
                                        </p>
                                    </div>

                                    <div className="space-y-2" role="group" aria-labelledby="ecc-label">
                                        <div className="flex items-center justify-between">
                                            <div
                                                id="ecc-label"
                                                className="block text-base sm:text-sm font-bold text-slate-700 dark:text-slate-200"
                                                title="ECC = Khả năng tự sửa lỗi. Cao hơn → QR dày hơn, phù hợp khi có logo"
                                            >
                                                🛡️ Độ bền (ECC)
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
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700/50 dark:hover:bg-slate-700 dark:text-slate-300'
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
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
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
                                                ℹ️ Logo lớn → tự động chọn ECC H (30%)
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
                                                💡 Có logo: Dùng ECC Q/H và module ≥6px để quét tốt
                                            </p>
                                            {size < suggestSize && (
                                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                                    Gợi ý tăng lên {suggestSize}px
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Colors */}
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

                                    <div className="rounded-2xl bg-gradient-to-br from-indigo-100/50 to-purple-100/50 p-3 dark:from-slate-800 dark:to-slate-800/50 border-2 border-indigo-200 dark:border-slate-700 space-y-2">
                                        <label
                                            className="flex items-center gap-2 text-sm font-bold cursor-pointer"
                                            title="Viền trắng giúp máy quét nhận biết QR dễ hơn. Khuyên bật."
                                        >
                                            <input
                                                type="checkbox"
                                                checked={includeMargin}
                                                onChange={(e) => setIncludeMargin(e.target.checked)}
                                                className="h-4 w-4 rounded-lg"
                                            />
                                            <span>Thêm viền trắng (Quiet Zone)</span>
                                        </label>
                                        {format === 'canvas' && (
                                            <label
                                                className="flex items-center gap-2 text-sm font-bold cursor-pointer"
                                                title="Chỉ PNG hỗ trợ trong suốt. JPG sẽ tự chuyển nền trắng."
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={transparentBg}
                                                    onChange={(e) => setTransparentBg(e.target.checked)}
                                                    className="h-4 w-4 rounded-lg"
                                                />
                                                <span>Nền trong suốt (PNG)</span>
                                            </label>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label title="PNG/JPG: ảnh pixels. SVG: vector, phóng to không vỡ, nhẹ hơn.">
                                            🖼️ Định dạng
                                        </Label>
                                        <div className="flex w-full rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 p-1 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700">
                                            {[
                                                { v: 'canvas', label: 'PNG/JPG' },
                                                { v: 'svg', label: 'SVG' },
                                            ].map(({ v, label }) => (
                                                <button
                                                    key={v}
                                                    onClick={() => setFormat(v)}
                                                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                                                        format === v
                                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                                            : 'text-slate-600 hover:bg-white/50 dark:text-slate-300'
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
                                            🖼️ Logo (tùy chọn)
                                        </Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileInput}
                                            className="text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-indigo-700 cursor-pointer"
                                        />
                                        {logoUrl && (
                                            <button
                                                onClick={() => {
                                                    revokeIfBlob(logoUrl);
                                                    setLogoUrl('');
                                                }}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                                            >
                                                🗑️ Xóa logo
                                            </button>
                                        )}
                                    </div>

                                    {logoUrl && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>📐 Kích thước logo</Label>
                                                <span className="text-xs text-slate-500">≈ {logoPx}px</span>
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
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
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
                                                    <div className="flex justify-between text-xs text-slate-500">
                                                        <span>10%</span>
                                                        <span className="font-medium">
                                                            {Math.round(customLogoScale * 100)}%
                                                        </span>
                                                        <span>35%</span>
                                                    </div>
                                                </>
                                            )}
                                            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
                                                <span
                                                    className={`text-xs font-semibold ${
                                                        safety === 'safe'
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : safety === 'caution'
                                                            ? 'text-amber-600 dark:text-amber-400'
                                                            : 'text-rose-600 dark:text-rose-400'
                                                    }`}
                                                >
                                                    {safety === 'safe' && '✓ An toàn'}
                                                    {safety === 'caution' && '⚠ Cẩn trọng'}
                                                    {safety === 'risky' && '⚠ Rủi ro cao'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="flex-shrink-0 border-t-2 border-indigo-100 dark:border-slate-800 px-4 sm:px-6 py-3 space-y-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/50">
                            {contrastRatio < 4.5 && (
                                <p className="text-xs text-amber-600 dark:text-amber-500 mb-2">
                                    {contrastRatio < 2.5
                                        ? '⚠️ Màu khó quét (tương phản quá thấp)'
                                        : '⚠️ Màu có thể khó quét khi in ấn (khuyên dùng ≥ 4.5:1)'}
                                </p>
                            )}

                            <ExportPanel
                                format={format}
                                canvasRef={canvasWrapRef}
                                svgRef={svgWrapRef}
                                includeMargin={includeMargin}
                                transparentBg={transparentBg}
                                bgColor={bgColor}
                                onError={(message, type) => showToast(message, type, 5000)}
                            />
                        </div>
                    </section>

                    <section className="order-2 lg:order-2 flex flex-col">
                        <div className="flex-shrink-0 mb-4 sm:mb-5">
                            <h2 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
                                Xem trước
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                                {QR_TYPE_LABELS[qrType]?.desc || 'Kéo & thả logo vào khung'}
                            </p>
                        </div>

                        {qrType === QR_TYPES.URL && qrData.url && (
                            <div className="mb-4 rounded-xl px-4 py-3 text-xs bg-blue-50 border-2 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                                <p className="font-bold text-blue-800 dark:text-blue-300 mb-1">
                                    🔗 Link đích: <span className="font-mono">{qrData.url}</span>
                                </p>
                                {!isSafeHttpUrl(qrData.url) && (
                                    <p className="text-amber-700 dark:text-amber-400 font-semibold">
                                        ⚠️ Cảnh báo: Link không phải http/https - có thể nguy hiểm!
                                    </p>
                                )}
                            </div>
                        )}

                        {scanResult && (
                            <div
                                className={`mb-4 rounded-xl border-2 px-4 py-3 text-sm font-bold ${
                                    scanResult.status === 'success'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700'
                                        : scanResult.status === 'warning'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700'
                                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-700'
                                }`}
                                role="status"
                                aria-live="polite"
                            >
                                {scanResult.message}
                            </div>
                        )}

                        {qrType === QR_TYPES.WIFI && qrData.ssid && (
                            <div className="mb-4 rounded-xl px-4 py-3 text-xs bg-amber-50 border-2 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                                <p className="font-bold text-amber-800 dark:text-amber-300">
                                    📶 Lưu ý: Chỉ chia sẻ mật khẩu Wi-Fi với người tin cậy
                                </p>
                            </div>
                        )}

                        {(qrType === QR_TYPES.SMS || qrType === QR_TYPES.TEL) && qrData.phone && (
                            <div className="mb-4 rounded-xl px-4 py-3 text-xs bg-blue-50 border-2 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                                <p className="font-bold text-blue-800 dark:text-blue-300">
                                    ☎️ Thiết bị sẽ hỏi xác nhận trước khi{' '}
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
                        />
                    </section>
                </div>
            </main>

            <ToastContainer />
        </div>
    );
}
