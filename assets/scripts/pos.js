document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav-pos');
  const container = document.getElementById('role-dashboard');
  if (!nav || !container) return;

  // ================================================ sample data (replace with API fetch later)
  const products = [
    { id: 'P001', name: 'Paracetamol 500mg', price: 35.00, prescription: false, shelf: 'A1', delivered: '2026-04-28', dosage: '500mg', stock: 24 },
    { id: 'P002', name: 'Amoxicillin 250mg', price: 120.00, prescription: true,  shelf: 'B4', delivered: '2026-04-20', dosage: '250mg', stock: 8  },
    { id: 'P003', name: 'Cough Syrup 100ml', price: 85.00,  prescription: false, shelf: 'C2', delivered: '2026-03-10', dosage: '100ml', stock: 12 },
    { id: 'P004', name: 'Insulin 10ml',      price: 850.00, prescription: true,  shelf: 'D1', delivered: '2026-04-01', dosage: '10ml',  stock: 4  },
    { id: 'P005', name: 'Vitamin C 500mg',   price: 60.00,  prescription: false, shelf: 'A3', delivered: '2026-04-25', dosage: '500mg', stock: 30 },
  ];

  let cart = [];

  // ── Helpers ────────────────────────────────────────────────────────────

  function getRole() {
    const badge = document.getElementById('current-role');
    const userName = document.getElementById('user-name')?.textContent?.trim() || '';
    if (!badge) return { role: 'patient', userName };
    const txt = badge.textContent || '';
    if (/admin/i.test(txt))  return { role: 'admin', userName };
    if (/staff/i.test(txt))  return { role: 'staff', userName };
    return { role: 'patient', userName };
  }

  function fmt(n) {
    return '₱' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function setActiveNav(target) {
    if (window.setActiveSidebar) return window.setActiveSidebar(target);
    const links = document.querySelectorAll('#sidebar nav a');
    links.forEach(a => a.classList.remove('active-nav','bg-[#e53935]','text-white'));
    const el = (typeof target === 'string') ? document.getElementById(target) : target;
    if (el) el.classList.add('active-nav');
  }

  // Pill badge
  const rxBadge  = `<span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">Rx Required</span>`;
  const otcBadge = `<span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">OTC</span>`;

  function stockLabel(stock) {
    if (stock === 0) return `<span class="text-[10px] font-semibold text-red-500 dark:text-red-400">Out of stock</span>`;
    if (stock <= 5)  return `<span class="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Low: ${stock} left</span>`;
    return `<span class="text-[10px] font-semibold text-gray-400 dark:text-gray-500">${stock} in stock</span>`;
  }

  // ── Render shell ───────────────────────────────────────────────────────

  function render() {
    setActiveNav(nav);
    const { role } = getRole();

    container.innerHTML = `
      <!-- Page header -->
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-gray-800 dark:text-white tracking-tight">🛒 Point of Sale</h2>
          <p class="text-xs text-gray-400 mt-0.5">Process transactions and manage cart</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Role:</span>
          <span class="text-[11px] font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-lg capitalize">${role}</span>
          ${role === 'admin' ? `<button id="add-product" class="ml-2 bg-[#e53935] hover:bg-[#c62828] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20">➕ Add Product</button>` : ''}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">

        <!-- ── Product panel ── -->
        <div class="lg:col-span-3 space-y-4">

          <!-- Filters -->
          <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm px-5 py-4">
            <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div class="flex-1 flex items-center gap-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-xl px-3 py-2.5">
                <svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input id="pos-search" placeholder="Search products…"
                  class="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 w-full" />
              </div>
              <div class="flex items-center gap-2">
                <label class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex-shrink-0">Type</label>
                <select id="filter-presc"
                  class="border border-gray-200 dark:border-white/[0.07] rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow">
                  <option value="all">All Products</option>
                  <option value="rx">Prescription (Rx)</option>
                  <option value="otc">OTC Only</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Product grid -->
          <div id="product-list" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"></div>
        </div>

        <!-- ── Cart panel ── -->
        <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm overflow-hidden sticky top-4">

          <!-- Cart header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-[#e53935]/10 flex items-center justify-center text-sm">🛒</div>
              <h4 class="text-sm font-bold text-gray-800 dark:text-white">Cart</h4>
            </div>
            <span id="cart-count" class="text-[10px] font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 px-2 py-1 rounded-lg">0 items</span>
          </div>

          <!-- Cart items -->
          <div id="cart-list" class="divide-y divide-gray-50 dark:divide-white/[0.04] min-h-[80px] max-h-80 overflow-y-auto"></div>

          <!-- Cart footer -->
          <div class="px-5 py-4 border-t border-gray-100 dark:border-white/[0.06] space-y-3">
            <!-- Total -->
            <div class="flex items-center justify-between bg-[#e53935]/5 dark:bg-[#e53935]/10 rounded-xl px-4 py-3">
              <span class="text-sm font-semibold text-gray-600 dark:text-gray-300">Total</span>
              <span id="cart-total" class="font-mono text-lg font-bold text-[#e53935]">₱0.00</span>
            </div>

            <!-- Payment mode -->
            <div>
              <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Payment Method</label>
              <select id="payment-mode"
                class="w-full border border-gray-200 dark:border-white/[0.07] rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow">
                <option value="cash">💵 Cash</option>
                <option value="card">💳 Card</option>
                <option value="insurance">📱 Gcash</option>
              </select>
            </div>

            <!-- Buttons -->
            <button id="checkout-btn"
              class="w-full bg-[#e53935] hover:bg-[#c62828] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20 flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Pay & Print Receipt
            </button>
            <button id="clear-btn"
              class="w-full border border-gray-200 dark:border-white/[0.07] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] py-2.5 rounded-xl text-sm font-semibold transition-colors">
              Clear Cart
            </button>
          </div>
        </div>

      </div>
    `;

    wire();
    updateProductList();
    updateCart();
  }

  // ── Product list ───────────────────────────────────────────────────────

  function updateProductList() {
    const query  = document.getElementById('pos-search')?.value?.toLowerCase() || '';
    const filter = document.getElementById('filter-presc')?.value || 'all';
    const list   = container.querySelector('#product-list');
    if (!list) return;

    const filtered = products.filter(p => {
      if (filter === 'rx'  && !p.prescription) return false;
      if (filter === 'otc' &&  p.prescription) return false;
      if (query && !p.name.toLowerCase().includes(query) && !p.id.toLowerCase().includes(query)) return false;
      return true;
    });

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <div class="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-2xl mb-3">🔍</div>
          <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">No products found</p>
          <p class="text-xs text-gray-400 mt-1">Try a different search or filter</p>
        </div>`;
      return;
    }

    const { role } = getRole();
    const outOfStock = p => p.stock === 0;

    list.innerHTML = filtered.map(p => `
      <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm p-4 flex flex-col gap-3 transition-all ${outOfStock(p) ? 'opacity-60' : 'hover:shadow-md hover:-translate-y-0.5'}" style="transition: transform .15s, box-shadow .15s">

        <!-- Top row -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-sm text-gray-800 dark:text-gray-100 leading-snug truncate">${p.name}</div>
            <div class="text-[11px] text-gray-400 mt-1">${p.dosage} &nbsp;·&nbsp; Shelf <span class="font-mono font-semibold text-gray-500 dark:text-gray-400">${p.shelf}</span></div>
          </div>
          <div class="flex-shrink-0 text-right">
            <div class="text-base font-bold text-gray-800 dark:text-white font-mono">${fmt(p.price)}</div>
            ${stockLabel(p.stock)}
          </div>
        </div>

        <!-- Badges row -->
        <div class="flex items-center gap-2 flex-wrap">
          ${p.prescription ? rxBadge : otcBadge}
          <span class="text-[10px] font-semibold text-gray-400 dark:text-gray-500">Delivered ${p.delivered}</span>
        </div>

        <!-- Action row -->
        <div class="flex items-center gap-2 mt-auto pt-1 border-t border-gray-50 dark:border-white/[0.04]">
          <button data-id="${p.id}"
            class="add-to-cart flex-1 text-xs font-bold py-2 rounded-xl transition-all
              ${outOfStock(p)
                ? 'bg-gray-100 dark:bg-white/[0.05] text-gray-400 cursor-not-allowed'
                : 'bg-[#e53935] hover:bg-[#c62828] text-white shadow-sm shadow-red-200 dark:shadow-red-900/20'}"
            ${outOfStock(p) ? 'disabled' : ''}>
            ${outOfStock(p) ? 'Out of Stock' : '+ Add to Cart'}
          </button>
          ${role === 'admin' ? `<button data-edit="${p.id}" class="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-2 py-2 rounded-lg transition-colors">Edit</button>` : ''}
        </div>
      </div>
    `).join('');

    // wire add buttons
    list.querySelectorAll('.add-to-cart').forEach(btn => btn.addEventListener('click', () => {
      const prod = products.find(x => x.id === btn.getAttribute('data-id'));
      if (!prod) return;
      if (prod.prescription && getRole().role === 'patient') {
        alert('This product requires a prescription. Please request staff assistance.');
        return;
      }
      addToCart(prod.id, 1);
    }));

    // wire edit buttons (admin)
    list.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => {
      const p = products.find(x => x.id === btn.getAttribute('data-edit'));
      if (!p) return;
      const newName  = prompt('Product name', p.name);  if (newName)  p.name  = newName;
      const newPrice = prompt('Price', p.price);         if (newPrice) p.price = Number(newPrice) || p.price;
      updateProductList();
      updateCart();
    }));
  }

  // ── Cart ───────────────────────────────────────────────────────────────

  function addToCart(productId, qty = 1) {
    const p = products.find(x => x.id === productId);
    if (!p || p.stock <= 0) return;
    const existing = cart.find(c => c.id === productId);
    if (existing) existing.qty += qty;
    else cart.push({ id: p.id, name: p.name, price: p.price, qty });
    p.stock -= qty;
    updateProductList();
    updateCart();
  }

  function updateCart() {
    const list     = container.querySelector('#cart-list');
    const totalEl  = container.querySelector('#cart-total');
    const countEl  = container.querySelector('#cart-count');
    if (!list || !totalEl) return;

    const total     = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const itemCount = cart.reduce((s, i) => s + i.qty, 0);
    if (countEl) countEl.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;

    if (cart.length === 0) {
      list.innerHTML = `
        <div class="flex flex-col items-center justify-center py-10 text-center px-5">
          <div class="text-3xl mb-2">🛒</div>
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500">Your cart is empty</p>
          <p class="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">Add products from the list</p>
        </div>`;
      totalEl.textContent = fmt(0);
      return;
    }

    list.innerHTML = cart.map(item => `
      <div class="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
        <div class="flex-1 min-w-0">
          <div class="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-snug truncate">${item.name}</div>
          <div class="text-[10px] text-gray-400 mt-0.5 font-mono">${fmt(item.price)} × ${item.qty} = <span class="font-bold text-gray-600 dark:text-gray-300">${fmt(item.price * item.qty)}</span></div>
        </div>
        <div class="flex items-center gap-1 flex-shrink-0">
          <button data-minus="${item.id}"
            class="w-6 h-6 rounded-lg border border-gray-200 dark:border-white/[0.1] flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors font-bold">−</button>
          <span class="text-xs font-bold text-gray-700 dark:text-gray-200 w-5 text-center">${item.qty}</span>
          <button data-plus="${item.id}"
            class="w-6 h-6 rounded-lg border border-gray-200 dark:border-white/[0.1] flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors font-bold">+</button>
          <button data-remove="${item.id}"
            class="w-6 h-6 rounded-lg flex items-center justify-center text-xs text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-0.5">✕</button>
        </div>
      </div>
    `).join('');

    // wire qty buttons
    list.querySelectorAll('[data-plus]').forEach(b => b.addEventListener('click', () => {
      const id = b.getAttribute('data-plus');
      const p = products.find(x => x.id === id);
      if (p && p.stock > 0) { cart.find(c => c.id === id).qty++; p.stock--; updateCart(); updateProductList(); }
    }));
    list.querySelectorAll('[data-minus]').forEach(b => b.addEventListener('click', () => {
      const id = b.getAttribute('data-minus');
      const idx = cart.findIndex(c => c.id === id);
      if (idx > -1) {
        cart[idx].qty--;
        const p = products.find(x => x.id === id);
        if (p) p.stock++;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
        updateCart(); updateProductList();
      }
    }));
    list.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
      const id = b.getAttribute('data-remove');
      const idx = cart.findIndex(c => c.id === id);
      if (idx > -1) {
        const p = products.find(x => x.id === id);
        if (p) p.stock += cart[idx].qty;
        cart.splice(idx, 1);
        updateCart(); updateProductList();
      }
    }));

    totalEl.textContent = fmt(total);
  }

  // ── Checkout ───────────────────────────────────────────────────────────

  function checkout() {
    if (cart.length === 0) { alert('Cart is empty'); return; }
    const payment  = container.querySelector('#payment-mode')?.value || 'cash';
    const roleObj  = getRole();
    const w = window.open('', '_blank', 'noopener,width=520,height=700');
    if (!w) { alert('Popup blocked. Allow popups to generate receipt.'); return; }
    w.document.write(buildReceipt(payment, roleObj.userName || roleObj.role));
    w.document.close();
    w.focus();
    setTimeout(() => { try { w.print(); } catch (e) {} }, 300);
    cart = [];
    updateCart();
    updateProductList();
  }

  function buildReceipt(paymentMode, cashier) {
    const now   = new Date();
    const items = cart.map(i =>
      `<tr>
        <td>${i.name}</td>
        <td style="text-align:center">${i.qty}</td>
        <td style="text-align:right;font-family:'DM Mono',monospace">${fmt(i.price)}</td>
        <td style="text-align:right;font-family:'DM Mono',monospace;font-weight:700">${fmt(i.price * i.qty)}</td>
      </tr>`
    ).join('');
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const methodIcon = { cash: '💵', card: '💳', insurance: '🏥' };

    return `<!doctype html><html><head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Receipt — RS Pharmacy</title>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',system-ui,sans-serif;background:#f7f7f8;display:flex;align-items:flex-start;justify-content:center;min-height:100vh;padding:32px 16px;color:#111}
        .receipt{background:#fff;border-radius:16px;border:1px solid #eee;width:100%;max-width:420px;overflow:hidden}
        .receipt-header{background:#e53935;padding:24px;text-align:center;color:#fff}
        .receipt-header h1{font-size:20px;font-weight:700;letter-spacing:-.02em}
        .receipt-header p{font-size:12px;opacity:.75;margin-top:4px}
        .receipt-body{padding:20px}
        .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
        .meta-cell{background:#f7f7f8;border-radius:10px;padding:10px}
        .meta-cell .lbl{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#888;margin-bottom:3px}
        .meta-cell .val{font-size:13px;font-weight:600;color:#111}
        table{width:100%;border-collapse:collapse;margin-bottom:16px}
        thead tr{border-bottom:2px solid #f0f0f0}
        th{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#999;padding:8px 0;text-align:left}
        td{font-size:13px;padding:10px 0;border-bottom:1px solid #f7f7f7;color:#333;vertical-align:middle}
        .total-row{background:#fff5f5;border-radius:12px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border:1px solid #fde8e8}
        .total-row .lbl{font-size:13px;font-weight:600;color:#555}
        .total-row .val{font-family:'DM Mono',monospace;font-size:24px;font-weight:700;color:#e53935}
        .payment-row{display:flex;align-items:center;gap:8px;margin-bottom:20px}
        .payment-label{font-size:11px;color:#999;font-weight:600}
        .payment-badge{background:#f0f0f0;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;color:#555}
        .footer{text-align:center;font-size:11px;color:#aaa;padding:16px;border-top:1px solid #f5f5f5;line-height:1.6}
        .print-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;background:#e53935;border:none;color:#fff;padding:13px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:background .15s}
        .print-btn:hover{background:#c62828}
        @media print{body{background:#fff;padding:0}.print-btn{display:none}.receipt{border:none;border-radius:0}}
      </style>
    </head><body>
      <div class="receipt">
        <div class="receipt-header">
          <h1>💊 RS Pharmacy</h1>
          <p>Official Transaction Receipt</p>
        </div>
        <div class="receipt-body">
          <div class="meta-grid">
            <div class="meta-cell"><div class="lbl">Date</div><div class="val">${now.toLocaleDateString()}</div></div>
            <div class="meta-cell"><div class="lbl">Time</div><div class="val">${now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div></div>
            <div class="meta-cell" style="grid-column:1/-1"><div class="lbl">Cashier</div><div class="val">${cashier}</div></div>
          </div>
          <table>
            <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Amount</th></tr></thead>
            <tbody>${items}</tbody>
          </table>
          <div class="total-row"><span class="lbl">Total Amount</span><span class="val">${fmt(total)}</span></div>
          <div class="payment-row">
            <span class="payment-label">Payment via</span>
            <span class="payment-badge">${methodIcon[paymentMode] || ''} ${paymentMode.charAt(0).toUpperCase() + paymentMode.slice(1)}</span>
          </div>
        </div>
        <div class="footer">Thank you for choosing RS Pharmacy.<br>Please keep this receipt for your records.</div>
        <button class="print-btn" onclick="window.print()">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Print Receipt
        </button>
      </div>
    </body></html>`;
  }

  // ── Wire top-level controls ────────────────────────────────────────────

  function wire() {
    container.querySelector('#pos-search')?.addEventListener('input', () => updateProductList());
    container.querySelector('#filter-presc')?.addEventListener('change', () => updateProductList());
    container.querySelector('#checkout-btn')?.addEventListener('click', () => checkout());
    container.querySelector('#clear-btn')?.addEventListener('click', () => {
      // restore stock
      cart.forEach(item => { const p = products.find(x => x.id === item.id); if (p) p.stock += item.qty; });
      cart = [];
      updateCart();
      updateProductList();
    });

    container.querySelector('#add-product')?.addEventListener('click', () => {
      const id        = prompt('Product ID');       if (!id)   return;
      const name      = prompt('Name');             if (!name) return;
      const price     = Number(prompt('Price') || 0);
      const presc     = confirm('Requires prescription?');
      const shelf     = prompt('Shelf', 'A1') || 'A1';
      const dosage    = prompt('Dosage', '') || '';
      const delivered = new Date().toISOString().slice(0, 10);
      const stock     = Number(prompt('Stock', '0') || 0);
      products.push({ id, name, price, prescription: presc, shelf, delivered, dosage, stock });
      updateProductList();
    });
  }

  // ── Nav click ──────────────────────────────────────────────────────────
  nav.addEventListener('click', (e) => { e.preventDefault(); render(); });
  if (location.hash === '#pos') render();
});