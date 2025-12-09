import { BrowserMultiFormatReader } from '@zxing/browser';

let readerInstance = null;

function getReader() {
    if (!readerInstance) {
        readerInstance = new BrowserMultiFormatReader();
    }
    return readerInstance;
}

/**
 * Test QR code scan with ZXing decoder (with cleanup)
 * Falls back to heuristic if decode fails
 * @param {HTMLCanvasElement} canvas - Canvas element with QR code
 * @param {boolean} includeMargin - Whether Quiet Zone is included
 * @returns {Promise<Object>} {status: 'success'|'warning'|'error', message: string}
 */
export async function testQRScan(canvas, includeMargin) {
    if (!canvas) return { status: 'unknown', message: 'Không tìm thấy QR' };

    try {
        const reader = getReader();
        await reader.decodeFromCanvas(canvas);

        if (!includeMargin) {
            return {
                status: 'warning',
                message: `✓ Đọc được nhưng thiếu Quiet Zone - bật "Thêm viền" để tăng khả năng quét`,
            };
        }

        return {
            status: 'success',
            message: `✓ QR decode thành công`,
        };
    } catch {
        try {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let dark = 0,
                total = width * height;
            for (let i = 0; i < data.length; i += 4) {
                const bright = (data[i] + data[i + 1] + data[i + 2]) / 3;
                if (bright < 128) dark++;
            }
            const darkRatio = dark / total;

            if (!includeMargin) {
                return {
                    status: 'warning',
                    message: 'Thiếu Quiet Zone - bật "Thêm viền" để tăng khả năng quét',
                };
            }
            if (darkRatio < 0.1 || darkRatio > 0.9) {
                return {
                    status: 'warning',
                    message: 'Không decode được - kiểm tra màu/viền/kích thước',
                };
            }
            return { status: 'success', message: '✓ QR có vẻ hợp lệ (chưa decode được)' };
        } catch {
            return { status: 'error', message: '❌ Lỗi kiểm tra QR' };
        }
    }
}

/**
 * Cleanup ZXing reader instance (call on unmount)
 */
export function cleanupReader() {
    readerInstance = null;
}
