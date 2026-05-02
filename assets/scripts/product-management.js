document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav-product-management');
  const container = document.getElementById('role-dashboard');
  if (!nav || !container) return;

  const products = [
    { sku: 'P001', name: 'Paracetamol 500mg', shelf: 'A1', inShelf: 24, reorderLevel: 15, added: '2026-04-01', manufactured: '2025-10-01', expiry: '2027-09-30', manufacturer: 'MediCorp', mAddress: '123 Health St., Manila', generic: true, prescription: false, category: 'Analgesic', unitPrice: 5.50 },
    { sku: 'P002', name: 'Amoxicillin 250mg', shelf: 'B4', inShelf: 8, reorderLevel: 20, added: '2026-03-15', manufactured: '2025-01-10', expiry: '2026-12-31', manufacturer: 'Pharma Global', mAddress: '45 Pharma Ave, Quezon City', generic: false, prescription: true, category: 'Antibiotic', unitPrice: 18.00 },
    { sku: 'P003', name: 'Cough Syrup 100ml', shelf: 'C2', inShelf: 12, reorderLevel: 10, added: '2026-02-20', manufactured: '2025-11-01', expiry: '2026-11-30', manufacturer: 'Healthline Supply', mAddress: '890 Wellness Rd, Makati', generic: false, prescription: false, category: 'Cough & Cold', unitPrice: 75.00 },
    { sku: 'P004', name: 'Metformin 500mg', shelf: 'D1', inShelf: 5, reorderLevel: 15, added: '2026-01-10', manufactured: '2024-12-01', expiry: '2026-08-15', manufacturer: 'DiabeCare Inc.', mAddress: '22 Insulin Blvd, Pasig', generic: true, prescription: true, category: 'Antidiabetic', unitPrice: 9.25 },
    { sku: 'P005', name: 'Vitamin C 500mg', shelf: 'E3', inShelf: 40, reorderLevel: 20, added: '2026-04-10', manufactured: '2025-08-01', expiry: '2027-07-31', manufacturer: 'NutriPharm', mAddress: '55 Supplement Lane, Taguig', generic: true, prescription: false, category: 'Supplement', unitPrice: 3.75 }
  ];

  /* ─────────── helpers ─────────── */
  function getRole() {
    const b = document.getElementById('current-role');
    const userName = document.getElementById('user-name')?.textContent?.trim() || '';
    if (!b) return { role: 'staff', userName };
    const t = b.textContent || '';
    if (/admin/i.test(t)) return { role: 'admin', userName };
    return { role: 'staff', userName };
  }

  function setActiveNav(target){
    if (window.setActiveSidebar) return window.setActiveSidebar(target);
    const links = document.querySelectorAll('#sidebar nav a');
    links.forEach(a => a.classList.remove('active-nav','bg-[#e53935]', 'text-white'));
    const el = (typeof target === 'string') ? document.getElementById(target) : target;
    if (el) el.classList.add('active-nav');
  }

  function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function daysUntilExpiry(expiry) {
    return Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
  }

  function expiryStatus(expiry) {
    const days = daysUntilExpiry(expiry);
    if (days < 0) return { label: 'Expired', cls: 'status-expired', dotCls: 'dot-red' };
    if (days < 30) return { label: `${days}d left`, cls: 'status-critical', dotCls: 'dot-red' };
    if (days < 90) return { label: `${days}d left`, cls: 'status-warning', dotCls: 'dot-amber' };
    return { label: formatDate(expiry), cls: 'status-ok', dotCls: 'dot-green' };
  }

  function stockStatus(p) {
    if (p.inShelf === 0) return { label: 'Out of Stock', cls: 'stock-out' };
    if (p.inShelf <= p.reorderLevel * 0.5) return { label: 'Critical', cls: 'stock-critical' };
    if (p.inShelf <= p.reorderLevel) return { label: 'Low Stock', cls: 'stock-low' };
    return { label: 'In Stock', cls: 'stock-ok' };
  }

  function stockBar(p) {
    const pct = Math.min(100, Math.round((p.inShelf / (p.reorderLevel * 2)) * 100));
    const color = p.inShelf <= p.reorderLevel * 0.5 ? '#ef4444' : p.inShelf <= p.reorderLevel ? '#f59e0b' : '#22c55e';
    return `<div class="stock-bar-track"><div class="stock-bar-fill" style="width:${pct}%;background:${color}"></div></div>`;
  }

  /* ─────────── stats ─────────── */
  function buildStats() {
    const total = products.length;
    const lowStock = products.filter(p => p.inShelf <= p.reorderLevel).length;
    const expiring = products.filter(p => daysUntilExpiry(p.expiry) < 90).length;
    const expired = products.filter(p => daysUntilExpiry(p.expiry) < 0).length;
    const rxCount = products.filter(p => p.prescription).length;
    return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon si-blue">📦</div>
        <div>
          <div class="stat-label">Total Products</div>
          <div class="stat-value">${total}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon si-amber">⚠️</div>
        <div>
          <div class="stat-label">Low / Reorder</div>
          <div class="stat-value">${lowStock}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon si-orange">⏳</div>
        <div>
          <div class="stat-label">Expiring (&lt;90d)</div>
          <div class="stat-value">${expiring}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon si-red">🚫</div>
        <div>
          <div class="stat-label">Expired</div>
          <div class="stat-value">${expired}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon si-indigo">💊</div>
        <div>
          <div class="stat-label">Prescription</div>
          <div class="stat-value">${rxCount}</div>
        </div>
      </div>
    </div>`;
  }

  /* ─────────── product row ─────────── */
  function buildRow(p) {
    const exp = expiryStatus(p.expiry);
    const stk = stockStatus(p);
    const isAdmin = getRole().role === 'admin';
    return `
    <div class="prod-row" data-sku="${p.sku}">
      <div class="prod-row-main">
        <div class="prod-header">
          <span class="prod-name">${p.name}</span>
          <span class="sku-tag">${p.sku}</span>
          ${p.prescription ? '<span class="badge badge-rx">Rx</span>' : '<span class="badge badge-otc">OTC</span>'}
          ${p.generic ? '<span class="badge badge-generic">Generic</span>' : '<span class="badge badge-brand">Brand</span>'}
        </div>
        <div class="prod-meta">
          <span class="meta-item">🗂 ${p.category}</span>
          <span class="meta-item">📍 Shelf ${p.shelf}</span>
          <span class="meta-item">🏭 ${p.manufacturer}</span>
          <span class="meta-item">📅 Added ${formatDate(p.added)}</span>
          <span class="meta-item">💵 ₱${p.unitPrice.toFixed(2)}</span>
        </div>
        <div class="prod-footer">
          <div class="stock-inline">
            <span class="stock-qty">${p.inShelf} units</span>
            ${stockBar(p)}
            <span class="badge ${stk.cls}">${stk.label}</span>
          </div>
          <div class="expiry-inline">
            <span class="exp-label">Expires:</span>
            <span class="badge ${exp.cls}"><span class="${exp.dotCls}"></span>${exp.label}</span>
          </div>
        </div>
      </div>
      <div class="prod-actions">
        <button class="btn-view" data-view="${p.sku}">View</button>
        ${isAdmin ? `<button class="btn-edit" data-edit="${p.sku}">Edit</button>` : ''}
      </div>
    </div>`;
  }

  /* ─────────── view modal ─────────── */
  function viewModal(p) {
    const exp = expiryStatus(p.expiry);
    const stk = stockStatus(p);
    return `
    <div class="modal-header">
      <div>
        <h3 class="modal-title">${p.name}</h3>
        <div class="modal-subtitle">${p.sku} · ${p.category}</div>
      </div>
      <div class="modal-badges">
        ${p.prescription ? '<span class="badge badge-rx">Rx Required</span>' : '<span class="badge badge-otc">OTC</span>'}
        ${p.generic ? '<span class="badge badge-generic">Generic</span>' : '<span class="badge badge-brand">Brand</span>'}
      </div>
    </div>
    <div class="modal-grid">
      <div class="modal-section">
        <div class="section-label">Stock Info</div>
        <div class="detail-row"><span>Shelf Location</span><strong>${p.shelf}</strong></div>
        <div class="detail-row"><span>Quantity on Hand</span><strong>${p.inShelf} units</strong></div>
        <div class="detail-row"><span>Reorder Level</span><strong>${p.reorderLevel} units</strong></div>
        <div class="detail-row"><span>Stock Status</span><span class="badge ${stk.cls}">${stk.label}</span></div>
        <div class="detail-row"><span>Unit Price</span><strong>₱${p.unitPrice.toFixed(2)}</strong></div>
        <div class="detail-row"><span>Total Value</span><strong>₱${(p.unitPrice * p.inShelf).toFixed(2)}</strong></div>
      </div>
      <div class="modal-section">
        <div class="section-label">Dates</div>
        <div class="detail-row"><span>Date Added</span><strong>${formatDate(p.added)}</strong></div>
        <div class="detail-row"><span>Manufactured</span><strong>${formatDate(p.manufactured)}</strong></div>
        <div class="detail-row"><span>Expiry Date</span><span class="badge ${exp.cls}"><span class="${exp.dotCls}"></span>${exp.label}</span></div>
      </div>
      <div class="modal-section modal-full">
        <div class="section-label">Manufacturer</div>
        <div class="detail-row"><span>Company</span><strong>${p.manufacturer}</strong></div>
        <div class="detail-row"><span>Address</span><strong>${p.mAddress}</strong></div>
      </div>
    </div>`;
  }

  /* ─────────── edit modal ─────────── */
  function editModal(p) {
    return `
    <div class="modal-header">
      <div>
        <h3 class="modal-title">Edit Product</h3>
        <div class="modal-subtitle">${p.sku} · ${p.name}</div>
      </div>
    </div>
    <div class="modal-form">
      <div class="form-row">
        <div class="form-group">
          <label>Product Name</label>
          <input id="edit-name" class="form-input" value="${p.name}" />
        </div>
        <div class="form-group">
          <label>Category</label>
          <input id="edit-cat" class="form-input" value="${p.category || ''}" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Shelf Location</label>
          <input id="edit-shelf" class="form-input" value="${p.shelf}" />
        </div>
        <div class="form-group">
          <label>Unit Price (₱)</label>
          <input id="edit-price" type="number" step="0.01" class="form-input" value="${p.unitPrice}" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Quantity on Hand</label>
          <input id="edit-qty" type="number" class="form-input" value="${p.inShelf}" />
        </div>
        <div class="form-group">
          <label>Reorder Level</label>
          <input id="edit-reorder" type="number" class="form-input" value="${p.reorderLevel}" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Expiry Date</label>
          <input id="edit-exp" type="date" class="form-input" value="${p.expiry}" />
        </div>
        <div class="form-group">
          <label>Manufacturer</label>
          <input id="edit-mfg" class="form-input" value="${p.manufacturer}" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group checkbox-group">
          <label><input id="edit-generic" type="checkbox" ${p.generic ? 'checked' : ''} /> Generic</label>
          <label><input id="edit-rx" type="checkbox" ${p.prescription ? 'checked' : ''} /> Prescription Required</label>
        </div>
      </div>
      <div class="form-actions">
        <button id="edit-save" class="btn-primary">Save Changes</button>
      </div>
    </div>`;
  }

  /* ─────────── add modal ─────────── */
  function addModal() {
    return `
    <div class="modal-header">
      <div>
        <h3 class="modal-title">Add New Product</h3>
        <div class="modal-subtitle">Fill in product details below</div>
      </div>
    </div>
    <div class="modal-form">
      <div class="form-row">
        <div class="form-group">
          <label>SKU <span class="req">*</span></label>
          <input id="new-sku" class="form-input" placeholder="e.g. P006" />
        </div>
        <div class="form-group">
          <label>Product Name <span class="req">*</span></label>
          <input id="new-name" class="form-input" placeholder="e.g. Ibuprofen 200mg" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Category</label>
          <input id="new-cat" class="form-input" placeholder="e.g. Analgesic" />
        </div>
        <div class="form-group">
          <label>Shelf Location</label>
          <input id="new-shelf" class="form-input" placeholder="e.g. A2" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Quantity</label>
          <input id="new-qty" type="number" class="form-input" placeholder="0" />
        </div>
        <div class="form-group">
          <label>Reorder Level</label>
          <input id="new-reorder" type="number" class="form-input" placeholder="10" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Unit Price (₱)</label>
          <input id="new-price" type="number" step="0.01" class="form-input" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label>Expiry Date</label>
          <input id="new-exp" type="date" class="form-input" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Manufacturer</label>
          <input id="new-mfg" class="form-input" placeholder="Company name" />
        </div>
        <div class="form-group">
          <label>Manufacturer Address</label>
          <input id="new-addr" class="form-input" placeholder="Address" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group checkbox-group">
          <label><input id="new-generic" type="checkbox" /> Generic</label>
          <label><input id="new-rx" type="checkbox" /> Prescription Required</label>
        </div>
      </div>
      <div class="form-actions">
        <button id="new-save" class="btn-primary">Create Product</button>
      </div>
    </div>`;
  }

  /* ─────────── render ─────────── */
  function render() {
    setActiveNav(nav);
    const isAdmin = getRole().role === 'admin';
    container.innerHTML = `
    <style>
      /* ── Design tokens ── */
      :root {
        --red: #e53935;
        --red-dim: #b71c1c;
        --surface: #ffffff;
        --surface2: #f8f9fa;
        --border: #e8ecf0;
        --text: #111827;
        --muted: #6b7280;
        --radius: 14px;
        --shadow: 0 2px 12px rgba(0,0,0,.07);
      }
      .dark { --surface: #161616; --surface2: #1e1e1e; --border: #2a2a2a; --text: #f3f4f6; --muted: #9ca3af; }

      /* ── Stats grid ── */
      .stats-grid { display:flex; gap:12px; overflow-x:auto; padding-bottom:4px; margin-bottom:20px; }
      .stat-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:16px 20px; display:flex; align-items:center; gap:14px; min-width:150px; flex:1; box-shadow:var(--shadow); }
      .stat-icon { font-size:22px; width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
      .si-blue { background:#eff6ff; } .si-amber { background:#fffbeb; } .si-orange { background:#fff7ed; } .si-red { background:#fef2f2; } .si-indigo { background:#eef2ff; }
      .stat-label { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; font-weight:600; }
      .stat-value { font-size:26px; font-weight:700; color:var(--text); line-height:1.1; }

      /* ── Toolbar ── */
      .pm-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; gap:12px; flex-wrap:wrap; }
      .pm-title { font-size:18px; font-weight:700; color:var(--text); display:flex; align-items:center; gap:8px; }
      .pm-subtitle { font-size:12px; color:var(--muted); margin-top:2px; }
      .pm-actions { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }

      /* ── Search/filter bar ── */
      .filter-bar { display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap; }
      .filter-bar input, .filter-bar select { border:1px solid var(--border); border-radius:9px; padding:9px 14px; font-size:13px; background:var(--surface); color:var(--text); outline:none; transition:border .15s; }
      .filter-bar input { flex:1; min-width:180px; }
      .filter-bar input:focus, .filter-bar select:focus { border-color:var(--red); }

      /* ── Product list ── */
      .prod-panel { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; box-shadow:var(--shadow); }
      .prod-list { display:flex; flex-direction:column; divide-y; }
      .prod-row { display:flex; align-items:stretch; gap:12px; padding:16px 18px; border-bottom:1px solid var(--border); transition:background .12s; }
      .prod-row:last-child { border-bottom:none; }
      .prod-row:hover { background:var(--surface2); }
      .prod-row-main { flex:1; min-width:0; display:flex; flex-direction:column; gap:8px; }
      .prod-header { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
      .prod-name { font-size:14px; font-weight:700; color:var(--text); }
      .sku-tag { font-size:11px; color:var(--muted); background:var(--surface2); border:1px solid var(--border); border-radius:5px; padding:1px 6px; }
      .prod-meta { display:flex; gap:12px; flex-wrap:wrap; }
      .meta-item { font-size:12px; color:var(--muted); }
      .prod-footer { display:flex; align-items:center; gap:20px; flex-wrap:wrap; }
      .stock-inline { display:flex; align-items:center; gap:8px; }
      .stock-qty { font-size:12px; font-weight:600; color:var(--text); min-width:54px; }
      .stock-bar-track { width:80px; height:5px; border-radius:99px; background:var(--border); overflow:hidden; }
      .stock-bar-fill { height:100%; border-radius:99px; transition:width .3s; }
      .expiry-inline { display:flex; align-items:center; gap:6px; }
      .exp-label { font-size:11px; color:var(--muted); }
      .prod-actions { display:flex; flex-direction:column; gap:6px; justify-content:center; min-width:90px; align-items:flex-end; }

      /* ── Badges ── */
      .badge { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:600; border-radius:20px; padding:2px 9px; }
      .badge-rx { background:#fef3c7; color:#92400e; }
      .badge-otc { background:#d1fae5; color:#065f46; }
      .badge-generic { background:#ede9fe; color:#5b21b6; }
      .badge-brand { background:#dbeafe; color:#1e40af; }
      .status-ok { background:#d1fae5; color:#065f46; }
      .status-warning { background:#fef3c7; color:#92400e; }
      .status-critical { background:#fee2e2; color:#991b1b; }
      .status-expired { background:#fecaca; color:#7f1d1d; }
      .stock-ok { background:#d1fae5; color:#065f46; }
      .stock-low { background:#fef3c7; color:#92400e; }
      .stock-critical { background:#fee2e2; color:#991b1b; }
      .stock-out { background:#fecaca; color:#7f1d1d; }
      .dot-green, .dot-amber, .dot-red { width:6px; height:6px; border-radius:50%; display:inline-block; }
      .dot-green { background:#22c55e; } .dot-amber { background:#f59e0b; } .dot-red { background:#ef4444; }

      /* ── Buttons ── */
      .btn-primary { background:var(--red); color:#fff; border:none; border-radius:9px; padding:10px 18px; font-size:13px; font-weight:600; cursor:pointer; transition:background .15s; }
      .btn-primary:hover { background:var(--red-dim); }
      .btn-secondary { background:var(--surface); color:var(--text); border:1px solid var(--border); border-radius:9px; padding:10px 16px; font-size:13px; cursor:pointer; transition:border .15s; }
      .btn-secondary:hover { border-color:var(--red); color:var(--red); }
      .btn-view { background:var(--surface2); color:var(--text); border:1px solid var(--border); border-radius:7px; padding:6px 14px; font-size:12px; font-weight:600; cursor:pointer; transition:all .12s; }
      .btn-view:hover { border-color:#6366f1; color:#6366f1; }
      .btn-edit { background:var(--red); color:#fff; border:none; border-radius:7px; padding:6px 14px; font-size:12px; font-weight:600; cursor:pointer; transition:background .12s; }
      .btn-edit:hover { background:var(--red-dim); }

      /* ── Modal ── */
      #p-modal { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; padding:16px; pointer-events:none; opacity:0; transition:opacity .2s; }
      #p-modal.open { pointer-events:auto; opacity:1; }
      #p-modal-overlay { position:absolute; inset:0; background:rgba(0,0,0,.45); backdrop-filter:blur(3px); }
      #p-modal-panel { position:relative; width:100%; max-width:560px; background:var(--surface); border-radius:18px; border:1px solid var(--border); box-shadow:0 20px 60px rgba(0,0,0,.2); max-height:90vh; overflow-y:auto; transition:transform .2s; transform:scale(.97); }
      #p-modal.open #p-modal-panel { transform:scale(1); }
      #p-modal-body { padding:24px 24px 0; }
      .modal-close-row { padding:16px 24px; display:flex; justify-content:flex-end; gap:8px; position:sticky; bottom:0; background:var(--surface); border-top:1px solid var(--border); }

      /* ── Modal internals ── */
      .modal-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; flex-wrap:wrap; gap:8px; }
      .modal-title { font-size:17px; font-weight:700; color:var(--text); }
      .modal-subtitle { font-size:12px; color:var(--muted); margin-top:3px; }
      .modal-badges { display:flex; gap:6px; flex-wrap:wrap; }
      .modal-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
      .modal-full { grid-column:1/-1; }
      .modal-section { display:flex; flex-direction:column; gap:6px; }
      .section-label { font-size:10px; text-transform:uppercase; letter-spacing:1px; font-weight:700; color:var(--muted); margin-bottom:4px; padding-bottom:4px; border-bottom:1px solid var(--border); }
      .detail-row { display:flex; justify-content:space-between; align-items:center; font-size:13px; }
      .detail-row span:first-child { color:var(--muted); }
      .detail-row strong { color:var(--text); text-align:right; max-width:58%; }

      /* ── Form ── */
      .modal-form { display:flex; flex-direction:column; gap:14px; }
      .form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
      .form-group { display:flex; flex-direction:column; gap:5px; }
      .form-group label { font-size:12px; font-weight:600; color:var(--muted); }
      .form-input { border:1px solid var(--border); border-radius:9px; padding:9px 12px; font-size:13px; background:var(--surface2); color:var(--text); outline:none; transition:border .15s; }
      .form-input:focus { border-color:var(--red); background:var(--surface); }
      .checkbox-group { flex-direction:row; gap:20px; padding-top:4px; }
      .checkbox-group label { display:flex; align-items:center; gap:6px; font-size:13px; color:var(--text); cursor:pointer; font-weight:400; }
      .checkbox-group input[type=checkbox] { width:15px; height:15px; accent-color:var(--red); }
      .req { color:var(--red); }
      .form-actions { display:flex; justify-content:flex-end; padding-top:4px; }

      /* ── Empty state ── */
      .empty-state { text-align:center; padding:48px 16px; color:var(--muted); }
      .empty-state .es-icon { font-size:36px; margin-bottom:10px; }
      .empty-state p { font-size:14px; }

      /* ── Scrollbar ── */
      .stats-grid::-webkit-scrollbar { height:4px; } .stats-grid::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }

      @media (max-width:580px) {
        .modal-grid { grid-template-columns:1fr; }
        .form-row { grid-template-columns:1fr; }
        .stats-grid { gap:8px; }
        .stat-card { min-width:120px; }
      }
    </style>

    <div class="pm-header">
      <div>
        <div class="pm-title">📦 Product Management</div>
        <div class="pm-subtitle">Manage shelf inventory and product metadata</div>
      </div>
      <div class="pm-actions">
        ${isAdmin ? '<button id="add-product" class="btn-primary">＋ Add Product</button>' : ''}
        <button id="export-products" class="btn-secondary">⬇ Export</button>
      </div>
    </div>

    ${buildStats()}

    <div class="prod-panel">
      <div style="padding:14px 18px; border-bottom:1px solid var(--border);">
        <div class="filter-bar">
          <input id="p-search" placeholder="🔍  Search by name, SKU or category…" />
          <select id="p-filter-presc">
            <option value="all">All Products</option>
            <option value="rx">Prescription (Rx)</option>
            <option value="otc">OTC Only</option>
          </select>
          <select id="p-filter-stock">
            <option value="all">All Stock</option>
            <option value="low">Low / Critical</option>
            <option value="ok">In Stock</option>
          </select>
          <select id="p-filter-exp">
            <option value="all">Any Expiry</option>
            <option value="soon">Expiring &lt;90d</option>
            <option value="ok">Expiry OK</option>
          </select>
        </div>
        <div id="p-results-info" style="font-size:12px; color:var(--muted)">Showing ${products.length} products</div>
      </div>
      <div id="p-list" class="prod-list">
        ${products.map(p => buildRow(p)).join('')}
      </div>
    </div>

    <!-- Modal -->
    <div id="p-modal">
      <div id="p-modal-overlay"></div>
      <div id="p-modal-panel">
        <div id="p-modal-body"></div>
        <div class="modal-close-row">
          <button id="p-modal-close" class="btn-secondary">Close</button>
        </div>
      </div>
    </div>
    `;

    wire();
  }

  /* ─────────── modal helpers ─────────── */
  function openModal(html) {
    const modal = document.getElementById('p-modal');
    const body = document.getElementById('p-modal-body');
    if (!modal || !body) return;
    body.innerHTML = html;
    modal.classList.add('open');
    document.getElementById('p-modal-close')?.addEventListener('click', closeModal);
    document.getElementById('p-modal-overlay')?.addEventListener('click', closeModal);
  }

  function closeModal() {
    document.getElementById('p-modal')?.classList.remove('open');
  }

  /* ─────────── wire events ─────────── */
  function wire() {
    document.getElementById('p-search')?.addEventListener('input', updateList);
    document.getElementById('p-filter-presc')?.addEventListener('change', updateList);
    document.getElementById('p-filter-stock')?.addEventListener('change', updateList);
    document.getElementById('p-filter-exp')?.addEventListener('change', updateList);

    document.getElementById('export-products')?.addEventListener('click', exportCSV);
    document.getElementById('add-product')?.addEventListener('click', () => {
      openModal(addModal());
      document.getElementById('new-save')?.addEventListener('click', saveNewProduct);
    });

    bindRowEvents();
  }

  function bindRowEvents() {
    container.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {
      const p = products.find(x => x.sku === b.getAttribute('data-view'));
      if (p) openModal(viewModal(p));
    }));
    container.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
      if (getRole().role !== 'admin') return;
      const p = products.find(x => x.sku === b.getAttribute('data-edit'));
      if (!p) return;
      openModal(editModal(p));
      document.getElementById('edit-save')?.addEventListener('click', () => {
        p.name = document.getElementById('edit-name').value || p.name;
        p.category = document.getElementById('edit-cat').value || p.category;
        p.shelf = document.getElementById('edit-shelf').value || p.shelf;
        p.unitPrice = parseFloat(document.getElementById('edit-price').value) || p.unitPrice;
        p.inShelf = parseInt(document.getElementById('edit-qty').value) ?? p.inShelf;
        p.reorderLevel = parseInt(document.getElementById('edit-reorder').value) || p.reorderLevel;
        p.expiry = document.getElementById('edit-exp').value || p.expiry;
        p.manufacturer = document.getElementById('edit-mfg').value || p.manufacturer;
        p.generic = document.getElementById('edit-generic').checked;
        p.prescription = document.getElementById('edit-rx').checked;
        closeModal();
        render();
      });
    }));
  }

  function saveNewProduct() {
    const sku = document.getElementById('new-sku').value.trim();
    const name = document.getElementById('new-name').value.trim();
    if (!sku || !name) { alert('SKU and name are required.'); return; }
    if (products.find(p => p.sku === sku)) { alert('SKU already exists.'); return; }
    products.unshift({
      sku, name,
      category: document.getElementById('new-cat').value || 'Uncategorized',
      shelf: document.getElementById('new-shelf').value || '—',
      inShelf: parseInt(document.getElementById('new-qty').value) || 0,
      reorderLevel: parseInt(document.getElementById('new-reorder').value) || 10,
      unitPrice: parseFloat(document.getElementById('new-price').value) || 0,
      added: new Date().toISOString().slice(0, 10),
      manufactured: '',
      expiry: document.getElementById('new-exp').value || '',
      manufacturer: document.getElementById('new-mfg').value || '',
      mAddress: document.getElementById('new-addr').value || '',
      generic: document.getElementById('new-generic').checked,
      prescription: document.getElementById('new-rx').checked,
    });
    closeModal();
    render();
  }

  function exportCSV() {
    const headers = ['SKU','Name','Category','Shelf','Qty','Reorder','Price','Added','Manufactured','Expiry','Manufacturer','Generic','Prescription'];
    const rows = products.map(p => [p.sku, p.name, p.category, p.shelf, p.inShelf, p.reorderLevel, p.unitPrice, p.added, p.manufactured, p.expiry, p.manufacturer, p.generic, p.prescription]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `products_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }

  /* ─────────── filter + list update ─────────── */
  function updateList() {
    const q = (document.getElementById('p-search')?.value || '').toLowerCase();
    const presc = document.getElementById('p-filter-presc')?.value || 'all';
    const stockF = document.getElementById('p-filter-stock')?.value || 'all';
    const expF = document.getElementById('p-filter-exp')?.value || 'all';
    const root = document.getElementById('p-list');
    const info = document.getElementById('p-results-info');
    if (!root) return;

    const filtered = products.filter(p => {
      if (presc === 'rx' && !p.prescription) return false;
      if (presc === 'otc' && p.prescription) return false;
      if (stockF === 'low' && p.inShelf > p.reorderLevel) return false;
      if (stockF === 'ok' && p.inShelf <= p.reorderLevel) return false;
      if (expF === 'soon' && daysUntilExpiry(p.expiry) >= 90) return false;
      if (expF === 'ok' && daysUntilExpiry(p.expiry) < 90) return false;
      if (q && !(`${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(q))) return false;
      return true;
    });

    if (filtered.length === 0) {
      root.innerHTML = `<div class="empty-state"><div class="es-icon">🔍</div><p>No products match your filters.</p></div>`;
    } else {
      root.innerHTML = filtered.map(p => buildRow(p)).join('');
      bindRowEvents();
    }
    if (info) info.textContent = `Showing ${filtered.length} of ${products.length} products`;
  }

  nav.addEventListener('click', e => { e.preventDefault(); render(); });
  if (location.hash === '#product-management' || location.hash === '#products') render();
});