// ========== Supérette Plus ENHANCED — Renderer with 10 Powerful Features ==========
// Features: Analytics | Inventory Auto-Mgmt | Loyalty | Multi-Register | Suppliers | Advanced Payments
// | Professional Receipts | Employee Mgmt | Cloud Backup | Price Management

// ENTERPRISE ENHANCEMENT: Import barcode interceptor with timing heuristic
// This distinguishes scanner vs human typing, preventing text field pollution
const BarcodeInterceptor = require('../lib/barcodeInterceptor');

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n));
const todayStr = () => new Date().toISOString().split('T')[0];

// Create barcode interceptor (ENHANCEMENT 4)
let barcodeInterceptor = null;

// ---------- ENHANCED STATE ----------
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

  // NEW FEATURE STATES
  currentRegister: 1,
  showAnalytics: false,
  showLoyalty: false,
  showSuppliers: false,
  showEmployees: false,
  showPricing: false,
  showBackup: false,
  selectedCustomer: null,
  loyaltyPoints: 0,
  editingSupplier: null,
  editingEmployee: null,
  priceFilter: 'all',
};

let scanTimer = null;
let toastTimer = null;

// ---------- QUICK CATEGORIES ----------
const QUICK_CATEGORIES = [
  { id: 'bread', labelFr: 'Pain', labelAr: 'خبز', icon: '🥖' },
  { id: 'dairy', labelFr: 'Lait', labelAr: 'حليب', icon: '🥛' },
  { id: 'drinks', labelFr: 'Boissons', labelAr: 'مشروبات', icon: '🥤' },
  { id: 'snacks', labelFr: 'Snacks', labelAr: 'وجبات', icon: '🍫' },
  { id: 'grocery', labelFr: 'Épicerie', labelAr: 'بقالة', icon: '🛒' },
  { id: 'household', labelFr: 'Ménage', labelAr: 'منزل', icon: '🧴' },
];

// ---------- PAYMENT METHODS ----------
const PAYMENT_METHODS = [
  { id: 'cash', label: 'Espèces', icon: '💵' },
  { id: 'card', label: 'Carte bancaire', icon: '💳' },
  { id: 'mobile', label: 'BaridiMob', icon: '📱' },
  { id: 'check', label: 'Chèque', icon: '📄' },
  { id: 'transfer', label: 'Virement', icon: '🏦' },
];

