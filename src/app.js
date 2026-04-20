// ========== Supérette Plus — Renderer ==========
// Vanilla JS app. No build step. All views, state, persistence handled here.

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n));
const todayStr = () => new Date().toISOString().split('T')[0];

// ---------- Icons (inline SVG strings) ----------
const ICONS = {
  cart: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
  package: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>',
  book: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
  chart: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
  settings: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  search: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>',
  receipt: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
  trash: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>',
  plus: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>',
  minus: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>',
  x: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
  cash: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
  card: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>',
  phone: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
  alert: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
  globe: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  zap: '<svg fill="white" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
  lock: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>',
  copy: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
  download: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>',
  upload: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>',
};

// ---------- State ----------
let DB = null;
let state = {
  view: 'caisse',
  cart: [],
  searchQuery: '',
  scanBuffer: '',
  scanFlash: null,
  showPayment: false,
  showCarnet: false,
  showAddProduct: false,
  editingProduct: null,
  toast: null,
  licensed: false,
  hwid: '',
  lang: 'fr',
};

let scanTimer = null;
let toastTimer = null;

// ---------- Quick Categories ----------
const QUICK_CATEGORIES = [
  { id: 'bread', labelFr: 'Pain', labelAr: 'خبز', icon: '🥖' },
  { id: 'dairy', labelFr: 'Lait', labelAr: 'حليب', icon: '🥛' },
  { id: 'drinks', labelFr: 'Boissons', labelAr: 'مشروبات', icon: '🥤' },
  { id: 'snacks', labelFr: 'Snacks', labelAr: 'وجبات', icon: '🍫' },
  { id: 'grocery', labelFr: 'Épicerie', labelAr: 'بقالة', icon: '🛒' },
  { id: 'household', labelFr: 'Ménage', labelAr: 'منزل', icon: '🧴' },
];

// ---------- T (translations) ----------
const T = {
  caisse: { fr: 'Caisse', ar: 'الصندوق' },
  stock: { fr: 'Stock', ar: 'المخزون' },
  carnet: { fr: 'Carnet', ar: 'الكريدي' },
  stats: { fr: 'Stats', ar: 'إحصائيات' },
  settings: { fr: 'Réglages', ar: 'الإعدادات' },
  search: { fr: 'Rechercher produit... (F1)', ar: 'بحث منتج... (F1)' },
  scanReady: { fr: 'Scanner prêt', ar: 'الماسح جاهز' },
  cart: { fr: 'Ticket en cours', ar: 'الفاتورة' },
  empty: { fr: 'Scannez un article pour commencer', ar: 'امسح منتجًا للبدء' },
  emptyHint: { fr: 'Appuyez sur F1 pour rechercher', ar: 'اضغط F1 للبحث' },
  clear: { fr: 'Vider', ar: 'مسح' },
  subtotal: { fr: 'Sous-total', ar: 'المجموع الفرعي' },
  total: { fr: 'Total à payer', ar: 'الإجمالي' },
  pay: { fr: 'PAYER', ar: 'دفع' },
  caToday: { fr: 'CA du jour', ar: 'مبيعات اليوم' },
  tickets: { fr: 'Tickets', ar: 'تذاكر' },
  quickAdd: { fr: 'Ajout rapide', ar: 'إضافة سريعة' },
  alerts: { fr: 'Alertes', ar: 'تنبيهات' },
};
const t = (k) => T[k]?.[state.lang] || k;

// ---------- Persistence ----------
async function loadData() {
  DB = await window.api.loadDB();
  state.lang = DB.settings?.language || 'fr';
}
async function persist() {
  await window.api.saveDB(DB);
}

// ---------- Render Loop ----------
function render() {
  const app = $('#app');
  // Removed license check - app is always licensed
  document.body.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
  app.innerHTML = renderTitleBar() + renderShell() + renderToast() + renderHotkeyFooter();
  bindEvents();
}

// ---------- License Screen ----------
function renderLicenseScreen() {
  return `
    <div class="license-screen">
      <div class="license-card">
        <div class="license-header">
          <button class="license-close" id="licenseClose" title="Fermer">${ICONS.x}</button>
        </div>
        <div class="logo-big">${ICONS.zap}</div>
        <h1>Supérette Plus</h1>
        <p class="tagline">Système de caisse premium pour superettes algériennes</p>
        <div class="hwid-box">
          <div class="hwid-label">Identifiant matériel (HWID)</div>
          <div class="hwid-val">${state.hwid}</div>
        </div>
        <input type="text" class="key-input" id="licenseKey" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX" maxlength="24">
        <button class="activate-btn" id="activateBtn">${ICONS.lock} Activer la licence</button>
        <p id="licenseError" class="err" style="display:none;"></p>
        <p class="help">
          Communiquez votre <strong>HWID</strong> ci-dessus pour recevoir votre clé d'activation.<br>
          Mode démo : entrez <code>DEMO-DEMO-DEMO-DEMO-DEMO</code> ou cliquez sur le logo 5 fois.
        </p>
      </div>
    </div>
  `;
}

