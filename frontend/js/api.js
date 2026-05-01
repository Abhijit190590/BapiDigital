/**
 * Bapi Digital - API Service Layer
 * Centralizes all backend communication
 */
const API = (() => {
  const BASE_URL = 'https://bapidigital.onrender.com/api';

  function getToken() {
    return localStorage.getItem('bapi_token');
  }

  function setToken(token) {
    localStorage.setItem('bapi_token', token);
  }

  function clearToken() {
    localStorage.removeItem('bapi_token');
    localStorage.removeItem('bapi_user');
  }

  function isLoggedIn() {
    return !!getToken();
  }

  async function request(url, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });
      if (res.status === 401) {
        clearToken();
        if (window.location.pathname.includes('admin') && !window.location.pathname.includes('login')) {
          window.location.href = 'login.html';
        }
        throw new Error('Unauthorized');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  }

  // Auth
  async function login(username, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
    localStorage.setItem('bapi_user', JSON.stringify({ username: data.username, role: data.role }));
    return data;
  }

  function logout() {
    clearToken();
    window.location.href = 'login.html';
  }

  // Products (Public)
  async function getProducts() { return request('/products'); }
  async function getProduct(id) { return request(`/products/${id}`); }
  async function searchProducts(query) { return request(`/products/search?q=${encodeURIComponent(query)}`); }
  async function getProductsByCategory(category) { return request(`/products/category/${category}`); }
  async function getRecentProducts() { return request('/products/recent'); }

  // Products (Admin)
  async function createProduct(product) {
    return request('/admin/products', { method: 'POST', body: JSON.stringify(product) });
  }
  async function updateProduct(id, product) {
    return request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(product) });
  }
  async function deleteProduct(id) {
    return request(`/admin/products/${id}`, { method: 'DELETE' });
  }

  // Config
  async function getWhatsAppNumber() {
    const data = await request('/config/whatsapp');
    return data.whatsappNumber;
  }
  async function updateWhatsAppNumber(number) {
    return request('/admin/config/whatsapp', {
      method: 'PUT',
      body: JSON.stringify({ whatsappNumber: number }),
    });
  }

  // Admin Stats
  async function getStats() { return request('/admin/stats'); }

  return {
    login, logout, isLoggedIn, getToken, clearToken,
    getProducts, getProduct, searchProducts, getProductsByCategory, getRecentProducts,
    createProduct, updateProduct, deleteProduct,
    getWhatsAppNumber, updateWhatsAppNumber,
    getStats,
  };
})();

// ========== Utility Functions ==========
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3500);
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
}

function getWhatsAppLink(number, productName, price) {
  const message = `Hello, I want to buy ${productName} for ${formatPrice(price)}. Please provide details.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function createSkeletonCards(count = 8) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `<div class="skeleton-card"><div class="skeleton skeleton-image"></div><div class="skeleton-body"><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line"></div></div></div>`;
  }
  return html;
}

function getPlaceholderImage() {
  return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="%2316213E"><rect width="400" height="400"/><text x="50%" y="50%" font-family="sans-serif" font-size="18" fill="%236C6C8A" text-anchor="middle" dy=".3em">No Image</text></svg>');
}

function getCategoryIcon(category) {
  const icons = { 'CLOTHES': '👕', 'PHOTOS': '📸', 'STUDIO_ITEMS': '🎬' };
  return icons[category] || '📦';
}

function getCategoryLabel(category) {
  const labels = { 'CLOTHES': 'Clothes', 'PHOTOS': 'Photo Prints', 'STUDIO_ITEMS': 'Studio Items' };
  return labels[category] || category;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
