/* ==========================================================================
   View: Anomalies Deep-Dive
   ========================================================================== */

export function renderAnomalies(container) {
    const html = `
        <header class="header">
            <div class="header-left">
                <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle Menu">
                    <i class="ph ph-list"></i>
                </button>
                <div>
                    <h1 class="page-title">Anomaly Detection</h1>
                    <p class="date-subtitle">Aggregated flags across all analyzed documents</p>
                </div>
            </div>
        </header>

        <div class="section-container animate-on-load">
            <div class="section-header">
                <h2 class="section-title">Critical Flags</h2>
            </div>
            <div class="anomaly-grid">
                <div class="anomaly-card high">
                    <div class="anomaly-badge">HIGH</div>
                    <h3>Unexpected Payment</h3>
                    <p>₹2,00,000 paid to 'Unknown Vendor' found in <strong>Operations_Expenses.csv</strong></p>
                    <span class="anomaly-date">Oct 12, 2024</span>
                </div>
                <div class="anomaly-card high">
                    <div class="anomaly-badge">HIGH</div>
                    <h3>Duplicate Invoice</h3>
                    <p>Double billing detected on Oct 11 in <strong>Operations_Expenses.csv</strong></p>
                    <span class="anomaly-date">Oct 12, 2024</span>
                </div>
                <div class="anomaly-card medium">
                    <div class="anomaly-badge">MEDIUM</div>
                    <h3>Duplicate Entry</h3>
                    <p>Potential duplicate vendor entry found in <strong>Vendor_Invoices_Oct.pdf</strong></p>
                    <span class="anomaly-date">Oct 24, 2024</span>
                </div>
            </div>
        </div>

        <style>
            .anomaly-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
            .anomaly-card { 
                background: var(--bg-surface); 
                border: 1px solid var(--border-light); 
                padding: 24px; 
                border-radius: 12px;
                position: relative;
                transition: var(--transition-smooth);
            }
            .anomaly-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
            .anomaly-badge { 
                display: inline-block; 
                padding: 4px 8px; 
                border-radius: 4px; 
                font-size: 0.7rem; 
                font-weight: 800; 
                margin-bottom: 12px;
            }
            .anomaly-card.high { border-left: 4px solid var(--status-negative); }
            .anomaly-card.high .anomaly-badge { background: rgba(239, 68, 68, 0.1); color: var(--status-negative); }
            .anomaly-card.medium { border-left: 4px solid var(--status-warning); }
            .anomaly-card.medium .anomaly-badge { background: rgba(245, 158, 11, 0.1); color: var(--status-warning); }
            .anomaly-card h3 { font-size: 1rem; margin-bottom: 8px; }
            .anomaly-card p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px; }
            .anomaly-date { font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; }
        </style>
    `;
    container.innerHTML = html;
}
