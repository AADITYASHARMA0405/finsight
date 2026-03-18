/* ==========================================================================
   View: Team Audit Logs
   ========================================================================== */

import { api } from '../services/api.js';

export function renderAuditLogs(container) {
    const html = `
        <header class="header">
            <div class="header-left">
                <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle Menu">
                    <i class="ph ph-list"></i>
                </button>
                <div>
                    <h1 class="page-title">Activity Audit Logs</h1>
                    <p class="date-subtitle">Track team actions and system events</p>
                </div>
            </div>
        </header>

        <div class="section-container animate-on-load">
            <div class="section-header">
                <h2 class="section-title">System Activity</h2>
                <div class="search-bar" style="max-width: 300px;">
                    <i class="ph ph-magnifying-glass"></i>
                    <input type="text" placeholder="Filter activity...">
                </div>
            </div>

            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>Status</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody id="audit-logs-body">
                        <tr><td colspan="5"><div class="skeleton-text" style="width: 100%; height: 24px;"></div></td></tr>
                        <tr><td colspan="5"><div class="skeleton-text" style="width: 100%; height: 24px;"></div></td></tr>
                        <tr><td colspan="5"><div class="skeleton-text" style="width: 100%; height: 24px;"></div></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
    initializeAuditLogs();
}

async function initializeAuditLogs() {
    const logs = await api.getAuditLogs();

    const tbody = document.getElementById('audit-logs-body');
    if (!tbody) return;

    tbody.innerHTML = logs.map(l => `
            <tr>
                <td>
                    <div class="customer-cell">
                        <div class="customer-avatar">${l.initials}</div>
                        <span class="customer-name">${l.user}</span>
                    </div>
                </td>
                <td><span style="font-weight: 600;">${l.action}</span></td>
                <td><span style="color: var(--text-secondary); font-size: 0.9rem;">${l.details}</span></td>
                <td>
                    <div class="status-indicator">
                        <span class="status-dot ${l.status === 'Success' ? 'success' : 'negative'}"></span>
                        <span>${l.status}</span>
                    </div>
                </td>
                <td style="color: var(--text-secondary); font-size: 0.85rem;">${l.time}</td>
            </tr>
        `).join('');
}
