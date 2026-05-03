document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav-sales');
  const container = document.getElementById('role-dashboard');
  if (!nav || !container) return;

  // ── Sample data ────────────────────────────────────────────────────────────

  const sales = [
    { id: 'R-1001', time: '2026-05-03T08:24:00Z', cashierRole: 'staff',      cashierName: 'John Reyes', items: [{ sku:'P002', name:'Amoxicillin 250mg',  qty:2, price:75  },{ sku:'P005', name:'Vitamin C 500mg', qty:1, price:60 }], total:210, payment:'Cash',  status:'Completed', ip:'192.168.1.22' },
    { id: 'R-1002', time: '2026-05-02T13:15:00Z', cashierRole: 'pharmacist',  cashierName: 'Dr. Emeka',  items: [{ sku:'P003', name:'Paracetamol 500mg',  qty:3, price:35  }],                                                         total:105, payment:'Card',  status:'Completed', ip:'192.168.1.15' },
    { id: 'R-1003', time: '2026-05-01T09:45:00Z', cashierRole: 'staff',      cashierName: 'Mona Cruz',  items: [{ sku:'P005', name:'Vitamin C 500mg',     qty:1, price:120 }],                                                         total:120, payment:'Cash',  status:'Completed', ip:'192.168.1.18' },
    { id: 'R-1004', time: '2026-04-30T11:00:00Z', cashierRole: 'staff',      cashierName: 'John Reyes', items: [{ sku:'P004', name:'Insulin 10ml',         qty:1, price:850 }],                                                         total:850, payment:'GCash', status:'Completed', ip:'192.168.1.22' },
    { id: 'R-1005', time: '2026-04-29T14:20:00Z', cashierRole: 'pharmacist',  cashierName: 'Dr. Emeka',  items: [{ sku:'P006', name:'Metformin 500mg',      qty:2, price:45  }],                                                         total: 90, payment:'Cash',  status:'Refunded',  ip:'192.168.1.15' },
    { id: 'R-1006', time: '2026-04-28T10:10:00Z', cashierRole: 'staff',      cashierName: 'Alice Tan',  items: [{ sku:'P001', name:'Cough Syrup 100ml',    qty:2, price:85  }],                                                         total:170, payment:'Card',  status:'Completed', ip:'192.168.1.30' },
    { id: 'R-1007', time: '2026-04-27T09:05:00Z', cashierRole: 'staff',      cashierName: 'Mona Cruz',  items: [{ sku:'P003', name:'Paracetamol 500mg',    qty:4, price:35  }],                                                         total:140, payment:'GCash', status:'Completed', ip:'192.168.1.18' },
    { id: 'R-1008', time: '2026-04-26T15:30:00Z', cashierRole: 'pharmacist',  cashierName: 'Dr. Emeka',  items: [{ sku:'P002', name:'Amoxicillin 250mg',    qty:1, price:120 }],                                                         total:120, payment:'Cash',  status:'Void',      ip:'192.168.1.15' },
  ];

  // ── State ──────────────────────────────────────────────────────────────────

  let sortField = 'time';
  let sortDir   = 'desc';
  let currentPage = 1;
  const PAGE_SIZE = 5;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function getRole() {
    const b = document.getElementById('current-role');
    const userName = document.getElementById('user-name')?.textContent?.trim() || '';
    if (!b) return { role: 'staff', userName };
    const t = b.textContent || '';
    if (/admin/i.test(t)) return { role: 'admin', userName };
    return { role: 'staff', userName };
  }

  function setActiveNav(el) {
    document.querySelectorAll('#sidebar nav a').forEach(a => a.classList.remove('bg-[#e53935]', 'text-white'));
    if (el) el.classList.add('bg-[#e53935]', 'text-white');
  }

  function fmt(n) {
    return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(iso) {
    try { return new Date(iso).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch (e) { return iso; }
  }

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  const methodIcon = { Cash: '💵', GCash: '📱', Card: '💳' };
  const methodColor = {
    Cash:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    GCash: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    Card:  'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  };
  const statusColor = {
    Completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    Refunded:  'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    Void:      'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  };
  const statusIcon = { Completed: '✅', Refunded: '↩️', Void: '❌' };

  function paymentBadge(p) {
    return `<span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg ${methodColor[p] || 'bg-gray-100 text-gray-500'}">${methodIcon[p] || ''} ${p}</span>`;
  }
  function statusBadge(s) {
    return `<span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg ${statusColor[s] || 'bg-gray-100 text-gray-500'}">${statusIcon[s] || ''} ${s}</span>`;
  }

  const roleColor = {
    admin:      'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    pharmacist: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    staff:      'bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-400',
  };

  // ── Filter & sort ──────────────────────────────────────────────────────────

  function getFiltered() {
    const q      = (document.getElementById('as-search')?.value || '').toLowerCase();
    const staff  = document.getElementById('as-filter-staff')?.value  || 'all';
    const pay    = document.getElementById('as-filter-pay')?.value    || 'all';
    const status = document.getElementById('as-filter-status')?.value || 'all';
    const from   = document.getElementById('as-date-from')?.value || '';
    const to     = document.getElementById('as-date-to')?.value   || '';
    const minV   = Number(document.getElementById('as-min')?.value || 0);
    const maxV   = document.getElementById('as-max')?.value; const maxN = maxV ? Number(maxV) : Infinity;

    let list = sales.filter(s => {
      if (staff  !== 'all' && s.cashierName !== staff)  return false;
      if (pay    !== 'all' && s.payment     !== pay)    return false;
      if (status !== 'all' && s.status      !== status) return false;
      if (q && !`${s.id} ${s.cashierName} ${s.ip} ${s.payment} ${s.items.map(i=>i.name).join(' ')}`.toLowerCase().includes(q)) return false;
      if (from) { if (new Date(s.time) < new Date(from + 'T00:00:00')) return false; }
      if (to)   { if (new Date(s.time) > new Date(to   + 'T23:59:59')) return false; }
      if (s.total < minV) return false;
      if (s.total > maxN) return false;
      return true;
    });

    list.sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

    return list;
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  function buildStats(list) {
    const completed = list.filter(s => s.status === 'Completed');
    const refunded  = list.filter(s => s.status === 'Refunded');
    const total     = completed.reduce((s, r) => s + r.total, 0);
    const tx        = completed.length;
    const avg       = tx ? Math.round(total / tx) : 0;

    // Payment breakdown
    const byPay = {};
    completed.forEach(s => { byPay[s.payment] = (byPay[s.payment] || 0) + s.total; });

    const stat = (label, val, sub, color, icon) => `
      <div class="bg-white dark:bg-[#161616] rounded-2xl p-4 border border-gray-100 dark:border-white/[0.05] shadow-sm flex items-start justify-between">
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">${label}</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">${val}</p>
          <p class="text-[11px] text-gray-400 mt-1">${sub}</p>
        </div>
        <div class="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style="background:${color}18">${icon}</div>
      </div>`;

    return `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        ${stat('Total Revenue',   fmt(total),       `${tx} completed transactions`,                   '#10b981', '💰')}
        ${stat('Transactions',    tx,               `${refunded.length} refunded · ${list.filter(s=>s.status==='Void').length} void`, '#3b82f6', '🧾')}
        ${stat('Avg Order Value', fmt(avg),         `Across ${tx} orders`,                             '#e53935', '📊')}
        ${stat('Cash Revenue',    fmt(byPay['Cash']||0), `GCash ${fmt(byPay['GCash']||0)} · Card ${fmt(byPay['Card']||0)}`, '#f59e0b', '💵')}
      </div>`;
  }

  // ── Inline mini chart (revenue trend) ─────────────────────────────────────

  function buildMiniTrend(list) {
    const byDay = {};
    list.filter(s => s.status === 'Completed').forEach(s => {
      const d = s.time.slice(0, 10);
      byDay[d] = (byDay[d] || 0) + s.total;
    });
    const days = Object.keys(byDay).sort();
    if (days.length < 2) return '';

    const W = 300, H = 44, pad = 4;
    const max = Math.max(...Object.values(byDay), 1);
    const step = (W - 2 * pad) / (days.length - 1);
    const pts = days.map((d, i) => `${pad + i * step},${H - pad - (byDay[d] / max) * (H - 2 * pad)}`);
    const line = `M ${pts.join(' L ')}`;
    const area = `${line} L ${W - pad},${H - pad} L ${pad},${H - pad} Z`;

    return `
      <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm px-5 py-4 mb-4 flex items-center gap-6">
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Revenue Trend</p>
          <p class="text-xs text-gray-500">Last ${days.length} active days</p>
        </div>
        <div class="flex-1 overflow-hidden">
          <svg width="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
            <defs><linearGradient id="sg1" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#e53935" stop-opacity="0.15"/>
              <stop offset="100%" stop-color="#e53935" stop-opacity="0"/>
            </linearGradient></defs>
            <path d="${area}" fill="url(#sg1)"/>
            <path d="${line}" fill="none" stroke="#e53935" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="text-right flex-shrink-0">
          <p class="text-xs font-bold text-gray-700 dark:text-gray-200">${fmt(Math.max(...Object.values(byDay)))}</p>
          <p class="text-[10px] text-gray-400">Peak day</p>
        </div>
      </div>`;
  }

  // ── Table ──────────────────────────────────────────────────────────────────

  function sortIndicator(field) {
    if (sortField !== field) return `<span class="ml-1 text-gray-300 dark:text-gray-600">↕</span>`;
    return sortDir === 'asc'
      ? `<span class="ml-1 text-[#e53935]">↑</span>`
      : `<span class="ml-1 text-[#e53935]">↓</span>`;
  }

  function buildTable(list) {
    const total    = list.length;
    const start    = (currentPage - 1) * PAGE_SIZE;
    const pageData = list.slice(start, start + PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    if (list.length === 0) return `
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-2xl mb-3">🔍</div>
        <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">No sales records found</p>
        <p class="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
      </div>`;

    const thCls = 'py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 cursor-pointer select-none hover:text-gray-600 dark:hover:text-gray-300 transition-colors';

    const rows = pageData.map(r => `
      <tr class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
        <td class="py-3 px-4">
          <div class="font-mono text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/[0.06] px-2 py-1 rounded-lg inline-block">${r.id}</div>
        </td>
        <td class="py-3 px-4">
          <div class="text-xs font-medium text-gray-700 dark:text-gray-200">${new Date(r.time).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div class="text-[10px] text-gray-400 mt-0.5">${new Date(r.time).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</div>
        </td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-[#e53935]/10 text-[#e53935] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              ${r.cashierName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
            </div>
            <div>
              <div class="text-xs font-semibold text-gray-700 dark:text-gray-200">${r.cashierName}</div>
              <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${roleColor[r.cashierRole] || 'bg-gray-100 text-gray-500'}">${r.cashierRole}</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 text-xs text-gray-600 dark:text-gray-300 max-w-[140px]">
          <div class="truncate">${r.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</div>
          <div class="text-[10px] text-gray-400 mt-0.5">${r.items.reduce((s,i)=>s+i.qty,0)} item${r.items.reduce((s,i)=>s+i.qty,0)!==1?'s':''}</div>
        </td>
        <td class="py-3 px-4">${paymentBadge(r.payment)}</td>
        <td class="py-3 px-4">${statusBadge(r.status)}</td>
        <td class="py-3 px-4">
          <span class="font-mono text-sm font-bold text-gray-800 dark:text-gray-100 ${r.status === 'Void' ? 'line-through text-gray-400 dark:text-gray-500' : ''}">${fmt(r.total)}</span>
        </td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <button data-id="${r.id}" class="btn-view text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-2 py-1 rounded-lg transition-colors">View</button>
            <button data-id="${r.id}" class="btn-print text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] px-2 py-1 rounded-lg transition-colors">Print</button>
            ${r.status === 'Completed' ? `<button data-id="${r.id}" class="btn-void text-[11px] font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-2 py-1 rounded-lg transition-colors">Void</button>` : ''}
          </div>
        </td>
      </tr>`).join('');

    // Pagination
    const pagination = totalPages > 1 ? `
      <div class="flex items-center justify-between px-5 py-3 border-t border-gray-50 dark:border-white/[0.04]">
        <p class="text-[11px] text-gray-400">Showing ${start + 1}–${Math.min(start + PAGE_SIZE, total)} of ${total}</p>
        <div class="flex items-center gap-1">
          <button id="pg-prev" class="w-7 h-7 rounded-lg border border-gray-200 dark:border-white/[0.1] flex items-center justify-center text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors ${currentPage <= 1 ? 'opacity-40 cursor-not-allowed' : ''}">‹</button>
          ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p =>
            `<button data-pg="${p}" class="pg-btn w-7 h-7 rounded-lg text-xs font-semibold transition-colors
              ${p === currentPage ? 'bg-[#e53935] text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.07]'}">${p}</button>`
          ).join('')}
          <button id="pg-next" class="w-7 h-7 rounded-lg border border-gray-200 dark:border-white/[0.1] flex items-center justify-center text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors ${currentPage >= totalPages ? 'opacity-40 cursor-not-allowed' : ''}">›</button>
        </div>
      </div>` : '';

    return `
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.05]">
              <th class="${thCls}" data-sort="id">Receipt ${sortIndicator('id')}</th>
              <th class="${thCls}" data-sort="time">Date & Time ${sortIndicator('time')}</th>
              <th class="${thCls}" data-sort="cashierName">Cashier ${sortIndicator('cashierName')}</th>
              <th class="${thCls}">Items</th>
              <th class="${thCls}" data-sort="payment">Payment ${sortIndicator('payment')}</th>
              <th class="${thCls}" data-sort="status">Status ${sortIndicator('status')}</th>
              <th class="${thCls}" data-sort="total">Amount ${sortIndicator('total')}</th>
              <th class="${thCls}">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-white/[0.04]">
            ${rows}
          </tbody>
        </table>
      </div>
      ${pagination}`;
  }

  // ── Receipt modal ──────────────────────────────────────────────────────────

  function openReceiptModal(r) {
    const modal = document.getElementById('as-modal');
    const panel = document.getElementById('as-modal-panel');
    const body  = document.getElementById('as-modal-body');
    if (!modal || !body) return;

    const itemTotal = r.items.reduce((s, i) => s + i.price * i.qty, 0);

    body.innerHTML = `
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-[#e53935]/10 flex items-center justify-center text-sm">🧾</div>
          <div>
            <h4 class="text-sm font-bold text-gray-800 dark:text-white">Receipt Details</h4>
            <p class="text-[10px] text-gray-400 mt-0.5 font-mono">${r.id}</p>
          </div>
        </div>
        <button id="as-modal-close" class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors text-sm">✕</button>
      </div>
      <div class="p-5">
        <!-- Meta grid -->
        <div class="grid grid-cols-2 gap-2.5 mb-4">
          <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3">
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Date & Time</p>
            <p class="text-xs font-semibold text-gray-700 dark:text-gray-200">${formatDate(r.time)}</p>
          </div>
          <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3">
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Cashier</p>
            <p class="text-xs font-semibold text-gray-700 dark:text-gray-200">${r.cashierName}</p>
            <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${roleColor[r.cashierRole] || ''}">${r.cashierRole}</span>
          </div>
          <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3">
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Payment</p>
            <p class="mt-0.5">${paymentBadge(r.payment)}</p>
          </div>
          <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3">
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</p>
            <p class="mt-0.5">${statusBadge(r.status)}</p>
          </div>
          <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3 col-span-2">
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Terminal IP</p>
            <p class="text-xs font-mono text-gray-600 dark:text-gray-300">${r.ip}</p>
          </div>
        </div>

        <!-- Items table -->
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Items Purchased</p>
        <div class="rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden mb-4">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-white/[0.03]">
              <tr>
                ${['Product','Qty','Unit Price','Subtotal'].map(h =>
                  `<th class="py-2 px-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">${h}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-white/[0.04]">
              ${r.items.map(i => `
                <tr>
                  <td class="py-2.5 px-3 text-xs font-medium text-gray-700 dark:text-gray-200">${i.name}</td>
                  <td class="py-2.5 px-3 text-xs text-center text-gray-500 dark:text-gray-400">${i.qty}</td>
                  <td class="py-2.5 px-3 text-xs font-mono text-gray-600 dark:text-gray-300">${fmt(i.price)}</td>
                  <td class="py-2.5 px-3 text-xs font-mono font-bold text-gray-700 dark:text-gray-200">${fmt(i.price * i.qty)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>

        <!-- Total -->
        <div class="flex items-center justify-between bg-[#e53935]/5 dark:bg-[#e53935]/10 rounded-xl px-4 py-3 mb-4">
          <span class="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Amount</span>
          <span class="font-mono text-xl font-bold text-[#e53935]">${fmt(r.total)}</span>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button id="as-print-btn"
            class="flex-1 bg-[#e53935] hover:bg-[#c62828] text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20 flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Print Receipt
          </button>
          <button id="as-modal-close2"
            class="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.1] text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
            Close
          </button>
        </div>
      </div>`;

    modal.classList.remove('pointer-events-none');
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      if (panel) panel.style.transform = 'scale(1)';
    });

    document.getElementById('as-modal-close')?.addEventListener('click',  closeModal);
    document.getElementById('as-modal-close2')?.addEventListener('click', closeModal);
    document.getElementById('as-modal-overlay')?.addEventListener('click', closeModal);
    document.getElementById('as-print-btn')?.addEventListener('click', () => printReceipt(r));
  }

  function closeModal() {
    const modal = document.getElementById('as-modal');
    const panel = document.getElementById('as-modal-panel');
    if (!modal) return;
    modal.style.opacity = '0';
    if (panel) panel.style.transform = 'scale(0.95)';
    setTimeout(() => modal.classList.add('pointer-events-none'), 200);
  }

  function printReceipt(r) {
    const w = window.open('', '_blank', 'noopener,width=520,height=700');
    if (!w) { alert('Popup blocked.'); return; }
    const items = r.items.map(i =>
      `<tr><td>${i.name}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right;font-family:'DM Mono',monospace">${fmt(i.price)}</td><td style="text-align:right;font-family:'DM Mono',monospace;font-weight:700">${fmt(i.price * i.qty)}</td></tr>`
    ).join('');
    w.document.write(`<!doctype html><html><head><meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
      <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#f7f7f8;display:flex;align-items:flex-start;justify-content:center;min-height:100vh;padding:32px 16px}.receipt{background:#fff;border-radius:16px;border:1px solid #eee;width:100%;max-width:420px;overflow:hidden}.rh{background:#e53935;padding:22px;text-align:center;color:#fff}.rh h1{font-size:19px;font-weight:700}.rh p{font-size:11px;opacity:.75;margin-top:3px}.rb{padding:20px}.mg{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}.mc{background:#f7f7f8;border-radius:10px;padding:10px}.lbl{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#888;margin-bottom:3px}.val{font-size:13px;font-weight:600;color:#111}table{width:100%;border-collapse:collapse;margin-bottom:14px}th{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#999;padding:7px 0;text-align:left;border-bottom:2px solid #f0f0f0}td{font-size:13px;padding:9px 0;border-bottom:1px solid #f7f7f7;color:#333}.tr-row{background:#fff5f5;border-radius:12px;padding:13px 15px;display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border:1px solid #fde8e8}.tr-row .lbl{font-size:12px;color:#555}.tr-row .val{font-family:'DM Mono',monospace;font-size:22px;font-weight:700;color:#e53935}.foot{text-align:center;font-size:11px;color:#aaa;padding:14px;border-top:1px solid #f5f5f5}.pbtn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;background:#e53935;border:none;color:#fff;padding:13px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer}@media print{body{background:#fff;padding:0}.pbtn{display:none}.receipt{border:none;border-radius:0}}</style>
    </head><body><div class="receipt">
      <div class="rh"><h1>💊 RS Pharmacy</h1><p>Official Sales Receipt</p></div>
      <div class="rb">
        <div class="mg">
          <div class="mc"><div class="lbl">Receipt No.</div><div class="val" style="font-family:'DM Mono',monospace">${r.id}</div></div>
          <div class="mc"><div class="lbl">Date</div><div class="val">${new Date(r.time).toLocaleDateString('en-PH')}</div></div>
          <div class="mc"><div class="lbl">Cashier</div><div class="val">${r.cashierName}</div></div>
          <div class="mc"><div class="lbl">Terminal</div><div class="val" style="font-family:'DM Mono',monospace">${r.ip}</div></div>
        </div>
        <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Amount</th></tr></thead><tbody>${items}</tbody></table>
        <div class="tr-row"><span class="lbl">Total Amount</span><span class="val">${fmt(r.total)}</span></div>
        <div style="margin-bottom:16px;font-size:12px;color:#666">Payment: <strong>${r.payment}</strong> &nbsp;·&nbsp; Status: <strong>${r.status}</strong></div>
      </div>
      <div class="foot">Thank you for choosing RS Pharmacy.<br>Keep this receipt for your records.</div>
      <button class="pbtn" onclick="window.print()">🖨️ Print Receipt</button>
    </div></body></html>`);
    w.document.close(); w.focus();
    setTimeout(() => { try { w.print(); } catch (e) {} }, 300);
  }

  // ── Export CSV ─────────────────────────────────────────────────────────────

  function exportCSV() {
    const list = getFiltered();
    const csv = [
      ['Receipt', 'Date', 'Time', 'Cashier', 'Role', 'Items', 'Payment', 'Status', 'Total', 'IP'],
      ...list.map(s => [
        s.id,
        new Date(s.time).toLocaleDateString('en-PH'),
        new Date(s.time).toLocaleTimeString('en-PH'),
        s.cashierName, s.cashierRole,
        s.items.map(i => `${i.name} x${i.qty}`).join('; '),
        s.payment, s.status, s.total, s.ip
      ])
    ].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `sales_${todayISO()}.csv`;
    a.click();
  }

  // ── Main render ────────────────────────────────────────────────────────────

  function render() {
    setActiveNav(nav);

    if (getRole().role !== 'admin') {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <div class="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-3xl">🔒</div>
          <p class="text-sm font-bold text-gray-600 dark:text-gray-300">Access Restricted</p>
          <p class="text-xs text-gray-400">Sales records are visible to admins only.</p>
        </div>`;
      return;
    }

    const staffOptions = Array.from(new Set(sales.map(s => s.cashierName)))
      .map(n => `<option value="${n}">${n}</option>`).join('');

    const filtered = getFiltered();

    container.innerHTML = `
      <!-- Header -->
      <div class="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 class="text-base font-bold text-gray-800 dark:text-white tracking-tight">🧾 Sales Transactions</h2>
          <p class="text-xs text-gray-400 mt-0.5">All recorded sales · admin view</p>
        </div>
        <button id="as-export"
          class="bg-[#e53935] hover:bg-[#c62828] text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20 flex items-center gap-1.5">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export CSV
        </button>
      </div>

      <!-- Stats -->
      ${buildStats(filtered)}

      <!-- Mini trend -->
      ${buildMiniTrend(filtered)}

      <!-- Filter bar -->
      <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm px-5 py-4 mb-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Search -->
          <div class="flex items-center gap-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-xl px-3 py-2.5 sm:col-span-2 lg:col-span-1">
            <svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input id="as-search" placeholder="Receipt, cashier, product…"
              class="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 w-full" />
          </div>

          <!-- Staff -->
          <select id="as-filter-staff"
            class="border border-gray-200 dark:border-white/[0.07] rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow">
            <option value="all">All Cashiers</option>${staffOptions}
          </select>

          <!-- Payment -->
          <select id="as-filter-pay"
            class="border border-gray-200 dark:border-white/[0.07] rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow">
            <option value="all">All Payments</option>
            <option value="Cash">💵 Cash</option>
            <option value="GCash">📱 GCash</option>
            <option value="Card">💳 Card</option>
          </select>

          <!-- Status -->
          <select id="as-filter-status"
            class="border border-gray-200 dark:border-white/[0.07] rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow">
            <option value="all">All Statuses</option>
            <option value="Completed">✅ Completed</option>
            <option value="Refunded">↩️ Refunded</option>
            <option value="Void">❌ Void</option>
          </select>

          <!-- Date from -->
          <div class="flex items-center gap-2">
            <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex-shrink-0">From</label>
            <input id="as-date-from" type="date"
              class="flex-1 border border-gray-200 dark:border-white/[0.07] rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow" />
          </div>

          <!-- Date to -->
          <div class="flex items-center gap-2">
            <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex-shrink-0">To</label>
            <input id="as-date-to" type="date"
              class="flex-1 border border-gray-200 dark:border-white/[0.07] rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow" />
          </div>

          <!-- Min -->
          <input id="as-min" type="number" placeholder="Min ₱"
            class="border border-gray-200 dark:border-white/[0.07] rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow" />

          <!-- Max -->
          <input id="as-max" type="number" placeholder="Max ₱"
            class="border border-gray-200 dark:border-white/[0.07] rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow" />
        </div>

        <!-- Active filter summary -->
        <div id="filter-summary" class="mt-3 flex items-center gap-2 flex-wrap"></div>
      </div>

      <!-- Table card -->
      <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 dark:border-white/[0.04]">
          <p class="text-[11px] font-semibold text-gray-400">${filtered.length} record${filtered.length !== 1 ? 's' : ''} found</p>
          <p class="text-[10px] text-gray-400">Click column headers to sort</p>
        </div>
        <div id="as-table-body">${buildTable(filtered)}</div>
      </div>

      <!-- Modal -->
      <div id="as-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none opacity-0 transition-opacity duration-200">
        <div id="as-modal-overlay" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div id="as-modal-panel"
          class="relative w-full max-w-lg pointer-events-auto bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07] scale-95 transition-transform duration-200">
          <div id="as-modal-body"></div>
        </div>
      </div>
    `;

    wire();
  }

  // ── Wire ───────────────────────────────────────────────────────────────────

  function wire() {
    const filterIds = ['as-search', 'as-filter-staff', 'as-filter-pay', 'as-filter-status', 'as-date-from', 'as-date-to', 'as-min', 'as-max'];
    filterIds.forEach(id => {
      const el = document.getElementById(id);
      el?.addEventListener(id === 'as-search' || id.includes('min') || id.includes('max') ? 'input' : 'change', () => {
        currentPage = 1;
        updateTable();
      });
    });

    document.getElementById('as-export')?.addEventListener('click', exportCSV);
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeModal(); });

    // Sort headers
    container.querySelectorAll('th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.getAttribute('data-sort');
        if (sortField === field) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        else { sortField = field; sortDir = 'desc'; }
        updateTable();
      });
    });

    wireTableActions();
  }

  function updateTable() {
    const filtered = getFiltered();

    // Update stats
    const statsEl = container.querySelector('.grid.grid-cols-2.lg\\:grid-cols-4');
    if (statsEl) statsEl.outerHTML = buildStats(filtered).trim().replace(/^<div[^>]*>/, '').replace(/<\/div>$/, '');

    // Update record count
    const countEl = container.querySelector('#as-table-body')?.previousElementSibling?.querySelector('p');
    if (countEl) countEl.textContent = `${filtered.length} record${filtered.length !== 1 ? 's' : ''} found`;

    // Update table
    const tableBody = document.getElementById('as-table-body');
    if (tableBody) tableBody.innerHTML = buildTable(filtered);

    // Re-sort headers
    container.querySelectorAll('th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.getAttribute('data-sort');
        if (sortField === field) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        else { sortField = field; sortDir = 'desc'; }
        updateTable();
      });
    });

    wireTableActions();
  }

  function wireTableActions() {
    // View
    container.querySelectorAll('.btn-view').forEach(b => b.addEventListener('click', () => {
      const r = sales.find(x => x.id === b.getAttribute('data-id'));
      if (r) openReceiptModal(r);
    }));

    // Print
    container.querySelectorAll('.btn-print').forEach(b => b.addEventListener('click', () => {
      const r = sales.find(x => x.id === b.getAttribute('data-id'));
      if (r) printReceipt(r);
    }));

    // Void
    container.querySelectorAll('.btn-void').forEach(b => b.addEventListener('click', () => {
      const id = b.getAttribute('data-id');
      const r  = sales.find(x => x.id === id);
      if (!r) return;
      if (!confirm(`Void receipt ${id}? This cannot be undone.`)) return;
      r.status = 'Void';
      updateTable();
    }));

    // Pagination
    container.querySelectorAll('.pg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = Number(btn.getAttribute('data-pg'));
        updateTable();
      });
    });
    document.getElementById('pg-prev')?.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; updateTable(); }
    });
    document.getElementById('pg-next')?.addEventListener('click', () => {
      const total = getFiltered().length;
      if (currentPage < Math.ceil(total / PAGE_SIZE)) { currentPage++; updateTable(); }
    });
  }

  // ── Nav ────────────────────────────────────────────────────────────────────
  nav.addEventListener('click', e => { e.preventDefault(); render(); });
  if (location.hash === '#sales' || location.hash === '#analytics-sales') render();
});