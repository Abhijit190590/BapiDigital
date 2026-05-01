/**
 * Bapi Digital - Home Page Logic
 */
(function () {
  let allProducts = [];
  let whatsappNumber = '';
  let currentCategory = 'ALL';
  let searchTimeout = null;

  // DOM Elements
  const productGrid = document.getElementById('productGrid');
  const recentProducts = document.getElementById('recentProducts');
  const recentSection = document.getElementById('recentSection');
  const searchInput = document.getElementById('searchInput');
  const filterTabs = document.getElementById('filterTabs');
  const emptyState = document.getElementById('emptyState');
  const productCount = document.getElementById('productCount');

  // Init
  async function init() {
    productGrid.innerHTML = createSkeletonCards(8);
    setupEventListeners();
    try {
      const [products, waNumber] = await Promise.all([
        API.getProducts(),
        API.getWhatsAppNumber(),
      ]);
      allProducts = products;
      whatsappNumber = waNumber;
      renderRecentProducts();
      renderProducts(allProducts);
    } catch (err) {
      productGrid.innerHTML = '';
      emptyState.style.display = 'block';
      emptyState.querySelector('h3').textContent = 'Connection Error';
      emptyState.querySelector('p').textContent = err.message;
    }
  }

  function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => filterProducts(), 300);
    });

    // Category Filters
    filterTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;
      filterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      filterProducts();
    });

    // Mobile Nav Toggle
    document.getElementById('navToggle').addEventListener('click', () => {
      document.getElementById('navLinks').classList.toggle('open');
    });
  }

  function filterProducts() {
    const query = searchInput.value.trim().toLowerCase();
    let filtered = allProducts;

    if (currentCategory !== 'ALL') {
      filtered = filtered.filter(p => p.category === currentCategory);
    }

    if (query) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    renderProducts(filtered);
  }

  function renderRecentProducts() {
    const recent = allProducts.slice(0, 8);
    if (recent.length === 0) { recentSection.style.display = 'none'; return; }
    recentSection.style.display = 'block';
    recentProducts.innerHTML = recent.map(p => createProductCard(p, true)).join('');
  }

  function renderProducts(products) {
    if (products.length === 0) {
      productGrid.innerHTML = '';
      emptyState.style.display = 'block';
      productCount.textContent = '';
      return;
    }
    emptyState.style.display = 'none';
    productCount.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;
    productGrid.innerHTML = products.map(p => createProductCard(p)).join('');

    // Animate cards in
    productGrid.querySelectorAll('.product-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'all 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 60);
    });
  }

  function createProductCard(product, isRecent = false) {
    const img = product.images && product.images.length > 0 ? product.images[0] : getPlaceholderImage();
    const waLink = getWhatsAppLink(whatsappNumber, product.name, product.price);

    return `
      <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
        <div class="card-image">
          <img src="${img}" alt="${product.name}" loading="lazy">
          ${isRecent ? '<span class="card-badge">New</span>' : ''}
          <a href="${waLink}" target="_blank" class="card-whatsapp" onclick="event.stopPropagation()" title="Buy via WhatsApp">💬</a>
        </div>
        <div class="card-body">
          <div class="card-category">${getCategoryIcon(product.category)} ${getCategoryLabel(product.category)}</div>
          <div class="card-title">${product.name}</div>
          <div class="card-desc">${product.description || ''}</div>
        </div>
        <div class="card-footer">
          <div class="card-price">${formatPrice(product.price)}</div>
          <a href="${waLink}" target="_blank" class="btn btn-whatsapp btn-sm" onclick="event.stopPropagation()">
            💬 Buy
          </a>
        </div>
      </div>
    `;
  }

  init();
})();
