/* ==========================================================================
   CHEATSHEET HUB - INTERACTIVE PORTAL SCRIPT
   Category Filter, Live Search Cards, Shared Theme Management & Favorites (Love/Bintang)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  initHubTheme();
  initHubSearchAndFilter();
  initHubFavorites();
});

/* Toast Notification Helper */
function showHubToast(message, isStarred = true) {
  let toast = document.getElementById('hubToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'hubToast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  const icon = isStarred ? '⭐' : '🗑️';
  toast.innerHTML = `<span style="font-size:1.15rem;">${icon}</span> <span>${message}</span>`;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

/* 1. Theme Management */
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

/* 2. Search & Category Filters */
function initHubSearchAndFilter() {
  const searchInput = document.getElementById('hubSearchInput');
  const filterBtns = document.querySelectorAll('.hub-filter-btn');
  const cards = document.querySelectorAll('.hub-card');
  const countBadge = document.getElementById('hubVisibleCount');
  const emptyState = document.getElementById('hubEmptyState');

  let activeCategory = 'ALL';
  let searchQuery = '';

  const FAV_STORAGE_KEY = 'cheatsheet_hub_favorites';
  const getFavs = () => {
    try {
      return JSON.parse(localStorage.getItem(FAV_STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  };

  const updateFilter = () => {
    let visibleCount = 0;
    const q = searchQuery.toLowerCase().trim();
    const favs = getFavs();

    cards.forEach((card) => {
      const cat = card.getAttribute('data-category') || '';
      const id = card.getAttribute('data-id') || card.getAttribute('href').replace('.html', '');
      const title = card.querySelector('.hub-card-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.hub-card-desc')?.textContent.toLowerCase() || '';
      const tags = Array.from(card.querySelectorAll('.hub-tag')).map(t => t.textContent.toLowerCase()).join(' ');

      const isFav = favs.includes(id);
      let matchCategory = false;

      if (activeCategory === 'ALL') {
        matchCategory = true;
      } else if (activeCategory === 'FAVORITE') {
        matchCategory = isFav;
      } else {
        matchCategory = cat.toLowerCase().includes(activeCategory.toLowerCase());
      }

      const matchSearch = !q || title.includes(q) || desc.includes(q) || tags.includes(q);

      if (matchCategory && matchSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (countBadge) {
      if (activeCategory === 'FAVORITE') {
        countBadge.textContent = `${visibleCount} Materi Favorit`;
      } else {
        countBadge.textContent = `${visibleCount} Cheatsheet Tersedia`;
      }
    }

    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.style.display = 'block';
        const titleEl = emptyState.querySelector('h3');
        const descEl = emptyState.querySelector('p');
        if (activeCategory === 'FAVORITE') {
          if (titleEl) titleEl.textContent = 'Belum Ada Materi Bertanda Bintang / Love';
          if (descEl) descEl.textContent = 'Klik ikon bintang ⭐ atau love di sudut kanan atas kartu materi mana saja untuk menyimpannya ke koleksi favorit Anda.';
        } else {
          if (titleEl) titleEl.textContent = 'Tidak Ada Materi yang Cocok';
          if (descEl) descEl.textContent = `Pencarian "${q}" tidak menemukan cheatsheet yang sesuai. Silakan coba kata kunci lain.`;
        }
      } else {
        emptyState.style.display = 'none';
      }
    }
  };

  window.triggerHubFilter = updateFilter;

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      updateFilter();
    });

    // Ctrl+K / Cmd+K shortcut to focus search
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

/* 3. Favorites (Love / Bintang) System */
function initHubFavorites() {
  const cards = document.querySelectorAll('.hub-card');
  const favCountEl = document.getElementById('hubFavCount');
  const resetBtn = document.getElementById('btnResetFilterAll');

  const FAV_STORAGE_KEY = 'cheatsheet_hub_favorites';

  const getFavorites = () => {
    const saved = localStorage.getItem(FAV_STORAGE_KEY);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Default seed 4 topik populer pada kunjungan pertama
    const defaultFavorites = ['excel', 'sql', 'typescript', 'git'];
    localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(defaultFavorites));
    return defaultFavorites;
  };

  let favorites = getFavorites();

  const updateFavUI = () => {
    cards.forEach((card) => {
      const id = card.getAttribute('data-id') || card.getAttribute('href').replace('.html', '');
      const btn = card.querySelector('.hub-fav-btn');
      const isFav = favorites.includes(id);

      card.classList.toggle('is-favorited', isFav);
      if (btn) {
        btn.classList.toggle('is-favorited', isFav);
        btn.setAttribute('title', isFav ? 'Hapus dari Materi Favorit (⭐)' : 'Simpan ke Materi Favorit (⭐)');
      }
    });

    if (favCountEl) {
      favCountEl.textContent = favorites.length;
    }
  };

  // Bind clicks
  cards.forEach((card) => {
    const id = card.getAttribute('data-id') || card.getAttribute('href').replace('.html', '');
    let btn = card.querySelector('.hub-fav-btn');

    if (!btn) {
      const header = card.querySelector('.hub-card-header');
      if (header) {
        btn = document.createElement('button');
        btn.className = 'hub-fav-btn';
        btn.setAttribute('data-fav-id', id);
        btn.setAttribute('aria-label', 'Favoritkan');
        btn.setAttribute('title', 'Simpan ke Favorit (Bintang / Love)');
        btn.innerHTML = '<i data-lucide="star"></i>';
        header.appendChild(btn);
      }
    }

    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const title = card.querySelector('.hub-card-title')?.textContent || 'Materi';
        if (favorites.includes(id)) {
          favorites = favorites.filter((favId) => favId !== id);
          showHubToast(`${title} dihapus dari Favorit`, false);
        } else {
          favorites.push(id);
          showHubToast(`${title} ditambahkan ke Favorit ⭐`, true);
        }

        localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favorites));
        updateFavUI();

        // Refresh filter if on FAVORITE tab
        if (window.triggerHubFilter) {
          window.triggerHubFilter();
        }

        if (typeof lucide !== 'undefined') lucide.createIcons();
      });
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const allBtn = document.querySelector('.hub-filter-btn[data-filter="ALL"]');
      if (allBtn) allBtn.click();
    });
  }

  updateFavUI();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}
