/**
 * SQLite3 Database Layer for Supérette Plus
 * Provides SQL-based persistence with JSON fallback
 * Uses 'sqlite' module which works with Electron
 */

const openDatabase = require('sqlite');
const path = require('path');
const fs = require('fs');
const os = require('os');

let db = null;
let useFallback = false;
let jsonDbPath = null;

// Sample products for initial setup
const SAMPLE_PRODUCTS = [
  { id: 1, barcode: '6130001234567', nameFr: 'Lait 1L', nameAr: 'حليب 1 لتر', price: 180, cost: 150, stock: 50, category: 'Laitage', minStock: 10 },
  { id: 2, barcode: '6130002234567', nameFr: 'Pain blanc', nameAr: 'خبز أبيض', price: 40, cost: 25, stock: 100, category: 'Boulangerie', minStock: 20 },
  { id: 3, barcode: '6130003234567', nameFr: 'Huile olive 1L', nameAr: 'زيت الزيتون 1 لتر', price: 1200, cost: 900, stock: 15, category: 'Huiles', minStock: 5 },
  { id: 4, barcode: '6130004234567', nameFr: 'Fromage 400g', nameAr: 'الجبن 400 غرام', price: 600, cost: 400, stock: 25, category: 'Laitage', minStock: 5 },
  { id: 5, barcode: '6130005234567', nameFr: 'Yaourt 1L', nameAr: 'الزبادي 1 لتر', price: 300, cost: 200, stock: 60, category: 'Laitage', minStock: 15 },
  { id: 6, barcode: '6130006234567', nameFr: 'Sucre 1kg', nameAr: 'السكر 1 كيلو', price: 180, cost: 120, stock: 40, category: 'Épicerie', minStock: 10 },
  { id: 7, barcode: '6130007234567', nameFr: 'Sel fin 1kg', nameAr: 'الملح 1 كيلو', price: 60, cost: 35, stock: 50, category: 'Épicerie', minStock: 15 },
  { id: 8, barcode: '6130008234567', nameFr: 'Café 500g', nameAr: 'القهوة 500 غرام', price: 400, cost: 250, stock: 20, category: 'Boissons', minStock: 5 },
  { id: 9, barcode: '6130009234567', nameFr: 'Thé 25 sachets', nameAr: 'الشاي 25 كيس', price: 320, cost: 200, stock: 30, category: 'Boissons', minStock: 8 },
  { id: 10, barcode: '6130010234567', nameFr: 'Huile tournesol 1L', nameAr: 'زيت دوار الشمس 1 لتر', price: 400, cost: 280, stock: 35, category: 'Huiles', minStock: 10 },
  { id: 11, barcode: '6130011234567', nameFr: 'Riz blanc 1kg', nameAr: 'الأرز الأبيض 1 كيلو', price: 250, cost: 180, stock: 60, category: 'Épicerie', minStock: 15 },
  { id: 12, barcode: '6130012234567', nameFr: 'Pâtes 500g', nameAr: 'المعكرونة 500 غرام', price: 140, cost: 80, stock: 80, category: 'Épicerie', minStock: 20 },
  { id: 13, barcode: '6130013234567', nameFr: 'Tomate concentrée 780g', nameAr: 'معجون الطماطم 780 غرام', price: 220, cost: 140, stock: 50, category: 'Épicerie', minStock: 10 },
  { id: 14, barcode: '6130014234567', nameFr: 'Lait en poudre 400g', nameAr: 'الحليب البودرة 400 غرام', price: 1100, cost: 750, stock: 15, category: 'Laitage', minStock: 3 },
  { id: 15, barcode: '6130015234567', nameFr: 'Beurre 250g', nameAr: 'الزبدة 250 غرام', price: 500, cost: 350, stock: 20, category: 'Laitage', minStock: 5 },
];

