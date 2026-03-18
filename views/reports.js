/* ==========================================================================
   View: Professional Report Builder
   ========================================================================== */

import { api } from '../services/api.js';

export function renderReports(container) {
    const html = `
        <header class="header">
            <div class="header-left">
                <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle Menu">
                    <i class="ph ph-list"></i>
                </button>
                <div>
                    <h1 class="page-title">Report Builder</h1>
                    <p class="date-subtitle">Generate production-ready financial statements</p>
                </div>
            </div>
        </header>

        <div class="section-container animate-on-load">
            <div class="report-config-grid">
                <div class="config-card">
                    <h3>1. Select Report Type</h3>
                    <div class="report-type-options">
                        <div class="type-option active" data-type="pnl">
                            <i class="ph ph-chart-line-up"></i>
                            <span>Profit & Loss</span>
                        </div>
                        <div class="type-option" data-type="cashflow">
                            <i class="ph ph-hand-coins"></i>
                            <span>Cash Flow</span>
                        </div>
                        <div class="type-option" data-type="balancesheet">
                            <i class="ph ph-scales"></i>
                            <span>Balance Sheet</span>
                        </div>
                    </div>
                </div>

                <div class="config-card">
                    <h3>2. Date Range</h3>
                    <div class="date-range-grid">
                        <div class="input-group">
                            <label>From</label>
                            <input type="date" value="2024-01-01">
                        </div>
                        <div class="input-group">
                            <label>To</label>
                            <input type="date" value="2024-12-31">
                        </div>
                    </div>
                </div>

                <div class="config-card">
                    <h3>3. Formatting</h3>
                    <div class="format-options">
                        <label class="checkbox-container">
                            <input type="checkbox" checked>
                            <span>Include Visual Charts</span>
                        </label>
                        <label class="checkbox-container">
                            <input type="checkbox" checked>
                            <span>Show Year-over-Year Diff</span>
                        </label>
                        <label class="checkbox-container">
                            <input type="checkbox">
                            <span>Detailed Transaction Log</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="report-actions">
                <button class="text-btn primary" id="generate-report-btn">
                    <i class="ph ph-file-pdf"></i> Generate PDF Report
                </button>
                <button class="text-btn secondary" id="preview-report-btn">
                    <i class="ph ph-eye"></i> Preview Summary
                </button>
            </div>
        </div>

        <div id="report-preview-section" class="section-container animate-on-load" style="display: none; transition: all 0.4s ease;">
            <div class="section-header">
                <h2 class="section-title">Report Preview</h2>
            </div>
            <div id="preview-content" class="preview-content">
                <!-- Data populated by JS -->
            </div>
        </div>
    `;

    container.innerHTML = html;
    initializeReports();
}

function initializeReports() {
    ensureStyles();

    // Type selection
    const options = document.querySelectorAll('.type-option');
    options.forEach(opt => {
        opt.onclick = () => {
            options.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
        };
    });

    const generateBtn = document.getElementById('generate-report-btn');
    const previewBtn = document.getElementById('preview-report-btn');
    const previewSection = document.getElementById('report-preview-section');
    const previewContent = document.getElementById('preview-content');

    generateBtn.onclick = () => {
        window.showToast('Compiling financial data...', 'info');
        setTimeout(() => {
            window.showToast('Report generated successfully!', 'success');
        }, 2000);
    };

    previewBtn.onclick = async () => {
        window.showToast('Fetching preview data...', 'info');
        previewSection.style.display = 'block';
        previewContent.innerHTML = '<div class="skeleton-text" style="height: 200px; width: 100%;"></div>';
        
        // Mock data fetch
        setTimeout(() => {
            previewContent.innerHTML = `
                <div class="preview-summary-card">
                    <div class="summary-stat">
                        <span>Total Revenue</span>
                        <strong>₹1,24,50,000</strong>
                    </div>
                    <div class="summary-stat">
                        <span>Gross Profit</span>
                        <strong>₹82,30,000</strong>
                    </div>
                    <div class="summary-stat">
                        <span>Net Margin</span>
                        <strong class="positive">66.1%</strong>
                    </div>
                </div>
                <p style="margin-top: 16px; font-size: 0.9rem; color: var(--text-secondary);">
                    This is a summarized view of your 2024 performance. Download the full PDF for detailed breakdowns and charts.
                </p>
            `;
        }, 1200);
    };
}

function ensureStyles() {
    if (!document.getElementById('reports-styles')) {
        const style = document.createElement('style');
        style.id = 'reports-styles';
        style.textContent = `
            .report-config-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 24px;
                margin-bottom: 32px;
            }
            .config-card {
                background: var(--bg-surface);
                border: 1px solid var(--border-light);
                border-radius: 12px;
                padding: 24px;
            }
            .config-card h3 { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 20px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
            
            .report-type-options { display: flex; flex-direction: column; gap: 12px; }
            .type-option {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                border: 1px solid var(--border-light);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .type-option:hover { background: var(--bg-main); }
            .type-option.active { border-color: var(--accent-emerald); background: rgba(16, 185, 129, 0.05); }
            .type-option i { font-size: 1.25rem; }
            .type-option.active i { color: var(--accent-emerald); }

            .date-range-grid { display: grid; gap: 16px; }
            .input-group label { display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 6px; }
            .input-group input { 
                width: 100%; 
                padding: 10px; 
                border: 1px solid var(--border-light); 
                border-radius: 6px; 
                background: var(--bg-main);
                color: var(--text-primary);
                font-family: inherit;
            }

            .format-options { display: flex; flex-direction: column; gap: 12px; }
            .checkbox-container { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.9rem; }
            
            .report-actions { display: flex; gap: 16px; border-top: 1px solid var(--border-light); padding-top: 32px; }
            .text-btn.primary { background: var(--bg-sidebar); color: var(--text-inverse); }
            .text-btn.secondary { border: 1px solid var(--border-light); }

            .preview-summary-card {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 24px;
                background: var(--bg-main);
                padding: 24px;
                border-radius: 12px;
            }
            .summary-stat { display: flex; flex-direction: column; gap: 4px; }
            .summary-stat span { font-size: 0.8rem; color: var(--text-secondary); }
            .summary-stat strong { font-size: 1.25rem; font-weight: 700; }
        `;
        document.head.appendChild(style);
    }
}
