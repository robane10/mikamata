// Products Management JavaScript Functions for Admin Panel
class ProductManager {
  constructor() {
    this.products = []
    this.filteredProducts = []
    this.sortKey = 'id';
    this.sortDirection = 'asc';
    this.init()
  }

  _createLog(action, description, severity = 'info') {
      try {
          // TODO: Implement database logging via an API call.
          // For now, this will just log to the console.
          console.log(`[LOG] Action: ${action}, Description: ${description}, Severity: ${severity}`);
      } catch (error) {
          console.error("Failed to create activity log:", error);
      }
  }

  _createNotification(title, message, type = 'product') {
      try {
          // TODO: Implement database notifications via an API call.
          // For now, this function does nothing.
          /* const newNotification = {
              id: `notif-${Date.now()}`,
              type: type,
              icon: 'fa-cube',
              title: title,
              message: message,
              recipient: 'Admin',
              date: new Date().toISOString(),
              status: 'sent',
              link: 'products.html', // Link back to the products page
              targetId: null // Could be the new product ID
          };
          */
      } catch (error) {
          console.error("Failed to create notification:", error);
      }
  }

  init() {
    this.loadProducts()
    this.setupEventListeners()
    this.initializeFilters()
    this.updateSortIcons();
  }

  // Load products data
  async loadProducts() {
    try {
      // --- DATABASE INTEGRATION ---
      // Fetch products from the PHP API endpoint
      const response = await fetch('../api/get_products.php');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.products = await response.json();

    } catch (error) {
      console.error("Error loading products from API:", error);
      showToast('Failed to load products from the server.', 'error');
      this.products = [];
    }

    this.filteredProducts = [...this.products];
    this.renderProducts();
    this.updateProductStats();
  }

  // Setup event listeners
  setupEventListeners() {
    // Search functionality
    const searchInput = document.querySelector("#product-search")
    if (searchInput) {
      searchInput.addEventListener("input", e => {
        this.filterAndRender()
      })
    }

    // Add product button
    const addBtn = document.getElementById("add-product-btn");
    if (addBtn) { 
      addBtn.addEventListener("click", () => {
        this.openProductModal()
      })
    }

    // Filter dropdowns
    const categoryFilter = document.querySelector("#category-filter");
    if (categoryFilter) {
      categoryFilter.addEventListener("change", () => this.filterAndRender());
    }

    // Price range filter
    const minPriceInput = document.getElementById("min-price");
    if (minPriceInput) minPriceInput.addEventListener("input", () => this.filterAndRender());
    const maxPriceInput = document.getElementById("max-price");
    if (maxPriceInput) maxPriceInput.addEventListener("input", () => this.filterAndRender());

    // Sorting listeners
    document.querySelectorAll(".products-table th.sortable").forEach(header => {
      header.addEventListener("click", () => {
        const key = header.dataset.sort;
        if (this.sortKey === key) {
          this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortKey = key;
          this.sortDirection = 'asc';
        }
        this.filterAndRender();
      });
    });
    // Close modal button
    const closeBtn = document.querySelector("#product-modal .modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeProductModal());
    }
    const cancelBtn = document.getElementById("cancel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.closeProductModal());
    }

    // Close modal on outside click
    window.addEventListener("click", (event) => {
      if (event.target === document.getElementById("product-modal")) this.closeProductModal();
    });

    // Save product form
    const productForm = document.getElementById("product-form");
    if (productForm) {
      productForm.addEventListener("submit", (e) => this.saveProduct(e));
    }

    // Image Upload listeners
    this.setupImageUploadListeners();

    const bulkDeleteBtn = document.getElementById("bulk-delete");
    if (bulkDeleteBtn) bulkDeleteBtn.addEventListener("click", () => this.performBulkAction('delete'));

    // Select All Checkbox
    const selectAllCheckbox = document.getElementById("select-all");
    if (selectAllCheckbox) selectAllCheckbox.addEventListener("change", (e) => this.toggleBulkSelect(e.target.checked));

    // --- Event Delegation for Action Buttons ---
    // Instead of using onclick attributes in the HTML, we add a single event listener
    // to the table body. This is more efficient and avoids scope issues.
    const tableBody = document.getElementById("products-table-body");
    if (tableBody) {
      tableBody.addEventListener('click', (event) => {
        const target = event.target;
        const editButton = target.closest('.edit-btn');
        const deleteButton = target.closest('.delete-btn');

        if (editButton) {
          const productId = parseInt(editButton.dataset.id);
          if (productId) {
            this.editProduct(productId);
          }
        }

        if (deleteButton) {
          const productId = parseInt(deleteButton.dataset.id);
          if (productId) {
            this.deleteProduct(productId);
          }
        }
      });

      // Add a 'change' event listener for checkboxes using delegation
      tableBody.addEventListener('change', (event) => {
        if (event.target.matches('.product-checkbox')) {
          this.updateBulkActionsVisibility();
        }
      });
    }
  }

