const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

let mainWindow;

// ---------- Database (simple JSON-based for zero native deps) ----------
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'superette-data.json');

function loadDB() {
  try {
    if (fs.existsSync(dbPath)) {
      return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }
  } catch (e) {
    console.error('DB load error:', e);
  }
  return getInitialDB();
}

function saveDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('DB save error:', e);
    return false;
  }
}

function getInitialDB() {
  return {
    products: [
      { id: 1, barcode: '6130001234567', nameFr: 'Pain Baguette', nameAr: 'خبز', price: 15, cost: 10, stock: 120, category: 'bread', expiryDate: null, minStock: 20 },
      { id: 2, barcode: '6130002345678', nameFr: 'Lait Candia 1L', nameAr: 'حليب كانديا', price: 110, cost: 90, stock: 45, category: 'dairy', expiryDate: '2026-05-01', minStock: 15 },
      { id: 3, barcode: '6130003456789', nameFr: 'Eau Ifri 1.5L', nameAr: 'ماء إفري', price: 35, cost: 25, stock: 200, category: 'drinks', expiryDate: '2026-10-15', minStock: 30 },
      { id: 4, barcode: '6130004567890', nameFr: 'Coca-Cola 1L', nameAr: 'كوكا كولا', price: 95, cost: 75, stock: 80, category: 'drinks', expiryDate: '2026-07-20', minStock: 20 },
      { id: 5, barcode: '6130005678901', nameFr: 'Yaourt Soummam', nameAr: 'ياغورت الصومام', price: 25, cost: 18, stock: 8, category: 'dairy', expiryDate: '2026-04-26', minStock: 20 },
      { id: 6, barcode: '6130006789012', nameFr: 'Chocolat Cevital 100g', nameAr: 'شوكولاطة', price: 180, cost: 140, stock: 30, category: 'snacks', expiryDate: '2026-06-10', minStock: 10 },
      { id: 7, barcode: '6130007890123', nameFr: 'Café Bonal 250g', nameAr: 'قهوة بونال', price: 320, cost: 250, stock: 22, category: 'grocery', expiryDate: '2027-01-15', minStock: 5 },
      { id: 8, barcode: '6130008901234', nameFr: 'Sucre 1kg', nameAr: 'سكر', price: 90, cost: 70, stock: 60, category: 'grocery', expiryDate: '2027-04-19', minStock: 15 },
      { id: 9, barcode: '6130009012345', nameFr: 'Huile Elio 5L', nameAr: 'زيت إليو', price: 1200, cost: 1000, stock: 4, category: 'grocery', expiryDate: '2026-10-19', minStock: 5 },
      { id: 10, barcode: '6130010123456', nameFr: 'Biscuit Tchin Tchin', nameAr: 'بسكويت', price: 45, cost: 32, stock: 90, category: 'snacks', expiryDate: '2026-07-01', minStock: 20 },
      { id: 11, barcode: '6130011234567', nameFr: 'Fromage La Vache 8p', nameAr: 'جبن لا فاش', price: 280, cost: 220, stock: 15, category: 'dairy', expiryDate: '2026-05-10', minStock: 8 },
      { id: 12, barcode: '6130012345678', nameFr: 'Pâtes Sim 500g', nameAr: 'معكرونة', price: 75, cost: 55, stock: 50, category: 'grocery', expiryDate: '2027-04-19', minStock: 15 },
      { id: 13, barcode: '6130013456789', nameFr: 'Hamoud Boualem 1L', nameAr: 'حمود بوعلام', price: 80, cost: 60, stock: 65, category: 'drinks', expiryDate: '2026-09-15', minStock: 20 },
      { id: 14, barcode: '6130014567890', nameFr: 'Thon Royal 200g', nameAr: 'طون', price: 220, cost: 170, stock: 28, category: 'grocery', expiryDate: '2027-12-31', minStock: 10 },
      { id: 15, barcode: '6130015678901', nameFr: 'Savon Le Chat', nameAr: 'صابون', price: 120, cost: 90, stock: 40, category: 'household', expiryDate: null, minStock: 10 },
    ],
    transactions: [],
    customers: [
      { id: 1, name: 'Si Mohamed (Bldg B)', phone: '0555 12 34 56', balance: 2450, transactions: [] },
      { id: 2, name: 'Lalla Fatima', phone: '0666 78 90 12', balance: 870, transactions: [] },
      { id: 3, name: 'Karim — Garage', phone: '0777 11 22 33', balance: 5200, transactions: [] },
    ],
    settings: {
      shopName: 'Supérette Plus',
      shopAddress: 'Cité 1000 Logements, Alger',
      shopPhone: '021 00 00 00',
      shopNif: '000000000000000',
      cashierName: 'Aïcha B.',
      taxRate: 0.09,
      timbreRate: 0.01,
      timbreThreshold: 1000,
      currency: 'DA',
      language: 'fr',
      printerWidth: 80,
      theme: 'dark',
      theme: 'dark',
    },
    nextProductId: 16,
    nextTransactionId: 1,
    nextCustomerId: 4,
  };
}

// ---------- License / Hardware ID ----------
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
  // Simple HMAC-style key. In production, this stays on YOUR server only.
  const SECRET = 'SUPERETTE_PLUS_VEMO068_2026';
  return crypto.createHmac('sha256', SECRET).update(hwId).digest('hex').substring(0, 20).toUpperCase().match(/.{1,4}/g).join('-');
}

// ---------- Window ----------
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: false,                  // borderless — custom frame in renderer
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0b14',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  Menu.setApplicationMenu(null);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ---------- IPC handlers ----------
ipcMain.handle('db:load', () => loadDB());
ipcMain.handle('db:save', (_, data) => saveDB(data));

ipcMain.handle('window:minimize', () => mainWindow.minimize());
ipcMain.handle('window:maximize', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.handle('window:close', () => mainWindow.close());
ipcMain.handle('window:isMaximized', () => mainWindow.isMaximized());

ipcMain.handle('license:hwid', () => getHardwareId());
ipcMain.handle('license:generateKey', (_, hwId) => generateActivationKey(hwId)); // for dev/owner use
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
