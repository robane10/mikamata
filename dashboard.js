document.addEventListener('DOMContentLoaded', function () {
        // --- GLOBAL & HELPER FUNCTIONS ---
        let salesChartInstance = null;
        let categoriesChartInstance = null; // New instance for the categories chart
        let mostSellingProductsChartInstance = null; // Instance for the new bar chart
        let reviewsChartInstance = null; // Instance for the new reviews chart
        
        // Helper to get CSS variable value
        const getCssVar = (variable) => getComputedStyle(document.body).getPropertyValue(variable).trim();
        
        // Helper to set current date
        function setCurrentDate() {
            const dateElement = document.getElementById('current-date');
            if (dateElement) {
                const today = new Date();
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                dateElement.textContent = today.toLocaleDateString('en-US', options);
            }
        }

        // Helper to set current time with real-time updates
        function setCurrentTime() {
            const timeElement = document.getElementById('current-time');
            if (timeElement) {
                setInterval(() => {
                    const now = new Date();
                    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
                    timeElement.textContent = now.toLocaleTimeString('en-US', options);
                }, 1000); // Update every second
            }
        }

        // --- CHART RENDERING FUNCTIONS ---
        function renderSalesChart() {
            if (salesChartInstance) {
                salesChartInstance.destroy();
            }

            const salesChartCanvas = document.getElementById('salesChart');
            if (!salesChartCanvas) return;

            const ctx = salesChartCanvas.getContext('2d');
            const primaryHighlight = getCssVar('--highlight-primary');
            const textColor = getCssVar('--text-color') + 'b3'; // Add 70% opacity
            const gridColor = getCssVar('--text-color') + '1a'; // Add 10% opacity

            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, primaryHighlight + '80'); // Add 50% opacity
            gradient.addColorStop(1, primaryHighlight + '00'); // Transparent

            salesChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Monthly Sales',
                        data: [8100, 10400, 9500, 12000], // Placeholder data for 4 weeks
                        backgroundColor: gradient,
                        borderColor: primaryHighlight,
                        borderWidth: 4, // Made the line slightly thicker
                        pointBackgroundColor: getCssVar('--card-bg'), // Match the card background
                        pointBorderColor: primaryHighlight,
                        pointBorderWidth: 2,
                        pointRadius: 6, // Made the points slightly larger
                        pointHoverRadius: 8,
                        tension: 0.4,
                        fill: true,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { ticks: { color: textColor }, grid: { color: gridColor } },
                        x: { ticks: { color: textColor }, grid: { color: gridColor } }
                    },
                    plugins: { 
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: getCssVar('--card-bg'),
                            titleColor: getCssVar('--highlight-secondary'),
                            bodyColor: textColor,
                            borderColor: getCssVar('--border-color'),
                            borderWidth: 1,
                            padding: 10,
                            cornerRadius: 8,
                        }
                    }
                }
            });
        }

        function renderTopCategoriesChart() {
            if (categoriesChartInstance) {
                categoriesChartInstance.destroy();
            }

            const categoriesChartCanvas = document.getElementById('topCategoriesChart');
            if (!categoriesChartCanvas) return;

            const ctx = categoriesChartCanvas.getContext('2d');
            const textColor = getCssVar('--text-color') + 'b3'; // 70% opacity

            // Define a monochromatic burlywood/brown palette
            const categoryChartColors = [ // Renamed to avoid conflict
                '#8B4513', // SaddleBrown (Darkest)
                '#A0522D', // Sienna
                '#CD853F', // Peru
                '#DEB887', // Burlywood (Base)
                '#F5DEB3', // Wheat (Lightest)
            ];
            
            // Process product data to get category counts
            let categoryCounts = {};
            // Check if PRODUCTS is defined and is an array from products.js
            // Also check if CATEGORIES is defined from products.js for category names
            if (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS) && typeof CATEGORIES !== 'undefined' && Array.isArray(CATEGORIES)) {
                // Map product category_id to category name
                PRODUCTS.forEach(product => {
                    const category = product.category.charAt(0).toUpperCase() + product.category.slice(1);
                    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                });
            } else {
                // Fallback to mock data if PRODUCTS is not available
                categoryCounts = { 'Lampshades': 5, 'Baskets': 2, 'Mugs': 3, 'Kitchenware': 4, 'Furniture': 1 };
            }

            categoriesChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(categoryCounts),
                    datasets: [{
                        label: 'Top Categories by Sales',
                        data: Object.values(categoryCounts), // Use the processed counts
                        backgroundColor: categoryChartColors.map(color => color + 'CC'), // Use the renamed color array
                        borderColor: getCssVar('--card-bg'),
                        borderWidth: 2,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true, // Ensure legend is visible
                            position: 'bottom',
                            labels: { color: textColor, boxWidth: 15, padding: 15 }
                        },
                        tooltip: {
                            backgroundColor: getCssVar('--card-bg'),
                            titleColor: getCssVar('--highlight-secondary'),
                            bodyColor: textColor,
                            borderColor: getCssVar('--border-color'),
                            borderWidth: 1
                        }
                    }
                }
            });
        }

        function renderMostSellingProductsChart() {
            if (mostSellingProductsChartInstance) {
                mostSellingProductsChartInstance.destroy();
            }

            const canvas = document.getElementById('mostSellingProductsChart');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const primaryHighlight = getCssVar('--highlight-primary');
            const textColor = getCssVar('--text-color') + 'b3'; // 70% opacity
            const gridColor = getCssVar('--text-color') + '1a'; // 10% opacity

            mostSellingProductsChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Bamboo Dome Shade', 'Classic Bamboo Cup', 'Serving Tray', 'Utensil Holder', 'Amber Glow Shade'],
                    datasets: [{
                        label: 'Units Sold',
                        data: [85, 68, 55, 42, 30], // Placeholder data
                        backgroundColor: primaryHighlight + 'b3', // 70% opacity
                        borderColor: primaryHighlight,
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y', // This makes the bar chart horizontal
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { 
                            ticks: { color: textColor }, 
                            grid: { display: false } // Hide y-axis grid lines for a cleaner look
                        },
                        x: { 
                            ticks: { color: textColor }, 
                            grid: { color: gridColor } 
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: getCssVar('--card-bg'),
                            titleColor: getCssVar('--highlight-secondary'),
                            bodyColor: textColor,
                            borderColor: getCssVar('--border-color'),
                            borderWidth: 1,
                            padding: 10,
                            cornerRadius: 8,
                        }
                    }
                }
            });
        }

        function renderReviewsChart() {
            if (reviewsChartInstance) {
                reviewsChartInstance.destroy();
            }

            const canvas = document.getElementById('reviewsChart');
            if (!canvas) return;

            // In a real application, this data would be fetched from your database.
            const mockReviews = [
                { id: 1, rating: 5 }, { id: 2, rating: 4 }, { id: 3, rating: 5 }, { id: 4, rating: 5 },
                { id: 5, rating: 3 }, { id: 6, rating: 5 }, { id: 7, rating: 4 }, { id: 8, rating: 2 },
                { id: 9, rating: 5 }, { id: 10, rating: 4 }, { id: 11, rating: 5 }, { id: 12, rating: 1 },
                { id: 13, rating: 4 }, { id: 14, rating: 5 }, { id: 15, rating: 5 }, { id: 16, rating: 3 },
                { id: 17, rating: 4 }, { id: 18, rating: 5 }, { id: 19, rating: 2 }, { id: 20, rating: 5 },
            ];

            // Process the data to get counts for each rating
            const ratingCounts = [0, 0, 0, 0, 0]; // Index 0 for 1-star, up to index 4 for 5-star
            mockReviews.forEach(review => {
                if (review.rating >= 1 && review.rating <= 5) {
                    ratingCounts[review.rating - 1]++;
                }
            });

            const ctx = canvas.getContext('2d');
            const textColor = getCssVar('--text-color-light') + 'b3'; // 70% opacity for light theme
            const gridColor = getCssVar('--text-color-light') + '1a'; // 10% opacity for light theme

            // Using a gradient for the bars
            const gradient = ctx.createLinearGradient(0, 0, 500, 0);
            gradient.addColorStop(0, getCssVar('--highlight-secondary-light')); // Rust Brown
            gradient.addColorStop(1, getCssVar('--highlight-primary-light')); // Theme Green

            reviewsChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
                    datasets: [{
                        label: 'Number of Reviews',
                        data: ratingCounts.reverse(), // Reverse to match labels [5, 4, 3, 2, 1]
                        backgroundColor: gradient,
                        borderColor: getCssVar('--highlight-primary-light'),
                        borderWidth: 1,
                        borderRadius: 5,
                        barThickness: 25,
                    }]
                },
                options: {
                    indexAxis: 'y', // Horizontal bar chart
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { ticks: { color: textColor, font: { size: 14 } }, grid: { display: false } },
                        x: { ticks: { color: textColor }, grid: { color: gridColor } }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: getCssVar('--card-bg-light'),
                            titleColor: getCssVar('--highlight-secondary-light'),
                            bodyColor: textColor,
                            borderColor: getCssVar('--border-color-light'),
                            borderWidth: 1,
                            padding: 10,
                            cornerRadius: 8,
                        }
                    }
                }
            });
        }

        // --- DATA & UI UPDATE FUNCTIONS ---
        function updateDashboardStats() {
            // In a real app, you would fetch this data from an API
            const stats = {
                'sales-today': '₱15,420.00',
                'orders-week': 127,
                'new-users-month': 89,
                'total-products': (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS)) ? PRODUCTS.length : 245,
            };

            for (const key in stats) {
                const element = document.querySelector(`[data-stat="${key}"]`);
                if (element) {
                    element.textContent = stats[key];
                }
            }
        }

        // --- SIDEBAR & NAVIGATION LOGIC ---
        function updateActiveSidebarLink() {
            const currentPage = window.location.pathname.split('/').pop();
            const sidebarLinks = document.querySelectorAll('.sidebar-nav a');

            sidebarLinks.forEach(link => {
                link.classList.remove('active');
                const linkPage = link.getAttribute('href').split('/').pop();
                // Make it work for both dashboard.html and an empty path
                if (linkPage === currentPage || (currentPage === '' && linkPage === 'dashboard.html')) {
                    link.classList.add('active');
                }
            });
        }

        // --- Notification Dropdown Logic ---
        function initializeNotificationDropdown() {
            const notificationBtn = document.getElementById('notification-icon-btn');
            const notificationDropdown = document.getElementById('notification-dropdown');

            if (notificationBtn && notificationDropdown) {
                notificationBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    notificationDropdown.classList.toggle('show');
                });

                window.addEventListener('click', (event) => {
                    if (!notificationDropdown.contains(event.target) && !notificationBtn.contains(event.target)) {
                        notificationDropdown.classList.remove('show');
                    }
                });
            }
        }

        // --- LOGOUT LOGIC ---
        function initializeLogout() {
            const logoutBtn = document.getElementById('admin-logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // In a real app, you would clear session/token here
                    alert('Logging out...');
                    // window.location.href = '/admin/login.html'; // Redirect to login page
                });
            }
        }

        // --- INITIALIZATION ---
        setCurrentDate();
        setCurrentTime();
        updateDashboardStats();
        updateActiveSidebarLink();
        initializeNotificationDropdown();
        initializeLogout();
        renderSalesChart();
        renderTopCategoriesChart();
        renderMostSellingProductsChart();
        // renderReviewsChart(); // This chart seems out of place on the main dashboard, commenting out.
    });