/* ==========================================================================
   CHEATSHEET ENGINE - REUSABLE LIGHTWEIGHT JAVASCRIPT
   Shared Engine for Theme, Sidebar, Copy Toast, Search, Favorites & Quiz
   ========================================================================== */

function setupCheatsheetPage({ catalog = [], questions = [] }) {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    initSharedTheme();
    initSharedSidebar();
    initSharedCopyButtons();
    initFormulaFavorites();

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
  const sidebar = document.getElementById('appSidebar') || document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const navLinks = document.querySelectorAll('.sidebar-link, .sidebar-nav .nav-item');
  const sections = document.querySelectorAll('.content-section, .category-section');

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

/* 3. Copy to Clipboard & Toast */
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
    const btn = e.target.closest('.btn-copy, .copy-btn');
    if (!btn) return;

    let textToCopy = btn.getAttribute('data-copy') || btn.getAttribute('data-clipboard');
    if (!textToCopy) {
      const codeBlock = btn.closest('.formula-syntax, .syntax-block, .example-block, .code-wrapper')?.querySelector('code');
      if (codeBlock) {
        textToCopy = codeBlock.textContent.trim();
      }
    }

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Rumus / Kode tersalin ke clipboard!');
        const origHtml = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="check" style="width:14px;height:14px;color:#22c55e;"></i> <span>Disalin!</span>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        setTimeout(() => {
          btn.innerHTML = origHtml;
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 1800);
      }).catch(() => {
        showToast('Gagal menyalin. Silakan salin manual.');
      });
    }
  });

  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/* 4. Formula Favorites (Love / Bintang) System */
function initFormulaFavorites() {
  const cards = document.querySelectorAll('.formula-card');
  if (cards.length === 0) return;

  const pagePath = window.location.pathname.split('/').pop().replace('.html', '') || 'general';
  const storageKey = `fav_formulas_${pagePath}`;
  let favorites = [];
  try {
    favorites = JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch (e) {
    favorites = [];
  }

  let favFilterActive = false;
  const headerRight = document.querySelector('.header-right');
  let toggleBtn = document.getElementById('favFormulaFilterBtn');

  if (headerRight && !toggleBtn) {
    toggleBtn = document.createElement('button');
    toggleBtn.id = 'favFormulaFilterBtn';
    toggleBtn.className = 'btn-icon';
    toggleBtn.style.position = 'relative';
    toggleBtn.setAttribute('title', 'Tampilkan Hanya Rumus Favorit (Bintang)');
    toggleBtn.setAttribute('aria-label', 'Filter Rumus Favorit');
    toggleBtn.innerHTML = `
      <i data-lucide="star" class="nav-icon"></i>
      <span class="fav-badge-count" id="pageFavBadge">${favorites.length}</span>
    `;
    headerRight.insertBefore(toggleBtn, headerRight.firstChild);
  }

  const updateBadge = () => {
    const badge = document.getElementById('pageFavBadge');
    if (badge) badge.textContent = favorites.length;
    if (toggleBtn) {
      if (favFilterActive) {
        toggleBtn.classList.add('active');
        toggleBtn.style.color = '#f59e0b';
      } else {
        toggleBtn.classList.remove('active');
        toggleBtn.style.color = '';
      }
    }
  };

  cards.forEach((card, index) => {
    const header = card.querySelector('.card-header') || card.querySelector('.formula-card-header');
    const nameEl = card.querySelector('.formula-name') || card.querySelector('h3');
    const formulaId = nameEl ? nameEl.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : `item-${index}`;

    card.setAttribute('data-formula-id', formulaId);

    if (header && !header.querySelector('.card-fav-btn')) {
      const favBtn = document.createElement('button');
      favBtn.className = 'card-fav-btn';
      favBtn.setAttribute('type', 'button');
      favBtn.setAttribute('title', 'Tandai Favorit (Bintang / Love)');
      favBtn.setAttribute('aria-label', 'Favoritkan Rumus Ini');
      favBtn.innerHTML = `<i data-lucide="star" style="width:15px;height:15px;"></i>`;

      if (favorites.includes(formulaId)) {
        favBtn.classList.add('is-favorited');
        card.classList.add('is-favorited');
      }

      favBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isFav = favorites.includes(formulaId);
        if (isFav) {
          favorites = favorites.filter(id => id !== formulaId);
          favBtn.classList.remove('is-favorited');
          card.classList.remove('is-favorited');
          showToast('Rumus dihapus dari Favorit');
        } else {
          favorites.push(formulaId);
          favBtn.classList.add('is-favorited');
          card.classList.add('is-favorited');
          showToast('Rumus ditambahkan ke Favorit ⭐');
        }

        try {
          localStorage.setItem(storageKey, JSON.stringify(favorites));
        } catch (err) {}

        updateBadge();

        if (favFilterActive) {
          applyFavFilter();
        }

        if (typeof lucide !== 'undefined') lucide.createIcons();
      });

      header.appendChild(favBtn);
    }
  });

  const applyFavFilter = () => {
    cards.forEach(card => {
      const formulaId = card.getAttribute('data-formula-id');
      const isFav = favorites.includes(formulaId);
      if (favFilterActive) {
        card.style.display = isFav ? 'flex' : 'none';
      } else {
        card.style.display = '';
      }
    });

    // Check categories
    document.querySelectorAll('.category-section, .content-section').forEach(sec => {
      if (favFilterActive) {
        const hasVisible = Array.from(sec.querySelectorAll('.formula-card')).some(c => c.style.display !== 'none');
        sec.style.display = hasVisible ? '' : 'none';
      } else {
        sec.style.display = '';
      }
    });
  };

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      favFilterActive = !favFilterActive;
      applyFavFilter();
      updateBadge();
      showToast(favFilterActive ? 'Menampilkan rumus bertanda bintang ⭐' : 'Menampilkan semua rumus');
    });
  }

  updateBadge();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* 5. Live Search for Sub-pages */
