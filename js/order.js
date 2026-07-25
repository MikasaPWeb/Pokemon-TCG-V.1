<<<<<<< HEAD
/**
 * @file order.js
 * @description Manages Order history UI interactions, POS checkout integration, and binds with StorageService.
 */

import { storageService } from './storage.js';

/**
 * Initializes the order module, loads initial order history, and sets up realtime listeners.
 */
export async function initOrderModule() {
    try {
        // Ensure storage service is initialized
        await storageService.init();

        // Subscribe to realtime order updates to sync across devices automatically
        storageService.subscribeOrders((orders) => {
            renderOrderTable(orders);
        });

        // Setup UI event listeners for order interactions
        setupOrderEventListeners();
    } catch (error) {
        console.error('Failed to initialize order module:', error);
    }
}

/**
 * Renders the order history table into the DOM.
 * Preserves original HTML elements and layout structure.
 * @param {Array} orders - List of order objects.
 */
function renderOrderTable(orders) {
    const orderTableBody = document.getElementById('orderTableBody') || document.getElementById('order-list');
    if (!orderTableBody) return;

    orderTableBody.innerHTML = '';

    if (!orders || orders.length === 0) {
        orderTableBody.innerHTML = `<tr><td colspan="6" class="text-center">ไม่พบประวัติคำสั่งซื้อ (Order)</td></tr>`;
        return;
    }

    // Sort orders by newest first
    const sortedOrders = [...orders].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    sortedOrders.forEach((order, index) => {
        const row = document.createElement('tr');
        const itemsSummary = formatOrderItems(order.items);
        
        row.innerHTML = `
            <td>#${order.id ? order.id.slice(-6).toUpperCase() : (index + 1)}</td>
            <td>${formatDate(order.createdAt)}</td>
            <td>${escapeHtml(order.customerName || 'ลูกค้าทั่วไป')}</td>
            <td>${itemsSummary}</td>
            <td>${formatCurrency(order.totalAmount || order.total || 0)}</td>
            <td>
                <button class="btn-view-order" data-id="${order.id}">ดูรายละเอียด</button>
            </td>
        `;
        orderTableBody.appendChild(row);
    });
}

/**
 * Sets up event listeners for order module (search, details modal, etc.).
 */
function setupOrderEventListeners() {
    // Search order input listener
    const searchOrderInput = document.getElementById('searchOrderInput') || document.getElementById('search-order');
    if (searchOrderInput) {
        searchOrderInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const allOrders = storageService.getOrders();
            const filtered = allOrders.filter(order => 
                (order.customerName && order.customerName.toLowerCase().includes(query)) ||
                (order.id && order.id.toLowerCase().includes(query))
            );
            renderOrderTable(filtered);
        });
    }

    // Order table action delegation
    const orderTableBody = document.getElementById('orderTableBody') || document.getElementById('order-list');
    if (orderTableBody) {
        orderTableBody.addEventListener('click', async (e) => {
            const target = e.target;
            if (target.classList.contains('btn-view-order')) {
                const orderId = target.getAttribute('data-id');
                await showOrderDetailsModal(orderId);
            }
        });
    }
}

/**
 * Displays details of a specific order in a modal or alert view.
 * @param {string} orderId - The order ID.
 */
async function showOrderDetailsModal(orderId) {
    const orders = storageService.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('ไม่พบข้อมูลคำสั่งซื้อนี้');
        return;
    }

    // Build details string
    let details = `รหัสออร์เดอร์: ${order.id}\n`;
    details += `วันที่: ${formatDate(order.createdAt)}\n`;
    details += `ลูกค้า: ${order.customerName || 'ลูกค้าทั่วไป'}\n\n`;
    details += `รายการสินค้า:\n`;
    
    if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item, idx) => {
            details += `- ${item.name} x${item.quantity || 1} (${formatCurrency(item.price * (item.quantity || 1))})\n`;
        });
    }

    details += `\nยอดรวมทั้งสิ้น: ${formatCurrency(order.totalAmount || order.total || 0)}`;
    
    // Check if a dedicated modal exists in HTML, otherwise use standard alert or custom renderer
    const modalContainer = document.getElementById('orderDetailsModal');
    if (modalContainer) {
        // If modal element exists, populate and show it
        const contentEl = document.getElementById('orderDetailsContent');
        if (contentEl) contentEl.innerText = details;
        modalContainer.style.display = 'block';
    } else {
        alert(details);
    }
}

/**
 * Formats order items array into a readable summary string.
 * @param {Array} items - Order items.
 * @returns {string} Formatted string.
 */
function formatOrderItems(items) {
    if (!items || !Array.isArray(items) || items.length === 0) return 'ไม่มีรายการสินค้า';
    const firstItem = items[0].name || 'สินค้า';
    if (items.length > 1) {
        return `${firstItem} และอื่นๆ (รวม ${items.length} รายการ)`;
    }
    return `${firstItem} x${items[0].quantity || 1}`;
}

/**
 * Formats number to currency string.
 * @param {number} amount 
 * @returns {string}
 */
function formatCurrency(amount) {
    return (amount || 0).toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
}

/**
 * Formats timestamp to readable date string.
 * @param {number} timestamp 
 * @returns {string}
 */
function formatDate(timestamp) {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('th-TH');
}

