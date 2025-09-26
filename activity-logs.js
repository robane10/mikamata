function generateMockLogs() {
    const users = [
        { name: 'Admin User', avatar: '../placeholder.svg?height=32&width=32&text=A' },
        { name: 'John Doe', avatar: '../placeholder.svg?height=32&width=32&text=J' },
        { name: 'System', avatar: null, isSystem: true }
    ];
    const actions = [
        { action: 'login', description: 'Successfully logged into admin panel', severity: 'info', icon: 'fa-sign-in-alt' },
        { action: 'update', description: 'Updated product "Woven Bamboo Lampshade"', severity: 'info', icon: 'fa-edit' },
        { action: 'create', description: 'Created new order #ORD-123', severity: 'info', icon: 'fa-plus' },
        { action: 'delete', description: 'Deleted user "testuser@example.com"', severity: 'warning', icon: 'fa-trash' },
        { action: 'error', description: 'Failed to process payment for order #ORD-122', severity: 'error', icon: 'fa-exclamation-triangle' }
    ];

    return Array.from({ length: 100 }, (_, i) => {
        const logAction = actions[i % actions.length];
        const user = users[i % users.length];
        return {
            id: `log-${Date.now() - i * 100000}`,
            user: user,
            action: logAction.action,
            description: logAction.description,
            severity: logAction.severity,
            icon: logAction.icon,
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            ip: `192.168.1.${100 + i}`,
            details: { entityId: i % 2 === 0 ? `PRD-${i}` : `ORD-${i}` }
        };
    });
}

class LogManager {
    constructor() {
        this.logs = [];
        this.filteredLogs = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.currentView = 'timeline'; // 'timeline' or 'table'
        this.init();
    }

    init() {
        this.loadLogs();
        this.setupEventListeners();
    }

    loadLogs() {
        try {
            const savedLogs = localStorage.getItem('mikamataActivityLogs');
            if (savedLogs && JSON.parse(savedLogs).length > 0) {
                this.logs = JSON.parse(savedLogs);
            } else {
                this.logs = generateMockLogs();
                this.saveLogsToStorage();
            }
        } catch (error) {
            console.error("Error loading logs from localStorage:", error);
            this.logs = generateMockLogs();
        }
        this.filterAndRender();
    }

    saveLogsToStorage() {
        localStorage.setItem('mikamataActivityLogs', JSON.stringify(this.logs));
    }

    renderLogs() {
        if (this.currentView === 'timeline') {
            this._renderTimelineView();
        } else {
            this._renderTableView();
        }
        this.renderPagination();
    }

    _renderTimelineView() {
        const container = document.getElementById('timeline-container');
        if (!container) return;

        const paginatedLogs = this.filteredLogs.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);

        if (paginatedLogs.length === 0) {
            container.innerHTML = `<p style="text-align: center; padding: 2rem;">No logs found.</p>`;
            return;
        }

        // Group logs by date
        const groupedLogs = paginatedLogs.reduce((acc, log) => {
            const date = new Date(log.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(log);
            return acc;
        }, {});

        container.innerHTML = Object.entries(groupedLogs).map(([date, logs]) => `
            <div class="timeline-date-group">
                <div class="timeline-date-header">
                    <h3>${date}</h3>
                    <span class="activity-count">${logs.length} activities</span>
                </div>
                ${logs.map(log => `
                    <div class="timeline-item">
                        <div class="timeline-marker ${log.severity}">
                            <i class="fas ${log.icon || 'fa-info-circle'}"></i>
                        </div>
                        <div class="timeline-content">
                            <div class="activity-header">
                                <div class="activity-user">
                                    ${log.user.isSystem ? `<i class="fas fa-server activity-system-icon"></i>` : `<img src="${log.user.avatar}" alt="User" class="user-avatar">`}
                                    <span class="user-name">${log.user.name}</span>
                                </div>
                                <div class="activity-time">${new Date(log.timestamp).toLocaleTimeString()}</div>
                            </div>
                            <div class="activity-description">
                                <strong>${log.action.charAt(0).toUpperCase() + log.action.slice(1)}</strong> - ${log.description}
                            </div>
                            <div class="activity-details">
                                <span class="activity-ip">IP: ${log.ip}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    _renderTableView() {
        const tableBody = document.getElementById('activity-table-body');
        if (!tableBody) return;
        // Similar logic to render table rows
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem;">Table view not implemented yet.</td></tr>`;
    }

    renderPagination() {
        const paginationWrapper = document.querySelector('.pagination-wrapper');
        const paginationInfo = paginationWrapper.querySelector('.pagination-info');
        const paginationControls = paginationWrapper.querySelector('.pagination');
        if (!paginationInfo || !paginationControls) return;

        const totalItems = this.filteredLogs.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startItem = totalItems > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems} activities`;

        if (totalPages <= 1) {
            paginationControls.innerHTML = '';
            return;
        }

        let paginationHTML = `<button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}"><i class="fas fa-chevron-left"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        paginationHTML += `<button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}"><i class="fas fa-chevron-right"></i></button>`;
        paginationControls.innerHTML = paginationHTML;

        paginationControls.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page) {
                    this.currentPage = parseInt(page);
                    this.renderLogs();
                }
            });
        });
    }

    setupEventListeners() {
        document.getElementById('activity-search')?.addEventListener('input', () => this.filterAndRender());
        document.getElementById('user-filter')?.addEventListener('change', () => this.filterAndRender());
        document.getElementById('action-filter')?.addEventListener('change', () => this.filterAndRender());
        document.getElementById('severity-filter')?.addEventListener('change', () => this.filterAndRender());

        document.getElementById('refresh-logs')?.addEventListener('click', () => this.loadLogs());

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentView = btn.dataset.view;
                document.getElementById('timeline-view').style.display = this.currentView === 'timeline' ? 'block' : 'none';
                document.getElementById('table-view').style.display = this.currentView === 'table' ? 'block' : 'none';
                this.renderLogs();
            });
        });
    }

    filterAndRender() {
        const searchTerm = document.getElementById('activity-search')?.value.toLowerCase() || '';
        const actionFilter = document.getElementById('action-filter')?.value || '';
        const severityFilter = document.getElementById('severity-filter')?.value || '';

        this.filteredLogs = this.logs.filter(log => {
            const matchesSearch = searchTerm === '' ||
                log.user.name.toLowerCase().includes(searchTerm) ||
                log.description.toLowerCase().includes(searchTerm);
            const matchesAction = actionFilter === '' || log.action === actionFilter;
            const matchesSeverity = severityFilter === '' || log.severity === severityFilter;

            return matchesSearch && matchesAction && matchesSeverity;
        });

        this.currentPage = 1;
        this.renderLogs();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const currentDateEl = document.getElementById('current-date');
    if (currentDateEl) {
        currentDateEl.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    window.logManager = new LogManager();
});