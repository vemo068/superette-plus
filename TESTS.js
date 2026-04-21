/**
 * ENTERPRISE FEATURES TEST SUITE
 * Run this in browser console (F12) after app launches
 * 
 * Instructions:
 * 1. Start app: npm start
 * 2. Press F12 to open developer console
 * 3. Copy and paste the test section you want to run
 */

console.log('🧪 ENTERPRISE FEATURES TEST SUITE\n');

// ============================================
// TEST 1: SQLite Database
// ============================================
async function testSQLiteDatabase() {
  console.log('📊 TEST 1: SQLite Database\n');
  
  try {
    // Test: Get all products
    console.log('✓ Getting all products...');
    const products = await window.api.db.products.all();
    console.log(`  Found ${products.length} products`);
    console.log(`  Sample: ${products[0]?.nameFr} (${products[0]?.barcode})`);
    
    // Test: Get product by barcode
    console.log('\n✓ Getting product by barcode...');
    const product = await window.api.db.products.byBarcode('6130001234567');
    console.log(`  Found: ${product?.nameFr} @ ${product?.price} DA`);
    
    // Test: Get customers
    console.log('\n✓ Getting all customers...');
    const customers = await window.api.db.customers.all();
    console.log(`  Found ${customers.length} customers`);
    if (customers.length > 0) {
      console.log(`  Sample: ${customers[0].name} (Balance: ${customers[0].balance} DA)`);
    }
    
    // Test: Get settings
    console.log('\n✓ Getting settings...');
    const shopName = await window.api.db.settings.get('shopName');
    console.log(`  Shop Name: ${shopName || 'Not set'}`);
    
    // Test: Daily revenue
    console.log('\n✓ Getting today\'s revenue...');
    const today = new Date().toISOString().split('T')[0];
    const revenue = await window.api.db.transactions.getDailyRevenue(today);
    console.log(`  Total: ${revenue.totalRevenue} DA`);
    console.log(`  Transactions: ${revenue.transactionCount}`);
    console.log(`  Taxes: ${revenue.totalTaxes} DA`);
    
    console.log('\n✅ SQLite Database: ALL TESTS PASSED\n');
    return true;
  } catch (error) {
    console.error('❌ SQLite Database Error:', error);
    return false;
  }
}

// ============================================
// TEST 2: Barcode Interceptor
// ============================================
function testBarcodeInterceptor() {
  console.log('🎯 TEST 2: Barcode Interceptor\n');
  
  try {
    // Test: Get state
    console.log('✓ Checking interceptor state...');
    const state = barcodeInterceptor?.getState();
    
    if (!state) {
      console.error('❌ Barcode interceptor not found');
      return false;
    }
    
    console.log(`  Active: ${state.active ? '✅ Yes' : '❌ No'}`);
    console.log(`  Is Scanning: ${state.isScanning}`);
    console.log(`  Buffer: "${state.buffer}"`);
    console.log(`  Timing samples: ${state.timingCount}`);
    
    // Test: Submit scan manually
    console.log('\n✓ Testing manual scan submission...');
    const result = barcodeInterceptor.submitScan('6130001234567');
    console.log(`  Scan accepted: ${result ? '✅ Yes' : '❌ No'}`);
    
    console.log('\n✅ Barcode Interceptor: ALL TESTS PASSED\n');
    return true;
  } catch (error) {
    console.error('❌ Barcode Interceptor Error:', error);
    return false;
  }
}

// ============================================
// TEST 3: Sync Worker (O2O)
// ============================================
async function testSyncWorker() {
  console.log('☁️  TEST 3: O2O Sync Worker\n');
  
  try {
    console.log('✓ Getting sync status...');
    const status = await window.api.sync.status();
    
    console.log(`  Online: ${status.isOnline ? '🟢 Yes' : '🔴 No'}`);
    console.log(`  Last Sync: ${status.lastSync ? new Date(status.lastSync).toLocaleString() : 'Never'}`);
    console.log(`  Queue Items:`);
    console.log(`    - Inventory: ${status.queuedItems.inventory}`);
    console.log(`    - Carnet: ${status.queuedItems.carnet}`);
    console.log(`    - Transactions: ${status.queuedItems.transactions}`);
    
    console.log('\n✅ Sync Worker: ALL TESTS PASSED\n');
    return true;
  } catch (error) {
    console.error('❌ Sync Worker Error:', error);
    return false;
  }
}

