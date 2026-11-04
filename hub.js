/* ==========================================================================
   CHEATSHEET HUB - INTERACTIVE PORTAL SCRIPT
   Category Filter, Live Search Cards, Shared Theme Management
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  initHubTheme();
  initHubSearchAndFilter();
});

function initHubTheme() {
  const themeToggleBtn = document.getElementById('hubThemeToggleBtn');
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  const htmlEl = document.documentElement;

  const getPreferredTheme = () => {
    const saved = localStorage.getItem('excel-cheatsheet-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const applyTheme = (theme) => {
    htmlEl.setAttribute('data-theme', theme);
    if (metaColorScheme) {
      metaColorScheme.content = theme;
    }
    localStorage.setItem('excel-cheatsheet-theme', theme);
    updateThemeIcon(theme);
  };

  const updateThemeIcon = (theme) => {
    if (!themeToggleBtn) return;
    const isDark = theme === 'dark';
    themeToggleBtn.innerHTML = isDark
      ? '<i data-lucide="sun" class="nav-icon"></i>'
      : '<i data-lucide="moon" class="nav-icon"></i>';
    themeToggleBtn.setAttribute('aria-label', isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap');
    themeToggleBtn.setAttribute('title', isDark ? 'Mode Terang' : 'Mode Gelap');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  const currentTheme = getPreferredTheme();
  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = htmlEl.getAttribute('data-theme') || 'light';
      const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('excel-cheatsheet-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function initHubSearchAndFilter() {
  const searchInput = document.getElementById('hubSearchInput');
  const filterBtns = document.querySelectorAll('.hub-filter-btn');
  const cards = document.querySelectorAll('.hub-card');
  const countBadge = document.getElementById('hubVisibleCount');

  let activeCategory = 'ALL';
  let searchQuery = '';

  const updateFilter = () => {
    let visibleCount = 0;
    const q = searchQuery.toLowerCase().trim();

    cards.forEach((card) => {
      const cat = card.getAttribute('data-category') || '';
      const title = card.querySelector('.hub-card-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.hub-card-desc')?.textContent.toLowerCase() || '';
      const tags = Array.from(card.querySelectorAll('.hub-tag')).map(t => t.textContent.toLowerCase()).join(' ');

      const matchCategory = activeCategory === 'ALL' || cat.toLowerCase().includes(activeCategory.toLowerCase());
      const matchSearch = !q || title.includes(q) || desc.includes(q) || tags.includes(q);

      if (matchCategory && matchSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (countBadge) {
      countBadge.textContent = `${visibleCount} Cheatsheet Tersedia`;
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      updateFilter();
    });

    // Ctrl+K shortcut to focus search
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter') || 'ALL';
      updateFilter();
    });
  });

  updateFilter();
}

