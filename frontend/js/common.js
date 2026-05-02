/**
 * Bapi Digital - Common Site Logic
 * Handles global settings and shared UI behavior
 */
async function applyGlobalSettings() {
  try {
    const settings = await API.getSiteSettings();
    if (!settings) return;

    const root = document.documentElement;
    
    // Apply Colors
    if (settings.colorPrimary) root.style.setProperty('--primary', settings.colorPrimary);
    if (settings.colorBgPrimary) root.style.setProperty('--bg-primary', settings.colorBgPrimary);
    if (settings.colorTextPrimary) root.style.setProperty('--text-primary', settings.colorTextPrimary);
    
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

// Initialize global settings on every page load
document.addEventListener('DOMContentLoaded', applyGlobalSettings);
