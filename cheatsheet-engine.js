/* ==========================================================================
   CHEATSHEET ENGINE - REUSABLE LIGHTWEIGHT JAVASCRIPT
   Used across SQL, Git, Linux, Python, Google Sheets, Regex, PowerBI, Accounting, Markdown
   ========================================================================== */

function setupCheatsheetPage({ catalog = [], questions = [] }) {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    initSharedTheme();
    initSharedSidebar();
    initSharedCopyButtons();

    if (catalog && catalog.length > 0) {
      initPageLiveSearch(catalog);
      initPageQuickRef(catalog);
    }

    if (questions && questions.length > 0) {
      initPageQuiz(questions);
    }
  });
}

/* 1. Theme Management */
function initSharedTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
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

  applyTheme(getPreferredTheme());

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = htmlEl.getAttribute('data-theme') || 'light';
      applyTheme(activeTheme === 'dark' ? 'light' : 'dark');
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('excel-cheatsheet-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/* 2. Sidebar & Scroll Spy */
function initSharedSidebar() {
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const navLinks = document.querySelectorAll('.sidebar-link');
  const sections = document.querySelectorAll('.content-section');

  const toggleMobileSidebar = (open) => {
    if (sidebar) sidebar.classList.toggle('open', open);
    if (backdrop) backdrop.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      toggleMobileSidebar(!sidebar.classList.contains('open'));
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => toggleMobileSidebar(false));
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 860) {
        toggleMobileSidebar(false);
      }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { root: null, rootMargin: '-20% 0px -70% 0px', threshold: 0 });

  sections.forEach((sec) => observer.observe(sec));
}