// ---------- TRANSLATIONS ----------
const T = {
  caisse: { fr: 'Caisse', ar: 'الصندوق' },
  stock: { fr: 'Stock', ar: 'المخزون' },
  carnet: { fr: 'Carnet', ar: 'الكريدي' },
  stats: { fr: 'Statistiques', ar: 'إحصائيات' },
  analytics: { fr: 'Analytique', ar: 'تحليلات' },
  settings: { fr: 'Réglages', ar: 'الإعدادات' },
  loyalty: { fr: 'Fidélité', ar: 'الولاء' },
  suppliers: { fr: 'Fournisseurs', ar: 'الموردون' },
  employees: { fr: 'Employés', ar: 'الموظفون' },
  pricing: { fr: 'Tarification', ar: 'التسعير' },
  backup: { fr: 'Sauvegarde', ar: 'النسخ الاحتياطي' },
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

  // Title bar
  minimize: { fr: 'Réduire', ar: 'تصغير' },
  maximize: { fr: 'Agrandir', ar: 'تكبير' },
  close: { fr: 'Fermer', ar: 'إغلاق' },

  // Cart panel
  tva: { fr: 'TVA', ar: 'ضريبة القيمة المضافة' },
  timbre: { fr: 'Timbre de quittance', ar: 'طابع الإيصال' },
  loyaltyDiscount: { fr: 'Réduction fidélité', ar: 'خصم الولاء' },

  // Carnet
  carnetClients: { fr: 'Carnet Clients', ar: 'دفتر العملاء' },
  creditManagement: { fr: 'Gestion de crédit', ar: 'إدارة الائتمان' },
  newClient: { fr: 'Nouveau client', ar: 'عميل جديد' },
  totalDue: { fr: 'Total dû', ar: 'المجموع المستحق' },
  activeClients: { fr: 'Clients actifs', ar: 'العملاء النشطون' },
  averagePerAccount: { fr: 'Moyenne par compte', ar: 'المتوسط لكل حساب' },
  noPhone: { fr: 'Aucun téléphone', ar: 'لا يوجد هاتف' },
  noEmail: { fr: 'Pas d\'email', ar: 'لا يوجد بريد إلكتروني' },
  toPay: { fr: 'à devoir', ar: 'مستحق' },
  collect: { fr: 'Encaisser', ar: 'تحصيل' },
  useLoyalty: { fr: 'Utiliser Fidélité', ar: 'استخدام الولاء' },

  // Analytics
  advancedAnalytics: { fr: 'Analytique Avancée', ar: 'التحليلات المتقدمة' },
  exportPDF: { fr: 'Exporter PDF', ar: 'تصدير PDF' },
  compareMonths: { fr: 'Comparer Mois', ar: 'مقارنة الأشهر' },
  caToday: { fr: 'CA aujourd\'hui', ar: 'المبيعات اليوم' },
  ca7Days: { fr: 'CA 7 derniers jours', ar: 'المبيعات 7 أيام الأخيرة' },
  average: { fr: 'Moyenne', ar: 'متوسط' },
  perDay: { fr: 'par jour', ar: 'في اليوم' },
  ca30Days: { fr: 'CA 30 derniers jours', ar: 'المبيعات 30 يوم الأخيرة' },
  totalCA: { fr: 'CA total', ar: 'إجمالي المبيعات' },
  sinceBeginning: { fr: 'Depuis le début', ar: 'منذ البداية' },
  top5Products: { fr: 'Top 5 Produits Vendus (par revenu)', ar: 'أفضل 5 منتجات مباعة (حسب الإيرادات)' },
  noSales: { fr: 'Aucune vente enregistrée', ar: 'لا توجد مبيعات مسجلة' },
  units: { fr: 'unités', ar: 'وحدات' },
  percentage: { fr: '% du total', ar: '% من المجموع' },

  // Loyalty
  loyaltyProgram: { fr: 'Programme Fidélité', ar: 'برنامج الولاء' },
  pointsPerDA: { fr: 'Points/DA', ar: 'نقاط/دج' },
  redeemRate: { fr: 'Taux de change', ar: 'معدل الاستبدال' },
  perPoint: { fr: 'par point', ar: 'لكل نقطة' },
  save: { fr: 'Sauvegarder', ar: 'حفظ' },
  loyaltyTiers: { fr: 'Paliers de Fidélité', ar: 'مستويات الولاء' },
  bronze: { fr: 'Bronze', ar: 'برونزي' },
  silver: { fr: 'Argent', ar: 'فضي' },
  gold: { fr: 'Or', ar: 'ذهبي' },
  platinum: { fr: 'Platinum', ar: 'بلاتيني' },
  clientsAndPoints: { fr: 'Clients et Leurs Points', ar: 'العملاء ونقاطهم' },
  totalSpent: { fr: 'Dépenses Totales', ar: 'إجمالي الإنفاق' },
  points: { fr: 'Points', ar: 'نقاط' },
  tier: { fr: 'Palier', ar: 'المستوى' },
  actions: { fr: 'Actions', ar: 'الإجراءات' },
  addPoints: { fr: '+Points', ar: '+نقاط' },
  redeem: { fr: 'Utiliser', ar: 'استبدال' },

  // Suppliers
  supplierManagement: { fr: 'Gestion des Fournisseurs', ar: 'إدارة الموردين' },
  urgentOrders: { fr: 'Commandes urgentes', ar: 'الطلبات العاجلة' },
  newSupplier: { fr: 'Nouveau fournisseur', ar: 'مورد جديد' },
  noSuppliers: { fr: 'Aucun fournisseur enregistré', ar: 'لا يوجد موردون مسجلون' },
  partner: { fr: 'Partenaire', ar: 'شريك' },
  contact: { fr: 'Contact', ar: 'اتصال' },
  phone: { fr: 'Téléphone', ar: 'هاتف' },
  email: { fr: 'Email', ar: 'بريد إلكتروني' },
  deliveryTime: { fr: 'Délai de livraison', ar: 'مدة التسليم' },
  days: { fr: 'jours', ar: 'أيام' },
  payment: { fr: 'Paiement', ar: 'دفع' },
  viewOrders: { fr: 'Voir commandes', ar: 'عرض الطلبات' },
  edit: { fr: 'Éditer', ar: 'تحرير' },
  newOrder: { fr: 'Nouvelle commande', ar: 'طلب جديد' },

  // Employees
  staffManagement: { fr: 'Gestion du Personnel', ar: 'إدارة الموظفين' },
  shiftReport: { fr: 'Rapport de postes', ar: 'تقرير المناوبات' },
  performance: { fr: 'Performance', ar: 'الأداء' },
  addEmployee: { fr: 'Ajouter employé', ar: 'إضافة موظف' },
  noEmployees: { fr: 'Aucun employé', ar: 'لا يوجد موظفون' },
  seller: { fr: 'Vendeur', ar: 'بائع' },
  active: { fr: 'Actif', ar: 'نشط' },
  inactive: { fr: 'Inactif', ar: 'غير نشط' },
  transactions: { fr: 'Transactions', ar: 'المعاملات' },
  since: { fr: 'Depuis le', ar: 'منذ' },
  disable: { fr: 'Désactiver', ar: 'تعطيل' },
  enable: { fr: 'Réactiver', ar: 'إعادة تفعيل' },

  // Pricing
  priceManagement: { fr: 'Gestion des Prix et Promotions', ar: 'إدارة الأسعار والعروض' },
  activePromotions: { fr: 'Promotions actives', ar: 'العروض النشطة' },
  newPromotion: { fr: 'Nouvelle promotion', ar: 'عرض جديد' },
  currentPromotions: { fr: 'Promotions en cours', ar: 'العروض الحالية' },
  noActivePromotions: { fr: 'Aucune promotion active', ar: 'لا توجد عروض نشطة' },
  noDescription: { fr: 'Sans description', ar: 'بدون وصف' },
  discount: { fr: 'Remise', ar: 'خصم' },
  validUntil: { fr: 'Valide jusqu\'au', ar: 'صالح حتى' },
  products: { fr: 'Produits', ar: 'المنتجات' },
  delete: { fr: 'Supprimer', ar: 'حذف' },

  // Backup
  backupAndSync: { fr: 'Sauvegarde et Synchronisation', ar: 'النسخ الاحتياطي والمزامنة' },
  localBackup: { fr: 'Sauvegarde Locale', ar: 'النسخ الاحتياطي المحلي' },
  backupNow: { fr: 'Sauvegarder Maintenant', ar: 'النسخ الاحتياطي الآن' },
  restoreBackup: { fr: 'Restaurer Sauvegarde', ar: 'استعادة النسخة الاحتياطية' },
  scheduleBackups: { fr: 'Planifier Sauvegardes', ar: 'جدولة النسخ الاحتياطي' },
  cloudBackup: { fr: 'Sauvegarde Cloud (optionnel)', ar: 'النسخ الاحتياطي السحابي (اختياري)' },
  cloudDescription: { fr: 'Connectez un service cloud pour sauvegarder automatiquement vos données', ar: 'ربط خدمة سحابية للنسخ الاحتياطي التلقائي لبياناتك' },
  connectDropbox: { fr: '📦 Connecter Dropbox', ar: '📦 ربط Dropbox' },
  connectGoogleDrive: { fr: '☁️ Google Drive', ar: '☁️ Google Drive' },
  connectAzure: { fr: '🔷 Azure Storage', ar: '🔷 Azure Storage' },
  recentBackups: { fr: 'Dernières Sauvegardes', ar: 'النسخ الاحتياطية الأخيرة' },

  // Settings
  shop: { fr: 'Magasin', ar: 'المتجر' },
  taxes: { fr: 'Taxes', ar: 'الضرائب' },
  appearance: { fr: 'Apparence', ar: 'المظهر' },
  license: { fr: 'Licence', ar: 'الترخيص' },
  shopName: { fr: 'Nom du magasin', ar: 'اسم المتجر' },
  cashier: { fr: 'Caissier(e)', ar: 'الكاشير' },
  address: { fr: 'Adresse', ar: 'العنوان' },
  nif: { fr: 'NIF', ar: 'الرقم الضريبي' },
  printerWidth: { fr: 'Largeur imprimante (mm)', ar: 'عرض الطابعة (مم)' },
  tvaPercent: { fr: 'TVA (%)', ar: 'ضريبة القيمة المضافة (%)' },
  timbrePercent: { fr: 'Timbre (%)', ar: 'الطابع (%)' },
  timbreThreshold: { fr: 'Seuil timbre (DA)', ar: 'حد الطابع (دج)' },
  theme: { fr: 'Thème', ar: 'الموضوع' },
  darkMode: { fr: 'Mode sombre', ar: 'الوضع المظلم' },
  lightMode: { fr: 'Mode clair', ar: 'الوضع الفاتح' },
  hwid: { fr: 'Identifiant matériel (HWID)', ar: 'معرف الجهاز (HWID)' },

  // Modals
  payment: { fr: 'Encaissement', ar: 'الدفع' },
  selectPaymentMethod: { fr: 'Sélectionnez le mode de paiement', ar: 'اختر طريقة الدفع' },
  amountReceived: { fr: 'Montant reçu', ar: 'المبلغ المستلم' },
  changeToReturn: { fr: 'Monnaie à rendre', ar: 'الباقي المرجع' },
  validateAndPrint: { fr: 'Valider & Imprimer', ar: 'التحقق والطباعة' },
  back: { fr: 'Retour', ar: 'العودة' },
  chooseClient: { fr: 'Choisir un client (Carnet)', ar: 'اختيار عميل (الدفتر)' },
  onWhichAccount: { fr: 'Sur quel compte mettre ce ticket ?', ar: 'في أي حساب سيتم وضع هذا التذكرة؟' },
  select: { fr: 'Sélectionner', ar: 'اختيار' },
  editProduct: { fr: 'Éditer produit', ar: 'تحرير المنتج' },
  newProduct: { fr: 'Nouveau produit', ar: 'منتج جديد' },
  cancel: { fr: 'Annuler', ar: 'إلغاء' },
  save: { fr: 'Enregistrer', ar: 'حفظ' },

  // Product form
  barcode: { fr: 'Code-barres', ar: 'الباركود' },
  category: { fr: 'Catégorie', ar: 'الفئة' },
  nameFr: { fr: 'Nom (Français)', ar: 'الاسم (فرنسي)' },
  nameAr: { fr: 'Nom (Arabe)', ar: 'الاسم (عربي)' },
  sellingPrice: { fr: 'Prix de vente (DA)', ar: 'سعر البيع (دج)' },
  costPrice: { fr: 'Coût d\'achat (DA)', ar: 'تكلفة الشراء (دج)' },
  stock: { fr: 'Stock', ar: 'المخزون' },
  minStock: { fr: 'Stock minimum', ar: 'الحد الأدنى للمخزون' },
  expiryDate: { fr: 'Date d\'expiration', ar: 'تاريخ الانتهاء' },

  // Receipt
  ticket: { fr: 'Ticket', ar: 'التذكرة' },
  cashier: { fr: 'Caissier(e)', ar: 'الكاشير' },
  method: { fr: 'Mode', ar: 'الطريقة' },
  thankYou: { fr: 'Merci de votre visite !', ar: 'شكرا لزيارتكم!' },
  poweredBy: { fr: 'Supérette+ v2.0 — Système de Caisse Professionnel', ar: 'Supérette+ v2.0 — نظام كاشير احترافي' },

  // Hotkeys
  searchHotkey: { fr: 'Recherche', ar: 'البحث' },
  clearHotkey: { fr: 'Vider', ar: 'مسح' },
  carnetHotkey: { fr: 'Carnet', ar: 'الدفتر' },
  payHotkey: { fr: 'Payer', ar: 'الدفع' },
  enterHotkey: { fr: 'Encaisser', ar: 'التحصيل' },
};
const t = (k) => T[k]?.[state.lang] || k;

