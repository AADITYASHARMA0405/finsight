/* ==========================================================================
   Application Entry Point
   ========================================================================== */

import { initRouter } from './router.js';
import { initCommandPalette } from './services/search.js';

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // Authentication Guard
    // ----------------------------------------------------------------------
    const token = localStorage.getItem('finsight_token');
    const isLoginRoute = window.location.pathname.endsWith('login.html');
    
    if (!token && !isLoginRoute) {
        window.location.href = 'login.html';
        return; // Stop execution
    }

    // Start the application router
    initRouter();

    // Initialize Global Search / Command Palette
    const searchService = initCommandPalette();

    // Theme Persistence Layer
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    const applyTheme = (theme) => {
        const isDark = theme === 'dark';
        if (isDark) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }

        // Sync all theme toggle buttons on the page
        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) icon.className = isDark ? 'ph ph-sun' : 'ph ph-moon';
            
            // Optional: if it has a span (like in a menu)
            const span = btn.querySelector('span');
            if (span) span.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        });
    };

    applyTheme(savedTheme);

    // Global listener for dynamic buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.theme-toggle-btn');
        if (btn) {
            const isDark = document.body.classList.toggle('dark-theme');
            const newTheme = isDark ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
            window.dispatchEvent(new Event('themeChanged'));
        }
    });

    // Handle external theme changes
    window.addEventListener('themeChanged', () => {
        applyTheme(localStorage.getItem('theme'));
    });

    // Global Command Palette Shortcut Listener (K) is already in search.js
    // exposing search globally just in case view needs it
    window.openSearch = searchService.open;

    // Initialize Global Toast Container
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);

    // Global Toast Function
    window.showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'ph-check-circle';
        if (type === 'info') icon = 'ph-info';
        if (type === 'warning') icon = 'ph-warning-circle';

        toast.innerHTML = `
            <i class="ph ${icon}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // Global CSV Export Utility
    window.exportToCSV = function(filename, data) {
        if (!data || !data.length) {
            window.showToast('No data available to export', 'warning');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvRows = [];
        csvRows.push(headers.join(','));

        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header];
                const escaped = ('' + val).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        window.showToast(`Exported ${filename} successfully`, 'success');
    };

    // Update branding references if any still exist in window title for example
    document.title = 'FinSight Dashboard';
});
