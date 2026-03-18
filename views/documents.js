/* ==========================================================================
   View: Document Intelligence
   ========================================================================== */

import { api } from '../services/api.js';

export function renderDocuments(container) {
    const html = `
        <header class="header">
            <div class="header-left">
                <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle Menu">
                    <i class="ph ph-list"></i>
                </button>
                <div>
                    <h1 class="page-title">Document Intelligence</h1>
                    <p class="date-subtitle">AI-powered financial document analysis and extraction</p>
                </div>
            </div>
            
            <div class="header-right">
                <div class="search-bar">
                    <i class="ph ph-magnifying-glass"></i>
                    <input type="text" id="document-search" placeholder="Search filename or status...">
                </div>
                <button class="icon-btn theme-toggle-btn" id="header-theme-toggle" aria-label="Toggle Theme" style="margin-left: 12px;">
                    <i class="ph ph-moon"></i>
                </button>
                <button class="icon-btn" id="export-docs-btn" aria-label="Export Document List" style="margin-left: 12px;">

                    <i class="ph ph-download-simple"></i>
                </button>
            </div>
        </header>

        <div class="section-container animate-on-load">
            <div id="upload-zone" class="upload-zone">
                <div class="upload-icon">
                    <i class="ph ph-cloud-arrow-up"></i>
                </div>
                <h3>Upload Documents</h3>
                <p>Drag and drop financial PDFs or CSVs here to start AI analysis</p>
                <button class="text-btn" id="select-files-btn" style="margin-top: 16px; background: var(--bg-sidebar); color: var(--text-inverse);">Select Files</button>
                <input type="file" id="file-input" multiple style="opacity: 0; position: absolute; pointer-events: none; width: 0; height: 0;">
            </div>

            <div id="upload-queue" class="upload-queue" style="display: none;">
                <!-- Simulated uploads go here -->
            </div>
        </div>

        <div class="section-container animate-on-load" style="animation-delay: 0.1s;">
            <div class="section-header">
                <h2 class="section-title">All Documents</h2>
                <div class="chart-controls">
                    <button class="filter-btn active" data-filter="All">All</button>
                    <button class="filter-btn" data-filter="Analyzed">Analyzed</button>
                    <button class="filter-btn" data-filter="Anomalies Found">Anomalies</button>
                    <button class="filter-btn" data-filter="Scanning">Processing</button>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="data-table" id="documents-table">
                    <thead>
                        <tr>
                            <th style="width: 40px;"><input type="checkbox" id="select-all-docs"></th>
                            <th>File Name</th>
                            <th>Type</th>
                            <th>Date</th>
                            <th>AI Status</th>
                            <th>Anomalies</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="documents-body">
                        <!-- Skeletons -->
                        <tr><td colspan="7"><div class="skeleton-text" style="width: 100%; height: 24px;"></div></td></tr>
                        <tr><td colspan="7"><div class="skeleton-text" style="width: 100%; height: 24px;"></div></td></tr>
                        <tr><td colspan="7"><div class="skeleton-text" style="width: 100%; height: 24px;"></div></td></tr>
                    </tbody>
                </table>
            </div>
            
            <div id="compare-fab" class="floating-fab" style="display: none;">
                <span id="selection-count">0 selected</span>
                <button class="primary-btn" id="compare-btn-action">
                    <i class="ph ph-copy"></i> Compare Documents
                </button>
            </div>
        </div>

        <!-- Document Details Panel (Slide-over) -->
        <div id="document-panel" class="document-panel">
            <div class="panel-header">
                <h2 id="panel-title">Document Analysis</h2>
                <button id="close-panel" class="icon-btn" style="border: none;"><i class="ph ph-x"></i></button>
            </div>
            <div id="panel-content" class="panel-content">
                <!-- Populated by JS -->
            </div>
            <div class="panel-footer">
                <div class="ai-chat-input">
                    <input type="text" id="ai-query" placeholder="Ask AI about this document...">
                    <button id="send-btn"><i class="ph ph-paper-plane-right"></i></button>
                </div>
            </div>
        </div>
        <div id="panel-backdrop" class="panel-backdrop"></div>
    `;

    container.innerHTML = html;
    initializeDocumentsLogic();
}

