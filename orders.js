class OrderManager {
    constructor() {
        this.orders = [];
        this.filteredOrders = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.init();
    }

    async init() {
        await this.loadOrders();
        this.setupEventListeners();
        this.updateStats();
        this.renderOrders();
    }

    async loadOrders() {
        try {
            // --- DATABASE INTEGRATION PLACEHOLDER ---
            // Replace this with a fetch call to your API endpoint to get orders.
            // const response = await fetch('/api/orders');
            // this.orders = await response.json();

            // For demonstration, we'll use mock data.
            this.orders = this.getMockOrders();
            this.filteredOrders = [...this.orders];

        } catch (error) {
            console.error("Error loading orders:", error);
            this.orders = [];
            this.filteredOrders = [];
        }
    }

    getMockOrders() {
        // In a real application, this data would be fetched from a server.
        // These mock orders use product and customer names that are consistent across the project files.
        return [
            {
                id: 'ORD-001',
                customer: { name: 'John Doe', email: 'john@example.com', phone: '+63 917 123 4567' },
                date: '2024-12-15T14:30:00',
                items: [
                    { name: 'Woven Bamboo Lampshade', sku: 'LMP-001', qty: 1, price: 1250.00, image: '../mik/products/product-1.jpg' },
                    { name: 'Classic Bamboo Cup', sku: 'CUP-002', qty: 2, price: 324.75, image: '../mik/products/product-2.jpg' },
                ],
                total: 1899.50,
                paymentMethod: 'gcash',
                status: 'processing',
                tracking: { number: 'TRK123456', carrier: 'J&T Express' },
                shippingAddress: '123 Main St, Quezon City, Metro Manila',
                history: [
                    { status: 'pending', date: '2024-12-15T14:30:00' },
                    { status: 'processing', date: '2024-12-15T14:35:00' },
                ]
            },
            {
                id: 'ORD-002',
                customer: { name: 'Jane Smith', email: 'jane@example.com', phone: '+63 918 765 4321' },
                date: '2024-12-14T11:45:00',
                items: [
                    { name: 'Serving Tray', sku: 'TRY-001', qty: 1, price: 550.00, image: '../mik/products/product-3.jpg' },
                ],
                total: 550.00,
                paymentMethod: 'cod',
                status: 'completed',
                tracking: { number: 'TRK654321', carrier: 'LBC' },
                shippingAddress: '456 Oak Ave, Pasig City, Metro Manila',
                history: [
                    { status: 'pending', date: '2024-12-14T11:45:00' },
                    { status: 'processing', date: '2024-12-14T11:50:00' },
                    { status: 'shipped', date: '2024-12-14T18:00:00' },
                    { status: 'completed', date: '2024-12-15T10:00:00' },
                ]
            },
            {
                id: 'ORD-003',
                customer: { name: 'Robert Brown', email: 'robert@example.com', phone: '+63 927 111 2222' },
                date: '2024-12-14T09:10:00',
                items: [
                    { name: 'Amber Glow Shade', sku: 'LMP-002', qty: 2, price: 1500.00, image: '../mik/products/product-4.jpg' },
                    { name: 'Utensil Holder', sku: 'UTH-001', qty: 1, price: 200.00, image: '../mik/products/product-5.jpg' },
                ],
                total: 3200.00,
                paymentMethod: 'paymaya',
                status: 'pending',
                tracking: null,
                shippingAddress: '789 Pine St, Mandaluyong City, Metro Manila',
                history: [
                    { status: 'pending', date: '2024-12-14T09:10:00' },
                ]
            },
            {
                id: 'ORD-004',
                customer: { name: 'Emily White', email: 'emily@example.com', phone: '+63 999 888 7777' },
                date: '2024-12-13T17:00:00',
                items: [
                    { name: 'Classic Bamboo Cup', sku: 'CUP-002', qty: 4, price: 324.75, image: '../mik/products/product-2.jpg' },
                ],
                total: 1299.00,
                paymentMethod: 'gcash',
                status: 'shipped',
                tracking: { number: 'TRK987654', carrier: 'Ninja Van' },
                shippingAddress: '101 Maple Dr, Taguig City, Metro Manila',
                history: [
                    { status: 'pending', date: '2024-12-13T17:00:00' },
                    { status: 'processing', date: '2024-12-13T17:10:00' },
                    { status: 'shipped', date: '2024-12-14T09:00:00' },
                ]
            },
            {
                id: 'ORD-005',
                customer: { name: 'Michael Green', email: 'michael@example.com', phone: '+63 905 555 4444' },
                date: '2024-12-12T08:20:00',
                items: [
                    { name: 'Bamboo Dome Shade', sku: 'LMP-003', qty: 1, price: 2500.00, image: '../mik/products/product-1.jpg' },
                ],
                total: 2500.00,
                paymentMethod: 'cod',
                status: 'cancelled',
                tracking: null,
                shippingAddress: '222 Elm St, Pasay City, Metro Manila',
                history: [
                    { status: 'pending', date: '2024-12-12T08:20:00' },
                    { status: 'cancelled', date: '2024-12-12T10:00:00' },
                ]
            }
        ];
    }

    // --- INITIALIZATION ---
    setupEventListeners() {
        // Filters
        document.getElementById('order-search').addEventListener('input', () => this.filterAndRender());
        document.getElementById('status-filter').addEventListener('change', () => this.filterAndRender());
        document.getElementById('payment-filter').addEventListener('change', () => this.filterAndRender());
        document.getElementById('refresh-orders').addEventListener('click', () => {
            this.filteredOrders = [...this.orders];
            document.getElementById('order-search').value = '';
            document.getElementById('status-filter').value = '';
            document.getElementById('payment-filter').value = '';
            this.renderOrders();
            showToast('Orders list has been refreshed.', 'success');
        });

        // Bulk Actions
        const selectAllCheckbox = document.getElementById('select-all-orders');
        selectAllCheckbox.addEventListener('change', () => {
            document.querySelectorAll('.order-checkbox').forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
            this.updateBulkActionsBar();
        });

        document.getElementById('orders-table-body').addEventListener('change', (e) => {
            if (e.target.classList.contains('order-checkbox')) {
                this.updateBulkActionsBar();
            }
        });

        document.getElementById('bulk-update-status-btn').addEventListener('click', () => this.handleBulkUpdate());
        document.getElementById('bulk-cancel-btn').addEventListener('click', () => this.handleBulkCancel());

        // Modals
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        });
    }

    updateStats() {
        const pendingCount = this.orders.filter(o => o.status === 'pending').length;
        const processingCount = this.orders.filter(o => o.status === 'processing').length;
        const shippedCount = this.orders.filter(o => o.status === 'shipped').length;
        const completedCount = this.orders.filter(o => o.status === 'completed').length;

        document.getElementById('pending-orders-count').textContent = pendingCount;
        document.getElementById('processing-orders-count').textContent = processingCount;
        document.getElementById('shipped-orders-count').textContent = shippedCount;
        document.getElementById('delivered-orders-count').textContent = completedCount;
    }

    // --- RENDER FUNCTIONS ---
    renderOrders() {
        const tableBody = document.getElementById('orders-table-body');
        if (!tableBody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedOrders = this.filteredOrders.slice(startIndex, endIndex);

        if (paginatedOrders.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem;">No orders found.</td></tr>`;
            this.renderPagination();
            return;
        }

        tableBody.innerHTML = paginatedOrders.map(order => {
            const orderDate = new Date(order.date);
            const totalItems = order.items.reduce((sum, item) => sum + item.qty, 0);

            return `
                <tr>
                    <td><input type="checkbox" class="order-checkbox" data-id="${order.id}"></td>
                    <td><span class="order-id">#${order.id}</span></td>
                    <td>
                        <div class="customer-info">
                            <div>
                                <div class="customer-name">${order.customer.name}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="order-date">
                            <div>${orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            <div class="order-time">${orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                    </td>
                    <td><span class="item-count">${totalItems} item${totalItems > 1 ? 's' : ''}</span></td>
                    <td><span class="order-total">₱${order.total.toFixed(2)}</span></td>
                    <td><span class="payment-method ${order.paymentMethod}">${order.paymentMethod}</span></td>
                    <td><span class="order-status ${order.status}">${order.status}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon view-btn" title="View Order" onclick="orderManager.viewOrderDetails('${order.id}')"><i class="fas fa-eye"></i></button>
                            <button class="btn-icon edit-btn" title="Edit Order" onclick="orderManager.editOrder('${order.id}')"><i class="fas fa-edit"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        this.renderPagination();
    }

    renderPagination() {
        const paginationWrapper = document.getElementById('pagination-wrapper');
        if (!paginationWrapper) return;

        const totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
        const paginationInfo = paginationWrapper.querySelector('.pagination-info');
        const pagination = paginationWrapper.querySelector('.pagination');

        paginationInfo.textContent = `Showing ${this.filteredOrders.length > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0}-${Math.min(this.currentPage * this.itemsPerPage, this.filteredOrders.length)} of ${this.filteredOrders.length} orders`;

        let paginationHTML = '';
        paginationHTML += `<button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}"><i class="fas fa-chevron-left"></i></button>`;

        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="page-btn active" data-page="${i}">${i}</button>`;
            } else {
                paginationHTML += `<button class="page-btn" data-page="${i}">${i}</button>`;
            }
        }

        paginationHTML += `<button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}"><i class="fas fa-chevron-right"></i></button>`;
        pagination.innerHTML = paginationHTML;

        pagination.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentPage = parseInt(e.currentTarget.dataset.page);
                this.renderOrders();
            });
        });
    }

    // --- MODAL AND ACTION FUNCTIONS ---
    viewOrderDetails(orderId) {
        const modal = document.getElementById('order-detail-modal');
        const order = this.orders.find(o => o.id === orderId);
        if (!modal || !order) return;

        // Populate modal
        document.getElementById('modal-order-id').textContent = order.id;
        document.getElementById('modal-customer-name').textContent = order.customer.name;
        document.getElementById('modal-customer-email').textContent = order.customer.email;
        document.getElementById('modal-customer-phone').textContent = order.customer.phone || 'N/A';
        document.getElementById('modal-shipping-address').textContent = order.shippingAddress;

        // Populate items
        const itemsList = document.getElementById('modal-order-items-list');
        const totalItems = order.items.reduce((sum, item) => sum + item.qty, 0);
        document.getElementById('modal-item-count').textContent = totalItems;
        itemsList.innerHTML = order.items.map(item => `
            <div class="order-item">
                <img src="../placeholder.svg?height=60&width=60" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">₱${item.price.toFixed(2)} x ${item.qty}</div>
                </div>
                <div class="item-total">₱${(item.price * item.qty).toFixed(2)}</div>
            </div>
        `).join('');

        // Populate totals
        const shippingCost = 150.00; // Mock shipping
        const grandTotal = order.total + shippingCost;
        const totalsSummary = document.getElementById('modal-totals-summary');
        totalsSummary.innerHTML = `
            <div class="detail-row"><strong>Subtotal:</strong> <span>₱${order.total.toFixed(2)}</span></div>
            <div class="detail-row"><strong>Shipping:</strong> <span>₱${shippingCost.toFixed(2)}</span></div>
            <div class="detail-row total"><strong>Grand Total:</strong> <span>₱${grandTotal.toFixed(2)}</span></div>
        `;

        modal.style.display = 'flex';
    }

    editOrder(orderId) {
        const modal = document.getElementById('order-edit-modal');
        const order = this.orders.find(o => o.id === orderId);
        if (!modal || !order) return;

        // Populate modal with basic info
        document.getElementById('edit-modal-order-id').textContent = order.id;
        document.getElementById('edit-modal-order-status').value = order.status;

        // Populate timeline
        const timeline = document.getElementById('edit-modal-timeline');
        const allStatuses = ['pending', 'processing', 'shipped', 'completed'];
        timeline.innerHTML = allStatuses.map(status => {
            const historyEntry = order.history.find(h => h.status === status);
            const isCompleted = !!historyEntry;
            const isActive = order.status === status;
            const iconMap = {
                pending: 'fa-clock',
                processing: 'fa-cog',
                shipped: 'fa-truck',
                completed: 'fa-check-circle'
            };
            const iconClass = `fas ${iconMap[status] || 'fa-question-circle'}`;

            return `
                <div class="timeline-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} status-${status}">
                    <div class="timeline-icon status-${status}"><i class="${iconClass}"></i></div>
                    <div class="timeline-content">
                        <div class="timeline-title">${status.charAt(0).toUpperCase() + status.slice(1)}</div>
                        <div class="timeline-date">${isCompleted ? new Date(historyEntry.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'long' }) : 'Pending'}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Set up update button
        const updateBtn = document.getElementById('edit-modal-update-status-btn');
        updateBtn.onclick = () => this.updateOrderStatus(orderId);

        modal.style.display = 'flex';
    }

    async updateOrderStatus(orderId) {
        const newStatus = document.getElementById('edit-modal-order-status').value;

        const updateData = {
            status: newStatus,
        };

        try {
            // --- DATABASE INTEGRATION PLACEHOLDER ---
            // const response = await fetch(`/api/orders/${orderId}`, {
            //     method: 'PATCH', // or PUT
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(updateData)
            // });
            // if (!response.ok) throw new Error('Failed to update order');

            // For demo: update local data
            const order = this.orders.find(o => o.id === orderId);
            if (order) {
                order.status = newStatus;
                if (!order.history.some(h => h.status === newStatus)) {
                    order.history.push({ status: newStatus, date: new Date().toISOString() });
                }
            }

            this.filterAndRender();
            this.closeOrderEditModal();
            this.updateStats();
            showToast(`Order ${orderId} status updated to ${newStatus}.`, 'success');
        } catch (error) {
            console.error('Failed to update order status:', error);
            showToast('Could not update order status.', 'error');
        }
    }

    closeOrderDetailModal() {
        const modal = document.getElementById('order-detail-modal');
        if (modal) modal.style.display = 'none';
    }

    closeOrderEditModal() {
        const modal = document.getElementById('order-edit-modal');
        if (modal) modal.style.display = 'none';
    }

    updateBulkActionsBar() {
        const bulkBar = document.getElementById('bulk-actions-bar');
        const countSpan = document.getElementById('bulk-selected-count');
        const selectedCount = document.querySelectorAll('.order-checkbox:checked').length;

        if (selectedCount > 0) {
            bulkBar.style.display = 'flex';
            countSpan.textContent = `${selectedCount} order${selectedCount > 1 ? 's' : ''} selected`;
        } else {
            bulkBar.style.display = 'none';
        }
    }

    async handleBulkUpdate() {
        const selectedIds = Array.from(document.querySelectorAll('.order-checkbox:checked')).map(cb => cb.dataset.id);
        if (selectedIds.length === 0) return showToast('Please select orders first.', 'warning');

        const newStatus = prompt('Enter new status (pending, processing, shipped, completed, cancelled):');
        if (newStatus && ['pending', 'processing', 'shipped', 'completed', 'cancelled'].includes(newStatus)) {
            // --- DATABASE INTEGRATION PLACEHOLDER ---
            // await fetch('/api/orders/bulk-update', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ ids: selectedIds, status: newStatus })
            // });
            this.filterAndRender();
            this.updateStats();
            showToast(`${selectedIds.length} orders updated to ${newStatus}.`, 'success');
        } else if (newStatus) {
            showToast('Invalid status entered.', 'error');
        }
    }

    async handleBulkCancel() {
        const selectedIds = Array.from(document.querySelectorAll('.order-checkbox:checked')).map(cb => cb.dataset.id);
        if (selectedIds.length === 0) return showToast('Please select orders first.', 'warning');

        const confirmed = await showConfirmation(`Are you sure you want to cancel ${selectedIds.length} selected orders?`, 'Cancel Orders');
        if (confirmed) {
            // --- DATABASE INTEGRATION PLACEHOLDER ---
            // await fetch('/api/orders/bulk-update', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ ids: selectedIds, status: 'cancelled' })
            // });
            this.filterAndRender();
            this.updateStats();
            showToast(`${selectedIds.length} orders have been cancelled.`, 'error');
        }
    }

    // --- FILTERING LOGIC ---
    filterAndRender() {
        const search = document.getElementById('order-search').value.toLowerCase();
        const status = document.getElementById('status-filter').value;
        const payment = document.getElementById('payment-filter').value;

        this.filteredOrders = this.orders.filter(order => {
            const matchesSearch = order.id.toLowerCase().includes(search) || order.customer.name.toLowerCase().includes(search);
            const matchesStatus = !status || order.status === status;
            const matchesPayment = !payment || order.paymentMethod === payment;
            return matchesSearch && matchesStatus && matchesPayment;
        });

        this.currentPage = 1;
        this.renderOrders();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    window.orderManager = new OrderManager();
});