class ReviewManager {
  constructor() {
    this.reviews = []
    this.filteredReviews = []
    this.currentPage = 1
    this.itemsPerPage = 10
    this.init()
  }

  _createLog(action, description, severity = "info") {
    try {
      const logs = JSON.parse(localStorage.getItem("mikamataActivityLogs") || "[]")
      const newLog = {
        id: `log-${Date.now()}`,
        user: { name: "Admin User", avatar: "../placeholder.svg?height=32&width=32&text=A" },
        action: action,
        description: description,
        severity: severity,
        icon: "fa-star",
        timestamp: new Date().toISOString(),
        ip: "127.0.0.1",
        details: {},
      }
      logs.unshift(newLog)
      localStorage.setItem("mikamataActivityLogs", JSON.stringify(logs.slice(0, 100)))
    } catch (error) {
      console.error("Failed to create activity log:", error)
    }
  }

  _createNotification(title, message, type = "review") {
    try {
      const notifications = JSON.parse(localStorage.getItem("mikamataNotifications") || "[]")
      const newNotification = {
        id: `notif-${Date.now()}`,
        type: type,
        icon: "fa-star",
        title: title,
        message: message,
        recipient: "Admin",
        date: new Date().toISOString(),
        status: "sent",
        link: "reviews.html",
        targetId: null,
      }
      notifications.unshift(newNotification)
      localStorage.setItem("mikamataNotifications", JSON.stringify(notifications.slice(0, 50)))
    } catch (error) {
      console.error("Failed to create notification:", error)
    }
  }

  async init() {
    await this.loadReviews()
    this.setupEventListeners()
  }

  async loadReviews() {
    try {
        // --- DATABASE INTEGRATION PLACEHOLDER ---
        // const response = await fetch('/api/reviews');
        // this.reviews = await response.json();

        // For demo, use mock data
        const savedReviews = localStorage.getItem("mikamataReviews");
        this.reviews = savedReviews ? JSON.parse(savedReviews) : this.generateMockReviews();
        this.saveReviewsToStorage();

    } catch (error) {
      console.error("Error loading reviews from localStorage:", error)
      this.reviews = this.generateMockReviews();
    }
    this.filteredReviews = [...this.reviews]
    this.renderReviews()
  }