async function initializeDocumentsLogic() {
    console.log('[FinSight] Initializing Documents View...');
    
    // 1. Mobile Menu Re-bind
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (mobileBtn && sidebar) {
        const newBtn = mobileBtn.cloneNode(true);
        mobileBtn.parentNode.replaceChild(newBtn, mobileBtn);
        newBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    }

    // 2. Ensure Styles
    ensureDocumentStyles();

    // 3. Staggered Entrance
    const animatedElements = document.querySelectorAll('.animate-on-load');
    animatedElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });

    try {
        // 5. Setup Interactions (CRITICAL: Do this early so button is always live)
        setupUploadInteractions();

        // 4. Load Data
        console.log('[FinSight] Fetching documents from API...');
        const fullDocs = await api.getDocuments();
        console.log('[FinSight] Received documents:', fullDocs);
        
        renderDocumentTable(fullDocs);

        setupSearchAndFilters(fullDocs);

        const exportBtn = document.getElementById('export-docs-btn');
        if (exportBtn && fullDocs) {
            exportBtn.onclick = () => {
                window.exportToCSV('FinSight_Documents.csv', fullDocs);
            };
        }
    } catch (error) {
        console.error('[FinSight] Error loading documents:', error);
        const tbody = document.getElementById('documents-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--status-negative); padding: 40px;">Failed to load documents. Please refresh.</td></tr>';
        }
    }
}

function renderDocumentTable(docs) {
    const tbody = document.getElementById('documents-body');
    if (!tbody) return;

    let html = '';
    docs.forEach(doc => {
        let statusClass = 'success';
        if (doc.status === 'Scanning') statusClass = 'pending';
        if (doc.status === 'Anomalies Found') statusClass = 'negative';

        // Severity Badge Logic
        let severityClass = 'clean';
        if (doc.severity === 'High') severityClass = 'high';
        if (doc.severity === 'Medium') severityClass = 'medium';

        // Icon Logic
        const iconColor = doc.type === 'PDF' ? '#EF4444' : '#10B981';
        const iconClass = doc.type === 'PDF' ? 'ph-file-pdf' : 'ph-file-csv';

        html += `
            <tr class="document-row h-tooltip-trigger" data-id="${doc.id}">
                <td><input type="checkbox" class="doc-checkbox" data-id="${doc.id}"></td>
                <td>
                    <div class="customer-cell">
                        <div class="file-icon-wrapper" style="background-color: ${iconColor}15; color: ${iconColor};">
                            <i class="ph ${iconClass}"></i>
                        </div>
                        <span class="customer-name">${doc.name}</span>
                        <div class="row-tooltip">${doc.summary}</div>
                    </div>
                </td>
                <td style="color: var(--text-secondary);">${doc.type}</td>
                <td style="color: var(--text-secondary); font-size: 0.9rem;">${doc.date}</td>
                <td>
                    <div class="status-indicator">
                        <span class="status-dot ${statusClass}"></span>
                        <span>${doc.status}</span>
                    </div>
                </td>
                <td>
                    <span class="severity-badge ${severityClass}">
                        ${doc.severity === 'Clean' ? 'Clean' : `${doc.anomalies} ${doc.severity}`}
                    </span>
                </td>
                <td>
                    <button class="action-btn view-doc" data-id="${doc.id}"><i class="ph ph-eye"></i></button>
                    <button class="action-btn"><i class="ph ph-dots-three-vertical"></i></button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;

    // Selection Logic
    const checkboxes = document.querySelectorAll('.doc-checkbox');
    const fab = document.getElementById('compare-fab');
    const countSpan = document.getElementById('selection-count');
    const compareBtn = document.getElementById('compare-btn-action');

    const updateSelection = () => {
        const selectedIds = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.getAttribute('data-id'));
        
        const count = selectedIds.length;
        countSpan.textContent = `${count} selected`;
        
        if (count >= 2) {
            fab.style.display = 'flex';
        } else {
            fab.style.display = 'none';
        }
    };

    checkboxes.forEach(cb => cb.onchange = updateSelection);

    // Select All Logic
    const selectAllCheck = document.getElementById('select-all-docs');
    if (selectAllCheck) {
        selectAllCheck.onchange = () => {
            checkboxes.forEach(cb => {
                cb.checked = selectAllCheck.checked;
            });
            updateSelection();
        };
    }

    if (compareBtn) {
        compareBtn.onclick = () => {
            const selectedIds = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.getAttribute('data-id'));
            
            window.location.hash = `#/compare?ids=${selectedIds.join(',')}`;
        };
    }
    // Add click events to rows
    const viewBtns = document.querySelectorAll('.view-doc');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => openDocumentPanel(btn.dataset.id));
    });
}

