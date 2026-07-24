// js/pos.js
import { StorageService } from "./storage.js";

export const PosModule = {
    cart: [],

    async init() {
        await this.loadPosProducts();
        this.bindEvents();
    },

    async loadPosProducts() {
        const stockList = await StorageService.getStock();
        const container = document.querySelector("#pos-product-list");
        if (!container) return;

        container.innerHTML = "";
        stockList.forEach(item => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <h3>${item.name}</h3>
                <p>ราคา: ${item.price} บาท</p>
                <p>คงเหลือ: ${item.quantity}</p>
                <button class="btn-add-cart" data-id="${item.id}" ${item.quantity <= 0 ? 'disabled' : ''}>เพิ่มลงตะกร้า</button>
            `;
            container.appendChild(card);
        });
    },

    bindEvents() {
        const container = document.querySelector("#pos-product-list");
        if (container) {
            container.addEventListener("click", async (e) => {
                if (e.target.classList.contains("btn-add-cart")) {
                    const id = e.target.getAttribute("data-id");
                    const stockList = await StorageService.getStock();
                    const product = stockList.find(p => String(p.id) === String(id));
                    
                    if (product && product.quantity > 0) {
                        this.addToCart(product);
                    }
                }
            });
        }

        const checkoutBtn = document.querySelector("#btn-checkout");
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", async () => {
                if (this.cart.length === 0) {
                    alert("ไม่มีสินค้าในตะกร้า");
                    return;
                }

                const orderData = {
                    items: this.cart,
                    total: this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
                };

                const orderId = await StorageService.saveOrder(orderData);
                if (orderId) {
                    const stockList = await StorageService.getStock();
                    for (let cartItem of this.cart) {
                        const target = stockList.find(s => String(s.id) === String(cartItem.id));
                        if (target) {
                            target.quantity = Math.max(0, target.quantity - cartItem.qty);
                            await StorageService.saveStockItem(target);
                        }
                    }

                    alert("ชำระเงินสำเร็จ!");
                    this.cart = [];
                    await this.init();
                } else {
                    alert("เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ");
                }
            });
        }
    },

    addToCart(product) {
        const existing = this.cart.find(item => String(item.id) === String(product.id));
        if (existing) {
            if (existing.qty < product.quantity) {
                existing.qty++;
            } else {
                alert("สินค้าในสต็อกหมดแล้ว");
            }
        } else {
            this.cart.push({ ...product, qty: 1 });
        }
        console.log("Cart updated:", this.cart);
    }
};