  generateMockReviews() {
    // This function can be kept for development/testing purposes
    const users = ["Sarah Johnson", "Mike Chen", "David Lee", "Emily White"];
    const products = ["Wireless Headphones", "Smart Watch", "Bamboo Cup", "Lampshade"];
    const comments = ["Excellent!", "Good product.", "It's okay.", "Not what I expected."];

    return Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        customerName: users[i % users.length],
        customerAvatar: `../mik/users/user-${i % 7}.jpg`,
        productName: products[i % products.length],
        productImage: `../mik/products/product-${(i % 5) + 1}.jpg`,
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        comment: comments[i % comments.length],
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: ["approved", "pending", "rejected"][i % 3],
    }));
  }

  saveReviewsToStorage() {
    try {
      localStorage.setItem("mikamataReviews", JSON.stringify(this.reviews))
    } catch (error) {
      console.error("Error saving reviews to localStorage:", error)
    }
  }

  renderReviews() {
    const gridView = document.getElementById("reviews-view")
    if (!gridView) return

    const startIndex = (this.currentPage - 1) * this.itemsPerPage
    const endIndex = startIndex + this.itemsPerPage
    const paginatedReviews = this.filteredReviews.slice(startIndex, endIndex)

    if (paginatedReviews.length === 0) {
      gridView.innerHTML = `<p style="text-align: center; padding: 2rem; grid-column: 1 / -1;">No reviews found.</p>`
      this.renderPagination()
      return
    }

    gridView.innerHTML = paginatedReviews
      .map((review) => {
        const isLongComment = review.comment.length > 150
        const truncatedComment = isLongComment ? review.comment.substring(0, 150) + "..." : review.comment

        return `
                <div class="review-card">
                    <div class="review-card-header">
                        <div class="customer-info">
                            <div>
                                <div class="customer-name">${review.customerName}</div>
                                <div class="review-date">${new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                            </div>
                        </div>
                        <div class="review-status ${review.status}">${review.status}</div>
                    </div>
                    <div class="review-card-body">
                        <div class="review-rating">
                            <div class="stars">
                                ${Array.from({ length: 5 }, (_, i) => `<i class="fas fa-star ${i < Math.floor(review.rating) ? "filled" : ""}"></i>`).join("")}
                            </div>
                            <span class="rating-text">${review.rating}</span>
                        </div>
                        <p class="review-comment">"${truncatedComment}"</p>
                        ${isLongComment ? `<button class="read-more-btn" onclick="reviewManager.viewReview(${review.id})">Read More</button>` : ""}
                    </div>
                    <div class="review-card-footer">
                        <div class="review-product-info">
                            <a href="#">${review.productName}</a>
                        </div>
                        <div class="review-actions">
                            <button class="btn-icon approve" title="Approve" onclick="reviewManager.updateStatus(${review.id}, 'approved')"><i class="fas fa-check"></i></button>
                            <button class="btn-icon reject" title="Reject" onclick="reviewManager.updateStatus(${review.id}, 'rejected')"><i class="fas fa-times"></i></button>
                            <button class="btn-icon reply" title="Reply"><i class="fas fa-reply"></i></button>
                            <button class="btn-icon delete" title="Delete" onclick="reviewManager.deleteReview(${review.id})"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `
      })
      .join("")

    this.renderPagination()
  }

  closeReviewModal() {
    const modal = document.getElementById("review-modal")
    if (modal) {
      modal.style.display = "none"
    }
  }

  renderPagination() {
    const paginationInfo = document.getElementById("pagination-info")
    const paginationControls = document.getElementById("pagination-controls")
    if (!paginationInfo || !paginationControls) return

    const totalItems = this.filteredReviews.length
    const totalPages = Math.ceil(totalItems / this.itemsPerPage)
    const startItem = totalItems > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0
    const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems)

    paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems} reviews`

    if (totalPages <= 1) {
      paginationControls.innerHTML = ""
      return
    }

    let paginationHTML = `<button class="pagination-btn" ${this.currentPage === 1 ? "disabled" : ""} data-page="${this.currentPage - 1}"><i class="fas fa-chevron-left"></i></button>`
    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `<button class="pagination-btn ${i === this.currentPage ? "active" : ""}" data-page="${i}">${i}</button>`
    }
    paginationHTML += `<button class="pagination-btn" ${this.currentPage === totalPages ? "disabled" : ""} data-page="${this.currentPage + 1}"><i class="fas fa-chevron-right"></i></button>`
    paginationControls.innerHTML = paginationHTML

    paginationControls.querySelectorAll(".pagination-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const page = e.currentTarget.dataset.page
        if (page) {
          this.currentPage = Number.parseInt(page)
          this.renderReviews()
        }
      })
    })
  }

  exportToCSV() {
    const csvRows = []
    const headers = Object.keys(this.reviews[0])

    csvRows.push(headers.join(","))

    this.filteredReviews.forEach((review) => {
      const values = headers.map((header) => {
        let value = review[header]
        if (typeof value === "string") {
          value = value.replace(/"/g, '""')
          value = `"${value}"`
        }
        return value
      })
      csvRows.push(values.join(","))
    })

    const csvData = csvRows.join("\n")
    const blob = new Blob([csvData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("href", url)
    a.setAttribute("download", "reviews.csv")
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  openReviewModal(reviewId) {
    const review = this.reviews.find((r) => r.id === reviewId)
    if (!review) return

    // Populate modal content
    document.getElementById("modal-customer-name").textContent = review.customerName
    document.getElementById("modal-customer-avatar").src = review.customerAvatar
    document.getElementById("modal-product-name").textContent = review.productName
    document.getElementById("modal-product-image").src = review.productImage
    document.getElementById("modal-rating").innerHTML = Array.from(
      { length: 5 },
      (_, i) => `<i class="fas fa-star ${i < Math.floor(review.rating) ? "filled" : ""}"></i>`,
    ).join("")
    document.getElementById("modal-comment").textContent = review.comment
    document.getElementById("modal-date").textContent = new Date(review.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    document.getElementById("modal-status").textContent = review.status

    const modal = document.getElementById("review-modal")
    if (modal) {
      modal.style.display = "flex"
    }
  }

  setupEventListeners() {
    // Add event listeners for search and filters here
    const ratingFilter = document.getElementById("rating-filter")

    ratingFilter?.addEventListener("change", () => this.filterAndRender())
    document.getElementById("export-reviews")?.addEventListener("click", () => this.exportToCSV())
  }

  filterAndRender() {
    const ratingFilter = document.getElementById("rating-filter")?.value || ""

    this.filteredReviews = this.reviews.filter((review) => {
      // Match if the floor of the review rating equals the filter value.
      // e.g., a "4" filter matches ratings from 4.0 to 4.9
      const matchesRating =
        ratingFilter === "" || Math.floor(Number.parseFloat(review.rating)) == Number.parseInt(ratingFilter)

      return matchesRating
    })

    this.currentPage = 1 // Reset to the first page after filtering
    this.renderReviews()
  }

  viewReview(reviewId) {
    this.openReviewModal(reviewId)
  }

  async deleteReview(reviewId) {
    const confirmed = await showConfirmation("Are you sure you want to delete this review?");
    if (confirmed) {
        try {
            // --- DATABASE INTEGRATION PLACEHOLDER ---
            // const response = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
            // if (!response.ok) throw new Error('Server deletion failed');

            this.reviews = this.reviews.filter((r) => r.id !== reviewId);
            this.saveReviewsToStorage();
            this.filterAndRender();
            this._createLog("delete", `Deleted review ID: ${reviewId}`, "warning");
            showToast('Review deleted.', 'error');
        } catch (error) {
            console.error('Failed to delete review:', error);
            showToast('Could not delete review.', 'error');
        }
    }
  }

  async updateStatus(reviewId, newStatus) {
    try {
        // --- DATABASE INTEGRATION PLACEHOLDER ---
        // const response = await fetch(`/api/reviews/${reviewId}/status`, {
        //     method: 'PATCH',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ status: newStatus })
        // });
        // if (!response.ok) throw new Error('Failed to update status');

        const review = this.reviews.find((r) => r.id === reviewId);
        if (review) review.status = newStatus;
        this.saveReviewsToStorage();
        this.filterAndRender();
        showToast(`Review status updated to ${newStatus}.`, 'success');
    } catch (error) {
        console.error('Failed to update review status:', error);
        showToast('Could not update status.', 'error');
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.reviewManager = new ReviewManager()
})
