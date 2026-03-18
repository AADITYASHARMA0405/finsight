import { api } from '../services/api.js';

export function renderCustomers(container) {
    const html = `
        <header class="header">
            <div class="header-left">
                <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle Menu">
                    <i class="ph ph-list"></i>
                </button>
                <div>
                    <h1 class="page-title">Customers</h1>
                    <p class="date-subtitle">Manage and observe your client base.</p>
                </div>
            </div>
            
            <div class="header-right">
                <div class="search-bar">
                    <i class="ph ph-magnifying-glass"></i>
                    <input type="text" id="customer-search" placeholder="Search customers...">
                </div>
                <button class="icon-btn" id="export-customers-btn" aria-label="Export Customers" style="margin-right: 8px;">
                    <i class="ph ph-download-simple"></i>
                </button>
                <button class="icon-btn" id="add-customer-btn" aria-label="Add Customer">
                    <i class="ph ph-plus"></i>
                </button>
            </div>
        </header>

        <div class="section-container animate-on-load">
            <div class="section-header">
                <h2 class="section-title">All Customers</h2>
                <div class="chart-controls">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="enterprise">Enterprise</button>
                    <button class="filter-btn" data-filter="pro">Pro</button>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="data-table" id="customers-table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Status</th>
                            <th>Plan</th>
                            <th>Signed Up</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="customers-body">
                        <!-- Skeletons -->
                        <tr><td colspan="5"><div class="skeleton-text" style="width: 100%; height: 24px;"></div></td></tr>
                        <tr><td colspan="5"><div class="skeleton-text" style="width: 100%; height: 24px;"></div></td></tr>
                        <tr><td colspan="5"><div class="skeleton-text" style="width: 100%; height: 24px;"></div></td></tr>
                        <tr><td colspan="5"><div class="skeleton-text" style="width: 100%; height: 24px;"></div></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
    initializeCustomersLogic();
}

function initializeCustomersLogic() {
    // 1. Mobile Menu Re-bind
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (mobileBtn && sidebar) {
        const newBtn = mobileBtn.cloneNode(true);
        mobileBtn.parentNode.replaceChild(newBtn, mobileBtn);
        newBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    }

    // 3. Setup Skeleton Styles (ensure they exist)
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

    // 4. Staggered Entrance Animation
    const animatedElements = document.querySelectorAll('.animate-on-load');
    animatedElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });

    // 6. Bind Interactions
    const addBtn = document.getElementById('add-customer-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            window.showToast('Add Customer feature coming soon...', 'info');
        });
    }

    const exportBtn = document.getElementById('export-customers-btn');
    if (exportBtn) {
        exportBtn.onclick = async () => {
            const data = await api.getCustomers();
            window.exportToCSV('FinSight_Customers.csv', data);
        };
    }

    // 5. Fetch Data Asynchronously
    populateCustomerTable();
}

function ensureSearchStyles() {
    if (!document.getElementById('customer-view-styles')) {
        const style = document.createElement('style');
        style.id = 'customer-view-styles';
        style.textContent = `
            .search-bar {
                display: flex;
                align-items: center;
                background-color: var(--bg-surface);
                border: var(--border-light);
                border-radius: 8px;
                padding: 0 16px;
                height: 44px;
                transition: var(--transition-smooth);
            }
            .search-bar:focus-within {
                border-color: var(--text-secondary);
                box-shadow: var(--shadow-sm);
            }
            .search-bar i {
                color: var(--text-secondary);
                font-size: 1.25rem;
                margin-right: 8px;
            }
            .search-bar input {
                border: none;
                outline: none;
                background: transparent;
                font-family: inherit;
                font-size: 0.95rem;
                color: var(--text-primary);
                width: 200px;
            }
            .search-bar input::placeholder {
                color: var(--text-inverse-muted);
            }
            .action-btn {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                font-size: 1.25rem;
                transition: var(--transition-smooth);
            }
            .action-btn:hover {
                color: var(--text-primary);
            }
        `;
        document.head.appendChild(style);
    }
}

async function populateCustomerTable() {
    const tbody = document.getElementById('customers-body');
    if (!tbody) return;

    // Call Mock API
    const customers = await api.getCustomers();
    
    // Setup Search Logic (needed here because it targets rows created by the async call)
    ensureSearchStyles();

    let html = '';
    customers.forEach((c) => {
        let statusDot = 'success';
        if (c.status === 'At Risk') statusDot = 'pending';
        if (c.status === 'Churned') statusDot = 'negative'; // Using existing css logic
        
        // Inline css patch for negative dot if it doesn't exist
        const dotStyle = c.status === 'Churned' ? 'background-color: var(--status-negative);' : '';

        html += `
            <tr class="customer-row" data-plan="${c.plan.toLowerCase()}">
                <td>
                    <div class="customer-cell">
                        <div class="customer-avatar">${c.initials}</div>
                        <div class="customer-info">
                            <span class="customer-name">${c.name}</span>
                            <span class="customer-email">${c.email}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="status-indicator">
                        <span class="status-dot ${statusDot}" style="${dotStyle}"></span>
                        <span>${c.status}</span>
                    </div>
                </td>
                <td>
                    <span class="plan-badge ${c.planClass}">${c.plan}</span>
                </td>
                <td style="color: var(--text-secondary); font-size: 0.9rem;">${c.date}</td>
                <td>
                    <button class="action-btn" aria-label="Options">
                        <i class="ph ph-dots-three"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;

    // Filter Logic setup
    setupFilters();
}

function setupFilters() {
    const searchInput = document.getElementById('customer-search');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const rows = document.querySelectorAll('.customer-row');

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        const planFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';

        rows.forEach(row => {
            const name = row.querySelector('.customer-name').textContent.toLowerCase();
            const plan = row.dataset.plan;
            
            const matchesSearch = name.includes(searchTerm);
            const matchesPlan = planFilter === 'all' || plan.includes(planFilter);

            if (matchesSearch && matchesPlan) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            applyFilters();
        });
    });
}
