/**
 * js/filter.js
 * จัดการระบบค้นหาและกรองข้อมูลการ์ด
 */
import { escapeHTML } from './utils.js';

export function filterAndSortCards(cards, options = {}) {
    const {
        search = '',
        type = 'All',
        element = 'All',
        rarity = 'All',
        sortBy = 'default'
    } = options;

    return cards.filter(card => {
        // ค้นหาจากชื่อ, SKU หรือชนิด
        const matchSearch = !search || 
            card.name?.toLowerCase().includes(search.toLowerCase()) ||
            card.id?.toLowerCase().includes(search.toLowerCase()) ||
            card.series?.toLowerCase().includes(search.toLowerCase());

        const matchType = type === 'All' || card.type === type;
        const matchElement = element === 'All' || card.element === element;
        const matchRarity = rarity === 'All' || card.rarity === rarity;

        return matchSearch && matchType && matchElement && matchRarity;
    }).sort((a, b) => {
        if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'stock-desc') return (b.stock || 0) - (a.stock || 0);
        if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        return 0;
    });
}