function bindLicenseEvents() {
  const input = $('#licenseKey');
  const btn = $('#activateBtn');
  const err = $('#licenseError');
  const logo = $('.logo-big');
  let logoClicks = 0;

  logo?.addEventListener('click', () => {
    logoClicks++;
    if (logoClicks >= 5) {
      state.licensed = true;
      localStorage.setItem('sp_license', 'demo');
      render();
    }
  });

  const tryActivate = async () => {
    const key = input.value.trim().toUpperCase();
    if (key === 'DEMO-DEMO-DEMO-DEMO-DEMO' || key === 'DEMODEMODEMODEMODEMO') {
      state.licensed = true;
      localStorage.setItem('sp_license', 'demo');
      render();
      return;
    }
    const valid = await window.api.validateLicense(key);
    if (valid) {
      state.licensed = true;
      localStorage.setItem('sp_license', key);
      render();
    } else {
      err.style.display = 'block';
      err.textContent = 'Clé invalide pour ce matériel.';
    }
  };

  btn.addEventListener('click', tryActivate);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryActivate(); });
  input.focus();
}

// ---------- Title Bar ----------
function renderTitleBar() {
  const time = new Date().toLocaleTimeString('fr-FR');
  return `
    <div class="titlebar">
      <div class="left">
        <div class="brand"><span class="pulse"></span>SUPÉRETTE+ <span style="color:rgba(255,255,255,0.3);">v1.0.0</span> | Caisse #1 — ${DB.settings.cashierName}</div>
      </div>
      <div class="right">
        <span class="clock" id="clock">${time}</span>
        <button class="win-btn" id="winMin" title="Réduire">${ICONS.minus}</button>
        <button class="win-btn" id="winMax" title="Agrandir"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="8" height="8"/></svg></button>
        <button class="win-btn close" id="winClose" title="Fermer">${ICONS.x}</button>
      </div>
    </div>
  `;
}

// ---------- Shell ----------
function renderShell() {
  return `
    <div class="shell">
      ${renderSidebar()}
      <div class="main">
        ${renderView()}
      </div>
    </div>
    ${state.showPayment ? renderPaymentModal() : ''}
    ${state.showCarnet ? renderCarnetModal() : ''}
    ${state.showAddProduct ? renderProductModal() : ''}
  `;
}

function renderSidebar() {
  const items = [
    { id: 'caisse', icon: ICONS.cart, label: t('caisse') },
    { id: 'stock', icon: ICONS.package, label: t('stock') },
    { id: 'carnet', icon: ICONS.book, label: t('carnet') },
    { id: 'stats', icon: ICONS.chart, label: t('stats') },
    { id: 'settings', icon: ICONS.settings, label: t('settings') },
  ];
  return `
    <aside class="sidebar">
      <div class="logo">${ICONS.zap}</div>
      ${items.map(i => `
        <button class="nav-btn ${state.view === i.id ? 'active' : ''}" data-view="${i.id}">
          ${i.icon}<span>${i.label}</span>
        </button>
      `).join('')}
      <div class="nav-spacer"></div>
      <button class="nav-btn" id="langToggle" title="Langue">
        ${ICONS.globe}<span>${state.lang === 'fr' ? 'ع' : 'FR'}</span>
      </button>
    </aside>
  `;
}

// ---------- View Router ----------
function renderView() {
  switch (state.view) {
    case 'caisse': return renderCaisse();
    case 'stock': return renderStock();
    case 'carnet': return renderCarnetView();
    case 'stats': return renderStats();
    case 'settings': return renderSettings();
    default: return renderCaisse();
  }
}

// ---------- Caisse ----------
function renderCaisse() {
  return `
    <section class="cart-section">
      ${renderSearchBar()}
      ${renderCartPanel()}
    </section>
    ${renderRightPanel()}
  `;
}

