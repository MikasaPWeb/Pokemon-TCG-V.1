// js/stock.js
import { StorageService } from "./storage.js";

export const StockModule = {
    async init() {
        await this.loadStockData();
        this.bindEvents();
    },

    async loadStockData() {
        const stockList = await StorageService.getStock();
        this.renderStockTable(stockList);
    },

    renderStockTable(stockList) {
        const tbody = document.querySelector("#stock-table-body");
        if (!tbody) return;

        tbody.innerHTML = "";
        if (stockList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center">ไม่มีข้อมูลสินค้าในระบบ</td></tr>`;
            return;
        }

        stockList.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.id || ""}</td>
                <td>${item.name || ""}</td>
                <td>${item.price || 0}</td>
                <td>${item.quantity || 0}</td>
                <td>
                    <button class="btn-delete" data-id="${item.id}">ลบ</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    bindEvents() {
        // ตัวอย่างการผูกอีเวนต์ปุ่มลบ
        const tbody = document.querySelector("#stock-table-body");
        if (tbody) {
            tbody.addEventListener("click", async (e) => {
                if (e.target.classList.contains("btn-delete")) {
                    const id = e.target.getAttribute("data-id");
                    if (confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?")) {
                        await StorageService.removeStockItem(id);
                        await this.loadStockData(); // โหลดข้อมูลใหม่หลังจากลบ
                    }
                }
            });
        }
    }
};

// เรียกใช้งานเมื่อโหลดหน้าเว็บ
document.addEventListener("DOMContentLoaded", () => {
    StockModule.init();
});