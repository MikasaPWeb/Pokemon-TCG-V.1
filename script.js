/**
 * script.js - Full Working System
 * ระบบบริหารจัดการ Pokémon TCG ครบวงจร
 */

const PREFIX = 'tcg_';

// ------------------------------------------
// 1. STORAGE & INITIAL DATA
// ------------------------------------------
const storage = {
    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(PREFIX + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error(e);
            return defaultValue;
        }
    },
    setItem(key, value) {
        try {
            localStorage.setItem(PREFIX + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
};

// ค่าเริ่มต้นระบบ (ถ้ายังไม่มีใน LocalStorage)
const DEFAULT_ELEMENTS = ['ไฟ (Fire)', 'น้ำ (Water)', 'หญ้า (Grass)', 'ไฟฟ้า (Electric)', 'พลังจิต (Psychic)', 'ไร้สี (Colorless)'];
const DEFAULT_RARITIES = ['Common (C)', 'Uncommon (UC)', 'Rare (R)', 'Super Rare (SR)', 'Ultra Rare (UR)', 'Secret Rare (HR)'];

let globalCards = storage.getItem('cards', []);
let globalElements = storage.getItem('elements', DEFAULT_ELEMENTS);
let globalRarities = storage.getItem('rarities', DEFAULT_RARITIES);
let currentCart = [];

function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function generateId(prefix = 'PKM') {
    return `${prefix}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
}

// ------------------------------------------
// 2. TOAST & NOTIFICATION SYSTEM
// ------------------------------------------
function createToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        Object.assign(container.style, {
            position: 'fixed', top: '20px', right: '20px', zIndex: '99999',
            display: 'flex', flexDirection: 'column', gap: '10px'
        });
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, type = 'info') {
    const container = createToastContainer();
    const toast = document.createElement('div');
    const colors = {
        success: { bg: '#10B981', icon: 'fa-circle-check' },
        error: { bg: '#EF4444', icon: 'fa-circle-xmark' },
        warning: { bg: '#F59E0B', icon: 'fa-triangle-exclamation', text: '#000' },
        info: { bg: '#3B82F6', icon: 'fa-circle-info' }
    };
    const style = colors[type] || colors.info;

    Object.assign(toast.style, {
        backgroundColor: style.bg, color: style.text || '#FFF',
        padding: '12px 20px', borderRadius: '10px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', display: 'flex',
        alignItems: 'center', gap: '10px', fontFamily: "'Kanit', sans-serif",
        fontSize: '14px', fontWeight: '500', transform: 'translateX(120%)',
        opacity: '0', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer'
    });

    toast.innerHTML = `<i class="fa-solid ${style.icon}"></i> <span>${escapeHTML(message)}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    });

    const removeToast = () => {
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    };

    toast.addEventListener('click', removeToast);
    setTimeout(removeToast, 3000);
}

// ------------------------------------------
// 3. PAGE NAVIGATION
// ------------------------------------------
function switchPage(pageId) {
    const pages = document.querySelectorAll('.page-view');
    pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === pageId + 'Page') {
            page.classList.add('active');
        }
    });

    if (pageId === 'home') filterCards();
    if (pageId === 'stock') renderStockTable();
    if (pageId === 'pos') renderCartUI();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ------------------------------------------
// 4. DROPDOWN OPTIONS MANAGEMENT (ธาตุ & แรร์ริตี้)
// ------------------------------------------
function renderDropdownOptions() {
    // 1. อัปเดต Dropdown ในฟอร์มเพิ่มการ์ด
    const addElementSelect = document.getElementById('addElement');
    const addRaritySelect = document.getElementById('addRarity');
    const filterElementSelect = document.getElementById('filterElement');

    if (addElementSelect) {
        addElementSelect.innerHTML = '<option value="">-- เลือกธาตุ --</option>' + 
            globalElements.map(el => `<option value="${escapeHTML(el)}">${escapeHTML(el)}</option>`).join('');
    }

    if (addRaritySelect) {
        addRaritySelect.innerHTML = '<option value="">-- เลือกแรร์ริตี้ --</option>' + 
            globalRarities.map(r => `<option value="${escapeHTML(r)}">${escapeHTML(r)}</option>`).join('');
    }

    if (filterElementSelect) {
        filterElementSelect.innerHTML = '<option value="All">ทุกธาตุ</option>' + 
            globalElements.map(el => `<option value="${escapeHTML(el)}">${escapeHTML(el)}</option>`).join('');
    }

    // 2. แสดงรายการ Tags ธาตุและแรร์ริตี้พร้อมปุ่มลบ
    renderOptionTags();
}