function renderSearchBar() {
  const filtered = state.searchQuery
    ? DB.products.filter(p =>
        p.nameFr.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        p.nameAr.includes(state.searchQuery) ||
        p.barcode.includes(state.searchQuery)
      ).slice(0, 6)
    : [];

  const scanCls = state.scanFlash ? (state.scanFlash.ok ? 'success' : 'error') : '';
  const scanText = state.scanFlash
    ? (state.scanFlash.ok ? '✓ ' + state.scanFlash.name : '✗ inconnu: ' + state.scanFlash.name)
    : t('scanReady');

  return `
    <div class="search-bar">
      <div class="search-input-wrap">
        ${ICONS.search}
        <input type="text" class="search-input" id="searchInput" placeholder="${t('search')}" value="${state.searchQuery}">
        ${filtered.length ? `
          <div class="search-results">
            ${filtered.map(p => `
              <button class="search-result-item" data-add-product="${p.id}">
                <div>
                  <div class="name">${state.lang === 'ar' ? p.nameAr : p.nameFr}</div>
                  <div class="barcode">${p.barcode}</div>
                </div>
                <div class="price">${fmt(p.price)} <span style="font-size:10px;color:rgba(255,255,255,0.4);">DA</span></div>
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="scan-indicator ${scanCls}">
        <span class="dot"></span>
        <span>${scanText}</span>
      </div>
    </div>
  `;
}

function renderCartPanel() {
  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tva = subtotal * (DB.settings.taxRate || 0.09);
  const timbre = subtotal >= (DB.settings.timbreThreshold || 1000) ? subtotal * (DB.settings.timbreRate || 0.01) : 0;
  const total = subtotal + timbre;
  const ticketNo = String(Math.floor(Math.random() * 9000) + 1000);

  return `
    <div class="cart-panel">
      <div class="cart-header">
        <h2>${ICONS.receipt}${t('cart')} <span class="ticket-no">#${ticketNo}</span></h2>
        ${state.cart.length ? `<button class="cart-clear" id="clearCart">${ICONS.trash} ${t('clear')} (F5)</button>` : ''}
      </div>
      <div class="cart-items">
        ${state.cart.length === 0 ? `
          <div class="cart-empty">
            <div class="icon">${ICONS.cart}</div>
            <p>${t('empty')}</p>
            <p class="hint">${t('emptyHint')}</p>
          </div>
        ` : state.cart.map((item, idx) => `
          <div class="cart-item" data-item-id="${item.id}">
            <div class="idx">${String(idx + 1).padStart(2, '0')}</div>
            <div class="info">
              <div class="name">${state.lang === 'ar' ? item.nameAr : item.nameFr}</div>
              <div class="meta">${item.barcode.slice(-6)} · ${fmt(item.price)} DA</div>
            </div>
            <div class="qty">
              <button class="qty-btn" data-qty-decr="${item.id}">${ICONS.minus}</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" data-qty-incr="${item.id}">${ICONS.plus}</button>
            </div>
            <div class="total">${fmt(item.price * item.qty)} <span class="da">DA</span></div>
            <button class="remove" data-remove="${item.id}">${ICONS.x}</button>
          </div>
        `).join('')}
      </div>
      <div class="totals">
        <div class="totals-line"><span>${t('subtotal')}</span><span class="val">${fmt(subtotal)} DA</span></div>
        <div class="totals-line"><span>TVA (${Math.round((DB.settings.taxRate || 0.09) * 100)}%)</span><span class="val">${fmt(tva)} DA</span></div>
        ${timbre > 0 ? `<div class="totals-line timbre"><span>Timbre de quittance (1%)</span><span class="val">${fmt(timbre)} DA</span></div>` : ''}
        <div class="totals-divider"></div>
        <div class="totals-final">
          <div>
            <div class="label">${t('total')}</div>
            <div class="amount">${fmt(total)}<span class="da">DA</span></div>
          </div>
          <button class="btn-pay" id="payBtn" ${state.cart.length === 0 ? 'disabled' : ''}>
            ${t('pay')} <span class="key">F9</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderRightPanel() {
  const today = todayStr();
  const todayTx = DB.transactions.filter(t => t.date.startsWith(today));
  const ca = todayTx.reduce((s, t) => s + t.total, 0);
  const lowStock = DB.products.filter(p => p.stock <= (p.minStock || 10)).slice(0, 3);
  const expiring = DB.products
    .filter(p => p.expiryDate && (new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) < 30)
    .slice(0, 2);

  return `
    <aside class="right-panel">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="label">${t('caToday')}</div>
          <div class="value">${fmt(ca)} <span class="da">DA</span></div>
        </div>
        <div class="stat-card">
          <div class="label">${t('tickets')}</div>
          <div class="value">${todayTx.length}</div>
        </div>
      </div>
      <div class="quick-categories">
        <h3>${t('quickAdd')}</h3>
        <div class="cat-grid">
          ${QUICK_CATEGORIES.map(cat => `
            <button class="cat-btn ${cat.id}" data-cat="${cat.id}">
              <span class="emoji">${cat.icon}</span>
              <span class="label">${state.lang === 'ar' ? cat.labelAr : cat.labelFr}</span>
            </button>
          `).join('')}
        </div>
      </div>
      ${(lowStock.length || expiring.length) ? `
        <div class="alerts">
          <h3>${ICONS.alert}${t('alerts')}</h3>
          ${lowStock.map(p => `<div class="alert-item"><span>${p.nameFr}</span><span class="val">${p.stock} restants</span></div>`).join('')}
          ${expiring.map(p => {
            const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            return `<div class="alert-item"><span>${p.nameFr} (exp.)</span><span class="val ${days <= 7 ? 'danger' : ''}">${days <= 0 ? 'expiré' : days + 'j'}</span></div>`;
          }).join('')}
        </div>
      ` : ''}
    </aside>
  `;
}

// ---------- Stock View ----------
function renderStock() {
  return `
    <div class="view-container">
      <div class="view-header">
        <h1>${t('stock')} <span style="color:rgba(255,255,255,0.4);font-size:14px;font-weight:400;">— ${DB.products.length} produits</span></h1>
        <div class="actions">
          <button class="btn btn-secondary" id="exportBackup">${ICONS.download} Sauvegarder</button>
          <button class="btn btn-secondary" id="importBackup">${ICONS.upload} Restaurer</button>
          <button class="btn btn-primary" id="addProduct">${ICONS.plus} Nouveau produit</button>
        </div>
      </div>
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>Code-barres</th>
              <th>Nom (FR)</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>Expiration</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${DB.products.map(p => {
              const stockCls = p.stock <= (p.minStock || 10) / 2 ? 'stock-low' : p.stock <= (p.minStock || 10) ? 'stock-warn' : '';
              return `
                <tr>
                  <td class="mono" style="color:rgba(255,255,255,0.5);font-size:11px;">${p.barcode}</td>
                  <td>${p.nameFr}<div style="font-size:11px;color:rgba(255,255,255,0.4);">${p.nameAr}</div></td>
                  <td><span style="text-transform:capitalize;color:rgba(255,255,255,0.6);">${p.category}</span></td>
                  <td class="mono">${fmt(p.price)} DA</td>
                  <td class="mono ${stockCls}">${p.stock}</td>
                  <td class="mono" style="font-size:11px;">${p.expiryDate || '—'}</td>
                  <td class="row-actions">
                    <button data-edit-product="${p.id}">Éditer</button>
                    <button class="danger" data-delete-product="${p.id}">Suppr.</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ---------- Carnet View ----------
function renderCarnetView() {
  const totalDue = DB.customers.reduce((s, c) => s + c.balance, 0);
  return `
    <div class="view-container">
      <div class="view-header">
        <h1>${t('carnet')} <span style="color:rgba(255,255,255,0.4);font-size:14px;font-weight:400;">— الكريدي / Crédit clients</span></h1>
        <button class="btn btn-primary" id="addCustomer">${ICONS.plus} Nouveau client</button>
      </div>
      <div class="carnet-stats">
        <div class="stat"><div class="stat-label">Total dû</div><div class="stat-val amber">${fmt(totalDue)} DA</div></div>
        <div class="stat"><div class="stat-label">Clients actifs</div><div class="stat-val">${DB.customers.length}</div></div>
        <div class="stat"><div class="stat-label">Encaissé ce mois</div><div class="stat-val">—</div></div>
      </div>
      <div>
        ${DB.customers.map(c => `
          <div class="carnet-customer">
            <div class="info">
              <div class="avatar">${c.name[0]}</div>
              <div>
                <div class="name">${c.name}</div>
                <div class="meta">${c.phone || 'Aucun téléphone'}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:16px;">
              <div>
                <div class="balance">${fmt(c.balance)} DA</div>
                <div class="balance-label">à devoir</div>
              </div>
              <button class="pay-btn" data-pay-customer="${c.id}">Encaisser</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ---------- Stats View ----------
function renderStats() {
  const today = todayStr();
  const todayTx = DB.transactions.filter(t => t.date.startsWith(today));
  const totalCA = DB.transactions.reduce((s, t) => s + t.total, 0);
  const last7 = DB.transactions.filter(t => (new Date() - new Date(t.date)) < 7 * 24 * 60 * 60 * 1000);
  const ca7 = last7.reduce((s, t) => s + t.total, 0);

  // Top sellers
  const productCounts = {};
  DB.transactions.forEach(tx => {
    tx.items?.forEach(it => {
      productCounts[it.id] = (productCounts[it.id] || 0) + it.qty;
    });
  });
  const topSellers = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, qty]) => ({ product: DB.products.find(p => p.id === parseInt(id)), qty }));

  return `
    <div class="view-container">
      <div class="view-header">
        <h1>${t('stats')}</h1>
      </div>
      <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px;">
        <div class="stat-card"><div class="label">CA aujourd'hui</div><div class="value">${fmt(todayTx.reduce((s,t)=>s+t.total,0))} <span class="da">DA</span></div></div>
        <div class="stat-card"><div class="label">CA 7 derniers jours</div><div class="value">${fmt(ca7)} <span class="da">DA</span></div></div>
        <div class="stat-card"><div class="label">CA total</div><div class="value">${fmt(totalCA)} <span class="da">DA</span></div></div>
        <div class="stat-card"><div class="label">Total ventes</div><div class="value">${DB.transactions.length}</div></div>
      </div>
      <div class="data-table">
        <table>
          <thead><tr><th>Produit</th><th>Quantité vendue</th><th>Stock restant</th></tr></thead>
          <tbody>
            ${topSellers.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:rgba(255,255,255,0.4);padding:40px;">Aucune vente enregistrée pour le moment</td></tr>' :
              topSellers.map(({product, qty}) => product ? `
                <tr>
                  <td>${product.nameFr}</td>
                  <td class="mono">${qty}</td>
                  <td class="mono">${product.stock}</td>
                </tr>
              ` : '').join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ---------- Settings View ----------
function renderSettings() {
  const s = DB.settings;
  return `
    <div class="view-container">
      <div class="view-header">
        <h1>${t('settings')}</h1>
        <button class="btn btn-primary" id="saveSettings">Sauvegarder</button>
      </div>
      <div class="data-table" style="padding: 24px;">
        <h3 style="margin-bottom:16px;font-size:14px;color:rgba(255,255,255,0.7);">Magasin</h3>
        <div class="form-grid">
          <div class="form-field"><label>Nom du magasin</label><input id="set-shopName" value="${s.shopName}"></div>
          <div class="form-field"><label>Caissier(e)</label><input id="set-cashierName" value="${s.cashierName}"></div>
          <div class="form-field"><label>Adresse</label><input id="set-shopAddress" value="${s.shopAddress}"></div>
          <div class="form-field"><label>Téléphone</label><input id="set-shopPhone" value="${s.shopPhone}"></div>
          <div class="form-field"><label>NIF</label><input id="set-shopNif" value="${s.shopNif}"></div>
          <div class="form-field"><label>Largeur imprimante (mm)</label><input id="set-printerWidth" type="number" value="${s.printerWidth}"></div>
        </div>
        <h3 style="margin:24px 0 16px;font-size:14px;color:rgba(255,255,255,0.7);">Taxes</h3>
        <div class="form-grid">
          <div class="form-field"><label>TVA (%)</label><input id="set-taxRate" type="number" step="0.01" value="${s.taxRate * 100}"></div>
          <div class="form-field"><label>Timbre (%)</label><input id="set-timbreRate" type="number" step="0.01" value="${s.timbreRate * 100}"></div>
          <div class="form-field"><label>Seuil timbre (DA)</label><input id="set-timbreThreshold" type="number" value="${s.timbreThreshold}"></div>
        </div>
        <h3 style="margin:24px 0 16px;font-size:14px;color:rgba(255,255,255,0.7);">Apparence</h3>
        <div class="form-grid">
          <div class="form-field"><label>Thème</label>
            <select id="set-theme">
              <option value="dark" ${s.theme === 'dark' ? 'selected' : ''}>Mode sombre</option>
              <option value="light" ${s.theme === 'light' ? 'selected' : ''}>Mode clair</option>
            </select>
          </div>
        </div>
        <h3 style="margin:24px 0 16px;font-size:14px;color:rgba(255,255,255,0.7);">Licence</h3>
        <div style="padding:16px;background:rgba(0,0,0,0.3);border-radius:12px;">
          <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:6px;">Identifiant matériel (HWID)</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:#f87171;letter-spacing:0.1em;">${state.hwid}</div>
        </div>
      </div>
    </div>
  `;
}

// ---------- Modals ----------
function renderPaymentModal() {
  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const timbre = subtotal >= (DB.settings.timbreThreshold || 1000) ? subtotal * (DB.settings.timbreRate || 0.01) : 0;
  const total = subtotal + timbre;

  return `
    <div class="modal-backdrop" id="paymentBackdrop">
      <div class="modal" id="paymentModal">
        <div class="modal-header">
          <div>
            <h2>Encaissement</h2>
            <p class="subtitle">Sélectionnez le mode de paiement</p>
          </div>
          <button class="modal-close" id="closePayment">${ICONS.x}</button>
        </div>
        <div class="modal-body center">
          <div style="font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;">Total</div>
          <div class="total-display">${fmt(total)}<span class="da">DA</span></div>
        </div>
        <div class="modal-body" id="paymentBody">
          <div class="payment-methods">
            <button class="payment-method cash" data-method="cash">${ICONS.cash}<span>Espèces</span></button>
            <button class="payment-method card" data-method="card">${ICONS.card}<span>CIB</span></button>
            <button class="payment-method mobile" data-method="mobile">${ICONS.phone}<span>BaridiMob</span></button>
            <button class="payment-method carnet" data-method="carnet" style="grid-column:1/-1;">${ICONS.book}<span>Mettre sur Carnet (Crédit)</span></button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCarnetModal() {
  return `
    <div class="modal-backdrop" id="carnetBackdrop">
      <div class="modal" id="carnetModal" style="max-width:560px;">
        <div class="modal-header">
          <div>
            <h2>Choisir un client (Carnet)</h2>
            <p class="subtitle">Sur quel compte mettre ce ticket ?</p>
          </div>
          <button class="modal-close" id="closeCarnet">${ICONS.x}</button>
        </div>
        <div class="modal-body">
          ${DB.customers.map(c => `
            <div class="carnet-customer" data-assign-customer="${c.id}" style="cursor:pointer;">
              <div class="info">
                <div class="avatar">${c.name[0]}</div>
                <div>
                  <div class="name">${c.name}</div>
                  <div class="meta">Doit actuellement: ${fmt(c.balance)} DA</div>
                </div>
              </div>
              <button class="pay-btn">Sélectionner</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderProductModal() {
  const p = state.editingProduct || {};
  return `
    <div class="modal-backdrop" id="productBackdrop">
      <div class="modal">
        <div class="modal-header">
          <div>
            <h2>${p.id ? 'Éditer produit' : 'Nouveau produit'}</h2>
          </div>
          <button class="modal-close" id="closeProduct">${ICONS.x}</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-field"><label>Code-barres</label><input id="p-barcode" value="${p.barcode || ''}"></div>
            <div class="form-field"><label>Catégorie</label>
              <select id="p-category">
                ${QUICK_CATEGORIES.map(c => `<option value="${c.id}" ${p.category === c.id ? 'selected' : ''}>${c.labelFr}</option>`).join('')}
              </select>
            </div>
            <div class="form-field"><label>Nom (Français)</label><input id="p-nameFr" value="${p.nameFr || ''}"></div>
            <div class="form-field"><label>Nom (Arabe)</label><input id="p-nameAr" value="${p.nameAr || ''}" dir="rtl"></div>
            <div class="form-field"><label>Prix de vente (DA)</label><input id="p-price" type="number" step="0.01" value="${p.price || ''}"></div>
            <div class="form-field"><label>Coût d'achat (DA)</label><input id="p-cost" type="number" step="0.01" value="${p.cost || ''}"></div>
            <div class="form-field"><label>Stock</label><input id="p-stock" type="number" value="${p.stock ?? ''}"></div>
            <div class="form-field"><label>Stock minimum</label><input id="p-minStock" type="number" value="${p.minStock || 10}"></div>
            <div class="form-field"><label>Date d'expiration</label><input id="p-expiryDate" type="date" value="${p.expiryDate || ''}"></div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-back" id="cancelProduct">Annuler</button>
          <button class="btn-confirm" id="saveProduct">Enregistrer</button>
        </div>
      </div>
    </div>
  `;
}

// ---------- Toast ----------
function renderToast() {
  if (!state.toast) return '';
  return `
    <div class="toast ${state.toast.type === 'error' ? 'error' : ''}">
      <div class="icon">${state.toast.type === 'error' ? ICONS.alert : ICONS.receipt}</div>
      <div>
        <div class="msg">${state.toast.msg}</div>
        ${state.toast.sub ? `<div class="sub">${state.toast.sub}</div>` : ''}
      </div>
    </div>
  `;
}

function renderHotkeyFooter() {
  return `
    <div class="hotkey-footer">
      <span><kbd>F1</kbd> Recherche</span>
      <span><kbd>F5</kbd> Vider</span>
      <span><kbd>F8</kbd> Carnet</span>
      <span><kbd>F9</kbd> Payer</span>
      <span><kbd>Entrée</kbd> Encaisser</span>
    </div>
  `;
}

function showToast(msg, sub, type = 'success') {
  state.toast = { msg, sub, type };
  render();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { state.toast = null; render(); }, 3500);
}

// ---------- Cart Operations ----------
function addToCart(product) {
  const existing = state.cart.find(i => i.id === product.id);
  if (existing) existing.qty++;
  else state.cart.push({ ...product, qty: 1 });
  render();
}

function updateQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(i => i.id !== id);
  render();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  render();
}

function clearCart() {
  state.cart = [];
  render();
}

// ---------- Sale Completion ----------
async function completeSale(method, customerId = null) {
  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const timbre = subtotal >= (DB.settings.timbreThreshold || 1000) ? subtotal * (DB.settings.timbreRate || 0.01) : 0;
  const total = subtotal + timbre;

  // Decrement stock
  state.cart.forEach(item => {
    const p = DB.products.find(p => p.id === item.id);
    if (p) p.stock = Math.max(0, p.stock - item.qty);
  });

  // Record transaction
  const tx = {
    id: DB.nextTransactionId++,
    date: new Date().toISOString(),
    items: state.cart.map(i => ({ id: i.id, name: i.nameFr, qty: i.qty, price: i.price })),
    subtotal, timbre, total,
    method,
    customerId,
  };
  DB.transactions.unshift(tx);

  // Carnet update
  if (method === 'carnet' && customerId) {
    const c = DB.customers.find(c => c.id === customerId);
    if (c) c.balance += total;
  }

  await persist();

  // Print ticket
  const ticketHtml = generateTicketHtml(tx);
  await window.api.printTicket(ticketHtml);

  showToast(`Vente complétée — ${method}`, `${state.cart.length} articles · ${fmt(total)} DA · ticket imprimé`);

  state.cart = [];
  state.showPayment = false;
  state.showCarnet = false;
  render();
}

function generateTicketHtml(tx) {
  const s = DB.settings;
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Courier New', monospace; font-size: 12px; padding: 8px; width: ${s.printerWidth}mm; color: #000; }
      .center { text-align: center; }
      .right { text-align: right; }
      .bold { font-weight: bold; }
      .big { font-size: 16px; }
      hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
      table { width: 100%; }
      td { padding: 1px 0; vertical-align: top; }
      .total-row td { font-size: 14px; font-weight: bold; padding-top: 4px; }
    </style></head><body>
      <div class="center bold big">${s.shopName}</div>
      <div class="center">${s.shopAddress}</div>
      <div class="center">Tél: ${s.shopPhone}</div>
      <div class="center">NIF: ${s.shopNif}</div>
      <hr>
      <table>
        <tr><td>Ticket #${tx.id}</td><td class="right">${new Date(tx.date).toLocaleString('fr-FR')}</td></tr>
        <tr><td>Caissier(e):</td><td class="right">${s.cashierName}</td></tr>
      </table>
      <hr>
      <table>
        ${tx.items.map(i => `
          <tr>
            <td colspan="2">${i.name}</td>
          </tr>
          <tr>
            <td>${i.qty} x ${fmt(i.price)}</td>
            <td class="right">${fmt(i.qty * i.price)} DA</td>
          </tr>
        `).join('')}
      </table>
      <hr>
      <table>
        <tr><td>Sous-total</td><td class="right">${fmt(tx.subtotal)} DA</td></tr>
        ${tx.timbre > 0 ? `<tr><td>Timbre 1%</td><td class="right">${fmt(tx.timbre)} DA</td></tr>` : ''}
        <tr class="total-row"><td>TOTAL</td><td class="right">${fmt(tx.total)} DA</td></tr>
        <tr><td>Mode</td><td class="right">${tx.method.toUpperCase()}</td></tr>
      </table>
      <hr>
      <div class="center">Merci de votre visite !</div>
      <div class="center">شكرا لزيارتكم</div>
      <div class="center" style="margin-top:8px;font-size:10px;">Powered by Supérette+</div>
    </body></html>
  `;
}

// ---------- Event Bindings ----------
function bindEvents() {
  // Window controls
  $('#winMin')?.addEventListener('click', () => window.api.minimize());
  $('#winMax')?.addEventListener('click', () => window.api.maximize());
  $('#winClose')?.addEventListener('click', () => window.api.close());

  // Sidebar nav
  $$('.nav-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.view;
      render();
    });
  });

  $('#langToggle')?.addEventListener('click', () => {
    state.lang = state.lang === 'fr' ? 'ar' : 'fr';
    DB.settings.language = state.lang;
    persist();
    render();
  });

  // Search
  const searchInput = $('#searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      render();
      $('#searchInput')?.focus();
      $('#searchInput').setSelectionRange(state.searchQuery.length, state.searchQuery.length);
    });
  }

  $$('[data-add-product]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = DB.products.find(p => p.id === parseInt(btn.dataset.addProduct));
      if (p) {
        addToCart(p);
        state.searchQuery = '';
      }
    });
  });

  // Cart
  $$('[data-qty-incr]').forEach(b => b.addEventListener('click', () => updateQty(parseInt(b.dataset.qtyIncr), 1)));
  $$('[data-qty-decr]').forEach(b => b.addEventListener('click', () => updateQty(parseInt(b.dataset.qtyDecr), -1)));
  $$('[data-remove]').forEach(b => b.addEventListener('click', () => removeFromCart(parseInt(b.dataset.remove))));
  $('#clearCart')?.addEventListener('click', clearCart);
  $('#payBtn')?.addEventListener('click', () => { if (state.cart.length) { state.showPayment = true; render(); } });

  // Quick categories
  $$('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = DB.products.find(p => p.category === btn.dataset.cat);
      if (product) addToCart(product);
    });
  });

  // Payment modal
  $('#closePayment')?.addEventListener('click', () => { state.showPayment = false; render(); });
  $('#paymentBackdrop')?.addEventListener('click', (e) => { if (e.target.id === 'paymentBackdrop') { state.showPayment = false; render(); } });
  $$('[data-method]').forEach(btn => {
    btn.addEventListener('click', () => {
      const method = btn.dataset.method;
      if (method === 'carnet') {
        state.showPayment = false;
        state.showCarnet = true;
        render();
      } else if (method === 'cash') {
        showCashEntry();
      } else {
        completeSale(method === 'card' ? 'CIB' : 'BaridiMob');
      }
    });
  });

  // Carnet modal
  $('#closeCarnet')?.addEventListener('click', () => { state.showCarnet = false; render(); });
  $('#carnetBackdrop')?.addEventListener('click', (e) => { if (e.target.id === 'carnetBackdrop') { state.showCarnet = false; render(); } });
  $$('[data-assign-customer]').forEach(el => {
    el.addEventListener('click', () => {
      const cid = parseInt(el.dataset.assignCustomer);
      completeSale('carnet', cid);
    });
  });

  // Stock view
  $('#addProduct')?.addEventListener('click', () => { state.editingProduct = null; state.showAddProduct = true; render(); });
  $$('[data-edit-product]').forEach(b => b.addEventListener('click', () => {
    state.editingProduct = DB.products.find(p => p.id === parseInt(b.dataset.editProduct));
    state.showAddProduct = true;
    render();
  }));
  $$('[data-delete-product]').forEach(b => b.addEventListener('click', () => {
    if (confirm('Supprimer ce produit ?')) {
      DB.products = DB.products.filter(p => p.id !== parseInt(b.dataset.deleteProduct));
      persist();
      render();
    }
  }));

  // Product modal
  $('#closeProduct')?.addEventListener('click', () => { state.showAddProduct = false; render(); });
  $('#cancelProduct')?.addEventListener('click', () => { state.showAddProduct = false; render(); });
  $('#productBackdrop')?.addEventListener('click', (e) => { if (e.target.id === 'productBackdrop') { state.showAddProduct = false; render(); } });
  $('#saveProduct')?.addEventListener('click', () => {
    const data = {
      barcode: $('#p-barcode').value.trim(),
      category: $('#p-category').value,
      nameFr: $('#p-nameFr').value.trim(),
      nameAr: $('#p-nameAr').value.trim(),
      price: parseFloat($('#p-price').value) || 0,
      cost: parseFloat($('#p-cost').value) || 0,
      stock: parseInt($('#p-stock').value) || 0,
      minStock: parseInt($('#p-minStock').value) || 10,
      expiryDate: $('#p-expiryDate').value || null,
    };
    if (!data.barcode || !data.nameFr) { alert('Code-barres et nom requis'); return; }
    if (state.editingProduct) {
      Object.assign(state.editingProduct, data);
    } else {
      DB.products.push({ id: DB.nextProductId++, ...data });
    }
    persist();
    state.showAddProduct = false;
    state.editingProduct = null;
    render();
    showToast('Produit enregistré', data.nameFr);
  });

  // Carnet pay (encaisser)
  $$('[data-pay-customer]').forEach(b => b.addEventListener('click', () => {
    const c = DB.customers.find(c => c.id === parseInt(b.dataset.payCustomer));
    if (!c) return;
    const amt = prompt(`Encaisser combien pour ${c.name} ? (Doit: ${fmt(c.balance)} DA)`, c.balance);
    if (amt && !isNaN(amt)) {
      c.balance = Math.max(0, c.balance - parseFloat(amt));
      persist();
      render();
      showToast('Paiement enregistré', `${fmt(amt)} DA encaissés`);
    }
  }));

  // Settings save
  $('#saveSettings')?.addEventListener('click', () => {
    DB.settings.shopName = $('#set-shopName').value;
    DB.settings.cashierName = $('#set-cashierName').value;
    DB.settings.shopAddress = $('#set-shopAddress').value;
    DB.settings.shopPhone = $('#set-shopPhone').value;
    DB.settings.shopNif = $('#set-shopNif').value;
    DB.settings.printerWidth = parseInt($('#set-printerWidth').value) || 80;
    DB.settings.taxRate = parseFloat($('#set-taxRate').value) / 100;
    DB.settings.timbreRate = parseFloat($('#set-timbreRate').value) / 100;
    DB.settings.timbreThreshold = parseInt($('#set-timbreThreshold').value) || 1000;
    DB.settings.theme = $('#set-theme').value;
    persist();
    applyTheme(DB.settings.theme);
    showToast('Paramètres sauvegardés');
  });

  // Backup
  $('#exportBackup')?.addEventListener('click', async () => {
    const r = await window.api.exportBackup();
    if (r.success) showToast('Sauvegarde exportée', r.path);
  });
  $('#importBackup')?.addEventListener('click', async () => {
    if (!confirm('Restaurer écrasera vos données actuelles. Continuer ?')) return;
    const r = await window.api.importBackup();
    if (r.success) { DB = r.data; render(); showToast('Données restaurées'); }
  });
}

