/* ==========================================================================
   View: Overview Dashboard
   ========================================================================== */

import { api } from '../services/api.js';
import { auth } from '../services/auth.js';

export function renderOverview(container) {
    const html = `
        <!-- Header -->
        <header class="header">
            <div class="header-left">
                <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle Menu">
                    <i class="ph ph-list"></i>
                </button>
                <div>
                    <h1 class="page-title">Welcome back, ${auth.getUser().name}</h1>
                    <p class="date-subtitle" id="current-date"></p>
                </div>
            </div>
            
            <div class="header-right">
                <div class="header-search-trigger" onclick="window.openSearch()">
                    <i class="ph ph-magnifying-glass"></i>
                    <span>Search or type command...</span>
                    <div class="search-hint">⌘K</div>
                </div>
                <button class="icon-btn theme-toggle-btn" id="header-theme-toggle" aria-label="Toggle Theme">
                    <i class="ph ph-moon"></i>
                </button>
                <button class="text-btn" id="customize-dashboard-btn" style="border: 1px solid var(--border-light); padding: 6px 12px; border-radius: 6px; font-size: 0.85rem;">
                    <i class="ph ph-sliders"></i> Customize
                </button>
                <button class="icon-btn" aria-label="Notifications" id="notification-btn">
                    <i class="ph ph-bell"></i>
                    <span class="notification-badge" id="notif-badge">4</span>
                    <span class="pulse-dot" style="position: absolute; top: 0; right: 0;"></span>
                </button>
                <div class="profile-dropdown-container" style="position: relative;">
                    <button id="profile-trigger" class="profile-trigger-btn" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <div class="profile-avatar" title="View Profile">
                           <img src="${auth.getUser().avatar}" alt="User Profile">
                        </div>
                        <i class="ph ph-caret-down" style="color: var(--text-secondary);"></i>
                    </button>
                    
                    <div id="profile-menu" class="dropdown-menu" style="display: none; position: absolute; top: calc(100% + 8px); right: 0; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: 12px; box-shadow: var(--shadow-md); min-width: 180px; z-index: 100;">
                        <div style="padding: 16px; border-bottom: 1px solid var(--border-light);">
                            <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">${auth.getUser().name}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${auth.getUser().role}</div>
                        </div>
                        <div style="padding: 8px;">
                            <button class="profile-dropdown-item" onclick="window.location.hash='#/settings'"><i class="ph ph-user"></i> Profile</button>
                            <button class="profile-dropdown-item" onclick="window.location.hash='#/settings'"><i class="ph ph-gear"></i> Settings</button>
                        </div>
                        <div style="border-top: 1px solid var(--border-light); padding: 8px;">
                            <button id="logout-btn" class="profile-dropdown-item" style="color: var(--status-negative);"><i class="ph ph-sign-out"></i> Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- KPI Cards Grid -->
        <div class="kpi-grid" id="kpi-container">
            <!-- Skeletons -->
            ${generateKPISkeleton('totalDocs')}
            ${generateKPISkeleton('anomalies', 0.1)}
            ${generateKPISkeleton('processed', 0.2)}
            ${generateKPISkeleton('highSeverity', 0.3)}
        </div>

        <!-- Customization Overlay -->
        <div id="customize-overlay" class="customize-overlay" style="display: none;">
            <p>Dashboard Customization Active</p>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">Drag cards to reorder • Click <i class="ph ph-eye-slash" style="font-size: 0.9rem;"></i> to hide a widget</p>
            <div id="hidden-widgets-list" class="hidden-widgets-list"></div>
            <button class="text-btn" id="finish-customization" style="background: var(--bg-sidebar); color: var(--text-inverse); margin-top: 12px;">Finish Customization</button>
        </div>

        <!-- Charts Section -->
        <div class="section-container animate-on-load" style="animation-delay: 0.4s;">
            <div class="section-header">
                <h2 class="section-title">Financial Metrics Trend</h2>
                <div class="chart-controls">
                    <button class="filter-btn active">12M</button>
                    <button class="filter-btn">YTD</button>
                    <button class="filter-btn">ALL</button>
                </div>
            </div>
            <div class="chart-wrapper" id="chart-container">
                <div class="chart-legend" style="display: flex; gap: 16px; font-size: 0.8rem; margin-bottom: 12px; color: var(--text-secondary); justify-content: flex-end; padding-right: 12px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="width: 8px; height: 8px; border-radius: 50%; background: #00C896;"></span>
                        <span>Revenue</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="width: 8px; height: 8px; border-radius: 50%; background: #EF4444;"></span>
                        <span>Expenses</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="width: 8px; height: 8px; border-radius: 50%; background: #3B82F6;"></span>
                        <span>Net Income</span>
                    </div>
                </div>
                <canvas id="arrChart"></canvas>
            </div>
        </div>

        <!-- Recent Activity Section -->
        <div class="section-container animate-on-load" style="animation-delay: 0.5s;">
            <div class="section-header">
                <h2 class="section-title">Recent Document Analysis</h2>
                <button class="text-btn" id="view-all-docs">View All</button>
            </div>
            
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Document</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Anomalies</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody id="recent-transactions-body">
                        <tr><td colspan="5"><div class="skeleton-text" style="width: 100%; height: 20px;"></div></td></tr>
                        <tr><td colspan="5"><div class="skeleton-text" style="width: 100%; height: 20px;"></div></td></tr>
                        <tr><td colspan="5"><div class="skeleton-text" style="width: 100%; height: 20px;"></div></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
    initializeOverviewLogic();
}

function generateKPISkeleton(widgetId, delay = 0) {
    return `
        <div class="kpi-card animate-on-load" data-widget="${widgetId}" style="animation-delay: ${delay}s;">
            <div class="kpi-header">
                <div class="skeleton-text" style="width: 120px; height: 16px;"></div>
                <div class="skeleton-text" style="width: 24px; height: 24px; border-radius: 4px;"></div>
            </div>
            <div class="skeleton-text" style="width: 150px; height: 36px; margin: 16px 0;"></div>
            <div class="skeleton-text" style="width: 100px; height: 14px;"></div>
        </div>
    `;
}

async function initializeOverviewLogic() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString('en-IN', options);
    }
    
    // Mobile Menu
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (mobileBtn && sidebar) {
        const newBtn = mobileBtn.cloneNode(true);
        mobileBtn.parentNode.replaceChild(newBtn, mobileBtn);
        newBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    }

    // Styles
    ensureStyles();

    // Data
    await populateKPIs();
    
    const viewAllBtn = document.getElementById('view-all-docs');
    if (viewAllBtn) {
        viewAllBtn.onclick = () => {
            window.location.hash = '#/documents';
        };
    }

    const notifBtn = document.getElementById('notification-btn');
    if (notifBtn) {
        notifBtn.onclick = () => window.showToast('You have 4 high severity alerts requiring attention', 'warning');
    }

    const profileTrigger = document.getElementById('profile-trigger');
    const profileMenu = document.getElementById('profile-menu');
    
    if (profileTrigger && profileMenu) {
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.style.display = profileMenu.style.display === 'none' ? 'block' : 'none';
        });
        
        document.addEventListener('click', (e) => {
            if (!profileTrigger.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.style.display = 'none';
            }
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = () => auth.logout();
    }

    Promise.all([
        initChart(),
        populateTransactions()
    ]);

    setupCustomization();
    setupHeaderThemeToggle();
}

function setupHeaderThemeToggle() {
    const btn = document.getElementById('header-theme-toggle');
    if (!btn) return;

    const updateIcon = () => {
        const icon = btn.querySelector('i');
        if (document.body.classList.contains('dark-theme')) {
            icon.className = 'ph ph-sun';
        } else {
            icon.className = 'ph ph-moon';
        }
    };

    updateIcon();

    btn.onclick = () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateIcon();
        // Sync with search palette if open
        window.dispatchEvent(new Event('themeChanged'));
    };
    
    // Listen for theme changes from other sources (e.g. palette or settings)
    window.addEventListener('themeChanged', updateIcon);
}

async function populateKPIs() {
    const data = await api.getOverviewKPIs();
    const container = document.getElementById('kpi-container');
    if (!container) return;

    const hiddenWidgets = JSON.parse(localStorage.getItem('hiddenWidgets') || '[]');

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(val);
    const formatPercent = (val) => (val > 0 ? '+' : '') + val + '%';
    const trendClass = (val) => val >= 0 ? 'positive' : 'negative';
    const churnTrendClass = (data?.churnGrowth ?? 0) <= 0 ? 'positive' : 'negative';

    const kpis = [
        { id: 'totalDocs', title: 'Total Documents', value: data?.totalDocs ?? 0, trendValue: data?.totalDocsTrend ?? 'No data', format: (v) => Math.floor(v).toLocaleString(), trend: 'positive', icon: 'ph-file-text', accent: '#3B82F6' /* Blue */ },
        { id: 'anomalies', title: 'Anomalies', value: data?.anomalies ?? 0, trendValue: data?.anomaliesTrend ?? 'No data', format: (v) => Math.floor(v).toLocaleString(), trend: 'negative', icon: 'ph-warning-circle', accent: '#EF4444' /* Red */ },
        { id: 'processed', title: 'Docs Processed', value: parseFloat(data?.processed) || 0, trendValue: data?.processedTrend ?? 'No data', format: (v) => Math.floor(v) + '%', trend: 'positive', icon: 'ph-check-circle', accent: '#00C896' /* Teal-Green */ },
        { id: 'highSeverity', title: 'High Severity', value: data?.highSeverity ?? 0, trendValue: data?.highSeverityTrend ?? 'No data', format: (v) => Math.floor(v).toLocaleString(), trend: 'negative', icon: 'ph-shield-warning', accent: '#F59E0B' /* Orange */ }
    ];

    container.innerHTML = kpis.map(k => `
        <div class="kpi-card glass-card animate-on-load" data-widget="${k.id}" style="opacity: 1; transform: none; display: ${hiddenWidgets.includes(k.id) ? 'none' : 'flex'}; border-top: 3px solid ${k.accent} !important;">
            <div class="kpi-header">
                <span class="kpi-title">${k.title}</span>
                <div class="kpi-actions">
                    <i class="ph ph-eye-slash hide-widget-btn" title="Hide Widget"></i>
                    <div class="kpi-icon-wrapper ${k.id === 'anomalies' || k.id === 'highSeverity' ? 'negative' : 'positive'} ${k.id === 'highSeverity' ? 'pulse-alert' : ''}">
                        <i class="ph ${k.icon}"></i>
                    </div>
                </div>
            </div>
            <div class="kpi-value ${k.id === 'anomalies' ? 'highlight-red' : (k.id === 'totalDocs' ? 'highlight' : '')}" id="val-${k.id}">0</div>
            <div class="kpi-footer">
                <span class="kpi-trend ${k.trend}">${k.trendValue}</span>
            </div>
        </div>
    `).join('');

    // Trigger Count Up
    kpis.forEach(k => {
        if (!hiddenWidgets.includes(k.id)) {
            animateValue(`val-${k.id}`, 0, k.value, 1500, k.format);
        }
    });

    // Re-bind hide buttons
    document.querySelectorAll('.hide-widget-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const widget = btn.closest('[data-widget]');
            const id = widget.dataset.widget;
            widget.style.display = 'none';
            const hidden = JSON.parse(localStorage.getItem('hiddenWidgets') || '[]');
            if (!hidden.includes(id)) {
                hidden.push(id);
                localStorage.setItem('hiddenWidgets', JSON.stringify(hidden));
            }
            window.showToast('Widget hidden', 'info');
            // Refresh the hidden list if customization is active
            const hiddenList = document.getElementById('hidden-widgets-list');
            if (hiddenList && hiddenList.offsetParent !== null) {
                renderHiddenList();
            }
        };
    });
}

function setupCustomization() {
    const customizeBtn = document.getElementById('customize-dashboard-btn');
    const finishBtn = document.getElementById('finish-customization');
    const overlay = document.getElementById('customize-overlay');
    const kpiGrid = document.getElementById('kpi-container');
    
    if (!customizeBtn) return;

    const toggleEditMode = (active) => {
        kpiGrid.classList.toggle('customizing', active);
        overlay.style.display = active ? 'block' : 'none';
        if (active) renderHiddenList();
    };

    customizeBtn.onclick = () => toggleEditMode(true);
    finishBtn.onclick = () => toggleEditMode(false);
}

function renderHiddenList() {
    const hiddenList = document.getElementById('hidden-widgets-list');
    const currentlyHidden = JSON.parse(localStorage.getItem('hiddenWidgets') || '[]');
    
    if (currentlyHidden.length === 0) {
        hiddenList.innerHTML = '<p style="font-size: 0.8rem; color: var(--text-secondary);">No hidden widgets.</p>';
        return;
    }
    
    const labels = {
        'totalDocs': 'Total Documents',
        'anomalies': 'Anomalies Detected',
        'processed': 'Docs Processed',
        'highSeverity': 'High Severity Alerts'
    };

    hiddenList.innerHTML = currentlyHidden.map(id => `
        <button class="restore-widget-btn" data-id="${id}">
            <i class="ph ph-plus"></i> Show ${labels[id] || id}
        </button>
    `).join('');

    document.querySelectorAll('.restore-widget-btn').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            const hidden = JSON.parse(localStorage.getItem('hiddenWidgets') || '[]');
            const newHidden = hidden.filter(item => item !== id);
            localStorage.setItem('hiddenWidgets', JSON.stringify(newHidden));
            
            // Restore visibility and animate
            const widget = document.querySelector(`[data-widget="${id}"]`);
            if (widget) {
                widget.style.display = 'flex';
                // Trigger count up if it was empty
                const valEl = document.getElementById(`val-${id}`);
                if (valEl && valEl.textContent.includes('0')) {
                    // We'd need the value from populateKPIs, but for now just show it
                    populateKPIs(); 
                }
            }
            renderHiddenList();
        };
    });
}

function ensureStyles() {
    if (!document.getElementById('overview-styles')) {
        const style = document.createElement('style');
        style.id = 'overview-styles';
        style.textContent = `
            .skeleton-text {
                background: linear-gradient(90deg, var(--border-light) 25%, var(--bg-surface) 50%, var(--border-light) 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
                border-radius: 4px;
            }
            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            .kpi-actions { display: flex; align-items: center; gap: 12px; }
            .hide-widget-btn { 
                font-size: 1.1rem; 
                cursor: pointer; 
                display: none;
                color: var(--text-secondary);
                transition: color 0.2s;
            }
            .kpi-container.customizing .hide-widget-btn,
            #kpi-container.customizing .hide-widget-btn { display: block; }
            .hide-widget-btn:hover { color: var(--status-negative); }

            .customize-overlay {
                background: var(--bg-surface);
                border: 1px solid var(--border-light);
                border-radius: 12px;
                padding: 24px;
                margin-top: 24px;
                text-align: center;
                animation: slideUp 0.3s ease-out;
            }
            .customize-overlay p { font-weight: 600; margin-bottom: 12px; }
            .hidden-widgets-list { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
            .restore-widget-btn {
                background: var(--bg-main);
                border: 1px solid var(--border-light);
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 0.8rem;
                display: flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .restore-widget-btn:hover { background: var(--border-light); }

            .kpi-value.highlight-red { color: var(--status-negative); }

            .chart-wrapper {
                padding-left: 8px; /* Prevent Y-axis label clipping */
            }

            .kpi-card {
                background-color: #1E2433 !important; /* Refined dark blue */
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
            }

            .severity-pill {
                display: inline-flex;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.02em;
            }

            .pulse-dot {
                width: 8px;
                height: 8px;
                background-color: var(--status-negative);
                border-radius: 50%;
                display: inline-block;
                margin-left: 8px;
                box-shadow: 0 0 0 rgba(239, 68, 68, 0.4);
                animation: pulse-red-dot 2s infinite;
            }

            @keyframes pulse-red-dot {
                0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
        `;
        document.head.appendChild(style);
    }
}

function animateValue(id, start, end, duration, formatter) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentVal = start + (end - start) * easeOutQuart;
        obj.innerHTML = formatter(currentVal);
        if (progress < 1) window.requestAnimationFrame(step);
        else obj.innerHTML = formatter(end);
    };
    window.requestAnimationFrame(step);
}

async function populateTransactions() {
    const transactions = await api.getRecentTransactions();
    const tbody = document.getElementById('recent-transactions-body');
    if (!tbody) return;

    if (!transactions || transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 48px 24px;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; color: var(--text-secondary);">
                        <i class="ph ph-file-dashed" style="font-size: 3rem; opacity: 0.5;"></i>
                        <div style="text-align: center;">
                            <h3 style="color: var(--text-primary); margin-bottom: 4px;">No data yet</h3>
                            <p style="font-size: 0.9rem;">Upload your first document to start analysis.</p>
                        </div>
                        <button class="text-btn" onclick="window.location.hash = '#/upload'" style="margin-top: 8px; background: var(--bg-sidebar); color: var(--text-inverse); padding: 8px 16px; border-radius: 8px;">
                            Upload your first document →
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    transactions.forEach((doc) => {
        const iconColor = doc.type === 'PDF' ? '#EF4444' : '#10B981';
        const iconClass = doc.type === 'PDF' ? 'ph-file-pdf' : 'ph-file-csv';
        const statusClass = doc.status === 'Analyzed' ? 'success' : (doc.status === 'Scanning' ? 'pending' : 'negative');
        
        // Severity Pill Logic
        let severityHtml = '';
        if (doc.anomalies > 0) {
            const pillColor = doc.anomalies > 1 ? 'var(--status-negative)' : 'var(--status-warning)';
            const bgColor = doc.anomalies > 1 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';
            severityHtml = `<span class="severity-pill" style="background: ${bgColor}; color: ${pillColor}; border: 1px solid ${pillColor}40;">${doc.anomalies} ${doc.anomalies > 1 ? 'Anomalies' : 'Anomaly'}</span>`;
        } else {
            severityHtml = `<span class="severity-pill" style="background: rgba(0, 200, 150, 0.1); color: var(--accent-emerald); border: 1px solid var(--accent-emerald)40;">Clean</span>`;
        }

        html += `
            <tr>
                <td>
                    <div class="customer-cell">
                        <div class="file-icon-wrapper" style="background-color: ${iconColor}15; color: ${iconColor}; width: 28px; height: 28px; font-size: 1rem;">
                            <i class="ph ${iconClass}"></i>
                        </div>
                        <span class="customer-name">${doc.name}</span>
                    </div>
                </td>
                <td><span style="color: var(--text-secondary); font-size: 0.85rem;">${doc.type}</span></td>
                <td>
                    <div class="status-indicator">
                        <span class="status-dot ${statusClass}"></span>
                        <span>${doc.status}</span>
                    </div>
                </td>
                <td>
                    ${severityHtml}
                </td>
                <td style="color: var(--text-secondary); font-size: 0.85rem;">${doc.date}</td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

let arrChartInstance = null;
async function initChart() {
    const ctx = document.getElementById('arrChart');
    if (!ctx) return;
    const dbData = await api.getRevenueChartData();
    
    if (!dbData || !dbData.dataPoints || dbData.dataPoints.length === 0) {
        const container = ctx.parentElement;
        container.innerHTML = `
            <div class="chart-empty-state">
                <i class="ph ph-chart-line-up" style="font-size: 2.5rem; opacity: 0.5;"></i>
                <p style="font-size: 1rem;">Upload your first document to see financial trends &rarr;</p>
            </div>
        `;
        return;
    }

    if (arrChartInstance) arrChartInstance.destroy();
    Chart.defaults.font.family = "'Outfit', sans-serif";
    const isDark = document.body.classList.contains('dark-theme');
    Chart.defaults.color = isDark ? '#A1A1AA' : '#6B7280';
    
    // Multi-color line data
    const revenueData = dbData.dataPoints; // green
    const expensesData = dbData.dataPoints.map(v => v * 0.65 + (Math.random() * 50000)); // red
    const incomeData = revenueData.map((v, i) => v - expensesData[i]); // blue

    const allLabels = dbData.months;
    arrChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allLabels,
            datasets: [
                {
                    label: 'Revenue',
                    data: revenueData,
                    borderColor: '#00C896',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    fill: false
                },
                {
                    label: 'Expenses',
                    data: expensesData,
                    borderColor: '#EF4444',
                    borderWidth: 2.5,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    fill: false
                },
                {
                    label: 'Net Income',
                    data: incomeData,
                    borderColor: '#3B82F6',
                    borderWidth: 2.5,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0A0A0B',
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) { label += ': '; }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            layout: {
                padding: {
                    left: 10 // Extra padding to prevent label clipping
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 12 } } },
                y: {
                    grid: { color: isDark ? '#27272A' : '#E5E7EB' },
                    ticks: {
                        callback: function(value) {
                            if (value >= 10000000) return '₹' + (value / 10000000) + 'Cr';
                            if (value >= 100000) return '₹' + (value / 100000) + 'L';
                            if (value >= 1000) return '₹' + (value / 1000) + 'k';
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}