// ---------- ICONS ----------
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
  alert: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  globe: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  zap: '<svg fill="white" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
  lock: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>',
  download: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>',
  upload: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>',
  copy: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
  users: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 8 4 4 0 010-8m3 4H9m8 5.5c0 1.657-.895 3.146-2.225 3.938a1 1 0 01-.89.062M9 20.5C10.33 21.338 11.895 22 13.5 22s3.17-.662 4.5-1.5m-9-5.5a1 1 0 00-.89.062C9.895 16.354 9 17.843 9 19.5M15 10a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  trending: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>',
  heart: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  truck: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
  tag: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>',
  database: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>',
};

// ---------- PERSISTENCE & DATABASE ----------
async function loadData() {
  DB = await window.api.loadDB();
  if (!DB) {
    DB = initializeDB();
  }
  state.lang = DB.settings?.language || 'fr';
}

function initializeDB() {
  return {
    settings: {
      shopName: 'Superette',
      cashierName: 'Caissier',
      shopAddress: 'Algérie',
      shopPhone: '',
      shopNif: '',
      printerWidth: 80,
      taxRate: 0.09,
      timbreRate: 0.01,
      timbreThreshold: 1000,
      theme: 'dark',
      language: 'fr',
    },
    products: [],
    transactions: [],
    customers: [],
    suppliers: [],
    employees: [],
    promotions: [],
    loyaltyProgram: {
      enabled: true,
      pointsPerDA: 0.5,
      redeemRate: 0.01, // 1 point = 0.01 DA
    },
    registers: [
      { id: 1, name: 'Caisse #1', cashier: '', shift: 'day', active: true },
      { id: 2, name: 'Caisse #2', cashier: '', shift: 'day', active: false },
    ],
    nextProductId: 1,
    nextTransactionId: 1,
    nextCustomerId: 1,
    nextSupplierId: 1,
    nextEmployeeId: 1,
  };
}

async function persist() {
  await window.api.saveDB(DB);
}

// ---------- RENDER SYSTEM ----------
function render() {
  const app = $('#app');
  document.body.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
  app.innerHTML = renderTitleBar() + renderShell() + renderToast() + renderHotkeyFooter();
  bindEvents();
}

// ---------- TITLE BAR ----------
function renderTitleBar() {
  const time = new Date().toLocaleTimeString('fr-FR');
  const register = DB.registers?.find(r => r.id === state.currentRegister);
  return `
    <div class="titlebar">
      <div class="left">
        <div class="brand"><span class="pulse"></span>SUPÉRETTE+ <span style="color:rgba(255,255,255,0.3);">v2.0</span> | ${register?.name || 'Caisse #1'} — ${DB.settings.cashierName}</div>
      </div>
      <div class="right">
        <span class="clock" id="clock">${time}</span>
        <button class="win-btn" id="winMin" title="${t('minimize')}">${ICONS.minus}</button>
        <button class="win-btn" id="winMax" title="${t('maximize')}"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="8" height="8"/></svg></button>
        <button class="win-btn close" id="winClose" title="${t('close')}">${ICONS.x}</button>
      </div>
    </div>
  `;
}

