/* ==========================================================================
   EXCEL CHEATSHEET - INTERACTIVE JAVASCRIPT ENGINE
   Theme Toggle, Live Search, Copy to Clipboard, ScrollSpy, Quiz Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  initThemeToggle();
  initSidebar();
  initCopyButtons();
  initLiveSearch();
  initQuickReferenceTable();
  initQuiz();
  initFormulaFavorites('excel');
});

/* ==========================================================================
   1. Theme Management (Light / Dark Mode)
   Following Modern Web Guidance: respects meta color-scheme & localStorage
   ========================================================================== */

function initThemeToggle() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  const htmlEl = document.documentElement;

  // Determine current theme
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

  // Initial load
  const currentTheme = getPreferredTheme();
  applyTheme(currentTheme);

  // Toggle button event
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = htmlEl.getAttribute('data-theme') || 'light';
      const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  }

  // Listen to OS scheme changes if no manual override stored
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('excel-cheatsheet-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/* ==========================================================================
   2. Sidebar & Scroll Spy Navigation
   ========================================================================== */

function initSidebar() {
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const navLinks = document.querySelectorAll('.sidebar-link');
  const sections = document.querySelectorAll('.content-section');

  // Mobile menu toggle
  const toggleMobileSidebar = (open) => {
    if (sidebar) sidebar.classList.toggle('open', open);
    if (backdrop) backdrop.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = sidebar.classList.contains('open');
      toggleMobileSidebar(!isOpen);
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => toggleMobileSidebar(false));
  }

  // Close sidebar on link click (mobile)
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 860) {
        toggleMobileSidebar(false);
      }
    });
  });

  // Scroll Spy using IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

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
  }, observerOptions);

  sections.forEach((sec) => observer.observe(sec));
}

/* ==========================================================================
   3. Copy to Clipboard Functionality
   ========================================================================== */

function showToast(message = 'Rumus disalin ke clipboard!') {
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

function initCopyButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-copy');
    if (!btn) return;

    const formula = btn.getAttribute('data-copy');
    if (!formula) return;

    navigator.clipboard.writeText(formula).then(() => {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i data-lucide="check" style="width:14px;height:14px;"></i> <span>Disalin!</span>';
      btn.classList.add('copied');
      if (typeof lucide !== 'undefined') lucide.createIcons();

      showToast(`Tersalin: ${formula}`);

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('copied');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }, 1800);
    }).catch((err) => {
      console.error('Failed to copy formula: ', err);
    });
  });
}

/* ==========================================================================
   4. Function Catalog & Live Search
   ========================================================================== */

