import React from 'react';
import toast from 'react-hot-toast';
import { buildDataURL, buildSVGBlob, downloadFile } from '../utils/qr-helpers';

/**
 * Export panel with download buttons and options
 * @param {Object} props
 * @param {string} props.format - Current format ('canvas' or 'svg')
 * @param {React.RefObject} props.canvasRef - Canvas wrapper ref
 * @param {React.RefObject} props.svgRef - SVG wrapper ref
 * @param {boolean} props.includeMargin - Whether margin is included
 * @param {boolean} props.transparentBg - Whether background is transparent
 * @param {string} props.bgColor - Background color
 */
export default function ExportPanel({ format, canvasRef, svgRef, includeMargin, transparentBg, bgColor }) {
    const [isExporting, setIsExporting] = React.useState(false);

    const handleDownload = React.useCallback(
        async (ext) => {
            setIsExporting(true);

            try {
                const isSVG = format === 'svg';
                const srcCanvas = !isSVG ? canvasRef.current?.querySelector('canvas') : null;
                const srcSVG = isSVG ? svgRef.current?.querySelector('svg') : null;

                if ((isSVG && !srcSVG) || (!isSVG && !srcCanvas)) {
                    toast.error('Không tìm thấy QR code để tải xuống');
                    setIsExporting(false);
                    return;
                }

                const size = isSVG ? parseInt(srcSVG?.getAttribute('width') || '256') : srcCanvas?.width || 256;
                const safePadding = Math.max(8, Math.ceil(size * 0.08));
                const padPx = includeMargin ? 0 : safePadding;

                if (!includeMargin) {
                    const confirmed = window.confirm(
                        `QR thiếu "Quiet Zone" (viền trắng) có thể khó quét!\n\nẢnh export sẽ tự động thêm padding ${safePadding}px (8% kích thước) để đảm bảo an toàn khi in.\n\nBạn có muốn tiếp tục không?`,
                    );
                    if (!confirmed) {
                        setIsExporting(false);
                        return;
                    }
                }

                if (ext === 'jpg' && transparentBg) {
                    toast('JPG không hỗ trợ nền trong suốt! Đã tự động chuyển sang nền trắng. Dùng PNG nếu cần nền trong suốt.', {
                        duration: 5000,
                    });
                }

                if (!isSVG) {
                    const isJPG = ext === 'jpg';
                    const bg = isJPG || !transparentBg ? bgColor || '#FFFFFF' : 'rgba(0,0,0,0)';

                    const dataURL = buildDataURL(srcCanvas, ext, { padPx, bg });
                    downloadFile(dataURL, `qrcode.${ext}`);
                } else {
                    const bg = transparentBg ? 'none' : bgColor || '#FFFFFF';
                    const blob = buildSVGBlob(srcSVG, { padPx, bg });
                    downloadFile(blob, 'qrcode.svg');
                }

                toast.success(`Đã tải xuống ${ext.toUpperCase()}`);
            } catch (error) {
                console.error('Export error:', error);

                if (error.message?.includes('tainted') || error.message?.includes('cross-origin')) {
                    toast.error('Lỗi CORS: Logo từ nguồn khác không cho phép export. Vui lòng upload logo từ máy hoặc dùng URL hỗ trợ CORS.');
                } else {
                    toast.error(`Lỗi export: ${error.message}`);
                }
            } finally {
                setIsExporting(false);
            }
        },
        [format, canvasRef, svgRef, includeMargin, transparentBg, bgColor],
    );

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200">Tải xuống</h3>

            <div className="grid grid-cols-3 gap-3">
                <button
                    onClick={() => handleDownload('png')}
                    disabled={isExporting || format === 'svg'}
                    aria-label="Tải xuống PNG"
                    title="PNG (hỗ trợ nền trong suốt)"
                    className="flex flex-col items-center gap-2 rounded-xl border-2 border-indigo-300 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-800 transition-all hover:bg-indigo-100 hover:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
                >
                    <span className="text-2xl">🖼️</span>
                    <span>PNG</span>
                </button>

                <button
                    onClick={() => handleDownload('jpg')}
                    disabled={isExporting || format === 'svg'}
                    aria-label="Tải xuống JPG"
                    title="JPG (không hỗ trợ nền trong suốt)"
                    className="flex flex-col items-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 transition-all hover:bg-amber-100 hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30"
                >
                    <span className="text-2xl">📷</span>
                    <span>JPG</span>
                </button>

                <button
                    onClick={() => handleDownload('svg')}
                    disabled={isExporting || format === 'canvas'}
                    aria-label="Tải xuống SVG"
                    title="SVG (vector, phóng to không vỡ)"
                    className="flex flex-col items-center gap-2 rounded-xl border-2 border-green-300 bg-green-50 px-4 py-3 text-sm font-bold text-green-800 transition-all hover:bg-green-100 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed dark:border-green-800 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30"
                >
                    <span className="text-2xl">📐</span>
                    <span>SVG</span>
                </button>
            </div>

            <div className="rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                <p className="leading-relaxed">
                    <strong>Ghi chú xuất file:</strong>
                    <span className="block mt-1">
                        • <strong>Quiet Zone:</strong>{' '}
                        {includeMargin ? 'Đã bật (khuyến nghị)' : 'Tự động thêm padding 8% để bảo vệ QR'}
                    </span>
                    <span className="block mt-1">
                        • <strong>PNG:</strong> Hỗ trợ nền trong suốt, phù hợp web/app
                    </span>
                    <span className="block mt-1">
                        • <strong>JPG:</strong> File nhẹ, không hỗ trợ nền trong suốt
                    </span>
                    <span className="block mt-1">
                        • <strong>SVG:</strong> Vector, phóng to không vỡ, tốt nhất cho in ấn
                    </span>
                </p>
            </div>
        </div>
    );
}