function initPageLiveSearch(catalog) {
  const searchInput = document.getElementById('cheatsheetSearch') || document.getElementById('searchRumus');
  if (!searchInput) return;

  const cards = document.querySelectorAll('.formula-card');
  const sections = document.querySelectorAll('.category-section, .content-section');

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    sections.forEach((sec) => {
      if (sec.id === 'practice-questions' || sec.id === 'quiz-section' || sec.id === 'quick-reference') return;
      const visible = sec.querySelectorAll('.formula-card[style*="display: flex"], .formula-card:not([style*="display: none"])');
      const hasVisible = Array.from(sec.querySelectorAll('.formula-card')).some(c => c.style.display !== 'none');
      sec.style.display = !q || hasVisible ? '' : 'none';
    });
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
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

/* 6. Quick Reference Table */
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

/* 7. Quiz Engine (List Format) */
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

/* 8. Stepper Quiz Engine (for TypeScript, K8s, Figma, Security, Postman, etc.) */
function initStepperQuiz(quizData) {
  const cardEl = document.getElementById('quizCard');
  const questionEl = document.getElementById('quizQuestion');
  const optionsEl = document.getElementById('quizOptions');
  const feedbackEl = document.getElementById('quizFeedback');
  const nextBtn = document.getElementById('quizNextBtn');
  const progressEl = document.getElementById('quizProgress');
  const scoreEl = document.getElementById('quizScore');
  const resultEl = document.getElementById('quizResult');
  const finalScoreEl = document.getElementById('quizFinalScore');
  const summaryTextEl = document.getElementById('quizSummaryText');
  const restartBtn = document.getElementById('quizRestartBtn');

  if (!cardEl || !questionEl || !optionsEl || !quizData || quizData.length === 0) return;

  let currentIdx = 0;
  let score = 0;
  let isAnswered = false;

  const renderCurrentQuestion = () => {
    isAnswered = false;
    const current = quizData[currentIdx];

    if (progressEl) progressEl.textContent = `Pertanyaan ${currentIdx + 1} dari ${quizData.length}`;
    if (scoreEl) scoreEl.textContent = `Skor: ${score}`;
    if (questionEl) questionEl.innerHTML = current.question;

    if (feedbackEl) {
      feedbackEl.style.display = 'none';
      feedbackEl.innerHTML = '';
      feedbackEl.className = 'quiz-feedback';
    }

    if (nextBtn) nextBtn.style.display = 'none';

    if (optionsEl) {
      optionsEl.innerHTML = current.options.map((opt, idx) => `
        <button class="quiz-option" data-idx="${idx}">${opt}</button>
      `).join('');

      optionsEl.querySelectorAll('.quiz-option').forEach((btn) => {
        btn.addEventListener('click', () => handleOptionClick(parseInt(btn.getAttribute('data-idx'))));
      });
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  const handleOptionClick = (selectedIdx) => {
    if (isAnswered) return;
    isAnswered = true;

    const current = quizData[currentIdx];
    const isCorrect = selectedIdx === current.answer;
    const allOptions = optionsEl.querySelectorAll('.quiz-option');

    allOptions.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === current.answer) {
        btn.classList.add('correct');
      } else if (idx === selectedIdx) {
        btn.classList.add('incorrect');
      }
    });

    if (isCorrect) score++;
    if (scoreEl) scoreEl.textContent = `Skor: ${score}`;

    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      feedbackEl.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
      feedbackEl.innerHTML = `
        <div style="font-weight:700; margin-bottom:0.35rem;">${isCorrect ? '✅ Jawaban Benar!' : '❌ Jawaban Kurang Tepat'}</div>
        <div>${current.explanation}</div>
      `;
    }

    if (nextBtn) {
      nextBtn.style.display = 'inline-flex';
      nextBtn.innerHTML = currentIdx === quizData.length - 1 ? 'Lihat Hasil Akhir 🎉' : 'Lanjut <i data-lucide="arrow-right" style="width:16px;height:16px;"></i>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIdx < quizData.length - 1) {
        currentIdx++;
        renderCurrentQuestion();
      } else {
        // Show result
        if (cardEl) cardEl.style.display = 'none';
        if (resultEl) {
          resultEl.style.display = 'block';
          if (finalScoreEl) finalScoreEl.textContent = `Skor Akhir Anda: ${score} / ${quizData.length}`;
          const pct = Math.round((score / quizData.length) * 100);
          let summary = pct >= 80 ? 'Luar biasa! Pemahaman Anda sangat matang untuk tes teknis.' : (pct >= 60 ? 'Bagus! Sedikit lagi review materi agar skor Anda sempurna.' : 'Perlu memperdalam cheatsheet kembali sebelum menghadapi tes teknis.');
          if (summaryTextEl) summaryTextEl.textContent = `${summary} (Akurasi: ${pct}%)`;
        }
      }
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      currentIdx = 0;
      score = 0;
      if (resultEl) resultEl.style.display = 'none';
      if (cardEl) cardEl.style.display = 'block';
      renderCurrentQuestion();
    });
  }

  renderCurrentQuestion();
}

/* 9. Global CheatsheetEngine Object */
window.CheatsheetEngine = {
  init: function(opts = {}) {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    initSharedTheme();
    initSharedSidebar();
    initSharedCopyButtons();
    initFormulaFavorites();
    initPageLiveSearch();

    if (opts.quizData && opts.quizData.length > 0) {
      initStepperQuiz(opts.quizData);
    }
  }
};