const EXCEL_FUNCTIONS_DATA = [
  // Basic
  { name: 'SUM', cat: 'Basic', desc: 'Menjumlahkan rentang angka.', syntax: '=SUM(number1, [number2], ...)', example: '=SUM(C2:C10)', section: 'section-basic' },
  { name: 'AVERAGE', cat: 'Basic', desc: 'Menghitung nilai rata-rata dari sekelompok angka.', syntax: '=AVERAGE(number1, [number2], ...)', example: '=AVERAGE(D2:D20)', section: 'section-basic' },
  { name: 'MIN', cat: 'Basic', desc: 'Menemukan nilai terkecil/minimum dalam suatu rentang.', syntax: '=MIN(number1, [number2], ...)', example: '=MIN(B2:B50)', section: 'section-basic' },
  { name: 'MAX', cat: 'Basic', desc: 'Menemukan nilai terbesar/maksimum dalam suatu rentang.', syntax: '=MAX(number1, [number2], ...)', example: '=MAX(B2:B50)', section: 'section-basic' },
  { name: 'COUNT', cat: 'Basic', desc: 'Menghitung jumlah sel yang hanya berisi angka (numerik).', syntax: '=COUNT(value1, [value2], ...)', example: '=COUNT(B2:B100)', section: 'section-basic' },
  { name: 'COUNTA', cat: 'Basic', desc: 'Menghitung jumlah sel yang tidak kosong (angka, teks, error).', syntax: '=COUNTA(value1, [value2], ...)', example: '=COUNTA(A2:A100)', section: 'section-basic' },
  { name: 'COUNTBLANK', cat: 'Basic', desc: 'Menghitung jumlah sel kosong dalam suatu rentang.', syntax: '=COUNTBLANK(range)', example: '=COUNTBLANK(C2:C50)', section: 'section-basic' },
  { name: 'PRODUCT', cat: 'Basic', desc: 'Mengalikan seluruh angka yang diberikan sebagai argumen.', syntax: '=PRODUCT(number1, [number2], ...)', example: '=PRODUCT(B2, C2, 0.9)', section: 'section-basic' },
  { name: 'SUBTOTAL', cat: 'Basic', desc: 'Menghitung subtotal dengan opsi mengabaikan baris tersembunyi/filter.', syntax: '=SUBTOTAL(function_num, ref1, ...)', example: '=SUBTOTAL(109, D2:D50)', section: 'section-basic' },

  // Logical
  { name: 'IF', cat: 'Logical', desc: 'Menguji kondisi logika dan menghasilkan nilai TRUE atau FALSE.', syntax: '=IF(logical_test, value_if_true, [value_if_false])', example: '=IF(C2>=75, "Lulus", "Remedial")', section: 'section-logical' },
  { name: 'AND', cat: 'Logical', desc: 'Mengembalikan TRUE jika semua kondisi yang diuji terpenuhi.', syntax: '=AND(logical1, [logical2], ...)', example: '=AND(B2>10000000, C2>=95%)', section: 'section-logical' },
  { name: 'OR', cat: 'Logical', desc: 'Mengembalikan TRUE jika salah satu kondisi yang diuji terpenuhi.', syntax: '=OR(logical1, [logical2], ...)', example: '=OR(D2="VIP", E2>500000)', section: 'section-logical' },
  { name: 'NOT', cat: 'Logical', desc: 'Membalikkan nilai logika: TRUE menjadi FALSE, dan sebaliknya.', syntax: '=NOT(logical)', example: '=NOT(A2="Closed")', section: 'section-logical' },
  { name: 'IFERROR', cat: 'Logical', desc: 'Menangkap nilai error (#N/A, #VALUE!) dan menggantinya dengan teks/nilai kustom.', syntax: '=IFERROR(value, value_if_error)', example: '=IFERROR(VLOOKUP(A2, D:E, 2, 0), "Tidak Ditemukan")', section: 'section-logical' },
  { name: 'Nested IF', cat: 'Logical', desc: 'IF bersarang untuk menguji lebih dari dua tingkatan kriteria evaluasi.', syntax: '=IF(kondisi1, hasil1, IF(kondisi2, hasil2, hasil_lain))', example: '=IF(A2>=85,"A",IF(A2>=70,"B","C"))', section: 'section-logical' },

  // Conditional
  { name: 'COUNTIF', cat: 'Conditional', desc: 'Menghitung jumlah sel yang memenuhi satu kriteria tertentu.', syntax: '=COUNTIF(range, criteria)', example: '=COUNTIF(B2:B50, "Finance")', section: 'section-conditional' },
  { name: 'COUNTIFS', cat: 'Conditional', desc: 'Menghitung jumlah sel yang memenuhi beberapa kriteria sekaligus.', syntax: '=COUNTIFS(criteria_range1, criteria1, ...)', example: '=COUNTIFS(B2:B50, "IT", C2:C50, "Tetap")', section: 'section-conditional' },
  { name: 'SUMIF', cat: 'Conditional', desc: 'Menjumlahkan nilai sel yang memenuhi satu kriteria tertentu.', syntax: '=SUMIF(range, criteria, [sum_range])', example: '=SUMIF(B2:B50, "Laptop", D2:D50)', section: 'section-conditional' },
  { name: 'SUMIFS', cat: 'Conditional', desc: 'Menjumlahkan nilai sel dengan banyak kriteria sekaligus (sum_range di awal!).', syntax: '=SUMIFS(sum_range, criteria_range1, criteria1, ...)', example: '=SUMIFS(E2:E50, B2:B50, "Laptop", C2:C50, "Jakarta")', section: 'section-conditional' },
  { name: 'AVERAGEIF', cat: 'Conditional', desc: 'Menghitung rata-rata nilai sel yang memenuhi satu kriteria.', syntax: '=AVERAGEIF(range, criteria, [average_range])', example: '=AVERAGEIF(C2:C50, "Manager", E2:E50)', section: 'section-conditional' },
  { name: 'AVERAGEIFS', cat: 'Conditional', desc: 'Menghitung rata-rata nilai sel yang memenuhi beberapa kriteria.', syntax: '=AVERAGEIFS(avg_range, criteria_range1, criteria1, ...)', example: '=AVERAGEIFS(E2:E50, B2:B50, "Sales", D2:D50, ">5000000")', section: 'section-conditional' },

  // Lookup
  { name: 'VLOOKUP', cat: 'Lookup', desc: 'Mencari nilai di kolom paling kiri dan mengambil data dari kolom ke-n.', syntax: '=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])', example: '=VLOOKUP(A2, Staff!A2:E100, 3, FALSE)', section: 'section-lookup' },
  { name: 'HLOOKUP', cat: 'Lookup', desc: 'Mencari nilai di baris teratas dan mengambil data di baris bawahnya.', syntax: '=HLOOKUP(lookup_value, table_array, row_index_num, [range_lookup])', example: '=HLOOKUP("Q1", B1:E5, 3, FALSE)', section: 'section-lookup' },
  { name: 'XLOOKUP', cat: 'Lookup', desc: 'Pencarian modern pengganti VLOOKUP/HLOOKUP (Excel 365/2021). Bisa lookup ke kiri!', syntax: '=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], ...)', example: '=XLOOKUP(A2, D2:D100, B2:B100, "Tidak Ada")', section: 'section-lookup' },
  { name: 'INDEX', cat: 'Lookup', desc: 'Mengambil nilai sel pada baris dan kolom tertentu dalam rentang.', syntax: '=INDEX(array, row_num, [column_num])', example: '=INDEX(B2:E50, 4, 2)', section: 'section-lookup' },
  { name: 'MATCH', cat: 'Lookup', desc: 'Mencari posisi nomor urut baris atau kolom suatu nilai.', syntax: '=MATCH(lookup_value, lookup_array, [match_type])', example: '=MATCH(A2, B2:B50, 0)', section: 'section-lookup' },
  { name: 'INDEX + MATCH', cat: 'Lookup', desc: 'Kombinasi fleksibel dua arah untuk lookup dinamis, tahan insert kolom.', syntax: '=INDEX(return_range, MATCH(lookup_val, lookup_range, 0))', example: '=INDEX(B2:B50, MATCH(A2, C2:C50, 0))', section: 'section-lookup' },

  // Text
  { name: 'LEFT', cat: 'Text', desc: 'Mengambil sejumlah karakter dari sebelah kiri (awal) string.', syntax: '=LEFT(text, [num_chars])', example: '=LEFT(A2, 3)', section: 'section-text' },
  { name: 'RIGHT', cat: 'Text', desc: 'Mengambil sejumlah karakter dari sebelah kanan (akhir) string.', syntax: '=RIGHT(text, [num_chars])', example: '=RIGHT(A2, 4)', section: 'section-text' },
  { name: 'MID', cat: 'Text', desc: 'Mengambil sejumlah karakter dari posisi tengah string.', syntax: '=MID(text, start_num, num_chars)', example: '=MID(A2, 5, 4)', section: 'section-text' },
  { name: 'LEN', cat: 'Text', desc: 'Menghitung total panjang karakter dalam sel termasuk spasi.', syntax: '=LEN(text)', example: '=LEN(A2)', section: 'section-text' },
  { name: 'UPPER', cat: 'Text', desc: 'Mengubah semua huruf dalam teks menjadi huruf BESAR/KAPITAL.', syntax: '=UPPER(text)', example: '=UPPER(B2)', section: 'section-text' },
  { name: 'LOWER', cat: 'Text', desc: 'Mengubah semua huruf dalam teks menjadi huruf kecil.', syntax: '=LOWER(text)', example: '=LOWER(B2)', section: 'section-text' },
  { name: 'PROPER', cat: 'Text', desc: 'Mengubah huruf pertama setiap kata menjadi kapital (Title Case).', syntax: '=PROPER(text)', example: '=PROPER(B2)', section: 'section-text' },
  { name: 'TRIM', cat: 'Text', desc: 'Menghapus spasi ganda dan spasi kosong di awal/akhir teks.', syntax: '=TRIM(text)', example: '=TRIM(A2)', section: 'section-text' },
  { name: 'CONCAT', cat: 'Text', desc: 'Menggabungkan rentang atau string teks (versi modern).', syntax: '=CONCAT(text1, [text2], ...)', example: '=CONCAT(A2, " ", B2)', section: 'section-text' },
  { name: 'CONCATENATE', cat: 'Text', desc: 'Fungsi lama penggabung teks (dapat digantikan oleh operator &).', syntax: '=CONCATENATE(text1, [text2], ...)', example: '=CONCATENATE(A2, "-", B2)', section: 'section-text' },
  { name: 'TEXTJOIN', cat: 'Text', desc: 'Menggabungkan teks dengan pemisah khusus & opsi abaikan sel kosong.', syntax: '=TEXTJOIN(delimiter, ignore_empty, text1, ...)', example: '=TEXTJOIN(", ", TRUE, A2:A10)', section: 'section-text' },
  { name: 'FIND', cat: 'Text', desc: 'Mencari posisi teks di dalam teks lain (Case Sensitive / peka kapital).', syntax: '=FIND(find_text, within_text, [start_num])', example: '=FIND("-", A2)', section: 'section-text' },
  { name: 'SEARCH', cat: 'Text', desc: 'Mencari posisi teks di dalam teks lain (Not Case Sensitive & wildcard).', syntax: '=SEARCH(find_text, within_text, [start_num])', example: '=SEARCH("id", A2)', section: 'section-text' },
  { name: 'SUBSTITUTE', cat: 'Text', desc: 'Mengganti string teks tertentu dengan teks baru.', syntax: '=SUBSTITUTE(text, old_text, new_text, [instance_num])', example: '=SUBSTITUTE(A2, "/", "-")', section: 'section-text' },
  { name: 'REPLACE', cat: 'Text', desc: 'Mengganti bagian karakter berdasarkan posisi nomor urut dan panjang.', syntax: '=REPLACE(old_text, start_num, num_chars, new_text)', example: '=REPLACE(A2, 1, 3, "IDN")', section: 'section-text' },
  { name: 'TEXT', cat: 'Text', desc: 'Memformat angka/tanggal menjadi format teks tertentu.', syntax: '=TEXT(value, format_text)', example: '=TEXT(A2, "Rp #,##0")', section: 'section-text' },
  { name: 'VALUE', cat: 'Text', desc: 'Mengonversi string teks berisi angka menjadi angka numerik murni.', syntax: '=VALUE(text)', example: '=VALUE(A2)', section: 'section-text' },

  // Date & Time
  { name: 'TODAY', cat: 'Date & Time', desc: 'Menghasilkan tanggal hari ini secara dinamis (tanpa jam).', syntax: '=TODAY()', example: '=TODAY()', section: 'section-datetime' },
  { name: 'NOW', cat: 'Date & Time', desc: 'Menghasilkan tanggal dan jam terkini secara dinamis.', syntax: '=NOW()', example: '=NOW()', section: 'section-datetime' },
  { name: 'DAY', cat: 'Date & Time', desc: 'Mengekstrak tanggal (angka hari 1-31) dari serial date.', syntax: '=DAY(serial_number)', example: '=DAY(A2)', section: 'section-datetime' },
  { name: 'MONTH', cat: 'Date & Time', desc: 'Mengekstrak bulan (angka 1-12) dari serial date.', syntax: '=MONTH(serial_number)', example: '=MONTH(A2)', section: 'section-datetime' },
  { name: 'YEAR', cat: 'Date & Time', desc: 'Mengekstrak tahun 4 digit dari serial date.', syntax: '=YEAR(serial_number)', example: '=YEAR(A2)', section: 'section-datetime' },
  { name: 'DATE', cat: 'Date & Time', desc: 'Membuat format serial tanggal dari komponen tahun, bulan, hari.', syntax: '=DATE(year, month, day)', example: '=DATE(2026, 11, 4)', section: 'section-datetime' },
  { name: 'DATEDIF', cat: 'Date & Time', desc: 'Menghitung selisih antara dua tanggal dalam tahun ("Y"), bulan ("M"), atau hari ("D").', syntax: '=DATEDIF(start_date, end_date, unit)', example: '=DATEDIF(A2, TODAY(), "Y")', section: 'section-datetime' },
  { name: 'NETWORKDAYS', cat: 'Date & Time', desc: 'Menghitung jumlah hari kerja bersih (tanpa Sabtu, Minggu & libur).', syntax: '=NETWORKDAYS(start_date, end_date, [holidays])', example: '=NETWORKDAYS(A2, B2, Libur!A2:A10)', section: 'section-datetime' },
  { name: 'WORKDAY', cat: 'Date & Time', desc: 'Menghasilkan tanggal jatuh tempo setelah n hari kerja dari start date.', syntax: '=WORKDAY(start_date, days, [holidays])', example: '=WORKDAY(TODAY(), 30, Libur!A2:A10)', section: 'section-datetime' },
  { name: 'EOMONTH', cat: 'Date & Time', desc: 'Menghasilkan tanggal hari terakhir bulan berjalan atau n bulan ke depan.', syntax: '=EOMONTH(start_date, months)', example: '=EOMONTH(A2, 1)', section: 'section-datetime' },

  // Math
  { name: 'ROUND', cat: 'Math', desc: 'Membulatkan angka ke jumlah digit desimal terdekat.', syntax: '=ROUND(number, num_digits)', example: '=ROUND(125.678, 2)', section: 'section-math' },
  { name: 'ROUNDUP', cat: 'Math', desc: 'Membulatkan angka ke atas menjauhi nol.', syntax: '=ROUNDUP(number, num_digits)', example: '=ROUNDUP(125.12, 0)', section: 'section-math' },
  { name: 'ROUNDDOWN', cat: 'Math', desc: 'Membulatkan angka ke bawah mendekati nol.', syntax: '=ROUNDDOWN(number, num_digits)', example: '=ROUNDDOWN(125.89, 0)', section: 'section-math' },
  { name: 'ABS', cat: 'Math', desc: 'Menghasilkan nilai mutlak/absolut (selalu positif) dari angka.', syntax: '=ABS(number)', example: '=ABS(-450000)', section: 'section-math' },
  { name: 'MOD', cat: 'Math', desc: 'Menghasilkan sisa bagi (modulus) dari pembagian dua angka.', syntax: '=MOD(number, divisor)', example: '=MOD(ROW(), 2)', section: 'section-math' },
  { name: 'INT', cat: 'Math', desc: 'Membulatkan angka ke bawah ke bilangan bulat terdekat.', syntax: '=INT(number)', example: '=INT(9.99)', section: 'section-math' },
  { name: 'SQRT', cat: 'Math', desc: 'Menghitung nilai akar kuadrat dari suatu bilangan positif.', syntax: '=SQRT(number)', example: '=SQRT(144)', section: 'section-math' },
  { name: 'POWER', cat: 'Math', desc: 'Menghitung hasil pemangkatan angka dengan pangkat tertentu.', syntax: '=POWER(number, power)', example: '=POWER(5, 3)', section: 'section-math' },
  { name: 'SUMPRODUCT', cat: 'Math', desc: 'Mengalikan komponen array yang bersesuaian lalu menjumlahkannya.', syntax: '=SUMPRODUCT(array1, [array2], ...)', example: '=SUMPRODUCT(B2:B10, C2:C10)', section: 'section-math' },
  { name: 'CEILING', cat: 'Math', desc: 'Membulatkan angka ke atas ke kelipatan bilangan terdekat.', syntax: '=CEILING(number, significance)', example: '=CEILING(12340, 500)', section: 'section-math' },
  { name: 'FLOOR', cat: 'Math', desc: 'Membulatkan angka ke bawah ke kelipatan bilangan terdekat.', syntax: '=FLOOR(number, significance)', example: '=FLOOR(12780, 500)', section: 'section-math' },

  // References & Tools
  { name: 'Relative Reference', cat: 'Cell Reference', desc: 'Referensi alamat sel relatif (A1) yang bergeser saat disalin.', syntax: 'A1', example: '=A1 * 10%', section: 'section-references' },
  { name: 'Absolute Reference', cat: 'Cell Reference', desc: 'Referensi sel terkunci ($A$1) yang tidak bergeser kemanapun disalin.', syntax: '$A$1', example: '=B2 * $F$1', section: 'section-references' },
  { name: 'Mixed Reference', cat: 'Cell Reference', desc: 'Referensi sel terkunci kolom ($A1) atau baris (A$1).', syntax: '$A1 atau A$1', example: '=$A2 * B$1', section: 'section-references' }
];