  // Filter and render products based on all active filters
  filterAndRender() {
    const searchQuery = document.getElementById("product-search")?.value.toLowerCase() || "";
    const categoryFilter = document.getElementById("category-filter")?.value || "";
    const minPrice = parseFloat(document.getElementById("min-price")?.value) || 0;
    const maxPrice = parseFloat(document.getElementById("max-price")?.value) || Infinity;

    this.filteredProducts = this.products.filter(
      (product) => {
        // Search query check
        const matchesSearch = product.name.toLowerCase().includes(searchQuery) ||
                              (product.description && product.description.toLowerCase().includes(searchQuery));

        // Category filter check
        const matchesCategory = !categoryFilter || product.category === categoryFilter;

        // Price filter check
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

        return matchesSearch && matchesCategory && matchesPrice;
      }
    );

    // Sorting logic
    this.filteredProducts.sort((a, b) => {
      let valA = a[this.sortKey];
      let valB = b[this.sortKey];

      // Handle different data types
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.renderProducts();
    this.updateSortIcons();
  }

  // Toggle bulk select all checkboxes
  toggleBulkSelect(isChecked) {
    document.querySelectorAll(".product-checkbox").forEach(checkbox => {
      checkbox.checked = isChecked;
    });
    this.updateBulkActionsVisibility();
  }

  // Update sort icons in table header
  updateSortIcons() {
    document.querySelectorAll(".products-table th.sortable").forEach(header => {
      const icon = header.querySelector("i");
      if (icon) {
        if (header.dataset.sort === this.sortKey) {
          icon.className = this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        } else {
          icon.className = 'fas fa-sort';
        }
      }
    });
  }

  // Render products
  renderProducts() {
    this.renderTableView()
  }

  // Render table view
  renderTableView() {
    const tableBody = document.getElementById("products-table-body");
    if (!tableBody) return;
    /* The table header is now static in products.html, so we only render the body */
    tableBody.innerHTML = this.filteredProducts
                          .map(
                            (product) => `
                            <tr>
                                <td><input type="checkbox" class="product-checkbox" data-id="${product.id}"></td>
                                <td>#${product.id}</td>
                                <td class="product-info-cell">
                                    <img src="${
                                      product.image || '/mik/products/placeholder.png'
                                    }" alt="${product.name}" class="product-thumbnail">
                                    <span>${product.name}</span>
                                </td>
                                <td><span class="category-badge ${product.category}">${product.category}</span></td>
                                <td>₱${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td><span class="stock-badge ${product.stock > 10 ? 'normal' : (product.stock > 0 ? 'low' : 'out')}">${product.stock}</span></td>
                                <td>${product.dateAdded || 'N/A'}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn-icon edit-btn" data-id="${product.id}" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon delete-btn" data-id="${product.id}" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `,
                          )
                          .join("");

  }

  // Open product modal
  openProductModal(productId = null, productData = null) {
    const modal = document.querySelector("#product-modal")
    const modalTitle = document.getElementById("modal-title");
    if (modal) {
      // If productData is provided (for editing), populate the form. Otherwise, clear it for a new product.
      productData ? this.populateProductForm(productData) : this.clearProductForm();

      if (modalTitle) modalTitle.textContent = productId ? "Edit Product" : "Add New Product";
      modal.style.display = "flex"
    }
  }

  // Close product modal
  closeProductModal() {
    const modal = document.querySelector("#product-modal");
    if (modal) {
      modal.style.display = "none";
      this.clearProductForm(); // Clear form on close
    }
  }

  // Clear product form
  clearProductForm() {
    const form = document.getElementById("product-form");
    if (form) form.reset();
    document.getElementById("product-id").value = ""; // Clear hidden ID

    // Clear all 5 image preview areas
    document.querySelectorAll('.image-preview-container-single').forEach(container => {
      container.innerHTML = '';
      container.previousElementSibling.style.display = 'flex'; // Show placeholder
    });
  }

  // Populate product form for editing
  populateProductForm(product) {
    this.clearProductForm(); // Start with a clean form
    document.getElementById("product-id").value = product.id;
    document.getElementById("product-name").value = product.name;
    document.getElementById("product-description").value = product.description;
    document.getElementById("base-price").value = product.price;
    document.getElementById("category-id").value = product.category;
    document.getElementById("stock-quantity").value = product.stock;

    // Populate each image box if the corresponding image path exists
    const imageTypes = ['image', 'image_default', 'image_natural', 'image_dark', 'image_premium'];
    imageTypes.forEach(type => {
      if (product[type]) {
        const uploadBox = document.querySelector(`.image-upload-box[data-image-type="${type}"]`);
        if (uploadBox) {
          this.createImagePreview(uploadBox.querySelector('.image-upload-area-single'), product[type], product[type], false);
        }
      }
    });
    }
  }

  // Edit product
  async editProduct(id) {
    try {
      const response = await fetch(`../api/get_product.php?id=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product details.');
      }
      const product = await response.json();
      if (product) {
        this.openProductModal(id, product);
      } else {
        showToast(`Product with ID ${id} not found.`, 'error');
      }
    } catch (error) {
      console.error("Error fetching product for edit:", error);
      showToast(error.message, 'error');
    }
  }

  // Save product (add or update)
  async saveProduct(event) {
    event.preventDefault();
    const form = event.target;
    const productId = form.querySelector("#product-id").value;
    const isNewProduct = !productId;
    const savingToast = await showToast('Processing...', 'info', { duration: 0 });

    // --- Step 1: Upload Images and Get Paths ---
    await showToast('Uploading images...', 'info', { toastInstance: savingToast });
    const uploadedImagePaths = await this.uploadImages();
    if (uploadedImagePaths === null) { // Check for null which indicates an upload error
        showToast('Image upload failed. Please check the files and try again.', 'error', { toastInstance: savingToast });
        return;
    }

    // Use FormData to easily collect all form fields
    const formData = new FormData();
    formData.append('name', form.querySelector('[name="name"]').value);
    formData.append('description', form.querySelector('[name="description"]').value);
    formData.append('price', form.querySelector('[name="base_price"]').value);
    formData.append('category', form.querySelector('[name="category_id"]').value);
    formData.append('stock', form.querySelector('[name="stock_quantity"]').value);

    // --- Step 2: Assign image paths from the upload results ---
    // The order is: Main, Default, Natural, Dark, Premium
    const [
        mainImg = '',
        defaultImg = '',
        naturalImg = '',
        darkImg = '',
        premiumImg = ''
    ] = uploadedImagePaths;

    formData.append('image', mainImg);
    formData.append('image_default', defaultImg);
    formData.append('image_natural', naturalImg);
    formData.append('image_dark', darkImg);
    formData.append('image_premium', premiumImg);

    try {
      await showToast('Saving product details...', 'info', { toastInstance: savingToast });

      let url, successMessage;
      if (isNewProduct) {
        url = '../api/add_product.php';
        successMessage = 'Product added successfully!';
      } else {
        url = '../api/update_product.php';
        successMessage = 'Product updated successfully!';
        formData.append('id', productId);
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to save product.');
      }

      showToast(successMessage, 'success', { toastInstance: savingToast });
      this._createLog(isNewProduct ? 'create' : 'update', `${isNewProduct ? 'Created' : 'Updated'} product: "${formData.get('name')}"`);
      this.closeProductModal();
      this.loadProducts(); // Reload products from DB
    } catch (error) {
      console.error('Failed to save product:', error);
      showToast('Failed to save product. See console for details.', 'error', { toastInstance: savingToast });
    }
  }

  // Delete product
  async deleteProduct(id) {
    const confirmed = await showConfirmation('Are you sure you want to delete this product?', 'Delete');
    if (confirmed) {
      const deletingToast = await showToast('Deleting product...', 'info', { duration: 0 });
      try {
        const formData = new FormData();
        formData.append('id', id);

        const response = await fetch('../api/delete_product.php', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Failed to delete product on the server.');
        }

        showToast('Product deleted successfully.', 'success', { toastInstance: deletingToast });
        this._createLog('delete', `Deleted product with ID: ${id}`, 'warning');
        this._createNotification('Product Deleted', `Product ID: ${id} has been successfully deleted.`, 'product');
        this.loadProducts(); // Reload products from DB
      } catch (error) {
        console.error("Error deleting product:", error);
        showToast('Failed to delete product.', 'error', { toastInstance: deletingToast });
      }
    }
  }

  // Update product statistics
  updateProductStats() {
    const totalProductsEl = document.getElementById('total-products');
    if (totalProductsEl) totalProductsEl.textContent = this.products.length;

    const lowStockCountEl = document.getElementById('low-stock-count');
    if (lowStockCountEl) lowStockCountEl.textContent = this.products.filter(p => p.stock > 0 && p.stock < 10).length;

    const totalCategoriesEl = document.getElementById('total-categories');
    if (totalCategoriesEl) totalCategoriesEl.textContent = [...new Set(this.products.map(p => p.category))].length;

    const avgPriceEl = document.getElementById('avg-price');
    if (avgPriceEl) {
      const avgPrice = this.products.length > 0 ? this.products.reduce((acc, p) => acc + p.price, 0) / this.products.length : 0;
      avgPriceEl.textContent = `₱${avgPrice.toFixed(2)}`;
    }
  }

  // Initialize filters
  initializeFilters() {
    const categories = [...new Set(this.products.map((p) => p.category))]
    const categoryFilter = document.querySelector("#category-filter")

    if (categoryFilter) {
      // Preserve current value
      const currentValue = categoryFilter.value;
      categoryFilter.innerHTML = '<option value="">All Categories</option>' + categories.map(cat => {
        const catLabel = cat.charAt(0).toUpperCase() + cat.slice(1);
        return `<option value="${cat}">${catLabel}</option>`;
      }).join('');
      categoryFilter.value = currentValue;
    }
  }

  // Update visibility of bulk actions
  updateBulkActionsVisibility() {
    const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
    const bulkActionsContainer = document.getElementById('bulk-actions');
    const selectedCountSpan = document.querySelector('.selected-count');

    if (bulkActionsContainer && selectedCountSpan) {
      if (checkedBoxes.length > 0) {
        bulkActionsContainer.style.display = 'flex';
        selectedCountSpan.textContent = `${checkedBoxes.length} items selected`;
      } else {
        bulkActionsContainer.style.display = 'none';
      }
    }
  }

  // Perform bulk actions
  async performBulkAction(action) {
    const selectedIds = Array.from(document.querySelectorAll('.product-checkbox:checked')).map(cb => parseInt(cb.dataset.id));

    if (selectedIds.length === 0) {
      showToast("Please select at least one product.", 'warning');
      return;
    }

    let actionPromise;
    if (action === 'delete') {
      const confirmed = await showConfirmation(`Are you sure you want to delete ${selectedIds.length} products?`, 'Delete');
      if (!confirmed) return; // Abort if user cancels

      const deletingToast = await showToast(`Deleting ${selectedIds.length} products...`, 'info', { duration: 0 });

      // Create an array of fetch promises
      const deletePromises = selectedIds.map(id => {
        const formData = new FormData();
        formData.append('id', id);
        return fetch('../api/delete_product.php', {
          method: 'POST',
          body: formData
        }).then(res => res.json());
      });

      try {
        // Wait for all delete operations to complete
        const results = await Promise.all(deletePromises);
        const successfulDeletes = results.filter(r => r.success).length;
        
        showToast(`${successfulDeletes} of ${selectedIds.length} products deleted successfully.`, 'success', { toastInstance: deletingToast });
        this._createLog('delete', `Bulk deleted ${successfulDeletes} products.`, 'warning');
        this.loadProducts(); // Reload all products from the database
      } catch (error) {
        console.error("Bulk delete error:", error);
        showToast('An error occurred during bulk deletion.', 'error', { toastInstance: deletingToast });
      }
    }
  }

  // --- Image Upload Functionality ---
  setupImageUploadListeners() {
    document.querySelectorAll('.image-upload-area-single').forEach(uploadArea => {
      const fileInput = uploadArea.querySelector('input[type="file"]');
      if (!fileInput) return;

      // Prevent default drag behaviors
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, e => {
          e.preventDefault();
          e.stopPropagation();
        }, false);
      });

      // Highlight drop area
      ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.add('highlight'), false);
      });
      ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('highlight'), false);
      });

      // Handle dropped files
      uploadArea.addEventListener('drop', e => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
          this.handleFile(uploadArea.parentElement, files[0]);
        }
      }, false);

      // Handle file selection from click
      fileInput.addEventListener('change', e => {
        if (e.target.files.length > 0) {
          this.handleFile(uploadArea.parentElement, e.target.files[0]);
        }
      });
    });
  }

  // Helper function to create an image preview item
  createImagePreview(uploadBox, srcOrFile, name, isNewFile = true) {
    const previewContainer = uploadBox.querySelector('.image-preview-container-single');
    const placeholder = uploadBox.querySelector('.upload-placeholder-single');
    
    previewContainer.innerHTML = ''; // Clear previous preview in this box
    if (placeholder) placeholder.style.display = 'none';

    const src = isNewFile ? URL.createObjectURL(srcOrFile) : srcOrFile;

    const previewItem = document.createElement('div');
    previewItem.classList.add('image-preview-item');
    if (isNewFile) {
      previewItem.fileObject = srcOrFile;
    }
    previewItem.innerHTML = `
      <img src="${src}" alt="${name}">
      <button type="button" class="image-preview-remove">&times;</button>
    `;
    previewContainer.appendChild(previewItem);

    previewItem.querySelector('.image-preview-remove').addEventListener('click', () => {
      previewItem.remove();
      if (placeholder) placeholder.style.display = 'flex';
      if (isNewFile) {
        URL.revokeObjectURL(src); // Clean up object URL
      }
    });
  }

  handleFile(uploadBox, file) {
    if (!file.type.startsWith('image/')) { return }
    this.createImagePreview(uploadBox, file, file.name, true);
  }

  async uploadImages() {
    const uploadBoxes = document.querySelectorAll('.image-upload-box');
    const uploadPromises = [];

    for (const box of uploadBoxes) {
      const previewItem = box.querySelector('.image-preview-item');
      if (!previewItem) {
        uploadPromises.push(Promise.resolve('')); // No image, resolve with empty string
      } else if (previewItem.fileObject) { // It's a new file
        const formData = new FormData();
        formData.append('image', previewItem.fileObject);
        const promise = fetch('../api/upload_image.php', { method: 'POST', body: formData })
          .then(res => res.json())
          .then(result => {
            if (!result.success) throw new Error(`Upload failed for ${box.dataset.imageType}: ${result.message}`);
            return result.path;
          });
        uploadPromises.push(promise);
      } else { // It's an existing image
        const imgSrc = previewItem.querySelector('img').src;
        try {
          const url = new URL(imgSrc);
          uploadPromises.push(Promise.resolve(url.pathname));
        } catch (e) {
          uploadPromises.push(Promise.resolve('')); // Invalid existing URL, resolve empty
        }
      }
    }

    try {
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('An error occurred during image upload:', error);
        return null; // Indicate failure
    }
  }
}

// Initialize product manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
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
  // Initialize the ProductManager
  new ProductManager();
})
