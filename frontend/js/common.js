/**
 * Bapi Digital - Common Site Logic
 * Handles global settings, theme management, cart state, and shared UI behavior
 */
(function () {
  // --- Theme Management ---
  function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('bapi_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('bapi_theme', newTheme);
    });
  }

  // --- Cart Management ---
  function initCart() {
    const cartBtn = document.getElementById('cartBtn');
    if (!cartBtn) return;

    // Create Cart Modal HTML
    const cartHTML = `
      <div class="cart-overlay" id="cartOverlay">
        <div class="cart-modal">
          <div class="cart-header">
            <h3>Your Shopping Cart 🛒</h3>
            <span class="close-cart" id="closeCart">&times;</span>
          </div>
          <div class="cart-items-list" id="cartItemsList">
            <!-- Items loaded via JS -->
          </div>
          <div class="cart-footer">
            <div class="cart-total">
              <span>Total:</span>
              <span id="cartTotalAmount">₹0</span>
            </div>
            <button class="btn-checkout" id="checkoutBtn">Checkout via WhatsApp 🚀</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', cartHTML);

    const overlay = document.getElementById('cartOverlay');
    const closeBtn = document.getElementById('closeCart');
    const checkoutBtn = document.getElementById('checkoutBtn');

    cartBtn.addEventListener('click', () => {
      renderCart();
      overlay.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.style.display = 'none';
    });

    checkoutBtn.addEventListener('click', async () => {
      const cart = JSON.parse(localStorage.getItem('bapi_cart')) || [];
      if (cart.length === 0) return showToast('Cart is empty!', 'error');

      try {
        const waNumber = await API.getWhatsAppNumber();
        let itemsText = cart.map((item, i) => `${i+1}. ${item.name} - ${formatPrice(item.price)}`).join('\n');
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        
        const message = `*Order Request - Bapi Digital*\n\n` +
                        `Items:\n${itemsText}\n\n` +
                        `*Total Amount: ${formatPrice(total)}*\n\n` +
                        `Please confirm my order!`;
        
        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
      } catch (err) {
        showToast('Error connecting to WhatsApp', 'error');
      }
    });

    updateCartCount();
  }

  function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (!cartCount) return;
    const cart = JSON.parse(localStorage.getItem('bapi_cart')) || [];
    cartCount.textContent = cart.length;
  }

  function renderCart() {
    const list = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartTotalAmount');
    if (!list) return;

    const cart = JSON.parse(localStorage.getItem('bapi_cart')) || [];
    
    if (cart.length === 0) {
      list.innerHTML = '<p style="text-align:center; color:var(--text-muted); margin-top:40px;">Your cart is empty.</p>';
      totalEl.textContent = '₹0';
      return;
    }

    let total = 0;
    list.innerHTML = cart.map((item, index) => {
      total += item.price;
      const img = item.images && item.images.length > 0 ? item.images[0] : getPlaceholderImage();
      return `
        <div class="cart-item">
          <img src="${img}" alt="${item.name}">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
          </div>
          <span class="remove-item" onclick="removeFromCart(${index})">Remove</span>
        </div>
      `;
    }).join('');
    
    totalEl.textContent = formatPrice(total);
  }

  window.removeFromCart = function (index) {
    let cart = JSON.parse(localStorage.getItem('bapi_cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('bapi_cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
  };

  // --- Global Settings ---
  async function applyGlobalSettings() {
    try {
      const settings = await API.getSiteSettings();
      if (!settings) return;

      const root = document.documentElement;
      
       // Apply Colors
       if (settings.colorPrimary) root.style.setProperty('--dynamic-primary', settings.colorPrimary);
       if (settings.colorBgPrimary) root.style.setProperty('--dynamic-bg-main', settings.colorBgPrimary);
       if (settings.colorTextPrimary) root.style.setProperty('--dynamic-text-main', settings.colorTextPrimary);

      
      // Apply Hero Content (only if it exists on the current page)
      if (settings.heroTitle) {
        const heroH1 = document.querySelector('.hero h1');
        if (heroH1) {
          const title = settings.heroTitle;
          const parts = title.split('Bapi Digital');
          heroH1.innerHTML = `${parts[0]}<span class="gradient-text">Bapi Digital</span>${parts[1] || ''}`;
        }
      }
      if (settings.heroDesc) {
        const heroP = document.querySelector('.hero p');
        if (heroP) heroP.textContent = settings.heroDesc;
      }
    } catch (err) {
      console.error('Error applying global settings:', err);
    }
  }

  // Initial setup
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCart();
    applyGlobalSettings();
  });
})();


