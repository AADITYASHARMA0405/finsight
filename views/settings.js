/* ==========================================================================
   View: Settings
   ========================================================================== */

export function renderSettings(container) {
    const html = `
        <header class="header">
            <div class="header-left">
                <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle Menu">
                    <i class="ph ph-list"></i>
                </button>
                <div>
                    <h1 class="page-title">Settings</h1>
                    <p class="date-subtitle">Manage your account and preferences.</p>
                </div>
            </div>
            
            <div class="header-right">
                <div class="header-search-trigger" onclick="window.openSearch()">
                    <i class="ph ph-magnifying-glass"></i>
                    <span>Search or type command...</span>
                    <div class="search-hint">⌘K</div>
                </div>
                <button class="icon-btn theme-toggle-btn" id="header-theme-toggle" aria-label="Toggle Theme" style="margin-right: 12px;">
                    <i class="ph ph-moon"></i>
                </button>
                <button class="text-btn">Save Changes</button>
            </div>
        </header>

        <div class="settings-grid">
            <!-- Profile Section -->
            <div class="section-container animate-on-load">
                <div class="section-header">
                    <h2 class="section-title">Profile Information</h2>
                </div>
                
                <div class="settings-form">
                    <div class="form-group">
                        <div class="profile-avatar large">
                            <img id="profile-img-preview" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="User Profile">
                        </div>
                        <button class="text-btn small" id="change-photo-btn">Change Photo</button>
                    </div>

                    <div class="form-row">
                        <div class="form-group flex-1">
                            <label>First Name</label>
                            <input type="text" id="setting-fname" class="form-input" placeholder="First Name">
                        </div>
                        <div class="form-group flex-1">
                            <label>Last Name</label>
                            <input type="text" id="setting-lname" class="form-input" placeholder="Last Name">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="setting-email" class="form-input" placeholder="Email Address">
                    </div>
                </div>
            </div>

            <!-- Preferences Section -->
            <div class="section-container animate-on-load" style="animation-delay: 0.1s;">
                <div class="section-header">
                    <h2 class="section-title">Preferences</h2>
                </div>

                <div class="settings-list">
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-name">Dark Mode</span>
                            <span class="setting-desc">Toggle the professional dark theme.</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="theme-toggle">
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-name">Email Notifications</span>
                            <span class="setting-desc">Receive daily ARR summaries.</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="notif-toggle" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    initializeSettingsLogic();
}

function initializeSettingsLogic() {
    // 1. Mobile Menu Re-bind
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (mobileBtn && sidebar) {
        const newBtn = mobileBtn.cloneNode(true);
        mobileBtn.parentNode.replaceChild(newBtn, mobileBtn);
        newBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    }

    // 2. Ensure CSS
    ensureSettingsStyles();

    // 3. Staggered Animations
    const animatedElements = document.querySelectorAll('.animate-on-load');
    animatedElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });

    // 4. Load Saved Data
    const saveBtn = document.querySelector('.header-right .text-btn');
    const fNameInput = document.getElementById('setting-fname');
    const lNameInput = document.getElementById('setting-lname');
    const emailInput = document.getElementById('setting-email');
    const notifToggle = document.getElementById('notif-toggle');
    const photoBtn = document.getElementById('change-photo-btn');
    const profileImg = document.getElementById('profile-img-preview');

    // Extract logged in user data
    let defaultFirstName = 'User';
    let defaultLastName = '';
    let defaultEmail = '';
    
    try {
        const storedUser = JSON.parse(localStorage.getItem('finsight_user'));
        if (storedUser) {
            defaultEmail = storedUser.email || '';
            if (storedUser.name) {
                const nameParts = storedUser.name.split(' ');
                defaultFirstName = nameParts[0];
                defaultLastName = nameParts.slice(1).join(' ');
            }
        }
    } catch (e) {
        console.error("Could not parse user data");
    }

    if (fNameInput) fNameInput.value = localStorage.getItem('user_fname') || defaultFirstName;
    if (lNameInput) lNameInput.value = localStorage.getItem('user_lname') || defaultLastName;
    if (emailInput) emailInput.value = localStorage.getItem('user_email') || defaultEmail;
    if (notifToggle) notifToggle.checked = localStorage.getItem('user_notifs') !== 'false';
    if (profileImg) profileImg.src = localStorage.getItem('user_photo') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80';

    // 5. Save Logic
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveBtn.textContent = 'Saving...';
            setTimeout(() => {
                localStorage.setItem('user_fname', fNameInput.value);
                localStorage.setItem('user_lname', lNameInput.value);
                localStorage.setItem('user_email', emailInput.value);
                localStorage.setItem('user_notifs', notifToggle.checked);
                
                saveBtn.textContent = 'Save Changes';
                if (window.showToast) window.showToast('Settings saved successfully', 'success');
            }, 600);
        });
    }

    // 6. Change Photo Logic (Simulated)
    if (photoBtn) {
        photoBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        profileImg.src = e.target.result;
                        localStorage.setItem('user_photo', e.target.result);
                        if (window.showToast) window.showToast('Profile photo updated', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        });
    }

    // 7. Initialize Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const headerThemeBtn = document.getElementById('header-theme-toggle');

    const updateAllThemeUIs = () => {
        const isDark = document.body.classList.contains('dark-theme');
        if (themeToggle) themeToggle.checked = isDark;
        if (headerThemeBtn) {
            headerThemeBtn.querySelector('i').className = isDark ? 'ph ph-sun' : 'ph ph-moon';
        }
    };

    updateAllThemeUIs();

    const toggleTheme = () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateAllThemeUIs();
        window.dispatchEvent(new Event('themeChanged'));
    };

    if (themeToggle) themeToggle.addEventListener('change', toggleTheme);
    if (headerThemeBtn) headerThemeBtn.addEventListener('click', toggleTheme);
    window.addEventListener('themeChanged', updateAllThemeUIs);
}

function ensureSettingsStyles() {
    if (!document.getElementById('settings-view-styles')) {
        const style = document.createElement('style');
        style.id = 'settings-view-styles';
        style.textContent = `
            .settings-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 24px;
                max-width: 800px;
            }

            .settings-form {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            .form-row {
                display: flex;
                gap: 24px;
            }

            .flex-1 { flex: 1; }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .form-group label {
                font-size: 0.85rem;
                font-weight: 600;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .form-input {
                background-color: var(--bg-main);
                border: var(--border-light);
                border-radius: 8px;
                padding: 12px 16px;
                font-family: inherit;
                font-size: 1rem;
                color: var(--text-primary);
                transition: var(--transition-smooth);
            }

            .form-input:focus {
                outline: none;
                border-color: var(--text-primary);
                box-shadow: var(--shadow-sm);
            }

            .profile-avatar.large {
                width: 80px;
                height: 80px;
            }

            .text-btn.small {
                font-size: 0.85rem;
                padding: 4px 0;
                width: fit-content;
                color: var(--text-secondary);
            }

            /* Settings List & Toggles */
            .settings-list {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            .setting-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 24px;
                border-bottom: var(--border-light);
            }

            .setting-item:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }

            .setting-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .setting-name {
                font-weight: 600;
                font-size: 1rem;
            }

            .setting-desc {
                font-size: 0.85rem;
                color: var(--text-secondary);
            }

            /* Toggle Switch CSS (Minimal, no gradients) */
            .switch {
                position: relative;
                display: inline-block;
                width: 44px;
                height: 24px;
            }

            .switch input { 
                opacity: 0;
                width: 0;
                height: 0;
            }

            .slider {
                position: absolute;
                cursor: pointer;
                top: 0; left: 0; right: 0; bottom: 0;
                background-color: #E5E7EB;
                transition: .4s;
                border-radius: 24px;
            }

            .slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            input:checked + .slider {
                background-color: var(--accent-emerald);
            }

            input:checked + .slider:before {
                transform: translateX(20px);
            }

            /* Dark theme overrides for slider background */
            body.dark-theme .slider {
                background-color: #3F3F46;
            }
            body.dark-theme input:checked + .slider {
                background-color: var(--accent-emerald);
            }
        `;
        document.head.appendChild(style);
    }
}
