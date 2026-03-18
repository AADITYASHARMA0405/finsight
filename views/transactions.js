/* ==========================================================================
   View: Transactions Ledger
   ========================================================================== */

import { api } from '../services/api.js';

export function renderTransactions(container) {
    const html = `
        <header class="header">
            <div class="header-left">
                <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle Menu">
                    <i class="ph ph-list"></i>
                </button>
                <div>
                    <h1 class="page-title">Transactions Ledger</h1>
                    <p class="date-subtitle">Comprehensive history of all incoming and outgoing funds</p>
                </div>
            </div>
            
            <div class="header-right">
                <button class="icon-btn" id="export-btn" aria-label="Export Transactions">
                    <i class="ph ph-download-simple"></i>
                </button>
            </div>
        </header>

        <div class="section-container animate-on-load">
            <div class="section-header">
                <!-- Search and Filter Tools -->
                <div style="display: flex; gap: 16px; width: 100%; align-items: center;">
                    <div style="position: relative; flex: 1; max-width: 400px;">
                        <i class="ph ph-magnifying-glass" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-size: 1.2rem;"></i>
                        <input type="text" id="transaction-search" placeholder="Search by customer, id, or plan..." style="width: 100%; padding: 12px 16px 12px 48px; border: var(--border-light); border-radius: 8px; background-color: var(--bg-main); color: var(--text-primary); font-family: inherit; font-size: 0.95rem;">
                    </div>
                    
                    <div class="chart-controls" style="margin-left: auto;">
                        <button class="filter-btn active" data-filter="All">All</button>
                        <button class="filter-btn" data-filter="Completed">Completed</button>
                        <button class="filter-btn" data-filter="Pending">Pending</button>
                        <button class="filter-btn" data-filter="Failed">Failed</button>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="data-table" id="transactions-table">
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Customer</th>
                            <th>Type</th>
                            <th>Plan</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody id="full-transactions-body">
                        <!-- Skeletons -->
                        <tr><td colspan="7"><div class="skeleton-text" style="width: 100%; height: 24px;"></div></td></tr>
                        <tr><td colspan="7"><div class="skeleton-text" style="width: 100%; height: 24px;"></div></td></tr>
                        <tr><td colspan="7"><div class="skeleton-text" style="width: 100%; height: 24px;"></div></td></tr>
                        <tr><td colspan="7"><div class="skeleton-text" style="width: 100%; height: 24px;"></div></td></tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Empty State (Hidden initially) -->
            <div id="no-results" style="display: none; padding: 48px 0; text-align: center; color: var(--text-secondary);">
                <i class="ph ph-folder-open" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
                <h3 style="color: var(--text-primary); margin-bottom: 8px;">No transactions found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        </div>
    `;

    container.innerHTML = html;
    initializeTransactionsLogic();
}

async function initializeTransactionsLogic() {
    // 1. Mobile Menu Re-bind
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (mobileBtn && sidebar) {
        const newBtn = mobileBtn.cloneNode(true);
        mobileBtn.parentNode.replaceChild(newBtn, mobileBtn);
        newBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // 2. Setup Skeleton Styles (ensure they exist)
    if (!document.getElementById('skeleton-styles')) {
        const style = document.createElement('style');
        style.id = 'skeleton-styles';
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
        `;
        document.head.appendChild(style);
    }

    // 3. Staggered Entrance Animation
    const animatedElements = document.querySelectorAll('.animate-on-load');
    animatedElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });

    // 4. Fetch Data
    const fullLedger = await api.getFullTransactions();
    let currentData = [...fullLedger]; // Copy for filtering

    // 5. Render Function
    const tbody = document.getElementById('full-transactions-body');
    const noResults = document.getElementById('no-results');
    const table = document.getElementById('transactions-table');

    function renderTable(data) {
        if (!tbody) return; // Prevent errors if user navigates away fast

        if (data.length === 0) {
            table.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }

        table.style.display = 'table';
        noResults.style.display = 'none';

        let html = '';
        data.forEach(tx => {
            const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(tx.amount);
            
            let statusClass = 'success'; // default to green for completed
            if (tx.status === 'Pending') statusClass = 'pending'; // yellow
            if (tx.status === 'Failed') statusClass = 'failed'; // red (need to add CSS for this)
            
            const planClass = tx.plan.toLowerCase() === 'enterprise' ? 'enterprise' : '';

            // Generate initials
            const initials = tx.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            html += `
                <tr>
                    <td style="font-family: monospace; color: var(--text-secondary);">${tx.id}</td>
                    <td>
                        <div class="customer-cell">
                            <div class="customer-avatar">${initials}</div>
                            <span class="customer-name">${tx.name}</span>
                        </div>
                    </td>
                    <td style="color: var(--text-secondary);">${tx.type}</td>
                    <td><span class="plan-badge ${planClass}">${tx.plan}</span></td>
                    <td class="amount-cell">${formattedAmount}</td>
                    <td>
                        <div class="status-indicator">
                            <span class="status-dot ${statusClass === 'failed' ? 'negative' : statusClass}"></span>
                            <span>${tx.status}</span>
                        </div>
                    </td>
                    <td style="color: var(--text-secondary); font-size: 0.9rem;">${tx.date}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        
        // Add dynamic CSS for failed dot if not exists
        if (!document.getElementById('failed-dot-style')) {
            const style = document.createElement('style');
            style.id = 'failed-dot-style';
            style.textContent = '.status-dot.negative { background-color: var(--status-negative); }';
            document.head.appendChild(style);
        }
    }

    // Initial Render
    renderTable(currentData);

    // 6. Bind Interactions
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            window.exportToCSV('FinSight_Transactions.csv', fullLedger);
        });
    }

    // 6. Search & Filter Logic
    const searchInput = document.getElementById('transaction-search');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let activeFilter = 'All';

    function applyFilters() {
        const query = searchInput.value.toLowerCase();
        
        const filtered = fullLedger.filter(tx => {
            const matchesSearch = tx.name.toLowerCase().includes(query) || 
                                  tx.id.toLowerCase().includes(query) ||
                                  tx.plan.toLowerCase().includes(query) ||
                                  tx.type.toLowerCase().includes(query);
            
            const matchesStatus = activeFilter === 'All' || tx.status === activeFilter;
            
            return matchesSearch && matchesStatus;
        });

        renderTable(filtered);
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeFilter = e.target.dataset.filter;
            applyFilters();
        });
    });
}
