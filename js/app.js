// js/app.js
import { initTheme } from './theme.js';
import { switchPage, showToast } from './ui.js';
import { showConfirmDialog, closeModal, closeModalForce, closeEditModal, closeEditModalForce } from './modal.js';
import { StockModule } from './stock.js';
import { PosModule } from './pos.js';
import { OrderModule } from './order.js';

// ผูกฟังก์ชัน Global ลงบน window เพื่อให้ HTML (onclick) สามารถเรียกใช้งานได้โดยตรง
window.switchPage = switchPage;
window.showToast = showToast;
window.showConfirmDialog = showConfirmDialog;
window.closeModal = closeModal;
window.closeModalForce = closeModalForce;
window.closeEditModal = closeEditModal;
window.closeEditModalForce = closeEditModalForce;

// ผูกฟังก์ชัน POS ลง window
window.pos_addToCart = (id) => PosModule.addToCart(id);
window.pos_updateCartQty = (id, qty) => PosModule.updateCartQty(id, qty);
window.pos_confirmOrder = () => PosModule.confirmOrder();

// เริ่มต้นการทำงานเมื่อโหลดหน้าเว็บเสร็จ
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Initializing Pokémon TCG System with Firebase...");
    
    // ตั้งค่าธีม
    if (typeof initTheme === 'function') {
        initTheme();
    }

    // โหลดโมดูลตามหน้าจอที่กำลังแสดงอยู่
    if (document.querySelector("#stock-table-body") || document.getElementById("stock-section")) {
        await StockModule.init();
    }
    
    if (document.querySelector("#pos-product-list") || document.getElementById("pos-section")) {
        await PosModule.init();
    }

    if (document.querySelector("#order-table-body") || document.getElementById("order-history-section")) {
        await OrderModule.init();
    }
});