function renderOptionTags() {
    const elContainer = document.getElementById('elementTagContainer');
    const rarityContainer = document.getElementById('rarityTagContainer');

    if (elContainer) {
        elContainer.innerHTML = globalElements.length === 0 ? '<span class="text-xs text-slate-500">ไม่มีข้อมูลธาตุ</span>' :
            globalElements.map((el, i) => `
                <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium">
                    ${escapeHTML(el)}
                    <button type="button" onclick="deleteElementOption(${i})" class="text-rose-400 hover:text-rose-300 ml-1">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </span>
            `).join('');
    }

    if (rarityContainer) {
        rarityContainer.innerHTML = globalRarities.length === 0 ? '<span class="text-xs text-slate-500">ไม่มีข้อมูลแรร์ริตี้</span>' :
            globalRarities.map((r, i) => `
                <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium">
                    ${escapeHTML(r)}
                    <button type="button" onclick="deleteRarityOption(${i})" class="text-rose-400 hover:text-rose-300 ml-1">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </span>
            `).join('');
    }
}

function addNewElement() {
    const input = document.getElementById('newElementInput');
    const value = input?.value.trim();
    if (!value) return showToast('กรุณากรอกชื่อธาตุใหม่', 'warning');
    if (globalElements.includes(value)) return showToast('มีชื่อธาตุนี้อยู่แล้ว', 'warning');

    globalElements.push(value);
    storage.setItem('elements', globalElements);
    input.value = '';
    renderDropdownOptions();
    showToast(`เพิ่มธาตุ "${value}" เรียบร้อยแล้ว`, 'success');
}

function deleteElementOption(index) {
    const name = globalElements[index];
    globalElements.splice(index, 1);
    storage.setItem('elements', globalElements);
    renderDropdownOptions();
    showToast(`ลบธาตุ "${name}" เรียบร้อยแล้ว`, 'info');
}

function addNewRarity() {
    const input = document.getElementById('newRarityInput');
    const value = input?.value.trim();
    if (!value) return showToast('กรุณากรอกชื่อแรร์ริตี้ใหม่', 'warning');
    if (globalRarities.includes(value)) return showToast('มีชื่อแรร์ริตี้นี้อยู่แล้ว', 'warning');

    globalRarities.push(value);
    storage.setItem('rarities', globalRarities);
    input.value = '';
    renderDropdownOptions();
    showToast(`เพิ่มแรร์ริตี้ "${value}" เรียบร้อยแล้ว`, 'success');
}

function deleteRarityOption(index) {
    const name = globalRarities[index];
    globalRarities.splice(index, 1);
    storage.setItem('rarities', globalRarities);
    renderDropdownOptions();
    showToast(`ลบแรร์ริตี้ "${name}" เรียบร้อยแล้ว`, 'info');
}

