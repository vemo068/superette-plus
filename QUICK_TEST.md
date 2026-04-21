# 🎯 ENTERPRISE TESTING QUICK GUIDE

## ✅ Application Status: RUNNING

The app started successfully with all 5 enterprise enhancements integrated!

---

## 🚀 Test the Features NOW

### **Press F12** to open the Developer Console, then copy-paste these commands:

---

## Test 1: Database Operations

```javascript
// Load all 15 sample products
const products = await window.api.db.products.all();
console.log(`Loaded ${products.length} products`);
console.log(products[0]); // See first product details

// Find a specific product by barcode
const lait = await window.api.db.products.byBarcode('6130001234567');
console.log(`Found: ${lait.nameFr} - ${lait.price} DA`);

// Get today's revenue (if any transactions)
const today = new Date().toISOString().split('T')[0];
const revenue = await window.api.db.transactions.getDailyRevenue(today);
console.log(`Today's revenue: ${revenue.totalRevenue} DA (${revenue.transactionCount} sales)`);
```

---

## Test 2: Sync Worker Status

```javascript
// Check connectivity and sync status
const status = await window.api.sync.status();
console.log(`Online: ${status.isOnline ? '🟢' : '🔴'}`);
console.log(`Last Sync: ${status.lastSync || 'Never'}`);
console.log(`Queued items: `, status.queuedItems);
```

---

## Test 3: Hardware ID & License

```javascript
// Get your unique hardware ID
const hwid = await window.api.getHwId();
console.log(`Hardware ID: ${hwid}`);

// Generate activation key for your hardware
const key = await window.api.generateKey(hwid);
console.log(`Activation Key: ${key}`);

// Verify the key format (should be 5 groups of 4 characters)
console.log(`Valid format: ${/^[A-Z0-9-]{24}$/.test(key)}`);
```

---

## Test 4: Barcode Interceptor

```javascript
// Check the barcode interceptor state
const state = barcodeInterceptor?.getState?.();
console.log(`State: `, state);

// Manually submit a barcode
const result = barcodeInterceptor?.submitScan?.('6130001234567');
console.log(`Barcode submitted: ${result}`);

// To test with real barcode:
// 1. Click in a text field
// 2. Use physical scanner to scan
// OR type slowly (>100ms between chars) - should NOT trigger
// OR scan fast (<100ms between chars) - SHOULD trigger barcode mode
```

---

## Test 5: Hardware Acceleration

```javascript
// Check GPU support
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
console.log(`GPU Support: ${gl ? '✅ Available' : '❌ No GPU'}`);

// Check glass effect support (Windows 11 feature)
const hasGlass = CSS.supports('backdrop-filter', 'blur(10px)');
console.log(`Glass Effect: ${hasGlass ? '✅ Supported' : '❌ Not supported'}`);

// On Windows 11: look for frosted glass effect in app
// On Windows 10: look for colored transparency
```

---

## Run All Tests at Once

```javascript
(async () => {
  console.clear();
  console.log('🧪 RUNNING ALL TESTS...\n');
  
  // Test 1: Database
  try {
    const products = await window.api.db.products.all();
    console.log(`✅ Database: ${products.length} products loaded`);
  } catch(e) { console.error('❌ Database:', e.message); }
  
  // Test 2: Sync
  try {
    const sync = await window.api.sync.status();
    console.log(`✅ Sync: ${sync.isOnline ? 'Online' : 'Offline'}`);
  } catch(e) { console.error('❌ Sync:', e.message); }
  
  // Test 3: License
  try {
    const hwid = await window.api.getHwId();
    const key = await window.api.generateKey(hwid);
    console.log(`✅ License: HWID=${hwid.substring(0,4)}... Key=${key.substring(0,4)}...`);
  } catch(e) { console.error('❌ License:', e.message); }
  
  // Test 4: Barcode
  try {
    const state = barcodeInterceptor?.getState?.();
    console.log(`✅ Barcode: ${state?.active ? 'Active' : 'Inactive'}`);
  } catch(e) { console.error('❌ Barcode:', e.message); }
  
  // Test 5: Hardware
  const gl = (canvas => canvas.getContext('webgl') || canvas.getContext('webgl2'))(document.createElement('canvas'));
  console.log(`✅ Hardware: ${gl ? 'GPU detected' : 'CPU only'}`);
  
  console.log('\n🎉 All tests complete!');
})();
```

---

## 📊 Expected Results

| Feature | Expected Output |
|---------|-----------------|
| Database | `Loaded 15 products` |
| First Product | `Lait 1L - 180 DA (حليب 1 لتر)` |
| Sync Status | `Online: 🔴 or 🟢` |
| Hardware ID | 16 uppercase hex characters |
| Activation Key | Format: `XXXX-XXXX-XXXX-XXXX-XXXX` |
| GPU Support | `GPU Support: ✅ Available` |

---

## 📁 Network/Filesystem Paths

- **Database File**: `%APPDATA%\superette-plus\superette-data.json`
  - Contains all products, customers, transactions, settings
  - 15 sample products pre-loaded

- **Log Output**: Check console at app startup
  - `[Database] Initializing database...`
  - `[Database] Using JSON storage at: ...`
  - `[Main] Database initialized...`
  - `[SyncWorker] Starting O2O sync...`

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Commands not working | Press F12 to open console first |
| `window.api` undefined | Check preload.js is loaded (takes 1-2 seconds) |
| Barcode interceptor null | Wait for app to fully load (~3 seconds) |
| No products showing | Check `superette-data.json` file exists |
| Sync shows offline | Normal if no internet - worker still running |

---

## 📝 Files to Check

1. **Log Output** (startup messages):
   - Check terminal running `npm start` for initialization messages

2. **Database File**:
   - `%APPDATA%\superette-plus\superette-data.json`
   - Open in any text editor to see stored data

3. **Source Code**:
   - `src/main.js` - 70+ IPC handlers
   - `lib/database.js` - Database operations
   - `lib/syncWorker.js` - Background sync
   - `lib/barcodeInterceptor.js` - Timing heuristic

---

## ✅ Final Checklist

- [ ] App launches without errors
- [ ] 15 sample products load successfully
- [ ] Hardware ID generates correctly
- [ ] Activation key creates in proper format
- [ ] Sync worker status available
- [ ] GPU acceleration detected
- [ ] Barcode interceptor state accessible
- [ ] All IPC handlers respond to calls

---

## 🎯 Success Criteria

**All 5 enterprise features operational when:**
1. ✅ Database returns 15 products
2. ✅ License system generates HWID + key
3. ✅ Sync worker reports status
4. ✅ Barcode interceptor shows state
5. ✅ GPU acceleration available

**🎉 If all 5 pass, enterprise deployment is ready!**

---

**Next**: Review `TEST_RESULTS.md` for detailed implementation details
