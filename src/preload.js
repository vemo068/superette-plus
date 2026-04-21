const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Legacy database (for migration)
  loadDB: () => ipcRenderer.invoke('db:load'),
  saveDB: (data) => ipcRenderer.invoke('db:save', data),

  // NEW: SQLite Database API
  db: {
    products: {
      all: () => ipcRenderer.invoke('db:products:all'),
      byBarcode: (barcode) => ipcRenderer.invoke('db:products:byBarcode', barcode),
      add: (product) => ipcRenderer.invoke('db:products:add', product),
      update: (id, product) => ipcRenderer.invoke('db:products:update', id, product),
      updateStock: (id, stock) => ipcRenderer.invoke('db:products:updateStock', id, stock),
      delete: (id) => ipcRenderer.invoke('db:products:delete', id),
    },
    customers: {
      all: () => ipcRenderer.invoke('db:customers:all'),
      add: (customer) => ipcRenderer.invoke('db:customers:add', customer),
      getBalance: (id) => ipcRenderer.invoke('db:customers:getBalance', id),
      updateBalance: (id, balance) => ipcRenderer.invoke('db:customers:updateBalance', id, balance),
      updateLoyalty: (id, points, tier) => ipcRenderer.invoke('db:customers:updateLoyalty', id, points, tier),
    },
    transactions: {
      record: (transaction) => ipcRenderer.invoke('db:transactions:record', transaction),
      getToday: (dateStr) => ipcRenderer.invoke('db:transactions:getToday', dateStr),
      getAll: () => ipcRenderer.invoke('db:transactions:getAll'),
      getDailyRevenue: (dateStr) => ipcRenderer.invoke('db:transactions:getDailyRevenue', dateStr),
    },
    settings: {
      get: (key) => ipcRenderer.invoke('db:settings:get', key),
      set: (key, value) => ipcRenderer.invoke('db:settings:set', key, value),
      getAll: () => ipcRenderer.invoke('db:settings:getAll'),
    },
    suppliers: {
      all: () => ipcRenderer.invoke('db:suppliers:all'),
      add: (supplier) => ipcRenderer.invoke('db:suppliers:add', supplier),
    },
    employees: {
      all: () => ipcRenderer.invoke('db:employees:all'),
      add: (employee) => ipcRenderer.invoke('db:employees:add', employee),
    },
    backups: {
      record: (filename, type, size) => ipcRenderer.invoke('db:backups:record', filename, type, size),
      recent: (limit) => ipcRenderer.invoke('db:backups:recent', limit),
    },
    analytics: {
      topProducts: (days) => ipcRenderer.invoke('db:analytics:topProducts', days),
      lowStock: () => ipcRenderer.invoke('db:analytics:lowStock'),
      expiryAlerts: (daysAhead) => ipcRenderer.invoke('db:analytics:expiryAlerts', daysAhead),
    },
  },

  // NEW: O2O Sync Worker
  sync: {
    status: () => ipcRenderer.invoke('sync:status'),
  },

  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),

  // License
  getHwId: () => ipcRenderer.invoke('license:hwid'),
  generateKey: (hwId) => ipcRenderer.invoke('license:generateKey', hwId),
  validateLicense: (key) => ipcRenderer.invoke('license:validate', key),

  // Printing
  printTicket: (html) => ipcRenderer.invoke('print:ticket', html),

  // Backup / Restore
  exportBackup: () => ipcRenderer.invoke('export:backup'),
  importBackup: () => ipcRenderer.invoke('import:backup'),
});
