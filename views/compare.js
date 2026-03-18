/* ==========================================================================
   View: Document Comparison
   ========================================================================== */

import { api } from '../services/api.js';

export async function renderCompare(container) {
    const urlParams = new URLSearchParams(window.location.search);
    const ids = urlParams.get('ids')?.split(',') || [];

    const html = `
        <header class="header">
            <div class="header-left">
                <button class="icon-btn" onclick="window.history.back()" aria-label="Go Back">
                    <i class="ph ph-arrow-left"></i>
                </button>
                <div>
                    <h1 class="page-title">Compare Documents</h1>
                    <p class="date-subtitle">Side-by-side analysis of extracted metrics</p>
                </div>
            </div>
        </header>

        <div id="compare-container" class="animate-on-load">
            <div class="compare-loading">
                <div class="skeleton-text" style="width: 200px; height: 32px; margin-bottom: 24px;"></div>
                <div class="compare-grid">
                    <div class="skeleton-card" style="height: 400px;"></div>
                    <div class="skeleton-card" style="height: 400px;"></div>
                </div>
            </div>
        </div>

        <style>
            .compare-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 24px;
                margin-top: 24px;
            }
            .compare-card {
                background: var(--bg-surface);
                border: 1px solid var(--border-light);
                border-radius: 12px;
                padding: 32px;
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            .compare-card-header {
                border-bottom: 1px solid var(--border-light);
                padding-bottom: 20px;
            }
            .compare-filename {
                font-size: 1.25rem;
                font-weight: 700;
                margin-bottom: 4px;
            }
            .compare-type {
                font-size: 0.85rem;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .metric-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #f1f5f9;
            }
            .metric-label { font-size: 0.9rem; color: var(--text-secondary); }
            .metric-value { font-weight: 700; font-size: 1.1rem; }
            .diff-badge {
                font-size: 0.75rem;
                padding: 2px 8px;
                border-radius: 4px;
                font-weight: 700;
            }
            .diff-badge.up { background: rgba(16, 185, 129, 0.1); color: var(--status-positive); }
            .diff-badge.down { background: rgba(239, 68, 68, 0.1); color: var(--status-negative); }
            
            .skeleton-card { background: var(--bg-surface); border-radius: 12px; }
        </style>
    `;

    container.innerHTML = html;

    if (ids.length < 2) {
        document.getElementById('compare-container').innerHTML = `
            <div style="text-align: center; padding: 100px 0;">
                <i class="ph ph-warning-circle" style="font-size: 3rem; color: var(--text-secondary);"></i>
                <p style="margin-top: 16px;">Please select at least 2 documents to compare.</p>
                <button class="text-btn" style="margin-top: 24px;" onclick="window.history.back()">Back to Documents</button>
            </div>
        `;
        return;
    }

    // Fetch data for all selected docs
    const docsData = await Promise.all(ids.map(id => api.getDocumentDetails(id)));
    renderCompareResults(docsData);
}

function renderCompareResults(docs) {
    const container = document.getElementById('compare-container');
    
    const resultsHtml = `
        <div class="compare-grid">
            ${docs.map((doc, idx) => `
                <div class="compare-card">
                    <div class="compare-card-header">
                        <h2 class="compare-filename">${doc.name}</h2>
                        <span class="compare-type">ID: ${doc.id}</span>
                    </div>
                    <div class="compare-metrics">
                        ${doc.metrics.map((m, mIdx) => {
                            // Calculate diff logic if second doc
                            let diffHtml = '';
                            if (idx === 1 && docs[0].metrics[mIdx]) {
                                const val1 = parseFloat(docs[0].metrics[mIdx].value.replace(/[^0-9.]/g, ''));
                                const val2 = parseFloat(m.value.replace(/[^0-9.]/g, ''));
                                const diff = ((val2 - val1) / val1 * 100).toFixed(1);
                                const isPositive = diff >= 0;
                                diffHtml = `<span class="diff-badge ${isPositive ? 'up' : 'down'}">${isPositive ? '+' : ''}${diff}%</span>`;
                            }
                            return `
                                <div class="metric-row">
                                    <span class="metric-label">${m.label}</span>
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        ${diffHtml}
                                        <span class="metric-value">${m.value}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="compare-anomalies" style="margin-top: 12px;">
                        <h4 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px;">Anomalies Detected</h4>
                        ${doc.anomalies.length > 0 ? doc.anomalies.map(a => `
                            <div style="font-size: 0.85rem; color: var(--status-negative); margin-bottom: 8px; display: flex; gap: 8px;">
                                <i class="ph ph-warning-circle"></i> ${a}
                            </div>
                        `).join('') : '<p style="font-size: 0.85rem; color: var(--accent-emerald);">No anomalies found.</p>'}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = resultsHtml;
}
