document.addEventListener('DOMContentLoaded', function () {
    // --- GLOBAL & HELPER FUNCTIONS ---

    // Helper to set current date
    function setCurrentDate() {
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = today.toLocaleDateString('en-US', options);
        }
    }

    // --- LOGOUT LOGIC ---
    function initializeLogout() {
        const logoutBtn = document.getElementById('admin-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // In a real app, you would clear session/token here
                showToast('Logging out...', 'info');
                setTimeout(() => {
                    // window.location.href = '/admin/login.html'; // Redirect to login page
                    alert('Logged out!');
                }, 1500);
            });
        }
    }

    // --- TOAST NOTIFICATION ---
    window.showToast = function(message, type = 'success', options = {}) {
        const { duration = 3000, toastInstance = null } = options;

        return new Promise((resolve) => {
            const iconClass = {
                success: 'fa-check-circle',
                error: 'fa-times-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            }[type];
            
            let toast;

            if (toastInstance) {
                // Update existing toast
                toast = toastInstance;
                toast.className = `toast ${type} show`; // Update class and ensure it's shown
                toast.querySelector('.toast-icon').className = `fas ${iconClass} toast-icon`;
                toast.querySelector('.toast-message').textContent = message;
            } else {
                // Create new toast
                let container = document.querySelector('.toast-container');
                if (!container) {
                    container = document.createElement('div');
                    container.className = 'toast-container';
                    document.body.appendChild(container);
                }

                toast = document.createElement('div');
                toast.className = `toast ${type}`;
                toast.innerHTML = `
                    <i class="fas ${iconClass} toast-icon"></i>
                    <span class="toast-message">${message}</span>
                `;
                container.appendChild(toast);
                setTimeout(() => toast.classList.add('show'), 100); // Animate in
            }

            // Auto-dismiss logic
            if (duration > 0) {
                setTimeout(() => {
                    toast.classList.remove('show');
                    toast.addEventListener('transitionend', () => {
                        toast.remove();
                        resolve(null); // Resolve after it's gone
                    });
                }, duration);
            } else {
                // If duration is 0 or less, it won't auto-dismiss.
                // Resolve immediately and return the toast instance for manual control.
                resolve(toast);
            }

        });
    }

    // --- CONFIRMATION MODAL ---
    window.showConfirmation = function(message, confirmText = 'Confirm', cancelText = 'Cancel') {
        return new Promise((resolve) => {
            // Remove existing modal if any
            const existingModal = document.querySelector('.confirmation-modal-overlay');
            if (existingModal) existingModal.remove();

            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'confirmation-modal-overlay';

            modalOverlay.innerHTML = `
                <div class="confirmation-modal">
                    <h4>${message}</h4>
                    <div class="confirmation-modal-actions">
                        <button class="btn btn-secondary" id="confirm-cancel-btn">${cancelText}</button>
                        <button class="btn btn-danger" id="confirm-proceed-btn">${confirmText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modalOverlay);

            const confirmBtn = document.getElementById('confirm-proceed-btn');
            const cancelBtn = document.getElementById('confirm-cancel-btn');

            const closeModal = (result) => {
                modalOverlay.classList.remove('show');
                modalOverlay.addEventListener('transitionend', () => modalOverlay.remove());
                resolve(result);
            };

            confirmBtn.addEventListener('click', () => closeModal(true));
            cancelBtn.addEventListener('click', () => closeModal(false));
            modalOverlay.addEventListener('click', (e) => e.target === modalOverlay && closeModal(false));

            setTimeout(() => modalOverlay.classList.add('show'), 10);
        });
    }

    // --- INITIALIZATION ---
    setCurrentDate();
    initializeLogout();
});