/**
 * Bapi Digital - Product Detail Page
 */
(function () {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) { showError(); return; }

  const mainImage = document.getElementById('mainImage');
  const galleryThumbs = document.getElementById('galleryThumbs');

  async function init() {
    try {
      const [product, waNumber] = await Promise.all([
        API.getProduct(productId),
        API.getWhatsAppNumber(),
      ]);

      document.title = `${product.name} — Bapi Digital`;
      document.getElementById('loadingState').style.display = 'none';
      document.getElementById('productDetail').style.display = 'grid';

      // Fill details
      document.getElementById('detailName').textContent = product.name;
      document.getElementById('detailPrice').innerHTML = `<span class="currency">₹</span>${Math.round(product.price).toLocaleString('en-IN')}`;
      document.getElementById('detailDesc').textContent = product.description || 'No description available.';
      document.getElementById('detailCategory').textContent = `${getCategoryIcon(product.category)} ${getCategoryLabel(product.category)}`;
      document.getElementById('breadcrumbCategory').textContent = getCategoryLabel(product.category);
      document.getElementById('metaCategory').textContent = getCategoryLabel(product.category);
      document.getElementById('metaDate').textContent = product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';

      // Images
      const images = product.images && product.images.length > 0 ? product.images : [getPlaceholderImage()];
      mainImage.src = images[0];
      mainImage.alt = product.name;

      if (images.length > 1) {
        galleryThumbs.innerHTML = images.map((img, i) =>
          `<div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="switchImage('${img.replace(/'/g, "\\'")}', this)">
            <img src="${img}" alt="Thumbnail ${i + 1}">
          </div>`
        ).join('');
      }

      // WhatsApp link
      const waLink = getWhatsAppLink(waNumber, product.name, product.price);
      document.getElementById('buyNowBtn').href = waLink;

    } catch (err) {
      showError();
    }
  }

  function showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
  }

  // Expose functions globally
  window.switchImage = function (src, thumb) {
    mainImage.src = src;
    galleryThumbs.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
  };

  window.openZoom = function () {
    document.getElementById('zoomImage').src = mainImage.src;
    document.getElementById('zoomOverlay').classList.add('active');
  };

  window.closeZoom = function () {
    document.getElementById('zoomOverlay').classList.remove('active');
  };

  // Mobile nav
  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });

  // ESC to close zoom
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeZoom();
  });

  init();
})();