// ---------- SHELL ----------
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
    ${state.showAnalytics ? renderAnalyticsModal() : ''}
    ${state.showLoyalty ? renderLoyaltyModal() : ''}
    ${state.showSuppliers ? renderSuppliersModal() : ''}
    ${state.showEmployees ? renderEmployeesModal() : ''}
    ${state.showPricing ? renderPricingModal() : ''}
    ${state.showBackup ? renderBackupModal() : ''}
  `;
}

// ---------- SIDEBAR ----------
function renderSidebar() {
  const items = [
    { id: 'caisse', icon: ICONS.cart, label: t('caisse') },
    { id: 'stock', icon: ICONS.package, label: t('stock') },
    { id: 'carnet', icon: ICONS.book, label: t('carnet') },
    { id: 'stats', icon: ICONS.chart, label: t('stats') },
    { id: 'analytics', icon: ICONS.trending, label: t('analytics') },
    { id: 'loyalty', icon: ICONS.heart, label: t('loyalty') },
    { id: 'suppliers', icon: ICONS.truck, label: t('suppliers') },
    { id: 'employees', icon: ICONS.users, label: t('employees') },
    { id: 'pricing', icon: ICONS.tag, label: t('pricing') },
    { id: 'backup', icon: ICONS.database, label: t('backup') },
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

// ---------- VIEW ROUTER ----------
function renderView() {
  switch (state.view) {
    case 'caisse': return renderCaisse();
    case 'stock': return renderStock();
    case 'carnet': return renderCarnetView();
    case 'stats': return renderStats();
    case 'analytics': return renderAnalytics();
    case 'loyalty': return renderLoyaltyView();
    case 'suppliers': return renderSuppliersView();
    case 'employees': return renderEmployeesView();
    case 'pricing': return renderPricingView();
    case 'backup': return renderBackupView();
    case 'settings': return renderSettings();
    default: return renderCaisse();
  }
}

// ========== FEATURE 1: CAISSE (Point of Sale) ==========
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

  // FEATURE 4: Apply discount if using loyalty program
  let loyaltyDiscount = 0;
  if (state.selectedCustomer && state.loyaltyPoints > 0) {
    const maxDiscount = state.loyaltyPoints * (DB.loyaltyProgram?.redeRate || 0.01);
    loyaltyDiscount = Math.min(maxDiscount, subtotal * 0.1); // Max 10% discount
  }

  const total = subtotal + tva + timbre - loyaltyDiscount;
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
        <div class="totals-line"><span>${t('tva')} (${Math.round((DB.settings.taxRate || 0.09) * 100)}%)</span><span class="val">${fmt(tva)} DA</span></div>
        ${timbre > 0 ? `<div class="totals-line timbre"><span>${t('timbre')} (1%)</span><span class="val">${fmt(timbre)} DA</span></div>` : ''}
        ${loyaltyDiscount > 0 ? `<div class="totals-line loyalty"><span>${t('loyaltyDiscount')}</span><span class="val">-${fmt(loyaltyDiscount)} DA</span></div>` : ''}
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

  // FEATURE 2: Inventory Auto-Management Alerts
  const lowStock = DB.products.filter(p => p.stock <= (p.minStock || 10)).slice(0, 3);
  const expiring = DB.products
    .filter(p => p.expiryDate && (new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) < 30)
    .slice(0, 2);

  // FEATURE 1: Customer loyalty display
  const loyaltyInfo = state.selectedCustomer ? `
    <div class="loyalty-card">
      <div>${ICONS.heart} Client: ${state.selectedCustomer.name}</div>
      <div>Points: ${state.loyaltyPoints.toFixed(0)}</div>
      <button id="clearLoyaltyBtn" class="btn-small">Désélectionner</button>
    </div>
  ` : '';

  return `
    <aside class="right-panel">
      ${loyaltyInfo}
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
        <h3>Catégories</h3>
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
          <h3>${ICONS.alert}Alertes Stock</h3>
          ${lowStock.map(p => `<div class="alert-item low-stock"><span>${p.nameFr}</span><span class="val">${p.stock} restants</span></div>`).join('')}
          ${expiring.map(p => {
            const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            return `<div class="alert-item ${days <= 7 ? 'expiring-soon' : 'expiring'}"><span>${p.nameFr}</span><span class="val">${days <= 0 ? 'EXPIRÉ' : days + 'j'}</span></div>`;
          }).join('')}
        </div>
      ` : ''}
    </aside>
  `;
}

