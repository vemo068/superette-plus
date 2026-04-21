/**
 * Barcode Scanner Timing Heuristic
 * Distinguishes between human typing and barcode scanner input
 * Prevents accidental input pollution when cashier is typing
 * 
 * Scanner characteristics:
 * - Types 10-15 characters in <100ms (extremely fast)
 * - Always ends with Enter key
 * - Precise, consistent timing
 * 
 * Human typing characteristics:
 * - Variable keystroke interval (100-500ms+)
 * - Erratic, inconsistent timing
 */

class BarcodeInterceptor {
  constructor(options = {}) {
    this.options = {
      scanEnabled: options.scanEnabled !== false,
      maxScanTime: options.maxScanTime || 100, // Scanner types this many chars in <100ms
      minCharacters: options.minCharacters || 6, // Minimum barcode length
      focusExclusions: options.focusExclusions || ['INPUT', 'TEXTAREA', 'SELECT'], // Don't scan if focus in these
      ...options,
    };

    this.buffer = '';
    this.timing = [];
    this.lastKeyTime = 0;
    this.isScanning = false;
    this.listeners = [];
    this.active = false;
  }

  /**
   * Start listening for barcode scans
   */
  activate() {
    if (this.active) return;
    this.active = true;

    document.addEventListener('keydown', this._onKeyDown.bind(this), true); // useCapture for priority
    document.addEventListener('keyup', this._onKeyUp.bind(this), true);

    console.log('[BarcodeInterceptor] Scanner interceptor activated');
  }

  /**
   * Stop listening
   */
   deactivate() {
    if (!this.active) return;
    this.active = false;

    document.removeEventListener('keydown', this._onKeyDown.bind(this), true);
    document.removeEventListener('keyup', this._onKeyUp.bind(this), true);

    console.log('[BarcodeInterceptor] Scanner interceptor deactivated');
  }

  /**
   * Listen for barcode scan events
   */
  onScan(callback) {
    this.listeners.push(callback);
  }

  /**
   * Emit scan event to all listeners
   */
  _emitScan(barcode) {
    this.listeners.forEach(cb => cb(barcode));
  }

  /**
   * Analyze keystroke timing to detect scanner vs human
   */
  _isScannerInput() {
    if (this.timing.length < this.options.minCharacters) return false;

    // Calculate average keystroke interval
    let intervals = [];
    for (let i = 1; i < this.timing.length; i++) {
      intervals.push(this.timing[i] - this.timing[i - 1]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const totalTime = this.timing[this.timing.length - 1] - this.timing[0];

    // Scanner characteristics:
    // - Average interval: 5-20ms (extremely consistent)
    // - Total time for 10-13 chars: <100ms
    // - Standard deviation: very low

    const stdDev = Math.sqrt(
      intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length
    );

    const isScanner = 
      avgInterval < 25 &&           // Very fast per-character interval
      totalTime < this.options.maxScanTime &&  // Total time < 100ms
      stdDev < 15;                  // Consistent timing (low variance)

    return isScanner;
  }

  /**
   * Check if barcode format is valid (starts with digits, 6+ chars)
   */
  _isValidBarcode(code) {
    return /^\d{6,}$/.test(code) || /^[0-9A-Z]{8,}$/.test(code);
  }

  /**
   * Keydown handler
   */
  _onKeyDown(e) {
    if (!this.options.scanEnabled) return;

    const focusedElement = document.activeElement;
    const inExcludedField = this.options.focusExclusions.includes(focusedElement.tagName);
    const code = e.key;

    // Enter key - potential end of barcode
    if (code === 'Enter') {
      // Quick heuristic: if this looks like a scanner scan, intercept it
      if (this.isScanning && this._isScannerInput() && this._isValidBarcode(this.buffer)) {
        e.preventDefault();
        e.stopImmediatePropagation();

        this._emitScan(this.buffer);

        // Reset
        this.buffer = '';
        this.timing = [];
        this.isScanning = false;
        this.lastKeyTime = 0;

        return;
      }
    }

    // Character key
    if (code.length === 1 && /^[0-9a-zA-Z]$/.test(code)) {
      const now = performance.now();

      // If still within a scan window (last key <100ms ago), accumulate
      if (now - this.lastKeyTime < 100) {
        this.isScanning = true;
        this.buffer += code;
        this.timing.push(now);
        this.lastKeyTime = now;

        // If we're confident this is a scanner scan, prevent text field pollution
        if (inExcludedField && this.isScanning && this._isScannerInput()) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      } else {
        // Too much time since last key - reset
        this.buffer = code;
        this.timing = [now];
        this.isScanning = false;
        this.lastKeyTime = now;
      }
    }
  }

  /**
   * Keyup handler (for future timing refinement)
   */
  _onKeyUp(e) {
    // Can add additional timing analysis here if needed
  }

  /**
   * Manual scan submission (if you want to trigger manually)
   */
  submitScan(barcode) {
    if (this._isValidBarcode(barcode)) {
      this._emitScan(barcode);
      return true;
    }
    return false;
  }

  /**
   * Get current scan state for debugging
   */
  getState() {
    return {
      active: this.active,
      isScanning: this.isScanning,
      buffer: this.buffer,
      timingCount: this.timing.length,
      avgInterval: this.timing.length > 1 
        ? (this.timing[this.timing.length - 1] - this.timing[0]) / (this.timing.length - 1)
        : 0,
    };
  }
}

module.exports = BarcodeInterceptor;
