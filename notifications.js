function generateMockNotifications() {
    const users = ['Sarah Johnson', 'Mike Chen', 'David Lee', 'Emily White', 'Chris Green'];
    const products = ['Premium Wireless Headphones', 'Smart Fitness Watch', 'Classic Bamboo Cup', 'Woven Bamboo Lampshade'];
    const notificationTypes = [
        { type: 'order', icon: 'fa-shopping-cart', title: 'New Order Received', message: 'New order #ORD-XXX from ' },
        { type: 'user', icon: 'fa-user-plus', title: 'New User Registration', message: ' just registered an account.' },
        { type: 'product', icon: 'fa-box-open', title: 'Inventory Alert', message: 'Product is low on stock: ' },
        { type: 'review', icon: 'fa-star', title: 'New Review Submitted', message: 'A new 5-star review for ' },
        { type: 'system', icon: 'fa-cog', title: 'System Maintenance', message: 'Scheduled maintenance will begin in 1 hour.' }
    ];

    return Array.from({ length: 50 }, (_, i) => {
        const template = notificationTypes[i % notificationTypes.length];
        let message = template.message;
        let title = template.title;
        let recipient = 'All Admins';
        let link = '#';
        let targetId = null;

        if (template.type === 'order') {
            message += users[i % users.length];
            recipient = 'Sales Team';
            link = 'orders.html';
            targetId = `ORD-${i + 1}`;
        } else if (template.type === 'user') {
            message = users[i % users.length] + message;
            recipient = 'Admin';
            link = 'customers.html';
            targetId = 1025 + i;
        } else if (template.type === 'product' || template.type === 'review') {
            message += products[i % products.length];
            recipient = 'Inventory Manager';
            link = template.type === 'product' ? 'products.html' : 'reviews.html';
            targetId = i + 1;
        }

        return {
            id: `notif-${i + 1}`,
            type: template.type,
            icon: template.icon,
            title: title,
            message: message,
            recipient: recipient,
            date: new Date(Date.now() - i * 3 * 60 * 60 * 1000).toISOString(),
            status: ['sent', 'delivered', 'opened', 'failed'][i % 4],
            link: link,
            targetId: targetId
        };
    });
}

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.filteredNotifications = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.init();
    }

    init() {
        this.loadNotifications();
        this.setupEventListeners();
    }

    loadNotifications() {
        try {
            const savedNotifications = localStorage.getItem('mikamataNotifications');
            if (savedNotifications && JSON.parse(savedNotifications).length > 0) {
                this.notifications = JSON.parse(savedNotifications);
            } else {
                this.notifications = generateMockNotifications();
                this.saveNotificationsToStorage(); // Save mock data on first run
            }
        } catch (error) {
            console.error("Error loading notifications from localStorage:", error);
            this.notifications = generateMockNotifications();
        }
        this.filteredNotifications = [...this.notifications];
        this.renderNotifications();
        this.updateStats();
    }

    saveNotificationsToStorage() {
        localStorage.setItem('mikamataNotifications', JSON.stringify(this.notifications));
    }

    renderNotifications() {
        const listContainer = document.getElementById('notifications-list-container');
        if (!listContainer) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedNotifications = this.filteredNotifications.slice(startIndex, endIndex);

        if (paginatedNotifications.length === 0) {
            listContainer.innerHTML = `<p style="text-align: center; padding: 2rem;">No notifications found.</p>`;
            this.renderPagination();
            return;
        }

        listContainer.innerHTML = paginatedNotifications.map(notif => `
            <div class="notification-item">
                <div class="notification-icon ${notif.type}">
                    <i class="fas ${notif.icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <h4>${notif.title}</h4>
                        <span class="notification-status ${notif.status}">${notif.status}</span>
                    </div>
                    <p class="notification-message">${notif.message}</p>
                    <div class="notification-meta">
                        <span class="recipient">To: ${notif.recipient}</span>
                        <span class="timestamp">${new Date(notif.date).toLocaleString()}</span>
                    </div>
                </div>
                <div class="notification-actions">
                    <button class="btn btn-sm btn-outline" title="View Details" onclick="notificationManager.navigateTo('${notif.link}', '${notif.targetId}')"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-sm btn-outline" title="Delete" onclick="notificationManager.deleteNotification('${notif.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');

        this.renderPagination();
    }

    renderPagination() {
        const paginationInfo = document.querySelector('.pagination-info');
        const paginationControls = document.querySelector('.pagination');
        if (!paginationInfo || !paginationControls) return;

        const totalItems = this.filteredNotifications.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startItem = totalItems > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems} notifications`;

        if (totalPages <= 1) {
            paginationControls.innerHTML = '';
            return;
        }

        let paginationHTML = `<button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}"><i class="fas fa-chevron-left"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        paginationHTML += `<button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}"><i class="fas fa-chevron-right"></i></button>`;
        paginationControls.innerHTML = paginationHTML;

        paginationControls.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page) {
                    this.currentPage = parseInt(page);
                    this.renderNotifications();
                }
            });
        });
    }

    setupEventListeners() {
        document.getElementById('notification-search')?.addEventListener('input', () => this.filterAndRender());
        document.getElementById('status-filter')?.addEventListener('change', () => this.filterAndRender());
        document.getElementById('type-filter')?.addEventListener('change', () => this.filterAndRender());
    }

    filterAndRender() {
        const searchTerm = document.getElementById('notification-search')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('status-filter')?.value || '';
        const typeFilter = document.getElementById('type-filter')?.value || '';

        this.filteredNotifications = this.notifications.filter(notif => {
            const matchesSearch = searchTerm === '' ||
                notif.title.toLowerCase().includes(searchTerm) ||
                notif.message.toLowerCase().includes(searchTerm) ||
                notif.recipient.toLowerCase().includes(searchTerm);

            const matchesStatus = statusFilter === '' || notif.status === statusFilter;
            const matchesType = typeFilter === '' || notif.type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });

        this.currentPage = 1;
        this.renderNotifications();
    }

    navigateTo(link, targetId) {
        if (link && link !== '#') {
            window.location.href = `${link}?highlight=${targetId}`;
        }
    }
    
    deleteNotification(notificationId) {
        if (confirm('Are you sure you want to delete this notification?')) {
            this.notifications = this.notifications.filter(n => n.id !== notificationId);
            this.saveNotificationsToStorage();
            this.filterAndRender(); // This will re-render and update pagination
            this.updateStats();
        }
    }

    updateStats() {
        const stats = {
            sent: this.notifications.filter(n => ['sent', 'delivered', 'opened'].includes(n.status)).length,
            delivered: this.notifications.filter(n => ['delivered', 'opened'].includes(n.status)).length,
            opened: this.notifications.filter(n => n.status === 'opened').length,
            failed: this.notifications.filter(n => n.status === 'failed').length
        };

        // Update the stat cards in the HTML
        const sentEl = document.querySelector('.stat-icon.sent + .stat-info h3');
        const deliveredEl = document.querySelector('.stat-icon.delivered + .stat-info h3');
        const openedEl = document.querySelector('.stat-icon.opened + .stat-info h3');
        const failedEl = document.querySelector('.stat-icon.failed + .stat-info h3');

        if (sentEl) sentEl.textContent = stats.sent.toLocaleString();
        if (deliveredEl) deliveredEl.textContent = stats.delivered.toLocaleString();
        if (openedEl) openedEl.textContent = stats.opened.toLocaleString();
        if (failedEl) failedEl.textContent = stats.failed.toLocaleString();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Set current date
    const currentDateEl = document.getElementById('current-date');
    if (currentDateEl) {
        currentDateEl.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    window.notificationManager = new NotificationManager();
});