function showCashEntry() {
  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const timbre = subtotal >= (DB.settings.timbreThreshold || 1000) ? subtotal * (DB.settings.timbreRate || 0.01) : 0;
  const total = subtotal + timbre;
  const quickCash = [...new Set([total, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000, Math.ceil(total / 2000) * 2000])];

  const body = $('#paymentBody');
  body.innerHTML = `
    <label style="font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;display:block;">Montant reçu</label>
    <input type="number" id="cashGiven" class="cash-input" placeholder="0" autofocus>
    <div class="cash-quick">
      ${quickCash.map(v => `<button data-cash-quick="${v}">${fmt(v)}</button>`).join('')}
    </div>
    <div id="changeDisplay"></div>
    <div style="display:flex;gap:8px;margin-top:16px;">
      <button class="btn-back" id="backToMethods">Retour</button>
      <button class="btn-confirm" id="confirmCash" disabled>Valider & Imprimer</button>
    </div>
  `;

  const input = $('#cashGiven');
  const changeDiv = $('#changeDisplay');
  const confirmBtn = $('#confirmCash');

  const updateChange = () => {
    const given = parseFloat(input.value) || 0;
    const change = given - total;
    if (input.value && change >= 0) {
      changeDiv.innerHTML = `<div class="change-display"><span class="label">Monnaie à rendre</span><span class="val">${fmt(change)} DA</span></div>`;
      confirmBtn.disabled = false;
    } else {
      changeDiv.innerHTML = '';
      confirmBtn.disabled = true;
    }
  };

  input.addEventListener('input', updateChange);
  $$('[data-cash-quick]').forEach(b => b.addEventListener('click', () => {
    input.value = b.dataset.cashQuick;
    updateChange();
    input.focus();
  }));
  $('#backToMethods')?.addEventListener('click', () => render());
  confirmBtn.addEventListener('click', () => completeSale('Espèces'));
  input.focus();
}

