/**
 * @file stock.js
 * @description Manages stock UI interactions and binds with the StorageService.
 */

import { storageService } from './storage.js';

/**
 * Initializes stock module, loads data, and sets up realtime UI binding.
 */
export async function initStockModule() {
    try {
        // Initialize storage and fetch initial data
        await storageService.init();

        // Subscribe to realtime stock changes to update UI automatically across devices
        storageService.subscribeStock((items) => {
            renderStockTable(items);
        });

        // Setup UI event listeners
        setupStockEventListeners();
    } catch (error) {
        console.error('Failed to initialize stock module:', error);
    }
}

/**
 * Renders stock items into the existing UI table/container.
 * Keeps original DOM element names and layout completely intact.
 * @param {Array} items - List of stock items.
 */
function renderStockTable(items) {
    const tableBody = document.getElementById('stockTableBody') || document.getElementById('stock-list');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!items || items.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center">ไม่พบข้อมูลสินค้าในคลัง</td></tr>`;
        return;
    }

    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${item.image || 'assets/placeholder.png'}" alt="${item.name}" width="40" height="40" style="object-fit:cover; border-radius:4px;"></td>
            <td>${escapeHtml(item.name)}</td>
            <td>${item.price || 0} ฿</td>
            <td>${item.cost || 0} ฿</td>
            <td>${item.quantity || 0}</td>
            <td>${formatDate(item.updatedAt)}</td>
            <td>
                <button class="btn-edit" data-id="${item.id}">แก้ไข</button>
                <button class="btn-delete" data-id="${item.id}">ลบ</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Sets up event listeners for stock actions (Add, Edit, Delete, Search).
 */
function setupStockEventListeners() {
    // Add stock form submission handler
    const stockForm = document.getElementById('stockForm') || document.getElementById('add-stock-form');
    if (stockForm) {
        stockForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newItem = {
                name: document.getElementById('stockName')?.value || '',
                price: parseFloat(document.getElementById('stockPrice')?.value) || 0,
                cost: parseFloat(document.getElementById('stockCost')?.value) || 0,
                quantity: parseInt(document.getElementById('stockQuantity')?.value) || 0,
                image: document.getElementById('stockImage')?.value || ''
            };

            try {
                await storageService.addStock(newItem);
                stockForm.reset();
            } catch (error) {
                alert('เกิดข้อผิดพลาดในการเพิ่มสินค้า: ' + error.message);
            }
        });
    }

    // Search input handler
    const searchInput = document.getElementById('searchStockInput') || document.getElementById('search-stock');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            const filtered = storageService.searchStock(query);
            renderStockTable(filtered);
        });
    }

    // Table action buttons handler (Delegation)
    const tableContainer = document.getElementById('stockTableBody') || document.getElementById('stock-list');
    if (tableContainer) {
        tableContainer.addEventListener('click', async (e) => {
            const target = e.target;
            const id = target.getAttribute('data-id');
            if (!id) return;

            if (target.classList.contains('btn-delete')) {
                if (confirm('คุณต้องการลบสินค้ารายการนี้ใช่หรือไม่?')) {
                    try {
                        await storageService.deleteStock(id);
                    } catch (error) {
                        alert('เกิดข้อผิดพลาดในการลบสินค้า: ' + error.message);
                    }
                }
            } else if (target.classList.contains('btn-edit')) {
                // Trigger edit modal or inline flow matching original UI/UX
                handleEditFlow(id);
            }
        });
    }
}

/**
 * Handles stock item editing flow.
 * @param {string} id - Stock item ID.
 */
async function handleEditFlow(id) {
    const item = await storageService.getStockItem(id);
    if (!item) return;

    // Populating modal fields if existing modal elements are present
    const nameInput = document.getElementById('editStockName');
    const priceInput = document.getElementById('editStockPrice');
    const costInput = document.getElementById('editStockCost');
    const qtyInput = document.getElementById('editStockQuantity');

    if (nameInput) nameInput.value = item.name || '';
    if (priceInput) priceInput.value = item.price || 0;
    if (costInput) costInput.value = item.cost || 0;
    if (qtyInput) qtyInput.value = item.quantity || 0;

    // Store current editing id in form/modal dataset for submission
    const editForm = document.getElementById('editStockForm');
    if (editForm) {
        editForm.setAttribute('data-editing-id', id);
    }
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