function initDatabase(userDataPath) {
  console.log('[Database] Initializing database with JSON fallback...');
  
  // Use JSON fallback for now (sqlite module requires setup)
  useFallback = true;
  
  jsonDbPath = path.join(userDataPath, 'superette-data.json');
  console.log('[Database] Using JSON storage at:', jsonDbPath);
  
  // Create user data directory if needed
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  
  // Initialize JSON file with default structure if not exists
  if (!fs.existsSync(jsonDbPath)) {
    const defaultData = {
      products: SAMPLE_PRODUCTS,
      customers: [],
      transactions: [],
      settings: {},
      suppliers: [],
      employees: [],
      backups: [],
    };
    fs.writeFileSync(jsonDbPath, JSON.stringify(defaultData, null, 2));
    console.log('[Database] Initialized with sample products:', SAMPLE_PRODUCTS.length);
  }
  
  return { db: null, dbPath: jsonDbPath };
}

// ============================================
// JSON Helper Functions
// ============================================

function loadJsonData() {
  if (!jsonDbPath || !fs.existsSync(jsonDbPath)) {
    return { products: SAMPLE_PRODUCTS, customers: [], transactions: [], settings: {}, suppliers: [], employees: [], backups: [] };
  }
  return JSON.parse(fs.readFileSync(jsonDbPath, 'utf8'));
}

function saveJsonData(data) {
  fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2));
}

// ============================================
// Database Operations
// ============================================

function getAllProducts() {
  return loadJsonData().products;
}

function getProductByBarcode(barcode) {
  return loadJsonData().products.find(p => p.barcode === barcode);
}