function setupUploadInteractions() {
    const zone = document.getElementById('upload-zone');
    const input = document.getElementById('file-input');
    const queue = document.getElementById('upload-queue');
    const selectBtn = document.getElementById('select-files-btn');
    
    if (!zone || !input) return;
    
    console.log('[FinSight] Setup Upload:', { zone: !!zone, input: !!input, button: !!selectBtn });

    if (selectBtn) selectBtn.onclick = (e) => {
        console.log('[FinSight] Select button clicked');
        e.stopPropagation();
        input.click();
    };
    
    zone.addEventListener('click', (e) => {
        if (e.target !== selectBtn) input.click();
    });

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.style.borderColor = 'var(--accent-emerald)';
        zone.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
    });

    zone.addEventListener('dragleave', () => {
        zone.style.borderColor = '';
        zone.style.backgroundColor = '';
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.style.borderColor = '';
        zone.style.backgroundColor = '';
        handleFiles(e.dataTransfer.files);
    });

    input.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    async function handleFiles(files) {
        if (files.length === 0) return;
        queue.style.display = 'block';
        
        for (const file of Array.from(files)) {
            const item = document.createElement('div');
            item.className = 'upload-item';
            item.innerHTML = `
                <div class="upload-item-info">
                    <span class="upload-filename">${file.name}</span>
                    <span class="upload-status">Uploading...</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
            `;
            queue.appendChild(item);

            const fill = item.querySelector('.progress-fill');
            const status = item.querySelector('.upload-status');

            try {
                // Phase 1: Upload
                fill.style.width = '30%';
                const result = await api.uploadDocument(file);
                
                fill.style.width = '50%';
                status.textContent = '🔍 AI Analyzing...';
                status.style.color = 'var(--status-warning)';
                
                // Phase 2: Poll for analysis completion
                const docId = result.id;
                let attempts = 0;
                const maxAttempts = 30; // 60 seconds max wait
                
                const pollStatus = async () => {
                    attempts++;
                    const docStatus = await api.getDocumentStatus(docId);
                    
                    if (docStatus && docStatus.status === 'Analyzed') {
                        // Analysis complete!
                        fill.style.width = '100%';
                        status.textContent = `✅ Analyzed: ${docStatus.threatLevel}`;
                        status.style.color = 'var(--accent-emerald)';
                        window.showToast(`${file.name} analyzed: ${docStatus.threatLevel}`, 'success');
                        
                        // Refresh the documents table
                        const updatedDocs = await api.getDocuments();
                        renderDocumentTable(updatedDocs);
                        setupSearchAndFilters(updatedDocs);
                        return;
                    }
                    
                    if (attempts >= maxAttempts) {
                        fill.style.width = '100%';
                        status.textContent = '⏳ Still Processing...';
                        window.showToast(`${file.name} is still being analyzed`, 'info');
                        
                        const updatedDocs = await api.getDocuments();
                        renderDocumentTable(updatedDocs);
                        setupSearchAndFilters(updatedDocs);
                        return;
                    }
                    
                    // Still scanning - update progress bar and try again
                    const progress = 50 + Math.min(45, attempts * 3);
                    fill.style.width = `${progress}%`;
                    setTimeout(pollStatus, 2000);
                };

                // Start polling after a brief delay (give the AI time to start)
                setTimeout(pollStatus, 2000);

            } catch (err) {
                console.error("Upload failed for", file.name, err);
                status.textContent = '❌ Failed';
                status.style.color = 'var(--accent-red)';
                fill.style.backgroundColor = 'var(--accent-red)';
                window.showToast(`Failed to upload ${file.name}`, 'warning');
            }
        }
    }
}

