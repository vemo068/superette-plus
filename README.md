# Supérette Plus — Premium POS

A real, offline-first desktop POS application for Algerian minimarkets. Built with Electron — runs as a native Windows `.exe`, no internet required, no installation of databases or runtimes needed by the end user.

![Liquid Glass Aesthetic](https://img.shields.io/badge/design-Liquid%20Glass-ef4444) ![Offline](https://img.shields.io/badge/offline-100%25-10b981) ![Platform](https://img.shields.io/badge/platform-Windows-blue) ![Themes](https://img.shields.io/badge/themes-Dark%20%7C%20Light-333)

---

## 🎨 UI/UX Highlights

### **Modern Liquid Glass Design**
The interface features a sophisticated **Liquid Glass** aesthetic with:
- **Frosted glass panels** with backdrop blur effects
- **Microinteractions** — smooth transitions, hover states, button animations
- **Custom borderless window** with native Windows controls (minimize, maximize, close)
- **Dual themes** — Dark (optimized for evening work) and Light (for daytime)
- **Neon red accents** on primary actions (payment button, alerts)
- **Two-language support** — French/Arabic with RTL layout switching

### **Layout Architecture**

```
╔═══════════════════════════════════════════════════════════════════╗
║  [TITLEBAR] Supérette+ v1.0.0 | Caisse #1 — Aïcha B.   [_ □ ✕]  ║
╠═════╦═════════════════════════════════════════════════════════════╣
║     ║                                                             ║
║  S  ║  [SEARCH BAR] + SCAN INDICATOR                [RIGHT PANEL] ║
║  I  ║                                                             ║
║  D  ║  ╔═══════════════════════════════════════════════════════╗ ║
║  E  ║  ║ CART PANEL — Ticket #4782                      [VIDER]║ ║
║  B  ║  ╠═══════════════════════════════════════════════════════╣ ║
║  A  ║  ║ 01 | Pain Baguette      · 15 DA    [- 1 +]  15 DA [X]║ ║
║  R  ║  ║ 02 | Lait Candia 1L     · 110 DA   [- 2 +]  220 DA[X]║ ║
║     ║  ║ 03 | Coca-Cola 1L       · 95 DA    [- 1 +]  95 DA [X]║ ║
║     ║  ║ 04 | Yaourt Soummam     · 25 DA    [- 1 +]  25 DA [X]║ ║
║     ║  ║                                                       ║ ║
║     ║  ║ ...scroll...                                          ║ ║
║     ║  ╠═══════════════════════════════════════════════════════╣ ║
║     ║  ║ Sous-total         |  355 DA                         ║ ║
║     ║  ║ TVA (9%)           |   32 DA                         ║ ║
║     ║  ║ ─────────────────────────────                        ║ ║
║     ║  ║ TOTAL À PAYER      |  387 DA        [PAYER - F9]    ║ ║
║     ║  ╚═══════════════════════════════════════════════════════╝ ║
║     ║                                                             ║
╚═════╩═════════════════════════════════════════════════════════════╝

SIDEBAR (LEFT):
  🔥 (Logo + Active indicator)
  🛒 Caisse         ← ACTIVE
  📦 Stock
  💳 Carnet
  📊 Stats
  ⚙️  Réglages
  ───────
  🌍 FR/ع
```

### **Right Panel — Real-time Insights**

```
╔════════════════════════════╗
║ CA du jour    │    12,450 DA║
║ Tickets        │        45  ║
╚════════════════════════════╝

Quick Categories:
┌──────┬──────┐
│ 🥖   │ 🥛   │
│Pain  │ Lait │
├──────┼──────┤
│ 🥤   │ 🍫   │
│Bois. │Snack │
├──────┼──────┤
│ 🛒   │ 🧴   │
│Epic. │Mén.  │
└──────┴──────┘

Alerts (Low Stock / Expiry):
┌─────────────────────────────┐
│ ⚠️  Yaourt Soummam   8 rest. │
│ ⚠️  Fromage (exp)    3 jours │
└─────────────────────────────┘
```

### **Checkout Flow (Payment Modal)**

```
╔═══════════════════════════════════════════╗
║  Encaissement                          [✕] ║
║  Sélectionnez le mode de paiement         ║
╠═══════════════════════════════════════════╣
║                                           ║
║                 TOTAL                     ║
║                  387 DA                    ║
║                                           ║
║  ┌─────────┬─────────┬─────────┐         ║
║  │ 💵      │ 🏦      │ 📱      │         ║
║  │Espèces │ CIB     │BaridiMob│         ║
║  └─────────┴─────────┴─────────┘         ║
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │ Mettre sur Carnet (Crédit)          │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
╚═══════════════════════════════════════════╝

→ Cash entry screen:
  [Montant reçu] _______________
  ┌─────┬─────┬─────┬─────┐
  │ 400 │ 500 │1000 │2000 │ (quick buttons)
  └─────┴─────┴─────┴─────┘
  
  Monnaie à rendre: 13 DA ✓
  [Retour]  [Valider & Imprimer]
```

### **Inventory Management View**

```
╔═════════════════════════════════════════════════════════════╗
║  Stock — 15 produits              [⬇️ Sauv.]  [⬆️ Rest.] [➕ Nouveau]║
╠═════════════════════════════════════════════════════════════╣
║ Code-barres  │ Nom (FR)      │ Catég  │ Prix  │ Stock │ Exp║
├──────────────┼───────────────┼────────┼───────┼───────┼────┤
│6130001234... │ Pain Baguette │ bread  │ 15 DA │ 120   │ —  │
│6130002345... │ Lait Candia   │ dairy  │110 DA │  45   │... │
│6130003456... │ Eau Ifri 1.5L │ drinks │ 35 DA │ 200   │... │
│6130005678... │ Yaourt Soummam│ dairy  │ 25 DA │  8⚠️  │... │
└──────────────┴───────────────┴────────┴───────┴───────┴────┘

Status badges:
  ✓ Normal stock
  ⚠️ Dégeurée (Low)
  🔴 Danger (Critical)
```

### **Settings Panel — Themes & Configuration**

```
╔════════════════════════════════════════╗
║  Réglages              [Sauvegarder]   ║
╠════════════════════════════════════════╣
║                                        ║
║ MAGASIN                                ║
│  Nom du magasin  [Supérette Plus    ]│
│  Caissier(e)     [Aïcha B.          ]│
│  Adresse         [Cité 1000 Log... ]│
│  Téléphone       [021 00 00 00     ]│
│  NIF            [000000000000000  ]│
│                                        ║
║ TAXES                                  ║
│  TVA (%)         [9.00                ]│
│  Timbre (%)      [1.00                ]│
│  Seuil timbre    [1000                ]│
│                                        ║
║ APPARENCE                              ║
│  Thème           [▼ Mode sombre  ]│
│                  ├ Mode sombre
│                  └ Mode clair
│                                        ║
║ LICENCE                                ║
│  HWID: AB123CD456EF789XY0Z            │
│                                        ║
╚════════════════════════════════════════╝
```

---

## ✨ What's included

- **Full Liquid Glass UI** — dark mode, frosted glass panels, neon-red accents, custom borderless window frame
- **Dual Theme System** — seamless toggle between Dark (professional, low-light) and Light (daytime, accessible)
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
- **Settings** — configurable shop info, NIF, tax rates, printer width, theme preference

---

## 🎯 Key Features & Workflows

### **Caisse (Checkout) — Main Workspace**
The primary view where cashiers work. Optimized for speed:

1. **Search Bar** — Type product name (FR/AR) or barcode to find items
2. **Real-time scan** — Tap barcode scanner or type barcode + Enter
3. **Cart visualization** — Shows item count, quantity +/-, total with live calculation
4. **Quick categories** — 6 category buttons on the right for fast restocking
5. **Payment trigger** — F9 or "PAYER" button opens modal

**Color coding**:
- 🟢 Scan successful → flash green indicator
- 🔴 Scan failed / unknown barcode → flash red indicator
- ⚠️ Low stock items highlighted in cart

### **Stock (Inventory)**
Comprehensive product database management:

- **Table view** — All 15 products with barcode, name (FR + AR), category, price, stock level, expiry
- **Status indicators**:
  - Normal: White text
  - Low (< min): Yellow (`⚠️`)
  - Critical (< half min): Red (`🔴`)
- **Row actions** — Edit or delete per product
- **Backup/Restore** — One-click CSV export/import

### **Carnet (Credit Registry)**
Neighborhood customer ledger:

- **Customer list** — Name, phone, current balance due
- **Running balance** — Updated in real-time
- **Encaisser button** — Quick payment collection modal
- **Summary stats** — Total due, active customers, monthly collected

### **Stats (Analytics)**
Quick business intelligence:

- **Today's CA** — Daily revenue snapshot
- **7-day CA** — Weekly trend
- **Total CA** — Lifetime cumulative
- **Top sellers** — Ranked by quantity sold
- **Expiry alerts** — Items expiring soon, critical stock levels

### **Réglages (Settings)**
One-stop configuration:

- **Shop info** — Name, address, phone, NIF (unique tax ID)
- **Cashier name** — For receipts
- **Tax setup** — TVA rate, Timbre rate & threshold
- **Theme selector** — Switch between Dark/Light instantly
- **HWID display** — For licensing/support

---

## 🎨 Theme System

### **Dark Mode** (Default)
```
Background:    #050609 (Almost black)
Text Primary:  #FFFFFF (White)
Text Secondary: rgba(255,255,255,0.6) (60% opacity white)
Text Tertiary:  rgba(255,255,255,0.4) (40% opacity white)
Accents:       #ef4444 (Neon Red) | #10b981 (Emerald Green)
Panels:        rgba() with 2-4% white overlay + glass blur
Borders:       1px solid rgba(255,255,255,0.04-0.1)
```

**Best for**: Evening work, low ambient light, comfortable for extended hours

### **Light Mode**
```
Background:    #f8f9fa (Off-white)
Text Primary:  #1a202c (Dark slate)
Text Secondary: #4a5568 (Medium gray)
Text Tertiary:  #718096 (Light gray)
Accents:       #e53e3e (Dark Red) | #22863a (Dark Green)
Panels:        rgba() with 3-5% dark overlay + glass blur
Borders:       1px solid rgba(0,0,0,0.05-0.1)
```

**Best for**: Daytime operation, high ambient light, easy on-screen readability

**Real-time switching**: All UX elements — buttons, forms, tables, modals — automatically adapt when you toggle themes in Settings.

---

## ✨ UX Patterns & Interactions

### **Barcode Scanning (Fast Path)**
The app intercepts keyboard input globally — no need to focus an input field:

```
Cashier workflow (typical):
1. Customer brings items
2. Cashier types/scans barcode (e.g., 6130001234567)
3. App auto-searches product in the 400ms buffer window
4. ✓ Item added to cart automatically
5. Qty buttons to adjust quantities
6. Repeat for all items
7. Press F9 or click "PAYER"
8. Select payment method
9. Print receipt to thermal printer
```

### **Cart Microinteractions**
- **Hover item** → Background lightens slightly, delete button reveals
- **Increment/Decrement** → Cart totals recalculate in real-time
- **Remove item** → Smooth fade-out animation
- **Clear cart** — Confirmation not required (F5 is undo-able)

### **Payment Flow (Step-by-step)**
```
User clicks "PAYER" (F9)
  ↓
Modal 1: Select method (Espèces / CIB / BaridiMob / Carnet)
  ├→ Cash: Opens input for amount, quick-buttons for common denominations
  │   Shows change due when valid
  ├→ Card/Mobile: Auto-completes sale
  └→ Carnet: Shows customer list, amount recorded to their balance

Success → Toast notification
        → Receipt prints automatically
        → Cart clears
        → Ready for next sale
```

### **Toast Notifications**
- **Green background** — Success (payment recorded, product added)
- **Red background** — Error (invalid barcode, low stock)
- **Auto-dismiss** — After 3.5 seconds

### **Modal Patterns**
- **Keyboard-accessible** — Close with Escape key
- **Click backdrop** — Also closes modals (except during active entry)
- **Focus trap** — Tab navigation stays inside modal

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
