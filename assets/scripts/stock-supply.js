document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav-supply');
  const container = document.getElementById('role-dashboard');
  if (!nav || !container) return;

  /* ═══════════════════════════════════════
     DATA
  ═══════════════════════════════════════ */
  const suppliers = [
    { id: 'S1', name: 'MediCorp Distributors',  contact: 'Jose Reyes',   phone: '+63 2 8111 2222', email: 'orders@medicorp.ph',    address: '12 Industrial Ave, Caloocan City', terms: 'Net 30', rating: 5, category: 'General Pharma'  },
    { id: 'S2', name: 'Healthline Supply',       contact: 'Maria Tan',    phone: '+63 2 8333 4444', email: 'supply@healthline.ph',  address: '88 Logistics Rd, Valenzuela City', terms: 'Net 15', rating: 4, category: 'OTC & Wellness'   },
    { id: 'S3', name: 'Pharma Global',           contact: 'Carlos Vega',  phone: '+63 2 8555 6666', email: 'admin@pharmaglobal.ph', address: '55 Export Blvd, Pasay City',       terms: 'COD',    rating: 4, category: 'Branded Rx Drugs' }
  ];

  const supplies = [
    {
      id: 'TX-1001', supplierId: 'S1', frequency: 'monthly',
      date: '2026-04-20', deliveryDate: '2026-04-22', invoiceNo: 'INV-8821',
      items: [
        { sku: 'P001', name: 'Paracetamol 500mg', qty: 100, unitCost: 30, expectedSalePerUnit: 45 },
        { sku: 'P005', name: 'Vitamin C 500mg',   qty: 60,  unitCost: 18, expectedSalePerUnit: 28 }
      ],
      agent: 'Agent A', receivedBy: 'Alice', paymentMode: 'bank', status: 'Received',
      notes: 'On-time delivery. Items in good condition.',
      history: [
        { time: '2026-04-18T09:00:00Z', change: 'Order placed' },
        { time: '2026-04-22T14:00:00Z', change: 'Received by Alice — items verified' }
      ]
    },
    {
      id: 'TX-1002', supplierId: 'S2', frequency: 'weekly',
      date: '2026-04-28', deliveryDate: '', invoiceNo: 'INV-9035',
      items: [
        { sku: 'P003', name: 'Cough Syrup 100ml', qty: 50, unitCost: 70, expectedSalePerUnit: 95 }
      ],
      agent: 'Agent B', receivedBy: '', paymentMode: 'cash', status: 'Ordered',
      notes: '',
      history: [
        { time: '2026-04-28T08:00:00Z', change: 'Order placed by Bob' }
      ]
    },
    {
      id: 'TX-1003', supplierId: 'S3', frequency: 'monthly',
      date: '2026-05-01', deliveryDate: '', invoiceNo: 'INV-9101',
      items: [
        { sku: 'P002', name: 'Amoxicillin 250mg', qty: 80, unitCost: 85, expectedSalePerUnit: 120 },
        { sku: 'P004', name: 'Metformin 500mg',   qty: 40, unitCost: 22, expectedSalePerUnit: 35  }
      ],
      agent: 'Agent C', receivedBy: '', paymentMode: 'credit', status: 'In Transit',
      notes: 'Partial shipment expected — Metformin may arrive separately.',
      history: [
        { time: '2026-05-01T10:00:00Z', change: 'Order confirmed by supplier' },
        { time: '2026-05-02T07:30:00Z', change: 'Dispatched from Pharma Global warehouse' }
      ]
    },
    {
      id: 'TX-1004', supplierId: 'S1', frequency: 'weekly',
      date: '2026-03-15', deliveryDate: '2026-03-17', invoiceNo: 'INV-8644',
      items: [
        { sku: 'P006', name: 'Ibuprofen 200mg', qty: 200, unitCost: 20, expectedSalePerUnit: 32 }
      ],
      agent: 'Agent A', receivedBy: 'Clara', paymentMode: 'bank', status: 'Cancelled',
      notes: 'Supplier out of stock. Order voided.',
      history: [
        { time: '2026-03-15T11:00:00Z', change: 'Order placed' },
        { time: '2026-03-16T09:00:00Z', change: 'Cancelled — supplier stockout' }
      ]
    }
  ];

  /* ═══════════════════════════════════════
     HELPERS
  ═══════════════════════════════════════ */
  function getRole() {
    const b = document.getElementById('current-role');
    const userName = document.getElementById('user-name')?.textContent?.trim() || '';
    if (!b) return { role: 'staff', userName };
    const t = b.textContent || '';
    if (/admin/i.test(t)) return { role: 'admin', userName };
    return { role: 'staff', userName };
  }

  function setActiveNav(target) {
    if (window.setActiveSidebar) return window.setActiveSidebar(target);
    document.querySelectorAll('#sidebar nav a').forEach(a => a.classList.remove('active-nav'));
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (el) el.classList.add('active-nav');
  }

  function fmt(n) {
    return '₱' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fmtDate(s) {
    if (!s) return '—';
    try { return new Date(s).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return s; }
  }

  function fmtDateShort(s) {
    if (!s) return '—';
    try { return new Date(s).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return s; }
  }

  function timeAgo(s) {
    if (!s) return '';
    const diff = (Date.now() - new Date(s)) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function computeTotals(tx) {
    const totalCost = tx.items.reduce((s, i) => s + i.qty * i.unitCost, 0);
    const potentialRevenue = tx.items.reduce((s, i) => s + i.qty * (i.expectedSalePerUnit || i.unitCost * 1.5), 0);
    return { totalCost, potentialRevenue, possibleProfit: potentialRevenue - totalCost };
  }

  const STATUS_META = {
    'Received':   { cls: 'ss-status-received',   dot: 'ss-dot-green',  label: 'Received'   },
    'Ordered':    { cls: 'ss-status-ordered',     dot: 'ss-dot-blue',   label: 'Ordered'    },
    'In Transit': { cls: 'ss-status-transit',     dot: 'ss-dot-amber',  label: 'In Transit' },
    'Cancelled':  { cls: 'ss-status-cancelled',   dot: 'ss-dot-gray',   label: 'Cancelled'  }
  };

  const FREQ_ICON = { weekly: '🔄', monthly: '📅', yearly: '📆' };
  const PAY_ICON  = { cash: '💵', bank: '🏦', credit: '💳' };

  /* ═══════════════════════════════════════
     INJECT STYLES (once)
  ═══════════════════════════════════════ */
  if (!document.getElementById('ss-styles')) {
    const style = document.createElement('style');
    style.id = 'ss-styles';
    style.textContent = `
      #role-dashboard {
        --ss-red:      #e53935;
        --ss-red-dim:  #b71c1c;
        --ss-red-soft: rgba(229,57,53,.1);
        --ss-surface:  #ffffff;
        --ss-surface2: #f8f9fb;
        --ss-border:   #e8eaed;
        --ss-text:     #111827;
        --ss-muted:    #6b7280;
        --ss-radius:   14px;
        --ss-shadow:   0 2px 16px rgba(0,0,0,.07);
      }
      html.dark #role-dashboard {
        --ss-surface:  #161618;
        --ss-surface2: #1d1d20;
        --ss-border:   #2a2a32;
        --ss-text:     #f0f0f4;
        --ss-muted:    #9ca3af;
        --ss-shadow:   0 2px 16px rgba(0,0,0,.35);
      }

      #ss-wrap { display:flex; flex-direction:column; gap:22px; }

      /* header */
      #ss-wrap .ss-page-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; }
      #ss-wrap .ss-page-title  { font-size:19px; font-weight:800; color:var(--ss-text); display:flex; align-items:center; gap:10px; }
      #ss-wrap .ss-page-sub    { font-size:12px; color:var(--ss-muted); margin-top:3px; }
      #ss-wrap .ss-header-actions { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }

      /* stats */
      #ss-wrap .ss-stats { display:flex; gap:14px; flex-wrap:wrap; }
      #ss-wrap .ss-stat  { background:var(--ss-surface); border:1px solid var(--ss-border); border-radius:var(--ss-radius); padding:16px 20px; display:flex; align-items:center; gap:14px; flex:1; min-width:130px; box-shadow:var(--ss-shadow); }
      #ss-wrap .ss-stat-icon { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:19px; flex-shrink:0; }
      #ss-wrap .ss-si-blue   { background:#eff6ff; }
      #ss-wrap .ss-si-green  { background:#f0fdf4; }
      #ss-wrap .ss-si-amber  { background:#fffbeb; }
      #ss-wrap .ss-si-red    { background:#fef2f2; }
      #ss-wrap .ss-si-indigo { background:#eef2ff; }
      #ss-wrap .ss-si-purple { background:#f5f3ff; }
      #ss-wrap .ss-stat-label { font-size:11px; color:var(--ss-muted); text-transform:uppercase; letter-spacing:.5px; font-weight:600; }
      #ss-wrap .ss-stat-value { font-size:24px; font-weight:800; color:var(--ss-text); line-height:1; }

      /* layout grid */
      #ss-wrap .ss-grid { display:grid; grid-template-columns:1fr 320px; gap:20px; align-items:start; }
      @media(max-width:900px) { #ss-wrap .ss-grid { grid-template-columns:1fr; } }

      /* panel */
      #ss-wrap .ss-panel { background:var(--ss-surface); border:1px solid var(--ss-border); border-radius:var(--ss-radius); overflow:hidden; box-shadow:var(--ss-shadow); }
      #ss-wrap .ss-panel-header { padding:14px 18px; border-bottom:1px solid var(--ss-border); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; background:var(--ss-surface2); }
      #ss-wrap .ss-panel-title  { font-size:13px; font-weight:700; color:var(--ss-text); }

      /* toolbar */
      #ss-wrap .ss-toolbar { display:flex; gap:10px; flex-wrap:wrap; padding:14px 18px; border-bottom:1px solid var(--ss-border); }
      #ss-wrap .ss-search-wrap   { position:relative; flex:1; min-width:180px; }
      #ss-wrap .ss-search-icon   { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--ss-muted); font-size:13px; pointer-events:none; }
      #ss-wrap .ss-search        { width:100%; border:1px solid var(--ss-border); border-radius:9px; padding:9px 14px 9px 36px; font-size:13px; background:var(--ss-surface2); color:var(--ss-text); outline:none; transition:border .15s; font-family:inherit; }
      #ss-wrap .ss-search:focus  { border-color:var(--ss-red); }
      #ss-wrap .ss-filter-select { border:1px solid var(--ss-border); border-radius:9px; padding:9px 14px; font-size:13px; background:var(--ss-surface2); color:var(--ss-text); outline:none; cursor:pointer; font-family:inherit; }
      #ss-wrap .ss-filter-select:focus { border-color:var(--ss-red); }
      #ss-wrap .ss-results-count { font-size:12px; color:var(--ss-muted); margin-left:auto; align-self:center; white-space:nowrap; }

      /* transaction cards */
      #ss-wrap .ss-card { border-bottom:1px solid var(--ss-border); padding:16px 20px; display:flex; align-items:flex-start; gap:16px; transition:background .12s; }
      #ss-wrap .ss-card:last-child { border-bottom:none; }
      #ss-wrap .ss-card:hover { background:var(--ss-surface2); }
      #ss-wrap .ss-card-left { flex:1; min-width:0; display:flex; flex-direction:column; gap:8px; }
      #ss-wrap .ss-card-top  { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
      #ss-wrap .ss-card-id   { font-size:14px; font-weight:800; color:var(--ss-text); }
      #ss-wrap .ss-card-supplier { font-size:13px; font-weight:600; color:var(--ss-text); }
      #ss-wrap .ss-card-meta { display:flex; gap:12px; flex-wrap:wrap; }
      #ss-wrap .ss-meta-item { font-size:12px; color:var(--ss-muted); display:flex; align-items:center; gap:5px; }
      #ss-wrap .ss-item-chips { display:flex; gap:8px; flex-wrap:wrap; }
      #ss-wrap .ss-item-chip  { background:var(--ss-surface2); border:1px solid var(--ss-border); border-radius:8px; padding:4px 10px; font-size:12px; font-weight:500; }
      #ss-wrap .ss-card-note  { font-size:12px; color:var(--ss-muted); font-style:italic; padding:5px 10px; background:var(--ss-surface2); border-left:3px solid var(--ss-border); border-radius:0 8px 8px 0; }
      #ss-wrap .ss-card-right { display:flex; flex-direction:column; gap:6px; align-items:flex-end; flex-shrink:0; }
      #ss-wrap .ss-card-total { font-size:15px; font-weight:800; color:var(--ss-red); }

      /* badges */
      #ss-wrap .ss-status-badge { font-size:11px; font-weight:700; border-radius:20px; padding:3px 10px; display:inline-flex; align-items:center; gap:5px; }
      #ss-wrap .ss-status-received  { background:#d1fae5; color:#065f46; }
      #ss-wrap .ss-status-ordered   { background:#dbeafe; color:#1e40af; }
      #ss-wrap .ss-status-transit   { background:#fef3c7; color:#92400e; }
      #ss-wrap .ss-status-cancelled { background:#f3f4f6; color:#6b7280; }
      #ss-wrap .ss-status-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
      #ss-wrap .ss-dot-green { background:#22c55e; }
      #ss-wrap .ss-dot-blue  { background:#3b82f6; }
      #ss-wrap .ss-dot-amber { background:#f59e0b; }
      #ss-wrap .ss-dot-gray  { background:#9ca3af; }
      #ss-wrap .ss-freq-badge { font-size:11px; font-weight:600; background:var(--ss-surface2); border:1px solid var(--ss-border); color:var(--ss-muted); border-radius:20px; padding:3px 10px; }
      #ss-wrap .ss-pay-badge  { font-size:11px; font-weight:600; background:var(--ss-surface2); border:1px solid var(--ss-border); color:var(--ss-muted); border-radius:20px; padding:3px 10px; }

      /* buttons */
      #ss-wrap .ss-btn-primary   { background:var(--ss-red); color:#fff; border:none; border-radius:9px; padding:9px 18px; font-size:13px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:7px; transition:all .15s; font-family:inherit; }
      #ss-wrap .ss-btn-primary:hover { background:var(--ss-red-dim); transform:translateY(-1px); box-shadow:0 4px 14px rgba(229,57,53,.3); }
      #ss-wrap .ss-btn-secondary { background:var(--ss-surface); color:var(--ss-text); border:1px solid var(--ss-border); border-radius:9px; padding:9px 16px; font-size:13px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:7px; transition:all .15s; font-family:inherit; }
      #ss-wrap .ss-btn-secondary:hover { border-color:var(--ss-red); color:var(--ss-red); }
      #ss-wrap .ss-btn-sm   { padding:6px 13px; font-size:12px; border-radius:7px; }
      #ss-wrap .ss-btn-icon { width:30px; height:30px; border-radius:7px; border:1px solid var(--ss-border); background:var(--ss-surface); color:var(--ss-muted); display:inline-flex; align-items:center; justify-content:center; cursor:pointer; font-size:13px; transition:all .15s; }
      #ss-wrap .ss-btn-icon:hover { border-color:var(--ss-red); color:var(--ss-red); }
      #ss-wrap .ss-actions { display:flex; gap:6px; }

      /* supplier cards */
      #ss-wrap .ss-sup-card { padding:14px 16px; border-bottom:1px solid var(--ss-border); transition:background .12s; cursor:pointer; }
      #ss-wrap .ss-sup-card:last-child { border-bottom:none; }
      #ss-wrap .ss-sup-card:hover { background:var(--ss-surface2); }
      #ss-wrap .ss-sup-name { font-size:13.5px; font-weight:700; color:var(--ss-text); }
      #ss-wrap .ss-sup-cat  { font-size:11px; color:var(--ss-muted); margin-top:2px; }
      #ss-wrap .ss-sup-meta { display:flex; gap:8px; margin-top:6px; flex-wrap:wrap; }
      #ss-wrap .ss-stars    { color:#f59e0b; font-size:12px; }

      /* summary side panel */
      #ss-wrap .ss-summary-row { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid var(--ss-border); font-size:13px; }
      #ss-wrap .ss-summary-row:last-child { border-bottom:none; }
      #ss-wrap .ss-summary-label { color:var(--ss-muted); }
      #ss-wrap .ss-summary-value { font-weight:700; color:var(--ss-text); }
      #ss-wrap .ss-profit-bar-track { height:6px; background:var(--ss-border); border-radius:99px; overflow:hidden; margin-top:6px; }
      #ss-wrap .ss-profit-bar-fill  { height:100%; border-radius:99px; background:var(--ss-red); }

      /* empty */
      #ss-wrap .ss-empty { text-align:center; padding:56px 20px; color:var(--ss-muted); }
      #ss-wrap .ss-empty-icon { font-size:38px; margin-bottom:10px; }

      /* ── Modal ── */
      .ss-modal-backdrop { position:fixed; inset:0; z-index:50; background:rgba(0,0,0,.45); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:20px; }
      .ss-modal-panel    { position:relative; background:var(--ss-surface,#fff); border:1px solid var(--ss-border,#e8eaed); border-radius:20px; width:100%; box-shadow:0 24px 64px rgba(0,0,0,.22); max-height:90vh; overflow-y:auto; animation:ssModalIn .2s cubic-bezier(.34,1.56,.64,1); }
      @keyframes ssModalIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
      .ss-modal-panel::-webkit-scrollbar { width:4px; }
      .ss-modal-panel::-webkit-scrollbar-thumb { background:var(--ss-border,#e8eaed); border-radius:4px; }
      .ss-modal-header { padding:22px 24px 0; display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:20px; }
      .ss-modal-title  { font-size:17px; font-weight:800; color:var(--ss-text,#111827); }
      .ss-modal-sub    { font-size:12px; color:var(--ss-muted,#6b7280); margin-top:3px; }
      .ss-modal-close  { width:32px; height:32px; border-radius:8px; border:1px solid var(--ss-border,#e8eaed); background:var(--ss-surface2,#f8f9fb); color:var(--ss-muted,#6b7280); cursor:pointer; font-size:15px; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .15s; }
      .ss-modal-close:hover { border-color:var(--ss-red,#e53935); color:var(--ss-red,#e53935); }
      .ss-modal-body   { padding:0 24px 22px; }
      .ss-modal-footer { padding:16px 24px; border-top:1px solid var(--ss-border,#e8eaed); display:flex; justify-content:flex-end; gap:8px; position:sticky; bottom:0; background:var(--ss-surface,#fff); }

      /* modal internals */
      .ss-modal-hero { background:var(--ss-surface2,#f8f9fb); border:1px solid var(--ss-border,#e8eaed); border-radius:14px; padding:16px 20px; display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:20px; }
      .ss-view-grid  { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
      .ss-view-full  { grid-column:1/-1; }
      .ss-detail-section { display:flex; flex-direction:column; gap:8px; }
      .ss-detail-sec-title { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:var(--ss-muted,#6b7280); padding-bottom:7px; border-bottom:1px solid var(--ss-border,#e8eaed); margin-bottom:2px; }
      .ss-detail-row { display:flex; justify-content:space-between; align-items:flex-start; font-size:13px; gap:12px; padding:3px 0; }
      .ss-detail-row > span:first-child { color:var(--ss-muted,#6b7280); flex-shrink:0; }
      .ss-detail-row > strong { color:var(--ss-text,#111827); text-align:right; word-break:break-word; }

      /* items table */
      .ss-items-table { width:100%; border-collapse:collapse; }
      .ss-items-table thead th { padding:9px 12px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--ss-muted,#6b7280); background:var(--ss-surface2,#f8f9fb); border-bottom:1px solid var(--ss-border,#e8eaed); text-align:left; }
      .ss-items-table thead th:not(:first-child) { text-align:right; }
      .ss-items-table tbody tr { border-bottom:1px solid var(--ss-border,#e8eaed); }
      .ss-items-table tbody tr:last-child { border-bottom:none; }
      .ss-items-table td { padding:10px 12px; font-size:13px; vertical-align:middle; }
      .ss-items-table td:not(:first-child) { text-align:right; }
      .ss-items-table tfoot td { padding:10px 12px; font-size:13px; font-weight:700; background:var(--ss-surface2,#f8f9fb); border-top:2px solid var(--ss-border,#e8eaed); text-align:right; }
      .ss-items-table tfoot td:first-child { text-align:left; }
      .ss-margin-pct { font-size:11px; font-weight:700; border-radius:4px; padding:1px 6px; }
      .ss-margin-good { background:#d1fae5; color:#065f46; }
      .ss-margin-ok   { background:#fef3c7; color:#92400e; }

      /* history */
      .ss-history-item { display:flex; gap:10px; align-items:flex-start; font-size:12.5px; padding:7px 0; border-bottom:1px solid var(--ss-border,#e8eaed); }
      .ss-history-item:last-child { border-bottom:none; }
      .ss-history-dot  { width:7px; height:7px; border-radius:50%; background:var(--ss-red,#e53935); flex-shrink:0; margin-top:4px; }
      .ss-history-time { color:var(--ss-muted,#6b7280); flex-shrink:0; }

      /* form */
      .ss-form-grid  { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
      .ss-form-full  { grid-column:1/-1; }
      .ss-form-group { display:flex; flex-direction:column; gap:5px; }
      .ss-form-label { font-size:12px; font-weight:700; color:var(--ss-muted,#6b7280); }
      .ss-form-input, .ss-form-select, .ss-form-textarea { border:1px solid var(--ss-border,#e8eaed); border-radius:9px; padding:10px 13px; font-size:13px; background:var(--ss-surface2,#f8f9fb); color:var(--ss-text,#111827); outline:none; transition:border .15s; font-family:inherit; width:100%; }
      .ss-form-input:focus, .ss-form-select:focus, .ss-form-textarea:focus { border-color:var(--ss-red,#e53935); background:var(--ss-surface,#fff); }
      .ss-form-textarea { resize:vertical; min-height:68px; }
      .ss-req { color:var(--ss-red,#e53935); }

      /* toast */
      .ss-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%) translateY(10px); background:#111827; color:#fff; padding:12px 22px; border-radius:12px; font-size:13.5px; font-weight:600; z-index:300; opacity:0; transition:all .25s; pointer-events:none; display:flex; align-items:center; gap:10px; white-space:nowrap; }
      .ss-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }

      @media(max-width:700px) {
        .ss-view-grid, .ss-form-grid { grid-template-columns:1fr; }
        .ss-modal-backdrop { padding:10px; align-items:flex-end; }
        .ss-modal-panel { border-radius:20px 20px 0 0; }
        #ss-wrap .ss-card { flex-direction:column; }
        #ss-wrap .ss-card-right { flex-direction:row; align-items:center; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ═══════════════════════════════════════
     TOAST
  ═══════════════════════════════════════ */
  function showToast(msg, icon = '✓') {
    let t = document.getElementById('ss-toast');
    if (!t) { t = document.createElement('div'); t.id = 'ss-toast'; t.className = 'ss-toast'; document.body.appendChild(t); }
    t.innerHTML = `<span style="color:#4ade80">${icon}</span> ${msg}`;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ═══════════════════════════════════════
     MODAL
  ═══════════════════════════════════════ */
  function openModal(html, maxWidth = '640px') {
    closeModal();
    const bd = document.createElement('div');
    bd.id = 'ss-modal-backdrop';
    bd.className = 'ss-modal-backdrop';
    bd.innerHTML = `<div class="ss-modal-panel" style="max-width:${maxWidth}">${html}</div>`;
    document.body.appendChild(bd);
    bd.addEventListener('click', e => { if (e.target === bd) closeModal(); });
  }
  function closeModal() { document.getElementById('ss-modal-backdrop')?.remove(); }

  /* ═══════════════════════════════════════
     STATS
  ═══════════════════════════════════════ */
  function buildStats() {
    const totalSuppliers  = suppliers.length;
    const totalTx         = supplies.length;
    const received        = supplies.filter(s => s.status === 'Received').length;
    const pending         = supplies.filter(s => s.status === 'Ordered' || s.status === 'In Transit').length;
    const totalSpend      = supplies.filter(s => s.status === 'Received').reduce((sum, tx) => sum + computeTotals(tx).totalCost, 0);
    const totalProfit     = supplies.filter(s => s.status === 'Received').reduce((sum, tx) => sum + computeTotals(tx).possibleProfit, 0);
    return `
    <div class="ss-stats">
      <div class="ss-stat"><div class="ss-stat-icon ss-si-blue">🏭</div><div><div class="ss-stat-label">Suppliers</div><div class="ss-stat-value">${totalSuppliers}</div></div></div>
      <div class="ss-stat"><div class="ss-stat-icon ss-si-indigo">📦</div><div><div class="ss-stat-label">Transactions</div><div class="ss-stat-value">${totalTx}</div></div></div>
      <div class="ss-stat"><div class="ss-stat-icon ss-si-green">✅</div><div><div class="ss-stat-label">Received</div><div class="ss-stat-value">${received}</div></div></div>
      <div class="ss-stat"><div class="ss-stat-icon ss-si-amber">⏳</div><div><div class="ss-stat-label">Pending</div><div class="ss-stat-value">${pending}</div></div></div>
      <div class="ss-stat"><div class="ss-stat-icon ss-si-red">💸</div><div><div class="ss-stat-label">Total Spend</div><div class="ss-stat-value" style="font-size:16px">${fmt(totalSpend)}</div></div></div>
      <div class="ss-stat"><div class="ss-stat-icon ss-si-purple">📈</div><div><div class="ss-stat-label">Est. Profit</div><div class="ss-stat-value" style="font-size:16px;color:#16a34a">${fmt(totalProfit)}</div></div></div>
    </div>`;
  }

  /* ═══════════════════════════════════════
     TRANSACTION CARD
  ═══════════════════════════════════════ */
  function buildCard(tx) {
    const sup    = suppliers.find(s => s.id === tx.supplierId) || { name: '—' };
    const totals = computeTotals(tx);
    const sm     = STATUS_META[tx.status] || STATUS_META['Ordered'];
    const isAdmin = getRole().role === 'admin';
    const itemCount = tx.items.reduce((s, i) => s + i.qty, 0);

    const chips = tx.items.slice(0, 3).map(i =>
      `<span class="ss-item-chip">💊 ${esc(i.name)} ×${i.qty}</span>`
    ).join('') + (tx.items.length > 3 ? `<span class="ss-item-chip">+${tx.items.length - 3} more</span>` : '');

    return `
    <div class="ss-card">
      <div class="ss-card-left">
        <div class="ss-card-top">
          <span class="ss-card-id">${esc(tx.id)}</span>
          <span class="ss-card-supplier">${esc(sup.name)}</span>
          <span class="ss-status-badge ${sm.cls}"><span class="ss-status-dot ${sm.dot}"></span>${sm.label}</span>
          <span class="ss-freq-badge">${FREQ_ICON[tx.frequency] || '📋'} ${esc(tx.frequency)}</span>
          <span class="ss-pay-badge">${PAY_ICON[tx.paymentMode] || '💳'} ${esc(tx.paymentMode)}</span>
        </div>
        <div class="ss-card-meta">
          <span class="ss-meta-item">📅 ${fmtDateShort(tx.date)}</span>
          ${tx.deliveryDate ? `<span class="ss-meta-item">🚚 Delivered ${fmtDateShort(tx.deliveryDate)}</span>` : ''}
          <span class="ss-meta-item">📄 ${esc(tx.invoiceNo)}</span>
          <span class="ss-meta-item">👤 ${esc(tx.agent)}</span>
          ${tx.receivedBy ? `<span class="ss-meta-item">✅ Recv'd by ${esc(tx.receivedBy)}</span>` : ''}
          <span class="ss-meta-item">${tx.items.length} SKU · ${itemCount} units</span>
        </div>
        <div class="ss-item-chips">${chips}</div>
        ${tx.notes ? `<div class="ss-card-note">${esc(tx.notes)}</div>` : ''}
      </div>
      <div class="ss-card-right">
        <div class="ss-card-total">${fmt(totals.totalCost)}</div>
        <div style="font-size:11px;color:#16a34a;font-weight:600">+${fmt(totals.possibleProfit)} est.</div>
        <div class="ss-actions">
          <button class="ss-btn-icon ss-view-btn" data-id="${tx.id}" title="View details">👁</button>
          ${isAdmin ? `<button class="ss-btn-icon ss-edit-btn" data-id="${tx.id}" title="Edit">✏️</button>` : ''}
          ${isAdmin && tx.status === 'Ordered' ? `<button class="ss-btn-icon ss-receive-btn" data-id="${tx.id}" title="Mark received" style="color:#16a34a">✓</button>` : ''}
        </div>
      </div>
    </div>`;
  }

  /* ═══════════════════════════════════════
     SUPPLIERS SIDE PANEL
  ═══════════════════════════════════════ */
  function buildSuppliersPanel() {
    return suppliers.map(s => {
      const txCount = supplies.filter(t => t.supplierId === s.id).length;
      const stars = '★'.repeat(s.rating) + '☆'.repeat(5 - s.rating);
      return `
      <div class="ss-sup-card ss-sup-view-btn" data-id="${s.id}">
        <div class="ss-sup-name">${esc(s.name)}</div>
        <div class="ss-sup-cat">${esc(s.category)}</div>
        <div class="ss-sup-meta">
          <span class="ss-stars">${stars}</span>
          <span style="font-size:11px;color:var(--ss-muted)">${txCount} orders · ${esc(s.terms)}</span>
        </div>
      </div>`;
    }).join('');
  }

  /* ═══════════════════════════════════════
     FINANCIAL SUMMARY SIDE PANEL
  ═══════════════════════════════════════ */
  function buildSummaryPanel() {
    const receivedTx = supplies.filter(s => s.status === 'Received');
    const totalCost  = receivedTx.reduce((s, tx) => s + computeTotals(tx).totalCost, 0);
    const totalRev   = receivedTx.reduce((s, tx) => s + computeTotals(tx).potentialRevenue, 0);
    const totalProfit = totalRev - totalCost;
    const margin     = totalRev > 0 ? Math.round((totalProfit / totalRev) * 100) : 0;
    const marginPct  = Math.min(100, margin);
    return `
    <div class="ss-summary-row"><span class="ss-summary-label">Total Invested</span><span class="ss-summary-value" style="color:var(--ss-red)">${fmt(totalCost)}</span></div>
    <div class="ss-summary-row"><span class="ss-summary-label">Potential Revenue</span><span class="ss-summary-value">${fmt(totalRev)}</span></div>
    <div class="ss-summary-row"><span class="ss-summary-label">Estimated Profit</span><span class="ss-summary-value" style="color:#16a34a">${fmt(totalProfit)}</span></div>
    <div class="ss-summary-row" style="flex-direction:column;align-items:flex-start;gap:4px">
      <div style="display:flex;justify-content:space-between;width:100%">
        <span class="ss-summary-label">Profit Margin</span>
        <span class="ss-summary-value">${margin}%</span>
      </div>
      <div class="ss-profit-bar-track" style="width:100%"><div class="ss-profit-bar-fill" style="width:${marginPct}%"></div></div>
    </div>`;
  }

  /* ═══════════════════════════════════════
     VIEW MODAL
  ═══════════════════════════════════════ */
  function openViewModal(id) {
    const tx  = supplies.find(x => x.id === id); if (!tx) return;
    const sup = suppliers.find(s => s.id === tx.supplierId) || { name: '—' };
    const sm  = STATUS_META[tx.status] || STATUS_META['Ordered'];
    const totals = computeTotals(tx);

    const itemsRows = tx.items.map(i => {
      const subtotal = i.qty * i.unitCost;
      const revenue  = i.qty * (i.expectedSalePerUnit || i.unitCost * 1.5);
      const margin   = revenue > 0 ? Math.round(((revenue - subtotal) / revenue) * 100) : 0;
      return `
      <tr>
        <td><div style="font-weight:600">${esc(i.name)}</div><div style="font-size:11px;color:var(--ss-muted,#6b7280)">${esc(i.sku)}</div></td>
        <td>${i.qty}</td>
        <td>${fmt(i.unitCost)}</td>
        <td>${fmt(subtotal)}</td>
        <td>${fmt(i.expectedSalePerUnit || 0)}</td>
        <td>${fmt(revenue)}</td>
        <td><span class="ss-margin-pct ${margin >= 25 ? 'ss-margin-good' : 'ss-margin-ok'}">${margin}%</span></td>
      </tr>`;
    }).join('');

    openModal(`
      <div class="ss-modal-header">
        <div><div class="ss-modal-title">Supply Transaction</div><div class="ss-modal-sub">${esc(id)} · ${esc(sup.name)}</div></div>
        <button class="ss-modal-close" onclick="document.getElementById('ss-modal-backdrop').remove()">✕</button>
      </div>
      <div class="ss-modal-body">
        <div class="ss-modal-hero">
          <div>
            <div style="font-size:18px;font-weight:900;color:var(--ss-text,#111827)">${esc(tx.id)}</div>
            <div style="font-size:13px;color:var(--ss-muted,#6b7280);margin-top:3px">${esc(sup.name)} · ${esc(tx.invoiceNo)}</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <span class="ss-status-badge ${sm.cls}"><span class="ss-status-dot ${sm.dot}"></span>${sm.label}</span>
            <span class="ss-freq-badge">${FREQ_ICON[tx.frequency] || ''} ${esc(tx.frequency)}</span>
            <span class="ss-pay-badge">${PAY_ICON[tx.paymentMode] || ''} ${esc(tx.paymentMode)}</span>
          </div>
        </div>

        <div class="ss-view-grid">
          <div class="ss-detail-section">
            <div class="ss-detail-sec-title">Transaction Info</div>
            <div class="ss-detail-row"><span>Invoice No.</span><strong>${esc(tx.invoiceNo)}</strong></div>
            <div class="ss-detail-row"><span>Order Date</span><strong>${fmtDateShort(tx.date)}</strong></div>
            <div class="ss-detail-row"><span>Delivery Date</span><strong>${tx.deliveryDate ? fmtDateShort(tx.deliveryDate) : '—'}</strong></div>
            <div class="ss-detail-row"><span>Frequency</span><strong>${esc(tx.frequency)}</strong></div>
            <div class="ss-detail-row"><span>Payment Mode</span><strong>${esc(tx.paymentMode)}</strong></div>
          </div>
          <div class="ss-detail-section">
            <div class="ss-detail-sec-title">People</div>
            <div class="ss-detail-row"><span>Agent</span><strong>${esc(tx.agent)}</strong></div>
            <div class="ss-detail-row"><span>Received By</span><strong>${esc(tx.receivedBy) || '—'}</strong></div>
            <div class="ss-detail-row"><span>Supplier</span><strong>${esc(sup.name)}</strong></div>
            <div class="ss-detail-row"><span>Contact</span><strong>${esc(sup.contact || '—')}</strong></div>
            <div class="ss-detail-row"><span>Payment Terms</span><strong>${esc(sup.terms || '—')}</strong></div>
          </div>

          <div class="ss-detail-section ss-view-full">
            <div class="ss-detail-sec-title">Items · ${tx.items.length} SKUs</div>
            <div style="overflow-x:auto">
              <table class="ss-items-table">
                <thead><tr><th>Product</th><th>Qty</th><th>Unit Cost</th><th>Subtotal</th><th>Sale Price</th><th>Revenue</th><th>Margin</th></tr></thead>
                <tbody>${itemsRows}</tbody>
                <tfoot>
                  <tr>
                    <td>Totals</td>
                    <td>${tx.items.reduce((s, i) => s + i.qty, 0)}</td>
                    <td></td>
                    <td style="color:var(--ss-red,#e53935)">${fmt(totals.totalCost)}</td>
                    <td></td>
                    <td>${fmt(totals.potentialRevenue)}</td>
                    <td style="color:#16a34a">+${fmt(totals.possibleProfit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          ${tx.notes ? `
          <div class="ss-detail-section ss-view-full">
            <div class="ss-detail-sec-title">Notes</div>
            <div style="font-size:13.5px;color:var(--ss-text,#111827)">${esc(tx.notes)}</div>
          </div>` : ''}

          <div class="ss-detail-section ss-view-full">
            <div class="ss-detail-sec-title">History</div>
            ${(tx.history || []).slice().reverse().map(h => `
              <div class="ss-history-item">
                <div class="ss-history-dot"></div>
                <span class="ss-history-time">${fmtDate(h.time)}</span>
                <span style="color:var(--ss-text,#111827)">${esc(h.change)}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="ss-modal-footer">
        <button class="ss-btn-secondary" style="border-radius:9px;padding:10px 16px;font-size:13px" onclick="document.getElementById('ss-modal-backdrop').remove()">Close</button>
        ${getRole().role === 'admin' ? `<button class="ss-btn-primary" id="sm-edit-from-view">✏️ Edit</button>` : ''}
      </div>
    `, '720px');

    document.getElementById('sm-edit-from-view')?.addEventListener('click', () => { closeModal(); openEditModal(id); });
  }

  /* ═══════════════════════════════════════
     EDIT MODAL
  ═══════════════════════════════════════ */
  function openEditModal(id) {
    const tx = supplies.find(x => x.id === id); if (!tx) return;
    openModal(`
      <div class="ss-modal-header">
        <div><div class="ss-modal-title">Edit Transaction</div><div class="ss-modal-sub">${esc(id)}</div></div>
        <button class="ss-modal-close" onclick="document.getElementById('ss-modal-backdrop').remove()">✕</button>
      </div>
      <div class="ss-modal-body">
        <div class="ss-form-grid">
          <div class="ss-form-group">
            <label class="ss-form-label">Status <span class="ss-req">*</span></label>
            <select id="e-status" class="ss-form-select">
              ${['Ordered','In Transit','Received','Cancelled'].map(s => `<option value="${s}" ${tx.status===s?'selected':''}>${s}</option>`).join('')}
            </select>
          </div>
          <div class="ss-form-group">
            <label class="ss-form-label">Received By</label>
            <input id="e-recv" class="ss-form-input" value="${esc(tx.receivedBy)}" placeholder="Staff name" />
          </div>
          <div class="ss-form-group">
            <label class="ss-form-label">Delivery Date</label>
            <input id="e-deldate" type="date" class="ss-form-input" value="${tx.deliveryDate || ''}" />
          </div>
          <div class="ss-form-group">
            <label class="ss-form-label">Invoice No.</label>
            <input id="e-invoice" class="ss-form-input" value="${esc(tx.invoiceNo)}" />
          </div>
          <div class="ss-form-group">
            <label class="ss-form-label">Payment Mode</label>
            <select id="e-payment" class="ss-form-select">
              ${['cash','bank','credit'].map(p => `<option value="${p}" ${tx.paymentMode===p?'selected':''}>${p}</option>`).join('')}
            </select>
          </div>
          <div class="ss-form-group">
            <label class="ss-form-label">Agent</label>
            <input id="e-agent" class="ss-form-input" value="${esc(tx.agent)}" />
          </div>
          <div class="ss-form-group ss-form-full">
            <label class="ss-form-label">Notes</label>
            <textarea id="e-notes" class="ss-form-textarea">${esc(tx.notes)}</textarea>
          </div>
        </div>
      </div>
      <div class="ss-modal-footer">
        <button class="ss-btn-secondary" style="border-radius:9px;padding:10px 16px;font-size:13px" onclick="document.getElementById('ss-modal-backdrop').remove()">Cancel</button>
        <button class="ss-btn-primary" id="e-save">💾 Save Changes</button>
      </div>
    `, '560px');

    document.getElementById('e-save').addEventListener('click', () => {
      tx.status      = document.getElementById('e-status').value;
      tx.receivedBy  = document.getElementById('e-recv').value.trim();
      tx.deliveryDate= document.getElementById('e-deldate').value;
      tx.invoiceNo   = document.getElementById('e-invoice').value.trim();
      tx.paymentMode = document.getElementById('e-payment').value;
      tx.agent       = document.getElementById('e-agent').value.trim();
      tx.notes       = document.getElementById('e-notes').value.trim();
      tx.history.push({ time: new Date().toISOString(), change: `Updated by admin — status: ${tx.status}` });
      closeModal();
      updateList();
      renderStats();
      renderSummary();
      showToast(`${tx.id} updated`);
    });
  }

  /* ═══════════════════════════════════════
     SUPPLIER VIEW MODAL
  ═══════════════════════════════════════ */
  function openSupplierModal(id) {
    const s  = suppliers.find(x => x.id === id); if (!s) return;
    const txList = supplies.filter(t => t.supplierId === id);
    const stars = '★'.repeat(s.rating) + '☆'.repeat(5 - s.rating);
    const totalSpend = txList.filter(t => t.status === 'Received').reduce((sum, tx) => sum + computeTotals(tx).totalCost, 0);
    openModal(`
      <div class="ss-modal-header">
        <div><div class="ss-modal-title">${esc(s.name)}</div><div class="ss-modal-sub">Supplier Profile · ${esc(s.id)}</div></div>
        <button class="ss-modal-close" onclick="document.getElementById('ss-modal-backdrop').remove()">✕</button>
      </div>
      <div class="ss-modal-body">
        <div class="ss-view-grid">
          <div class="ss-detail-section">
            <div class="ss-detail-sec-title">Contact Info</div>
            <div class="ss-detail-row"><span>Contact</span><strong>${esc(s.contact)}</strong></div>
            <div class="ss-detail-row"><span>Phone</span><strong>${esc(s.phone)}</strong></div>
            <div class="ss-detail-row"><span>Email</span><strong>${esc(s.email)}</strong></div>
            <div class="ss-detail-row"><span>Address</span><strong>${esc(s.address)}</strong></div>
          </div>
          <div class="ss-detail-section">
            <div class="ss-detail-sec-title">Business Info</div>
            <div class="ss-detail-row"><span>Category</span><strong>${esc(s.category)}</strong></div>
            <div class="ss-detail-row"><span>Payment Terms</span><strong>${esc(s.terms)}</strong></div>
            <div class="ss-detail-row"><span>Rating</span><strong style="color:#f59e0b">${stars}</strong></div>
            <div class="ss-detail-row"><span>Total Orders</span><strong>${txList.length}</strong></div>
            <div class="ss-detail-row"><span>Total Spend</span><strong style="color:var(--ss-red,#e53935)">${fmt(totalSpend)}</strong></div>
          </div>
          <div class="ss-detail-section ss-view-full">
            <div class="ss-detail-sec-title">Order History</div>
            ${txList.length ? txList.map(tx => {
              const sm = STATUS_META[tx.status] || STATUS_META['Ordered'];
              return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--ss-border,#e8eaed);font-size:13px">
                <div>
                  <span style="font-weight:700">${esc(tx.id)}</span>
                  <span style="color:var(--ss-muted,#6b7280);margin-left:10px">${fmtDateShort(tx.date)}</span>
                </div>
                <div style="display:flex;align-items:center;gap:12px">
                  <span style="font-weight:700">${fmt(computeTotals(tx).totalCost)}</span>
                  <span class="ss-status-badge ${sm.cls}"><span class="ss-status-dot ${sm.dot}"></span>${sm.label}</span>
                </div>
              </div>`;
            }).join('') : '<div style="color:var(--ss-muted,#6b7280);font-size:13px">No orders yet.</div>'}
          </div>
        </div>
      </div>
      <div class="ss-modal-footer">
        <button class="ss-btn-secondary" style="border-radius:9px;padding:10px 16px;font-size:13px" onclick="document.getElementById('ss-modal-backdrop').remove()">Close</button>
      </div>
    `, '580px');
  }

  /* ═══════════════════════════════════════
     ADD SUPPLY MODAL
  ═══════════════════════════════════════ */
  function openAddModal() {
    openModal(`
      <div class="ss-modal-header">
        <div><div class="ss-modal-title">New Supply Order</div><div class="ss-modal-sub">Create a new stock replenishment transaction</div></div>
        <button class="ss-modal-close" onclick="document.getElementById('ss-modal-backdrop').remove()">✕</button>
      </div>
      <div class="ss-modal-body">
        <div class="ss-form-grid">
          <div class="ss-form-group">
            <label class="ss-form-label">Supplier <span class="ss-req">*</span></label>
            <select id="n-supplier" class="ss-form-select">
              ${suppliers.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}
            </select>
          </div>
          <div class="ss-form-group">
            <label class="ss-form-label">Invoice No.</label>
            <input id="n-invoice" class="ss-form-input" placeholder="e.g. INV-9200" />
          </div>
          <div class="ss-form-group">
            <label class="ss-form-label">Frequency <span class="ss-req">*</span></label>
            <select id="n-freq" class="ss-form-select">
              <option value="weekly">Weekly</option>
              <option value="monthly" selected>Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div class="ss-form-group">
            <label class="ss-form-label">Order Date <span class="ss-req">*</span></label>
            <input id="n-date" type="date" class="ss-form-input" value="${new Date().toISOString().slice(0,10)}" />
          </div>
          <div class="ss-form-group">
            <label class="ss-form-label">Agent <span class="ss-req">*</span></label>
            <input id="n-agent" class="ss-form-input" placeholder="Agent name" />
          </div>
          <div class="ss-form-group">
            <label class="ss-form-label">Payment Mode</label>
            <select id="n-payment" class="ss-form-select">
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="credit">Credit</option>
            </select>
          </div>
          <div class="ss-form-group">
            <label class="ss-form-label">Item SKU / Name</label>
            <input id="n-item-name" class="ss-form-input" placeholder="e.g. Paracetamol 500mg" />
          </div>
          <div class="ss-form-group">
            <label class="ss-form-label">Quantity</label>
            <input id="n-item-qty" type="number" class="ss-form-input" placeholder="e.g. 100" min="1" value="1" />
          </div>
          <div class="ss-form-group">
            <label class="ss-form-label">Unit Cost (₱)</label>
            <input id="n-item-cost" type="number" class="ss-form-input" placeholder="e.g. 30" min="0" step="0.01" />
          </div>
          <div class="ss-form-group">
            <label class="ss-form-label">Expected Sale Price (₱)</label>
            <input id="n-item-sale" type="number" class="ss-form-input" placeholder="e.g. 45" min="0" step="0.01" />
          </div>
          <div class="ss-form-group ss-form-full">
            <label class="ss-form-label">Notes</label>
            <textarea id="n-notes" class="ss-form-textarea" placeholder="Any special instructions or delivery notes…"></textarea>
          </div>
        </div>
        <div style="margin-top:10px;padding:10px 14px;background:var(--ss-surface2,#f8f9fb);border-radius:9px;font-size:12px;color:var(--ss-muted,#6b7280);border:1px solid var(--ss-border,#e8eaed)">
          💡 You can add more items after creating the order by editing it.
        </div>
      </div>
      <div class="ss-modal-footer">
        <button class="ss-btn-secondary" style="border-radius:9px;padding:10px 16px;font-size:13px" onclick="document.getElementById('ss-modal-backdrop').remove()">Cancel</button>
        <button class="ss-btn-primary" id="n-save">📦 Create Order</button>
      </div>
    `, '600px');

    document.getElementById('n-save').addEventListener('click', () => {
      const agent = document.getElementById('n-agent').value.trim();
      if (!agent) { showToast('Agent name required', '⚠'); return; }
      const itemName = document.getElementById('n-item-name').value.trim();
      const newId = 'TX-' + (1000 + supplies.length + 1);
      const sku   = 'NEW-' + Date.now().toString().slice(-4);
      supplies.unshift({
        id: newId,
        supplierId:   document.getElementById('n-supplier').value,
        frequency:    document.getElementById('n-freq').value,
        date:         document.getElementById('n-date').value || new Date().toISOString().slice(0, 10),
        deliveryDate: '',
        invoiceNo:    document.getElementById('n-invoice').value.trim() || '—',
        items:        itemName ? [{
          sku, name: itemName,
          qty:              parseInt(document.getElementById('n-item-qty').value) || 1,
          unitCost:         parseFloat(document.getElementById('n-item-cost').value) || 0,
          expectedSalePerUnit: parseFloat(document.getElementById('n-item-sale').value) || 0
        }] : [],
        agent,
        receivedBy: '',
        paymentMode: document.getElementById('n-payment').value,
        status: 'Ordered',
        notes:  document.getElementById('n-notes').value.trim(),
        history: [{ time: new Date().toISOString(), change: `Order created by ${getRole().userName || 'admin'}` }]
      });
      closeModal();
      render();
      showToast(`${newId} created`);
    });
  }

  /* ═══════════════════════════════════════
     UPDATE LIST (filter + search)
  ═══════════════════════════════════════ */
  function updateList() {
    const q      = (document.getElementById('ss-search')?.value || '').toLowerCase();
    const status = document.getElementById('ss-filter-status')?.value || 'all';
    const freq   = document.getElementById('ss-filter-freq')?.value || 'all';
    const pay    = document.getElementById('ss-filter-pay')?.value || 'all';
    const listEl = document.getElementById('ss-list');
    const info   = document.getElementById('ss-results-info');
    if (!listEl) return;

    const filtered = supplies.filter(tx => {
      if (status !== 'all' && tx.status !== status) return false;
      if (freq !== 'all' && tx.frequency !== freq) return false;
      if (pay !== 'all' && tx.paymentMode !== pay) return false;
      if (q) {
        const sup = suppliers.find(s => s.id === tx.supplierId);
        if (!`${tx.id} ${sup?.name || ''} ${tx.agent} ${tx.invoiceNo} ${tx.items.map(i=>i.name).join(' ')}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    listEl.innerHTML = filtered.length
      ? filtered.map(buildCard).join('')
      : `<div class="ss-empty"><div class="ss-empty-icon">📦</div><p>No transactions match your filters.</p></div>`;

    if (info) info.textContent = `Showing ${filtered.length} of ${supplies.length} transactions`;

    listEl.querySelectorAll('.ss-view-btn').forEach(b => b.addEventListener('click', () => openViewModal(b.dataset.id)));
    listEl.querySelectorAll('.ss-edit-btn').forEach(b => b.addEventListener('click', () => openEditModal(b.dataset.id)));
    listEl.querySelectorAll('.ss-receive-btn').forEach(b => b.addEventListener('click', () => markReceived(b.dataset.id)));
  }

  function renderStats() {
    const el = document.getElementById('ss-stats-block');
    if (el) el.innerHTML = buildStats();
  }
  function renderSummary() {
    const el = document.getElementById('ss-summary-content');
    if (el) el.innerHTML = buildSummaryPanel();
  }

  /* ═══════════════════════════════════════
     MARK RECEIVED
  ═══════════════════════════════════════ */
  function markReceived(id) {
    const tx = supplies.find(x => x.id === id); if (!tx) return;
    tx.status = 'Received';
    tx.receivedBy = getRole().userName || document.getElementById('user-name')?.textContent?.trim() || 'Admin';
    tx.deliveryDate = new Date().toISOString().slice(0, 10);
    tx.history.push({ time: new Date().toISOString(), change: `Marked received by ${tx.receivedBy}` });
    updateList();
    renderStats();
    renderSummary();
    showToast(`${tx.id} marked as received`, '✅');
  }

  /* ═══════════════════════════════════════
     EXPORT CSV
  ═══════════════════════════════════════ */
  function exportCSV() {
    const rows = [['ID','Supplier','Invoice','Date','Delivery','Frequency','Agent','Received By','Payment','Status','Items','Total Cost','Est. Revenue','Est. Profit','Notes']];
    supplies.forEach(tx => {
      const sup = suppliers.find(s => s.id === tx.supplierId);
      const t = computeTotals(tx);
      rows.push([tx.id, sup?.name||'', tx.invoiceNo, tx.date, tx.deliveryDate||'', tx.frequency, tx.agent, tx.receivedBy||'', tx.paymentMode, tx.status, tx.items.length, t.totalCost.toFixed(2), t.potentialRevenue.toFixed(2), t.possibleProfit.toFixed(2), tx.notes]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv),
      download: `supply_${new Date().toISOString().slice(0,10)}.csv`
    });
    a.click();
    showToast('CSV exported', '⬇');
  }

  /* ═══════════════════════════════════════
     RENDER
  ═══════════════════════════════════════ */
  function render() {
    setActiveNav(nav);
    const isAdmin = getRole().role === 'admin';

    container.innerHTML = `
    <div id="ss-wrap">
      <div class="ss-page-header">
        <div>
          <div class="ss-page-title">📦 Stock Supply</div>
          <div class="ss-page-sub">Manage supplier orders, receipts, and inventory replenishment</div>
        </div>
        <div class="ss-header-actions">
          ${isAdmin ? '<button id="ss-add-btn" class="ss-btn-primary">➕ New Order</button>' : ''}
          <button id="ss-export-btn" class="ss-btn-secondary">⬇ Export CSV</button>
        </div>
      </div>

      <div id="ss-stats-block">${buildStats()}</div>

      <div class="ss-grid">
        <!-- Left: Transactions -->
        <div>
          <div class="ss-panel">
            <div class="ss-toolbar">
              <div class="ss-search-wrap">
                <span class="ss-search-icon">🔍</span>
                <input id="ss-search" class="ss-search" placeholder="Search by ID, supplier, agent, invoice…" />
              </div>
              <select id="ss-filter-status" class="ss-filter-select">
                <option value="all">All Status</option>
                <option value="Ordered">Ordered</option>
                <option value="In Transit">In Transit</option>
                <option value="Received">Received</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select id="ss-filter-freq" class="ss-filter-select">
                <option value="all">All Freq.</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <select id="ss-filter-pay" class="ss-filter-select">
                <option value="all">All Payment</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="credit">Credit</option>
              </select>
            </div>
            <div style="padding:8px 18px;border-bottom:1px solid var(--ss-border);font-size:12px;color:var(--ss-muted)" id="ss-results-info">
              Showing ${supplies.length} of ${supplies.length} transactions
            </div>
            <div id="ss-list">
              ${supplies.map(buildCard).join('')}
            </div>
          </div>
        </div>

        <!-- Right: Sidebar -->
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="ss-panel">
            <div class="ss-panel-header">
              <span class="ss-panel-title">🏭 Suppliers</span>
              <span style="font-size:11px;color:var(--ss-muted)">${suppliers.length} registered</span>
            </div>
            <div>${buildSuppliersPanel()}</div>
          </div>
          <div class="ss-panel">
            <div class="ss-panel-header">
              <span class="ss-panel-title">📊 Financial Summary</span>
              <span style="font-size:11px;color:var(--ss-muted)">Received orders only</span>
            </div>
            <div style="padding:4px 18px 16px" id="ss-summary-content">${buildSummaryPanel()}</div>
          </div>
        </div>
      </div>
    </div>
    `;

    // Wire events
    document.getElementById('ss-add-btn')?.addEventListener('click', openAddModal);
    document.getElementById('ss-export-btn').addEventListener('click', exportCSV);
    document.getElementById('ss-search').addEventListener('input', updateList);
    document.getElementById('ss-filter-status').addEventListener('change', updateList);
    document.getElementById('ss-filter-freq').addEventListener('change', updateList);
    document.getElementById('ss-filter-pay').addEventListener('change', updateList);

    document.querySelectorAll('.ss-view-btn').forEach(b => b.addEventListener('click', () => openViewModal(b.dataset.id)));
    document.querySelectorAll('.ss-edit-btn').forEach(b => b.addEventListener('click', () => openEditModal(b.dataset.id)));
    document.querySelectorAll('.ss-receive-btn').forEach(b => b.addEventListener('click', () => markReceived(b.dataset.id)));
    document.querySelectorAll('.ss-sup-view-btn').forEach(b => b.addEventListener('click', () => openSupplierModal(b.dataset.id)));
  }

  nav.addEventListener('click', e => { e.preventDefault(); render(); });
  if (location.hash === '#stock-supply' || location.hash === '#supply') render();
});