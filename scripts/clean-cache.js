import { rmSync } from 'fs';
import { existsSync } from 'fs';

const pathsToClean = [
  'node_modules/.vite',
  'dist'
];

console.log('🧹 Đang xóa cache...\n');

pathsToClean.forEach(path => {
  if (existsSync(path)) {
    try {
      rmSync(path, { recursive: true, force: true });
      console.log(`✓ Đã xóa: ${path}`);
    } catch (error) {
      console.warn(`⚠ Không thể xóa ${path}:`, error.message);
    }
  } else {
    console.log(`○ Không tìm thấy: ${path}`);
  }
});

console.log('\n✨ Cache đã được xóa sạch!\n');

