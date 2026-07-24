/**
 * js/theme.js
 * จัดการ Dark Mode / Light Mode
 */
import { storage } from './storage.js';

const THEME_KEY = 'app_theme';

export async function initTheme() {
    const htmlEl = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    const themeBtn = document.getElementById('themeToggleBtn');

    // โหลดค่า Theme เดิมจาก Storage (Default: dark)
    let currentTheme = await storage.getItem(THEME_KEY, 'dark');
    htmlEl.setAttribute('data-theme', currentTheme);
    updateIcon(currentTheme, themeIcon);

    if (themeBtn) {
        themeBtn.addEventListener('click', async () => {
            currentTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            htmlEl.setAttribute('data-theme', currentTheme);
            updateIcon(currentTheme, themeIcon);
            await storage.setItem(THEME_KEY, currentTheme);
        });
    }
}

function updateIcon(theme, iconEl) {
    if (!iconEl) return;
    if (theme === 'dark') {
        iconEl.className = 'fa-solid fa-moon';
    } else {
        iconEl.className = 'fa-solid fa-sun';
    }
}