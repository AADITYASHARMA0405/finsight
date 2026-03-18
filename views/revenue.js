/* ==========================================================================
   View: Revenue Analytics
   ========================================================================== */

export function renderRevenue(container) {
    const html = `
        <header class="header">
            <div class="header-left">
                <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle Menu">
                    <i class="ph ph-list"></i>
                </button>
                <div>
                    <h1 class="page-title">Revenue Analytics</h1>
                    <p class="date-subtitle" id="revenue-date-subtitle">Deep dive into financial performance.</p>
                </div>
            </div>
            
            <div class="header-right">
                <button class="icon-btn" id="revenue-export" aria-label="Export Insights">
                    <i class="ph ph-download-simple"></i>
                </button>
            </div>
        </header>

        <div class="kpi-grid">
            <div class="kpi-card animate-on-load">
                <span class="kpi-title">Net Revenue Retention</span>
                <div class="kpi-value">124%</div>
                <div class="kpi-footer"><span class="kpi-trend positive">+2%</span> <span class="kpi-context">vs last quarter</span></div>
            </div>
            <div class="kpi-card animate-on-load" style="animation-delay: 0.1s;">
                <div class="kpi-header">
                    <span class="kpi-title">Subscription Revenue</span>
                    <div class="kpi-icon-wrapper">
                        <i class="ph ph-receipt"></i>
                    </div>
                </div>
                <div class="kpi-value">₹2,15,000</div>
                <div class="kpi-footer"><span class="kpi-trend positive">+₹15,000</span> <span class="kpi-context">this month</span></div>
            </div>

            <div class="kpi-card animate-on-load" style="animation-delay: 0.2s;">
                <div class="kpi-header">
                    <span class="kpi-title">Non-Recurring Rev</span>
                    <div class="kpi-icon-wrapper">
                        <i class="ph ph-package"></i>
                    </div>
                </div>
                <div class="kpi-value">₹85,000</div>
                <div class="kpi-footer"><span class="kpi-trend positive">+5%</span> <span class="kpi-context">YoY</span></div>
            </div>
        </div>

        <div class="section-container animate-on-load" style="animation-delay: 0.3s;">
            <div class="section-header">
                <h2 class="section-title">Revenue by Tier</h2>
            </div>
            <div class="chart-wrapper">
                <canvas id="revenueBarChart"></canvas>
            </div>
        </div>
    `;

    container.innerHTML = html;
    initializeRevenueLogic();
}

let barChartInstance = null;

function initializeRevenueLogic() {
    // Mobile Menu Re-bind
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (mobileBtn && sidebar) {
        const newBtn = mobileBtn.cloneNode(true);
        mobileBtn.parentNode.replaceChild(newBtn, mobileBtn);
        newBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    }

    // Standardize dates
    const dateElement = document.getElementById('revenue-date-subtitle');
    if (dateElement) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString('en-IN', options);
    }

    // Staggered Animations
    const animatedElements = document.querySelectorAll('.animate-on-load');
    animatedElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });

    // Export button toast
    const exportBtn = document.getElementById('revenue-export');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            window.showToast('Analyzing and exporting data...', 'info');
            setTimeout(() => window.showToast('Revenue report exported!', 'success'), 2000);
        });
    }

    setTimeout(initBarChart, 50);
}

function initBarChart() {
    const ctx = document.getElementById('revenueBarChart');
    if (!ctx) return;

    if (barChartInstance) barChartInstance.destroy();

    const tiers = ['Basic', 'Pro', 'Enterprise', 'Custom'];
    const dataPoints = [45000, 125000, 650000, 204500];

    Chart.defaults.font.family = "'Outfit', sans-serif";
    const isDark = document.body.classList.contains('dark-theme');
    Chart.defaults.color = isDark ? '#A1A1AA' : '#6B7280'; // text-secondary

    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: tiers,
            datasets: [{
                label: 'Revenue (₹)',
                data: dataPoints,
                backgroundColor: isDark ? '#FFFFFF' : '#1C1C1E', // Contrast bar color
                borderRadius: 4,
                barThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1500, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0A0A0B',
                    titleFont: { family: "'Outfit', sans-serif", size: 14, weight: '600' },
                    bodyFont: { family: "'Outfit', sans-serif", size: 14 },
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) { label += ': '; }
                            if (context.parsed.y !== null) {
                                return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: { grid: { display: false, drawBorder: false } },
                y: {
                    grid: { color: isDark ? '#27272A' : '#E5E7EB', drawBorder: false, borderDash: [] },
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
