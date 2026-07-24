// js/order.js
import { StorageService } from "./storage.js";

export const OrderModule = {
    async init() {
        await this.loadOrders();
    },

    async loadOrders() {
        const orders = await StorageService.getOrders();
        const tbody = document.querySelector("#order-table-body");
        if (!tbody) return;

        tbody.innerHTML = "";
        if (orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center">ยังไม่มีประวัติคำสั่งซื้อ</td></tr>`;
            return;
        }

        orders.forEach((order, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${order.id || index + 1}</td>
                <td>${order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</td>
                <td>${order.total || 0} บาท</td>
                <td><button class="btn-view-order" data-id="${order.id}">ดูรายละเอียด</button></td>
            `;
            tbody.appendChild(tr);
        });
    }
};