/* 3. Copy to Clipboard */
function showToast(message = 'Tersalin ke clipboard!') {
  let toast = document.getElementById('copyToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'copyToast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i data-lucide="check-circle" style="width:18px;height:18px;color:#22c55e;"></i> <span>${message}</span>`;
  if (typeof lucide !== 'undefined') lucide.createIcons();

  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function initSharedCopyButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-copy');
    if (!btn) return;

    const textToCopy = btn.getAttribute('data-copy');
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i data-lucide="check" style="width:14px;height:14px;"></i> <span>Disalin!</span>';
      btn.classList.add('copied');
      if (typeof lucide !== 'undefined') lucide.createIcons();

      showToast(`Tersalin: ${textToCopy.slice(0, 35)}${textToCopy.length > 35 ? '...' : ''}`);

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('copied');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }, 1800);
    }).catch(err => console.error('Copy failed:', err));
  });
}

/* 4. Live Search within Page */
function initPageLiveSearch(catalog) {
  const searchInput = document.getElementById('globalSearchInput');
  const resultsOverlay = document.getElementById('searchResultsOverlay');
  if (!searchInput || !resultsOverlay) return;

  const performSearch = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      resultsOverlay.classList.remove('active');
      resultsOverlay.innerHTML = '';
      return;
    }

    const matches = catalog.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        (item.cat && item.cat.toLowerCase().includes(q)) ||
        (item.syntax && item.syntax.toLowerCase().includes(q))
      );
    });

    if (matches.length === 0) {
      resultsOverlay.innerHTML = `
        <div class="search-no-results">
          <i data-lucide="search-x" style="width:24px;height:24px;margin-bottom:6px;opacity:0.6;"></i>
          <p>Tidak ditemukan dengan kata kunci "<strong>${escapeHtml(query)}</strong>"</p>
        </div>
      `;
    } else {
      resultsOverlay.innerHTML = matches.map((item) => `
        <a href="#${item.section}" class="search-result-item">
          <div class="search-result-main">
            <span class="search-result-name">${escapeHtml(item.name)}</span>
            <span class="search-result-cat">${escapeHtml(item.cat || '')}</span>
          </div>
          <div class="search-result-desc">${escapeHtml(item.desc)}</div>
        </a>
      `).join('');
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
    resultsOverlay.classList.add('active');
  };

  searchInput.addEventListener('input', (e) => performSearch(e.target.value));
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim()) performSearch(searchInput.value);
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !resultsOverlay.contains(e.target)) {
      resultsOverlay.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    if (e.key === 'Escape' && resultsOverlay.classList.contains('active')) {
      resultsOverlay.classList.remove('active');
    }
  });

  resultsOverlay.addEventListener('click', (e) => {
    if (e.target.closest('.search-result-item')) {
      resultsOverlay.classList.remove('active');
      searchInput.value = '';
    }
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* 5. Quick Reference Table */
function initPageQuickRef(catalog) {
  const tableBody = document.getElementById('quickRefTableBody');
  const searchInput = document.getElementById('quickRefSearchInput');
  const categorySelect = document.getElementById('quickRefCatSelect');
  if (!tableBody) return;

  const renderTable = (filterText = '', selectedCategory = 'ALL') => {
    const q = filterText.trim().toLowerCase();
    const filtered = catalog.filter((item) => {
      const matchCat = selectedCategory === 'ALL' || (item.cat && item.cat.toLowerCase() === selectedCategory.toLowerCase());
      const matchText = !q || item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || (item.syntax && item.syntax.toLowerCase().includes(q));
      return matchCat && matchText;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-subtle);">Tidak ada data yang cocok dengan filter.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map((item, idx) => `
      <tr>
        <td class="row-num">${idx + 1}</td>
        <td>
          <a href="#${item.section}" style="font-family: var(--font-mono); font-weight:700; color: var(--excel-primary);">
            ${escapeHtml(item.name)}
          </a>
        </td>
        <td><span class="cell-code" style="font-size:0.75rem;">${escapeHtml(item.cat || '')}</span></td>
        <td style="font-size:0.85rem;">${escapeHtml(item.desc)}</td>
        <td><code style="font-size:0.82rem; color: var(--text-code);">${escapeHtml(item.syntax || '')}</code></td>
        <td style="white-space:nowrap;">
          <button class="btn-copy" data-copy="${escapeHtml(item.example || item.syntax || '')}" title="Salin Contoh">
            <i data-lucide="copy" style="width:13px;height:13px;"></i>
            <span>${escapeHtml(item.example ? (item.example.length > 25 ? item.example.slice(0, 25) + '...' : item.example) : 'Salin')}</span>
          </button>
        </td>
      </tr>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  renderTable();

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderTable(searchInput.value, categorySelect ? categorySelect.value : 'ALL');
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      renderTable(searchInput ? searchInput.value : '', categorySelect.value);
    });
  }
}

