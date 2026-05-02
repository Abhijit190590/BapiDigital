/**
 * Bapi Digital - Admin Dashboard Logic
 */
(function () {
  // Guard: redirect if not logged in
  if (!API.isLoggedIn()) { window.location.href = 'login.html'; return; }

  let allProducts = [];
  let uploadedImages = [];
  let deleteTargetId = null;

  // Init
  async function init() {
    setupNav();
    await loadDashboard();
  }

  function setupNav() {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(link.dataset.section);
      });
    });
  }

  // Expose showSection globally
  window.showSection = function (section) {
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.getElementById(`sec-${section}`).style.display = 'block';
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-nav a[data-section="${section}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');

    if (section === 'products') loadProducts();
    if (section === 'dashboard') loadDashboard();
    if (section === 'categories') loadCategories();
    if (section === 'whatsapp') loadWhatsApp();
    if (section === 'customize') loadSettings();
    if (section === 'gallery') loadGallery();
    if (section === 'addProduct') {
      loadCategoryDropdown();
      document.getElementById('productFormTitle').innerHTML = '➕ <span class="highlight">Add Product</span>';
    }
  };


  async function loadDashboard() {
    try {
      const stats = await API.getStats();
      document.getElementById('statProducts').textContent = stats.totalProducts;
      document.getElementById('statWhatsApp').textContent = '+' + stats.whatsappNumber;
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function loadProducts(query = '') {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;">Loading...</td></tr>';
    try {
      let products;
      if (query) {
        products = await API.searchProducts(query);
      } else {
        const response = await API.getProducts();
        products = response.content || response;
      }
      
      allProducts = products;
      if (!allProducts || allProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted);">No products found.</td></tr>';
        return;
      }
      tbody.innerHTML = allProducts.map(p => {
        const img = p.images && p.images.length > 0 ? p.images[0] : getPlaceholderImage();
        const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : 'N/A';
        return `<tr>
          <td><div class="product-cell"><img src="${img}" class="product-thumb" alt="${p.name}"><span>${p.name}</span></div></td>
          <td>${getCategoryLabel(p.category)}</td>
          <td style="color:var(--accent);font-weight:600;">${formatPrice(p.price)}</td>
          <td>${date}</td>
          <td><div class="actions">
            <button class="action-btn edit" onclick="editProduct('${p.id}')" title="Edit">✏️</button>
            <button class="action-btn delete" onclick="openDeleteModal('${p.id}', '${p.name.replace(/'/g, "\\'")}')" title="Delete">🗑️</button>
          </div></td>
        </tr>`;
      }).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--danger);">${err.message}</td></tr>`;
    }
  }

  window.adminSearchProducts = async function() {
    const query = document.getElementById('adminProductSearch').value.trim();
    await loadProducts(query);
  };

  async function loadWhatsApp() {
    try {
      const number = await API.getWhatsAppNumber();
      document.getElementById('waNumber').value = number;
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function loadSettings() {
    try {
      const settings = await API.getSiteSettings();
      
      // Colors
      document.getElementById('colorPrimary').value = settings.colorPrimary || '#6366f1';
      document.getElementById('colorBgPrimary').value = settings.colorBgPrimary || '#fcfcfd';
      document.getElementById('colorTextPrimary').value = settings.colorTextPrimary || '#1e293b';
      
      // Content
      document.getElementById('siteHeroTitle').value = settings.heroTitle || '';
      document.getElementById('siteHeroDesc').value = settings.heroDesc || '';
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function loadGallery() {
    const grid = document.getElementById('adminGalleryGrid');
    grid.innerHTML = 'Loading gallery...';
    try {
      const images = await API.getGallery();
      grid.innerHTML = images.map(img => `
        <div class="product-card" style="padding: 10px;">
          <img src="${img.imageUrl}" style="width:100%; aspect-ratio:1; object-fit:cover; border-radius:var(--radius-md);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
            <span style="font-size:0.8rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${img.caption || 'No caption'}</span>
            <button class="btn btn-danger btn-sm" onclick="deleteGalleryImage('${img.id}')">🗑️</button>
          </div>
        </div>
      `).join('');
    } catch (err) {
      grid.innerHTML = 'Error loading gallery: ' + err.message;
    }
  }

  window.uploadGalleryImage = async function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const base64 = await fileToBase64(file);
      await API.uploadGalleryImage({ imageUrl: base64, caption: 'Gallery Image' });
      showToast('Image uploaded to gallery!');
      loadGallery();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  window.deleteGalleryImage = async function(id) {
    if (!confirm('Delete this image from gallery?')) return;
    try {
      await API.deleteGalleryImage(id);
      showToast('Image deleted!');
      loadGallery();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  async function loadCategories() {
    const tbody = document.getElementById('categoriesTableBody');
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:40px;">Loading...</td></tr>';
    try {
      const categories = await API.getCategories();
      if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:40px;color:var(--text-muted);">No categories yet.</td></tr>';
        return;
      }
      tbody.innerHTML = categories.map(c => `
        <tr>
          <td>${c.icon || '📦'}</td>
          <td>${c.name}</td>
          <td><button class="action-btn delete" onclick="deleteCategory('${c.id}')" title="Delete">🗑️</button></td>
        </tr>
      `).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:40px;color:var(--danger);">${err.message}</td></tr>`;
    }
  }

  window.saveCategory = async function () {
    const name = document.getElementById('catName').value.trim();
    const icon = document.getElementById('catIcon').value.trim();
    if (!name) { showToast('Category name is required', 'error'); return; }
    try {
      await API.createCategory({ name, icon });
      showToast('Category added!');
      document.getElementById('catName').value = '';
      document.getElementById('catIcon').value = '';
      loadCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  window.deleteCategory = async function (id) {
    if (!confirm('Delete this category? Products in this category will remain but lose the category link.')) return;
    try {
      await API.deleteCategory(id);
      showToast('Category deleted!');
      loadCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  async function loadCategoryDropdown() {
    const select = document.getElementById('prodCategory');
    try {
      const categories = await API.getCategories();
      select.innerHTML = categories.map(c => `<option value="${c.name}">${c.icon || '📦'} ${c.name}</option>`).join('');
      if (categories.length === 0) {
        select.innerHTML = '<option value="">No categories available</option>';
      }
    } catch (err) {
      console.error('Error loading categories for dropdown:', err);
    }
  }

  window.saveWhatsApp = async function () {
    const number = document.getElementById('waNumber').value.trim();
    if (!number) { showToast('Please enter a phone number', 'error'); return; }
    try {
      await API.updateWhatsAppNumber(number);
      showToast('WhatsApp number updated!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };



  window.saveSettings = async function () {
    const settings = {
      colorPrimary: document.getElementById('colorPrimary').value,
      colorBgPrimary: document.getElementById('colorBgPrimary').value,
      colorTextPrimary: document.getElementById('colorTextPrimary').value,
      heroTitle: document.getElementById('siteHeroTitle').value,
      heroDesc: document.getElementById('siteHeroDesc').value,
    };

    try {
      await API.updateSiteSettings(settings);
      showToast('Site settings updated successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Image Upload

  window.handleImageUpload = async function (event) {
    const files = Array.from(event.target.files);
    if (uploadedImages.length + files.length > 5) {
      showToast('Maximum 5 images allowed', 'warning');
      return;
    }
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { showToast(`${file.name} is too large (max 10MB)`, 'error'); continue; }
      const base64 = await fileToBase64(file);
      uploadedImages.push(base64);
    }
    renderImagePreviews();
    event.target.value = '';
  };

  function renderImagePreviews() {
    const container = document.getElementById('imagePreviews');
    container.innerHTML = uploadedImages.map((img, i) =>
      `<div class="image-preview">
        <img src="${img}" alt="Preview">
        <div class="remove-img" onclick="removeImage(${i})">✕</div>
      </div>`
    ).join('');
  }

  window.removeImage = function (index) {
    uploadedImages.splice(index, 1);
    renderImagePreviews();
  };

  // Save Product
  window.saveProduct = async function () {
    const btn = event?.target?.closest('button') || document.querySelector('#sec-addProduct .btn-primary');
    const id = document.getElementById('editProductId').value;
    const name = document.getElementById('prodName').value.trim();
    const price = parseFloat(document.getElementById('prodPrice').value);
    const category = document.getElementById('prodCategory').value;
    const description = document.getElementById('prodDesc').value.trim();

    if (!name) { showToast('Product name is required', 'error'); return; }
    if (!price || price <= 0) { showToast('Valid price is required', 'error'); return; }

    const product = { name, price, category, description };
    if (uploadedImages.length > 0) product.images = uploadedImages;

    try {
      if (btn) btn.classList.add('btn-loading');
      if (id) {
        await API.updateProduct(id, product);
        showToast('Product updated successfully!');
      } else {
        if (uploadedImages.length === 0) { 
          showToast('Please upload at least one image', 'error'); 
          if (btn) btn.classList.remove('btn-loading');
          return; 
        }
        await API.createProduct(product);
        showToast('Product created successfully!');
      }
      resetForm();
      showSection('products');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      if (btn) btn.classList.remove('btn-loading');
    }
  };


  // Edit Product
    window.editProduct = async function (id) {
      const product = allProducts.find(p => p.id === id);
      if (!product) return;
  
      await loadCategoryDropdown();
      document.getElementById('editProductId').value = id;
      document.getElementById('prodName').value = product.name;
      document.getElementById('prodPrice').value = product.price;
      document.getElementById('prodCategory').value = product.category;
      document.getElementById('prodDesc').value = product.description || '';
      uploadedImages = product.images || [];
      renderImagePreviews();
  
      document.getElementById('productFormTitle').innerHTML = '✏️ <span class="highlight">Edit Product</span>';
      showSection('addProduct');
    };

  // Delete Product
  window.openDeleteModal = function (id, name) {
    deleteTargetId = id;
    document.getElementById('deleteProductName').textContent = name;
    document.getElementById('deleteModal').classList.add('active');
  };

  window.closeDeleteModal = function () {
    document.getElementById('deleteModal').classList.remove('active');
    deleteTargetId = null;
  };

  window.confirmDelete = async function () {
    if (!deleteTargetId) return;
    try {
      await API.deleteProduct(deleteTargetId);
      showToast('Product deleted!');
      closeDeleteModal();
      loadProducts();
      loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Reset Form
  window.resetForm = function () {
    document.getElementById('editProductId').value = '';
    document.getElementById('prodName').value = '';
    document.getElementById('prodPrice').value = '';
    document.getElementById('prodCategory').value = 'CLOTHES';
    document.getElementById('prodDesc').value = '';
    uploadedImages = [];
    document.getElementById('imagePreviews').innerHTML = '';
  };

  init();
})();
