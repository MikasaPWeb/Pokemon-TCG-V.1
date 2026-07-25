/**
 * js/modal.js
 * จัดการ Modal Dialog ต่างๆ รวมไปถึง Confirmation Modal แทน confirm() ของเบราว์เซอร์
 */

/**
 * สร้าง Confirmation Modal (Promise based) แทนที่ Window.confirm()
 * @param {string} title - หัวข้อ
 * @param {string} message - ข้อความอธิบาย
 * @returns {Promise<boolean>} - คืนค่า true ถ้ายืนยัน, false ถ้ายกเลิก
 */
export function showConfirmDialog(title, message) {
    return new Promise((resolve) => {
        // สร้าง Overlay
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: '10000', opacity: '0', transition: 'opacity 0.2s ease'
        });

        // สร้าง Modal Box
        const modal = document.createElement('div');
        Object.assign(modal.style, {
            backgroundColor: '#ffffff', borderRadius: '16px',
            padding: '24px', width: '90%', maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            transform: 'scale(0.95)', transition: 'transform 0.2s ease',
            fontFamily: "'Kanit', sans-serif"
        });

        modal.innerHTML = `
            <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 1.25rem; font-weight: 700;">
                <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444; margin-right: 8px;"></i>${title}
            </h3>
            <p style="margin: 0 0 24px 0; color: #64748b; font-size: 0.95rem;">${message}</p>
            <div style="display: flex; justify-content: flex-end; gap: 12px;">
                <button id="confirm-cancel-btn" style="padding: 8px 16px; border-radius: 8px; border: none; background: #e2e8f0; color: #475569; font-weight: 600; cursor: pointer; transition: background 0.2s;">ยกเลิก</button>
                <button id="confirm-ok-btn" style="padding: 8px 16px; border-radius: 8px; border: none; background: #ef4444; color: #ffffff; font-weight: 600; cursor: pointer; transition: background 0.2s;">ยืนยันลบ</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Animation เข้า
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        });

        const closeDialog = (result) => {
            overlay.style.opacity = '0';
            modal.style.transform = 'scale(0.95)';
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(result);
            }, 200);
        };

        modal.querySelector('#confirm-cancel-btn').addEventListener('click', () => closeDialog(false));
        modal.querySelector('#confirm-ok-btn').addEventListener('click', () => closeDialog(true));
    });
}

/**
 * จัดการปิด Modal เดิม (Detail Modal)[cite: 1]
 */
export function closeModalForce() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.remove('active');
}

/**
 * จัดการปิด Edit Modal เดิม[cite: 1]
 */
export function closeEditModalForce() {
    const modal = document.getElementById('editModal');
    if (modal) modal.classList.remove('active');
}

/**
 * ใช้ดักจับการคลิกที่พื้นหลังเพื่อปิด Modal
 */
export function closeModal(event) {
    if (event.target.id === 'detailModal') closeModalForce();
}

export function closeEditModal(event) {
    if (event.target.id === 'editModal') closeEditModalForce();
}