// ---------- Theme Management ----------
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.setAttribute('data-theme', 'dark');
  }
}

// ---------- Global Keyboard Listener (barcode scanner + hotkeys) ----------
function setupGlobalKeys() {
  window.addEventListener('keydown', (e) => {
    // Don't intercept when typing in inputs (except scanner-style scenarios)
    const inInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT';

    if (!inInput) {
      if (e.key === 'F1') { e.preventDefault(); state.view = 'caisse'; render(); setTimeout(() => $('#searchInput')?.focus(), 50); return; }
      if (e.key === 'F5') { e.preventDefault(); clearCart(); return; }
      if (e.key === 'F8') { e.preventDefault(); state.view = 'carnet'; render(); return; }
      if (e.key === 'F9') { e.preventDefault(); if (state.cart.length) { state.showPayment = true; render(); } return; }
    }

    // Barcode scan: rapid digit sequence + Enter (works even when not focused on inputs)
    if (e.key === 'Enter' && !inInput) {
      if (state.scanBuffer.length >= 6) {
        tryScan(state.scanBuffer);
      } else if (state.cart.length > 0 && !state.showPayment) {
        state.showPayment = true;
        render();
      }
      state.scanBuffer = '';
      return;
    }
    if (!inInput && e.key.length === 1 && /[0-9a-zA-Z]/.test(e.key)) {
      state.scanBuffer += e.key;
      clearTimeout(scanTimer);
      scanTimer = setTimeout(() => { state.scanBuffer = ''; }, 400);
    }
  });
}

function tryScan(code) {
  const product = DB.products.find(p => p.barcode === code);
  if (product) {
    addToCart(product);
    state.scanFlash = { ok: true, name: product.nameFr };
  } else {
    state.scanFlash = { ok: false, name: code };
    render();
  }
  setTimeout(() => { state.scanFlash = null; render(); }, 1500);
  render();
}

// ---------- Clock ----------
setInterval(() => {
  const clock = $('#clock');
  if (clock) clock.textContent = new Date().toLocaleTimeString('fr-FR');
}, 1000);

// ---------- Boot ----------
(async () => {
  await loadData();
  state.hwid = await window.api.getHwId();

  // Removed license validation - app is always licensed
  state.licensed = true;

  // Apply saved theme
  applyTheme(DB.settings?.theme || 'dark');

  setupGlobalKeys();
  render();
})();
