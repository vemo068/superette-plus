const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

// New: SQLite and sync support
const db = require('../lib/database');
const SyncWorker = require('../lib/syncWorker');

let mainWindow;
let syncWorker = null;

// ---------- Hardware ID & License ----------
function getHardwareId() {
  const interfaces = os.networkInterfaces();
  let macs = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
        macs.push(iface.mac);
      }
    }
  }
  const data = `${os.hostname()}-${os.platform()}-${os.arch()}-${macs.sort().join(',')}-${os.cpus()[0]?.model || ''}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16).toUpperCase();
}

function generateActivationKey(hwId) {
  const SECRET = 'SUPERETTE_PLUS_VEMO068_2026';
  return crypto.createHmac('sha256', SECRET).update(hwId).digest('hex').substring(0, 20).toUpperCase().match(/.{1,4}/g).join('-');
}

// ---------- Window Creation with Hardware Acceleration ----------
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0b14',
    show: false,
    // ENHANCEMENT 2: Windows Hardware Acceleration
    // Use native frosted glass on Windows 11 for premium look
    backgroundMaterial: os.release().startsWith('10.0.22') ? 'mica' : 'acrylic',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Enable V8 code caching for faster startup
      v8CodeCachingEnabled: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  Menu.setApplicationMenu(null);
}

app.whenReady().then(() => {
  // ENHANCEMENT 5: Initialize SQLite database
  const userDataPath = app.getPath('userData');
  const { dbPath } = db.initDatabase(userDataPath);
  console.log('[Main] Database initialized at:', dbPath);

  // ENHANCEMENT 3: Start O2O sync worker
  const hwid = getHardwareId();
  syncWorker = new SyncWorker({
    hwid: hwid,
    storeId: '1', // From settings
    enabled: true,
  });
  syncWorker.start();

  createWindow();
});

app.on('window-all-closed', () => {
  // Cleanup
  if (syncWorker) syncWorker.stop();
  db.closeDatabase();
  
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ---------- IPC Handlers: Database Operations ----------

// Products
ipcMain.handle('db:products:all', () => db.getAllProducts());
ipcMain.handle('db:products:byBarcode', (_, barcode) => db.getProductByBarcode(barcode));
ipcMain.handle('db:products:add', (_, product) => db.addProduct(product));
ipcMain.handle('db:products:update', (_, id, product) => db.updateProduct(id, product));
ipcMain.handle('db:products:updateStock', (_, id, stock) => db.updateProductStock(id, stock));
ipcMain.handle('db:products:delete', (_, id) => db.deleteProduct(id));

// Customers
ipcMain.handle('db:customers:all', () => db.getAllCustomers());
ipcMain.handle('db:customers:add', (_, customer) => db.addCustomer(customer));
ipcMain.handle('db:customers:getBalance', (_, id) => {
  const customer = db.getCustomerById(id);
  return customer ? customer.balance : 0;
});
ipcMain.handle('db:customers:updateBalance', (_, id, balance) => db.updateCustomerBalance(id, balance));
ipcMain.handle('db:customers:updateLoyalty', (_, id, points, tier) => db.updateCustomerLoyalty(id, points, tier));

// Transactions
ipcMain.handle('db:transactions:record', (_, transaction) => db.recordTransaction(transaction));
ipcMain.handle('db:transactions:getToday', (_, dateStr) => db.getTransactionsSince(dateStr));
ipcMain.handle('db:transactions:getAll', () => db.getAllTransactions());
ipcMain.handle('db:transactions:getDailyRevenue', (_, dateStr) => db.getDailyRevenue(dateStr));

// Settings
ipcMain.handle('db:settings:get', (_, key) => db.getSetting(key));
ipcMain.handle('db:settings:set', (_, key, value) => db.setSetting(key, value));
ipcMain.handle('db:settings:getAll', () => db.getAllSettings());

// Suppliers
ipcMain.handle('db:suppliers:all', () => db.getAllSuppliers());
ipcMain.handle('db:suppliers:add', (_, supplier) => db.addSupplier(supplier));

// Employees
ipcMain.handle('db:employees:all', () => db.getAllEmployees());
ipcMain.handle('db:employees:add', (_, employee) => db.addEmployee(employee));

// Backups
ipcMain.handle('db:backups:record', (_, filename, type, size) => db.recordBackup(filename, type, size));
ipcMain.handle('db:backups:recent', (_, limit) => db.getRecentBackups(limit));

// Analytics
ipcMain.handle('db:analytics:topProducts', (_, days) => db.getTopSellingProducts(days));
ipcMain.handle('db:analytics:lowStock', () => db.getLowStockProducts());
ipcMain.handle('db:analytics:expiryAlerts', (_, daysAhead) => db.getExpiryAlerts(daysAhead));

// Sync Worker Status
ipcMain.handle('sync:status', () => syncWorker?.getStatus() || { isOnline: false, lastSync: null, queuedItems: {} });

// Hardware / Licensing
ipcMain.handle('license:hwid', () => getHardwareId());
ipcMain.handle('license:generateKey', (_, hwid) => generateActivationKey(hwid));

// Window controls
ipcMain.handle('window:minimize', () => mainWindow.minimize());
ipcMain.handle('window:maximize', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.handle('window:close', () => mainWindow.close());
ipcMain.handle('window:isMaximized', () => mainWindow.isMaximized());

ipcMain.handle('license:validate', (_, key) => {
  const expected = generateActivationKey(getHardwareId());
  return key.toUpperCase().replace(/[\s-]/g, '') === expected.replace(/-/g, '');
});

ipcMain.handle('print:ticket', async (_, ticketHtml) => {
  // Open a hidden print window with the ticket and silently print
  const printWin = new BrowserWindow({
    width: 320,
    height: 600,
    show: false,
    webPreferences: { offscreen: false },
  });
  await printWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(ticketHtml));
  return new Promise((resolve) => {
    printWin.webContents.print({
      silent: false,         // set true once a default thermal printer is configured
      printBackground: true,
      margins: { marginType: 'none' },
      pageSize: { width: 80000, height: 200000 }, // 80mm x 200mm in microns
    }, (success, err) => {
      printWin.close();
      resolve({ success, error: err });
    });
  });
});

ipcMain.handle('export:backup', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Sauvegarder la base de données',
    defaultPath: `superette-backup-${new Date().toISOString().split('T')[0]}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (!result.canceled && result.filePath) {
    fs.copyFileSync(dbPath, result.filePath);
    return { success: true, path: result.filePath };
  }
  return { success: false };
});

ipcMain.handle('import:backup', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Restaurer une sauvegarde',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (!result.canceled && result.filePaths[0]) {
    fs.copyFileSync(result.filePaths[0], dbPath);
    return { success: true, data: loadDB() };
  }
  return { success: false };
});
