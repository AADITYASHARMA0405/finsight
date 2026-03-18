/* ==========================================================================
   Component: Command Palette & Global Search
   ========================================================================== */

export function initCommandPalette() {
    const palette = document.createElement('div');
    palette.className = 'command-palette';
    palette.id = 'command-palette';
    palette.innerHTML = `
        <div class="palette-backdrop" id="palette-backdrop"></div>
        <div class="palette-window">
            <div class="palette-header">
                <i class="ph ph-magnifying-glass"></i>
                <input type="text" id="palette-input" placeholder="Search for documents, metrics, or navigation..." autocomplete="off">
                <div class="palette-esc">ESC</div>
            </div>
            <div class="palette-results" id="palette-results">
                <div class="palette-section">
                    <div class="palette-label">Navigation</div>
                    <div class="palette-item" data-action="link" data-url="#/dashboard">
                        <i class="ph ph-squares-four"></i>
                        <span>Dashboard</span>
                        <div class="palette-key">G D</div>
                    </div>
                    <div class="palette-item" data-action="link" data-url="#/upload">
                        <i class="ph ph-cloud-arrow-up"></i>
                        <span>Upload Documents</span>
                        <div class="palette-key">G U</div>
                    </div>
                    <div class="palette-item" data-action="link" data-url="#/anomalies">
                        <i class="ph ph-warning-circle"></i>
                        <span>View Anomalies</span>
                        <div class="palette-key">G A</div>
                    </div>
                </div>
                <div class="palette-section">
                    <div class="palette-label">Actions</div>
                    <div class="palette-item" data-action="theme">
                        <i class="ph ph-moon"></i>
                        <span>Toggle Theme</span>
                        <div class="palette-key">T</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(palette);
    
    const input = document.getElementById('palette-input');
    const backdrop = document.getElementById('palette-backdrop');
    
    // Close functions
    const closePalette = () => {
        palette.classList.remove('active');
        input.value = '';
    };

    backdrop.onclick = closePalette;

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            palette.classList.toggle('active');
            if (palette.classList.contains('active')) input.focus();
        }
        
        if (e.key === 'Escape' && palette.classList.contains('active')) {
            closePalette();
        }
    });

    // Handle Item Clicks
    palette.addEventListener('click', (e) => {
        const item = e.target.closest('.palette-item');
        if (!item) return;

        const action = item.dataset.action;
        if (action === 'link') {
            window.location.hash = item.dataset.url;
            closePalette();
        } else if (action === 'theme') {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            window.dispatchEvent(new Event('themeChanged'));
            closePalette();
        }
    });

    // Simple Filtering
    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.palette-item');
        items.forEach(item => {
            const text = item.querySelector('span').textContent.toLowerCase();
            item.style.display = text.includes(query) ? 'flex' : 'none';
        });
    });

    return {
        open: () => {
            palette.classList.add('active');
            input.focus();
        }
    };
}
