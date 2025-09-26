/**
 * Generates mock customer data.
 * In a real application, this would be replaced by an API call.
 * @returns {Array} An array of customer objects.
 */
function generateMockCustomers() {
    const firstNames = ['Maria', 'Juan', 'Anna', 'Jose', 'Lito', 'Elena', 'Carlos', 'Sofia', 'Miguel', 'Isabella'];
    const lastNames = ['Santos', 'Dela Cruz', 'Reyes', 'Garcia', 'Mendoza', 'Lim', 'Torres', 'Gonzales', 'Villanueva', 'Ramos'];
    const middleInitials = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

    return Array.from({ length: 2847 }, (_, i) => {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const middleInitial = middleInitials[Math.floor(Math.random() * middleInitials.length)];
        
        // Make some customers recent
        const today = new Date();
        let registrationDate;
        if (i % 10 === 0) { // Make every 10th customer recent
            const pastDays = Math.floor(Math.random() * today.getDate());
            registrationDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - pastDays);
        } else {
            registrationDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        }

        return {
            id: 1025 + i,
            firstName: firstName,
            lastName: lastName,
            middleInitial: middleInitial,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
            phone: `+63 917 ${String(Math.floor(1000000 + Math.random() * 9000000)).substring(0, 7)}`,
            totalSpent: Math.floor(Math.random() * 50000),
            registrationDate: registrationDate.toISOString(),
            lastLogin: new Date(new Date(2024, 0, 1).getTime() + Math.random() * (new Date().getTime() - new Date(2024, 0, 1).getTime())).toISOString(),
        };
    });
}

class CustomerManager {
    constructor() {
        this.customers = [];
        this.filteredCustomers = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.init();
    }

    async init() {
        await this.loadCustomers();
        this.setupEventListeners();
    }

    async loadCustomers() {
        try {
            // --- DATABASE INTEGRATION PLACEHOLDER ---
            // Replace this with a fetch call to your API endpoint to get customers.
            // Example: const response = await fetch('/api/customers');
            // this.customers = await response.json();

            const savedCustomers = localStorage.getItem('mikamataCustomers');
            this.customers = savedCustomers ? JSON.parse(savedCustomers) : generateMockCustomers();
            this.saveCustomers(); // Save mock data if it was just generated
        } catch (error) {
            console.error("Error loading customers:", error);
            this.customers = [];
        }

        this.updateStats();
        this.filteredCustomers = [...this.customers];
        this.renderCustomers();
    }

    updateStats() {
        const totalCustomers = this.customers.length;
        const newThisMonth = this.customers.filter(c => new Date(c.registrationDate).getMonth() === new Date().getMonth() && new Date(c.registrationDate).getFullYear() === new Date().getFullYear()).length;

        document.getElementById('total-customers-count').textContent = totalCustomers.toLocaleString();
        document.getElementById('new-customers-count').textContent = newThisMonth.toLocaleString();
    }

    async saveCustomers() {
        // --- DATABASE INTEGRATION PLACEHOLDER ---
        // This function will be removed. Saving is done via API calls in saveCustomerForm/deleteCustomer.
        localStorage.setItem('mikamataCustomers', JSON.stringify(this.customers));
    }

