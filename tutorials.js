function generateMockTutorials() {
  return [
    {
      id: 1,
      title: "Getting Started with MIKAMATA",
      description: "Learn the basics of using our platform.",
      type: "video",
      views: 2847,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Example URL
      articleUrl: null,
      lastUpdated: "2024-03-15",
      image: "../mik/tutorials/getting-started.jpg",
    },
    {
      id: 2,
      title: "Advanced Product Configuration Guide",
      description: "Master advanced product settings with this comprehensive guide.",
      type: "article",
      views: 1234,
      videoUrl: null,
      articleUrl: "https://www.example.com/articles/advanced-config", // Example URL
      lastUpdated: "2024-03-12",
      image: "../mik/tutorials/product-config.jpg",
    },
    {
      id: 3,
      title: "Common Issues and Solutions",
      description: "A quick guide to troubleshoot common problems you might encounter.",
      type: "article",
      views: 3456,
      videoUrl: null,
      articleUrl: "https://www.example.com/articles/troubleshooting", // Example URL
      lastUpdated: "2024-03-10",
      image: "../mik/tutorials/troubleshooting.jpg",
    },
    // Add more mock data to test pagination
    ...Array.from({ length: 20 }, (_, i) => ({
      id: i + 4,
      title: `Another Tutorial Title ${i + 1}`,
      description: `Description for tutorial ${i + 1}`,
      type: ["video", "article"][i % 2],
      videoUrl: i % 2 === 0 ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : null,
      articleUrl: i % 2 !== 0 ? `https://www.example.com/articles/tutorial-${i + 1}` : null,
      lastUpdated: `2024-02-${10 + i}`,
      image: `../mik/tutorials/placeholder-${i % 5}.jpg`, // Use a few rotating placeholders
    })),
  ]
}

