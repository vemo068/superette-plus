const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Database
  loadDB: () => ipcRenderer.invoke('db:load'),
  saveDB: (data) => ipcRenderer.invoke('db:save', data),

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