function addProduct(product) {
  const data = loadJsonData();
  const id = Math.max(...data.products.map(p => p.id), 0) + 1;
  const newProduct = { id, ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  data.products.push(newProduct);
  saveJsonData(data);
  return id;
}

function updateProduct(id, product) {
  const data = loadJsonData();
  const idx = data.products.findIndex(p => p.id === id);
  if (idx !== -1) {
    data.products[idx] = { ...data.products[idx], ...product, updatedAt: new Date().toISOString() };
    saveJsonData(data);
  }
  return { changes: idx !== -1 ? 1 : 0 };
}

function updateProductStock(id, stock) {
  const data = loadJsonData();
  const product = data.products.find(p => p.id === id);
  if (product) {
    product.stock = stock;
    product.updatedAt = new Date().toISOString();
    saveJsonData(data);
  }
  return { changes: product ? 1 : 0 };
}

function deleteProduct(id) {
  const data = loadJsonData();
  const idx = data.products.findIndex(p => p.id === id);
  if (idx !== -1) {
    data.products.splice(idx, 1);
    saveJsonData(data);
  }
  return { changes: idx !== -1 ? 1 : 0 };
}

// Customers
function getAllCustomers() {
  return loadJsonData().customers;
}

function addCustomer(customer) {
  const data = loadJsonData();
  const id = Math.max(...data.customers.map(c => c.id || 0), 0) + 1;
  const newCustomer = { id, ...customer, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  data.customers.push(newCustomer);
  saveJsonData(data);
  return id;
}

function getCustomerById(id) {
  return loadJsonData().customers.find(c => c.id === id);
}

function updateCustomerBalance(id, balance) {
  const data = loadJsonData();
  const customer = data.customers.find(c => c.id === id);
  if (customer) {
    customer.balance = balance;
    customer.updatedAt = new Date().toISOString();
    saveJsonData(data);
  }
  return { changes: customer ? 1 : 0 };
}

function updateCustomerLoyalty(id, points, tier) {
  const data = loadJsonData();
  const customer = data.customers.find(c => c.id === id);
  if (customer) {
    customer.loyaltyPoints = points;
    customer.loyaltyTier = tier;
    customer.updatedAt = new Date().toISOString();
    saveJsonData(data);
  }
  return { changes: customer ? 1 : 0 };
}

// Transactions
function recordTransaction(transaction) {
  const data = loadJsonData();
  const id = Math.max(...data.transactions.map(t => t.id || 0), 0) + 1;
  const newTrans = { id, ...transaction, createdAt: new Date().toISOString() };
  data.transactions.push(newTrans);
  saveJsonData(data);
  return id;
}

function getTransactionsSince(dateStr) {
  return loadJsonData().transactions.filter(t => t.createdAt >= dateStr);
}

function getAllTransactions() {
  return loadJsonData().transactions;
}

function getDailyRevenue(dateStr) {
  const trans = loadJsonData().transactions.filter(t => t.createdAt.startsWith(dateStr));
  return {
    totalRevenue: trans.reduce((sum, t) => sum + (t.totalDA || 0), 0),
    transactionCount: trans.length,
    totalTaxes: trans.reduce((sum, t) => sum + (t.tvaDA || 0) + (t.timbreDA || 0), 0),
  };
}

// Settings
function getSetting(key) {
  const data = loadJsonData();
  return data.settings[key];
}

function setSetting(key, value) {
  const data = loadJsonData();
  data.settings[key] = value;
  saveJsonData(data);
  return { changes: 1 };
}

function getAllSettings() {
  return loadJsonData().settings;
}

// Suppliers
function getAllSuppliers() {
  return loadJsonData().suppliers;
}

function addSupplier(supplier) {
  const data = loadJsonData();
  const id = Math.max(...data.suppliers.map(s => s.id || 0), 0) + 1;
  const newSupplier = { id, ...supplier, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  data.suppliers.push(newSupplier);
  saveJsonData(data);
  return id;
}

// Employees
function getAllEmployees() {
  return loadJsonData().employees;
}

function addEmployee(employee) {
  const data = loadJsonData();
  const id = Math.max(...data.employees.map(e => e.id || 0), 0) + 1;
  const newEmployee = { id, ...employee, active: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  data.employees.push(newEmployee);
  saveJsonData(data);
  return id;
}

// Backups
function recordBackup(filename, type, size) {
  const data = loadJsonData();
  const id = Math.max(...data.backups.map(b => b.id || 0), 0) + 1;
  data.backups.push({ id, filename, backupType: type, size, createdAt: new Date().toISOString() });
  saveJsonData(data);
  return id;
}

function getRecentBackups(limit = 10) {
  return loadJsonData().backups.slice(-limit).reverse();
}

// Analytics
function getTopSellingProducts(days) {
  const data = loadJsonData();
  const topItems = {};
  data.transactions.slice(-days).forEach(t => {
    const items = typeof t.items === 'string' ? JSON.parse(t.items) : t.items;
    items.forEach(item => {
      topItems[item.id] = (topItems[item.id] || 0) + item.quantity;
    });
  });
  return data.products.filter(p => topItems[p.id])
    .map(p => ({ ...p, quantitySold: topItems[p.id] }))
    .sort((a, b) => b.quantitySold - a.quantitySold);
}

function getLowStockProducts() {
  return loadJsonData().products.filter(p => p.stock <= p.minStock);
}

function getExpiryAlerts(daysAhead = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  return loadJsonData().products.filter(p => p.expiryDate && new Date(p.expiryDate) <= futureDate);
}

function closeDatabase() {
  // No-op for JSON storage
}

module.exports = {
  initDatabase,
  getAllProducts,
  getProductByBarcode,
  addProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  getAllCustomers,
  addCustomer,
  getCustomerById,
  updateCustomerBalance,
  updateCustomerLoyalty,
  recordTransaction,
  getTransactionsSince,
  getAllTransactions,
  getDailyRevenue,
  getSetting,
  setSetting,
  getAllSettings,
  getAllSuppliers,
  addSupplier,
  getAllEmployees,
  addEmployee,
  recordBackup,
  getRecentBackups,
  getTopSellingProducts,
  getLowStockProducts,
  getExpiryAlerts,
  closeDatabase,
  loadDB: () => loadJsonData(),
  saveDB: (data) => saveJsonData(data),
};
