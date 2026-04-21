/**
 * O2O (Offline-to-Online) Sync Worker
 * Bridges Supérette Plus to cloud ecosystem
 * Auto-syncs when internet connection detected
 */

const os = require('os');
const dns = require('dns').promises;
const https = require('https');
const fs = require('fs');
const path = require('path');

class SyncWorker {
  constructor(config = {}) {
    this.config = {
      apiServer: config.apiServer || 'https://api.superette-plus.dz',
      hwid: config.hwid,
      storeId: config.storeId,
      checkInterval: config.checkInterval || 300000, // 5 minutes
      enabled: config.enabled !== false,
      ...config,
    };
    
    this.isOnline = false;
    this.worker = null;
    this.lastSync = null;
    this.syncQueue = {
      inventory: null,
      carnet: [],
      transactions: [],
    };
  }

  /**
   * Start the background sync worker
   */
  start() {
    if (!this.config.enabled) return;

    console.log('[SyncWorker] Starting O2O sync worker...');
    
    // Check internet connectivity
    this.worker = setInterval(async () => {
      const wasOnline = this.isOnline;
      this.isOnline = await this.checkConnectivity();

      if (!wasOnline && this.isOnline) {
        console.log('[SyncWorker] Internet detected. Starting sync...');
        await this.syncAll();
      } else if (!this.isOnline) {
        console.log('[SyncWorker] Offline. Queueing changes...');
      }
    }, this.config.checkInterval);
  }

  /**
   * Stop the background worker
   */
  stop() {
    if (this.worker) {
      clearInterval(this.worker);
      this.worker = null;
    }
  }

  /**
   * Check if internet connectivity is available
   */
  async checkConnectivity() {
    try {
      // Try DNS lookup to a common server
      await dns.resolve4('1.1.1.1');
      return true;
    } catch (error) {
      try {
        // Fallback to Google
        await dns.resolve4('8.8.8.8');
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  /**
   * Queue inventory changes for sync
   */
  queueInventorySync(inventory) {
    this.syncQueue.inventory = inventory;
    if (this.isOnline) {
      this.syncInventory();
    }
  }

  /**
   * Queue customer carnet updates
   */
  queueCarnetSync(customers) {
    this.syncQueue.carnet = customers;
    if (this.isOnline) {
      this.syncCarnet();
    }
  }

  /**
   * Queue transaction records
   */
  queueTransactionSync(transactions) {
    this.syncQueue.transactions = transactions;
    if (this.isOnline) {
      this.syncTransactions();
    }
  }

  /**
   * Sync inventory to cloud
   */
  async syncInventory() {
    if (!this.syncQueue.inventory || this.syncQueue.inventory.length === 0) return;

    try {
      const payload = {
        hwid: this.config.hwid,
        storeId: this.config.storeId,
        timestamp: new Date().toISOString(),
        inventory: this.syncQueue.inventory.map(p => ({
          barcode: p.barcode,
          stock: p.stock,
          lastUpdated: p.updatedAt,
        })),
      };

      const response = await this.post('/sync/inventory', payload);
      
      if (response.success) {
        console.log('[SyncWorker] Inventory synced successfully');
        this.syncQueue.inventory = null;
        this.lastSync = new Date();
      }
    } catch (error) {
      console.error('[SyncWorker] Inventory sync error:', error.message);
    }
  }

  /**
   * Sync customer carnet (credit accounts) to cloud
   */
  async syncCarnet() {
    if (!this.syncQueue.carnet || this.syncQueue.carnet.length === 0) return;

    try {
      const payload = {
        hwid: this.config.hwid,
        storeId: this.config.storeId,
        timestamp: new Date().toISOString(),
        customers: this.syncQueue.carnet.map(c => ({
          name: c.name,
          phone: c.phone,
          balance: c.balance,
          loyaltyPoints: c.loyaltyPoints,
          loyaltyTier: c.loyaltyTier,
          lastUpdated: c.updatedAt,
        })),
      };

      const response = await this.post('/sync/carnet', payload);
      
      if (response.success) {
        console.log('[SyncWorker] Carnet synced to cloud');
        this.syncQueue.carnet = [];
        this.lastSync = new Date();
      }
    } catch (error) {
      console.error('[SyncWorker] Carnet sync error:', error.message);
    }
  }

  /**
   * Sync transactions to cloud archive
   */
  async syncTransactions() {
    if (!this.syncQueue.transactions || this.syncQueue.transactions.length === 0) return;

    try {
      const payload = {
        hwid: this.config.hwid,
        storeId: this.config.storeId,
        timestamp: new Date().toISOString(),
        transactions: this.syncQueue.transactions,
      };

      const response = await this.post('/sync/transactions', payload);
      
      if (response.success) {
        console.log('[SyncWorker] Transactions synced to cloud');
        this.syncQueue.transactions = [];
        this.lastSync = new Date();
      }
    } catch (error) {
      console.error('[SyncWorker] Transaction sync error:', error.message);
    }
  }

  /**
   * Full sync of all critical data
   */
  async syncAll() {
    await Promise.all([
      this.syncInventory(),
      this.syncCarnet(),
      this.syncTransactions(),
    ]);
  }

  /**
   * POST request to sync server
   */
  post(endpoint, payload) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.config.apiServer);
      const data = JSON.stringify(payload);

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
          'X-HWID': this.config.hwid,
          'X-Store-ID': this.config.storeId,
        },
        timeout: 10000,
      };

      const req = https.request(url, options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid server response'));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.abort();
        reject(new Error('Sync request timeout'));
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * Get current sync status
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      queuedItems: {
        inventory: this.syncQueue.inventory ? 1 : 0,
        carnet: this.syncQueue.carnet.length,
        transactions: this.syncQueue.transactions.length,
      },
    };
  }
}

module.exports = SyncWorker;
