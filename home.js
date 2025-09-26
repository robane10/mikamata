const PRODUCTS = [
      {
        id: 1,
        name: "Sulu-Light Lampshade",
        description: "Handcrafted bamboo lampshade",
        price: 150.0,
        category: "lampshades",
        image: "/bamboo-products.png"
      },
      {
        id: 2,
        name: "Ilaw - Kawayan",
        description: "Bamboo light fixture",
        price: 100.0,
        category: "lampshades",
        image: "/bamboo-products.png"
      },
      {
        id: 3,
        name: "HabitHook Rack",
        description: "Bamboo wall rack",
        price: 100.0,
        category: "furnitures",
        image: "/bamboo-products.png"
      },
      {
        id: 4,
        name: "Tadyaw",
        description: "Bamboo jar/container",
        price: 100.0,
        category: "mugs",
        image: "/bamboo-products.png"
      },
      {
        id: 5,
        name: "Pugad Holder",
        description: "Bamboo phone holder",
        price: 100.0,
        category: "kitchenware",
        image: "/bamboo-products.png"
      },
      {
        id: 6,
        name: "Kape - Kawayan",
        description: "Bamboo coffee mug",
        price: 100.0,
        category: "mugs",
        image: "/bamboo-products.png"
      },
      {
        id: 7,
        name: "Dayang - Dulo",
        description: "Bamboo decorative item",
        price: 100.0,
        category: "basket",
        image: "/bamboo-products.png"
      }
    ];

    let cartItems = [];
    let wishlistItems = [];

    const cartBtn = document.getElementById('cartBtn');
    const wishlistBtn = document.getElementById('wishlistBtn');
    const cartModal = document.getElementById('cartModal');
    const wishlistModal = document.getElementById('wishlistModal');
    const closeCartBtn = document.getElementById('closeCart');
    const closeWishlistBtn = document.getElementById('closeWishlist');
    const cartCountSpan = document.getElementById('cartCount');
    const wishlistCountSpan = document.getElementById('wishlistCount');

    function updateCounts() {
      // Update cart and wishlist counts on both home and products page buttons
      const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

      // Update all cart count spans
      document.querySelectorAll('#cartCount, .cart-count').forEach(span => {
        span.textContent = totalCartItems;
        span.style.display = totalCartItems > 0 ? 'inline-block' : 'none';
      });

      // Update all wishlist count spans
      document.querySelectorAll('#wishlistCount, .wishlist-count').forEach(span => {
        span.textContent = wishlistItems.length;
        span.style.display = wishlistItems.length > 0 ? 'inline-block' : 'none';
      });
      cartCountSpan.textContent = totalCartItems;
      cartCountSpan.style.display = totalCartItems > 0 ? 'inline-block' : 'none';

      wishlistCountSpan.textContent = wishlistItems.length;
      wishlistCountSpan.style.display = wishlistItems.length > 0 ? 'inline-block' : 'none';
    }

    function addToCart(productId) {
      const product = PRODUCTS.find(p => p.id === productId);
      if (!product) return;

      const existingItem = cartItems.find(item => item.id === productId);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        cartItems.push({ id: productId, quantity: 1 });
      }
      updateCounts();
      showNotification(`${product.name} added to cart!`);
      saveCartAndWishlist();
    }

    function toggleWishlist(productId) {
      const index = wishlistItems.indexOf(productId);
      const product = PRODUCTS.find(p => p.id === productId);
      if (index > -1) {
        wishlistItems.splice(index, 1);
        showNotification(`${product.name} removed from wishlist!`);
      } else {
        wishlistItems.push(productId);
        showNotification(`${product.name} added to wishlist!`);
      }
      updateCounts();
      saveCartAndWishlist();
      // Re-render the products to show the updated wishlist status
      displayProducts(document.querySelector('.category-btn.active')?.dataset.category || 'all');
    }

    function showNotification(message) {
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }

    function renderCartItems() {
      const cartItemsContainer = document.getElementById('cartItems');
      const cartFooter = document.getElementById('cartFooter');
      if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #555;">Your cart is empty.</p>';
        cartFooter.innerHTML = '';
        return;
      }

      let total = 0;
      cartItemsContainer.innerHTML = cartItems.map(item => {
        const product = PRODUCTS.find(p => p.id === item.id);
        if (!product) return '';
        total += product.price * item.quantity;
        return `
          <div class="cart-item" style="display: flex; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <img src="${product.image}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px; border-radius: 4px;">
            <div style="flex-grow: 1;">
              <h4 style="margin: 0; font-size: 1em;">${product.name}</h4>
              <p style="margin: 5px 0 0; font-size: 0.9em; color: #777;">₱${product.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <button onclick="removeFromCart(${product.id})" style="background: none; border: none; color: #ff4500; font-size: 1.2em; cursor: pointer;">&times;</button>
          </div>
        `;
      }).join('');

      cartFooter.innerHTML = `
        <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 15px;">Total: ₱${total.toFixed(2)}</div>
        <button style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 1em;">Checkout</button>
      `;
    }
 
    function removeFromCart(productId) {
      cartItems = cartItems.filter(item => item.id !== productId);
      updateCounts();
      renderCartItems();
      saveCartAndWishlist();
    }

    function renderWishlistItems() {
      const wishlistItemsContainer = document.getElementById('wishlistItems');
      if (wishlistItems.length === 0) {
        wishlistItemsContainer.innerHTML = '<p style="text-align: center; color: #555;">Your wishlist is empty.</p>';
        return;
      }

      wishlistItemsContainer.innerHTML = wishlistItems.map(productId => {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return '';
        return `
          <div class="wishlist-item" style="display: flex; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <img src="${product.image}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px; border-radius: 4px;">
            <div style="flex-grow: 1;">
              <h4 style="margin: 0; font-size: 1em;">${product.name}</h4>
              <p style="margin: 5px 0 0; font-size: 0.9em; color: #777;">₱${product.price.toFixed(2)}</p>
            </div>
            <button onclick="addToCart(${product.id}); toggleWishlist(${product.id})" style="background-color: #007bff; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8em; margin-right: 5px;">Add to Cart</button>
            <button onclick="toggleWishlist(${product.id})" style="background: none; border: none; color: #ff4500; font-size: 1.2em; cursor: pointer;">&times;</button>
          </div>
        `;
      }).join('');
    }

    cartBtn.addEventListener('click', () => {
      renderCartItems();
      cartModal.style.display = 'block';
    });

    wishlistBtn.addEventListener('click', () => {
      renderWishlistItems();
      wishlistModal.style.display = 'block';
    });

    closeCartBtn.addEventListener('click', () => {
      cartModal.style.display = 'none';
    });

    closeWishlistBtn.addEventListener('click', () => {
      wishlistModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
      if (event.target === cartModal) {
        cartModal.style.display = 'none';
      }
      if (event.target === wishlistModal) {
        wishlistModal.style.display = 'none';
      }
    });

    // Load cart and wishlist from localStorage on page load
    function loadCartAndWishlist() {
      const storedCart = localStorage.getItem('cartItems');
      const storedWishlist = localStorage.getItem('wishlistItems');
      if (storedCart) cartItems = JSON.parse(storedCart);
      if (storedWishlist) wishlistItems = JSON.parse(storedWishlist);
    }

    // Save cart and wishlist to localStorage
    function saveCartAndWishlist() {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
    }

    function displayProducts(category = 'lampshades', searchTerm = '') {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        let filteredProducts = PRODUCTS;
        if (category && category !== 'all') {
            filteredProducts = PRODUCTS.filter(p => p.category === category);
        }

        productsGrid.innerHTML = '';
        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 2rem;">No products found in this category.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const isWishlisted = wishlistItems.includes(product.id);
            const productCardHTML = `
                <div class="product-card" data-product-id="${product.id}">
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                        <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" title="Add to Wishlist">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <p class="product-price">₱${product.price.toFixed(2)}</p>
                    </div>
                    <div class="product-actions">
                        <button class="btn-primary cart-btn">Add to Cart</button>
                    </div>
                </div>
            `;
            productsGrid.insertAdjacentHTML('beforeend', productCardHTML);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const categoryFilters = document.querySelector('.category-filters');
        const productsGrid = document.getElementById('productsGrid');

        loadCartAndWishlist();
        updateCounts();

        const initialCategory = categoryFilters?.querySelector('.category-btn.active')?.dataset.category || 'lampshades';
        displayProducts(initialCategory);

        if (categoryFilters) {
            categoryFilters.addEventListener('click', (event) => {
                const button = event.target.closest('.category-btn');
                if (!button) return;

                categoryFilters.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                displayProducts(button.dataset.category);
            });
        }

        if (productsGrid) {
            productsGrid.addEventListener('click', (event) => {
                const card = event.target.closest('.product-card');
                if (!card) return;
                const productId = parseInt(card.dataset.productId);

                if (event.target.closest('.cart-btn')) addToCart(productId);
                if (event.target.closest('.wishlist-btn')) toggleWishlist(productId);
            });
        }
    });