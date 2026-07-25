<<<<<<< HEAD
/**
 * @file storage.js
 * @description Storage Service layer acting as a Facade for the stock management system.
 * Handles API contracts, offline caching, and synchronization via Repository.
 */

import { StockRepository } from './repository.js';

class StorageService {
    constructor() {
        this.repository = new StockRepository();
        this.cacheKey = 'pokemon_tcg_stock_cache_v1';
        this.memoryStock = [];
        this.listeners = [];
    }

    /**
     * Initializes the storage service and sets up realtime synchronization.
     * @returns {Promise<Array>} The initial stock list.
     */
    async init() {
        try {
            // Load from cache first for instant UI rendering
            this.loadFromCache();

            // Subscribe to realtime updates from repository
            this.repository.subscribe((items) => {
                this.memoryStock = items;
                this.saveToCache(items);
                this._notifyListeners(items);
            });

            this.memoryStock = await this.repository.getStock();
            this.saveToCache(this.memoryStock);
            return this.memoryStock;
        } catch (error) {
            console.error('StorageService init error:', error);
            return this.memoryStock;
        }
    }

    /**
     * Retrieves all stock items.
     * @returns {Array} List of stock items.
     */
    getStock() {
        return this.memoryStock;
    }

    /**
     * Retrieves a specific stock item by ID.
     * @param {string} id - The stock item ID.
     * @returns {Object|null} The stock item or null.
     */
    async getStockItem(id) {
        return await this.repository.getStockItem(id);
    }

    /**
     * Adds a new stock item.
     * @param {Object} item - The stock item data.
     * @returns {Promise<string>} The generated item ID.
     */
    async addStock(item) {
        const timestamp = Date.now();
        const payload = {
            ...item,
            createdAt: timestamp,
            updatedAt: timestamp
        };
        return await this.repository.addStock(payload);
    }

    /**
     * Updates an existing stock item.
     * @param {string} id - The stock item ID.
     * @param {Object} data - The data to update.
     * @returns {Promise<void>}
     */
    async updateStock(id, data) {
        const payload = {
            ...data,
            updatedAt: Date.now()
        };
        await this.repository.updateStock(id, payload);
    }

    /**
     * Deletes a stock item by ID.
     * @param {string} id - The stock item ID.
     * @returns {Promise<void>}
     */
    async deleteStock(id) {
        await this.repository.deleteStock(id);
    }

    /**
     * Saves or forces synchronization of the current stock state.
     * @returns {Promise<void>}
     */
    async saveStock() {
        // Implementation for batch save or manual sync if needed
        this.saveToCache(this.memoryStock);
    }

    /**
     * Subscribes to realtime stock changes.
     * @param {Function} callback - Callback function receiving the updated stock list.
     */
    subscribeStock(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
            // Immediately invoke with current state
            callback(this.memoryStock);
        }
    }

    /**
     * Searches stock items based on a query string.
     * @param {string} query - The search keyword.
     * @returns {Array} Filtered stock items.
     */
    searchStock(query) {
        if (!query) return this.memoryStock;
        const lowerQuery = query.toLowerCase();
        return this.memoryStock.filter(item => 
            (item.name && item.name.toLowerCase().includes(lowerQuery)) ||
            (item.id && item.id.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Backups current stock data as a JSON string.
     * @returns {string} JSON string of stock data.
     */
    backup() {
        return JSON.stringify(this.memoryStock, null, 2);
    }

    /**
     * Restores stock data from a JSON string.
     * @param {string} jsonData - JSON string containing stock items.
     * @returns {Promise<void>}
     */
    async restore(jsonData) {
        try {
            const items = JSON.parse(jsonData);
            await this.repository.setAllStock(items);
        } catch (error) {
            console.error('Failed to restore stock data:', error);
            throw error;
        }
    }

    /**
     * Saves stock items to local cache (localStorage).
     * @private
     * @param {Array} items - Stock items.
     */
    saveToCache(items) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(items));
        } catch (error) {
            console.warn('Failed to save stock to local cache:', error);
        }
    }

    /**
     * Loads stock items from local cache (localStorage).
     * @private
     */
    loadFromCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (cached) {
                this.memoryStock = JSON.parse(cached);
            }
        } catch (error) {
            console.warn('Failed to load stock from local cache:', error);
        }
    }

    /**
     * Notifies all registered listeners of state changes.
     * @private
     * @param {Array} items - Updated stock items.
     */
    _notifyListeners(items) {
        this.listeners.forEach(callback => {
            try {
                callback(items);
            } catch (error) {
                console.error('Error in stock subscriber callback:', error);
            }
        });
    }
}