// ------------------------------------------
// 5. STOCK MANAGEMENT & CARD CREATION
// ------------------------------------------
async function stock_addCard(event) {
    if (event) event.preventDefault();

    const type = document.getElementById('addType')?.value || 'Pokemon';
    const name = document.getElementById('addName')?.value.trim();
    const element = document.getElementById('addElement')?.value || '';
    const rarity = document.getElementById('addRarity')?.value || '';
    const price = parseFloat(document.getElementById('addPrice')?.value) || 0;
    const stockQty = parseInt(document.getElementById('addStock')?.value) || 0;
    const fileInput = document.getElementById('addImageFile');
    const urlInput = document.getElementById('addImageUrl')?.value.trim();

    if (!name) return showToast('กรุณากรอกชื่อการ์ด / โปเกมอน', 'warning');

    let imageUrl = urlInput || 'https://via.placeholder.com/200x280?text=No+Image';

    // ถ้ามีการเลือกไฟล์อัปโหลด อ่านเป็น Base64 Data URL
    if (fileInput && fileInput.files && fileInput.files[0]) {
        try {
            imageUrl = await readFileAsBase64(fileInput.files[0]);
        } catch (e) {
            console.error('File read error', e);
        }
    }

    const newCard = {
        id: generateId(),
        type,
        name,
        element,
        rarity,
        price,
        stock: stockQty,
        image: imageUrl,
        createdAt: new Date().toISOString()
    };

    globalCards.unshift(newCard);
    storage.setItem('cards', globalCards);

    // Reset Form
    document.getElementById('addCardForm')?.reset();
    showToast(`บันทึกข้อมูล "${name}" เข้าสต็อกเรียบร้อย!`, 'success');

    updateStats();
    renderStockTable();
    filterCards();
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

function deleteCard(cardId) {
    const card = globalCards.find(c => c.id === cardId);
    if (!card) return;

    if (confirm(`คุณต้องการลบการ์ด "${card.name}" ออกจากระบบใช่หรือไม่?`)) {
        globalCards = globalCards.filter(c => c.id !== cardId);
        storage.setItem('cards', globalCards);
        showToast(`ลบการ์ด "${card.name}" แล้ว`, 'info');
        updateStats();
        renderStockTable();
        filterCards();
    }
}

function renderStockTable() {
    const tbody = document.getElementById('stockTableBody');
    if (!tbody) return;

    if (globalCards.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8 text-slate-500">ยังไม่มีรายการการ์ดในสต็อก กรุณาเพิ่มการ์ดด้านบน</td>
            </tr>`;
        return;
    }

    tbody.innerHTML = globalCards.map(card => `
        <tr class="hover:bg-slate-800/50 transition-colors border-b border-slate-700/50">
            <td class="p-3">
                <img src="${card.image}" alt="${escapeHTML(card.name)}" class="w-12 h-16 object-contain rounded bg-slate-900 border border-slate-700" onerror="this.src='https://via.placeholder.com/100?text=No+Img';">
            </td>
            <td class="p-3 font-semibold text-white">${escapeHTML(card.name)}</td>
            <td class="p-3"><span class="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs font-bold">${card.type}</span></td>
            <td class="p-3 text-amber-400 text-xs font-semibold">${escapeHTML(card.element || '-')}</td>
            <td class="p-3 text-blue-400 text-xs font-semibold">${escapeHTML(card.rarity || '-')}</td>
            <td class="p-3 font-bold text-emerald-400">${(card.price || 0).toLocaleString()} ฿ (สต็อก: ${card.stock || 0})</td>
            <td class="p-3 text-right">
                <button onclick="deleteCard('${card.id}')" class="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition-all text-xs font-bold">
                    <i class="fa-solid fa-trash-can mr-1"></i> ลบ
                </button>
            </td>
        </tr>
    `).join('');
}

// ------------------------------------------
// 6. HOME & CARD DISPLAY
// ------------------------------------------
function updateStats() {
    const total = globalCards.length;
    const pokemon = globalCards.filter(c => c.type === 'Pokemon').length;
    const trainer = globalCards.filter(c => c.type === 'Trainer').length;
    const energy = globalCards.filter(c => c.type === 'Energy').length;

    if (document.getElementById('statTotal')) document.getElementById('statTotal').textContent = total;
    if (document.getElementById('statPokemon')) document.getElementById('statPokemon').textContent = pokemon;
    if (document.getElementById('statTrainer')) document.getElementById('statTrainer').textContent = trainer;
    if (document.getElementById('statEnergy')) document.getElementById('statEnergy').textContent = energy;
}

function renderCardGrid(cards) {
    const grid = document.getElementById('cardGrid');
    if (!grid) return;

    if (cards.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-16 text-slate-500"><i class="fa-solid fa-box-open text-4xl mb-3 block"></i>ไม่พบรายการการ์ดที่ค้นหา</div>`;
        return;
    }

    grid.innerHTML = cards.map(card => `
        <div class="bg-slate-800 border border-slate-700 hover:border-slate-600 p-4 rounded-2xl shadow-lg flex flex-col justify-between transition-all hover:-translate-y-1">
            <div>
                <div class="h-48 mb-3 flex items-center justify-center bg-slate-900/50 rounded-xl overflow-hidden p-2">
                    <img src="${card.image}" alt="${escapeHTML(card.name)}" class="h-full object-contain mx-auto" onerror="this.src='https://via.placeholder.com/150?text=No+Image';">
                </div>
                <h4 class="font-bold text-white text-base mb-1 truncate">${escapeHTML(card.name)}</h4>
                <div class="flex flex-wrap gap-1.5 mb-3">
                    <span class="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">${card.type}</span>
                    ${card.element ? `<span class="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-semibold">${escapeHTML(card.element)}</span>` : ''}
                    ${card.rarity ? `<span class="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-semibold">${escapeHTML(card.rarity)}</span>` : ''}
                </div>
            </div>
            <div class="border-t border-slate-700/60 pt-3 flex justify-between items-center">
                <div>
                    <div class="font-extrabold text-amber-400 text-lg">${(card.price || 0).toLocaleString()} <span class="text-xs">฿</span></div>
                    <div class="text-[11px] text-slate-400">คงเหลือ: <span class="font-bold text-slate-200">${card.stock || 0}</span></div>
                </div>
                <button onclick="pos_addToCart('${card.id}')" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center gap-1.5">
                    <i class="fa-solid fa-cart-plus"></i> + ใส่ตะกร้า
                </button>
            </div>
        </div>
    `).join('');
}

function filterCards() {
    const search = document.getElementById('searchInput')?.value?.toLowerCase() || '';
    const type = document.getElementById('filterType')?.value || 'All';
    const element = document.getElementById('filterElement')?.value || 'All';

    const filtered = globalCards.filter(c => {
        const matchSearch = !search || c.name?.toLowerCase().includes(search);
        const matchType = type === 'All' || c.type === type;
        const matchElement = element === 'All' || c.element === element;
        return matchSearch && matchType && matchElement;
    });

    renderCardGrid(filtered);
}

// ------------------------------------------
// 7. POS SYSTEM LOGIC
// ------------------------------------------
function pos_addToCart(cardId) {
    const card = globalCards.find(c => c.id === cardId);
    if (!card) return;

    if (card.stock <= 0) {
        return showToast(`สินค้า "${card.name}" หมดสต็อกแล้ว!`, 'error');
    }

    const item = currentCart.find(i => i.id === cardId);
    if (item) {
        if (item.qty >= card.stock) {
            return showToast(`ไม่สามารถเพิ่มเพิ่มได้ (สินค้ามีในสต็อกเพียง ${card.stock} ชิ้น)`, 'warning');
        }
        item.qty += 1;
    } else {
        currentCart.push({ id: card.id, name: card.name, price: card.price || 0, qty: 1, image: card.image, maxStock: card.stock });
    }
    showToast(`เพิ่ม "${card.name}" ลงตะกร้าแล้ว`, 'success');
    renderCartUI();
}

function pos_updateCartQty(cardId, delta) {
    const index = currentCart.findIndex(i => i.id === cardId);
    if (index !== -1) {
        const item = currentCart[index];
        if (delta > 0 && item.qty >= item.maxStock) {
            return showToast(`จำนวนถึงขีดจำกัดในสต็อกแล้ว (${item.maxStock} ชิ้น)`, 'warning');
        }
        item.qty += delta;
        if (item.qty <= 0) currentCart.splice(index, 1);
        renderCartUI();
    }
}

function pos_calculateTotal() {
    const subtotal = currentCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const shipping = subtotal > 0 ? 50 : 0;
    const grandTotal = subtotal + shipping;

    if (document.getElementById('subTotalText')) document.getElementById('subTotalText').textContent = `${subtotal.toLocaleString()} ฿`;
    if (document.getElementById('shippingText')) document.getElementById('shippingText').textContent = `${shipping.toLocaleString()} ฿`;
    if (document.getElementById('grandTotalText')) document.getElementById('grandTotalText').textContent = `${grandTotal.toLocaleString()} ฿`;
}

function renderCartUI() {
    const container = document.getElementById('orderItemList');
    if (!container) return;

    if (currentCart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16 text-slate-500">
                <i class="fa-solid fa-basket-shopping text-4xl mb-3 block opacity-50"></i>
                <p>ยังไม่มีสินค้าในตะกร้า</p>
                <button onclick="switchPage('home')" class="mt-3 px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-colors">ไปเลือกสินค้าหน้าแรก</button>
            </div>`;
    } else {
        container.innerHTML = currentCart.map(item => `
            <div class="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-700/80 rounded-xl mb-2.5">
                <div class="flex items-center gap-3">
                    <img src="${item.image}" alt="${escapeHTML(item.name)}" class="w-10 h-12 object-contain rounded bg-slate-800" onerror="this.src='https://via.placeholder.com/80?text=No+Img';">
                    <div>
                        <h4 class="font-bold text-sm text-white m-0">${escapeHTML(item.name)}</h4>
                        <p class="text-xs text-amber-400 font-semibold m-0">${item.price.toLocaleString()} ฿</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="pos_updateCartQty('${item.id}', -1)" class="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold border border-slate-600 flex items-center justify-center">-</button>
                    <span class="text-sm font-bold text-white w-6 text-center">${item.qty}</span>
                    <button onclick="pos_updateCartQty('${item.id}', 1)" class="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold border border-slate-600 flex items-center justify-center">+</button>
                </div>
            </div>
        `).join('');
    }
    pos_calculateTotal();
}

function pos_confirmOrder() {
    if (currentCart.length === 0) {
        showToast('ไม่มีสินค้าในตะกร้า', 'warning');
        return;
    }

    // ตัดสต็อกการ์ดจริงในระบบ
    currentCart.forEach(cartItem => {
        const card = globalCards.find(c => c.id === cartItem.id);
        if (card) {
            card.stock = Math.max(0, card.stock - cartItem.qty);
        }
    });

    storage.setItem('cards', globalCards);
    showToast('ชำระเงินและตัดสต็อกเรียบร้อยแล้ว!', 'success');

    currentCart = [];
    renderCartUI();
    updateStats();
    renderStockTable();
    filterCards();
}

// ------------------------------------------
// 8. SYSTEM INITIALIZATION
// ------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    renderDropdownOptions();
    updateStats();
    filterCards();
    renderStockTable();
    console.log('✅ Full Pokémon TCG System Ready');
});

function renderCardGrid(cards) {
    const grid = document.getElementById('cardGrid');
    if (!grid) return;

    if (cards.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-16 text-slate-500"><i class="fa-solid fa-box-open text-4xl mb-3 block"></i>ไม่พบรายการการ์ดที่ค้นหา</div>`;
        return;
    }

    grid.innerHTML = cards.map(card => `
        <div class="bg-slate-800 border border-slate-700 hover:border-slate-600 p-4 rounded-2xl shadow-lg flex flex-row gap-4 transition-all hover:-translate-y-1 items-center">
            <!-- ฝั่งซ้าย: รูปภาพสินค้า -->
            <div class="w-1/3 h-40 flex items-center justify-center bg-slate-900/50 rounded-xl overflow-hidden p-2 shrink-0">
                <img src="${card.image}" alt="${escapeHTML(card.name)}" class="h-full object-contain mx-auto" onerror="this.src='https://via.placeholder.com/150?text=No+Image';">
            </div>
            
            <!-- ฝั่งขวา: ข้อมูลสินค้าและปุ่ม -->
            <div class="w-2/3 flex flex-col justify-between h-full">
                <div>
                    <h4 class="font-bold text-white text-base mb-1 truncate">${escapeHTML(card.name)}</h4>
                    <div class="flex flex-wrap gap-1.5 mb-3">
                        <span class="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">${card.type}</span>
                        ${card.element ? `<span class="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-semibold">${escapeHTML(card.element)}</span>` : ''}
                        ${card.rarity ? `<span class="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-semibold">${escapeHTML(card.rarity)}</span>` : ''}
                    </div>
                </div>
                
                <div class="border-t border-slate-700/60 pt-2 flex flex-col gap-2">
                    <div class="flex justify-between items-baseline">
                        <div class="font-extrabold text-amber-400 text-base">${(card.price || 0).toLocaleString()} <span class="text-xs">฿</span></div>
                        <div class="text-[11px] text-slate-400">คงเหลือ: <span class="font-bold text-slate-200">${card.stock || 0}</span></div>
                    </div>
                    <button onclick="pos_addToCart('${card.id}')" class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-1.5">
                        <i class="fa-solid fa-cart-plus"></i> + ใส่ตะกร้า
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