class TutorialManager {
  constructor() {
    this.tutorials = []
    this.filteredTutorials = []
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
        icon: "fa-book-open",
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

  async init() {
    await this.loadTutorials()
    this.setupEventListeners()
  }

  async loadTutorials() {
    try {
      // --- DATABASE INTEGRATION PLACEHOLDER ---
      // const response = await fetch('/api/tutorials');
      // this.tutorials = await response.json();

      // For demo, use mock data
      const savedTutorials = localStorage.getItem("mikamataTutorials");
      this.tutorials = savedTutorials ? JSON.parse(savedTutorials) : generateMockTutorials();
      this.saveTutorialsToStorage();
    } catch (error) {
      console.error("Error loading tutorials from localStorage:", error)
      this.tutorials = generateMockTutorials()
    }
    this.filteredTutorials = [...this.tutorials]
    this.renderTutorials()
  }

  saveTutorialsToStorage() {
    // --- DATABASE INTEGRATION PLACEHOLDER ---
    // This will be removed. Saving is done via API calls.
    localStorage.setItem("mikamataTutorials", JSON.stringify(this.tutorials));
  }

  renderTutorials() {
    const gridView = document.getElementById("tutorials-view")
    if (!gridView) return

    const startIndex = (this.currentPage - 1) * this.itemsPerPage
    const endIndex = startIndex + this.itemsPerPage
    const paginatedTutorials = this.filteredTutorials.slice(startIndex, endIndex)

    if (paginatedTutorials.length === 0) {
      gridView.innerHTML = `<p style="text-align: center; padding: 2rem; grid-column: 1 / -1;">No tutorials found.</p>`
      this.renderPagination()
      return
    }

    gridView.innerHTML = paginatedTutorials
      .map(
        (tutorial) => {
          const link = tutorial.type === 'video' ? tutorial.videoUrl : tutorial.articleUrl;
          const isClickable = !!link; // Card is clickable if a link exists, regardless of status
          const cardTag = isClickable ? 'a' : 'div'; // Use 'a' tag if clickable
          const cardHref = isClickable ? `href="${link}" target="_blank"` : ''; // Add href if it's a link

          return `
              <${cardTag} class="tutorial-card ${!isClickable ? 'not-clickable' : ''}" ${cardHref}>
                  <div class="tutorial-card-thumbnail">
                      <img src="${tutorial.image}" alt="${tutorial.title}">
                      <span class="type-badge ${tutorial.type}"><i class="fas ${tutorial.type === "video" ? "fa-play" : "fa-file-alt"}"></i> ${tutorial.type}</span>
                  </div>
                  <div class="tutorial-card-content">
                      <h4 class="tutorial-title">${tutorial.title}</h4>
                      <p class="tutorial-description">${tutorial.description}</p>
                  </div>
                  <div class="tutorial-card-footer">
                      <span class="last-updated">Updated: ${new Date(tutorial.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <div class="action-buttons">
                          <button class="btn-icon edit-btn" title="Edit" onclick="event.preventDefault(); event.stopPropagation(); tutorialManager.openTutorialModal(${tutorial.id})"><i class="fas fa-edit"></i></button>
                      </div>
                  </div>
              </${cardTag}>
          `;
        }
      )
      .join("")

    this.renderPagination()
  }

  renderPagination() {
    const paginationInfo = document.getElementById("pagination-info")
    const paginationControls = document.getElementById("pagination-controls")
    if (!paginationInfo || !paginationControls) return

    const totalItems = this.filteredTutorials.length
    const totalPages = Math.ceil(totalItems / this.itemsPerPage)
    const startItem = totalItems > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0
    const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems)

    paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems} tutorials`

    if (totalPages <= 1) {
      paginationControls.innerHTML = ""
      return
    }

    let paginationHTML = ""
    paginationHTML += `<button class="pagination-btn" ${this.currentPage === 1 ? "disabled" : ""} data-page="${this.currentPage - 1}"><i class="fas fa-chevron-left"></i></button>`

    // Simplified pagination for now
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
          this.renderTutorials()
        }
      })
    })
  }

  filterAndRender() {
    this.filteredTutorials = this.tutorials.filter((tutorial) => {
      // Filtering logic can be added back here if a search bar is re-introduced.
      // For now, it just shows all tutorials.
      return true
    })

    this.currentPage = 1
    this.renderTutorials()
  }

  setupEventListeners() {
    // Modal
    const addTutorialBtn = document.getElementById("add-tutorial-btn")
    const tutorialModal = document.getElementById("tutorial-modal")
    const modalClose = document.querySelector("#tutorial-modal .modal-close")
    const tutorialForm = document.getElementById("tutorial-form")
    const cancelBtn = document.getElementById("cancel-btn")
    const deleteBtn = document.getElementById("delete-tutorial-btn");

    addTutorialBtn?.addEventListener("click", () => {
      this.openTutorialModal() // Open with no ID for adding
    })

    modalClose?.addEventListener("click", () => {
      this.closeTutorialModal()
    })

    cancelBtn?.addEventListener("click", () => {
      this.closeTutorialModal()
    })

    tutorialForm?.addEventListener("submit", (e) => {
      e.preventDefault()
      this.saveTutorial()
    })

    deleteBtn?.addEventListener("click", () => {
        const tutorialId = Number.parseInt(document.getElementById("tutorial-id").value);
        if (tutorialId) {
            this.deleteTutorial(tutorialId);
        }
    })

    // Show/hide fields based on tutorial type
    document.getElementById("tutorial-type")?.addEventListener("change", (e) => {
      this.toggleContentTypeFields(e.target.value)
    })

    // Add more event listeners for other form buttons if needed

    // Bulk Actions
    const selectAllCheckbox = document.getElementById("select-all")
    const tableBody = document.getElementById("tutorials-table-body")

    selectAllCheckbox?.addEventListener("change", (e) => {
      tableBody.querySelectorAll(".tutorial-checkbox").forEach((checkbox) => {
        checkbox.checked = e.target.checked
      })
      this.updateBulkActionsVisibility()
    })

    tableBody?.addEventListener("change", (e) => {
      if (e.target.classList.contains("tutorial-checkbox")) {
        this.updateBulkActionsVisibility()
      }
    })
  }

  openTutorialModal(tutorialId = null) {
    const modal = document.getElementById("tutorial-modal")
    const modalTitle = document.getElementById("modal-title")
    const form = document.getElementById("tutorial-form")
    const deleteBtn = document.getElementById("delete-tutorial-btn");
    const saveBtn = document.getElementById("save-tutorial-btn");

    form.reset() // Clear previous data
    document.getElementById("tutorial-id").value = "" // Clear hidden ID
    // Reset any other specific fields like contenteditable div
    document.getElementById("tutorial-content").innerHTML = ""
    this.toggleContentTypeFields(form.querySelector("#tutorial-type").value) // Set initial state based on (empty) dropdown

    if (tutorialId) {
      // This is an edit operation
      const tutorial = this.tutorials.find((t) => t.id === tutorialId)
      if (tutorial) {
        deleteBtn.style.display = "inline-block"; // Show delete button
        saveBtn.textContent = "Update Tutorial";
        modalTitle.textContent = "Edit Tutorial"
        // Populate the form
        document.getElementById("tutorial-id").value = tutorial.id
        document.getElementById("tutorial-title").value = tutorial.title
        document.getElementById("tutorial-description").value = tutorial.description
        document.getElementById("tutorial-type").value = tutorial.type
        document.getElementById("video-url").value = tutorial.videoUrl || ""
        document.getElementById("article-url").value = tutorial.articleUrl || ""
        // Populate other fields as they are added to the mock data
      }
    } else {
      // This is an add operation
      deleteBtn.style.display = "none"; // Hide delete button
      saveBtn.textContent = "Save Tutorial";
      modalTitle.textContent = "Add New Tutorial"
    }

    // This call ensures that if we are editing, the correct fields are shown.
    this.toggleContentTypeFields(form.querySelector("#tutorial-type").value)
    modal.style.display = "flex"
  }

  closeTutorialModal() {
    const modal = document.getElementById("tutorial-modal")
    modal.style.display = "none"
  }

  async deleteTutorial(tutorialId) {
    const confirmed = await showConfirmation("Are you sure you want to delete this tutorial?", "Delete");
    if (confirmed) {
        try {
            // --- DATABASE INTEGRATION PLACEHOLDER ---
            this.tutorials = this.tutorials.filter(t => t.id !== tutorialId);
            this.saveTutorialsToStorage();
            this.filterAndRender();
            this.closeTutorialModal();
            this._createLog("delete", `Deleted tutorial ID: ${tutorialId}`, "warning");
            showToast('Tutorial deleted successfully.', 'error');
        } catch (error) {
            showToast('Could not delete tutorial.', 'error');
        }
    }
  }

  async saveTutorial() {
    const form = document.getElementById("tutorial-form")
    const tutorialId = Number.parseInt(form.querySelector("#tutorial-id").value)
    const isNew = !tutorialId;

    const tutorialData = {
      title: form.querySelector("#tutorial-title").value,
      description: form.querySelector("#tutorial-description").value,
      type: form.querySelector("#tutorial-type").value,
      videoUrl: form.querySelector("#video-url").value,
      articleUrl: form.querySelector("#article-url").value,
      lastUpdated: new Date().toISOString().split("T")[0], // Set to today
    }

    try {
        // Automatically determine the image URL
        if (tutorialData.type === 'video' && tutorialData.videoUrl) {
            const youtubeId = this.getYouTubeVideoId(tutorialData.videoUrl);
            if (youtubeId) {
                tutorialData.image = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
            } else {
                tutorialData.image = this.getPlaceholderImage(tutorialData.videoUrl);
            }
        } else if (tutorialData.type === 'article' && tutorialData.articleUrl) {
            // For articles, fetch the preview image from the URL
            const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(tutorialData.articleUrl)}`);
            const linkData = await response.json();
            tutorialData.image = linkData.data?.image?.url || this.getPlaceholderImage(tutorialData.articleUrl);
        } else {
            tutorialData.image = this.getPlaceholderImage();
        }
    } catch (e) {
        console.error("Error fetching thumbnail:", e);
        tutorialData.image = this.getPlaceholderImage(tutorialData.videoUrl || tutorialData.articleUrl);
    }

    try {
        // --- DATABASE INTEGRATION PLACEHOLDER ---
        if (isNew) {
            // CREATE (POST)
            // const response = await fetch('/api/tutorials', { method: 'POST', body: JSON.stringify(tutorialData) });
            tutorialData.id = Date.now();
            this.tutorials.unshift(tutorialData);
            this._createLog("create", `Created new tutorial: "${tutorialData.title}"`);
        } else {
            // UPDATE (PUT)
            // const response = await fetch(`/api/tutorials/${tutorialId}`, { method: 'PUT', body: JSON.stringify(tutorialData) });
            const index = this.tutorials.findIndex((t) => t.id === tutorialId);
            this.tutorials[index] = { ...this.tutorials[index], ...tutorialData };
            this._createLog("update", `Updated tutorial: "${tutorialData.title}"`);
        }

        showToast('Tutorial saved successfully!', 'success');
        this.closeTutorialModal();

    } catch (error) {
        console.error('Failed to save tutorial:', error);
        showToast('Could not save tutorial.', 'error');
    }
    this.saveTutorialsToStorage() // Save changes to localStorage
    this.filterAndRender()
  }
  
  /**
   * Generates a consistent or random placeholder image.
   * @param {string|null} url - An optional URL to generate a consistent placeholder.
   * @returns {string} The URL of the placeholder image.
   */
  getPlaceholderImage(url = null) {
    // Simple hash function to get a consistent random number from a string
    const seed = url ? url.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0) : Date.now();
    const randomIndex = Math.abs(seed) % 5; // We have 5 placeholder images
    return `../mik/tutorials/placeholder-${randomIndex}.jpg`;
  }
  /**
   * <NEW>
   * Parses a YouTube URL to extract the video ID.
   * @param {string} url The YouTube URL.
   * @returns {string|null} The video ID or null if not found.
   */
  getYouTubeVideoId(url) {
    let videoId = null;
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);

    if (match && match[1]) {
        videoId = match[1];
    }

    return videoId;
  }

  toggleContentTypeFields(type) {
    const videoGroup = document.getElementById("video-url-group")
    const articleGroup = document.getElementById("article-url-group")
    const editorGroup = document.getElementById("content-editor-group")

    // Hide all content-specific groups first
    videoGroup.style.display = "none"
    articleGroup.style.display = "none"
    editorGroup.style.display = "none"

    // Show the relevant group(s) based on the selected type
    if (type === "video") {
      videoGroup.style.display = "block"
    } else if (type === "article") {
      articleGroup.style.display = "block"
      // Always show the manual editor for articles, can be used with or without an external URL
      editorGroup.style.display = "block"
    }
  }

  updateBulkActionsVisibility() {
    const checkedBoxes = document.querySelectorAll(".tutorial-checkbox:checked")
    const bulkActions = document.getElementById("bulk-actions")
    const selectedCount = document.querySelector(".selected-count")

    if (bulkActions && selectedCount) {
      if (checkedBoxes.length > 0) {
        bulkActions.style.display = "flex"
        selectedCount.textContent = `${checkedBoxes.length} tutorials selected`
      } else {
        bulkActions.style.display = "none"
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize current date
  const currentDateEl = document.getElementById("current-date")
  if (currentDateEl) {
    currentDateEl.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  window.tutorialManager = new TutorialManager()
})
