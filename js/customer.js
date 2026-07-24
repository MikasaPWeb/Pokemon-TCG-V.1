/**
 * js/customer.js
 * ระบบจัดการลูกค้า สมาชิก และแต้มสะสม (Customer & Loyalty Points)
 */
import { storage } from './storage.js';
import { generateId } from './utils.js';

const CUSTOMER_KEY = 'customers';

/**
 * ดึงรายชื่อลูกค้าทั้งหมด
 */
export async function getCustomers() {
    return await storage.getItem(CUSTOMER_KEY, []);
}

/**
 * บันทึกรายชื่อลูกค้าทั้งหมด
 */
export async function saveCustomers(customers) {
    await storage.setItem(CUSTOMER_KEY, customers);
}

/**
 * เพิ่มลูกค้าใหม่เข้าสู่ระบบ
 */
export async function addCustomer(customerData) {
    const customers = await getCustomers();
    const newCustomer = {
        id: generateId('CUST'),
        name: customerData.name || 'ลูกค้าทั่วไป',
        phone: customerData.phone || '',
        facebook: customerData.facebook || '',
        line: customerData.line || '',
        address: customerData.address || '',
        remark: customerData.remark || '',
        totalPurchase: 0,
        points: 0,
        memberLevel: 'General', // General, Bronze, Silver, Gold, VIP
        createdAt: new Date().toISOString()
    };
    customers.push(newCustomer);
    await saveCustomers(customers);
    return newCustomer;
}

/**
 * คำนวณแต้มสะสมและระดับสมาชิกเมื่อมีการซื้อสินค้า (100 บาท = 1 แต้ม)
 */
export async function updateCustomerPurchase(customerId, amountTotal) {
    if (!customerId) return;
    const customers = await getCustomers();
    const index = customers.findIndex(c => c.id === customerId);
    if (index !== -1) {
        customers[index].totalPurchase += amountTotal;
        const earnedPoints = Math.floor(amountTotal / 100);
        customers[index].points += earnedPoints;

        // คำนวณ Level จากยอดซื้อสะสม
        const total = customers[index].totalPurchase;
        if (total >= 100000) customers[index].memberLevel = 'VIP';
        else if (total >= 50000) customers[index].memberLevel = 'Gold';
        else if (total >= 20000) customers[index].memberLevel = 'Silver';
        else if (total >= 5000) customers[index].memberLevel = 'Bronze';

        await saveCustomers(customers);
    }
}