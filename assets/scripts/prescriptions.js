(function () {

  /* ═══════════════════════════════════════
     DATA
  ═══════════════════════════════════════ */
  const medsInventory = [
    { sku: 'AMX-500', name: 'Amoxicillin 500mg',  category: 'Antibiotic',    manufacturer: 'PharmaCorp', mfg: '2025-01-01', exp: '2027-01-01', price: 120,  stock: 24,  reorderLevel: 10, controlled: false },
    { sku: 'IBU-200', name: 'Ibuprofen 200mg',    category: 'NSAID',         manufacturer: 'Healix',     mfg: '2024-05-10', exp: '2026-05-10', price: 45,   stock: 120, reorderLevel: 30, controlled: false },
    { sku: 'INS-1',   name: 'Insulin 100IU/mL',   category: 'Antidiabetic',  manufacturer: 'GlucoLabs',  mfg: '2024-11-01', exp: '2026-11-01', price: 850,  stock: 8,   reorderLevel: 15, controlled: false },
    { sku: 'MOR-10',  name: 'Morphine 10mg Tabs',  category: 'Opioid',       manufacturer: 'MedPharm',   mfg: '2025-03-01', exp: '2027-03-01', price: 320,  stock: 5,   reorderLevel: 10, controlled: true  },
    { sku: 'MET-500', name: 'Metformin 500mg',     category: 'Antidiabetic', manufacturer: 'DiabeCare',  mfg: '2024-12-01', exp: '2026-08-15', price: 35,   stock: 60,  reorderLevel: 20, controlled: false }
  ];

  const prescriptions = [
    {
      id: 'RX-101', patientName: 'Maria Lopez', patientId: 'PT-201', patientAge: 34, patientContact: '+63 912 111 2222',
      type: 'rx', meds: [{ sku: 'AMX-500', qty: 2, sig: 'Take 1 capsule every 8 hours for 7 days', refills: 0 }],
      issuedDate: '2026-04-30T10:00:00Z', doctor: 'Dr. Jose Ramos', doctorLicense: 'MD-98765',
      clinic: 'Ramos Family Clinic', diagnosis: 'Bacterial tonsillitis',
      status: 'issued', pharmacist: '', requiredYellowPad: false, source: 'order-online',
      notes: 'Patient has penicillin tolerance; no known allergies.',
      history: [{ time: '2026-04-30T10:00:00Z', change: 'Prescription created' }]
    },
    {
      id: 'RX-102', patientName: 'Carlos Diaz', patientId: 'PT-202', patientAge: 58, patientContact: '+63 917 555 6666',
      type: 'rx', meds: [{ sku: 'INS-1', qty: 1, sig: 'Inject 10 units subcutaneously before meals', refills: 2 }],
      issuedDate: '2026-04-28T09:30:00Z', doctor: 'Dr. Ana Cruz', doctorLicense: 'MD-12345',
      clinic: 'QC Diabetes Center', diagnosis: 'Type 2 Diabetes Mellitus',
      status: 'fulfilled', pharmacist: 'Ana Santos', fulfilledAt: '2026-04-29T11:00:00Z',
      requiredYellowPad: false, source: 'reserve',
      notes: 'Patient requires cold-chain storage reminder.',
      history: [
        { time: '2026-04-28T09:30:00Z', change: 'Prescription created' },
        { time: '2026-04-29T11:00:00Z', change: 'Fulfilled by Ana Santos' }
      ]
    },
    {
      id: 'RX-103', patientName: 'Linda Reyes', patientId: 'PT-203', patientAge: 72, patientContact: '+63 920 333 4444',
      type: 'rx', meds: [
        { sku: 'MOR-10', qty: 1, sig: 'Take 1 tablet every 4-6 hours as needed for pain. Max 4 per day.', refills: 0 },
        { sku: 'MET-500', qty: 2, sig: 'Take 1 tablet twice daily with meals', refills: 3 }
      ],
      issuedDate: '2026-05-01T14:00:00Z', doctor: 'Dr. Marco Villanueva', doctorLicense: 'MD-44321',
      clinic: 'St. Luke\'s Pain Management', diagnosis: 'Chronic Pain Syndrome; T2DM',
      status: 'issued', pharmacist: '', requiredYellowPad: true, source: 'walk-in',
      notes: 'Yellow pad prescription required. Controlled substance — verify patient ID before dispensing.',
      history: [{ time: '2026-05-01T14:00:00Z', change: 'Prescription created' }]
    },
    {
      id: 'RX-104', patientName: 'James Santos', patientId: 'PT-204', patientAge: 29, patientContact: '+63 916 777 8888',
      type: 'rx', meds: [{ sku: 'IBU-200', qty: 3, sig: 'Take 2 tablets every 6 hours after meals', refills: 1 }],
      issuedDate: '2026-05-03T08:00:00Z', doctor: 'Dr. Sofia Tan', doctorLicense: 'MD-77654',
      clinic: 'Wellness Hub Clinic', diagnosis: 'Acute lower back pain',
      status: 'cancelled', pharmacist: '', requiredYellowPad: false, source: 'order-online',
      notes: 'Patient cancelled order.',
      history: [
        { time: '2026-05-03T08:00:00Z', change: 'Prescription created' },
        { time: '2026-05-03T09:30:00Z', change: 'Cancelled by patient request' }
      ]
    }
  ];

  /* ═══════════════════════════════════════
     HELPERS
  ═══════════════════════════════════════ */
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

  function daysUntilExpiry(dateStr) {
    return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const STATUS_META = {
    issued:    { cls: 'rx-status-issued',    label: 'Issued',    dot: 'rx-dot-blue'   },
    fulfilled: { cls: 'rx-status-fulfilled', label: 'Fulfilled', dot: 'rx-dot-green'  },
    cancelled: { cls: 'rx-status-cancelled', label: 'Cancelled', dot: 'rx-dot-gray'   },
    pending:   { cls: 'rx-status-pending',   label: 'Pending',   dot: 'rx-dot-amber'  }
  };

  const SOURCE_META = {
    'order-online': { icon: '🌐', label: 'Online Order' },
    'reserve':      { icon: '📅', label: 'Reservation'  },
    'walk-in':      { icon: '🚶', label: 'Walk-in'      }
  };

  /* ═══════════════════════════════════════
     INJECT STYLES (once)
  ═══════════════════════════════════════ */
  if (!document.getElementById('rx-styles')) {
    const s = document.createElement('style');
    s.id = 'rx-styles';
    s.textContent = `
      #role-dashboard {
        --rx-red:      #e53935;
        --rx-red-dim:  #b71c1c;
        --rx-red-soft: rgba(229,57,53,.1);
        --rx-surface:  #ffffff;
        --rx-surface2: #f8f9fb;
        --rx-border:   #e8eaed;
        --rx-text:     #111827;
        --rx-muted:    #6b7280;
        --rx-radius:   14px;
        --rx-shadow:   0 2px 16px rgba(0,0,0,.07);
      }
      html.dark #role-dashboard {
        --rx-surface:  #161618;
        --rx-surface2: #1d1d20;
        --rx-border:   #2a2a32;
        --rx-text:     #f0f0f4;
        --rx-muted:    #9ca3af;
        --rx-shadow:   0 2px 16px rgba(0,0,0,.35);
      }

      /* wrap */
      #rx-wrap { display:flex; flex-direction:column; gap:22px; }

      /* page header */
      #rx-wrap .rx-page-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; }
      #rx-wrap .rx-page-title  { font-size:19px; font-weight:800; color:var(--rx-text); display:flex; align-items:center; gap:10px; }
      #rx-wrap .rx-page-sub    { font-size:12px; color:var(--rx-muted); margin-top:3px; }
      #rx-wrap .rx-header-actions { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }

      /* stats */
      #rx-wrap .rx-stats { display:flex; gap:14px; flex-wrap:wrap; }
      #rx-wrap .rx-stat  { background:var(--rx-surface); border:1px solid var(--rx-border); border-radius:var(--rx-radius); padding:16px 20px; display:flex; align-items:center; gap:14px; flex:1; min-width:130px; box-shadow:var(--rx-shadow); }
      #rx-wrap .rx-stat-icon { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:19px; flex-shrink:0; }
      #rx-wrap .rx-si-blue   { background:#eff6ff; }
      #rx-wrap .rx-si-green  { background:#f0fdf4; }
      #rx-wrap .rx-si-amber  { background:#fffbeb; }
      #rx-wrap .rx-si-red    { background:#fef2f2; }
      #rx-wrap .rx-si-purple { background:#f5f3ff; }
      #rx-wrap .rx-stat-label { font-size:11px; color:var(--rx-muted); text-transform:uppercase; letter-spacing:.5px; font-weight:600; }
      #rx-wrap .rx-stat-value { font-size:24px; font-weight:800; color:var(--rx-text); line-height:1; }

      /* toolbar */
      #rx-wrap .rx-toolbar { background:var(--rx-surface); border:1px solid var(--rx-border); border-radius:var(--rx-radius); padding:14px 18px; display:flex; gap:10px; align-items:center; flex-wrap:wrap; box-shadow:var(--rx-shadow); }
      #rx-wrap .rx-search-wrap   { position:relative; flex:1; min-width:180px; }
      #rx-wrap .rx-search-icon   { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--rx-muted); font-size:13px; pointer-events:none; }
      #rx-wrap .rx-search        { width:100%; border:1px solid var(--rx-border); border-radius:9px; padding:9px 14px 9px 36px; font-size:13px; background:var(--rx-surface2); color:var(--rx-text); outline:none; transition:border .15s; font-family:inherit; }
      #rx-wrap .rx-search:focus  { border-color:var(--rx-red); }
      #rx-wrap .rx-filter-select { border:1px solid var(--rx-border); border-radius:9px; padding:9px 14px; font-size:13px; background:var(--rx-surface2); color:var(--rx-text); outline:none; cursor:pointer; font-family:inherit; transition:border .15s; }
      #rx-wrap .rx-filter-select:focus { border-color:var(--rx-red); }
      #rx-wrap .rx-results-count { font-size:12px; color:var(--rx-muted); margin-left:auto; white-space:nowrap; }

      /* tabs */
      #rx-wrap .rx-tabs { display:flex; gap:4px; border-bottom:1px solid var(--rx-border); margin-bottom:0; }
      #rx-wrap .rx-tab  { padding:10px 18px; font-size:13px; font-weight:600; color:var(--rx-muted); cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-1px; transition:all .15s; background:none; border-top:none; border-left:none; border-right:none; font-family:inherit; }
      #rx-wrap .rx-tab:hover  { color:var(--rx-text); }
      #rx-wrap .rx-tab.active { color:var(--rx-red); border-bottom-color:var(--rx-red); }

      /* panel */
      #rx-wrap .rx-panel { background:var(--rx-surface); border:1px solid var(--rx-border); border-radius:var(--rx-radius); overflow:hidden; box-shadow:var(--rx-shadow); }
      #rx-wrap .rx-panel-tabs { border-radius:var(--rx-radius) var(--rx-radius) 0 0; overflow:hidden; }

      /* prescription cards */
      #rx-wrap .rx-card { border-bottom:1px solid var(--rx-border); padding:16px 20px; display:flex; align-items:flex-start; gap:16px; transition:background .12s; }
      #rx-wrap .rx-card:last-child { border-bottom:none; }
      #rx-wrap .rx-card:hover { background:var(--rx-surface2); }
      #rx-wrap .rx-card-left { flex:1; min-width:0; display:flex; flex-direction:column; gap:8px; }
      #rx-wrap .rx-card-top  { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
      #rx-wrap .rx-card-id   { font-size:15px; font-weight:800; color:var(--rx-text); }
      #rx-wrap .rx-card-meta { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
      #rx-wrap .rx-meta-item { font-size:12px; color:var(--rx-muted); display:flex; align-items:center; gap:5px; }
      #rx-wrap .rx-card-meds { display:flex; gap:8px; flex-wrap:wrap; }
      #rx-wrap .rx-med-chip  { background:var(--rx-surface2); border:1px solid var(--rx-border); border-radius:8px; padding:5px 10px; font-size:12px; font-weight:500; display:flex; align-items:center; gap:6px; }
      #rx-wrap .rx-med-chip.controlled { border-color:#fecaca; background:#fef2f2; color:#991b1b; }
      #rx-wrap .rx-card-note { font-size:12px; color:var(--rx-muted); font-style:italic; padding:6px 10px; background:var(--rx-surface2); border-left:3px solid var(--rx-border); border-radius:0 8px 8px 0; }
      #rx-wrap .rx-card-right { display:flex; flex-direction:column; gap:6px; align-items:flex-end; flex-shrink:0; }

      /* badges */
      #rx-wrap .rx-status-badge { font-size:11px; font-weight:700; border-radius:20px; padding:3px 10px; display:inline-flex; align-items:center; gap:5px; }
      #rx-wrap .rx-status-issued    { background:#dbeafe; color:#1e40af; }
      #rx-wrap .rx-status-fulfilled { background:#d1fae5; color:#065f46; }
      #rx-wrap .rx-status-cancelled { background:#f3f4f6; color:#6b7280; }
      #rx-wrap .rx-status-pending   { background:#fef3c7; color:#92400e; }
      #rx-wrap .rx-status-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
      #rx-wrap .rx-dot-blue   { background:#3b82f6; }
      #rx-wrap .rx-dot-green  { background:#22c55e; }
      #rx-wrap .rx-dot-gray   { background:#9ca3af; }
      #rx-wrap .rx-dot-amber  { background:#f59e0b; }
      #rx-wrap .rx-yp-badge   { background:#fef3c7; color:#92400e; border:1px solid #fde68a; font-size:11px; font-weight:700; border-radius:20px; padding:3px 10px; }
      #rx-wrap .rx-ctrl-badge { background:#fee2e2; color:#991b1b; border:1px solid #fecaca; font-size:11px; font-weight:700; border-radius:20px; padding:3px 10px; }
      #rx-wrap .rx-source-badge { background:var(--rx-surface2); border:1px solid var(--rx-border); color:var(--rx-muted); font-size:11px; font-weight:600; border-radius:20px; padding:3px 10px; }

      /* inventory table */
      #rx-wrap .rx-inv-table { width:100%; border-collapse:collapse; }
      #rx-wrap .rx-inv-table thead th { padding:11px 16px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:var(--rx-muted); background:var(--rx-surface2); border-bottom:1px solid var(--rx-border); text-align:left; }
      #rx-wrap .rx-inv-table tbody tr { border-bottom:1px solid var(--rx-border); transition:background .12s; }
      #rx-wrap .rx-inv-table tbody tr:last-child { border-bottom:none; }
      #rx-wrap .rx-inv-table tbody tr:hover { background:var(--rx-surface2); }
      #rx-wrap .rx-inv-table td { padding:13px 16px; font-size:13px; vertical-align:middle; }
      #rx-wrap .rx-stock-track { width:64px; height:5px; background:var(--rx-border); border-radius:99px; overflow:hidden; display:inline-block; }
      #rx-wrap .rx-stock-fill  { height:100%; border-radius:99px; }

      /* buttons */
      #rx-wrap .rx-btn-primary   { background:var(--rx-red); color:#fff; border:none; border-radius:9px; padding:9px 18px; font-size:13px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:7px; transition:all .15s; font-family:inherit; }
      #rx-wrap .rx-btn-primary:hover { background:var(--rx-red-dim); transform:translateY(-1px); box-shadow:0 4px 14px rgba(229,57,53,.3); }
      #rx-wrap .rx-btn-secondary { background:var(--rx-surface); color:var(--rx-text); border:1px solid var(--rx-border); border-radius:9px; padding:9px 16px; font-size:13px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:7px; transition:all .15s; font-family:inherit; }
      #rx-wrap .rx-btn-secondary:hover { border-color:var(--rx-red); color:var(--rx-red); }
      #rx-wrap .rx-btn-sm        { padding:6px 13px; font-size:12px; border-radius:7px; }
      #rx-wrap .rx-btn-green     { background:#16a34a; color:#fff; border:none; border-radius:7px; padding:6px 13px; font-size:12px; font-weight:600; cursor:pointer; transition:all .15s; font-family:inherit; }
      #rx-wrap .rx-btn-green:hover { background:#15803d; }
      #rx-wrap .rx-btn-icon      { width:30px; height:30px; border-radius:7px; border:1px solid var(--rx-border); background:var(--rx-surface); color:var(--rx-muted); display:inline-flex; align-items:center; justify-content:center; cursor:pointer; font-size:13px; transition:all .15s; }
      #rx-wrap .rx-btn-icon:hover { border-color:var(--rx-red); color:var(--rx-red); }

      /* empty */
      #rx-wrap .rx-empty { text-align:center; padding:56px 20px; color:var(--rx-muted); }
      #rx-wrap .rx-empty-icon { font-size:38px; margin-bottom:10px; }

      /* ── Modal ── */
      .rx-modal-backdrop { position:fixed; inset:0; z-index:50; background:rgba(0,0,0,.45); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:20px; }
      .rx-modal-panel    { position:relative; background:var(--rx-surface,#fff); border:1px solid var(--rx-border,#e8eaed); border-radius:20px; width:100%; box-shadow:0 24px 64px rgba(0,0,0,.22); max-height:90vh; overflow-y:auto; animation:rxModalIn .2s cubic-bezier(.34,1.56,.64,1); }
      @keyframes rxModalIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
      .rx-modal-panel::-webkit-scrollbar { width:4px; }
      .rx-modal-panel::-webkit-scrollbar-thumb { background:var(--rx-border,#e8eaed); border-radius:4px; }
      .rx-modal-header { padding:22px 24px 0; display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:20px; }
      .rx-modal-title  { font-size:17px; font-weight:800; color:var(--rx-text,#111827); }
      .rx-modal-sub    { font-size:12px; color:var(--rx-muted,#6b7280); margin-top:3px; }
      .rx-modal-close  { width:32px; height:32px; border-radius:8px; border:1px solid var(--rx-border,#e8eaed); background:var(--rx-surface2,#f8f9fb); color:var(--rx-muted,#6b7280); cursor:pointer; font-size:15px; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .15s; }
      .rx-modal-close:hover { border-color:var(--rx-red,#e53935); color:var(--rx-red,#e53935); }
      .rx-modal-body   { padding:0 24px 22px; }
      .rx-modal-footer { padding:16px 24px; border-top:1px solid var(--rx-border,#e8eaed); display:flex; justify-content:flex-end; gap:8px; position:sticky; bottom:0; background:var(--rx-surface,#fff); }

      /* modal internals */
      .rx-modal-hero { background:var(--rx-surface2,#f8f9fb); border:1px solid var(--rx-border,#e8eaed); border-radius:14px; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:20px; }
      .rx-modal-hero-id { font-size:20px; font-weight:900; color:var(--rx-text,#111827); }
      .rx-modal-hero-badges { display:flex; gap:8px; flex-wrap:wrap; }
      .rx-view-grid   { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
      .rx-view-full   { grid-column:1/-1; }
      .rx-detail-section { display:flex; flex-direction:column; gap:8px; }
      .rx-detail-sec-title { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:var(--rx-muted,#6b7280); padding-bottom:7px; border-bottom:1px solid var(--rx-border,#e8eaed); margin-bottom:2px; }
      .rx-detail-row  { display:flex; justify-content:space-between; align-items:flex-start; font-size:13px; gap:12px; padding:3px 0; }
      .rx-detail-row > span:first-child { color:var(--rx-muted,#6b7280); flex-shrink:0; }
      .rx-detail-row > strong { color:var(--rx-text,#111827); text-align:right; word-break:break-word; }
      .rx-med-detail-card { background:var(--rx-surface2,#f8f9fb); border:1px solid var(--rx-border,#e8eaed); border-radius:12px; padding:14px 16px; display:flex; flex-direction:column; gap:6px; }
      .rx-med-detail-name { font-size:14px; font-weight:700; color:var(--rx-text,#111827); }
      .rx-med-detail-sig  { font-size:12.5px; color:var(--rx-muted,#6b7280); font-style:italic; }
      .rx-med-detail-row  { display:flex; gap:16px; flex-wrap:wrap; }
      .rx-med-detail-chip { font-size:11.5px; color:var(--rx-muted,#6b7280); background:var(--rx-border,#e8eaed); border-radius:6px; padding:2px 8px; }
      .rx-history-item { display:flex; gap:10px; align-items:flex-start; font-size:12.5px; padding:7px 0; border-bottom:1px solid var(--rx-border,#e8eaed); }
      .rx-history-item:last-child { border-bottom:none; }
      .rx-history-dot  { width:7px; height:7px; border-radius:50%; background:var(--rx-red,#e53935); flex-shrink:0; margin-top:4px; }
      .rx-history-time { color:var(--rx-muted,#6b7280); white-space:nowrap; }

      /* form */
      .rx-form-grid  { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
      .rx-form-full  { grid-column:1/-1; }
      .rx-form-group { display:flex; flex-direction:column; gap:5px; }
      .rx-form-label { font-size:12px; font-weight:700; color:var(--rx-muted,#6b7280); }
      .rx-form-input, .rx-form-select, .rx-form-textarea { border:1px solid var(--rx-border,#e8eaed); border-radius:9px; padding:10px 13px; font-size:13px; background:var(--rx-surface2,#f8f9fb); color:var(--rx-text,#111827); outline:none; transition:border .15s; font-family:inherit; width:100%; }
      .rx-form-input:focus, .rx-form-select:focus, .rx-form-textarea:focus { border-color:var(--rx-red,#e53935); background:var(--rx-surface,#fff); }
      .rx-form-textarea { resize:vertical; min-height:72px; }
      .rx-req { color:var(--rx-red,#e53935); }

      /* warn box */
      .rx-warn-box { background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:12px 16px; font-size:13px; color:#92400e; }
      .rx-ctrl-warn { background:#fef2f2; border-color:#fecaca; color:#991b1b; }

      /* toast */
      .rx-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%) translateY(10px); background:#111827; color:#fff; padding:12px 22px; border-radius:12px; font-size:13.5px; font-weight:600; z-index:300; opacity:0; transition:all .25s; pointer-events:none; display:flex; align-items:center; gap:10px; white-space:nowrap; }
      .rx-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }

      /* patient card */
      #rx-wrap .rx-patient-card { background:var(--rx-surface); border:1px solid var(--rx-border); border-radius:var(--rx-radius); padding:16px 20px; display:flex; gap:16px; align-items:flex-start; box-shadow:var(--rx-shadow); transition:all .12s; }
      #rx-wrap .rx-patient-card:hover { border-color:rgba(229,57,53,.25); transform:translateY(-2px); box-shadow:0 6px 24px rgba(0,0,0,.1); }
      #rx-wrap .rx-patient-avatar { width:48px; height:48px; border-radius:50%; background:var(--rx-red); color:#fff; font-size:17px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

      @media (max-width:700px) {
        .rx-view-grid, .rx-form-grid { grid-template-columns:1fr; }
        #rx-wrap .rx-stats { gap:8px; }
        .rx-modal-backdrop { padding:10px; align-items:flex-end; }
        .rx-modal-panel { border-radius:20px 20px 0 0; }
        #rx-wrap .rx-card { flex-direction:column; }
        #rx-wrap .rx-card-right { flex-direction:row; align-items:center; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════════
     TOAST
  ═══════════════════════════════════════ */
  function showToast(msg, icon = '✓') {
    let t = document.getElementById('rx-toast');
    if (!t) { t = document.createElement('div'); t.id = 'rx-toast'; t.className = 'rx-toast'; document.body.appendChild(t); }
    t.innerHTML = `<span style="color:#4ade80">${icon}</span> ${msg}`;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ═══════════════════════════════════════
     MODAL
  ═══════════════════════════════════════ */
  function openModal(html, maxWidth = '620px') {
    closeModal();
    const bd = document.createElement('div');
    bd.id = 'rx-modal-backdrop';
    bd.className = 'rx-modal-backdrop';
    bd.innerHTML = `<div class="rx-modal-panel" style="max-width:${maxWidth}">${html}</div>`;
    document.body.appendChild(bd);
    bd.addEventListener('click', e => { if (e.target === bd) closeModal(); });
  }

  function closeModal() { document.getElementById('rx-modal-backdrop')?.remove(); }

  /* ═══════════════════════════════════════
     STATS
  ═══════════════════════════════════════ */
  function buildStats() {
    const total     = prescriptions.length;
    const issued    = prescriptions.filter(p => p.status === 'issued').length;
    const fulfilled = prescriptions.filter(p => p.status === 'fulfilled').length;
    const yellowPad = prescriptions.filter(p => p.requiredYellowPad && p.status === 'issued').length;
    const controlled = prescriptions.filter(p => p.meds.some(m => { const inv = medsInventory.find(x => x.sku === m.sku); return inv?.controlled; }) && p.status === 'issued').length;
    return `
    <div class="rx-stats">
      <div class="rx-stat"><div class="rx-stat-icon rx-si-blue">📋</div><div><div class="rx-stat-label">Total Rx</div><div class="rx-stat-value">${total}</div></div></div>
      <div class="rx-stat"><div class="rx-stat-icon rx-si-amber">⏳</div><div><div class="rx-stat-label">Pending</div><div class="rx-stat-value">${issued}</div></div></div>
      <div class="rx-stat"><div class="rx-stat-icon rx-si-green">✅</div><div><div class="rx-stat-label">Fulfilled</div><div class="rx-stat-value">${fulfilled}</div></div></div>
      <div class="rx-stat"><div class="rx-stat-icon rx-si-purple">📒</div><div><div class="rx-stat-label">Yellow Pad</div><div class="rx-stat-value">${yellowPad}</div></div></div>
      <div class="rx-stat"><div class="rx-stat-icon rx-si-red">⚠️</div><div><div class="rx-stat-label">Controlled</div><div class="rx-stat-value">${controlled}</div></div></div>
    </div>`;
  }

  /* ═══════════════════════════════════════
     PRESCRIPTION CARD (staff/admin/pharmacist)
  ═══════════════════════════════════════ */
  function buildCard(p) {
    const sm = STATUS_META[p.status] || STATUS_META.pending;
    const src = SOURCE_META[p.source] || { icon: '📄', label: p.source };
    const hasControlled = p.meds.some(m => medsInventory.find(x => x.sku === m.sku)?.controlled);
    const totalCost = p.meds.reduce((sum, m) => {
      const inv = medsInventory.find(x => x.sku === m.sku);
      return sum + (inv?.price || 0) * m.qty;
    }, 0);

    const medChips = p.meds.map(m => {
      const inv = medsInventory.find(x => x.sku === m.sku);
      return `<span class="rx-med-chip${inv?.controlled ? ' controlled' : ''}">
        ${inv?.controlled ? '⚠️ ' : '💊 '}${esc(inv?.name || m.sku)} ×${m.qty}
      </span>`;
    }).join('');

    return `
    <div class="rx-card">
      <div class="rx-card-left">
        <div class="rx-card-top">
          <span class="rx-card-id">${esc(p.id)}</span>
          <span class="rx-status-badge ${sm.cls}"><span class="rx-status-dot ${sm.dot}"></span>${sm.label}</span>
          ${p.requiredYellowPad ? '<span class="rx-yp-badge">📒 Yellow Pad</span>' : ''}
          ${hasControlled ? '<span class="rx-ctrl-badge">⚠️ Controlled</span>' : ''}
          <span class="rx-source-badge">${src.icon} ${src.label}</span>
        </div>
        <div class="rx-card-meta">
          <span class="rx-meta-item">👤 ${esc(p.patientName)}</span>
          <span class="rx-meta-item">🏥 ${esc(p.doctor)}</span>
          <span class="rx-meta-item">📅 ${formatDate(p.issuedDate)}</span>
          <span class="rx-meta-item" title="${formatDate(p.issuedDate)}">🕐 ${timeAgo(p.issuedDate)}</span>
          <span class="rx-meta-item" style="font-weight:700;color:var(--rx-red)">₱${totalCost.toFixed(2)}</span>
        </div>
        <div class="rx-card-meds">${medChips}</div>
        ${p.notes ? `<div class="rx-card-note">${esc(p.notes)}</div>` : ''}
      </div>
      <div class="rx-card-right">
        <button class="rx-btn-icon rx-view-btn" data-id="${p.id}" title="View details">👁</button>
        ${p.status === 'issued' ? `<button class="rx-btn-green rx-btn-sm rx-fulfill-btn" data-id="${p.id}">✓ Fulfill</button>` : ''}
        ${p.status === 'issued' ? `<button class="rx-btn-icon rx-cancel-btn" data-id="${p.id}" title="Cancel">✕</button>` : ''}
      </div>
    </div>`;
  }

  /* ═══════════════════════════════════════
     LIST (staff / admin / pharmacist)
  ═══════════════════════════════════════ */
  function buildList(tab = 'prescriptions') {
    const listEl = document.getElementById('rx-list');
    const info   = document.getElementById('rx-results-info');
    if (!listEl) return;

    if (tab === 'inventory') {
      renderInventory(listEl);
      return;
    }

    const q      = (document.getElementById('rx-search')?.value || '').toLowerCase();
    const filter = document.getElementById('rx-filter-status')?.value || 'all';

    let rows = prescriptions.slice();
    if (filter === 'issued')    rows = rows.filter(r => r.status === 'issued');
    if (filter === 'fulfilled') rows = rows.filter(r => r.status === 'fulfilled');
    if (filter === 'cancelled') rows = rows.filter(r => r.status === 'cancelled');
    if (filter === 'yellowpad') rows = rows.filter(r => r.requiredYellowPad);
    if (filter === 'controlled') rows = rows.filter(r => r.meds.some(m => medsInventory.find(x => x.sku === m.sku)?.controlled));
    if (q) rows = rows.filter(r => `${r.id} ${r.patientName} ${r.patientId} ${r.doctor} ${r.status}`.toLowerCase().includes(q));

    if (info) info.textContent = `Showing ${rows.length} of ${prescriptions.length} prescriptions`;

    listEl.innerHTML = rows.length
      ? rows.map(buildCard).join('')
      : `<div class="rx-empty"><div class="rx-empty-icon">📋</div><p>No prescriptions match your filters.</p></div>`;

    document.querySelectorAll('.rx-view-btn').forEach(b => b.addEventListener('click', () => openDetailModal(b.dataset.id)));
    document.querySelectorAll('.rx-fulfill-btn').forEach(b => b.addEventListener('click', () => fulfillPrescription(b.dataset.id)));
    document.querySelectorAll('.rx-cancel-btn').forEach(b => b.addEventListener('click', () => cancelPrescription(b.dataset.id)));
  }

  /* ═══════════════════════════════════════
     INVENTORY TAB
  ═══════════════════════════════════════ */
  function renderInventory(el) {
    el.innerHTML = `
    <table class="rx-inv-table">
      <thead><tr>
        <th>Medication</th><th>Category</th><th>Manufacturer</th>
        <th>Expiry</th><th>Price</th><th>Stock</th><th>Flags</th>
      </tr></thead>
      <tbody>
        ${medsInventory.map(m => {
          const days = daysUntilExpiry(m.exp);
          const expCls = days < 0 ? '#dc2626' : days < 90 ? '#f59e0b' : '#16a34a';
          const expLabel = days < 0 ? 'Expired' : days < 30 ? `${days}d left` : days < 90 ? `${days}d` : formatDate(m.exp);
          const stockPct = Math.min(100, Math.round((m.stock / (m.reorderLevel * 2)) * 100));
          const stockColor = m.stock === 0 ? '#dc2626' : m.stock <= m.reorderLevel ? '#f59e0b' : '#22c55e';
          return `
          <tr>
            <td>
              <div style="font-weight:700;font-size:13.5px">${esc(m.name)}</div>
              <div style="font-size:11px;color:var(--rx-muted)">${esc(m.sku)}</div>
            </td>
            <td style="font-size:13px">${esc(m.category)}</td>
            <td style="font-size:13px;color:var(--rx-muted)">${esc(m.manufacturer)}</td>
            <td>
              <span style="font-size:12px;font-weight:700;color:${expCls}">${expLabel}</span>
            </td>
            <td style="font-weight:700;color:var(--rx-red)">₱${m.price}</td>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <div class="rx-stock-track"><div class="rx-stock-fill" style="width:${stockPct}%;background:${stockColor}"></div></div>
                <span style="font-size:12px;font-weight:600">${m.stock}</span>
              </div>
            </td>
            <td>
              ${m.controlled ? '<span class="rx-ctrl-badge">⚠️ Controlled</span>' : ''}
              ${m.stock <= m.reorderLevel && m.stock > 0 ? '<span class="rx-yp-badge">Low Stock</span>' : ''}
              ${m.stock === 0 ? '<span class="rx-status-badge rx-status-cancelled">Out of Stock</span>' : ''}
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  }

  /* ═══════════════════════════════════════
     DETAIL MODAL
  ═══════════════════════════════════════ */
  function openDetailModal(id) {
    const p = prescriptions.find(x => x.id === id); if (!p) return;
    const sm = STATUS_META[p.status] || STATUS_META.pending;
    const src = SOURCE_META[p.source] || { icon: '📄', label: p.source };
    const hasControlled = p.meds.some(m => medsInventory.find(x => x.sku === m.sku)?.controlled);
    const totalCost = p.meds.reduce((s, m) => s + (medsInventory.find(x => x.sku === m.sku)?.price || 0) * m.qty, 0);

    const medsHTML = p.meds.map(m => {
      const inv = medsInventory.find(x => x.sku === m.sku) || {};
      const expDays = inv.exp ? daysUntilExpiry(inv.exp) : 999;
      return `
      <div class="rx-med-detail-card">
        <div class="rx-med-detail-name">${esc(inv.name || m.sku)} ${inv.controlled ? '<span class="rx-ctrl-badge" style="font-size:10px">⚠️ Controlled</span>' : ''}</div>
        <div class="rx-med-detail-sig">"${esc(m.sig)}"</div>
        <div class="rx-med-detail-row">
          <span class="rx-med-detail-chip">SKU: ${esc(m.sku)}</span>
          <span class="rx-med-detail-chip">Qty: ${m.qty}</span>
          <span class="rx-med-detail-chip">Refills: ${m.refills}</span>
          <span class="rx-med-detail-chip">Price: ₱${(inv.price || 0) * m.qty}</span>
          <span class="rx-med-detail-chip" style="color:${expDays < 90 ? '#f59e0b' : 'inherit'}">Exp: ${esc(inv.exp || '—')}</span>
          <span class="rx-med-detail-chip">Stock: ${inv.stock ?? '—'}</span>
        </div>
      </div>`;
    }).join('');

    openModal(`
      <div class="rx-modal-header">
        <div><div class="rx-modal-title">Prescription Detail</div><div class="rx-modal-sub">${esc(id)} · ${esc(p.patientName)}</div></div>
        <button class="rx-modal-close" onclick="document.getElementById('rx-modal-backdrop').remove()">✕</button>
      </div>
      <div class="rx-modal-body">

        <div class="rx-modal-hero">
          <div>
            <div class="rx-modal-hero-id">${esc(p.id)}</div>
            <div style="font-size:13px;color:var(--rx-muted,#6b7280);margin-top:3px">${esc(p.diagnosis)}</div>
          </div>
          <div class="rx-modal-hero-badges">
            <span class="rx-status-badge ${sm.cls}"><span class="rx-status-dot ${sm.dot}"></span>${sm.label}</span>
            ${p.requiredYellowPad ? '<span class="rx-yp-badge">📒 Yellow Pad</span>' : ''}
            ${hasControlled ? '<span class="rx-ctrl-badge">⚠️ Controlled</span>' : ''}
            <span class="rx-source-badge">${src.icon} ${src.label}</span>
          </div>
        </div>

        ${p.requiredYellowPad || hasControlled ? `
          <div class="rx-warn-box ${hasControlled ? 'rx-ctrl-warn' : ''}" style="margin-bottom:16px">
            ${hasControlled
              ? '🚨 Contains controlled substance(s). Verify patient government-issued ID before dispensing. Record in controlled substance register.'
              : '📒 Yellow pad prescription required. Verify physical copy before fulfilling.'}
          </div>` : ''}

        <div class="rx-view-grid">
          <div class="rx-detail-section">
            <div class="rx-detail-sec-title">Patient</div>
            <div class="rx-detail-row"><span>Name</span><strong>${esc(p.patientName)}</strong></div>
            <div class="rx-detail-row"><span>Patient ID</span><strong>${esc(p.patientId)}</strong></div>
            <div class="rx-detail-row"><span>Age</span><strong>${p.patientAge ? p.patientAge + ' yrs' : '—'}</strong></div>
            <div class="rx-detail-row"><span>Contact</span><strong>${esc(p.patientContact)}</strong></div>
            <div class="rx-detail-row"><span>Diagnosis</span><strong>${esc(p.diagnosis)}</strong></div>
          </div>
          <div class="rx-detail-section">
            <div class="rx-detail-sec-title">Prescriber</div>
            <div class="rx-detail-row"><span>Doctor</span><strong>${esc(p.doctor)}</strong></div>
            <div class="rx-detail-row"><span>License No.</span><strong>${esc(p.doctorLicense)}</strong></div>
            <div class="rx-detail-row"><span>Clinic</span><strong>${esc(p.clinic)}</strong></div>
            <div class="rx-detail-row"><span>Issued</span><strong>${formatDate(p.issuedDate)}</strong></div>
            ${p.fulfilledAt ? `<div class="rx-detail-row"><span>Fulfilled</span><strong>${formatDate(p.fulfilledAt)}</strong></div>` : ''}
            ${p.pharmacist ? `<div class="rx-detail-row"><span>Pharmacist</span><strong>${esc(p.pharmacist)}</strong></div>` : ''}
          </div>

          <div class="rx-detail-section rx-view-full">
            <div class="rx-detail-sec-title">Medications (${p.meds.length}) · Total: ₱${totalCost.toFixed(2)}</div>
            <div style="display:flex;flex-direction:column;gap:10px">${medsHTML}</div>
          </div>

          ${p.notes ? `
          <div class="rx-detail-section rx-view-full">
            <div class="rx-detail-sec-title">Notes</div>
            <div style="font-size:13.5px;color:var(--rx-text,#111827);line-height:1.6">${esc(p.notes)}</div>
          </div>` : ''}

          <div class="rx-detail-section rx-view-full">
            <div class="rx-detail-sec-title">History</div>
            ${(p.history || []).slice().reverse().map(h => `
              <div class="rx-history-item">
                <div class="rx-history-dot"></div>
                <span class="rx-history-time">${formatDate(h.time)}</span>
                <span>${esc(h.change)}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="rx-modal-footer">
        <button class="rx-btn-secondary" style="border-radius:9px;padding:10px 16px;font-size:13px" onclick="document.getElementById('rx-modal-backdrop').remove()">Close</button>
        ${p.status === 'issued'
          ? `<button class="rx-btn-primary" id="rx-modal-fulfill">✓ Mark Fulfilled</button>`
          : ''}
      </div>
    `, '660px');

    document.getElementById('rx-modal-fulfill')?.addEventListener('click', () => {
      fulfillPrescription(p.id);
      closeModal();
    });
  }

  /* ═══════════════════════════════════════
     ADD PRESCRIPTION MODAL
  ═══════════════════════════════════════ */
  function openAddModal() {
    openModal(`
      <div class="rx-modal-header">
        <div><div class="rx-modal-title">New Prescription</div><div class="rx-modal-sub">Enter prescription details</div></div>
        <button class="rx-modal-close" onclick="document.getElementById('rx-modal-backdrop').remove()">✕</button>
      </div>
      <div class="rx-modal-body">
        <div class="rx-form-grid">
          <div class="rx-form-group">
            <label class="rx-form-label">Patient Name <span class="rx-req">*</span></label>
            <input id="na-patient" class="rx-form-input" placeholder="Full name" />
          </div>
          <div class="rx-form-group">
            <label class="rx-form-label">Patient ID <span class="rx-req">*</span></label>
            <input id="na-patientid" class="rx-form-input" placeholder="e.g. PT-205" />
          </div>
          <div class="rx-form-group">
            <label class="rx-form-label">Patient Age</label>
            <input id="na-age" type="number" class="rx-form-input" placeholder="e.g. 45" />
          </div>
          <div class="rx-form-group">
            <label class="rx-form-label">Patient Contact</label>
            <input id="na-contact" class="rx-form-input" placeholder="+63 9XX XXX XXXX" />
          </div>
          <div class="rx-form-group">
            <label class="rx-form-label">Doctor Name <span class="rx-req">*</span></label>
            <input id="na-doctor" class="rx-form-input" placeholder="Dr. Full Name" />
          </div>
          <div class="rx-form-group">
            <label class="rx-form-label">Doctor License No. <span class="rx-req">*</span></label>
            <input id="na-license" class="rx-form-input" placeholder="MD-XXXXX" />
          </div>
          <div class="rx-form-group">
            <label class="rx-form-label">Clinic / Hospital</label>
            <input id="na-clinic" class="rx-form-input" placeholder="Clinic name" />
          </div>
          <div class="rx-form-group">
            <label class="rx-form-label">Diagnosis</label>
            <input id="na-diagnosis" class="rx-form-input" placeholder="e.g. Hypertension" />
          </div>
          <div class="rx-form-group">
            <label class="rx-form-label">Medication</label>
            <select id="na-med" class="rx-form-select">
              ${medsInventory.map(m => `<option value="${esc(m.sku)}">${esc(m.name)} — ₱${m.price}</option>`).join('')}
            </select>
          </div>
          <div class="rx-form-group">
            <label class="rx-form-label">Quantity</label>
            <input id="na-qty" type="number" class="rx-form-input" value="1" min="1" />
          </div>
          <div class="rx-form-group rx-form-full">
            <label class="rx-form-label">Sig (Directions)</label>
            <input id="na-sig" class="rx-form-input" placeholder="e.g. Take 1 capsule every 8 hours for 7 days" />
          </div>
          <div class="rx-form-group">
            <label class="rx-form-label">Source</label>
            <select id="na-source" class="rx-form-select">
              <option value="walk-in">Walk-in</option>
              <option value="order-online">Online Order</option>
              <option value="reserve">Reservation</option>
            </select>
          </div>
          <div class="rx-form-group">
            <label class="rx-form-label">Refills Allowed</label>
            <input id="na-refills" type="number" class="rx-form-input" value="0" min="0" />
          </div>
          <div class="rx-form-group rx-form-full">
            <label class="rx-form-label">Notes</label>
            <textarea id="na-notes" class="rx-form-textarea" placeholder="Any allergies, special instructions, etc."></textarea>
          </div>
          <div class="rx-form-group" style="flex-direction:row;align-items:center;gap:10px">
            <input id="na-yellowpad" type="checkbox" style="width:16px;height:16px;accent-color:var(--rx-red,#e53935)"/>
            <label class="rx-form-label" style="margin:0;cursor:pointer" for="na-yellowpad">Requires Yellow Pad</label>
          </div>
        </div>
      </div>
      <div class="rx-modal-footer">
        <button class="rx-btn-secondary" style="border-radius:9px;padding:10px 16px;font-size:13px" onclick="document.getElementById('rx-modal-backdrop').remove()">Cancel</button>
        <button class="rx-btn-primary" id="na-save">➕ Create Prescription</button>
      </div>
    `, '660px');

    document.getElementById('na-save').addEventListener('click', () => {
      const patient = document.getElementById('na-patient').value.trim();
      const pid     = document.getElementById('na-patientid').value.trim();
      const doctor  = document.getElementById('na-doctor').value.trim();
      const license = document.getElementById('na-license').value.trim();
      if (!patient || !pid || !doctor || !license) { showToast('Required fields missing', '⚠'); return; }
      const newId = 'RX-' + (100 + prescriptions.length + 1);
      const sku = document.getElementById('na-med').value;
      prescriptions.unshift({
        id: newId, patientName: patient, patientId: pid,
        patientAge: parseInt(document.getElementById('na-age').value) || null,
        patientContact: document.getElementById('na-contact').value || '—',
        type: 'rx',
        meds: [{ sku, qty: parseInt(document.getElementById('na-qty').value) || 1, sig: document.getElementById('na-sig').value || '—', refills: parseInt(document.getElementById('na-refills').value) || 0 }],
        issuedDate: new Date().toISOString(),
        doctor, doctorLicense: license,
        clinic: document.getElementById('na-clinic').value || '—',
        diagnosis: document.getElementById('na-diagnosis').value || '—',
        status: 'issued', pharmacist: '',
        requiredYellowPad: document.getElementById('na-yellowpad').checked,
        source: document.getElementById('na-source').value,
        notes: document.getElementById('na-notes').value || '',
        history: [{ time: new Date().toISOString(), change: 'Prescription created' }]
      });
      closeModal();
      renderMain();
      showToast(`${newId} created`);
    });
  }

  /* ═══════════════════════════════════════
     FULFILL / CANCEL
  ═══════════════════════════════════════ */
  function fulfillPrescription(id) {
    const p = prescriptions.find(x => x.id === id); if (!p) return;
    p.status = 'fulfilled';
    p.pharmacist = document.getElementById('user-name')?.textContent?.trim() || 'Pharmacist';
    p.fulfilledAt = new Date().toISOString();
    p.history = p.history || [];
    p.history.push({ time: new Date().toISOString(), change: `Fulfilled by ${p.pharmacist}` });
    buildList(currentTab());
    renderStats();
    showToast(`${p.id} marked as fulfilled`, '✅');
  }

  function cancelPrescription(id) {
    const p = prescriptions.find(x => x.id === id); if (!p) return;
    if (!confirm(`Cancel prescription ${p.id} for ${p.patientName}?`)) return;
    p.status = 'cancelled';
    p.history = p.history || [];
    p.history.push({ time: new Date().toISOString(), change: 'Cancelled by staff' });
    buildList(currentTab());
    renderStats();
    showToast(`${p.id} cancelled`, '🔒');
  }

  /* ═══════════════════════════════════════
     PATIENT VIEW
  ═══════════════════════════════════════ */
  function renderPatientView(container) {
    const userName = document.getElementById('user-name')?.textContent?.trim() || '';
    const list = prescriptions.filter(p => p.patientName === userName || p.patientId === (window.currentPatientId || null));

    container.innerHTML = `
    <div id="rx-wrap">
      <div class="rx-page-header">
        <div>
          <div class="rx-page-title">📋 My Prescriptions</div>
          <div class="rx-page-sub">Your prescription history and medication details</div>
        </div>
      </div>
      <div class="rx-panel">
        ${list.length
          ? list.map(p => {
            const sm = STATUS_META[p.status] || STATUS_META.pending;
            const totalCost = p.meds.reduce((s, m) => s + (medsInventory.find(x => x.sku === m.sku)?.price || 0) * m.qty, 0);
            return `<div class="rx-card">
              <div class="rx-card-left">
                <div class="rx-card-top">
                  <span class="rx-card-id">${esc(p.id)}</span>
                  <span class="rx-status-badge ${sm.cls}"><span class="rx-status-dot ${sm.dot}"></span>${sm.label}</span>
                </div>
                <div class="rx-card-meta">
                  <span class="rx-meta-item">🏥 ${esc(p.doctor)}</span>
                  <span class="rx-meta-item">📍 ${esc(p.clinic)}</span>
                  <span class="rx-meta-item">📅 ${formatDate(p.issuedDate)}</span>
                  <span class="rx-meta-item" style="font-weight:700;color:var(--rx-red)">₱${totalCost.toFixed(2)}</span>
                </div>
                <div class="rx-card-meds">${p.meds.map(m => `<span class="rx-med-chip">💊 ${esc(medsInventory.find(x=>x.sku===m.sku)?.name||m.sku)} ×${m.qty}</span>`).join('')}</div>
              </div>
              <div class="rx-card-right">
                <button class="rx-btn-icon rx-view-btn" data-id="${p.id}" title="View">👁</button>
                ${p.status === 'issued' ? `<button class="rx-btn-secondary rx-btn-sm" onclick="alert('Order flow — coming soon.')">Order</button>` : ''}
              </div>
            </div>`;
          }).join('')
          : `<div class="rx-empty"><div class="rx-empty-icon">📋</div><p>No prescriptions found for your account.</p></div>`
        }
      </div>
    </div>`;

    document.querySelectorAll('.rx-view-btn').forEach(b => b.addEventListener('click', () => openDetailModal(b.dataset.id)));
  }

  /* ═══════════════════════════════════════
     MAIN RENDER HELPERS
  ═══════════════════════════════════════ */
  let _activeTab = 'prescriptions';
  function currentTab() { return _activeTab; }

  function renderStats() {
    const statsEl = document.getElementById('rx-stats-block');
    if (statsEl) statsEl.innerHTML = buildStats();
  }

  function renderMain() {
    const container = document.getElementById('role-dashboard');
    if (!container) return;
    renderPatientOrAdmin(container);
  }

  function renderPatientOrAdmin(container) {
    const role = getRole();
    if (role.includes('patient')) { renderPatientView(container); return; }
    if (!role.includes('admin') && !role.includes('pharmacist') && !role.includes('staff')) {
      container.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;gap:12px;color:var(--rx-muted,#6b7280)"><div style="font-size:40px">🔒</div><div style="font-size:15px;font-weight:700">No Access</div></div>`;
      return;
    }

    _activeTab = 'prescriptions';
    container.innerHTML = `
    <div id="rx-wrap">
      <div class="rx-page-header">
        <div>
          <div class="rx-page-title">📋 Prescriptions</div>
          <div class="rx-page-sub">Manage, verify, and fulfill patient prescriptions</div>
        </div>
        <div class="rx-header-actions">
          <button id="rx-add-btn"    class="rx-btn-primary">➕ New Rx</button>
          <button id="rx-refresh-btn" class="rx-btn-secondary">↺ Refresh</button>
        </div>
      </div>

      <div id="rx-stats-block">${buildStats()}</div>

      <div class="rx-panel">
        <div class="rx-panel-tabs">
          <div class="rx-tabs">
            <button class="rx-tab active" data-tab="prescriptions">📋 Prescriptions</button>
            <button class="rx-tab" data-tab="inventory">💊 Medication Inventory</button>
          </div>
        </div>

        <div class="rx-toolbar" id="rx-toolbar-pres">
          <div class="rx-search-wrap">
            <span class="rx-search-icon">🔍</span>
            <input id="rx-search" class="rx-search" placeholder="Search by ID, patient, doctor…" />
          </div>
          <select id="rx-filter-status" class="rx-filter-select">
            <option value="all">All Status</option>
            <option value="issued">Issued</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
            <option value="yellowpad">Yellow Pad</option>
            <option value="controlled">Controlled</option>
          </select>
          <div class="rx-results-count" id="rx-results-info">Showing ${prescriptions.length} prescriptions</div>
        </div>

        <div id="rx-list">
          ${prescriptions.map(buildCard).join('')}
        </div>
      </div>
    </div>`;

    // wire events
    document.querySelectorAll('.rx-view-btn').forEach(b => b.addEventListener('click', () => openDetailModal(b.dataset.id)));
    document.querySelectorAll('.rx-fulfill-btn').forEach(b => b.addEventListener('click', () => fulfillPrescription(b.dataset.id)));
    document.querySelectorAll('.rx-cancel-btn').forEach(b => b.addEventListener('click', () => cancelPrescription(b.dataset.id)));

    document.getElementById('rx-add-btn').addEventListener('click', openAddModal);
    document.getElementById('rx-refresh-btn').addEventListener('click', () => { buildList(_activeTab); showToast('Refreshed', '↺'); });
    document.getElementById('rx-search').addEventListener('input', () => buildList('prescriptions'));
    document.getElementById('rx-filter-status').addEventListener('change', () => buildList('prescriptions'));

    document.querySelectorAll('.rx-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.rx-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        _activeTab = tab.dataset.tab;
        const toolbar = document.getElementById('rx-toolbar-pres');
        if (toolbar) toolbar.style.display = _activeTab === 'inventory' ? 'none' : 'flex';
        buildList(_activeTab);
      });
    });
  }

  /* ═══════════════════════════════════════
     WIRE NAV
  ═══════════════════════════════════════ */
  function wire() {
    const nav = document.getElementById('nav-prescriptions');
    if (!nav) return;
    nav.addEventListener('click', e => {
      e.preventDefault();
      if (window.setActiveSidebar) window.setActiveSidebar('nav-prescriptions');
      renderMain();
    });
  }

  document.addEventListener('DOMContentLoaded', wire);
})();