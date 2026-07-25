/**
 * js/report.js
 * ระบบจัดการรายงาน และการ Import / Export ข้อมูล
 */
import { storage } from './storage.js';
import { showToast } from './ui.js';
import { getCards, saveCards } from './stock.js';

/**
 * ส่งออกข้อมูลสินค้าทั้งหมดเป็นไฟล์ JSON Backup
 */
export async function exportDataToJSON() {
    try {
        const cards = await getCards();
        const orders = await storage.getItem('tcg_orders', []);
        
        const backupData = {
            exportDate: new Date().toISOString(),
            version: '2.0.0',
            cards,
            orders
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `TCG_Backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        showToast('สำรองข้อมูลเป็นไฟล์ JSON สำเร็จแล้ว', 'success');
    } catch (error) {
        console.error('Export Error:', error);
        showToast('เกิดข้อผิดพลาดในการ Export ข้อมูล', 'error');
    }
}

/**
 * ส่งออกข้อมูลคลังสินค้าเป็นไฟล์ CSV
 */
export async function exportStockToCSV() {
    const cards = await getCards();
    if (cards.length === 0) {
        showToast('ไม่มีข้อมูลการ์ดสำหรับ Export', 'warning');
        return;
    }

    let csvContent = "\uFEFF"; // UTF-8 BOM สำหรับอ่านภาษาไทยใน Excel
    csvContent += "ID,ชื่อการ์ด,ประเภท,ธาตุ,ความหายาก,ราคาขาย (บาท),ต้นทุน (บาท),คงเหลือ,ขายแล้ว (ชิ้น)\n";

    cards.forEach(c => {
        const row = [
            `"${c.id || ''}"`,
            `"${(c.name || '').replace(/"/g, '""')}"`,
            `"${c.type || ''}"`,
            `"${c.element || ''}"`,
            `"${c.rarity || ''}"`,
            c.price || 0,
            c.costPrice || 0,
            c.stock || 0,
            c.totalSold || 0
        ];
        csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Stock_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    showToast('ดาวน์โหลดรายงาน CSV เรียบร้อยแล้ว', 'success');
}

/**
 * นำเข้าข้อมูลสินค้าจากไฟล์ JSON Backup
 */
export function importDataFromJSON(fileEvent) {
    const file = fileEvent.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.cards && Array.isArray(importedData.cards)) {
                await saveCards(importedData.cards);
                if (importedData.orders) {
                    await storage.setItem('tcg_orders', importedData.orders);
                }
                showToast('นำเข้าข้อมูลสำเร็จแล้ว! กำลังรีโหลดหน้าเว็บ...', 'success');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                showToast('รูปแบบไฟล์ JSON ไม่ถูกต้อง', 'error');
            }
        } catch (err) {
            console.error('Import Error:', err);
            showToast('ไม่สามารถอ่านไฟล์ JSON ได้', 'error');
        }
    };
    reader.readAsText(file);
}