async function openDocumentPanel(id) {
    const panel = document.getElementById('document-panel');
    const backdrop = document.getElementById('panel-backdrop');
    const content = document.getElementById('panel-content');

    panel.classList.add('show');
    backdrop.classList.add('show');
    content.innerHTML = '<div class="skeleton-text" style="width: 100%; height: 200px; margin-top: 24px;"></div>';

    const details = await api.getDocumentDetails(id);
    
    let metricsHtml = '';
    details.metrics.forEach(m => {
        metricsHtml += `
            <div class="detail-metric">
                <span class="metric-label">${m.label}</span>
                <span class="metric-value">${m.value}</span>
                <span class="metric-change positive">${m.change}</span>
            </div>
        `;
    });

    let anomaliesHtml = '';
    if (details.anomalies.length > 0) {
        anomaliesHtml = `
            <div class="anomaly-section">
                <h4><i class="ph ph-warning-circle"></i> AI Flagged Anomalies</h4>
                <ul class="anomaly-list">
                    ${details.anomalies.map(a => `<li>${a}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    content.innerHTML = `
        <div class="panel-section">
            <h3>Extracted Metrics</h3>
            <div class="metrics-grid">
                ${metricsHtml}
            </div>
        </div>
        ${anomaliesHtml}
        <div class="panel-section">
            <h3>AI conversation</h3>
            <div id="ai-chat-history" class="chat-history">
                <div class="chat-bubble ai">Hello! I've analyzed <strong>${details.name}</strong>. What would you like to know?</div>
            </div>
        </div>
    `;

    // Setup chat
    const queryInput = document.getElementById('ai-query');
    const sendBtn = document.getElementById('send-btn');
    const history = document.getElementById('ai-chat-history');

    const sendMessage = async () => {
        const text = queryInput.value.trim();
        if (!text) return;

        // User message
        const userBubble = document.createElement('div');
        userBubble.className = 'chat-bubble user';
        userBubble.textContent = text;
        history.appendChild(userBubble);
        queryInput.value = '';
        history.scrollTop = history.scrollHeight;

        // AI response
        const aiBubble = document.createElement('div');
        aiBubble.className = 'chat-bubble ai';
        aiBubble.innerHTML = '<i class="ph ph-dots-three-outline animate-pulse"></i> Analyzing...';
        history.appendChild(aiBubble);
        
        const response = await api.askAI(text, details.id);
        aiBubble.textContent = response;
        history.scrollTop = history.scrollHeight;
    };

    if (sendBtn) sendBtn.onclick = sendMessage;
    if (queryInput) queryInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
}

function setupSearchAndFilters(fullDocs) {
    const searchInput = document.getElementById('document-search');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let activeFilter = 'All';

    function applyFilters() {
        if (!searchInput) return;
        const query = searchInput.value.toLowerCase();
        const filtered = fullDocs.filter(doc => {
            const matchesSearch = doc.name.toLowerCase().includes(query) || doc.status.toLowerCase().includes(query);
            const matchesFilter = activeFilter === 'All' || doc.status === activeFilter;
            return matchesSearch && matchesFilter;
        });
        renderDocumentTable(filtered);
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

    // Close panel
    const closeBtn = document.getElementById('close-panel');
    const backdrop = document.getElementById('panel-backdrop');
    const panel = document.getElementById('document-panel');

    const hidePanel = () => {
        if (panel) panel.classList.remove('show');
        if (backdrop) backdrop.classList.remove('show');
    };

    if (closeBtn) closeBtn.onclick = hidePanel;
    if (backdrop) backdrop.onclick = hidePanel;
}

function ensureDocumentStyles() {
    if (!document.getElementById('document-view-styles')) {
        const style = document.createElement('style');
        style.id = 'document-view-styles';
        style.textContent = `
            .upload-zone {
                background-color: var(--bg-main);
                border-radius: 12px;
                padding: 48px;
                text-align: center;
                cursor: pointer;
                transition: var(--transition-smooth);
                margin-bottom: 24px;
            }
            .upload-zone:hover {
                background-color: rgba(79, 70, 229, 0.05); /* Indigo tint */
                border-color: var(--accent-indigo);
            }
            .upload-icon {
                font-size: 3rem;
                color: var(--text-secondary);
                margin-bottom: 16px;
            }
            .upload-queue {
                margin-top: 24px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .upload-item {
                background: var(--bg-main);
                padding: 12px 16px;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .upload-item-info {
                display: flex;
                justify-content: space-between;
                font-size: 0.9rem;
            }
            .upload-filename { font-weight: 600; }
            .upload-status { color: var(--text-secondary); }
            
            .progress-bar {
                height: 4px;
                background: var(--border-light);
                border-radius: 2px;
                overflow: hidden;
            }
            .progress-fill {
                height: 100%;
                background: var(--accent-indigo);
                transition: width 0.3s ease;
            }

            /* Severity Badges */
            .severity-badge {
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .severity-badge.clean { background: rgba(16, 185, 129, 0.1); color: var(--accent-emerald); }
            .severity-badge.medium { background: rgba(245, 158, 11, 0.1); color: var(--status-warning); }
            .severity-badge.high { background: rgba(239, 68, 68, 0.1); color: var(--status-negative); }

            .file-icon-wrapper {
                width: 32px;
                height: 32px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
            }

            /* Tooltip Styles */
            .h-tooltip-trigger { position: relative; }
            .row-tooltip {
                position: absolute;
                left: 20px;
                bottom: calc(100% + 10px);
                background: var(--bg-sidebar);
                color: var(--text-inverse);
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 0.85rem;
                width: 280px;
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 50;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255,255,255,0.1);
            }
            .h-tooltip-trigger:hover .row-tooltip {
                opacity: 1;
                visibility: visible;
                transform: translateY(-5px);
            }
            .row-tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 20px;
                border-width: 6px;
                border-style: solid;
                border-color: var(--bg-sidebar) transparent transparent transparent;
            }

            /* Floating Comparison FAB */
            .floating-fab {
                position: fixed;
                bottom: 32px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--bg-sidebar);
                color: var(--text-inverse);
                padding: 12px 24px;
                border-radius: 100px;
                display: flex;
                align-items: center;
                gap: 20px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
                z-index: 1000;
                border: 1px solid rgba(255, 255, 255, 0.1);
                animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }

            @keyframes slideUp {
                from { transform: translate(-50%, 100px); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }

            #selection-count {
                font-size: 0.9rem;
                font-weight: 600;
                color: var(--text-inverse-muted);
            }

            .primary-btn {
                background-color: var(--accent-emerald);
                color: var(--bg-sidebar);
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 700;
                font-size: 0.85rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: var(--transition-smooth);
            }

            .primary-btn:hover {
                background-color: #34D399;
                transform: translateY(-1px);
            }

            /* Document Panel */
            .document-panel {
                position: fixed;
                top: 0;
                right: -450px;
                width: 450px;
                height: 100vh;
                background: var(--bg-surface);
                box-shadow: -10px 0 30px rgba(0,0,0,0.1);
                z-index: 1000;
                display: flex;
                flex-direction: column;
                transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .document-panel.show { right: 0; }
            
            .panel-header {
                padding: 24px;
                border-bottom: var(--border-light);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .panel-content {
                flex: 1;
                overflow-y: auto;
                padding: 24px;
            }
            .panel-footer {
                padding: 24px;
                border-top: var(--border-light);
            }

            .panel-section { margin-bottom: 32px; }
            .panel-section h3 { font-size: 1.1rem; margin-bottom: 16px; }

            .metrics-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            .detail-metric {
                background: var(--bg-main);
                padding: 16px;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .metric-label { font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; }
            .metric-value { font-size: 1.25rem; font-weight: 700; }
            .metric-change { font-size: 0.8rem; font-weight: 600; }

            .anomaly-section {
                background: #FEF2F2;
                border: 1px solid #FEE2E2;
                padding: 16px;
                border-radius: 12px;
                margin-bottom: 32px;
            }
            .anomaly-section h4 { color: #991B1B; display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
            .anomaly-list { list-style: disc; margin-left: 20px; color: #991B1B; font-size: 0.9rem; }
            .anomaly-list li { margin-bottom: 4px; }

            /* Chat */
            .chat-history {
                height: 200px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding-right: 8px;
            }
            .chat-bubble {
                max-width: 85%;
                padding: 10px 14px;
                border-radius: 12px;
                font-size: 0.9rem;
                line-height: 1.4;
            }
            .chat-bubble.ai { background: var(--bg-main); color: var(--text-primary); align-self: flex-start; border-bottom-left-radius: 2px; }
            .chat-bubble.user { background: var(--bg-sidebar); color: var(--text-inverse); align-self: flex-end; border-bottom-right-radius: 2px; }

            .ai-chat-input {
                display: flex;
                gap: 8px;
            }
            .ai-chat-input input {
                flex: 1;
                border: var(--border-light);
                border-radius: 8px;
                padding: 10px 16px;
                font-family: inherit;
                outline: none;
            }
            .ai-chat-input button {
                background: var(--bg-sidebar);
                color: var(--text-inverse);
                border: none;
                border-radius: 8px;
                width: 44px;
                cursor: pointer;
            }

            .panel-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0,0,0,0.3);
                z-index: 999;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }
            .panel-backdrop.show { opacity: 1; pointer-events: auto; }
        `;
        document.head.appendChild(style);
    }
}