// Export a singleton instance of StorageService
export const storageService = new StorageService();

/**
 * @file storage.js
 * @description Storage Service layer acting as a Facade for the stock and order management system.
 */

import { StockRepository } from './repository.js';

class StorageService {
    constructor() {
        this.repository = new StockRepository();
        this.cacheKey = 'pokemon_tcg_stock_cache_v1';
        this.orderCacheKey = 'pokemon_tcg_order_cache_v1';
        this.memoryStock = [];
        this.memoryOrders = [];
        this.listeners = [];
        this.orderListeners = [];
    }

    async init() {
        try {
            this.loadFromCache();

            // Subscribe to Stock updates
            this.repository.subscribe((items) => {
                this.memoryStock = items;
                this.saveToCache(items);
                this._notifyListeners(items);
            });

            // Subscribe to Order updates
            this.repository.subscribeOrders((orders) => {
                this.memoryOrders = orders;
                this.saveOrderCache(orders);
                this._notifyOrderListeners(orders);
            });

            this.memoryStock = await this.repository.getStock();
            this.memoryOrders = await this.repository.getOrders();
            
            this.saveToCache(this.memoryStock);
            this.saveOrderCache(this.memoryOrders);
            
            return { stock: this.memoryStock, orders: this.memoryOrders };
        } catch (error) {
            console.error('StorageService init error:', error);
            return { stock: this.memoryStock, orders: this.memoryOrders };
        }
    }

    // --- Stock Methods ---
    getStock() { return this.memoryStock; }
    async getStockItem(id) { return await this.repository.getStockItem(id); }
    async addStock(item) {
        const timestamp = Date.now();
        return await this.repository.addStock({ ...item, createdAt: timestamp, updatedAt: timestamp });
    }
    async updateStock(id, data) {
        await this.repository.updateStock(id, { ...data, updatedAt: Date.now() });
    }
    async deleteStock(id) { await this.repository.deleteStock(id); }
    subscribeStock(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
            callback(this.memoryStock);
        }
    }
    searchStock(query) {
        if (!query) return this.memoryStock;
        const lower = query.toLowerCase();
        return this.memoryStock.filter(i => i.name && i.name.toLowerCase().includes(lower));
    }
    backup() {
        return JSON.stringify({ stock: this.memoryStock, orders: this.memoryOrders }, null, 2);
    }
    async restore(jsonData) {
        const data = JSON.parse(jsonData);
        if (data.stock) await this.repository.setAllStock(data.stock);
    }

    // --- Order Methods ---
    getOrders() { return this.memoryOrders; }
    async addOrder(orderData) {
        const payload = {
            ...orderData,
            createdAt: Date.now()
        };
        return await this.repository.addOrder(payload);
    }
    subscribeOrders(callback) {
        if (typeof callback === 'function') {
            this.orderListeners.push(callback);
            callback(this.memoryOrders);
        }
    }

    // --- Caching helpers ---
    saveToCache(items) {
        try { localStorage.setItem(this.cacheKey, JSON.stringify(items)); } catch (e) {}
    }
    saveOrderCache(orders) {
        try { localStorage.setItem(this.orderCacheKey, JSON.stringify(orders)); } catch (e) {}
    }
    loadFromCache() {
        try {
            const cachedStock = localStorage.getItem(this.cacheKey);
            if (cachedStock) this.memoryStock = JSON.parse(cachedStock);
            const cachedOrders = localStorage.getItem(this.orderCacheKey);
            if (cachedOrders) this.memoryOrders = JSON.parse(cachedOrders);
        } catch (e) {}
    }

    _notifyListeners(items) {
        this.listeners.forEach(cb => cb(items));
    }
    _notifyOrderListeners(orders) {
        this.orderListeners.forEach(cb => cb(orders));
    }
}