function initLiveSearch() {
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

    const matches = EXCEL_FUNCTIONS_DATA.filter((fn) => {
      return (
        fn.name.toLowerCase().includes(q) ||
        fn.desc.toLowerCase().includes(q) ||
        fn.cat.toLowerCase().includes(q) ||
        fn.syntax.toLowerCase().includes(q)
      );
    });

    if (matches.length === 0) {
      resultsOverlay.innerHTML = `
        <div class="search-no-results">
          <i data-lucide="search-x" style="width:24px;height:24px;margin-bottom:6px;opacity:0.6;"></i>
          <p>Tidak ditemukan rumus dengan kata kunci "<strong>${escapeHtml(query)}</strong>"</p>
        </div>
      `;
    } else {
      resultsOverlay.innerHTML = matches.map((fn) => `
        <a href="#${fn.section}" class="search-result-item" data-target="${fn.name}">
          <div class="search-result-main">
            <span class="search-result-name">${escapeHtml(fn.name)}</span>
            <span class="search-result-cat">${escapeHtml(fn.cat)}</span>
          </div>
          <div class="search-result-desc">${escapeHtml(fn.desc)}</div>
        </a>
      `).join('');
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
    resultsOverlay.classList.add('active');
  };

  // Keyboard shortcut Ctrl+K / Cmd+K
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

  searchInput.addEventListener('input', (e) => {
    performSearch(e.target.value);
  });

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim()) {
      performSearch(searchInput.value);
    }
  });

  // Close search overlay on click outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !resultsOverlay.contains(e.target)) {
      resultsOverlay.classList.remove('active');
    }
  });

  // Navigate directly on item click
  resultsOverlay.addEventListener('click', (e) => {
    const item = e.target.closest('.search-result-item');
    if (item) {
      resultsOverlay.classList.remove('active');
      searchInput.value = '';
    }
  });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================================================
   5. Quick Reference Table
   ========================================================================== */

