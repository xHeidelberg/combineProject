document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav-audit-logs');
  const container = document.getElementById('role-dashboard');
  if (!nav || !container) return;


  // ================================================ sample data (replace mo nalang API fetch later)

  const audits = [
    { id: 'A-1001', time: '2026-05-02T09:12:00Z', action: 'received_stock', actorRole: 'admin', actorName: 'Alice', details: { supplier: 'Pharma Global', items: [{ sku: 'P002', name: 'Amoxicillin 250mg', qty: 50 }], txId: 'TX-9001' }, note: 'Initial stock received', ipAddress: '192.168.1.10', severity: 'info' },
    { id: 'A-1002', time: '2026-05-02T10:05:00Z', action: 'out_of_inventory', actorRole: 'staff', actorName: 'John', details: { sku: 'P005', name: 'Vitamin C', attemptedQty: 10 }, note: 'Customer requested but out of stock', ipAddress: '192.168.1.22', severity: 'warning' },
    { id: 'A-1003', time: '2026-04-30T14:22:00Z', action: 'pull_out_item', actorRole: 'pharmacist', actorName: 'Dr. Emeka', details: { sku: 'P002', name: 'Amoxicillin 250mg', qty: 2, reason: 'Prescription dispense' }, note: '', ipAddress: '192.168.1.15', severity: 'info' },
    { id: 'A-1004', time: '2026-04-29T08:44:00Z', action: 'added_prescription', actorRole: 'staff', actorName: 'Mona', details: { patientId: 'PT-102', prescId: 'RX-778', items: [{ sku: 'P002', qty: 10 }] }, note: 'Uploaded scanned Rx', ipAddress: '192.168.1.22', severity: 'info' },
    { id: 'A-1005', time: '2026-04-28T11:00:00Z', action: 'edited_product', actorRole: 'admin', actorName: 'Alice', details: { sku: 'P003', field: 'expiry', from: '2026-10-01', to: '2026-11-30' }, note: 'Corrected expiry date', ipAddress: '192.168.1.10', severity: 'info' },
    { id: 'A-1006', time: '2026-04-27T16:35:00Z', action: 'login', actorRole: 'admin', actorName: 'Alice', details: { method: 'password', browser: 'Chrome 124', os: 'Windows 11' }, note: '', ipAddress: '192.168.1.10', severity: 'info' },
    { id: 'A-1007', time: '2026-04-27T17:01:00Z', action: 'deleted_product', actorRole: 'admin', actorName: 'Alice', details: { sku: 'P009', name: 'Aspirin 100mg' }, note: 'Discontinued product removed', ipAddress: '192.168.1.10', severity: 'critical' },
    { id: 'A-1008', time: '2026-04-26T09:15:00Z', action: 'failed_login', actorRole: 'unknown', actorName: 'Unknown', details: { attemptedUser: 'bob@pharmacy.com', attempts: 3 }, note: 'Multiple failed attempts', ipAddress: '10.0.0.55', severity: 'critical' }
  ];

  const ACTION_META = {
    received_stock: { label: 'Received Stock', icon: '📥', color: 'green' },
    out_of_inventory: { label: 'Out of Inventory', icon: '📭', color: 'amber' },
    pull_out_item: { label: 'Pulled from Shelf', icon: '📤', color: 'blue' },
    added_prescription: { label: 'Added Prescription', icon: '📋', color: 'purple' },
    edited_product: { label: 'Edited Product', icon: '✏️', color: 'orange' },
    login: { label: 'User Login', icon: '🔐', color: 'gray' },
    deleted_product: { label: 'Deleted Product', icon: '🗑️', color: 'red' },
    failed_login: { label: 'Failed Login Attempt', icon: '🚨', color: 'red' }
  };

  const SEVERITY_META = {
    info: { label: 'Info', cls: 'al-sev-info' },
    warning: { label: 'Warning', cls: 'al-sev-warning' },
    critical: { label: 'Critical', cls: 'al-sev-critical' }
  };

  const ROLE_META = {
    admin: { cls: 'al-role-admin', label: 'Admin' },
    staff: { cls: 'al-role-staff', label: 'Staff' },
    pharmacist: { cls: 'al-role-pharmacist', label: 'Pharmacist' },
    unknown: { cls: 'al-role-unknown', label: 'Unknown' }
  };

  /* ── helpers ── */
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
    const links = document.querySelectorAll('#sidebar nav a');
    links.forEach(a => a.classList.remove('active-nav', 'bg-[#e53935]', 'text-white'));
    const el = (typeof target === 'string') ? document.getElementById(target) : target;
    if (el) el.classList.add('active-nav');
  }

  function formatDate(iso) {
    try { return new Date(iso).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch (e) { return iso; }
  }

  function timeAgo(iso) {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  function actorInitials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  /* ── stats ── */
  function buildStats() {
    const total = audits.length;
    const received = audits.filter(a => a.action === 'received_stock').length;
    const edits = audits.filter(a => a.action === 'edited_product').length;
    const critical = audits.filter(a => a.severity === 'critical').length;
    const warnings = audits.filter(a => a.severity === 'warning').length;
    const today = audits.filter(a => {
      const d = new Date(a.time); const n = new Date();
      return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    }).length;
    return `
    <div class="al-stats">
      <div class="al-stat-card">
        <div class="al-stat-icon si-blue">📋</div>
        <div><div class="al-stat-label">Total Logs</div><div class="al-stat-value">${total}</div></div>
      </div>
      <div class="al-stat-card">
        <div class="al-stat-icon si-green">📥</div>
        <div><div class="al-stat-label">Stock Receipts</div><div class="al-stat-value">${received}</div></div>
      </div>
      <div class="al-stat-card">
        <div class="al-stat-icon si-orange">✏️</div>
        <div><div class="al-stat-label">Product Edits</div><div class="al-stat-value">${edits}</div></div>
      </div>
      <div class="al-stat-card">
        <div class="al-stat-icon si-amber">⚠️</div>
        <div><div class="al-stat-label">Warnings</div><div class="al-stat-value">${warnings}</div></div>
      </div>
      <div class="al-stat-card">
        <div class="al-stat-icon si-red">🚨</div>
        <div><div class="al-stat-label">Critical</div><div class="al-stat-value">${critical}</div></div>
      </div>
      <div class="al-stat-card">
        <div class="al-stat-icon si-purple">📅</div>
        <div><div class="al-stat-label">Today's Events</div><div class="al-stat-value">${today}</div></div>
      </div>
    </div>`;
  }

  /* ── row ── */
  function buildRow(a) {
    const meta = ACTION_META[a.action] || { label: a.action, icon: '📌', color: 'gray' };
    const sev = SEVERITY_META[a.severity] || SEVERITY_META.info;
    const role = ROLE_META[a.actorRole] || ROLE_META.unknown;
    return `
    <div class="al-row" data-id="${a.id}">
      <div class="al-row-left">
        <div class="al-action-icon icon-${meta.color}">${meta.icon}</div>
        <div class="al-row-content">
          <div class="al-row-top">
            <span class="al-action-label">${meta.label}</span>
            <span class="al-log-id">${a.id}</span>
            <span class="al-badge ${sev.cls}">${sev.label}</span>
          </div>
          <div class="al-row-meta">
            <span class="al-actor">
              <span class="al-avatar" data-role="${a.actorRole}">${actorInitials(a.actorName)}</span>
              ${a.actorName}
              <span class="al-role-badge ${role.cls}">${role.label}</span>
            </span>
            <span class="al-sep">·</span>
            <span class="al-time" title="${formatDate(a.time)}">🕐 ${timeAgo(a.time)}</span>
            <span class="al-sep">·</span>
            <span class="al-ip">🌐 ${a.ipAddress}</span>
          </div>
          ${a.note ? `<div class="al-note">${a.note}</div>` : ''}
        </div>
      </div>
      <div class="al-row-right">
        <button class="al-btn-view" data-view="${a.id}">View Details</button>
      </div>
    </div>`;
  }

  /* ── detail modal ── */
  function buildDetailModal(a) {
    const meta = ACTION_META[a.action] || { label: a.action, icon: '📌', color: 'gray' };
    const sev = SEVERITY_META[a.severity] || SEVERITY_META.info;
    const role = ROLE_META[a.actorRole] || ROLE_META.unknown;

    let detailHTML = '';
    const d = a.details;

    if (a.action === 'received_stock') {
      detailHTML = `
        <div class="al-detail-section">
          <div class="al-detail-section-title">Stock Receipt Info</div>
          <div class="al-detail-row"><span>Supplier</span><strong>${d.supplier}</strong></div>
          <div class="al-detail-row"><span>Transaction ID</span><strong>${d.txId}</strong></div>
        </div>
        <div class="al-detail-section">
          <div class="al-detail-section-title">Items Received</div>
          ${(d.items || []).map(i => `
            <div class="al-item-row">
              <span class="al-item-sku">${i.sku}</span>
              <span class="al-item-name">${i.name}</span>
              <span class="al-item-qty">+${i.qty} units</span>
            </div>`).join('')}
        </div>`;
    } else if (a.action === 'pull_out_item') {
      detailHTML = `
        <div class="al-detail-section">
          <div class="al-detail-section-title">Dispensed Item</div>
          <div class="al-detail-row"><span>SKU</span><strong>${d.sku}</strong></div>
          <div class="al-detail-row"><span>Product</span><strong>${d.name}</strong></div>
          <div class="al-detail-row"><span>Quantity</span><strong>${d.qty} units</strong></div>
          <div class="al-detail-row"><span>Reason</span><strong>${d.reason}</strong></div>
        </div>`;
    } else if (a.action === 'added_prescription') {
      detailHTML = `
        <div class="al-detail-section">
          <div class="al-detail-section-title">Prescription Info</div>
          <div class="al-detail-row"><span>Patient ID</span><strong>${d.patientId}</strong></div>
          <div class="al-detail-row"><span>Prescription ID</span><strong>${d.prescId}</strong></div>
        </div>
        <div class="al-detail-section">
          <div class="al-detail-section-title">Prescribed Items</div>
          ${(d.items || []).map(i => `
            <div class="al-item-row">
              <span class="al-item-sku">${i.sku}</span>
              <span class="al-item-qty">${i.qty} units</span>
            </div>`).join('')}
        </div>`;
    } else if (a.action === 'edited_product') {
      detailHTML = `
        <div class="al-detail-section">
          <div class="al-detail-section-title">Change Details</div>
          <div class="al-detail-row"><span>SKU</span><strong>${d.sku}</strong></div>
          <div class="al-detail-row"><span>Field Changed</span><strong>${d.field}</strong></div>
          <div class="al-change-row">
            <div class="al-change-from"><span class="al-change-label">Before</span><span class="al-change-val">${d.from}</span></div>
            <div class="al-change-arrow">→</div>
            <div class="al-change-to"><span class="al-change-label">After</span><span class="al-change-val">${d.to}</span></div>
          </div>
        </div>`;
    } else if (a.action === 'deleted_product') {
      detailHTML = `
        <div class="al-detail-section">
          <div class="al-detail-section-title">Deleted Product</div>
          <div class="al-detail-row"><span>SKU</span><strong>${d.sku}</strong></div>
          <div class="al-detail-row"><span>Name</span><strong>${d.name}</strong></div>
          <div class="al-warn-box">⚠️ This action is irreversible. Product has been permanently removed from inventory.</div>
        </div>`;
    } else if (a.action === 'login') {
      detailHTML = `
        <div class="al-detail-section">
          <div class="al-detail-section-title">Session Info</div>
          <div class="al-detail-row"><span>Method</span><strong>${d.method}</strong></div>
          <div class="al-detail-row"><span>Browser</span><strong>${d.browser}</strong></div>
          <div class="al-detail-row"><span>OS</span><strong>${d.os}</strong></div>
        </div>`;
    } else if (a.action === 'failed_login') {
      detailHTML = `
        <div class="al-detail-section">
          <div class="al-detail-section-title">Intrusion Attempt Info</div>
          <div class="al-detail-row"><span>Attempted User</span><strong>${d.attemptedUser}</strong></div>
          <div class="al-detail-row"><span>Attempts</span><strong>${d.attempts}</strong></div>
          <div class="al-warn-box al-critical-box">🚨 Security alert: multiple failed login attempts detected from this IP.</div>
        </div>`;
    } else if (a.action === 'out_of_inventory') {
      detailHTML = `
        <div class="al-detail-section">
          <div class="al-detail-section-title">Stock Alert Info</div>
          <div class="al-detail-row"><span>SKU</span><strong>${d.sku}</strong></div>
          <div class="al-detail-row"><span>Product</span><strong>${d.name}</strong></div>
          <div class="al-detail-row"><span>Attempted Qty</span><strong>${d.attemptedQty} units</strong></div>
        </div>`;
    } else {
      detailHTML = `<div class="al-detail-section"><pre class="al-json">${JSON.stringify(d, null, 2)}</pre></div>`;
    }

    return `
    <div class="al-modal-header icon-${meta.color}">
      <div class="al-modal-icon">${meta.icon}</div>
      <div>
        <div class="al-modal-title">${meta.label}</div>
        <div class="al-modal-sub">${a.id} · ${formatDate(a.time)}</div>
      </div>
      <span class="al-badge ${sev.cls}" style="margin-left:auto">${sev.label}</span>
    </div>
    <div class="al-modal-grid">
      <div class="al-detail-section">
        <div class="al-detail-section-title">Actor</div>
        <div class="al-actor-block">
          <div class="al-avatar-lg" data-role="${a.actorRole}">${actorInitials(a.actorName)}</div>
          <div>
            <div class="al-actor-name">${a.actorName}</div>
            <div><span class="al-role-badge ${role.cls}">${role.label}</span></div>
          </div>
        </div>
      </div>
      <div class="al-detail-section">
        <div class="al-detail-section-title">Event Metadata</div>
        <div class="al-detail-row"><span>Timestamp</span><strong>${formatDate(a.time)}</strong></div>
        <div class="al-detail-row"><span>IP Address</span><strong>${a.ipAddress}</strong></div>
        <div class="al-detail-row"><span>Action Type</span><strong>${a.action}</strong></div>
        ${a.note ? `<div class="al-detail-row"><span>Note</span><strong>${a.note}</strong></div>` : ''}
      </div>
      <div class="al-detail-section al-full-col">${detailHTML}</div>
    </div>`;
  }

  /* ── render ── */
  function render() {
    setActiveNav(nav);
    if (getRole().role !== 'admin') {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;gap:12px;color:var(--muted,#6b7280)">
          <div style="font-size:40px">🔒</div>
          <div style="font-size:15px;font-weight:600">Access Restricted</div>
          <div style="font-size:13px">Audit Logs are visible to admins only.</div>
        </div>`;
      return;
    }

    container.innerHTML = `
    <style>
      /* ── Scoped to #role-dashboard only — never bleeds into sidebar/header ── */

      /* CSS vars: defined on the container itself, with dark-mode variant via html.dark */
      #role-dashboard {
        --al-red:#e53935; --al-red-dim:#b71c1c;
        --al-surface:#ffffff; --al-surface2:#f8f9fa;
        --al-border:#e8ecf0; --al-text:#111827; --al-muted:#6b7280;
        --al-radius:14px; --al-shadow:0 2px 12px rgba(0,0,0,.07);
      }
      /* Dark mode: scoped to html.dark so only affects #role-dashboard vars, not the sidebar */
      html.dark #role-dashboard {
        --al-surface:#161616; --al-surface2:#1e1e1e;
        --al-border:#2a2a2a; --al-text:#f3f4f6; --al-muted:#9ca3af;
      }

      /* stats */
      #role-dashboard .al-stats { display:flex; gap:12px; overflow-x:auto; padding-bottom:4px; margin-bottom:20px; }
      #role-dashboard .al-stat-card { background:var(--al-surface); border:1px solid var(--al-border); border-radius:var(--al-radius); padding:16px 20px; display:flex; align-items:center; gap:14px; min-width:140px; flex:1; box-shadow:var(--al-shadow); }
      #role-dashboard .al-stat-icon { font-size:20px; width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
      #role-dashboard .si-blue{background:#eff6ff} #role-dashboard .si-green{background:#f0fdf4} #role-dashboard .si-orange{background:#fff7ed} #role-dashboard .si-amber{background:#fffbeb} #role-dashboard .si-red{background:#fef2f2} #role-dashboard .si-purple{background:#f5f3ff}
      #role-dashboard .al-stat-label { font-size:11px; color:var(--al-muted); text-transform:uppercase; letter-spacing:.5px; font-weight:600; }
      #role-dashboard .al-stat-value { font-size:26px; font-weight:700; color:var(--al-text); line-height:1.1; }

      /* header */
      #role-dashboard .al-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; gap:12px; flex-wrap:wrap; }
      #role-dashboard .al-title { font-size:18px; font-weight:700; color:var(--al-text); display:flex; align-items:center; gap:8px; }
      #role-dashboard .al-subtitle { font-size:12px; color:var(--al-muted); margin-top:2px; }

      /* filter bar */
      #role-dashboard .al-filter-bar { display:flex; gap:10px; flex-wrap:wrap; padding:14px 18px; border-bottom:1px solid var(--al-border); }
      #role-dashboard .al-filter-bar input, #role-dashboard .al-filter-bar select { border:1px solid var(--al-border); border-radius:9px; padding:9px 14px; font-size:13px; background:var(--al-surface); color:var(--al-text); outline:none; transition:border .15s; }
      #role-dashboard .al-filter-bar input { flex:1; min-width:180px; }
      #role-dashboard .al-filter-bar input:focus, #role-dashboard .al-filter-bar select:focus { border-color:var(--al-red); }
      #role-dashboard .al-results-info { padding:8px 18px 12px; font-size:12px; color:var(--al-muted); }

      /* panel */
      #role-dashboard .al-panel { background:var(--al-surface); border:1px solid var(--al-border); border-radius:var(--al-radius); overflow:hidden; box-shadow:var(--al-shadow); }

      /* rows */
      #role-dashboard .al-row { display:flex; align-items:center; gap:14px; padding:14px 18px; border-bottom:1px solid var(--al-border); transition:background .12s; }
      #role-dashboard .al-row:last-child { border-bottom:none; }
      #role-dashboard .al-row:hover { background:var(--al-surface2); }
      #role-dashboard .al-row-left { display:flex; align-items:flex-start; gap:12px; flex:1; min-width:0; }
      #role-dashboard .al-action-icon { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; }
      #role-dashboard .icon-green{background:#f0fdf4} #role-dashboard .icon-blue{background:#eff6ff} #role-dashboard .icon-purple{background:#f5f3ff}
      #role-dashboard .icon-orange{background:#fff7ed} #role-dashboard .icon-amber{background:#fffbeb} #role-dashboard .icon-red{background:#fef2f2} #role-dashboard .icon-gray{background:#f3f4f6}
      #role-dashboard .al-row-content { flex:1; min-width:0; display:flex; flex-direction:column; gap:4px; }
      #role-dashboard .al-row-top { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
      #role-dashboard .al-action-label { font-size:14px; font-weight:700; color:var(--al-text); }
      #role-dashboard .al-log-id { font-size:11px; color:var(--al-muted); background:var(--al-surface2); border:1px solid var(--al-border); border-radius:5px; padding:1px 6px; }
      #role-dashboard .al-row-meta { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
      #role-dashboard .al-actor { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--al-muted); }
      #role-dashboard .al-avatar { width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; color:#fff; flex-shrink:0; }
      #role-dashboard .al-avatar[data-role="admin"]      { background:#e53935; }
      #role-dashboard .al-avatar[data-role="pharmacist"] { background:#6366f1; }
      #role-dashboard .al-avatar[data-role="staff"]      { background:#0ea5e9; }
      #role-dashboard .al-avatar[data-role="unknown"]    { background:#9ca3af; }
      #role-dashboard .al-sep { color:var(--al-border); font-size:12px; }
      #role-dashboard .al-time, #role-dashboard .al-ip { font-size:12px; color:var(--al-muted); }
      #role-dashboard .al-note { font-size:12px; color:var(--al-muted); font-style:italic; padding:4px 10px; background:var(--al-surface2); border-left:3px solid var(--al-border); border-radius:0 6px 6px 0; }
      #role-dashboard .al-row-right { flex-shrink:0; }

      /* badges — prefixed al- to avoid clashing with other modules */
      #role-dashboard .al-badge { font-size:10px; font-weight:700; border-radius:20px; padding:2px 8px; text-transform:uppercase; letter-spacing:.4px; }
      #role-dashboard .al-sev-info     { background:#dbeafe; color:#1e40af; }
      #role-dashboard .al-sev-warning  { background:#fef3c7; color:#92400e; }
      #role-dashboard .al-sev-critical { background:#fee2e2; color:#991b1b; }
      #role-dashboard .al-role-badge { font-size:10px; font-weight:600; border-radius:4px; padding:1px 6px; }
      #role-dashboard .al-role-admin      { background:#fee2e2; color:#991b1b; }
      #role-dashboard .al-role-staff      { background:#dbeafe; color:#1e40af; }
      #role-dashboard .al-role-pharmacist { background:#ede9fe; color:#5b21b6; }
      #role-dashboard .al-role-unknown    { background:#f3f4f6; color:#6b7280; }

      /* buttons — all prefixed al- */
      #role-dashboard .al-btn-primary { background:var(--al-red); color:#fff; border:none; border-radius:9px; padding:10px 18px; font-size:13px; font-weight:600; cursor:pointer; transition:background .15s; }
      #role-dashboard .al-btn-primary:hover { background:var(--al-red-dim); }
      #role-dashboard .al-btn-secondary { background:var(--al-surface); color:var(--al-text); border:1px solid var(--al-border); border-radius:9px; padding:10px 16px; font-size:13px; cursor:pointer; transition:border .15s; }
      #role-dashboard .al-btn-secondary:hover { border-color:var(--al-red); color:var(--al-red); }
      #role-dashboard .al-btn-view { background:var(--al-surface2); color:var(--al-text); border:1px solid var(--al-border); border-radius:7px; padding:6px 14px; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap; transition:all .12s; }
      #role-dashboard .al-btn-view:hover { border-color:#6366f1; color:#6366f1; }

      /* modal — IDs are fine as global since there's only one modal at a time */
      #a-modal { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; padding:16px; pointer-events:none; opacity:0; transition:opacity .2s; }
      #a-modal.open { pointer-events:auto; opacity:1; }
      #a-modal-overlay { position:absolute; inset:0; background:rgba(0,0,0,.45); backdrop-filter:blur(3px); }
      #a-modal-panel { position:relative; width:100%; max-width:600px; background:var(--al-surface,#fff); border-radius:18px; border:1px solid var(--al-border,#e8ecf0); box-shadow:0 20px 60px rgba(0,0,0,.2); max-height:90vh; overflow-y:auto; transition:transform .2s; transform:scale(.97); }
      #a-modal.open #a-modal-panel { transform:scale(1); }
      #a-modal-body { padding:0; }
      #a-modal .al-modal-close-row { padding:14px 20px; display:flex; justify-content:flex-end; border-top:1px solid var(--al-border,#e8ecf0); position:sticky; bottom:0; background:var(--al-surface,#fff); }

      /* modal internals */
      #a-modal .al-modal-header { display:flex; align-items:center; gap:14px; padding:20px 24px; border-bottom:1px solid var(--al-border,#e8ecf0); }
      #a-modal .al-modal-icon { font-size:24px; width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
      #a-modal .al-modal-title { font-size:16px; font-weight:700; color:var(--al-text,#111827); }
      #a-modal .al-modal-sub { font-size:12px; color:var(--al-muted,#6b7280); margin-top:2px; }
      #a-modal .al-modal-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; padding:20px 24px; }
      #a-modal .al-full-col { grid-column:1/-1; }
      #a-modal .al-detail-section { display:flex; flex-direction:column; gap:8px; }
      #a-modal .al-detail-section-title { font-size:10px; text-transform:uppercase; letter-spacing:1px; font-weight:700; color:var(--al-muted,#6b7280); padding-bottom:6px; border-bottom:1px solid var(--al-border,#e8ecf0); }
      #a-modal .al-detail-row { display:flex; justify-content:space-between; align-items:center; font-size:13px; gap:12px; }
      #a-modal .al-detail-row span:first-child { color:var(--al-muted,#6b7280); flex-shrink:0; }
      #a-modal .al-detail-row strong { color:var(--al-text,#111827); text-align:right; }
      #a-modal .al-actor-block { display:flex; align-items:center; gap:12px; }
      #a-modal .al-avatar-lg { width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#fff; flex-shrink:0; }
      #a-modal .al-avatar-lg[data-role="admin"]      { background:#e53935; }
      #a-modal .al-avatar-lg[data-role="pharmacist"] { background:#6366f1; }
      #a-modal .al-avatar-lg[data-role="staff"]      { background:#0ea5e9; }
      #a-modal .al-avatar-lg[data-role="unknown"]    { background:#9ca3af; }
      #a-modal .al-actor-name { font-size:14px; font-weight:700; color:var(--al-text,#111827); margin-bottom:4px; }
      #a-modal .al-item-row { display:flex; align-items:center; gap:10px; padding:8px 12px; background:var(--al-surface2,#f8f9fa); border-radius:8px; font-size:13px; }
      #a-modal .al-item-sku { font-size:11px; font-weight:700; background:var(--al-border,#e8ecf0); border-radius:5px; padding:1px 6px; }
      #a-modal .al-item-name { flex:1; color:var(--al-text,#111827); }
      #a-modal .al-item-qty { font-weight:700; color:#16a34a; }
      #a-modal .al-change-row { display:flex; align-items:center; gap:10px; padding:10px 14px; background:var(--al-surface2,#f8f9fa); border-radius:10px; }
      #a-modal .al-change-from, #a-modal .al-change-to { flex:1; display:flex; flex-direction:column; gap:3px; }
      #a-modal .al-change-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--al-muted,#6b7280); }
      #a-modal .al-change-from .al-change-val { color:#ef4444; font-weight:600; font-size:13px; text-decoration:line-through; }
      #a-modal .al-change-to .al-change-val { color:#16a34a; font-weight:600; font-size:13px; }
      #a-modal .al-change-arrow { color:var(--al-muted,#6b7280); font-size:16px; }
      #a-modal .al-warn-box { background:#fff7ed; border:1px solid #fed7aa; border-radius:8px; padding:10px 14px; font-size:12px; color:#92400e; }
      #a-modal .al-critical-box { background:#fef2f2; border-color:#fecaca; color:#991b1b; }
      #a-modal .al-json { background:var(--al-surface2,#f8f9fa); border:1px solid var(--al-border,#e8ecf0); border-radius:8px; padding:12px; font-size:11px; color:var(--al-text,#111827); overflow-x:auto; white-space:pre-wrap; }

      /* empty state */
      #role-dashboard .al-empty { text-align:center; padding:48px; color:var(--al-muted); }
      #role-dashboard .al-empty .al-es-icon { font-size:36px; margin-bottom:10px; }

      @media (max-width:580px) {
        #a-modal .al-modal-grid { grid-template-columns:1fr; }
        #role-dashboard .al-stats { gap:8px; }
        #role-dashboard .al-stat-card { min-width:120px; }
      }
    </style>

    <div class="al-header">
      <div>
        <div class="al-title">🔍 Audit Logs</div>
        <div class="al-subtitle">System activity trail · admin view only</div>
      </div>
      <div style="display:flex;gap:8px">
        <button id="export-audits" class="al-btn-secondary">⬇ Export CSV</button>
      </div>
    </div>

    ${buildStats()}

    <div class="al-panel">
      <div class="al-filter-bar">
        <input id="a-search" placeholder="🔍  Search by ID, actor, note, or IP…" />
        <select id="a-filter-action">
          <option value="all">All Actions</option>
          ${Object.entries(ACTION_META).map(([k, v]) => `<option value="${k}">${v.icon} ${v.label}</option>`).join('')}
        </select>
        <select id="a-filter-severity">
          <option value="all">All Severity</option>
          <option value="info">ℹ Info</option>
          <option value="warning">⚠ Warning</option>
          <option value="critical">🚨 Critical</option>
        </select>
        <select id="a-filter-role">
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="pharmacist">Pharmacist</option>
        </select>
      </div>
      <div class="al-results-info" id="a-results-info">Showing ${audits.length} events</div>
      <div id="a-list">
        ${audits.map(a => buildRow(a)).join('')}
      </div>
    </div>

    <div id="a-modal">
      <div id="a-modal-overlay"></div>
      <div id="a-modal-panel">
        <div id="a-modal-body"></div>
        <div class="al-modal-close-row">
          <button id="a-modal-close" class="al-btn-secondary">Close</button>
        </div>
      </div>
    </div>
    `;

    wire();
  }

  /* ── modal helpers ── */
  function openModal(html) {
    const modal = document.getElementById('a-modal');
    const body = document.getElementById('a-modal-body');
    if (!modal || !body) return;
    body.innerHTML = html;
    modal.classList.add('open');
    document.getElementById('a-modal-close')?.addEventListener('click', closeModal);
    document.getElementById('a-modal-overlay')?.addEventListener('click', closeModal);
  }
  function closeModal() {
    document.getElementById('a-modal')?.classList.remove('open');
  }

  /* ── wire ── */
  function wire() {
    document.getElementById('a-search')?.addEventListener('input', updateList);
    document.getElementById('a-filter-action')?.addEventListener('change', updateList);
    document.getElementById('a-filter-severity')?.addEventListener('change', updateList);
    document.getElementById('a-filter-role')?.addEventListener('change', updateList);
    document.getElementById('export-audits')?.addEventListener('click', exportCSV);
    bindViewButtons();
  }

  function bindViewButtons() {
    container.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {
      const a = audits.find(x => x.id === b.getAttribute('data-view'));
      if (a) openModal(buildDetailModal(a));
    }));
  }

  function exportCSV() {
    const headers = ['ID', 'Time', 'Action', 'Actor', 'Role', 'IP', 'Severity', 'Note'];
    const rows = audits.map(a => [a.id, a.time, a.action, a.actorName, a.actorRole, a.ipAddress, a.severity, a.note]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const el = document.createElement('a');
    el.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    el.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    el.click();
  }

  /* ── filter ── */
  function updateList() {
    const q = (document.getElementById('a-search')?.value || '').toLowerCase();
    const action = document.getElementById('a-filter-action')?.value || 'all';
    const severity = document.getElementById('a-filter-severity')?.value || 'all';
    const role = document.getElementById('a-filter-role')?.value || 'all';
    const root = document.getElementById('a-list');
    const info = document.getElementById('a-results-info');
    if (!root) return;

    const filtered = audits.filter(a => {
      if (action !== 'all' && a.action !== action) return false;
      if (severity !== 'all' && a.severity !== severity) return false;
      if (role !== 'all' && a.actorRole !== role) return false;
      if (q && !`${a.id} ${a.actorName} ${a.note} ${a.action} ${a.ipAddress}`.toLowerCase().includes(q)) return false;
      return true;
    });

    root.innerHTML = filtered.length
      ? filtered.map(a => buildRow(a)).join('')
      : `<div class="al-empty"><div class="al-es-icon">🔍</div><p>No logs match your filters.</p></div>`;
    if (info) info.textContent = `Showing ${filtered.length} of ${audits.length} events`;
    bindViewButtons();
  }

  nav.addEventListener('click', e => { e.preventDefault(); render(); });
  if (location.hash === '#audit-logs' || location.hash === '#audits') render();
});