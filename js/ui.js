/**
 * js/ui.js
 * จัดการส่วน UI Component ทั่วไป, Navigation และ Toast Notification
 */

// สร้าง Container สำหรับ Toast แบบ Dynamic เพื่อไม่ต้องแก้ HTML
function createToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        Object.assign(container.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        });
        document.body.appendChild(container);
    }
    return container;
}

/**
 * แสดง Toast Notification
 * @param {string} message - ข้อความที่ต้องการแสดง
 * @param {string} type - 'success', 'error', 'warning', 'info'
 */
export function showToast(message, type = 'info') {
    const container = createToastContainer();
    const toast = document.createElement('div');

    // กำหนดสีตามประเภท
    const colors = {
        success: { bg: '#2ECC71', icon: 'fa-circle-check' },
        error: { bg: '#E74C3C', icon: 'fa-circle-xmark' },
        warning: { bg: '#F1C40F', icon: 'fa-triangle-exclamation', text: '#000' },
        info: { bg: '#3498DB', icon: 'fa-circle-info' }
    };

    const style = colors[type] || colors.info;
    const textColor = style.text || '#FFF';

    Object.assign(toast.style, {
        backgroundColor: style.bg,
        color: textColor,
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: "'Kanit', sans-serif",
        fontSize: '14px',
        fontWeight: '500',
        transform: 'translateX(100%)',
        opacity: '0',
        transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        cursor: 'pointer'
    });

    toast.innerHTML = `<i class="fa-solid ${style.icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    // Animation เข้า
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    });

    // ลบ Toast ออกเมื่อหมดเวลา
    const removeToast = () => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    };

    toast.addEventListener('click', removeToast);
    setTimeout(removeToast, 3000);
}

/**
 * ฟังก์ชันเปลี่ยนหน้าจอหลัก (สลับระหว่าง Home, Manage, POS)
 * @param {string} pageId - id ของหน้าที่ต้องการไป เช่น 'home', 'manage', 'pos'
 */
export function switchPage(pageId) {
    const pages = document.querySelectorAll('.page-view');
    pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === pageId + 'Page') {
            page.classList.add('active');
        }
    });

    // อัปเดตปุ่ม Navigation ใน Header
    const btnHome = document.getElementById('navToHomeBtn');
    const btnManage = document.getElementById('navToManageBtn');
    const btnPos = document.getElementById('navToPosBtn');

    if(btnHome) btnHome.style.display = (pageId !== 'home') ? 'inline-flex' : 'none';
    
    // Smooth scroll กลับไปด้านบน
    window.scrollTo({ top: 0, behavior: 'smooth' });
}