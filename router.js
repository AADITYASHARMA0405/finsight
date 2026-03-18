/* ==========================================================================
   Router Engine
   ========================================================================== */

import { renderOverview } from './views/overview.js';
import { renderRevenue } from './views/revenue.js';
import { renderCustomers } from './views/customers.js';
import { renderTransactions } from './views/transactions.js';
import { renderDocuments } from './views/documents.js';
import { renderCompare } from './views/compare.js';
import { renderReports } from './views/reports.js';
import { renderAnomalies } from './views/anomalies.js';
import { renderTrends } from './views/trends.js';
import { renderSettings } from './views/settings.js';
import { renderAuditLogs } from './views/audit_logs.js';

const routes = {
    '#/': renderOverview,
    '#/dashboard': renderOverview,
    '#/overview': renderOverview,
    '#/upload': renderDocuments,
    '#/documents': renderDocuments,
    '#/compare': renderCompare,
    '#/anomalies': renderAnomalies,
    '#/trends': renderTrends,
    '#/settings': renderSettings,
    '#/revenue': renderRevenue,
    '#/customers': renderCustomers,
    '#/transactions': renderTransactions,
    '#/reports': renderReports,
    '#/audit-logs': renderAuditLogs
};

// Simple Hash Router
export function initRouter() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Handle active class styling immediately
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Auto close mobile sidebar if open
            const sidebar = document.getElementById('sidebar');
            if (window.innerWidth <= 1024 && sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Handle Hash Changes
    window.addEventListener('hashchange', handleRoute);

    // Initial load
    handleRoute();
}

function handleRoute() {
    let hash = window.location.hash;
    
    // Default to dashboard/overview if no hash
    if (!hash || hash === '#' || hash === '#/') {
        hash = '#/dashboard';
    }

    // Support for query params in hash (e.g., #/compare?ids=...)
    const cleanPath = hash.split('?')[0];
    const renderFunc = routes[cleanPath] || renderOverview;
    
    const routerView = document.getElementById('router-view');
    if (routerView) {
        // Clear current view
        routerView.innerHTML = '';
        // Render new view
        renderFunc(routerView);
        
        // Update sidebar active state based on current hash
        updateSidebarState(cleanPath);
    }
}

function updateSidebarState(path) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === path) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}