/**
 * Utility to escape HTML and prevent XSS.
 * @param {string} str 
 * @returns {string}
 */
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
=======
/**
 * @file order.js
 * @description Manages Order history UI interactions, POS checkout integration, and binds with StorageService.
 */

import { storageService } from './storage.js';

/**
 * Initializes the order module, loads initial order history, and sets up realtime listeners.
 */
export async function initOrderModule() {
    try {
        // Ensure storage service is initialized
        await storageService.init();

        // Subscribe to realtime order updates to sync across devices automatically
        storageService.subscribeOrders((orders) => {
            renderOrderTable(orders);
        });

        // Setup UI event listeners for order interactions
        setupOrderEventListeners();
    } catch (error) {
        console.error('Failed to initialize order module:', error);
    }
}

/**
 * Renders the order history table into the DOM.
 * Preserves original HTML elements and layout structure.
 * @param {Array} orders - List of order objects.
 */
function renderOrderTable(orders) {
    const orderTableBody = document.getElementById('orderTableBody') || document.getElementById('order-list');
    if (!orderTableBody) return;

    orderTableBody.innerHTML = '';

    if (!orders || orders.length === 0) {
        orderTableBody.innerHTML = `<tr><td colspan="6" class="text-center">ไม่พบประวัติคำสั่งซื้อ (Order)</td></tr>`;
        return;
    }

    // Sort orders by newest first
    const sortedOrders = [...orders].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    sortedOrders.forEach((order, index) => {
        const row = document.createElement('tr');
        const itemsSummary = formatOrderItems(order.items);
        
        row.innerHTML = `
            <td>#${order.id ? order.id.slice(-6).toUpperCase() : (index + 1)}</td>
            <td>${formatDate(order.createdAt)}</td>
            <td>${escapeHtml(order.customerName || 'ลูกค้าทั่วไป')}</td>
            <td>${itemsSummary}</td>
            <td>${formatCurrency(order.totalAmount || order.total || 0)}</td>
            <td>
                <button class="btn-view-order" data-id="${order.id}">ดูรายละเอียด</button>
            </td>
        `;
        orderTableBody.appendChild(row);
    });
}

/**
 * Sets up event listeners for order module (search, details modal, etc.).
 */
function setupOrderEventListeners() {
    // Search order input listener
    const searchOrderInput = document.getElementById('searchOrderInput') || document.getElementById('search-order');
    if (searchOrderInput) {
        searchOrderInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const allOrders = storageService.getOrders();
            const filtered = allOrders.filter(order => 
                (order.customerName && order.customerName.toLowerCase().includes(query)) ||
                (order.id && order.id.toLowerCase().includes(query))
            );
            renderOrderTable(filtered);
        });
    }

    // Order table action delegation
    const orderTableBody = document.getElementById('orderTableBody') || document.getElementById('order-list');
    if (orderTableBody) {
        orderTableBody.addEventListener('click', async (e) => {
            const target = e.target;
            if (target.classList.contains('btn-view-order')) {
                const orderId = target.getAttribute('data-id');
                await showOrderDetailsModal(orderId);
            }
        });
    }
}

/**
 * Displays details of a specific order in a modal or alert view.
 * @param {string} orderId - The order ID.
 */
async function showOrderDetailsModal(orderId) {
    const orders = storageService.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('ไม่พบข้อมูลคำสั่งซื้อนี้');
        return;
    }

    // Build details string
    let details = `รหัสออร์เดอร์: ${order.id}\n`;
    details += `วันที่: ${formatDate(order.createdAt)}\n`;
    details += `ลูกค้า: ${order.customerName || 'ลูกค้าทั่วไป'}\n\n`;
    details += `รายการสินค้า:\n`;
    
    if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item, idx) => {
            details += `- ${item.name} x${item.quantity || 1} (${formatCurrency(item.price * (item.quantity || 1))})\n`;
        });
    }

    details += `\nยอดรวมทั้งสิ้น: ${formatCurrency(order.totalAmount || order.total || 0)}`;
    
    // Check if a dedicated modal exists in HTML, otherwise use standard alert or custom renderer
    const modalContainer = document.getElementById('orderDetailsModal');
    if (modalContainer) {
        // If modal element exists, populate and show it
        const contentEl = document.getElementById('orderDetailsContent');
        if (contentEl) contentEl.innerText = details;
        modalContainer.style.display = 'block';
    } else {
        alert(details);
    }
}

/**
 * Formats order items array into a readable summary string.
 * @param {Array} items - Order items.
 * @returns {string} Formatted string.
 */
function formatOrderItems(items) {
    if (!items || !Array.isArray(items) || items.length === 0) return 'ไม่มีรายการสินค้า';
    const firstItem = items[0].name || 'สินค้า';
    if (items.length > 1) {
        return `${firstItem} และอื่นๆ (รวม ${items.length} รายการ)`;
    }
    return `${firstItem} x${items[0].quantity || 1}`;
}

/**
 * Formats number to currency string.
 * @param {number} amount 
 * @returns {string}
 */
function formatCurrency(amount) {
    return (amount || 0).toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
}

/**
 * Formats timestamp to readable date string.
 * @param {number} timestamp 
 * @returns {string}
 */
function formatDate(timestamp) {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('th-TH');
}

/**
 * Utility to escape HTML and prevent XSS.
 * @param {string} str 
 * @returns {string}
 */
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
>>>>>>> d8ae4f21f72cef69d4c2fa0a93bb95a6246881d9
}