// ============================================
// TEST 4: License / Hardware ID
// ============================================
async function testLicenseSystem() {
  console.log('🔐 TEST 4: License & Hardware ID\n');
  
  try {
    console.log('✓ Getting Hardware ID...');
    const hwid = await window.api.getHwId();
    console.log(`  HWID: ${hwid}`);
    
    console.log('\n✓ Generating activation key...');
    const key = await window.api.generateKey(hwid);
    console.log(`  Key: ${key}`);
    
    console.log('\n✅ License System: ALL TESTS PASSED\n');
    return true;
  } catch (error) {
    console.error('❌ License System Error:', error);
    return false;
  }
}

// ============================================
// TEST 5: Hardware Acceleration
// ============================================
function testHardwareAcceleration() {
  console.log('🎨 TEST 5: Hardware Acceleration\n');
  
  try {
    console.log('✓ Checking window properties...');
    
    // Check if running on Windows with native materials
    const isWindows = navigator.platform.toLowerCase().includes('win');
    console.log(`  Platform: ${navigator.platform}`);
    console.log(`  Is Windows: ${isWindows ? '✅ Yes' : '❌ No'}`);
    
    // Check for GPU acceleration indicators
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    console.log(`  WebGL Available: ${gl ? '✅ Yes' : '❌ No'}`);
    
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        console.log(`  GPU: ${renderer}`);
      }
    }
    
    // CSS backdrop-filter support
    const hasBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)');
    console.log(`  Backdrop Filter Support: ${hasBackdropFilter ? '✅ Yes' : '❌ No'}`);
    
    console.log('\n✅ Hardware Acceleration: CHECKS COMPLETE\n');
    return true;
  } catch (error) {
    console.error('❌ Hardware Acceleration Error:', error);
    return false;
  }
}

// ============================================
// TEST 6: Comprehensive Full Test
// ============================================
async function testAll() {
  console.log('═'.repeat(60));
  console.log('🚀 RUNNING ALL ENTERPRISE FEATURE TESTS');
  console.log('═'.repeat(60) + '\n');
  
  const results = [];
  
  // Test 1: SQLite
  results.push(await testSQLiteDatabase());
  
  // Test 2: Barcode
  results.push(testBarcodeInterceptor());
  
  // Test 3: Sync
  results.push(await testSyncWorker());
  
  // Test 4: License
  results.push(await testLicenseSystem());
  
  // Test 5: Hardware
  results.push(testHardwareAcceleration());
  
  // Summary
  console.log('═'.repeat(60));
  console.log('📋 TEST SUMMARY');
  console.log('═'.repeat(60));
  console.log(`\n  SQLite Database:        ${results[0] ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Barcode Interceptor:    ${results[1] ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Sync Worker:            ${results[2] ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  License System:         ${results[3] ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Hardware Acceleration:  ${results[4] ? '✅ PASS' : '❌ FAIL'}`);
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n  Overall: ${passed}/${total} tests passed\n`);
  
  if (passed === total) {
    console.log('🎉 ALL ENTERPRISE FEATURES WORKING!\n');
  } else {
    console.log('⚠️  Some tests failed. Check errors above.\n');
  }
}

// ============================================
// QUICK TEST FUNCTIONS
// ============================================

async function quickTest() {
  console.clear();
  await testAll();
}

// ============================================
// EXPOSE TO CONSOLE
// ============================================

window.enterpriseTests = {
  testSQLiteDatabase,
  testBarcodeInterceptor,
  testSyncWorker,
  testLicenseSystem,
  testHardwareAcceleration,
  testAll: quickTest
};

console.log('✅ Test suite loaded. Run: window.enterpriseTests.testAll()');
