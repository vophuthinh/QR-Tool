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
 */
function QrPreview({ qrProps, format, canvasRef, svgRef, qrContent, onDrop }) {
    const isCanvas = format === 'canvas';

    // Generate accessible label
    const qrLabel = React.useMemo(() => {
        const content = qrContent || qrProps.value || '';
        const preview = content.length > 50 ? content.slice(0, 50) + '...' : content;
        return `Mã QR chứa nội dung: ${preview}`;
    }, [qrContent, qrProps.value]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-slate-700">
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
                {isCanvas ? (
                    <div
                        ref={canvasRef}
                        className="relative w-full aspect-square shadow-2xl ring-2 ring-indigo-100 dark:ring-slate-700 hover:scale-[1.02] transition-transform duration-300"
                    >
                        <QRCodeCanvas {...qrProps} style={{ width: '100%', height: '100%' }} />
                    </div>
                ) : (
                    <div
                        ref={svgRef}
                        className="relative w-full aspect-square shadow-2xl ring-2 ring-indigo-100 dark:ring-slate-700 hover:scale-[1.02] transition-transform duration-300"
                    >
                        <QRCodeSVG {...qrProps} style={{ width: '100%', height: '100%' }} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default React.memo(QrPreview);
