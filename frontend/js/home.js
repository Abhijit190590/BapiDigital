/**
 * Bapi Digital - Enhanced Home Page Logic
 * Features: Cart, Wishlist, Theme Toggle, Product Filtering, and Animations
 */
(function () {
  let allProducts = [];
  let cart = JSON.parse(localStorage.getItem('bapi_cart')) || [];
  let wishlist = JSON.parse(localStorage.getItem('bapi_wishlist')) || [];
  let whatsappNumber = '';

  // DOM Elements
  const featuredGrid = document.getElementById('featuredGrid');
  const recentGrid = document.getElementById('recentGrid');
  const bestSellersGrid = document.getElementById('bestSellersGrid');
  const mainSearch = document.getElementById('mainSearch');
  const cartCount = document.getElementById('cartCount');
  const themeToggle = document.getElementById('themeToggle');
  const pageLoader = document.getElementById('pageLoader');

  async function init() {
    updateCartCount();
    setupEventListeners();
    
    try {
      // 1. Load Global Config
      const waNumber = await API.getWhatsAppNumber();
      whatsappNumber = waNumber || '910000000000';
      document.getElementById('displayPhone').textContent = '+' + whatsappNumber;
      document.getElementById('whatsappLink').href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello, I have a query regarding your products.')}`;

      // 2. Load Products
      const products = await API.getProducts();
      allProducts = products.content || products;
      
      renderFeatured();
      renderRecent();
      renderBestSellers();
    } catch (err) {
      console.error('Init error:', err);
      showToast('Error loading store data', 'error');
    } finally {
      // Hide loader
      if (pageLoader) {
        pageLoader.style.opacity = '0';
        setTimeout(() => pageLoader.style.visibility = 'hidden', 500);
      }
    }
  }

  function setupEventListeners() {
    // Theme Toggle
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('bapi_theme', newTheme);
    });

    // Set initial theme
    const savedTheme = localStorage.getItem('bapi_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Search
    mainSearch.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (query.length > 2) {
        // When searching, we transform the featured grid into search results
        performSearch(query);
      } else if (query.length === 0) {
        renderFeatured();
      }
    });

    // Mobile Nav
    const navToggle = document.getElementById('navToggle');
    if (navToggle) {
      navToggle.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.toggle('open');
      });
    }
  }

  async function performSearch(query) {
    featuredGrid.innerHTML = '<div class="loader-small">Searching...</div>';
    try {
      const results = await API.searchProducts(query);
      renderProductsToGrid(results, featuredGrid);
    } catch (err) {
      showToast('Search failed', 'error');
    }
  }

  function renderFeatured() {
    // Featured = Top 8 products
    const featured = allProducts.slice(0, 8);
    renderProductsToGrid(featured, featuredGrid);
  }

  function renderRecent() {
    // Recent = Last 10 products
    const recent = allProducts.slice(0, 10);
    renderProductsToGrid(recent, recentGrid);
  }

  function renderBestSellers() {
    // Best Sellers = Sampled products for demo
    const best = allProducts.filter((_, i) => i % 3 === 0).slice(0, 6);
    renderProductsToGrid(best, bestSellersGrid);
  }

  function renderProductsToGrid(products, gridElement) {
    if (!gridElement) return;
    
    if (!products || products.length === 0) {
      gridElement.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:var(--text-muted);">No products found.</p>';
      return;
    }

    gridElement.innerHTML = products.map(p => {
      const img = p.images && p.images.length > 0 ? p.images[0] : getPlaceholderImage();
      const isWishlisted = wishlist.includes(p.id);
      
      return `
        <div class="product-card">
          <div class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist('${p.id}', this)">❤️</div>
          <div class="discount-badge">HOT</div>
          <div class="img-container">
            <img src="${img}" alt="${p.name}" loading="lazy">
          </div>
          <div class="product-info">
            <div class="product-rating">★★★★★ <span>(4.5)</span></div>
            <div class="product-name">${p.name}</div>
            <div class="product-price">
              <span class="current-price">${formatPrice(p.price)}</span>
              <span class="old-price">${formatPrice(p.price * 1.2)}</span>
            </div>
          </div>
          <div class="product-actions">
            <button class="btn-cart" onclick="addToCart('${p.id}')">Add to Cart</button>
            <button class="btn-whatsapp" onclick="quickWhatsApp('${p.name}')">💬 WhatsApp</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Functional Features ---

  window.addToCart = function (id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    
    cart.push(product);
    localStorage.setItem('bapi_cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`Added ${product.name} to cart!`);
  };

  window.toggleWishlist = function (id, el) {
    if (wishlist.includes(id)) {
      wishlist = wishlist.filter(item => item !== id);
      el.classList.remove('active');
    } else {
      wishlist.push(id);
      el.classList.add('active');
    }
    localStorage.setItem('bapi_wishlist', JSON.stringify(wishlist));
  };

  window.quickWhatsApp = function (name) {
    const msg = `Hi, I want to buy this product: ${name}. Please provide more details.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  function updateCartCount() {
    const el = document.getElementById('cartCount');
    if (el) el.textContent = cart.length;
  }

  init();
})();
