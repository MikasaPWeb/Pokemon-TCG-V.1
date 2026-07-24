/**
 * js/utils.js
 * Utility module for security, performance optimization, image handling, and formatting.
 */

/**
 * ป้องกันการเกิด Cross-Site Scripting (XSS) ด้วยการ Escape HTML Characters
 * @param {string|number} str - ข้อความหรือตัวเลขที่ต้องการ Sanitization
 * @returns {string} ข้อความที่ปลอดภัยแล้ว
 */
export function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * สร้าง Debounce function เพื่อลดภาระการประมวลผล เช่น ในการค้นหา หรือค้นด้วยการพิมพ์
 * @param {Function} func - ฟังก์ชันที่ต้องการทำ Debounce
 * @param {number} delay - เวลาหน่วง (มิลลิวินาที)
 * @returns {Function} ฟังก์ชันที่ถูกครอบด้วย Debounce
 */
export function debounce(func, delay = 300) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
}

/**
 * ย่อขนาดรูปภาพ (Compress Image) บน Client-side ก่อนทำการจัดเก็บข้อมูล
 * @param {File} file - ไฟล์รูปภาพ
 * @param {number} maxWidth - ความกว้างสูงสุดที่ต้องการ
 * @param {number} maxHeight - ความสูงสูงสุดที่ต้องการ
 * @param {number} quality - คุณภาพรูปภาพ (0.1 - 1.0)
 * @returns {Promise<string>} Base64 String ของรูปภาพที่บีบอัดแล้ว
 */
export function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('ไฟล์ที่ระบุไม่ใช่รูปภาพ'));
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL(file.type || 'image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

/**
 * จัดรูปแบบตัวเลขให้เป็นสกุลเงินบาท (THB)
 * @param {number} amount - จำนวนเงิน
 * @returns {string} สตริงสกุลเงินบาท
 */
export function formatCurrency(amount) {
    const val = Number(amount) || 0;
    return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(val) + ' ฿';
}

/**
 * สร้าง Unique ID หรือ SKU แบบสุ่ม
 * @param {string} prefix - คำนำหน้า ID เช่น 'PKM', 'ORD'
 * @returns {string} รหัสเฉพาะ
 */
export function generateId(prefix = 'PKM') {
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${timestamp}-${randomStr}`;
}

/**
 * ตรวจสอบความถูกต้องและซ่อมแซมรูปภาพกรณีรูปโหลดไม่ได้ (Fallback Image)
 * @param {HTMLImageElement} imgElement - Element รูปภาพ
 * @param {string} fallbackSrc - รูปภาพสำรองกรณีโหลดไม่ได้
 */
export function handleImageError(imgElement, fallbackSrc = 'https://via.placeholder.com/150?text=No+Image') {
    if (imgElement) {
        imgElement.onerror = null;
        imgElement.src = fallbackSrc;
    }
}