# Supérette Plus — Premium POS

A real, offline-first desktop POS application for Algerian minimarkets. Built with Electron — runs as a native Windows `.exe`, no internet required, no installation of databases or runtimes needed by the end user.

![Liquid Glass Aesthetic](https://img.shields.io/badge/design-Liquid%20Glass-ef4444) ![Offline](https://img.shields.io/badge/offline-100%25-10b981) ![Platform](https://img.shields.io/badge/platform-Windows-blue)

---

## ✨ What's included

- **Full Liquid Glass UI** — dark mode, frosted glass panels, neon-red accents, custom borderless window frame
- **Complete checkout flow** — barcode scanning (real keyboard event interception), search, cart with quantities, totals
- **Algerian specifics**:
  - Automatic **Timbre de quittance** (1% over 1000 DA threshold)
  - Configurable **TVA** (default 9%)
  - **Le Carnet** — credit system for trusted neighborhood customers
  - **FR ⇄ AR toggle** with full RTL layout
- **Hardware-ready printing** — generates 80mm thermal printer ticket HTML and sends to Windows print spooler (works with any USB thermal printer that has a Windows driver: Xprinter, Epson, Bixolon, etc.)
- **Inventory management** — add/edit/delete products, low stock alerts, expiry tracking
- **Stats dashboard** — daily/weekly CA, top sellers, transaction count
- **Backup & restore** — one-click JSON export/import to USB or external drive
- **Hardware-locked licensing** — generates a HWID per machine, validates against an HMAC-SHA256 activation key
- **Settings** — configurable shop info, NIF, tax rates, printer width

---

## 🚀 Quick start (development)

You need Node.js 18+ installed. That's it — no other dependencies.

```bash
cd superette-plus
npm install
npm start
```

The app launches as a borderless dark window. On the license screen, either:
- Type `DEMO-DEMO-DEMO-DEMO-DEMO` and click Activate, OR
- Click the red logo 5 times to skip activation in dev mode

Your data is persisted to:
- **Windows**: `%APPDATA%/superette-plus/superette-data.json`
- **macOS**: `~/Library/Application Support/superette-plus/superette-data.json`
- **Linux**: `~/.config/superette-plus/superette-data.json`

---

## 📦 Building the Windows installer

```bash
npm run build
```

This produces in the `dist/` folder:
- `Supérette Plus-1.0.0-x64.exe` — NSIS installer with desktop shortcut, start menu entry, uninstaller
- `SuperettePlus-Portable-1.0.0.exe` — single-file portable executable (no install required, runs from a USB stick)

To build only one format:
```bash
npm run build:installer    # NSIS installer only
npm run build:portable     # Portable .exe only
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `F1` | Focus search |
| `F5` | Clear cart |
| `F8` | Open Carnet (credit) view |
| `F9` | Open payment modal |
| `Enter` | Confirm payment / process scanned barcode |
| Type barcode → `Enter` | Scan product (works without focusing any input) |

Test scanning by typing one of these sample barcodes anywhere in the app, then pressing Enter:
- `6130001234567` → Pain Baguette
- `6130003456789` → Eau Ifri 1.5L
- `6130009012345` → Huile Elio 5L

---

## 🔑 Licensing system (for distribution)

The app generates a **Hardware ID** (HWID) from MAC address + hostname + CPU model, hashed with SHA-256.

To generate an activation key for a customer:
1. Customer sends you their HWID (shown on the license screen)
2. You run this in a Node REPL on YOUR machine:
   ```js
   const crypto = require('crypto');
   const hwid = 'CUSTOMER_HWID_HERE';
   const SECRET = 'SUPERETTE_PLUS_VEMO068_2026'; // ⚠️ Change this in main.js for production!
   const key = crypto.createHmac('sha256', SECRET).update(hwid).digest('hex')
     .substring(0, 20).toUpperCase().match(/.{1,4}/g).join('-');
   console.log(key);
   ```
3. Send them the resulting `XXXX-XXXX-XXXX-XXXX-XXXX` key

**⚠️ Before distributing:** change `SECRET` in `src/main.js` line ~120 to your own private string. Otherwise, anyone could generate keys.

---

## 🖨️ Printer setup

The app uses Electron's built-in `webContents.print()` which talks to the Windows print spooler.

1. Install your thermal printer's driver (Xprinter, Epson TM-series, etc.) from the manufacturer
2. Set it as the **default printer** in Windows Settings → Printers
3. In Settings → Réglages, set the printer width (80mm or 58mm)
4. When you click "Valider & Imprimer", the system print dialog opens with the ticket pre-formatted

To make printing **fully silent** (no dialog), open `src/main.js` and change `silent: false` to `silent: true` in the `print:ticket` IPC handler.

---

## 📁 Project structure

```
superette-plus/
├── package.json           ← Dependencies + electron-builder config
├── src/
│   ├── main.js            ← Electron main process: window, DB, IPC, license, print
│   ├── preload.js         ← Secure context bridge
│   ├── index.html         ← App shell
│   ├── styles.css         ← Full Liquid Glass design system
│   └── app.js             ← Renderer: views, state, all UI logic
└── dist/                  ← Built installers (after npm run build)
```

Total: ~2000 lines of code, zero native dependencies, zero build step for the renderer.

---

## 🛠️ Architecture decisions

- **Electron over Flutter**: Faster to iterate, no Dart toolchain required, instant hot reload, web debugging tools work out of the box. Same final UX — borderless window, native installer, offline-first.
- **JSON file DB over SQLite**: Zero native compilation. For a single-cashier shop with <100k transactions, JSON read/write is instantaneous. If you outgrow it, swap in `better-sqlite3` later.
- **Vanilla JS over React**: One less build step. The app re-renders fast enough that no virtual DOM is needed. The whole renderer is one self-contained file.

---

## 🔄 Migrating to Flutter later

If you want the original Flutter Windows stack from the blueprint, this Electron version serves as a working reference for:
- Exact layouts and spacing (port the CSS to Flutter's `Container` + `BoxDecoration`)
- The state shape (port to Riverpod or Bloc)
- The DB schema (use `isar` packages with the same fields)
- The barcode listening logic (use `RawKeyboardListener` at the root)
- The licensing/HWID approach (use `system_info2` package for MAC addresses)

---

## 📝 License

Private — Vemo068 2026

---

Built with Electron, lots of `backdrop-filter`, and care for the Algerian market.