=======
/**
 * @file storage.js
 * @description Storage Service layer acting as a Facade for the stock management system.
 * Handles API contracts, offline caching, and synchronization via Repository.
 */

import { StockRepository } from './repository.js';

class StorageService {
    constructor() {
        this.repository = new StockRepository();
        this.cacheKey = 'pokemon_tcg_stock_cache_v1';
        this.memoryStock = [];
        this.listeners = [];
    }

    /**
     * Initializes the storage service and sets up realtime synchronization.
     * @returns {Promise<Array>} The initial stock list.
     */
    async init() {
        try {
            // Load from cache first for instant UI rendering
            this.loadFromCache();

            // Subscribe to realtime updates from repository
            this.repository.subscribe((items) => {
                this.memoryStock = items;
                this.saveToCache(items);
                this._notifyListeners(items);
            });

            this.memoryStock = await this.repository.getStock();
            this.saveToCache(this.memoryStock);
            return this.memoryStock;
        } catch (error) {
            console.error('StorageService init error:', error);
            return this.memoryStock;
        }
    }

    /**
     * Retrieves all stock items.
     * @returns {Array} List of stock items.
     */
    getStock() {
        return this.memoryStock;
    }

    /**
     * Retrieves a specific stock item by ID.
     * @param {string} id - The stock item ID.
     * @returns {Object|null} The stock item or null.
     */
    async getStockItem(id) {
        return await this.repository.getStockItem(id);
    }

    /**
     * Adds a new stock item.
     * @param {Object} item - The stock item data.
     * @returns {Promise<string>} The generated item ID.
     */
    async addStock(item) {
        const timestamp = Date.now();
        const payload = {
            ...item,
            createdAt: timestamp,
            updatedAt: timestamp
        };
        return await this.repository.addStock(payload);
    }

    /**
     * Updates an existing stock item.
     * @param {string} id - The stock item ID.
     * @param {Object} data - The data to update.
     * @returns {Promise<void>}
     */
    async updateStock(id, data) {
        const payload = {
            ...data,
            updatedAt: Date.now()
        };
        await this.repository.updateStock(id, payload);
    }

    /**
     * Deletes a stock item by ID.
     * @param {string} id - The stock item ID.
     * @returns {Promise<void>}
     */
    async deleteStock(id) {
        await this.repository.deleteStock(id);
    }

    /**
     * Saves or forces synchronization of the current stock state.
     * @returns {Promise<void>}
     */
    async saveStock() {
        // Implementation for batch save or manual sync if needed
        this.saveToCache(this.memoryStock);
    }

    /**
     * Subscribes to realtime stock changes.
     * @param {Function} callback - Callback function receiving the updated stock list.
     */
    subscribeStock(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
            // Immediately invoke with current state
            callback(this.memoryStock);
        }
    }

    /**
     * Searches stock items based on a query string.
     * @param {string} query - The search keyword.
     * @returns {Array} Filtered stock items.
     */
    searchStock(query) {
        if (!query) return this.memoryStock;
        const lowerQuery = query.toLowerCase();
        return this.memoryStock.filter(item => 
            (item.name && item.name.toLowerCase().includes(lowerQuery)) ||
            (item.id && item.id.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Backups current stock data as a JSON string.
     * @returns {string} JSON string of stock data.
     */
    backup() {
        return JSON.stringify(this.memoryStock, null, 2);
    }

    /**
     * Restores stock data from a JSON string.
     * @param {string} jsonData - JSON string containing stock items.
     * @returns {Promise<void>}
     */
    async restore(jsonData) {
        try {
            const items = JSON.parse(jsonData);
            await this.repository.setAllStock(items);
        } catch (error) {
            console.error('Failed to restore stock data:', error);
            throw error;
        }
    }

    /**
     * Saves stock items to local cache (localStorage).
     * @private
     * @param {Array} items - Stock items.
     */
    saveToCache(items) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(items));
        } catch (error) {
            console.warn('Failed to save stock to local cache:', error);
        }
    }

    /**
     * Loads stock items from local cache (localStorage).
     * @private
     */
    loadFromCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (cached) {
                this.memoryStock = JSON.parse(cached);
            }
        } catch (error) {
            console.warn('Failed to load stock from local cache:', error);
        }
    }

    /**
     * Notifies all registered listeners of state changes.
     * @private
     * @param {Array} items - Updated stock items.
     */
    _notifyListeners(items) {
        this.listeners.forEach(callback => {
            try {
                callback(items);
            } catch (error) {
                console.error('Error in stock subscriber callback:', error);
            }
        });
    }
}