    renderCustomers() {
        const tableBody = document.getElementById('customers-table-body');
        if (!tableBody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedCustomers = this.filteredCustomers.slice(startIndex, endIndex);

        if (paginatedCustomers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem;">No customers found.</td></tr>`;
            this.renderPagination();
            return;
        }

        tableBody.innerHTML = paginatedCustomers.map(customer => `
            <tr>
                <td><input type="checkbox" class="customer-checkbox" data-id="${customer.id}"></td>
                <td><span class="customer-id-badge">#C${customer.id}</span></td>
                <td><div class="customer-name">${customer.firstName}</div></td>
                <td><div class="customer-name">${customer.lastName}</div></td>
                <td><div class="customer-email">${customer.email}</div></td>
                <td><div class="customer-phone">${customer.phone || 'N/A'}</div></td>
                <td>${new Date(customer.registrationDate).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-view" onclick="customerManager.viewCustomer(${customer.id})">View Details</button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.renderPagination();
    }

    renderPagination() {
        const paginationInfo = document.getElementById('pagination-info-top');
        const paginationControls = document.getElementById('pagination-controls-top');
        if (!paginationInfo || !paginationControls) return;

        const totalItems = this.filteredCustomers.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startItem = totalItems > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems} customers`;

        if (totalPages <= 1) {
            paginationControls.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        paginationHTML += `<button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}"><i class="fas fa-chevron-left"></i></button>`;

        // Pagination with ellipsis logic
        const maxPagesToShow = 5;
        let startPage, endPage;

        if (totalPages <= maxPagesToShow) {
            startPage = 1;
            endPage = totalPages;
        } else {
            const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
            const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;
            if (this.currentPage <= maxPagesBeforeCurrent) {
                startPage = 1;
                endPage = maxPagesToShow;
            } else if (this.currentPage + maxPagesAfterCurrent >= totalPages) {
                startPage = totalPages - maxPagesToShow + 1;
                endPage = totalPages;
            } else {
                startPage = this.currentPage - maxPagesBeforeCurrent;
                endPage = this.currentPage + maxPagesAfterCurrent;
            }
        }

        if (startPage > 1) {
            paginationHTML += `<button class="pagination-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="pagination-dots">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="pagination-dots">...</span>`;
            }
            paginationHTML += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
        }

        paginationHTML += `<button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}"><i class="fas fa-chevron-right"></i></button>`;
        paginationControls.innerHTML = paginationHTML;

        // Add event listeners to new buttons
        paginationControls.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page) {
                    this.currentPage = parseInt(page);
                    this.renderCustomers();
                }
            });
        });
    }

    filterAndRender() {
        const search = document.getElementById('customer-search')?.value.toLowerCase() || '';
        // Placeholder for date range filter logic
        // const dateRange = document.getElementById('date-range-picker')?.value;

        this.filteredCustomers = this.customers.filter(customer => {
            const fullName = `${customer.firstName} ${customer.middleInitial}. ${customer.lastName}`.toLowerCase();
            const matchesSearch = fullName.includes(search) || customer.email.toLowerCase().includes(search);
            // Add date filter logic here when date picker is implemented
            // const matchesDate = !dateRange || (new Date(customer.registrationDate) >= dateRange.start && new Date(customer.registrationDate) <= dateRange.end);
            return matchesSearch; // && matchesDate;
        });

        this.currentPage = 1;
        this.renderCustomers();
    }

    setupEventListeners() {
        document.getElementById('customer-search')?.addEventListener('input', () => this.filterAndRender());
        // Placeholder for date picker initialization
        // flatpickr("#date-range-picker", { mode: "range", onChange: () => this.filterAndRender() });

        document.getElementById('select-all')?.addEventListener('change', (e) => this.toggleAllCheckboxes(e.target.checked));
        document.getElementById('customers-table-body').addEventListener('change', (e) => {
            if (e.target.classList.contains('customer-checkbox')) {
                this.updateBulkActionsVisibility();
            }
        });

        // Modal
        document.querySelector('#customer-modal .modal-close')?.addEventListener('click', () => this.closeCustomerModal());

        // Modal Tabs
        document.querySelectorAll('.customer-profile-tabs .tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e));
        });

        // Bulk Actions
        document.getElementById('customer-form')?.addEventListener('submit', (e) => this.saveCustomerForm(e));
        document.getElementById('cancel-customer-btn')?.addEventListener('click', () => this.closeCustomerModal());


        document.getElementById('bulk-export')?.addEventListener('click', () => this.handleBulkAction('export'));
        document.getElementById('bulk-email')?.addEventListener('click', () => this.handleBulkAction('email'));
        document.getElementById('bulk-segment')?.addEventListener('click', () => this.handleBulkAction('tag'));
    }

    // --- MODAL METHODS ---
    openCustomerModal(customerId, isViewOnly = false) {
        const modal = document.getElementById('customer-modal');
        const form = document.getElementById('customer-form');
        const title = document.getElementById('modal-title');
        const formInputs = form.querySelectorAll('input:not([type=hidden]), select');
        const formActions = document.querySelector('.modal-form-actions');

        if (customerId) {
            const customer = this.customers.find(c => c.id === customerId);
            if (!customer) return;

            title.textContent = isViewOnly ? 'Customer Details' : 'Edit Customer';
            this.populateForm(customer);
        } else {
            title.textContent = 'Add New Customer';
            form.reset();
            document.getElementById('customer-id-input').value = '';
            document.getElementById('registration-date').textContent = 'N/A';
            document.getElementById('last-login-date').textContent = 'N/A';
        }

        const isEditable = !isViewOnly;
        formInputs.forEach(input => {
            isEditable ? input.removeAttribute('readonly') : input.setAttribute('readonly', true);
        });
        form.querySelectorAll('select').forEach(select => {
            isEditable ? select.removeAttribute('disabled') : select.setAttribute('disabled', true);
        });

        modal.style.display = 'flex';
    }

    populateForm(customer) {
        document.getElementById('customer-id-input').value = customer.id;
        document.getElementById('first-name').textContent = customer.firstName;
        document.getElementById('middle-initial').textContent = customer.middleInitial;
        document.getElementById('last-name').textContent = customer.lastName;
        document.getElementById('email').textContent = customer.email;
        document.getElementById('phone').textContent = customer.phone;

        const regDate = new Date(customer.registrationDate).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
        const loginDate = new Date(customer.lastLogin).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
        document.getElementById('registration-date').textContent = regDate;
        document.getElementById('last-login-date').textContent = loginDate;
    }

    closeCustomerModal() {
        document.getElementById('customer-modal').style.display = 'none';
    }

    viewCustomer(id) {
        // Open the modal in view-only mode
        this.openCustomerModal(id, true);
    }

    async deleteCustomer(customerId) {
        const confirmed = await showConfirmation('Are you sure you want to delete this customer?', 'Delete');
        if (confirmed) {
            try {
                // --- DATABASE INTEGRATION PLACEHOLDER ---
                // const response = await fetch(`/api/customers/${customerId}`, { method: 'DELETE' });
                // if (!response.ok) throw new Error('Server deletion failed');

                this.customers = this.customers.filter(c => c.id !== customerId);
                this.saveCustomers();
                this.filterAndRender();
                this.updateStats();
                showToast('Customer deleted successfully.', 'error');
            } catch (error) {
                console.error('Failed to delete customer:', error);
                showToast('Could not delete customer.', 'error');
            }
        }
    }

    async saveCustomerForm(event) {
        event.preventDefault();
        const form = event.target;
        const customerId = parseInt(form.querySelector('#customer-id-input').value);

        const customerData = {
            firstName: form.querySelector('#first-name').value,
            lastName: form.querySelector('#last-name').value,
            middleInitial: form.querySelector('#middle-initial').value,
            email: form.querySelector('#email').value,
            phone: form.querySelector('#phone').value,
        };

        try {
            // --- DATABASE INTEGRATION PLACEHOLDER ---
            let savedCustomer;
            if (customerId) { // Editing existing customer
                // const response = await fetch(`/api/customers/${customerId}`, {
                //     method: 'PUT',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(customerData)
                // });
                // savedCustomer = await response.json();
                const index = this.customers.findIndex(c => c.id === customerId);
                this.customers[index] = { ...this.customers[index], ...customerData };
            } else { // Adding new customer
                // const response = await fetch('/api/customers', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(customerData)
                // });
                // savedCustomer = await response.json();
            }
            this.saveCustomers();
            this.filterAndRender();
            showToast(customerId ? 'Customer updated successfully!' : 'Customer added successfully!', 'success');
            this.closeCustomerModal();
        } catch (error) {
            console.error('Failed to save customer:', error);
            showToast('Could not save customer details.', 'error');
        }
    }

    switchTab(event) {
        const tabButton = event.currentTarget;
        const tabId = tabButton.dataset.tab;

        // Deactivate all tabs and content
        document.querySelectorAll('.customer-profile-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Activate the clicked tab and corresponding content
        tabButton.classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    async renderCustomerOrders(customerId, customerName) {
        const ordersTbody = document.getElementById('customer-orders-tbody');
        if (!ordersTbody) return;

        let allOrders = [];
        try {
            // --- DATABASE INTEGRATION PLACEHOLDER ---
            // const response = await fetch(`/api/customers/${customerId}/orders`);
            // const customerOrders = await response.json();

            // Fallback to localStorage for demo
            const savedOrders = localStorage.getItem('mikamataOrders');
            allOrders = savedOrders ? JSON.parse(savedOrders) : [];
        } catch (e) {
            console.error("Could not load or parse orders from localStorage", e);
        }

        const customerOrders = allOrders.filter(order => order.customer.name === customerName);

        if (customerOrders.length === 0) {
            ordersTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 1rem;">No order history found for this customer.</td></tr>`;
            return;
        }

        ordersTbody.innerHTML = customerOrders.map(order => {
            const orderDate = new Date(order.date);
            return `
                <tr>
                    <td><span class="order-id">#${order.id}</span></td>
                    <td>${orderDate.toLocaleDateString()}</td>
                    <td>₱${order.total.toFixed(2)}</td>
                    <td>
                        <span class="order-status ${order.status}">${order.status}</span>
                    </td>
                </tr>
            `;
        }).join('');
    }


    // --- BULK ACTION METHODS ---
    toggleAllCheckboxes(checked) {
        document.querySelectorAll('.customer-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.updateBulkActionsVisibility();
    }

    updateBulkActionsVisibility() {
        const selectedCount = document.querySelectorAll('.customer-checkbox:checked').length;
        const bulkBar = document.getElementById('bulk-actions-bar');
        const countSpan = bulkBar.querySelector('.selected-count');

        if (selectedCount > 0) {
            countSpan.textContent = `${selectedCount} customer${selectedCount > 1 ? 's' : ''} selected`;
            bulkBar.style.display = 'flex';
        } else {
            bulkBar.style.display = 'none';
        }
    }

    handleBulkAction(action) {
        const selectedCheckboxes = document.querySelectorAll('.customer-checkbox:checked');
        if (selectedCheckboxes.length === 0) {
            showToast('Please select at least one customer.', 'warning');
            return;
        }

        const customerIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.id);
        showToast(`Action: '${action}' on ${customerIds.length} customers. (This is a placeholder).`, 'info');
    }
}

/**
 * This function ensures that the mock order data from orders.js is available in localStorage.
 * It should be called once when the orders page is loaded. We'll add it here for robustness
 * in case the user navigates directly to the customers page.
 */
function ensureMockOrdersExist() {
    if (!localStorage.getItem('mikamataOrders')) {
        // This is a simplified version of the mock data from orders.js
        const mockOrders = [
            { id: 'ORD-001', customer: { name: 'John Doe' }, date: '2024-12-15T14:30:00', total: 1899.50, status: 'processing', history: [] },
            { id: 'ORD-002', customer: { name: 'Jane Smith' }, date: '2024-12-14T11:45:00', total: 550.00, status: 'completed', history: [] },
            { id: 'ORD-003', customer: { name: 'Robert Brown' }, date: '2024-12-14T09:10:00', total: 3200.00, status: 'pending', history: [] },
            { id: 'ORD-004', customer: { name: 'Emily White' }, date: '2024-12-13T17:00:00', total: 1150.00, status: 'cancelled', history: [] },
            { id: 'ORD-005', customer: { name: 'John Doe' }, date: '2024-12-12T08:20:00', total: 2500.00, status: 'completed', history: [] },
        ];
        localStorage.setItem('mikamataOrders', JSON.stringify(mockOrders));
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // --- INITIALIZATION ---
    const currentDateEl = document.getElementById('current-date');
    if (currentDateEl) {
        currentDateEl.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    ensureMockOrdersExist(); // Make sure we have some order data to work with
    window.customerManager = new CustomerManager();
});