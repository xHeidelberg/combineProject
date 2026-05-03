(function () {

    // ================================================ sample data (replace with API fetch later)

    const users = [
        {
            id: 1, name: 'Ana Santos', email: 'ana.santos@rsmedstar.ph',
            role: 'pharmacist', department: 'Dispensary',
            phone: '+63 912 345 6789', joined: '2024-03-15',
            lastLogin: '2026-05-04T08:12:00Z', sessionMins: 95,
            active: true, lastActive: '2026-05-04T09:47:00Z',
            loginCount: 142, actionsToday: 8,
            activities: [
                { time: '2026-05-04T09:47:00Z', action: 'Dispensed Rx #RX-882 · Amoxicillin 250mg' },
                { time: '2026-05-04T09:10:00Z', action: 'Processed order #231' },
                { time: '2026-05-04T08:55:00Z', action: 'Updated stock for Paracetamol 500mg' },
                { time: '2026-05-04T08:12:00Z', action: 'Logged in from 192.168.1.15' }
            ],
            history: [
                { time: '2026-04-10T10:00:00Z', change: 'Role changed: staff → pharmacist by Admin' },
                { time: '2024-03-15T09:00:00Z', change: 'Account created by Admin' }
            ]
        },
        {
            id: 2, name: 'Ben Cruz', email: 'ben.cruz@rsmedstar.ph',
            role: 'staff', department: 'Front Counter',
            phone: '+63 917 654 3210', joined: '2025-01-08',
            lastLogin: '2026-05-02T14:00:00Z', sessionMins: 30,
            active: false, lastActive: '2026-05-02T14:30:00Z',
            loginCount: 58, actionsToday: 0,
            activities: [
                { time: '2026-05-02T14:00:00Z', action: 'Viewed inventory report' },
                { time: '2026-05-02T13:45:00Z', action: 'Logged in from 192.168.1.22' }
            ],
            history: [
                { time: '2026-04-28T09:00:00Z', change: 'Password reset by Admin' },
                { time: '2025-01-08T08:30:00Z', change: 'Account created by Admin' }
            ]
        },
        {
            id: 3, name: 'Clara Mendoza', email: 'clara.m@rsmedstar.ph',
            role: 'admin', department: 'Management',
            phone: '+63 918 111 2222', joined: '2023-06-01',
            lastLogin: '2026-05-04T07:30:00Z', sessionMins: 210,
            active: true, lastActive: '2026-05-04T10:00:00Z',
            loginCount: 280, actionsToday: 14,
            activities: [
                { time: '2026-05-04T10:00:00Z', action: 'Reviewed audit log' },
                { time: '2026-05-04T09:00:00Z', action: 'Added product: Metformin 500mg' },
                { time: '2026-05-04T07:30:00Z', action: 'Logged in from 192.168.1.10' }
            ],
            history: [
                { time: '2023-06-01T08:00:00Z', change: 'Account created · Admin role assigned' }
            ]
        },
        {
            id: 4, name: 'Diego Ramos', email: 'diego.r@rsmedstar.ph',
            role: 'staff', department: 'Delivery',
            phone: '+63 920 777 8888', joined: '2025-09-20',
            lastLogin: '2026-04-30T11:00:00Z', sessionMins: 15,
            active: false, lastActive: '2026-04-30T11:15:00Z',
            loginCount: 31, actionsToday: 0,
            activities: [
                { time: '2026-04-30T11:00:00Z', action: 'Marked 3 deliveries as completed' },
                { time: '2026-04-30T10:58:00Z', action: 'Logged in from 192.168.1.33' }
            ],
            history: [
                { time: '2025-09-20T09:00:00Z', change: 'Account created by Admin' }
            ]
        }
    ];

    /* ─────────────────────────────────────────
       HELPERS
    ───────────────────────────────────────── */
    function getRole() {
        const el = document.getElementById('current-role');
        return el ? el.textContent.trim().toLowerCase() : '';
    }

    function formatDate(s) {
        try { return new Date(s).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }); }
        catch (e) { return s; }
    }

    function timeAgo(s) {
        const diff = (Date.now() - new Date(s)) / 1000;
        if (diff < 60) return `${Math.floor(diff)}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    function computeInactiveMins(u) {
        try { return Math.round((Date.now() - new Date(u.lastActive || u.lastLogin)) / 60000); }
        catch (e) { return 0; }
    }

    function initials(name) {
        return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    }

    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    const ROLE_META = {
        admin: { cls: 'um-role-admin', label: 'Admin', color: '#e53935' },
        pharmacist: { cls: 'um-role-pharmacist', label: 'Pharmacist', color: '#6366f1' },
        staff: { cls: 'um-role-staff', label: 'Staff', color: '#0ea5e9' }
    };

    function avatarColor(role) {
        return { admin: '#e53935', pharmacist: '#6366f1', staff: '#0ea5e9' }[role] || '#9ca3af';
    }

    /* ─────────────────────────────────────────
       INJECT SCOPED STYLES (once)
    ───────────────────────────────────────── */
    if (!document.getElementById('um-styles')) {
        const style = document.createElement('style');
        style.id = 'um-styles';
        style.textContent = `
      /* ── Variables (scoped to container) ── */
      #role-dashboard {
        --um-red:     #e53935;
        --um-red-dim: #b71c1c;
        --um-red-soft:rgba(229,57,53,.1);
        --um-surface: #ffffff;
        --um-surface2:#f8f9fb;
        --um-border:  #e8eaed;
        --um-text:    #111827;
        --um-muted:   #6b7280;
        --um-radius:  14px;
        --um-shadow:  0 2px 16px rgba(0,0,0,.07);
      }
      html.dark #role-dashboard {
        --um-surface: #161618;
        --um-surface2:#1d1d20;
        --um-border:  #2a2a32;
        --um-text:    #f0f0f4;
        --um-muted:   #9ca3af;
        --um-shadow:  0 2px 16px rgba(0,0,0,.35);
      }

      /* ── Layout ── */
      #um-wrap { display:flex; flex-direction:column; gap:22px; }

      /* ── Header ── */
      #um-wrap .um-page-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; }
      #um-wrap .um-page-title  { font-size:19px; font-weight:800; color:var(--um-text); display:flex; align-items:center; gap:10px; }
      #um-wrap .um-page-sub    { font-size:12px; color:var(--um-muted); margin-top:3px; }
      #um-wrap .um-header-actions { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }

      /* ── Stat cards ── */
      #um-wrap .um-stats { display:flex; gap:14px; flex-wrap:wrap; }
      #um-wrap .um-stat  { background:var(--um-surface); border:1px solid var(--um-border); border-radius:var(--um-radius); padding:16px 20px; display:flex; align-items:center; gap:14px; flex:1; min-width:130px; box-shadow:var(--um-shadow); }
      #um-wrap .um-stat-icon { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:19px; flex-shrink:0; }
      #um-wrap .um-si-blue   { background:#eff6ff; }
      #um-wrap .um-si-green  { background:#f0fdf4; }
      #um-wrap .um-si-red    { background:#fef2f2; }
      #um-wrap .um-si-indigo { background:#eef2ff; }
      #um-wrap .um-si-amber  { background:#fffbeb; }
      #um-wrap .um-stat-label { font-size:11px; color:var(--um-muted); text-transform:uppercase; letter-spacing:.5px; font-weight:600; }
      #um-wrap .um-stat-value { font-size:24px; font-weight:800; color:var(--um-text); line-height:1; }

      /* ── Toolbar ── */
      #um-wrap .um-toolbar { background:var(--um-surface); border:1px solid var(--um-border); border-radius:var(--um-radius); padding:14px 18px; display:flex; gap:10px; align-items:center; flex-wrap:wrap; box-shadow:var(--um-shadow); }
      #um-wrap .um-search  { flex:1; min-width:180px; border:1px solid var(--um-border); border-radius:9px; padding:9px 14px 9px 36px; font-size:13px; background:var(--um-surface2); color:var(--um-text); outline:none; transition:border .15s; font-family:inherit; }
      #um-wrap .um-search:focus  { border-color:var(--um-red); }
      #um-wrap .um-search-wrap   { position:relative; flex:1; min-width:180px; }
      #um-wrap .um-search-icon   { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--um-muted); font-size:13px; pointer-events:none; }
      #um-wrap .um-filter-select { border:1px solid var(--um-border); border-radius:9px; padding:9px 14px; font-size:13px; background:var(--um-surface2); color:var(--um-text); outline:none; cursor:pointer; font-family:inherit; }
      #um-wrap .um-filter-select:focus { border-color:var(--um-red); }
      #um-wrap .um-results-count { font-size:12px; color:var(--um-muted); margin-left:auto; white-space:nowrap; }

      /* ── Table panel ── */
      #um-wrap .um-panel { background:var(--um-surface); border:1px solid var(--um-border); border-radius:var(--um-radius); overflow:hidden; box-shadow:var(--um-shadow); }
      #um-wrap .um-table { width:100%; border-collapse:collapse; }
      #um-wrap .um-table thead th { padding:11px 16px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:var(--um-muted); background:var(--um-surface2); border-bottom:1px solid var(--um-border); text-align:left; white-space:nowrap; }
      #um-wrap .um-table thead th:last-child { text-align:right; }
      #um-wrap .um-table tbody tr { border-bottom:1px solid var(--um-border); transition:background .12s; }
      #um-wrap .um-table tbody tr:last-child { border-bottom:none; }
      #um-wrap .um-table tbody tr:hover { background:var(--um-surface2); }
      #um-wrap .um-table td { padding:14px 16px; vertical-align:middle; }

      /* ── User cell ── */
      #um-wrap .um-user-cell { display:flex; align-items:center; gap:12px; }
      #um-wrap .um-avatar { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#fff; flex-shrink:0; }
      #um-wrap .um-user-name { font-size:14px; font-weight:700; color:var(--um-text); }
      #um-wrap .um-user-email { font-size:11.5px; color:var(--um-muted); margin-top:1px; }
      #um-wrap .um-user-id   { font-size:10px; color:var(--um-muted); }

      /* ── Badges ── */
      #um-wrap .um-role-badge  { font-size:11px; font-weight:700; border-radius:20px; padding:3px 10px; }
      #um-wrap .um-role-admin      { background:#fee2e2; color:#991b1b; }
      #um-wrap .um-role-pharmacist { background:#ede9fe; color:#5b21b6; }
      #um-wrap .um-role-staff      { background:#dbeafe; color:#1e40af; }
      #um-wrap .um-status-badge { font-size:11px; font-weight:700; border-radius:20px; padding:3px 10px; display:inline-flex; align-items:center; gap:5px; }
      #um-wrap .um-status-active   { background:#d1fae5; color:#065f46; }
      #um-wrap .um-status-inactive { background:#f3f4f6; color:#6b7280; }
      #um-wrap .um-status-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
      #um-wrap .um-dot-green { background:#22c55e; }
      #um-wrap .um-dot-gray  { background:#9ca3af; }

      /* ── Buttons ── */
      #um-wrap .um-btn-primary   { background:var(--um-red); color:#fff; border:none; border-radius:9px; padding:9px 18px; font-size:13px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:7px; transition:background .15s, transform .15s, box-shadow .15s; font-family:inherit; }
      #um-wrap .um-btn-primary:hover { background:var(--um-red-dim); transform:translateY(-1px); box-shadow:0 4px 14px rgba(229,57,53,.3); }
      #um-wrap .um-btn-secondary { background:var(--um-surface); color:var(--um-text); border:1px solid var(--um-border); border-radius:9px; padding:9px 16px; font-size:13px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:7px; transition:all .15s; font-family:inherit; }
      #um-wrap .um-btn-secondary:hover { border-color:var(--um-red); color:var(--um-red); }
      #um-wrap .um-btn-sm        { padding:6px 13px; font-size:12px; border-radius:7px; }
      #um-wrap .um-btn-icon      { width:30px; height:30px; border-radius:7px; border:1px solid var(--um-border); background:var(--um-surface); color:var(--um-muted); display:inline-flex; align-items:center; justify-content:center; cursor:pointer; font-size:13px; transition:all .15s; }
      #um-wrap .um-btn-icon:hover { border-color:var(--um-red); color:var(--um-red); }
      #um-wrap .um-btn-danger    { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:7px; padding:6px 13px; font-size:12px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:6px; transition:all .15s; font-family:inherit; }
      #um-wrap .um-btn-danger:hover { background:#fee2e2; border-color:#dc2626; }

      /* ── Action cell ── */
      #um-wrap .um-actions { display:flex; gap:6px; justify-content:flex-end; }

      /* ── Session bar ── */
      #um-wrap .um-session-wrap { display:flex; flex-direction:column; gap:4px; }
      #um-wrap .um-session-val  { font-size:13px; font-weight:600; color:var(--um-text); }
      #um-wrap .um-session-track { width:80px; height:4px; background:var(--um-border); border-radius:99px; overflow:hidden; }
      #um-wrap .um-session-fill  { height:100%; border-radius:99px; transition:width .3s; }

      /* ── Empty state ── */
      #um-wrap .um-empty { text-align:center; padding:60px 20px; color:var(--um-muted); }
      #um-wrap .um-empty-icon { font-size:40px; margin-bottom:10px; }
      #um-wrap .um-empty p { font-size:14px; }

      /* ── Modal ── */
      .um-modal-backdrop { position:fixed; inset:0; z-index:50; background:rgba(0,0,0,.45); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:20px; }
      .um-modal-panel    { position:relative; background:var(--um-surface,#fff); border:1px solid var(--um-border,#e8eaed); border-radius:20px; width:100%; box-shadow:0 24px 64px rgba(0,0,0,.22); max-height:90vh; overflow-y:auto; animation:umModalIn .2s cubic-bezier(.34,1.56,.64,1); }
      @keyframes umModalIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
      .um-modal-panel::-webkit-scrollbar { width:4px; }
      .um-modal-panel::-webkit-scrollbar-thumb { background:var(--um-border,#e8eaed); border-radius:4px; }

      .um-modal-header { padding:22px 24px 0; display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:20px; }
      .um-modal-title  { font-size:17px; font-weight:800; color:var(--um-text,#111827); }
      .um-modal-sub    { font-size:12px; color:var(--um-muted,#6b7280); margin-top:3px; }
      .um-modal-close  { width:32px; height:32px; border-radius:8px; border:1px solid var(--um-border,#e8eaed); background:var(--um-surface2,#f8f9fb); color:var(--um-muted,#6b7280); cursor:pointer; font-size:15px; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .15s; }
      .um-modal-close:hover { border-color:var(--um-red,#e53935); color:var(--um-red,#e53935); }
      .um-modal-body   { padding:0 24px 22px; }
      .um-modal-footer { padding:16px 24px; border-top:1px solid var(--um-border,#e8eaed); display:flex; justify-content:flex-end; gap:8px; position:sticky; bottom:0; background:var(--um-surface,#fff); }

      /* Modal grid */
      .um-view-grid   { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
      .um-view-full   { grid-column:1/-1; }
      .um-detail-section { display:flex; flex-direction:column; gap:8px; }
      .um-detail-sec-title { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:var(--um-muted,#6b7280); padding-bottom:7px; border-bottom:1px solid var(--um-border,#e8eaed); margin-bottom:2px; }
      .um-detail-row  { display:flex; justify-content:space-between; align-items:center; font-size:13px; gap:12px; padding:4px 0; }
      .um-detail-row > span:first-child { color:var(--um-muted,#6b7280); flex-shrink:0; }
      .um-detail-row > strong { color:var(--um-text,#111827); text-align:right; word-break:break-word; }

      /* Profile header in modal */
      .um-profile-head { display:flex; align-items:center; gap:16px; padding:16px; background:var(--um-surface2,#f8f9fb); border-radius:14px; border:1px solid var(--um-border,#e8eaed); margin-bottom:20px; }
      .um-profile-avatar { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:800; color:#fff; flex-shrink:0; }
      .um-profile-name  { font-size:17px; font-weight:800; color:var(--um-text,#111827); }
      .um-profile-email { font-size:12.5px; color:var(--um-muted,#6b7280); margin-top:2px; }
      .um-profile-meta  { display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }

      /* Activity list */
      .um-activity-list { display:flex; flex-direction:column; gap:8px; }
      .um-activity-item { display:flex; gap:10px; align-items:flex-start; padding:9px 12px; background:var(--um-surface2,#f8f9fb); border-radius:10px; border:1px solid var(--um-border,#e8eaed); }
      .um-activity-dot  { width:8px; height:8px; border-radius:50%; background:var(--um-red,#e53935); flex-shrink:0; margin-top:4px; }
      .um-activity-action { font-size:12.5px; color:var(--um-text,#111827); font-weight:500; }
      .um-activity-time   { font-size:11px; color:var(--um-muted,#6b7280); margin-top:2px; }

      /* History list */
      .um-history-item { display:flex; gap:10px; align-items:flex-start; font-size:12.5px; padding:7px 0; border-bottom:1px solid var(--um-border,#e8eaed); }
      .um-history-item:last-child { border-bottom:none; }
      .um-history-time   { color:var(--um-muted,#6b7280); flex-shrink:0; min-width:130px; }
      .um-history-change { color:var(--um-text,#111827); }

      /* Form */
      .um-form-grid  { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
      .um-form-full  { grid-column:1/-1; }
      .um-form-group { display:flex; flex-direction:column; gap:5px; }
      .um-form-label { font-size:12px; font-weight:700; color:var(--um-muted,#6b7280); }
      .um-form-input, .um-form-select { border:1px solid var(--um-border,#e8eaed); border-radius:9px; padding:10px 13px; font-size:13px; background:var(--um-surface2,#f8f9fb); color:var(--um-text,#111827); outline:none; transition:border .15s; font-family:inherit; width:100%; }
      .um-form-input:focus, .um-form-select:focus { border-color:var(--um-red,#e53935); background:var(--um-surface,#fff); }
      .um-req { color:var(--um-red,#e53935); }

      /* Danger zone */
      .um-danger-zone { background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:16px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
      .um-danger-label { font-size:13px; font-weight:700; color:#991b1b; }
      .um-danger-sub   { font-size:12px; color:#dc2626; margin-top:2px; }

      /* Toast */
      .um-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%) translateY(10px); background:#111827; color:#fff; padding:12px 22px; border-radius:12px; font-size:13.5px; font-weight:600; z-index:300; opacity:0; transition:all .25s; pointer-events:none; display:flex; align-items:center; gap:10px; white-space:nowrap; }
      .um-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }

      @media (max-width:700px) {
        .um-view-grid, .um-form-grid { grid-template-columns:1fr; }
        #um-wrap .um-stats { gap:8px; }
        .um-modal-backdrop { padding:10px; align-items:flex-end; }
        .um-modal-panel { border-radius:20px 20px 0 0; }
      }
    `;
        document.head.appendChild(style);
    }

    /* ─────────────────────────────────────────
       TOAST
    ───────────────────────────────────────── */
    function showToast(msg, icon = '✓') {
        let t = document.getElementById('um-toast');
        if (!t) { t = document.createElement('div'); t.id = 'um-toast'; t.className = 'um-toast'; document.body.appendChild(t); }
        t.innerHTML = `<span style="color:#4ade80">${icon}</span> ${msg}`;
        t.classList.add('show');
        clearTimeout(t._timer);
        t._timer = setTimeout(() => t.classList.remove('show'), 2600);
    }

    /* ─────────────────────────────────────────
       MODAL HELPERS
    ───────────────────────────────────────── */
    function openModal(innerHTML, maxWidth = '580px') {
        closeModal();
        const backdrop = document.createElement('div');
        backdrop.id = 'um-modal-backdrop';
        backdrop.className = 'um-modal-backdrop';
        backdrop.innerHTML = `<div class="um-modal-panel" style="max-width:${maxWidth}">${innerHTML}</div>`;
        document.body.appendChild(backdrop);
        backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
    }

    function closeModal() {
        document.getElementById('um-modal-backdrop')?.remove();
    }

    /* ─────────────────────────────────────────
       STATS
    ───────────────────────────────────────── */
    function buildStats() {
        const total = users.length;
        const active = users.filter(u => u.active).length;
        const inactive = users.length - active;
        const admins = users.filter(u => u.role === 'admin').length;
        const pharma = users.filter(u => u.role === 'pharmacist').length;
        return `
    <div class="um-stats">
      <div class="um-stat"><div class="um-stat-icon um-si-blue">👥</div><div><div class="um-stat-label">Total Users</div><div class="um-stat-value">${total}</div></div></div>
      <div class="um-stat"><div class="um-stat-icon um-si-green">✅</div><div><div class="um-stat-label">Active</div><div class="um-stat-value">${active}</div></div></div>
      <div class="um-stat"><div class="um-stat-icon um-si-amber">💤</div><div><div class="um-stat-label">Inactive</div><div class="um-stat-value">${inactive}</div></div></div>
      <div class="um-stat"><div class="um-stat-icon um-si-red">🔑</div><div><div class="um-stat-label">Admins</div><div class="um-stat-value">${admins}</div></div></div>
      <div class="um-stat"><div class="um-stat-icon um-si-indigo">💊</div><div><div class="um-stat-label">Pharmacists</div><div class="um-stat-value">${pharma}</div></div></div>
    </div>`;
    }

    /* ─────────────────────────────────────────
       TABLE ROW
    ───────────────────────────────────────── */
    function buildRow(u) {
        const rm = ROLE_META[u.role] || { cls: 'um-role-staff', label: u.role };
        const sessionPct = Math.min(100, Math.round((u.sessionMins / 240) * 100));
        const sessionColor = u.sessionMins > 180 ? '#22c55e' : u.sessionMins > 60 ? '#f59e0b' : '#0ea5e9';
        const statusCls = u.active ? 'um-status-active' : 'um-status-inactive';
        const statusDot = u.active ? 'um-dot-green' : 'um-dot-gray';
        const statusLbl = u.active ? 'Active' : 'Inactive';
        return `
    <tr>
      <td>
        <div class="um-user-cell">
          <div class="um-avatar" style="background:${avatarColor(u.role)}">${initials(u.name)}</div>
          <div>
            <div class="um-user-name">${esc(u.name)}</div>
            <div class="um-user-email">${esc(u.email)}</div>
            <div class="um-user-id">ID #${u.id} · ${esc(u.department)}</div>
          </div>
        </div>
      </td>
      <td><span class="um-role-badge ${rm.cls}">${rm.label}</span></td>
      <td>
        <div style="font-size:13px;color:var(--um-text)">${formatDate(u.lastLogin)}</div>
        <div style="font-size:11px;color:var(--um-muted)">${timeAgo(u.lastLogin)}</div>
      </td>
      <td>
        <div class="um-session-wrap">
          <div class="um-session-val">${u.sessionMins}m</div>
          <div class="um-session-track"><div class="um-session-fill" style="width:${sessionPct}%;background:${sessionColor}"></div></div>
        </div>
      </td>
      <td><span class="um-status-badge ${statusCls}"><span class="um-status-dot ${statusDot}"></span>${statusLbl}</span></td>
      <td>
        <div class="um-actions">
          <button class="um-btn-icon users-view" data-id="${u.id}" title="View profile">👁</button>
          <button class="um-btn-icon users-edit" data-id="${u.id}" title="Edit user">✏️</button>
          <button class="um-btn-icon users-reset" data-id="${u.id}" title="Reset password">🔑</button>
          <button class="um-btn-icon users-toggle" data-id="${u.id}" title="${u.active ? 'Deactivate' : 'Activate'}">${u.active ? '🔒' : '🔓'}</button>
        </div>
      </td>
    </tr>`;
    }

    /* ─────────────────────────────────────────
       BUILD TABLE
    ───────────────────────────────────────── */
    function buildTable(filterText = '', filterRole = 'all', filterStatus = 'all') {
        const tbody = document.querySelector('#um-table tbody');
        const info = document.getElementById('um-results-info');
        if (!tbody) return;

        const filtered = users.filter(u => {
            if (filterRole !== 'all' && u.role !== filterRole) return false;
            if (filterStatus === 'active' && !u.active) return false;
            if (filterStatus === 'inactive' && u.active) return false;
            if (filterText) {
                const q = filterText.toLowerCase();
                if (!`${u.name} ${u.email} ${u.role} ${u.department}`.toLowerCase().includes(q)) return false;
            }
            return true;
        });

        tbody.innerHTML = filtered.length
            ? filtered.map(buildRow).join('')
            : `<tr><td colspan="6"><div class="um-empty"><div class="um-empty-icon">🔍</div><p>No users match your filters.</p></div></td></tr>`;

        if (info) info.textContent = `Showing ${filtered.length} of ${users.length} users`;

        // Wire row buttons
        document.querySelectorAll('.users-view').forEach(b => b.addEventListener('click', () => openViewModal(Number(b.dataset.id))));
        document.querySelectorAll('.users-edit').forEach(b => b.addEventListener('click', () => openEditModal(Number(b.dataset.id))));
        document.querySelectorAll('.users-reset').forEach(b => b.addEventListener('click', () => resetPassword(Number(b.dataset.id))));
        document.querySelectorAll('.users-toggle').forEach(b => b.addEventListener('click', () => toggleActive(Number(b.dataset.id))));
    }

    /* ─────────────────────────────────────────
       VIEW MODAL
    ───────────────────────────────────────── */
    function openViewModal(id) {
        const u = users.find(x => x.id === id); if (!u) return;
        const rm = ROLE_META[u.role] || { cls: 'um-role-staff', label: u.role };
        const inactiveMins = computeInactiveMins(u);
        const totalActions = (u.activities || []).length;

        openModal(`
      <div class="um-modal-header">
        <div><div class="um-modal-title">User Profile</div><div class="um-modal-sub">Full details · ${esc(u.name)}</div></div>
        <button class="um-modal-close" onclick="document.getElementById('um-modal-backdrop').remove()">✕</button>
      </div>
      <div class="um-modal-body">
        <div class="um-profile-head">
          <div class="um-profile-avatar" style="background:${avatarColor(u.role)}">${initials(u.name)}</div>
          <div>
            <div class="um-profile-name">${esc(u.name)}</div>
            <div class="um-profile-email">${esc(u.email)}</div>
            <div class="um-profile-meta">
              <span class="um-role-badge ${rm.cls}">${rm.label}</span>
              <span class="um-status-badge ${u.active ? 'um-status-active' : 'um-status-inactive'}">
                <span class="um-status-dot ${u.active ? 'um-dot-green' : 'um-dot-gray'}"></span>${u.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div class="um-view-grid">
          <div class="um-detail-section">
            <div class="um-detail-sec-title">Account Info</div>
            <div class="um-detail-row"><span>User ID</span><strong>#${u.id}</strong></div>
            <div class="um-detail-row"><span>Department</span><strong>${esc(u.department)}</strong></div>
            <div class="um-detail-row"><span>Phone</span><strong>${esc(u.phone)}</strong></div>
            <div class="um-detail-row"><span>Joined</span><strong>${formatDate(u.joined + 'T00:00:00')}</strong></div>
            <div class="um-detail-row"><span>Total Logins</span><strong>${u.loginCount}</strong></div>
            <div class="um-detail-row"><span>Actions Today</span><strong>${u.actionsToday}</strong></div>
          </div>
          <div class="um-detail-section">
            <div class="um-detail-sec-title">Session Info</div>
            <div class="um-detail-row"><span>Last Login</span><strong>${formatDate(u.lastLogin)}</strong></div>
            <div class="um-detail-row"><span>Last Active</span><strong>${timeAgo(u.lastActive || u.lastLogin)}</strong></div>
            <div class="um-detail-row"><span>Session Length</span><strong>${u.sessionMins} minutes</strong></div>
            <div class="um-detail-row"><span>Inactive For</span><strong>${inactiveMins} minutes</strong></div>
            <div class="um-detail-row"><span>Log Entries</span><strong>${totalActions}</strong></div>
          </div>

          <div class="um-detail-section um-view-full">
            <div class="um-detail-sec-title">Recent Activity</div>
            <div class="um-activity-list">
              ${(u.activities || []).slice(0, 6).map(a => `
                <div class="um-activity-item">
                  <div class="um-activity-dot"></div>
                  <div>
                    <div class="um-activity-action">${esc(a.action)}</div>
                    <div class="um-activity-time">${formatDate(a.time)}</div>
                  </div>
                </div>`).join('')}
            </div>
          </div>

          <div class="um-detail-section um-view-full">
            <div class="um-detail-sec-title">Account History</div>
            ${(u.history || []).slice().reverse().map(h => `
              <div class="um-history-item">
                <span class="um-history-time">${formatDate(h.time)}</span>
                <span class="um-history-change">${esc(h.change)}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="um-modal-footer">
        <button class="um-btn-secondary" onclick="document.getElementById('um-modal-backdrop').remove()">Close</button>
        <button class="um-btn-primary" onclick="document.getElementById('um-modal-backdrop').remove(); openEditFromView(${u.id})">Edit User</button>
      </div>
    `, '640px');
    }

    window.openEditFromView = function (id) { openEditModal(id); };

    /* ─────────────────────────────────────────
       EDIT MODAL
    ───────────────────────────────────────── */
    function openEditModal(id) {
        const u = users.find(x => x.id === id); if (!u) return;
        openModal(`
      <div class="um-modal-header">
        <div><div class="um-modal-title">Edit User</div><div class="um-modal-sub">Modify account details · #${u.id}</div></div>
        <button class="um-modal-close" onclick="document.getElementById('um-modal-backdrop').remove()">✕</button>
      </div>
      <div class="um-modal-body">
        <div class="um-form-grid">
          <div class="um-form-group">
            <label class="um-form-label">Full Name <span class="um-req">*</span></label>
            <input id="ue-name" class="um-form-input" value="${esc(u.name)}" />
          </div>
          <div class="um-form-group">
            <label class="um-form-label">Email <span class="um-req">*</span></label>
            <input id="ue-email" class="um-form-input" value="${esc(u.email)}" />
          </div>
          <div class="um-form-group">
            <label class="um-form-label">Phone</label>
            <input id="ue-phone" class="um-form-input" value="${esc(u.phone)}" />
          </div>
          <div class="um-form-group">
            <label class="um-form-label">Department</label>
            <input id="ue-dept" class="um-form-input" value="${esc(u.department)}" />
          </div>
          <div class="um-form-group">
            <label class="um-form-label">Role <span class="um-req">*</span></label>
            <select id="ue-role" class="um-form-select">
              <option value="pharmacist" ${u.role === 'pharmacist' ? 'selected' : ''}>Pharmacist</option>
              <option value="staff"      ${u.role === 'staff' ? 'selected' : ''}>Staff</option>
              <option value="admin"      ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
            </select>
          </div>
          <div class="um-form-group">
            <label class="um-form-label">Account Status</label>
            <select id="ue-status" class="um-form-select">
              <option value="1" ${u.active ? 'selected' : ''}>Active</option>
              <option value="0" ${!u.active ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
        </div>
        <div style="margin-top:20px">
          <div class="um-danger-zone">
            <div>
              <div class="um-danger-label">⚠ Danger Zone</div>
              <div class="um-danger-sub">Permanently delete this user's account. This cannot be undone.</div>
            </div>
            <button class="um-btn-danger" id="ue-delete">Delete Account</button>
          </div>
        </div>
      </div>
      <div class="um-modal-footer">
        <button class="um-btn-secondary" onclick="document.getElementById('um-modal-backdrop').remove()">Cancel</button>
        <button class="um-btn-primary" id="ue-save">💾 Save Changes</button>
      </div>
    `, '580px');

        document.getElementById('ue-save').addEventListener('click', () => {
            const name = document.getElementById('ue-name').value.trim();
            const email = document.getElementById('ue-email').value.trim();
            if (!name || !email) { showToast('Name and email are required.', '⚠'); return; }
            const prevRole = u.role;
            u.name = name;
            u.email = email;
            u.phone = document.getElementById('ue-phone').value.trim() || u.phone;
            u.department = document.getElementById('ue-dept').value.trim() || u.department;
            u.role = document.getElementById('ue-role').value;
            u.active = document.getElementById('ue-status').value === '1';
            u.history.push({ time: new Date().toISOString(), change: `Updated by admin${prevRole !== u.role ? ` · role changed: ${prevRole} → ${u.role}` : ''}` });
            closeModal();
            buildTable(currentSearch(), currentRole(), currentStatus());
            showToast(`${name} updated successfully`);
        });

        document.getElementById('ue-delete').addEventListener('click', () => {
            if (!confirm(`Are you sure you want to permanently delete ${u.name}? This cannot be undone.`)) return;
            const idx = users.findIndex(x => x.id === id);
            if (idx !== -1) users.splice(idx, 1);
            closeModal();
            buildTable(currentSearch(), currentRole(), currentStatus());
            render(); // re-render stats
            showToast(`${u.name} deleted`, '🗑');
        });
    }

    /* ─────────────────────────────────────────
       ADD USER MODAL
    ───────────────────────────────────────── */
    function openAddModal() {
        openModal(`
      <div class="um-modal-header">
        <div><div class="um-modal-title">Add New User</div><div class="um-modal-sub">Create a new pharmacy system account</div></div>
        <button class="um-modal-close" onclick="document.getElementById('um-modal-backdrop').remove()">✕</button>
      </div>
      <div class="um-modal-body">
        <div class="um-form-grid">
          <div class="um-form-group">
            <label class="um-form-label">Full Name <span class="um-req">*</span></label>
            <input id="na-name" class="um-form-input" placeholder="e.g. Maria Cruz" />
          </div>
          <div class="um-form-group">
            <label class="um-form-label">Email <span class="um-req">*</span></label>
            <input id="na-email" class="um-form-input" placeholder="e.g. maria@rsmedstar.ph" />
          </div>
          <div class="um-form-group">
            <label class="um-form-label">Phone</label>
            <input id="na-phone" class="um-form-input" placeholder="+63 9XX XXX XXXX" />
          </div>
          <div class="um-form-group">
            <label class="um-form-label">Department</label>
            <input id="na-dept" class="um-form-input" placeholder="e.g. Dispensary" />
          </div>
          <div class="um-form-group">
            <label class="um-form-label">Role <span class="um-req">*</span></label>
            <select id="na-role" class="um-form-select">
              <option value="staff">Staff</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="um-form-group">
            <label class="um-form-label">Joined Date</label>
            <input id="na-joined" type="date" class="um-form-input" value="${new Date().toISOString().slice(0, 10)}" />
          </div>
        </div>
        <div style="margin-top:14px;padding:12px 14px;background:var(--um-surface2,#f8f9fb);border-radius:10px;font-size:12.5px;color:var(--um-muted,#6b7280);border:1px solid var(--um-border,#e8eaed)">
          🔑 A temporary password will be auto-generated and must be changed on first login.
        </div>
      </div>
      <div class="um-modal-footer">
        <button class="um-btn-secondary" onclick="document.getElementById('um-modal-backdrop').remove()">Cancel</button>
        <button class="um-btn-primary" id="na-save">➕ Create User</button>
      </div>
    `, '580px');

        document.getElementById('na-save').addEventListener('click', () => {
            const name = document.getElementById('na-name').value.trim();
            const email = document.getElementById('na-email').value.trim();
            if (!name || !email) { showToast('Name and email are required.', '⚠'); return; }
            const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
            users.unshift({
                id: newId, name, email,
                role: document.getElementById('na-role').value,
                department: document.getElementById('na-dept').value || 'General',
                phone: document.getElementById('na-phone').value || '—',
                joined: document.getElementById('na-joined').value || new Date().toISOString().slice(0, 10),
                lastLogin: new Date().toISOString(),
                sessionMins: 0, active: true,
                lastActive: new Date().toISOString(),
                loginCount: 0, actionsToday: 0,
                activities: [{ time: new Date().toISOString(), action: 'Account created by admin' }],
                history: [{ time: new Date().toISOString(), change: 'Account created by admin' }]
            });
            closeModal();
            render();
            showToast(`${name} added successfully`);
        });
    }

    /* ─────────────────────────────────────────
       RESET PASSWORD
    ───────────────────────────────────────── */
    function resetPassword(id) {
        const u = users.find(x => x.id === id); if (!u) return;
        openModal(`
      <div class="um-modal-header">
        <div><div class="um-modal-title">Reset Password</div><div class="um-modal-sub">${esc(u.name)} · #${u.id}</div></div>
        <button class="um-modal-close" onclick="document.getElementById('um-modal-backdrop').remove()">✕</button>
      </div>
      <div class="um-modal-body">
        <div style="padding:16px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;font-size:13.5px;color:#92400e;margin-bottom:16px">
          ⚠️ This will immediately invalidate the user's current password. They will receive an email with reset instructions.
        </div>
        <div class="um-form-group" style="margin-bottom:12px">
          <label class="um-form-label">Send reset to</label>
          <input class="um-form-input" value="${esc(u.email)}" readonly style="background:var(--um-surface2,#f8f9fb);opacity:.7" />
        </div>
        <div class="um-form-group">
          <label class="um-form-label">Reason (optional)</label>
          <input id="rp-reason" class="um-form-input" placeholder="e.g. User requested reset" />
        </div>
      </div>
      <div class="um-modal-footer">
        <button class="um-btn-secondary" onclick="document.getElementById('um-modal-backdrop').remove()">Cancel</button>
        <button class="um-btn-primary" id="rp-confirm" style="background:#d97706">🔑 Reset Password</button>
      </div>
    `, '460px');

        document.getElementById('rp-confirm').addEventListener('click', () => {
            const reason = document.getElementById('rp-reason').value.trim();
            u.history.push({ time: new Date().toISOString(), change: `Password reset by admin${reason ? ' · ' + reason : ''}` });
            closeModal();
            buildTable(currentSearch(), currentRole(), currentStatus());
            showToast(`Password reset for ${u.name}`, '🔑');
        });
    }

    /* ─────────────────────────────────────────
       TOGGLE ACTIVE
    ───────────────────────────────────────── */
    function toggleActive(id) {
        const u = users.find(x => x.id === id); if (!u) return;
        u.active = !u.active;
        u.history.push({ time: new Date().toISOString(), change: `Account ${u.active ? 'activated' : 'deactivated'} by admin` });
        buildTable(currentSearch(), currentRole(), currentStatus());
        showToast(`${u.name} ${u.active ? 'activated' : 'deactivated'}`, u.active ? '✅' : '🔒');
    }

    /* ─────────────────────────────────────────
       EXPORT CSV
    ───────────────────────────────────────── */
    function exportCSV() {
        const rows = [['ID', 'Name', 'Email', 'Role', 'Department', 'Phone', 'Joined', 'Last Login', 'Session (min)', 'Login Count', 'Active']];
        users.forEach(u => rows.push([u.id, u.name, u.email, u.role, u.department, u.phone, u.joined, u.lastLogin, u.sessionMins, u.loginCount, u.active]));
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const a = Object.assign(document.createElement('a'), {
            href: 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv),
            download: `users_${new Date().toISOString().slice(0, 10)}.csv`
        });
        a.click();
        showToast('CSV exported', '⬇');
    }

    /* ─────────────────────────────────────────
       FILTER STATE HELPERS
    ───────────────────────────────────────── */
    function currentSearch() { return document.getElementById('um-search')?.value || ''; }
    function currentRole() { return document.getElementById('um-filter-role')?.value || 'all'; }
    function currentStatus() { return document.getElementById('um-filter-status')?.value || 'all'; }

    /* ─────────────────────────────────────────
       RENDER
    ───────────────────────────────────────── */
    function render() {
        const role = getRole();
        const container = document.getElementById('role-dashboard');
        if (!container) return;

        if (!role.includes('admin')) {
            container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;gap:12px;color:var(--um-muted,#6b7280)">
          <div style="font-size:40px">🔒</div>
          <div style="font-size:15px;font-weight:700">Access Restricted</div>
          <div style="font-size:13px">User Management is visible to admins only.</div>
        </div>`;
            return;
        }

        container.innerHTML = `
      <div id="um-wrap">
        <div class="um-page-header">
          <div>
            <div class="um-page-title">👥 User Management</div>
            <div class="um-page-sub">Manage system accounts, roles, sessions, and access control</div>
          </div>
          <div class="um-header-actions">
            <button id="um-add-btn"    class="um-btn-primary">➕ Add User</button>
            <button id="um-export-btn" class="um-btn-secondary">⬇ Export CSV</button>
            <button id="um-refresh-btn" class="um-btn-secondary">↺ Refresh</button>
          </div>
        </div>

        ${buildStats()}

        <div class="um-toolbar">
          <div class="um-search-wrap">
            <span class="um-search-icon">🔍</span>
            <input id="um-search" class="um-search" placeholder="Search by name, email, or department…" />
          </div>
          <select id="um-filter-role" class="um-filter-select">
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="pharmacist">Pharmacist</option>
            <option value="staff">Staff</option>
          </select>
          <select id="um-filter-status" class="um-filter-select">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div class="um-results-count" id="um-results-info">Showing ${users.length} users</div>
        </div>

        <div class="um-panel">
          <table class="um-table" id="um-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Session</th>
                <th>Status</th>
                <th style="text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    `;

        buildTable();

        document.getElementById('um-add-btn').addEventListener('click', openAddModal);
        document.getElementById('um-export-btn').addEventListener('click', exportCSV);
        document.getElementById('um-refresh-btn').addEventListener('click', () => {
            buildTable(currentSearch(), currentRole(), currentStatus());
            showToast('Refreshed', '↺');
        });
        document.getElementById('um-search').addEventListener('input', () => buildTable(currentSearch(), currentRole(), currentStatus()));
        document.getElementById('um-filter-role').addEventListener('change', () => buildTable(currentSearch(), currentRole(), currentStatus()));
        document.getElementById('um-filter-status').addEventListener('change', () => buildTable(currentSearch(), currentRole(), currentStatus()));
    }

    /* ─────────────────────────────────────────
       WIRE NAV
    ───────────────────────────────────────── */
    function wire() {
        const nav = document.getElementById('nav-users');
        if (!nav) return;
        nav.addEventListener('click', e => {
            e.preventDefault();
            if (window.setActiveSidebar) window.setActiveSidebar('nav-users');
            render();
        });
    }

    document.addEventListener('DOMContentLoaded', wire);
})();