// Export a singleton instance of StorageService
export const storageService = new StorageService();

/**
 * @file storage.js
 * @description Storage Service layer acting as a Facade for the stock and order management system.
 */

import { StockRepository } from './repository.js';

class StorageService {
    constructor() {
        this.repository = new StockRepository();
        this.cacheKey = 'pokemon_tcg_stock_cache_v1';
        this.orderCacheKey = 'pokemon_tcg_order_cache_v1';
        this.memoryStock = [];
        this.memoryOrders = [];
        this.listeners = [];
        this.orderListeners = [];
    }

    async init() {
        try {
            this.loadFromCache();

            // Subscribe to Stock updates
            this.repository.subscribe((items) => {
                this.memoryStock = items;
                this.saveToCache(items);
                this._notifyListeners(items);
            });

            // Subscribe to Order updates
            this.repository.subscribeOrders((orders) => {
                this.memoryOrders = orders;
                this.saveOrderCache(orders);
                this._notifyOrderListeners(orders);
            });

            this.memoryStock = await this.repository.getStock();
            this.memoryOrders = await this.repository.getOrders();
            
            this.saveToCache(this.memoryStock);
            this.saveOrderCache(this.memoryOrders);
            
            return { stock: this.memoryStock, orders: this.memoryOrders };
        } catch (error) {
            console.error('StorageService init error:', error);
            return { stock: this.memoryStock, orders: this.memoryOrders };
        }
    }

    // --- Stock Methods ---
    getStock() { return this.memoryStock; }
    async getStockItem(id) { return await this.repository.getStockItem(id); }
    async addStock(item) {
        const timestamp = Date.now();
        return await this.repository.addStock({ ...item, createdAt: timestamp, updatedAt: timestamp });
    }
    async updateStock(id, data) {
        await this.repository.updateStock(id, { ...data, updatedAt: Date.now() });
    }
    async deleteStock(id) { await this.repository.deleteStock(id); }
    subscribeStock(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
            callback(this.memoryStock);
        }
    }
    searchStock(query) {
        if (!query) return this.memoryStock;
        const lower = query.toLowerCase();
        return this.memoryStock.filter(i => i.name && i.name.toLowerCase().includes(lower));
    }
    backup() {
        return JSON.stringify({ stock: this.memoryStock, orders: this.memoryOrders }, null, 2);
    }
    async restore(jsonData) {
        const data = JSON.parse(jsonData);
        if (data.stock) await this.repository.setAllStock(data.stock);
    }

    // --- Order Methods ---
    getOrders() { return this.memoryOrders; }
    async addOrder(orderData) {
        const payload = {
            ...orderData,
            createdAt: Date.now()
        };
        return await this.repository.addOrder(payload);
    }
    subscribeOrders(callback) {
        if (typeof callback === 'function') {
            this.orderListeners.push(callback);
            callback(this.memoryOrders);
        }
    }

    // --- Caching helpers ---
    saveToCache(items) {
        try { localStorage.setItem(this.cacheKey, JSON.stringify(items)); } catch (e) {}
    }
    saveOrderCache(orders) {
        try { localStorage.setItem(this.orderCacheKey, JSON.stringify(orders)); } catch (e) {}
    }
    loadFromCache() {
        try {
            const cachedStock = localStorage.getItem(this.cacheKey);
            if (cachedStock) this.memoryStock = JSON.parse(cachedStock);
            const cachedOrders = localStorage.getItem(this.orderCacheKey);
            if (cachedOrders) this.memoryOrders = JSON.parse(cachedOrders);
        } catch (e) {}
    }

    _notifyListeners(items) {
        this.listeners.forEach(cb => cb(items));
    }
    _notifyOrderListeners(orders) {
        this.orderListeners.forEach(cb => cb(orders));
    }
}

>>>>>>> d8ae4f21f72cef69d4c2fa0a93bb95a6246881d9
export const storageService = new StorageService();