function initQuickReferenceTable() {
  const tableBody = document.getElementById('quickRefTableBody');
  const searchInput = document.getElementById('quickRefSearchInput');
  const categorySelect = document.getElementById('quickRefCatSelect');

  if (!tableBody) return;

  const renderTable = (filterText = '', selectedCategory = 'ALL') => {
    const q = filterText.trim().toLowerCase();
    const filtered = EXCEL_FUNCTIONS_DATA.filter((item) => {
      const matchCat = selectedCategory === 'ALL' || item.cat.toLowerCase() === selectedCategory.toLowerCase();
      const matchText =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.syntax.toLowerCase().includes(q);
      return matchCat && matchText;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-subtle);">
            Tidak ada rumus yang cocok dengan filter.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map((item, index) => `
      <tr>
        <td class="row-num">${index + 1}</td>
        <td>
          <a href="#${item.section}" style="font-family: var(--font-mono); font-weight:700; color: var(--excel-primary);">
            ${escapeHtml(item.name)}
          </a>
        </td>
        <td><span class="cell-code" style="font-size:0.75rem;">${escapeHtml(item.cat)}</span></td>
        <td style="font-size:0.85rem;">${escapeHtml(item.desc)}</td>
        <td><code style="font-size:0.82rem; color: var(--text-code);">${escapeHtml(item.syntax)}</code></td>
        <td style="white-space:nowrap;">
          <button class="btn-copy" data-copy="${escapeHtml(item.example)}" title="Salin Contoh Rumus">
            <i data-lucide="copy" style="width:13px;height:13px;"></i>
            <span>${escapeHtml(item.example)}</span>
          </button>
        </td>
      </tr>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  // Initial render
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

/* ==========================================================================
   6. Interactive Practice Quiz Engine (22 Soal Tes Kerja Excel)
   ========================================================================== */

const QUIZ_QUESTIONS = [
  {
    id: 1,
    category: 'Basic',
    question: 'Di tabel absensi karyawan terdapat kolom Status Kehadiran (sel C2:C30) yang berisi teks ("Hadir", "Sakit", "Izin") dan beberapa sel kosong. Fungsi manakah yang tepat untuk menghitung total karyawan yang sudah mengisi status kehadiran?',
    options: [
      '=COUNT(C2:C30)',
      '=COUNTA(C2:C30)',
      '=COUNTBLANK(C2:C30)',
      '=SUM(C2:C30)'
    ],
    answer: 1,
    explanation: 'Fungsi <code>COUNTA</code> menghitung jumlah sel yang <strong>tidak kosong</strong> (berisi teks, angka, atau nilai apa pun). Sebaliknya, fungsi <code>COUNT</code> hanya menghitung sel yang berisi angka numerik murni sehingga akan menghasilkan 0 jika datanya teks.'
  },
  {
    id: 2,
    category: 'Conditional',
    question: 'Anda diminta menghitung total komisi pada kolom E (E2:E50) khusus untuk staf sales dari departemen "Retail" (kolom B2:B50) yang berhasil mencetak omzet penjualan di atas 50.000.000 (kolom D2:D50). Rumus manakah yang benar?',
    options: [
      '=SUMIF(B2:B50, "Retail", D2:D50, ">50000000", E2:E50)',
      '=SUMIFS(E2:E50, B2:B50, "Retail", D2:D50, ">50000000")',
      '=SUMIFS(B2:B50, "Retail", D2:D50, ">50000000", E2:E50)',
      '=COUNTIFS(E2:E50, B2:B50, "Retail", D2:D50, ">50000000")'
    ],
    answer: 1,
    explanation: 'Pada <code>SUMIFS</code> (banyak kriteria), argumen rentang yang dijumlahkan (<code>sum_range</code>) harus berada di <strong>urutan pertama</strong>: <code>=SUMIFS(sum_range, criteria_range1, criteria1, criteria_range2, criteria2)</code>. Berbeda dengan <code>SUMIF</code> tunggal yang menaruh <code>sum_range</code> di akhir.'
  },
  {
    id: 3,
    category: 'Lookup',
    question: 'Ketika menggunakan rumus <code>=VLOOKUP(A2, MasterData!A:D, 3, FALSE)</code>, sistem menampilkan error <code>#N/A</code> karena ID di sel A2 belum terdaftar di lembar MasterData. Bagaimana cara membungkus rumus tersebut agar menampilkan teks "Belum Terdaftar" alih-alih pesan error?',
    options: [
      '=IF(VLOOKUP(A2, MasterData!A:D, 3, FALSE) = 0, "Belum Terdaftar")',
      '=IFERROR(VLOOKUP(A2, MasterData!A:D, 3, FALSE), "Belum Terdaftar")',
      '=ISERROR(VLOOKUP(A2, MasterData!A:D, 3, FALSE), "Belum Terdaftar")',
      '=VLOOKUP(A2, MasterData!A:D, 3, FALSE, "Belum Terdaftar")'
    ],
    answer: 1,
    explanation: 'Fungsi <code>IFERROR(value, value_if_error)</code> secara otomatis mengevaluasi hasil rumus. Jika menghasilkan error seperti <code>#N/A</code>, <code>#VALUE!</code>, atau <code>#DIV/0!</code>, ia akan menggantinya dengan nilai alternatif yang ditentukan (misalnya "Belum Terdaftar").'
  },
  {
    id: 4,
    category: 'Lookup',
    question: 'Apa keunggulan teknis terbesar dari kombinasi <code>INDEX + MATCH</code> dibandingkan fungsi <code>VLOOKUP</code> konvensional?',
    options: [
      'INDEX + MATCH lebih mudah dihafal karena hanya membutuhkan satu argumen.',
      'INDEX + MATCH dapat mengambil data di kolom sebelah kiri nilai pencarian dan tidak rusak jika ada penambahan kolom baru di tabel sumber.',
      'INDEX + MATCH hanya dapat digunakan untuk mencocokkan angka, bukan teks.',
      'INDEX + MATCH tidak memerlukan tombol Enter saat diinput.'
    ],
    answer: 1,
    explanation: '<code>VLOOKUP</code> hanya dapat mencari data ke arah kanan (kolom kunci wajib di kolom paling kiri dari rentang tabel). Selain itu, <code>VLOOKUP</code> menggunakan indeks kolom angka statis (misal 3) yang akan rusak jika kolom baru disisipkan. Sebaliknya, <code>INDEX + MATCH</code> bisa mengambil data ke arah kiri maupun kanan serta dinamis terhadap perubahan kolom.'
  },
  {
    id: 5,
    category: 'Lookup',
    question: 'Di Excel versi Microsoft 365 dan Excel 2021, fungsi modern apakah yang dirancang untuk menggantikan VLOOKUP dan HLOOKUP secara menyeluruh dengan fitur default exact match dan built-in error handling?',
    options: [
      '=LOOKUPX()',
      '=SEARCHLOOKUP()',
      '=XLOOKUP()',
      '=SUPERLOOKUP()'
    ],
    answer: 2,
    explanation: '<code>XLOOKUP</code> adalah fungsi pencarian modern serbaguna yang bekerja vertikal maupun horizontal, memiliki nilai default exact match (tidak perlu lagi mengetik FALSE/0), dapat mencari ke kiri, dan memiliki parameter bawaan <code>[if_not_found]</code> tanpa perlu bantuan fungsi <code>IFERROR</code>.'
  },
  {
    id: 6,
    category: 'Logical',
    question: 'Sebuah perusahaan menerapkan aturan bonus: Karyawan mendapat bonus jika Penjualan (B2) mencapai minimal 100.000.000 ATAU Nilai Evaluasi Kerja (C2) mencapai grade "A". Manakah rumus IF logika yang tepat?',
    options: [
      '=IF(AND(B2>=100000000, C2="A"), "Dapat Bonus", "Tidak")',
      '=IF(OR(B2>=100000000, C2="A"), "Dapat Bonus", "Tidak")',
      '=IF(NOT(B2>=100000000, C2="A"), "Dapat Bonus", "Tidak")',
      '=IF(B2>=100000000 + C2="A", "Dapat Bonus", "Tidak")'
    ],
    answer: 1,
    explanation: 'Karena menggunakan syarat "ATAU" (cukup salah satu terpenuhi), fungsi logika yang digunakan adalah <code>OR</code>. Jika kedua syarat harus terpenuhi sekaligus barulah menggunakan <code>AND</code>.'
  },
  {
    id: 7,
    category: 'Text',
    question: 'Data kode produk di sel A2 adalah <code>"PRD-2024-8891"</code>. Anda diminta mengambil 4 digit tahun <code>"2024"</code>. Rumus manakah yang menghasilkan teks tersebut secara tepat?',
    options: [
      '=LEFT(A2, 4)',
      '=RIGHT(A2, 4)',
      '=MID(A2, 5, 4)',
      '=MID(A2, 4, 4)'
    ],
    answer: 2,
    explanation: 'Karakter "2" dari tahun 2024 berada di karakter ke-5 ("P"=1, "R"=2, "D"=3, "-"=4, "2"=5), dan panjang digit yang ingin diambil adalah 4 karakter. Maka sintaksnya: <code>=MID(A2, 5, 4)</code>.'
  },
  {
    id: 8,
    category: 'Text',
    question: 'Data yang diunduh dari database internal sering kali mengalami kegagalan VLOOKUP karena memiliki spasi tak terlihat di awal atau akhir kata (contoh: <code>" Jakarta "</code>). Fungsi Excel manakah yang khusus membersihkan spasi berlebih tersebut?',
    options: [
      '=CLEAN(A2)',
      '=TRIM(A2)',
      '=REMOVE_SPACE(A2)',
      '=CLEAR(A2)'
    ],
    answer: 1,
    explanation: 'Fungsi <code>TRIM</code> menghapus spasi kosong di awal (leading spaces), spasi kosong di akhir (trailing spaces), dan mengubah spasi ganda di tengah teks menjadi spasi tunggal. Ini adalah fungsi wajib dalam pembersihan data sebelum lookup.'
  },
  {
    id: 9,
    category: 'Cell Reference',
    question: 'Di sel C2 tertulis rumus <code>=$A$1 * B2</code>. Jika sel C2 disalin (copy) ke sel D5, bagaimanakah bentuk rumus di sel D5?',
    options: [
      '=$B$4 * C5',
      '=$A$1 * C5',
      '=B4 * C5',
      '=$A$1 * B5'
    ],
    answer: 1,
    explanation: 'Referensi <code>$A$1</code> adalah <strong>Absolute Reference</strong> (keduanya terkunci dengan simbol $), sehingga alamat sel tidak akan berubah kemanapun rumus disalin. Sedangkan <code>B2</code> adalah referensi relatif: bergeser 1 kolom ke kanan (menjadi C) dan 3 baris ke bawah (menjadi 5), sehingga menjadi <code>C5</code>. Hasil akhirnya: <code>=$A$1 * C5</code>.'
  },
  {
    id: 10,
    category: 'Cell Reference',
    question: 'Tombol keyboard shortcut manakah di Excel Windows yang digunakan untuk mengganti mode referensi sel dari Relatif (A1) ke Absolut ($A$1) atau Semi-Absolut ($A1 / A$1)?',
    options: [
      'F2',
      'F4',
      'F8',
      'Ctrl + $'
    ],
    answer: 1,
    explanation: 'Tombol <code>F4</code> di Windows (atau <code>Command + T</code> di Mac) digunakan saat kursor berada di alamat sel dalam formula bar untuk berganti siklus: A1 -> $A$1 -> A$1 -> $A1 -> A1.'
  },
  {
    id: 11,
    category: 'Date & Time',
    question: 'Tanggal lahir karyawan tercatat di sel B2. Manakah rumus yang tepat untuk menghitung usia karyawan dalam hitungan tahun penuh hingga hari ini?',
    options: [
      '=YEAR(TODAY()) - YEAR(B2)',
      '=DATEDIF(B2, TODAY(), "Y")',
      '=DAYS(TODAY(), B2) / 365',
      '=NETWORKDAYS(B2, TODAY())'
    ],
    answer: 1,
    explanation: '<code>=DATEDIF(B2, TODAY(), "Y")</code> adalah metode paling akurat karena menghitung tahun penuh yang telah genap terlewati berdasarkan tanggal dan bulan lahir. Mengurangkan tahun saja (<code>YEAR-YEAR</code>) bisa keliru jika karyawan belum berulang tahun di tahun berjalan.'
  },
  {
    id: 12,
    category: 'Date & Time',
    question: 'Sebuah proyek konstruksi dimulai tanggal 1 November 2026 dan selesai tanggal 30 November 2026. Anda diminta menghitung total hari kerja efektif (tidak termasuk hari Sabtu, Minggu, dan daftar libur di sel H2:H5). Fungsi apakah yang harus digunakan?',
    options: [
      '=WORKDAY(start_date, days, [holidays])',
      '=NETWORKDAYS(start_date, end_date, [holidays])',
      '=DAYS(end_date, start_date)',
      '=COUNTDAYS(start_date, end_date)'
    ],
    answer: 1,
    explanation: '<code>NETWORKDAYS</code> menghitung jumlah hari kerja bersih antara dua tanggal tertentu (mengecualikan weekend dan hari libur opsional). Sebaliknya, <code>WORKDAY</code> digunakan jika Anda mengetahui start date dan jumlah hari kerja lalu ingin mencari tanggal selesainya.'
  },
  {
    id: 13,
    category: 'Math',
    question: 'Anda memiliki daftar kuantitas barang terjual di kolom B (B2:B20) dan harga satuan barang di kolom C (C2:C20). Rumus manakah yang dapat menghitung Total Nilai Penjualan sekaligus tanpa memerlukan kolom pembantu perkalian (Qty x Harga)?',
    options: [
      '=SUM(B2:B20 * C2:C20)',
      '=SUMPRODUCT(B2:B20, C2:C20)',
      '=PRODUCT(B2:B20, C2:C20)',
      '=MULTIPLY(B2:B20, C2:C20)'
    ],
    answer: 1,
    explanation: 'Fungsi <code>SUMPRODUCT</code> mengalikan elemen array yang posisinya bersesuaian (B2*C2, B3*C3, dst.) kemudian menjumlahkan seluruh hasil perkalian tersebut dalam satu langkah efisien tanpa kolom bantu.'
  },
  {
    id: 14,
    category: 'Math',
    question: 'Suatu perhitungan total tagihan menghasilkan angka <code>14.320</code>. Kasir mengharuskan pembulatan ke atas ke kelipatan 500 terdekat (menjadi 14.500). Fungsi manakah yang digunakan?',
    options: [
      '=ROUNDUP(14320, 500)',
      '=CEILING(14320, 500)',
      '=FLOOR(14320, 500)',
      '=MROUND(14320, 500)'
    ],
    answer: 1,
    explanation: '<code>CEILING(number, significance)</code> membulatkan angka ke atas ke kelipatan (significance) terdekat. Sebaliknya, <code>FLOOR</code> membulatkan ke bawah, dan <code>MROUND</code> membulatkan ke kelipatan terdekat (bisa naik atau turun).'
  },
  {
    id: 15,
    category: 'Data Tools',
    question: 'Di Excel, fitur apakah yang dapat memisahkan secara otomatis nama lengkap "Budi Santoso" menjadi kolom Nama Depan ("Budi") dan Nama Belakang ("Santoso") hanya dengan mengetikkan satu contoh lalu menekan tombol <code>Ctrl + E</code>?',
    options: [
      'AutoFilter',
      'Flash Fill',
      'Text to Columns',
      'Consolidate'
    ],
    answer: 1,
    explanation: '<code>Flash Fill</code> (shortcut <code>Ctrl + E</code>) adalah fitur cerdas berbasis pengenalan pola di Excel yang dapat memisahkan, menggabungkan, atau merapikan data teks secara otomatis berdasarkan contoh yang Anda ketik di baris pertama.'
  },
  {
    id: 16,
    category: 'Data Tools',
    question: 'File laporan penjualan berisi banyak baris duplikat yang tidak sengaja terinput berulang kali. Menu atau fitur bawaan Excel manakah yang paling cepat untuk membersihkan baris ganda tersebut?',
    options: [
      'Data > Remove Duplicates',
      'Home > Clear All',
      'View > Split Window',
      'Formulas > Error Checking'
    ],
    answer: 0,
    explanation: 'Menu <code>Data > Remove Duplicates</code> memungkinkan pengguna menghapus baris duplikat berdasarkan satu atau beberapa kombinasi kolom yang dipilih sebagai kunci keunikan.'
  },
  {
    id: 17,
    category: 'Pivot Table',
    question: 'Dalam laporan Pivot Table, Anda ingin menampilkan kontribusi persentase omzet masing-masing kategori produk terhadap total omzet keseluruhan perusahaan. Pengaturan nilai apakah yang harus diubah pada Value Field Settings?',
    options: [
      'Summarize value field by: Count',
      'Show Values As: % of Grand Total',
      'Show Values As: Difference From',
      'Summarize value field by: Average'
    ],
    answer: 1,
    explanation: 'Pada jendela *Value Field Settings*, tab <strong>Show Values As</strong> menyediakan opsi <strong>% of Grand Total</strong> untuk mengubah tampilan angka nominal rupiah menjadi proporsi persentase dari total penjualan keseluruhan (100%).'
  },
  {
    id: 18,
    category: 'Keyboard Shortcut',
    question: 'Shortcut keyboard standar pada sistem operasi Windows untuk mengaktifkan atau menonaktifkan fitur AutoFilter pada tabel data adalah:',
    options: [
      'Ctrl + F',
      'Ctrl + Shift + L',
      'Alt + F4',
      'Ctrl + T'
    ],
    answer: 1,
    explanation: 'Shortcut <code>Ctrl + Shift + L</code> di Windows (atau <code>Cmd + Shift + F</code> di Mac) berfungsi sebagai toggle untuk menyalakan atau mematikan icon panah filter pada baris judul tabel.'
  },
  {
    id: 19,
    category: 'Basic',
    question: 'Ketika sebuah tabel dilakukan filter baris, fungsi <code>SUM(D2:D100)</code> tetap menghitung data baris yang tersembunyi (hidden rows). Fungsi manakah yang dapat menjumlahkan HANYA baris-baris yang terlihat (visible cells) setelah difilter?',
    options: [
      '=COUNTIF(D2:D100, "Visible")',
      '=SUBTOTAL(109, D2:D100)',
      '=SUMVISIBLE(D2:D100)',
      '=AGGREGATE_SUM(D2:D100)'
    ],
    answer: 1,
    explanation: 'Fungsi <code>SUBTOTAL(function_num, range)</code> dengan kode <code>109</code> (atau <code>9</code> untuk baris terfilter) secara khusus menghitung penjumlahan dengan mengabaikan sel yang tersembunyi akibat penerapan Filter.'
  },
  {
    id: 20,
    category: 'Text',
    question: 'Anda menggabungkan kalimat menggunakan rumus teks: <code>="Gaji karyawan adalah: " & A2</code>. Nilai sel A2 adalah angka <code>7500000</code>, namun hasilnya tampil tanpa pemisah ribuan. Bagaimana cara memformat angka di dalam rumus tersebut agar berformat "Rp 7.500.000"?',
    options: [
      '="Gaji karyawan adalah: " & FORMAT(A2, "Rp #,##0")',
      '="Gaji karyawan adalah: " & TEXT(A2, "Rp #,##0")',
      '="Gaji karyawan adalah: " & VALUE(A2, "Rp #,##0")',
      '="Gaji karyawan adalah: " & CURRENCY(A2)'
    ],
    answer: 1,
    explanation: 'Fungsi <code>TEXT(value, format_text)</code> digunakan untuk mengonversi angka numerik menjadi teks berformat khusus (seperti mata uang, tanggal, atau persentase) saat dirangkai dengan string teks lain.'
  },
  {
    id: 21,
    category: 'Date & Time',
    question: 'Departemen Finance menetapkan tanggal jatuh tempo tagihan invoice selalu jatuh pada hari terakhir di bulan berikutnya setelah tanggal transaksi (sel A2). Fungsi manakah yang menghasilkan tanggal tersebut secara otomatis?',
    options: [
      '=DATE(YEAR(A2), MONTH(A2)+1, 30)',
      '=EOMONTH(A2, 1)',
      '=ENDMONTH(A2, 1)',
      '=WORKDAY(A2, 30)'
    ],
    answer: 1,
    explanation: '<code>EOMONTH(start_date, months)</code> (End Of Month) dengan argumen <code>months = 1</code> mengembalikan tanggal hari terakhir pada bulan berikutnya. Fungsi ini secara cerdas memperhitungkan perbedaan jumlah hari tiap bulan (28, 29, 30, atau 31 hari).'
  },
  {
    id: 22,
    category: 'Keyboard Shortcut',
    question: 'Shortcut keyboard yang benar untuk menyisipkan lembar kerja (worksheet) baru pada Microsoft Excel di Windows adalah:',
    options: [
      'Ctrl + N',
      'Shift + F11',
      'Ctrl + W',
      'Alt + W'
    ],
    answer: 1,
    explanation: '<code>Shift + F11</code> (atau <code>Alt + Shift + F1</code>) adalah shortcut universal untuk menyisipkan worksheet baru di samping sheet aktif. Sedangkan <code>Ctrl + N</code> digunakan untuk membuka file workbook baru.'
  }
];

function initQuiz() {
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

  let questions = [...QUIZ_QUESTIONS];
  let userAnswers = {}; // { questionId: selectedOptionIndex }
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

    // If all questions are answered, show summary
    if (answeredCount === questions.length && summaryBox) {
      showSummary(correctCount, questions.length);
    }
  };

  const showSummary = (score, total) => {
    const finalPercent = Math.round((score / total) * 100);
    summaryScore.textContent = `${finalPercent}%`;

    let badgeText = '';
    let badgeClass = '';
    let descText = '';

    if (finalPercent >= 85) {
      badgeText = '🏆 Master Excel - Sangat Siap Lolos Tes Kerja!';
      badgeClass = 'success';
      descText = `Luar biasa! Anda menjawab ${score} dari ${total} soal dengan benar. Penguasaan rumus lookup, logika, kondisional, dan manipulasi data Anda sudah setara dengan standar analis profesional dan staf senior.`;
    } else if (finalPercent >= 65) {
      badgeText = '👍 Kompeten - Pemahaman Bagus!';
      badgeClass = 'info';
      descText = `Bagus! Anda menjawab ${score} dari ${total} soal dengan benar. Tinjau kembali pembahasan soal yang masih keliru di atas untuk memperkuat ketelitian saat tes rekrutmen nanti.`;
    } else {
      badgeText = '📖 Perlu Berlatih Lagi';
      badgeClass = 'warning';
      descText = `Anda menjawab ${score} dari ${total} soal dengan benar. Jangan berkecil hati! Pelajari kembali cheatsheet di section terkait, khususnya sintaks SUMIFS, VLOOKUP exact match, dan referensi absolut ($).`;
    }

    summaryBadge.textContent = badgeText;
    summaryBadge.className = `result-badge ${badgeClass}`;
    summaryDesc.textContent = descText;
    summaryBox.classList.add('show');
    summaryBox.scrollIntoView({ behavior: 'smooth' });
  };

  const renderQuestions = () => {
    const filtered = questions.filter((q) => {
      return currentCategory === 'ALL' || q.category.toLowerCase() === currentCategory.toLowerCase();
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
            <span class="question-category-tag">${escapeHtml(q.category)}</span>
          </div>
          <div class="question-text">${q.question}</div>
          <div class="options-list">
            ${q.options.map((opt, optIdx) => {
              let optClass = 'option-item';
              if (isAnswered) {
                if (optIdx === q.answer) {
                  optClass += ' correct';
                } else if (optIdx === userSelected) {
                  optClass += ' incorrect';
                }
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

    // Attach click events to options
    document.querySelectorAll('.option-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        const qId = parseInt(item.getAttribute('data-qid'));
        const optIdx = parseInt(item.getAttribute('data-opt'));

        // If already answered, do nothing
        if (userAnswers[qId] !== undefined) return;

        userAnswers[qId] = optIdx;
        updateQuizStats();
        renderQuestions();
      });
    });
  };

  // Filter Buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-cat') || 'ALL';
      renderQuestions();
    });
  });

  // Reset Quiz
  const resetQuiz = () => {
    userAnswers = {};
    if (summaryBox) summaryBox.classList.remove('show');
    updateQuizStats();
    renderQuestions();
  };

  if (resetBtn) resetBtn.addEventListener('click', resetQuiz);
  if (restartQuizBtn) restartQuizBtn.addEventListener('click', resetQuiz);

  // Shuffle Questions
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      questions = [...questions].sort(() => Math.random() - 0.5);
      resetQuiz();
      showToast('Urutan soal berhasil diacak!');
    });
  }

  // Initial render
  updateQuizStats();
  renderQuestions();
}

/* ==========================================================================
   8. Formula Favorites (Love / Bintang) System
   ========================================================================== */
function initFormulaFavorites(pagePath = 'excel') {
  const cards = document.querySelectorAll('.formula-card');
  if (cards.length === 0) return;

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

    document.querySelectorAll('.category-section, .content-section').forEach(sec => {
      if (sec.id === 'practice-questions' || sec.id === 'quick-reference') return;
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


