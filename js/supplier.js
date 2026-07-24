/**
 * js/supplier.js
 * ระบบจัดการซัพพลายเออร์และประวัติการสั่งซื้อ (Supplier Management)
 */
import { storage } from './storage.js';
import { generateId } from './utils.js';

const SUPPLIER_KEY = 'suppliers';

export async function getSuppliers() {
    return await storage.getItem(SUPPLIER_KEY, []);
}

export async function saveSuppliers(suppliers) {
    await storage.setItem(SUPPLIER_KEY, suppliers);
}

export async function addSupplier(supplierData) {
    const suppliers = await getSuppliers();
    const newSupplier = {
        id: generateId('SUP'),
        name: supplierData.name || '',
        phone: supplierData.phone || '',
        line: supplierData.line || '',
        facebook: supplierData.facebook || '',
        email: supplierData.email || '',
        address: supplierData.address || '',
        latestCost: supplierData.latestCost || 0,
        createdAt: new Date().toISOString()
    };
    suppliers.push(newSupplier);
    await saveSuppliers(suppliers);
    return newSupplier;
}