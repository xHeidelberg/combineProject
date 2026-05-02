document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav-history');
  const container = document.getElementById('role-dashboard');
  if (!nav || !container) return;

  const sampleRows = [
    { id: 'TXN-001', date: '2026-04-28 09:12', customer: 'Juan Dela Cruz', items: 'Paracetamol x2', total: '₱100.00', method: 'GCash' },
    { id: 'TXN-002', date: '2026-04-28 10:05', customer: 'Maria Santos', items: 'Vitamin C x1', total: '₱120.00', method: 'Cash' },
    { id: 'TXN-003', date: '2026-04-29 14:22', customer: 'Pedro Reyes', items: 'Amoxicillin x1', total: '₱75.00', method: 'Card' },
  ];

  // ── UI helpers (matches dashboard design system) ──────────────────────

  const methodBadge = (method) => {
    const styles = {
      gcash: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
      cash:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
      card:  'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
    };
    const icons = { gcash: '📱', cash: '💵', card: '💳' };
    const key = method.toLowerCase();
    return `<span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg ${styles[key] || 'bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-400'}">
      ${icons[key] || ''}${method}
    </span>`;
  };

  function setActiveNav(el) {
    document.querySelectorAll('#sidebar nav a').forEach(a => {
      a.classList.remove('bg-[#e53935]', 'text-white');
    });
    if (el) el.classList.add('bg-[#e53935]', 'text-white');
  }

  function buildTable(rows) {
    const isEmpty = rows.length === 0;

    return `
      <div class="bg-white dark:bg-[#161616] rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.05] overflow-hidden">
        <!-- Table header bar -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.05]">
          <div>
            <h3 class="text-sm font-bold text-gray-800 dark:text-white tracking-tight">Transaction History</h3>
            <p class="text-[11px] text-gray-400 mt-0.5">${rows.length} record${rows.length !== 1 ? 's' : ''} found</p>
          </div>
          <button id="export-csv"
            class="inline-flex items-center gap-1.5 bg-[#e53935] hover:bg-[#c62828] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Export CSV
          </button>
        </div>

        ${isEmpty ? `
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-2xl mb-3">🔍</div>
            <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">No transactions found</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filter</p>
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.05]">
                  <th class="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Transaction</th>
                  <th class="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Date & Time</th>
                  <th class="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Customer</th>
                  <th class="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Items</th>
                  <th class="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Total</th>
                  <th class="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Method</th>
                  <th class="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-white/[0.04]">
                ${rows.map(r => `
                  <tr class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td class="py-3 px-4">
                      <span class="font-mono text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/[0.06] px-2 py-1 rounded-lg">${r.id}</span>
                    </td>
                    <td class="py-3 px-4">
                      <div class="text-xs text-gray-700 dark:text-gray-300 font-medium">${r.date.split(' ')[0]}</div>
                      <div class="text-[10px] text-gray-400 mt-0.5">${r.date.split(' ')[1]}</div>
                    </td>
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-lg bg-[#e53935]/10 text-[#e53935] dark:bg-[#e53935]/15 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          ${r.customer.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-200">${r.customer}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">${r.items}</td>
                    <td class="py-3 px-4">
                      <span class="font-mono text-sm font-bold text-gray-800 dark:text-gray-100">${r.total}</span>
                    </td>
                    <td class="py-3 px-4">${methodBadge(r.method)}</td>
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button class="view-txn text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-2 py-1 rounded-lg transition-colors" data-txn-id="${r.id}">
                          View
                        </button>
                        <button class="receipt-txn text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] px-2 py-1 rounded-lg transition-colors" data-txn-id="${r.id}">
                          Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  function render() {
    setActiveNav(nav);

    container.innerHTML = `
      <!-- Page header -->
      <div class="mb-5">
        <h2 class="text-base font-bold text-gray-800 dark:text-white tracking-tight">🧾 Transaction History</h2>
        <p class="text-xs text-gray-400 mt-0.5">View and export all completed transactions</p>
      </div>

      <!-- Summary stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div class="bg-white dark:bg-[#161616] rounded-2xl p-5 border border-gray-100 dark:border-white/[0.05] shadow-sm">
          <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Total Transactions</p>
          <p class="text-3xl font-bold text-gray-800 dark:text-white">${sampleRows.length}</p>
          <div class="mt-3 h-1 rounded-full bg-blue-100 dark:bg-blue-500/10"><div class="h-full w-3/4 rounded-full bg-blue-500"></div></div>
        </div>
        <div class="bg-white dark:bg-[#161616] rounded-2xl p-5 border border-gray-100 dark:border-white/[0.05] shadow-sm">
          <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Total Revenue</p>
          <p class="text-3xl font-bold text-gray-800 dark:text-white">₱295.00</p>
          <div class="mt-3 h-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10"><div class="h-full w-2/3 rounded-full bg-emerald-500"></div></div>
        </div>
        <div class="bg-white dark:bg-[#161616] rounded-2xl p-5 border border-gray-100 dark:border-white/[0.05] shadow-sm">
          <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Avg. Transaction</p>
          <p class="text-3xl font-bold text-gray-800 dark:text-white">₱98.33</p>
          <div class="mt-3 h-1 rounded-full bg-amber-100 dark:bg-amber-500/10"><div class="h-full w-1/2 rounded-full bg-amber-500"></div></div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm px-5 py-4 mb-4">
        <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <!-- Search -->
          <div class="flex-1 flex items-center gap-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-xl px-3 py-2.5">
            <svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input id="txn-search"
              class="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 w-full"
              placeholder="Search by ID, customer, items…" />
          </div>

          <!-- Method filter -->
          <div class="flex items-center gap-2">
            <label class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex-shrink-0">Method</label>
            <select id="txn-filter-method"
              class="border border-gray-200 dark:border-white/[0.07] rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow">
              <option value="all">All Methods</option>
              <option value="cash">💵 Cash</option>
              <option value="card">💳 Card</option>
              <option value="gcash">📱 GCash</option>
            </select>
          </div>

          <!-- Date filter (UI only) -->
          <div class="flex items-center gap-2">
            <label class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex-shrink-0">Date</label>
            <input type="date" id="txn-filter-date"
              class="border border-gray-200 dark:border-white/[0.07] rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow" />
          </div>
        </div>
      </div>

      <!-- Table -->
      <div id="txn-table-wrapper">${buildTable(sampleRows)}</div>

      <!-- Modal backdrop + panel -->
      <div id="txn-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none opacity-0 transition-opacity duration-200">
        <div id="txn-modal-overlay" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="relative w-full max-w-lg pointer-events-auto bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07] scale-95 transition-transform duration-200" id="txn-modal-panel">
          <!-- Modal header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-[#e53935]/10 text-[#e53935] flex items-center justify-center text-sm">🧾</div>
              <div>
                <h4 id="txn-modal-title" class="text-sm font-bold text-gray-800 dark:text-white">Transaction Details</h4>
                <p class="text-[10px] text-gray-400 mt-0.5">Full transaction information</p>
              </div>
            </div>
            <button id="txn-modal-close"
              class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors text-sm">✕</button>
          </div>
          <!-- Modal body -->
          <div id="txn-modal-body" class="p-5 text-sm text-gray-700 dark:text-gray-300"></div>
        </div>
      </div>
    `;

    const searchEl  = document.getElementById('txn-search');
    const filterEl  = document.getElementById('txn-filter-method');
    const wrapper   = document.getElementById('txn-table-wrapper');
    const modalRoot = document.getElementById('txn-modal');
    const modalPanel = document.getElementById('txn-modal-panel');
    const modalBody = document.getElementById('txn-modal-body');
    const modalClose = document.getElementById('txn-modal-close');
    const modalOverlay = document.getElementById('txn-modal-overlay');

    function getFilteredRows() {
      const q = (searchEl?.value || '').trim().toLowerCase();
      const method = (filterEl?.value || 'all').toLowerCase();
      return sampleRows.filter(r => {
        if (method !== 'all' && r.method.toLowerCase() !== method) return false;
        if (!q) return true;
        return [r.id, r.customer, r.items, r.method].join(' ').toLowerCase().includes(q);
      });
    }

    function wireTableActions() {
      const exportBtn = wrapper.querySelector('#export-csv');
      if (exportBtn) {
        exportBtn.onclick = () => {
          const rows = getFilteredRows();
          const csv = [
            ['Transaction', 'Date', 'Customer', 'Items', 'Total', 'Method'],
            ...rows.map(r => [r.id, r.date, r.customer, r.items, r.total, r.method])
          ].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'transactions.csv';
          document.body.appendChild(a); a.click(); a.remove();
          URL.revokeObjectURL(url);
        };
      }

      wrapper.querySelectorAll('.view-txn').forEach(btn => {
        btn.onclick = () => {
          const row = sampleRows.find(r => r.id === btn.getAttribute('data-txn-id'));
          if (row) openModal(row);
        };
      });
      wrapper.querySelectorAll('.receipt-txn').forEach(btn => {
        btn.onclick = () => {
          const row = sampleRows.find(r => r.id === btn.getAttribute('data-txn-id'));
          if (row) openReceipt(row);
        };
      });
    }

    function updateTable() {
      wrapper.innerHTML = buildTable(getFilteredRows());
      wireTableActions();
    }

    wireTableActions();
    searchEl?.addEventListener('input', updateTable);
    filterEl?.addEventListener('change', updateTable);

    // ── Modal ──────────────────────────────────────────────────────────

    function openModal(row) {
      modalBody.innerHTML = `
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3">
              <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Transaction ID</p>
              <p class="font-mono text-sm font-bold text-gray-700 dark:text-gray-200">${row.id}</p>
            </div>
            <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3">
              <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Date & Time</p>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-200">${row.date}</p>
            </div>
            <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3">
              <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Customer</p>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-200">${row.customer}</p>
            </div>
            <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3">
              <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Payment Method</p>
              <p class="mt-0.5">${methodBadge(row.method)}</p>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3">
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Items Purchased</p>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-200">${row.items}</p>
          </div>
          <div class="flex items-center justify-between bg-[#e53935]/5 dark:bg-[#e53935]/10 rounded-xl px-4 py-3">
            <p class="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Amount</p>
            <p class="font-mono text-xl font-bold text-[#e53935]">${row.total}</p>
          </div>
          <div class="pt-1">
            <button id="generate-txn"
              class="w-full bg-[#e53935] hover:bg-[#c62828] text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20 flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Generate Receipt
            </button>
          </div>
        </div>
      `;

      document.getElementById('generate-txn')?.addEventListener('click', () => openReceipt(row));

      modalRoot.classList.remove('pointer-events-none');
      requestAnimationFrame(() => {
        modalRoot.style.opacity = '1';
        if (modalPanel) modalPanel.style.transform = 'scale(1)';
      });
    }

    function closeModal() {
      modalRoot.style.opacity = '0';
      if (modalPanel) modalPanel.style.transform = 'scale(0.95)';
      setTimeout(() => modalRoot.classList.add('pointer-events-none'), 200);
    }

    modalClose?.addEventListener('click', closeModal);
    modalOverlay?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeModal(); });

    // ── Receipt ────────────────────────────────────────────────────────

    function openReceipt(row) {
      const receiptHTML = `<!doctype html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <title>Receipt — ${row.id}</title>
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
          <style>
            *{box-sizing:border-box;margin:0;padding:0}
            body{font-family:'DM Sans',system-ui,sans-serif;background:#f7f7f8;display:flex;align-items:flex-start;justify-content:center;min-height:100vh;padding:32px 16px;color:#111}
            .receipt{background:#fff;border-radius:16px;border:1px solid #eee;width:100%;max-width:420px;overflow:hidden}
            .receipt-header{background:#e53935;padding:24px;text-align:center;color:#fff}
            .receipt-header h1{font-size:20px;font-weight:700;letter-spacing:-0.02em}
            .receipt-header p{font-size:12px;opacity:.75;margin-top:4px}
            .receipt-body{padding:20px}
            .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
            .info-cell{background:#f7f7f8;border-radius:10px;padding:10px}
            .info-cell .lbl{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#888;margin-bottom:4px}
            .info-cell .val{font-size:13px;font-weight:600;color:#111}
            table{width:100%;border-collapse:collapse;margin-bottom:16px}
            th{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#888;text-align:left;padding:8px 0;border-bottom:1px solid #eee}
            td{font-size:13px;padding:10px 0;border-bottom:1px solid #f5f5f5;color:#333}
            .total-row{background:#fff5f5;border-radius:10px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border:1px solid #fde8e8}
            .total-row .lbl{font-size:12px;font-weight:600;color:#555}
            .total-row .val{font-family:'DM Mono',monospace;font-size:22px;font-weight:700;color:#e53935}
            .method-badge{display:inline-block;font-size:11px;font-weight:600;background:#f0f0f0;color:#555;padding:4px 10px;border-radius:20px}
            .footer{text-align:center;font-size:11px;color:#aaa;padding:16px;border-top:1px solid #f5f5f5}
            .print-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;background:#e53935;border:none;color:#fff;padding:12px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s}
            .print-btn:hover{background:#c62828}
            @media print{body{background:#fff;padding:0}.print-btn{display:none}.receipt{border:none;border-radius:0}}
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="receipt-header">
              <h1>💊 RS Pharmacy</h1>
              <p>Official Transaction Receipt</p>
            </div>
            <div class="receipt-body">
              <div class="info-grid">
                <div class="info-cell"><div class="lbl">Transaction ID</div><div class="val" style="font-family:'DM Mono',monospace">${row.id}</div></div>
                <div class="info-cell"><div class="lbl">Date & Time</div><div class="val">${row.date}</div></div>
                <div class="info-cell" style="grid-column:1/-1"><div class="lbl">Customer</div><div class="val">${row.customer}</div></div>
              </div>
              <table>
                <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th></tr></thead>
                <tbody>
                  <tr>
                    <td>${row.items}</td>
                    <td style="text-align:center">1</td>
                    <td style="text-align:right;font-family:'DM Mono',monospace;font-weight:600">${row.total}</td>
                  </tr>
                </tbody>
              </table>
              <div class="total-row">
                <span class="lbl">Total Amount</span>
                <span class="val">${row.total}</span>
              </div>
              <div style="margin-bottom:16px"><span class="lbl" style="font-size:11px;color:#888">Payment via </span><span class="method-badge">${row.method}</span></div>
            </div>
            <div class="footer">Thank you for choosing RS Pharmacy.<br>Please keep this receipt for your records.</div>
            <button class="print-btn no-print" onclick="window.print()">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              Print Receipt
            </button>
          </div>
        </body>
        </html>`;

      const w = window.open('', '_blank', 'noopener,width=520,height=700');
      if (!w) return alert('Popup blocked. Allow popups to generate receipt.');
      w.document.write(receiptHTML);
      w.document.close();
      w.focus();
      setTimeout(() => { try { w.print(); } catch (e) {} }, 300);
    }
  }

  nav.addEventListener('click', (e) => { e.preventDefault(); render(); });
  if (location.hash === '#history') render();
});