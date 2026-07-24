/**
 * js/dashboard.js
 * ระบบประมวลผล Dashboards & Data Analytics
 */
import { getOrders } from './order.js';
import { getCards } from './stock.js';

/**
 * สรุปภาพรวมสถิติการเงินและการขาย
 */
export async function calculateDashboardMetrics() {
    const orders = await getOrders();
    const cards = await getCards();

    // กรองเฉพาะออเดอร์ที่สำเร็จ (Completed)
    const validOrders = orders.filter(o => o.status === 'Completed');

    let totalRevenue = 0;
    let totalCost = 0;
    let totalItemsSold = 0;

    validOrders.forEach(order => {
        totalRevenue += (order.grandTotal || 0);
        
        // คำนวณต้นทุนสินค้าที่ขายไป
        if (Array.isArray(order.items)) {
            order.items.forEach(item => {
                const itemCost = item.cost || 0;
                totalCost += (itemCost * item.qty);
                totalItemsSold += item.qty;
            });
        }
    });

    const netProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;

    return {
        totalOrders: validOrders.length,
        totalRevenue,
        totalCost,
        netProfit,
        profitMargin,
        totalItemsSold,
        totalStockRemaining: cards.reduce((sum, c) => sum + (c.stock || 0), 0)
    };
}

/**
 * ดึงรายการสินค้าขายดี Top 5
 */
export async function getTopSellingCards(limit = 5) {
    const cards = await getCards();
    return cards
        .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
        .slice(0, limit);
}

/**
 * ดึงรายการสินค้า Dead Stock (ไม่มีการเคลื่อนไหว/สต็อกค้างเกินเกณฑ์)
 */
export async function getDeadStockCards(minDaysOld = 30) {
    const cards = await getCards();
    const now = new Date();

    return cards.filter(card => {
        if (!card.createdAt) return false;
        const createdDate = new Date(card.createdAt);
        const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        
        // เงื่อนไข: สต็อกเหลืออยู่อย่างน้อย 1 ชิ้น, ยอดขายเป็น 0 หรือน้อยมาก และสร้างมาแล้วนานเกินกำหนด
        return card.stock > 0 && (card.totalSold || 0) === 0 && diffDays >= minDaysOld;
    });
}