// ========== FEATURE 2: INVENTORY MANAGEMENT ==========
function renderStock() {
  return `
    <div class="view-container">
      <div class="view-header">
        <h1>${t('stock')} <span style="color:rgba(255,255,255,0.4);font-size:14px;font-weight:400;">— ${DB.products.length} ${t('products')}</span></h1>
        <div class="actions">
          <button class="btn btn-secondary" id="lowStockReport">${ICONS.download} ${t('stockReport')}</button>
          <button class="btn btn-secondary" id="expiryReport">${ICONS.alert} ${t('expiry')}</button>
          <button class="btn btn-primary" id="addProduct">${ICONS.plus} ${t('newProduct')}</button>
        </div>
      </div>
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>${t('barcode')}</th>
              <th>${t('nameFr')}</th>
              <th>${t('category')}</th>
              <th>${t('price')}</th>
              <th>${t('stock')}</th>
              <th>${t('min')}</th>
              <th>${t('expiry')}</th>
              <th>${t('stockValue')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${DB.products.map(p => {
              const stockCls = p.stock <= (p.minStock || 10) / 2 ? 'stock-critical' : p.stock <= (p.minStock || 10) ? 'stock-warn' : '';
              const stockValue = (p.cost || p.price) * p.stock;
              return `
                <tr>
                  <td class="mono" style="color:rgba(255,255,255,0.5);font-size:11px;">${p.barcode}</td>
                  <td>${p.nameFr}<div style="font-size:11px;color:rgba(255,255,255,0.4);">${p.nameAr}</div></td>
                  <td><span style="text-transform:capitalize;color:rgba(255,255,255,0.6);">${p.category}</span></td>
                  <td class="mono">${fmt(p.price)} DA</td>
                  <td class="mono ${stockCls}">${p.stock}</td>
                  <td class="mono">${p.minStock || 10}</td>
                  <td class="mono" style="font-size:11px;">${p.expiryDate || '—'}</td>
                  <td class="mono" style="font-size:11px;">${fmt(stockValue)} DA</td>
                  <td class="row-actions">
                    <button data-edit-product="${p.id}">${t('edit')}</button>
                    <button class="danger" data-delete-product="${p.id}">${t('delete')}</button>
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

// ========== FEATURE 3: CREDIT MANAGEMENT ==========
function renderCarnetView() {
  const totalDue = DB.customers.reduce((s, c) => s + c.balance, 0);
  return `
    <div class="view-container">
      <div class="view-header">
        <h1>${t('carnetClients')} <span style="color:rgba(255,255,255,0.4);font-size:14px;font-weight:400;">— ${t('creditManagement')}</span></h1>
        <button class="btn btn-primary" id="addCustomer">${ICONS.plus} ${t('newClient')}</button>
      </div>
      <div class="carnet-stats">
        <div class="stat"><div class="stat-label">${t('totalDue')}</div><div class="stat-val amber">${fmt(totalDue)} DA</div></div>
        <div class="stat"><div class="stat-label">${t('activeClients')}</div><div class="stat-val">${DB.customers.length}</div></div>
        <div class="stat"><div class="stat-label">${t('averagePerAccount')}</div><div class="stat-val">${DB.customers.length > 0 ? fmt(totalDue / DB.customers.length) + ' DA' : '—'}</div></div>
      </div>
      <div>
        ${DB.customers.map(c => `
          <div class="carnet-customer">
            <div class="info">
              <div class="avatar">${c.name[0]}</div>
              <div>
                <div class="name">${c.name}${c.loyaltyTier ? ` <span class="tier">${c.loyaltyTier}</span>` : ''}</div>
                <div class="meta">${c.phone || t('noPhone')} | ${c.email || t('noEmail')}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:16px;">
              <div>
                <div class="balance">${fmt(c.balance)} DA</div>
                <div class="balance-label">${t('toPay')}</div>
              </div>
              <button class="pay-btn" data-pay-customer="${c.id}">${t('collect')}</button>
              <button class="edit-btn" data-select-loyalty="${c.id}">${t('useLoyalty')}</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ========== FEATURE 4: ANALYTICS & REPORTS ==========
function renderAnalytics() {
  const today = todayStr();
  const todayTx = DB.transactions.filter(t => t.date.startsWith(today));
  const last7 = DB.transactions.filter(t => (new Date() - new Date(t.date)) < 7 * 24 * 60 * 60 * 1000);
  const last30 = DB.transactions.filter(t => (new Date() - new Date(t.date)) < 30 * 24 * 60 * 60 * 1000);

  const ca7 = last7.reduce((s, t) => s + t.total, 0);
  const ca30 = last30.reduce((s, t) => s + t.total, 0);
  const totalCA = DB.transactions.reduce((s, t) => s + t.total, 0);

  // Top sellers
  const productCounts = {};
  const productRevenue = {};
  DB.transactions.forEach(tx => {
    tx.items?.forEach(it => {
      productCounts[it.id] = (productCounts[it.id] || 0) + it.qty;
      productRevenue[it.id] = (productRevenue[it.id] || 0) + (it.qty * it.price);
    });
  });
  const topSellers = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, qty]) => ({ product: DB.products.find(p => p.id === parseInt(id)), qty, revenue: productRevenue[id] }));

  // Hourly avg
  const hourlyAvg = todayTx.length > 0 ? Math.round(todayTx.reduce((s, t) => s + t.total, 0) / 24) : 0;

  return `
    <div class="view-container">
      <div class="view-header">
        <h1>Analytique Avancée</h1>
        <div class="actions">
          <button class="btn btn-secondary" id="exportAnalytics">${ICONS.download} Exporter PDF</button>
          <button class="btn btn-secondary" id="compareMonths">Comparer Mois</button>
        </div>
      </div>
      <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px;">
        <div class="stat-card">
          <div class="label">CA aujourd'hui</div>
          <div class="value">${fmt(todayTx.reduce((s, t) => s + t.total, 0))} <span class="da">DA</span></div>
          <div class="subtext">${todayTx.length} tickets</div>
        </div>
        <div class="stat-card">
          <div class="label">CA 7 derniers jours</div>
          <div class="value">${fmt(ca7)} <span class="da">DA</span></div>
          <div class="subtext">Moyenne: ${fmt(ca7 / 7)}/jour</div>
        </div>
        <div class="stat-card">
          <div class="label">CA 30 derniers jours</div>
          <div class="value">${fmt(ca30)} <span class="da">DA</span></div>
          <div class="subtext">Moyenne: ${fmt(ca30 / 30)}/jour</div>
        </div>
        <div class="stat-card">
          <div class="label">CA total</div>
          <div class="value">${fmt(totalCA)} <span class="da">DA</span></div>
          <div class="subtext">Depuis le début</div>
        </div>
      </div>

      <h3>Top 5 Produits Vendus (par revenu)</h3>
      <div class="data-table">
        <table>
          <thead><tr><th>Produit</th><th>Quantité</th><th>Revenu</th><th>% du total</th></tr></thead>
          <tbody>
            ${topSellers.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:rgba(255,255,255,0.4);padding:40px;">Aucune vente enregistrée</td></tr>' :
              topSellers.map(({product, qty, revenue}) => product ? `
                <tr>
                  <td>${product.nameFr}</td>
                  <td class="mono">${qty} unités</td>
                  <td class="mono">${fmt(revenue)} DA</td>
                  <td class="mono">${((revenue / totalCA) * 100).toFixed(1)}%</td>
                </tr>
              ` : '').join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ========== FEATURE 5: LOYALTY PROGRAM ==========
function renderLoyaltyView() {
  const customers = DB.customers.map(c => ({
    ...c,
    points: Math.round((c.totalSpent || 0) * (DB.loyaltyProgram?.pointsPerDA || 0.5)),
    tier: calculateTier(c.totalSpent || 0),
  }));

  return `
    <div class="view-container">
      <div class="view-header">
        <h1>Programme Fidélité</h1>
        <div class="loy-settings">
          <label>Points/DA: </label>
          <input type="number" id="pointRate" value="${DB.loyaltyProgram?.pointsPerDA || 0.5}" step="0.1">
          <label style="margin-left:20px;">Taux de change:</label>
          <input type="number" id="redeemRate" value="${(DB.loyaltyProgram?.redeemRate || 0.01) * 100}" step="0.01">% par point
          <button class="btn btn-primary" id="saveLoyaltySettings">Sauvegarder</button>
        </div>
      </div>

      <div class="loyalty-tiers">
        <h3>Paliers de Fidélité</h3>
        <div class="tier-display">
          <div class="tier-card"><span class="tier-name">Bronze</span><span class="tier-req">0-1000 DA</span></div>
          <div class="tier-card"><span class="tier-name">Argent</span><span class="tier-req">1000-5000 DA</span></div>
          <div class="tier-card"><span class="tier-name">Or</span><span class="tier-req">5000-20000 DA</span></div>
          <div class="tier-card"><span class="tier-name">Platinum</span><span class="tier-req">+20000 DA</span></div>
        </div>
      </div>

      <h3>Clients et Leurs Points</h3>
      <div class="data-table">
        <table>
          <thead>
            <tr><th>Client</th><th>Dépenses Totales</th><th>Points</th><th>Palier</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${customers.length === 0 ? '<tr><td colspan="5">Aucun client</td></tr>' :
              customers.map(c => `
                <tr>
                  <td>${c.name}</td>
                  <td class="mono">${fmt(c.totalSpent || 0)} DA</td>
                  <td class="mono">${c.points}</td>
                  <td><span class="tier ${c.tier.toLowerCase()}">${c.tier}</span></td>
                  <td>
                    <button data-add-points="${c.id}">+Points</button>
                    <button data-redeem-points="${c.id}">Utiliser</button>
                  </td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function calculateTier(totalSpent) {
  if (totalSpent >= 20000) return 'Platinum';
  if (totalSpent >= 5000) return 'Or';
  if (totalSpent >= 1000) return 'Argent';
  return 'Bronze';
}

// ========== FEATURE 6: SUPPLIERS MANAGEMENT ==========
function renderSuppliersView() {
  return `
    <div class="view-container">
      <div class="view-header">
        <h1>${t('supplierManagement')}</h1>
        <div class="actions">
          <button class="btn btn-secondary" id="expiringSupplies">${ICONS.alert} ${t('urgentOrders')}</button>
          <button class="btn btn-primary" id="addSupplier">${ICONS.plus} ${t('newSupplier')}</button>
        </div>
      </div>

      <div class="suppliers-list">
        ${DB.suppliers?.length === 0 ? `
          <div class="empty-state">
            <p>${t('noSuppliers')}</p>
          </div>
        ` : DB.suppliers.map(s => `
          <div class="supplier-card">
            <div class="supplier-header">
              <h3>${s.name}</h3>
              <span class="supplier-type">${s.type || t('partner')}</span>
            </div>
            <div class="supplier-info">
              <p><strong>${t('contact')}:</strong> ${s.contact || '—'}</p>
              <p><strong>${t('phone')}:</strong> ${s.phone || '—'}</p>
              <p><strong>${t('email')}:</strong> ${s.email || '—'}</p>
              <p><strong>${t('deliveryTime')}:</strong> ${s.deliveryDays || '—'} ${t('days')}</p>
              <p><strong>${t('payment')}:</strong> ${s.paymentTerms || '—'}</p>
            </div>
            <div class="supplier-actions">
              <button data-view-orders="${s.id}">${t('viewOrders')}</button>
              <button data-edit-supplier="${s.id}">${t('edit')}</button>
              <button data-new-order="${s.id}">${t('newOrder')}</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ========== FEATURE 7: EMPLOYEE MANAGEMENT ==========
function renderEmployeesView() {
  return `
    <div class="view-container">
      <div class="view-header">
        <h1>${t('employeeManagement')}</h1>
        <div class="actions">
          <button class="btn btn-secondary" id="shiftReport">${ICONS.download} ${t('shiftReport')}</button>
          <button class="btn btn-secondary" id="performanceReport">${t('performance')}</button>
          <button class="btn btn-primary" id="addEmployee">${ICONS.plus} ${t('addEmployee')}</button>
        </div>
      </div>

      <div class="employees-list">
        ${DB.employees?.length === 0 ? `
          <div class="empty-state"><p>${t('noEmployees')}</p></div>
        ` : DB.employees.map(e => {
          const todayTx = DB.transactions?.filter(t => t.cashierId === e.id && t.date.startsWith(todayStr()));
          const todayTotal = todayTx?.reduce((s, t) => s + t.total, 0) || 0;
          return `
            <div class="employee-card">
              <div class="emp-header">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div class="avatar">${e.firstName[0]}${e.lastName[0]}</div>
                  <div>
                    <h3>${e.firstName} ${e.lastName}</h3>
                    <p class="emp-role">${e.role || t('salesperson')}</p>
                  </div>
                </div>
                <span class="emp-status ${e.active ? 'active' : 'inactive'}">${e.active ? t('active') : t('inactive')}</span>
              </div>
              <div class="emp-stats">
                <div><span>${t('todayRevenue')}:</span><span class="mono">${fmt(todayTotal)} DA</span></div>
                <div><span>${t('transactions')}:</span><span class="mono">${todayTx?.length || 0}</span></div>
                <div><span>${t('since')}:</span><span class="mono">${e.hireDate || '—'}</span></div>
              </div>
              <div class="emp-actions">
                <button data-edit-employee="${e.id}">${t('edit')}</button>
                <button data-${e.active ? 'disable' : 'enable'}-employee="${e.id}">${e.active ? t('deactivate') : t('reactivate')}</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ========== FEATURE 8: PRICE MANAGEMENT & PROMOTIONS ==========
function renderPricingView() {
  const promos = DB.promotions || [];
  return `
    <div class="view-container">
      <div class="view-header">
        <h1>${t('priceManagement')}</h1>
        <div class="actions">
          <button class="btn btn-secondary" id="activatePromos">${ICONS.tag} ${t('activePromotions')}</button>
          <button class="btn btn-primary" id="addPromotion">${ICONS.plus} ${t('newPromotion')}</button>
        </div>
      </div>

      <h3>${t('currentPromotions')}</h3>
      <div class="promo-grid">
        ${promos.filter(p => new Date(p.endDate) > new Date()).length === 0 ? `
          <p style="color:rgba(255,255,255,0.4);">${t('noActivePromotions')}</p>
        ` : promos.filter(p => new Date(p.endDate) > new Date()).map(p => `
          <div class="promo-card">
            <div class="promo-header">
              <h4>${p.name}</h4>
              <span class="promo-type">${p.type}</span>
            </div>
            <p class="promo-desc">${p.description || t('noDescription')}</p>
            <div class="promo-details">
              <p><strong>${t('discount')}:</strong> ${p.discount}${p.type === 'percentage' ? '%' : ' DA'}</p>
              <p><strong>${t('validUntil')}:</strong> ${p.endDate}</p>
              <p><strong>${t('products')}:</strong> ${p.productIds?.length || 0}</p>
            </div>
            <button data-edit-promo="${p.id}">${t('edit')}</button>
            <button data-delete-promo="${p.id}" class="danger">${t('delete')}</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ========== FEATURE 9: BACKUP & CLOUD SYNC ==========
function renderBackupView() {
  return `
    <div class="view-container">
      <div class="view-header">
        <h1>${t('backupSync')}</h1>
      </div>

      <div class="backup-section">
        <h3>${t('localBackup')}</h3>
        <div class="backup-options">
          <button class="btn btn-primary" id="backupNow">${ICONS.download} ${t('backupNow')}</button>
          <button class="btn btn-secondary" id="restoreBackup">${ICONS.upload} ${t('restoreBackup')}</button>
          <button class="btn btn-secondary" id="scheduleBackup">${t('scheduleBackups')}</button>
        </div>
      </div>

      <div class="backup-section">
        <h3>${t('cloudBackup')} (${t('optional')})</h3>
        <div class="cloud-options">
          <p style="color:rgba(255,255,255,0.6);margin-bottom:12px;">${t('connectCloud')}</p>
          <button class="btn btn-secondary" id="connectDropbox">📦 ${t('connectDropbox')}</button>
          <button class="btn btn-secondary" id="connectGoogleDrive">☁️  ${t('connectGoogleDrive')}</button>
          <button class="btn btn-secondary" id="connectAzure">🔷 ${t('connectAzure')}</button>
        </div>
      </div>

      <div class="backup-history">
        <h3>${t('recentBackups')}</h3>
        <div class="backup-list">
          <p style="color:rgba(255,255,255,0.4);">${t('backupHistory')}</p>
        </div>
      </div>
    </div>
  `;
}

// ========== FEATURE 5: ADVANCED STATS ==========
function renderStats() {
  const today = todayStr();
  const todayTx = DB.transactions.filter(t => t.date.startsWith(today));
  const totalCA = DB.transactions.reduce((s, t) => s + t.total, 0);
  const last7 = DB.transactions.filter(t => (new Date() - new Date(t.date)) < 7 * 24 * 60 * 60 * 1000);
  const ca7 = last7.reduce((s, t) => s + t.total, 0);

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
        <h1>${t('statistics')}</h1>
      </div>
      <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px;">
        <div class="stat-card"><div class="label">${t('todayRevenue')}</div><div class="value">${fmt(todayTx.reduce((s,t)=>s+t.total,0))} <span class="da">DA</span></div></div>
        <div class="stat-card"><div class="label">${t('last7DaysRevenue')}</div><div class="value">${fmt(ca7)} <span class="da">DA</span></div></div>
        <div class="stat-card"><div class="label">${t('totalRevenue')}</div><div class="value">${fmt(totalCA)} <span class="da">DA</span></div></div>
        <div class="stat-card"><div class="label">${t('totalSales')}</div><div class="value">${DB.transactions.length}</div></div>
      </div>
      <div class="data-table">
        <table>
          <thead><tr><th>${t('product')}</th><th>${t('quantitySold')}</th><th>${t('remainingStock')}</th></tr></thead>
          <tbody>
            ${topSellers.length === 0 ? `<tr><td colspan="3" style="text-align:center;color:rgba(255,255,255,0.4);padding:40px;">${t('noSales')}</td></tr>` :
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

// ========== SETTINGS VIEW ==========
function renderSettings() {
  const s = DB.settings;
  return `
    <div class="view-container">
      <div class="view-header">
        <h1>${t('settings')}</h1>
        <button class="btn btn-primary" id="saveSettings">${t('save')}</button>
      </div>
      <div class="data-table" style="padding: 24px;">
        <h3 style="margin-bottom:16px;font-size:14px;color:rgba(255,255,255,0.7);">${t('store')}</h3>
        <div class="form-grid">
          <div class="form-field"><label>${t('storeName')}</label><input id="set-shopName" value="${s.shopName}"></div>
          <div class="form-field"><label>${t('cashier')}</label><input id="set-cashierName" value="${s.cashierName}"></div>
          <div class="form-field"><label>${t('address')}</label><input id="set-shopAddress" value="${s.shopAddress}"></div>
          <div class="form-field"><label>${t('phone')}</label><input id="set-shopPhone" value="${s.shopPhone}"></div>
          <div class="form-field"><label>${t('nif')}</label><input id="set-shopNif" value="${s.shopNif}"></div>
          <div class="form-field"><label>${t('printerWidth')}</label><input id="set-printerWidth" type="number" value="${s.printerWidth}"></div>
        </div>
        <h3 style="margin:24px 0 16px;font-size:14px;color:rgba(255,255,255,0.7);">${t('taxes')}</h3>
        <div class="form-grid">
          <div class="form-field"><label>${t('tvaPercent')}</label><input id="set-taxRate" type="number" step="0.01" value="${s.taxRate * 100}"></div>
          <div class="form-field"><label>${t('timbrePercent')}</label><input id="set-timbreRate" type="number" step="0.01" value="${s.timbreRate * 100}"></div>
          <div class="form-field"><label>${t('timbreThreshold')}</label><input id="set-timbreThreshold" type="number" value="${s.timbreThreshold}"></div>
        </div>
        <h3 style="margin:24px 0 16px;font-size:14px;color:rgba(255,255,255,0.7);">${t('appearance')}</h3>
        <div class="form-grid">
          <div class="form-field"><label>${t('theme')}</label>
            <select id="set-theme">
              <option value="dark" ${s.theme === 'dark' ? 'selected' : ''}>${t('darkMode')}</option>
              <option value="light" ${s.theme === 'light' ? 'selected' : ''}>${t('lightMode')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ========== MODALS ==========
function renderPaymentModal() {
  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const timbre = subtotal >= (DB.settings.timbreThreshold || 1000) ? subtotal * (DB.settings.timbreRate || 0.01) : 0;
  const total = subtotal + timbre;

  return `
    <div class="modal-backdrop" id="paymentBackdrop">
      <div class="modal" id="paymentModal">
        <div class="modal-header">
          <div>
            <h2>${t('payment')}</h2>
            <p class="subtitle">${t('selectPaymentMethod')}</p>
          </div>
          <button class="modal-close" id="closePayment">${ICONS.x}</button>
        </div>
        <div class="modal-body center">
          <div style="font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;">${t('total')}</div>
          <div class="total-display">${fmt(total)}<span class="da">DA</span></div>
        </div>
        <div class="modal-body" id="paymentBody">
          <div class="payment-methods">
            ${PAYMENT_METHODS.map(m => `
              <button class="payment-method ${m.id}" data-method="${m.id}">
                <span class="icon">${m.icon}</span>
                <span>${m.label}</span>
              </button>
            `).join('')}
            <button class="payment-method carnet" data-method="carnet" style="grid-column:1/-1;">
              ${ICONS.book}<span>${t('putOnCarnet')}</span>
            </button>
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
            <h2>${t('chooseClient')}</h2>
            <p class="subtitle">${t('whichAccount')}</p>
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
                  <div class="meta">${t('currentlyOwes')} ${fmt(c.balance)} DA</div>
                </div>
              </div>
              <button class="pay-btn">${t('select')}</button>
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
            <h2>${p.id ? t('editProduct') : t('newProduct')}</h2>
          </div>
          <button class="modal-close" id="closeProduct">${ICONS.x}</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-field"><label>${t('barcode')}</label><input id="p-barcode" value="${p.barcode || ''}"></div>
            <div class="form-field"><label>${t('category')}</label>
              <select id="p-category">
                ${QUICK_CATEGORIES.map(c => `<option value="${c.id}" ${p.category === c.id ? 'selected' : ''}>${c.labelFr}</option>`).join('')}
              </select>
            </div>
            <div class="form-field"><label>${t('nameFr')}</label><input id="p-nameFr" value="${p.nameFr || ''}"></div>
            <div class="form-field"><label>${t('nameAr')}</label><input id="p-nameAr" value="${p.nameAr || ''}" dir="rtl"></div>
            <div class="form-field"><label>${t('sellingPrice')}</label><input id="p-price" type="number" step="0.01" value="${p.price || ''}"></div>
            <div class="form-field"><label>${t('purchaseCost')}</label><input id="p-cost" type="number" step="0.01" value="${p.cost || ''}"></div>
            <div class="form-field"><label>${t('stock')}</label><input id="p-stock" type="number" value="${p.stock ?? ''}"></div>
            <div class="form-field"><label>${t('minStock')}</label><input id="p-minStock" type="number" value="${p.minStock || 10}"></div>
            <div class="form-field"><label>${t('expiryDate')}</label><input id="p-expiryDate" type="date" value="${p.expiryDate || ''}"></div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-back" id="cancelProduct">${t('cancel')}</button>
          <button class="btn-confirm" id="saveProduct">${t('save')}</button>
        </div>
      </div>
    </div>
  `;
}

// EMPTY FEATURE MODALS
function renderAnalyticsModal() { return ''; }
function renderLoyaltyModal() { return ''; }
function renderSuppliersModal() { return ''; }
function renderEmployeesModal() { return ''; }
function renderPricingModal() { return ''; }
function renderBackupModal() { return ''; }

// ========== TOAST & UTILS ==========
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

// ========== CART OPERATIONS ==========
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

// ========== SALES COMPLETION ==========
async function completeSale(method, customerId = null) {
  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const timbre = subtotal >= (DB.settings.timbreThreshold || 1000) ? subtotal * (DB.settings.timbreRate || 0.01) : 0;
  const total = subtotal + timbre;

  state.cart.forEach(item => {
    const p = DB.products.find(p => p.id === item.id);
    if (p) p.stock = Math.max(0, p.stock - item.qty);
  });

  const tx = {
    id: DB.nextTransactionId++,
    date: new Date().toISOString(),
    items: state.cart.map(i => ({ id: i.id, name: i.nameFr, qty: i.qty, price: i.price })),
    subtotal, timbre, total,
    method,
    customerId,
  };
  DB.transactions.unshift(tx);

  if (method === 'carnet' && customerId) {
    const c = DB.customers.find(c => c.id === customerId);
    if (c) {
      c.balance += total;
      c.totalSpent = (c.totalSpent || 0) + total;
    }
  }

  // Add loyalty points if customer selected
  if (state.selectedCustomer) {
    state.selectedCustomer.totalSpent = (state.selectedCustomer.totalSpent || 0) + total;
  }

  await persist();

  const ticketHtml = generateTicketHtml(tx);
  await window.api.printTicket(ticketHtml);

  showToast(`Vente complétée — ${method}`, `${state.cart.length} articles · ${fmt(total)} DA`);

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
      <div class="center" style="margin-top:8px;font-size:10px;">Supérette+ v2.0 — Système de Caisse Professionnel</div>
    </body></html>
  `;
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

// ========== THEME ==========
function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
}

// ========== GLOBAL KEYBOARD LISTENER ==========
function setupGlobalKeys() {
  // ENTERPRISE ENHANCEMENT: Initialize barcode interceptor with timing heuristic
  if (!barcodeInterceptor) {
    barcodeInterceptor = new BarcodeInterceptor({
      scanEnabled: true,
      maxScanTime: 100, // Scanner types <100ms
      minCharacters: 6,
    });

    // Listen for detected barcode scans
    barcodeInterceptor.onScan((barcode) => {
      const product = DB.products.find(p => p.barcode === barcode);
      if (product) {
        addToCart(product);
        state.scanFlash = { ok: true, name: product.nameFr };
      } else {
        state.scanFlash = { ok: false, name: barcode };
        render();
      }
      setTimeout(() => { state.scanFlash = null; render(); }, 1500);
      render();
    });

    barcodeInterceptor.activate();
  }

  window.addEventListener('keydown', (e) => {
    const inInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT';

    if (!inInput) {
      if (e.key === 'F1') { e.preventDefault(); state.view = 'caisse'; render(); setTimeout(() => $('#searchInput')?.focus(), 50); return; }
      if (e.key === 'F5') { e.preventDefault(); clearCart(); return; }
      if (e.key === 'F8') { e.preventDefault(); state.view = 'carnet'; render(); return; }
      if (e.key === 'F9') { e.preventDefault(); if (state.cart.length) { state.showPayment = true; render(); } return; }
    }

    if (e.key === 'Enter' && !inInput) {
      // Allow manual scan submission if needed
      if (state.scanBuffer.length >= 6) {
        barcodeInterceptor?.submitScan(state.scanBuffer);
      } else if (state.cart.length > 0 && !state.showPayment) {
        state.showPayment = true;
        render();
      }
      state.scanBuffer = '';
      return;
    }
  });

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

// ========== EVENT BINDING ==========
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

  // Loyalty
  $('#clearLoyaltyBtn')?.addEventListener('click', () => {
    state.selectedCustomer = null;
    state.loyaltyPoints = 0;
    render();
  });
  $$('[data-select-loyalty]').forEach(b => {
    b.addEventListener('click', () => {
      const cid = parseInt(b.dataset.selectLoyalty);
      const cust = DB.customers.find(c => c.id === cid);
      if (cust) {
        state.selectedCustomer = cust;
        state.loyaltyPoints = Math.round((cust.totalSpent || 0) * (DB.loyaltyProgram?.pointsPerDA || 0.5));
        render();
      }
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
        const methodMap = { card: 'CIB', mobile: 'BaridiMob', check: 'Chèque', transfer: 'Virement' };
        completeSale(methodMap[method] || method);
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
}

// ========== DATA MANAGEMENT ==========
async function loadData() {
  DB = (await window.api?.loadDB?.()) || initializeDB();
  setupBarcode();
  bindEvents();
}

function persist() {
  window.api?.saveDB?.(DB);
}

// ========== THEME & GLOBAL SETUP ==========
function setupBarcode() {
  barcodeInterceptor = new BarcodeInterceptor({ config: true });
  barcodeInterceptor?.activate?.();
}

// ========== BOOT ==========
(async () => {
  await loadData();
  state.hwid = await window.api.getHwId?.() || 'N/A';

  // Always licensed
  state.licensed = true;

  applyTheme(DB.settings?.theme || 'dark');

  setupGlobalKeys();
  render();
})();
      }
  }));
}

// ========== DATA MANAGEMENT ==========
async function loadData() {
  DB = (await window.api?.loadDB?.()) || initializeDB();
  setupBarcode();
  bindEvents();
}

function persist() {
  window.api?.saveDB?.(DB);
}

// ========== THEME & GLOBAL SETUP ==========
function setupBarcode() {
  barcodeInterceptor = new BarcodeInterceptor({ config: true });
  barcodeInterceptor?.activate?.();
}

// ========== BOOT ==========
(async () => {
  await loadData();
  state.hwid = await window.api.getHwId?.() || 'N/A';

  // Always licensed
  state.licensed = true;

  applyTheme(DB.settings?.theme || 'dark');

  setupGlobalKeys();
  render();
})();
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

  // Carnet pay
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

  // Ad new customer
  $('#addCustomer')?.addEventListener('click', () => {
    const name = prompt('Nom du client:');
    if (name) {
      const phone = prompt('Téléphone (optionnel):');
      const email = prompt('Email (optionnel):');
      const newCustomer = {
        id: DB.nextCustomerId++,
        name,
        phone,
        email,
        balance: 0,
        totalSpent: 0,
        loyaltyTier: 'Bronze',
      };
      DB.customers.push(newCustomer);
      persist();
      render();
      showToast('Client créé', name);
    }
  });

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
  $('#backupNow')?.addEventListener('click', async () => {
    const r = await window.api.exportBackup();
    if (r.success) showToast('Sauvegarde exportée', r.path);
  });
  $('#restoreBackup')?.addEventListener('click', async () => {
    if (!confirm('Restaurer écrasera vos données actuelles. Continuer ?')) return;
    const r = await window.api.importBackup();
    if (r.success) { DB = r.data; render(); showToast('Données restaurées'); }
  });

  // Loyalty settings
  $('#saveLoyaltySettings')?.addEventListener('click', () => {
    const pointRate = parseFloat($('#pointRate').value) || 0.5;
    const redeemRate = parseFloat($('#redeemRate').value) / 100 || 0.01;
    DB.loyaltyProgram.pointsPerDA = pointRate;
    DB.loyaltyProgram.redeemRate = redeemRate;
    persist();
    showToast('Paramètres de fidélité sauvegardés');
  });
}

// ========== CLOCK ==========
setInterval(() => {
  const clock = $('#clock');
  if (clock) clock.textContent = new Date().toLocaleTimeString('fr-FR');
}, 1000);

// ========== BOOT ==========
(async () => {
  await loadData();
  state.hwid = await window.api.getHwId?.() || 'N/A';

  // Always licensed
  state.licensed = true;

  applyTheme(DB.settings?.theme || 'dark');

  setupGlobalKeys();
  render();
})();