/* 6. Quiz Engine */
function initPageQuiz(rawQuestions) {
  const quizListEl = document.getElementById('quizQuestionsList');
  const quizScoreEl = document.getElementById('quizCurrentScore');
  const quizTotalEl = document.getElementById('quizTotalAnswered');
  const quizPercentEl = document.getElementById('quizCurrentPercent');
  const filterBtns = document.querySelectorAll('.quiz-filter-btn');
  const resetBtn = document.getElementById('btnResetQuiz');
  const shuffleBtn = document.getElementById('btnShuffleQuiz');
  const summaryBox = document.getElementById('quizResultSummary');
  const summaryScore = document.getElementById('resultScoreBig');
  const summaryBadge = document.getElementById('resultBadge');
  const summaryDesc = document.getElementById('resultDesc');
  const restartQuizBtn = document.getElementById('btnRestartFromSummary');

  if (!quizListEl) return;

  let questions = [...rawQuestions];
  let userAnswers = {};
  let currentCategory = 'ALL';

  const updateQuizStats = () => {
    let answeredCount = Object.keys(userAnswers).length;
    let correctCount = 0;

    Object.entries(userAnswers).forEach(([qId, selectedIdx]) => {
      const q = questions.find((item) => item.id === parseInt(qId));
      if (q && q.answer === selectedIdx) {
        correctCount++;
      }
    });

    const percent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    if (quizScoreEl) quizScoreEl.textContent = correctCount;
    if (quizTotalEl) quizTotalEl.textContent = answeredCount;
    if (quizPercentEl) quizPercentEl.textContent = `${percent}%`;

    if (answeredCount === questions.length && summaryBox) {
      summaryScore.textContent = `${percent}%`;
      let badgeText = percent >= 80 ? '🏆 Sangat Siap Lolos Tes Kerja!' : (percent >= 60 ? '👍 Pemahaman Baik - Siap Tingkatkan!' : '📖 Perlu Membaca Cheatsheet Kembali');
      let badgeClass = percent >= 80 ? 'success' : (percent >= 60 ? 'info' : 'warning');
      summaryBadge.textContent = badgeText;
      summaryBadge.className = `result-badge ${badgeClass}`;
      summaryDesc.textContent = `Anda berhasil menjawab ${correctCount} dari ${questions.length} pertanyaan dengan benar.`;
      summaryBox.classList.add('show');
      summaryBox.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderQuestions = () => {
    const filtered = questions.filter((q) => {
      return currentCategory === 'ALL' || (q.category && q.category.toLowerCase() === currentCategory.toLowerCase());
    });

    if (filtered.length === 0) {
      quizListEl.innerHTML = '<p style="padding:1.5rem; text-align:center; color:var(--text-subtle);">Tidak ada soal untuk kategori ini.</p>';
      return;
    }

    quizListEl.innerHTML = filtered.map((q, displayIdx) => {
      const isAnswered = userAnswers[q.id] !== undefined;
      const userSelected = userAnswers[q.id];
      const isCorrect = isAnswered && userSelected === q.answer;

      return `
        <div class="quiz-card" id="qcard-${q.id}">
          <div class="quiz-card-meta">
            <span class="question-num-tag">Soal #${displayIdx + 1}</span>
            <span class="question-category-tag">${escapeHtml(q.category || '')}</span>
          </div>
          <div class="question-text">${q.question}</div>
          <div class="options-list">
            ${q.options.map((opt, optIdx) => {
              let optClass = 'option-item';
              if (isAnswered) {
                if (optIdx === q.answer) optClass += ' correct';
                else if (optIdx === userSelected) optClass += ' incorrect';
              }
              const isChecked = userSelected === optIdx ? 'checked' : '';
              const isDisabled = isAnswered ? 'disabled' : '';

              return `
                <label class="${optClass}" data-qid="${q.id}" data-opt="${optIdx}">
                  <input type="radio" name="opt_q_${q.id}" class="option-radio" ${isChecked} ${isDisabled} />
                  <span class="option-label">${opt}</span>
                </label>
              `;
            }).join('')}
          </div>
          <div class="explanation-box ${isAnswered ? 'show' : ''}" id="expl-${q.id}">
            <div class="explanation-header">
              <i data-lucide="${isCorrect ? 'check-circle' : 'info'}" style="width:16px;height:16px;"></i>
              <span>${isCorrect ? 'Jawaban Benar!' : 'Pembahasan Soal:'}</span>
            </div>
            <div>${q.explanation}</div>
          </div>
        </div>
      `;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();

    document.querySelectorAll('.option-item').forEach((item) => {
      item.addEventListener('click', () => {
        const qId = parseInt(item.getAttribute('data-qid'));
        const optIdx = parseInt(item.getAttribute('data-opt'));
        if (userAnswers[qId] !== undefined) return;

        userAnswers[qId] = optIdx;
        updateQuizStats();
        renderQuestions();
      });
    });
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-cat') || 'ALL';
      renderQuestions();
    });
  });

  const resetQuiz = () => {
    userAnswers = {};
    if (summaryBox) summaryBox.classList.remove('show');
    updateQuizStats();
    renderQuestions();
  };

  if (resetBtn) resetBtn.addEventListener('click', resetQuiz);
  if (restartQuizBtn) restartQuizBtn.addEventListener('click', resetQuiz);

  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      questions = [...questions].sort(() => Math.random() - 0.5);
      resetQuiz();
      showToast('Urutan soal berhasil diacak!');
    });
  }

  updateQuizStats();
  renderQuestions();
}

