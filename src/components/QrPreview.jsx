import React from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';

/**
 * QR Code preview component with canvas/SVG rendering
 * @param {Object} props
 * @param {Object} props.qrProps - Props for QRCode component (value, size, level, etc.)
 * @param {string} props.format - Render format ('canvas' or 'svg')
 * @param {React.RefObject} props.canvasRef - Ref for canvas wrapper
 * @param {React.RefObject} props.svgRef - Ref for SVG wrapper
 * @param {string} props.qrContent - QR content for aria-label
 * @param {Function} props.onDrop - Optional drag-and-drop handler for logo upload
 * @param {boolean} props.isLoading - Whether QR is currently loading/generating
 */
function QrPreview({ qrProps, format, canvasRef, svgRef, qrContent, onDrop, isLoading = false }) {
    const isCanvas = format === 'canvas';
    const [isRendering, setIsRendering] = React.useState(false);

    // Generate accessible label
    const qrLabel = React.useMemo(() => {
        const content = qrContent || qrProps.value || '';
        const preview = content.length > 50 ? content.slice(0, 50) + '...' : content;
        return `Mã QR chứa nội dung: ${preview}`;
    }, [qrContent, qrProps.value]);

    // Show loading for large sizes
    React.useEffect(() => {
        const shouldShowLoading = qrProps.size > 1024 || (qrProps.imageSettings && qrProps.size > 512);
        if (shouldShowLoading) {
            setIsRendering(true);
            const timer = setTimeout(() => setIsRendering(false), 300);
            return () => clearTimeout(timer);
        }
    }, [qrProps.size, qrProps.imageSettings]);

    // Calculate loading state
    const showLoading = Boolean(isLoading || isRendering);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-indigo-800 dark:text-indigo-300 border-2 border-indigo-300 dark:border-slate-700">
                    <span>📐</span>
                    <span>
                        Xuất: {qrProps.size}×{qrProps.size}px
                    </span>
                    <span className="text-indigo-500 dark:text-indigo-400">•</span>
                    <span>{(qrProps.size / 118.11).toFixed(1)}cm @300DPI</span>
                </div>
            </div>

            <div
                onDragOver={onDrop ? (e) => e.preventDefault() : undefined}
                onDrop={onDrop}
                className="relative flex w-full max-w-md mx-auto items-center justify-center bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 p-6 sm:p-8 lg:p-10 ring-2 ring-indigo-200/50 shadow-2xl transition-all duration-300 hover:shadow-3xl dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 dark:ring-slate-700/50 backdrop-blur-sm group rounded-2xl sm:rounded-3xl"
                role="img"
                aria-label={qrLabel}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {showLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl z-10">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin dark:border-indigo-800 dark:border-t-indigo-400"></div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Đang tạo QR code...</p>
                        </div>
                    </div>
                )}

                {isCanvas ? (
                    <div
                        ref={canvasRef}
                        className={`relative w-full aspect-square shadow-2xl ring-2 ring-indigo-100 dark:ring-slate-700 hover:scale-[1.02] transition-transform duration-300 ${showLoading ? 'opacity-50' : ''}`}
                    >
                        <QRCodeCanvas {...qrProps} style={{ width: '100%', height: '100%' }} />
                    </div>
                ) : (
                    <div
                        ref={svgRef}
                        className={`relative w-full aspect-square shadow-2xl ring-2 ring-indigo-100 dark:ring-slate-700 hover:scale-[1.02] transition-transform duration-300 ${showLoading ? 'opacity-50' : ''}`}
                    >
                        <QRCodeSVG {...qrProps} style={{ width: '100%', height: '100%' }} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default React.memo(QrPreview);
