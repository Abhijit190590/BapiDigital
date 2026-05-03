/**
 * Bapi Digital - All Products Page
 */
(function () {
  let allProducts = [];
  let cart = JSON.parse(localStorage.getItem('bapi_cart')) || [];
  let wishlist = JSON.parse(localStorage.getItem('bapi_wishlist')) || [];
  let whatsappNumber = '';

  // DOM Elements
  const productsGrid = document.getElementById('productsGrid');
  const mainSearch = document.getElementById('mainSearch');
  const pageLoader = document.getElementById('pageLoader');

  async function init() {
    setupEventListeners();
    
    try {
      // 1. Load Global Config
      const waNumber = await API.getWhatsAppNumber();
      whatsappNumber = waNumber || '910000000000';

      // 2. Load All Products
      const response = await API.getProducts();
      allProducts = response.content || response;
      
      renderProducts(allProducts);
    } catch (err) {
      console.error('Init error:', err);
      showToast('Error loading products', 'error');
    } finally {
      if (pageLoader) {
        pageLoader.style.opacity = '0';
        setTimeout(() => pageLoader.style.visibility = 'hidden', 500);
      }
    }
  }

  function setupEventListeners() {
    if (mainSearch) {
      mainSearch.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length > 2) {
          const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(query) || 
            (p.category && p.category.toLowerCase().includes(query))
          );
          renderProducts(filtered);
        } else if (query.length === 0) {
          renderProducts(allProducts);
        }
      });
    }
  }

  function renderProducts(products) {
    if (!productsGrid) return;
    
    if (!products || products.length === 0) {
      productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:var(--text-muted);">No products found.</p>';
      return;
    }

    productsGrid.innerHTML = products.map(p => {
      const img = p.images && p.images.length > 0 ? p.images[0] : getPlaceholderImage();
      const isWishlisted = wishlist.includes(p.id);
      
      return `
        <div class="product-card">
          <div class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist('${p.id}', this)">❤️</div>
          <div class="discount-badge">HOT</div>
          <div class="img-container" onclick="window.location.href='product.html?id=${p.id}'" style="cursor:pointer">
            <img src="${img}" alt="${p.name}" loading="lazy">
          </div>
          <div class="product-info" onclick="window.location.href='product.html?id=${p.id}'" style="cursor:pointer">
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

  window.addToCart = function (id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    
    cart.push(product);
    localStorage.setItem('bapi_cart', JSON.stringify(cart));
    // Update cart count globally via common.js if possible, or just toast
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

  init();
})();
