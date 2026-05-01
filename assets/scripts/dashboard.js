// Fetches the authenticated user's role from /api/me.php and renders the appropriate dashboard sections.

document.addEventListener('DOMContentLoaded', () => {
  const roleSelectWrapper = document.getElementById('role-select');
  if (roleSelectWrapper) roleSelectWrapper.style.display = 'none';

  // ── Fetch session user from server
  async function fetchUser() {
    try {
      const usePort8000 = (location.port === '5500');
      const API_BASE = usePort8000 ? `${location.protocol}//${location.hostname}:8000` : '';
      const res = await fetch(API_BASE + '/api/me.php', { credentials: 'include' });

      if (!res.ok) {
        console.warn('fetchUser: non-OK response', res.status);
        return { error: true, status: res.status };
      }

      const data = await res.json();

      if (data && data.logged_in === false) {
        return { logged_in: false };
      }

      if (data && data.logged_in && data.user) {
        return data.user;
      }

      console.warn('fetchUser: unexpected payload', data);
      return { error: true };
    } catch (err) {
      console.error('fetchUser error', err);
      return { error: true, message: err.message };
    }
  }

  // Show/hide elements tagged with role-* classes
  function applyRoleVisibility(role) {
    document.querySelectorAll('[class*="role-"]').forEach(el => {
      const roleClasses = Array.from(el.classList).filter(c => c.startsWith('role-'));
      if (roleClasses.length === 0) return;
      const visible = roleClasses.includes('role-all') || roleClasses.includes('role-' + role);
      el.classList.toggle('hidden', !visible);
    });
  }

  // Set active link styling in the sidebar
  function setActiveNav(id) {
    const links = document.querySelectorAll('#sidebar nav a');
    links.forEach(a => {
      a.classList.remove('bg-[#e53935]', 'text-white', 'bg-gray-200', 'dark:bg-gray-700', 'text-gray-900', 'dark:text-white');
      a.style.background = '';
      a.style.color = '';
      a.style.boxShadow = '';
    });
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('bg-[#e53935]', 'text-white');
    }
  }

  // Update the "current role" badge
  function setRoleBadge(role) {
    const badge = document.getElementById('current-role');
    if (!badge) return;
    const labels = {
      admin:      '🔑 Admin',
      pharmacist: '💊 Pharmacist',
      staff:      '🏪 Staff',
      patient:    '🩺 Patient',
    };
    badge.textContent = labels[role] ?? role.charAt(0).toUpperCase() + role.slice(1);
    badge.classList.remove('hidden');
  }

  // Avatar initials
  function setAvatar(user) {
    const avatar = document.getElementById('user-avatar');
    if (!avatar) return;
    const initials = ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase();
    avatar.textContent = initials || '?';
  }

  function setUserName(user) {
    const nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.textContent = `${user.firstName} ${user.lastName}`;
  }

  // ── Shared UI helpers ────────────────────────────────────────────────

  const card = (content, extra = '') =>
    `<div class="bg-white dark:bg-[#161616] rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.05] p-5 ${extra}">${content}</div>`;

  const sectionTitle = (icon, title, action = '') =>
    `<div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="text-base">${icon}</span>
        <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-tight">${title}</h2>
      </div>
      ${action}
    </div>`;

  const statCard = (label, value, accent, icon) =>
    `<div class="stat-card bg-white dark:bg-[#161616] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.05]">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">${label}</p>
          <p class="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">${value}</p>
        </div>
        <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base" style="background:${accent}18">${icon}</div>
      </div>
      <div class="mt-3 h-1 rounded-full" style="background:${accent}22">
        <div class="h-full rounded-full w-2/3" style="background:${accent}"></div>
      </div>
    </div>`;

  const badge = (text, color) => {
    const styles = {
      green:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
      yellow: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
      red:    'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
      blue:   'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
      gray:   'bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-400',
    };
    return `<span class="text-[10px] font-semibold px-2 py-1 rounded-lg ${styles[color] || styles.gray}">${text}</span>`;
  };

  const btn = (text, color = 'primary', size = 'sm') => {
    const colors = {
      primary: 'bg-[#e53935] hover:bg-[#c62828] text-white shadow-sm shadow-red-200 dark:shadow-red-900/20',
      green:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/20',
      blue:    'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/20',
      yellow:  'bg-amber-500 hover:bg-amber-600 text-white',
      outline: 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]',
      ghost:   'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.05]',
    };
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', full: 'w-full px-4 py-2 text-sm' };
    return `<button class="rounded-lg font-semibold transition-all ${colors[color]} ${sizes[size]}">${text}</button>`;
  };

  const tableWrap = (headers, rows) =>
    `<div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100 dark:border-white/[0.06]">
            ${headers.map(h => `<th class="py-2.5 px-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody class="text-gray-600 dark:text-gray-300">
          ${rows}
        </tbody>
      </table>
    </div>`;

  const alertRow = (name, msg, color) => {
    const bar = { red: '#e53935', orange: '#f97316' };
    return `<div class="flex items-center justify-between p-3 rounded-xl border text-sm
      ${color === 'red' ? 'bg-red-50 border-red-100 dark:bg-red-500/5 dark:border-red-500/10' : 'bg-amber-50 border-amber-100 dark:bg-amber-500/5 dark:border-amber-500/10'}">
      <div class="flex items-center gap-2.5">
        <span class="w-1.5 h-8 rounded-full flex-shrink-0" style="background:${bar[color]}"></span>
        <span class="font-medium text-gray-700 dark:text-gray-300">${name}</span>
      </div>
      <span class="text-xs font-semibold ${color === 'red' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}">${msg}</span>
    </div>`;
  };

  // ── Render role-specific dashboard cards ──────────────────────────────
  function renderDashboard(role) {
    const container = document.getElementById('role-dashboard');
    if (!container) return;

    const views = {
      admin: `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          ${statCard('Total Users',    '—', '#10b981', '👥')}
          ${statCard('Total Orders',   '—', '#3b82f6', '🛒')}
          ${statCard('Appointments',   '—', '#f59e0b', '📅')}
          ${statCard('Notifications',  '—', '#e53935', '🔔')}
        </div>

        <div class="grid lg:grid-cols-2 gap-4">
          ${card(`
            ${sectionTitle('📦', 'Product Management', `<div class="flex gap-2">${btn('➕ Add', 'green', 'sm')}${btn('✏️ Edit', 'outline', 'sm')}${btn('🗑 Delete', 'outline', 'sm')}</div>`)}
            ${tableWrap(
              ['Product', 'Stock', 'Price'],
              `<tr class="border-b border-gray-50 dark:border-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td class="py-2.5 px-3 font-medium">Paracetamol</td><td class="py-2.5 px-3">100</td><td class="py-2.5 px-3 font-mono text-xs">₱50</td>
              </tr>
              <tr class="border-b border-gray-50 dark:border-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td class="py-2.5 px-3 font-medium">Vitamin C</td><td class="py-2.5 px-3">80</td><td class="py-2.5 px-3 font-mono text-xs">₱120</td>
              </tr>
              <tr class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td class="py-2.5 px-3 font-medium">Amoxicillin</td><td class="py-2.5 px-3">45</td><td class="py-2.5 px-3 font-mono text-xs">₱75</td>
              </tr>`
            )}
          `)}

          ${card(`
            ${sectionTitle('👤', 'User Management', btn('➕ Add User', 'green', 'sm'))}
            <div class="space-y-2">
              <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl text-sm">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">JD</div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Juan Dela Cruz</span>
                </div>
                ${badge('Pharmacist', 'blue')}
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl text-sm">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">MS</div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Maria Santos</span>
                </div>
                ${badge('Staff', 'green')}
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl text-sm">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400">PR</div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Pedro Reyes</span>
                </div>
                ${badge('Patient', 'gray')}
              </div>
            </div>
          `)}
        </div>

        ${card(`
          ${sectionTitle('📋', 'Audit Logs')}
          ${tableWrap(
            ['User', 'Action', 'Table', 'Time'],
            `<tr class="border-b border-gray-50 dark:border-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <td class="py-2.5 px-3 font-mono text-xs text-gray-500">admin@rs.ph</td>
              <td class="py-2.5 px-3">${badge('UPDATE', 'yellow')}</td>
              <td class="py-2.5 px-3 font-mono text-xs">products</td>
              <td class="py-2.5 px-3 text-xs text-gray-400">Just now</td>
            </tr>
            <tr class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <td class="py-2.5 px-3 font-mono text-xs text-gray-500">juan@rs.ph</td>
              <td class="py-2.5 px-3">${badge('INSERT', 'green')}</td>
              <td class="py-2.5 px-3 font-mono text-xs">orders</td>
              <td class="py-2.5 px-3 text-xs text-gray-400">5 min ago</td>
            </tr>`
          )}
        `, 'mt-4')}`,

      pharmacist: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          ${statCard("Today's Orders",       '12', '#3b82f6', '🛒')}
          ${statCard('Pending Prescriptions', '4',  '#f59e0b', '📜')}
          ${statCard('Appointments Today',    '3',  '#10b981', '📅')}
        </div>

        <div class="grid lg:grid-cols-2 gap-4">
          ${card(`
            ${sectionTitle('🛒', 'Recent Orders')}
            <div class="space-y-2">
              <div class="p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl flex justify-between items-center text-sm">
                <div>
                  <p class="font-semibold text-gray-700 dark:text-gray-200">Order #001</p>
                  <p class="text-xs text-gray-400 mt-0.5">Juan Dela Cruz</p>
                </div>
                <div class="flex gap-2">
                  ${btn('Approve', 'green', 'sm')}
                  ${btn('Reject', 'outline', 'sm')}
                </div>
              </div>
              <div class="p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl flex justify-between items-center text-sm">
                <div>
                  <p class="font-semibold text-gray-700 dark:text-gray-200">Order #002</p>
                  <p class="text-xs text-gray-400 mt-0.5">Maria Santos</p>
                </div>
                ${badge('Completed', 'green')}
              </div>
              <div class="p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl flex justify-between items-center text-sm">
                <div>
                  <p class="font-semibold text-gray-700 dark:text-gray-200">Order #003</p>
                  <p class="text-xs text-gray-400 mt-0.5">Online</p>
                </div>
                ${badge('Pending', 'yellow')}
              </div>
            </div>
          `)}

          ${card(`
            ${sectionTitle('📜', 'Prescription Queue')}
            <div class="space-y-2">
              <div class="p-3 rounded-xl border border-amber-100 dark:border-amber-500/10 bg-amber-50 dark:bg-amber-500/5 text-sm">
                <div class="flex items-start justify-between">
                  <div>
                    <p class="font-semibold text-gray-700 dark:text-gray-200">Rx #045 — Pedro Reyes</p>
                    <p class="text-xs text-gray-400 mt-1">Dr. Santos • Valid until May 2026</p>
                  </div>
                  ${badge('Pending', 'yellow')}
                </div>
              </div>
              <div class="p-3 rounded-xl border border-amber-100 dark:border-amber-500/10 bg-amber-50 dark:bg-amber-500/5 text-sm">
                <div class="flex items-start justify-between">
                  <div>
                    <p class="font-semibold text-gray-700 dark:text-gray-200">Rx #046 — Ana Lim</p>
                    <p class="text-xs text-gray-400 mt-1">Dr. Cruz • Valid until Jun 2026</p>
                  </div>
                  ${badge('Pending', 'yellow')}
                </div>
              </div>
            </div>
          `)}
        </div>

        ${card(`
          ${sectionTitle('📦', 'Inventory Alerts')}
          <div class="space-y-2">
            ${alertRow('Amoxicillin 500mg', 'Low Stock: 5 left', 'red')}
            ${alertRow('Metformin 500mg', 'Expiring: Mar 2026', 'orange')}
          </div>
        `, 'mt-4')}`,

      staff: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          ${statCard("Walk-in Orders Today", '7', '#3b82f6', '🚶')}
          ${statCard('Pending Orders',       '3', '#f59e0b', '⏳')}
          ${statCard('Notifications',        '2', '#e53935', '🔔')}
        </div>

        <div class="grid lg:grid-cols-2 gap-4">
          ${card(`
            ${sectionTitle('📦', 'Product Lookup')}
            <div class="flex gap-2 mb-4">
              <div class="flex-1 flex items-center gap-2 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 bg-gray-50 dark:bg-white/[0.03]">
                <svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input type="text" placeholder="Search product…" class="bg-none border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 w-full" style="background:transparent">
              </div>
              ${btn('Search', 'primary', 'sm')}
            </div>
            ${tableWrap(
              ['Product', 'Stock', 'Price'],
              `<tr class="border-b border-gray-50 dark:border-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                <td class="py-2.5 px-3 font-medium">Paracetamol</td><td class="py-2.5 px-3">100</td><td class="py-2.5 px-3 font-mono text-xs">₱50</td>
              </tr>
              <tr class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                <td class="py-2.5 px-3 font-medium">Vitamin C</td><td class="py-2.5 px-3">80</td><td class="py-2.5 px-3 font-mono text-xs">₱120</td>
              </tr>`
            )}
          `)}

          ${card(`
            ${sectionTitle('🛒', 'Process Walk-in Order')}
            <div class="space-y-3">
              <div>
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Patient Name</label>
                <input type="text" placeholder="Enter name…" class="w-full mt-1.5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow">
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Method</label>
                <select class="w-full mt-1.5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 outline-none">
                  <option>Cash</option><option>GCash</option><option>Card</option>
                </select>
              </div>
              <button class="w-full bg-[#e53935] hover:bg-[#c62828] text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20 mt-1">Create Order</button>
            </div>
          `)}
        </div>`,

      patient: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          ${statCard('My Orders',             '3', '#3b82f6', '📦')}
          ${statCard('Upcoming Appointments', '1', '#10b981', '📅')}
          ${statCard('Active Prescriptions',  '2', '#f59e0b', '📜')}
        </div>

        <div class="grid lg:grid-cols-2 gap-4">
          ${card(`
            ${sectionTitle('🛒', 'My Orders', btn('Browse Products', 'primary', 'sm'))}
            <div class="space-y-2">
              <div class="p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl text-sm">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-semibold text-gray-700 dark:text-gray-200">Order #001</p>
                    <p class="text-xs text-gray-400 mt-1">Paracetamol × 2 — <span class="font-mono">₱100</span> • GCash</p>
                  </div>
                  ${badge('Completed', 'green')}
                </div>
              </div>
              <div class="p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl text-sm">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-semibold text-gray-700 dark:text-gray-200">Order #002</p>
                    <p class="text-xs text-gray-400 mt-1">Vitamin C × 1 — <span class="font-mono">₱120</span> • Cash</p>
                  </div>
                  ${badge('Pending', 'yellow')}
                </div>
              </div>
            </div>
          `)}

          ${card(`
            ${sectionTitle('📅', 'My Appointments', btn('Book Appointment', 'blue', 'sm'))}
            <div class="space-y-2">
              <div class="p-3 rounded-xl border border-blue-100 dark:border-blue-500/10 bg-blue-50 dark:bg-blue-500/5 text-sm">
                <p class="font-semibold text-gray-700 dark:text-gray-200">Medication Consultation</p>
                <p class="text-xs text-gray-400 mt-1">Apr 18, 2026 • 10:00 AM • 30 min</p>
              </div>
            </div>
          `)}
        </div>

        ${card(`
          ${sectionTitle('📜', 'My Prescriptions', btn('Upload Prescription', 'yellow', 'sm'))}
          <div class="space-y-2">
            <div class="p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl text-sm flex justify-between items-center">
              <div>
                <p class="font-semibold text-gray-700 dark:text-gray-200">Rx #045</p>
                <p class="text-xs text-gray-400 mt-0.5">Dr. Santos • Issued Apr 1, 2026</p>
              </div>
              ${badge('Approved', 'green')}
            </div>
            <div class="p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl text-sm flex justify-between items-center">
              <div>
                <p class="font-semibold text-gray-700 dark:text-gray-200">Rx #032</p>
                <p class="text-xs text-gray-400 mt-0.5">Dr. Cruz • Issued Mar 10, 2026</p>
              </div>
              ${badge('Pending', 'yellow')}
            </div>
          </div>
        `, 'mt-4')}`,
    };

    container.innerHTML = views[role] ?? `<div class="text-center text-gray-400 py-20">Unknown role: ${role}</div>`;
  }

  function applyNavVisibility(role) {
    const roleSelect = document.getElementById('role-select');
    if (roleSelect) roleSelect.closest('.flex')?.classList?.add('hidden');
  }

  function redirectToLogin() {
    window.location.href = '/pages/auth.html';
  }

  // ── Main init ─────────────────────────────────────────────────────────
  (async () => {
    const fetched = await fetchUser();
    if (fetched && fetched.logged_in === false) {
      redirectToLogin();
      return;
    }

    if (!fetched || fetched.error) {
      console.warn('Unable to verify session; not redirecting.');
      return;
    }

    const user = fetched;
    const role = user.role;

    window.__appState = { user, role };
    window.showInitialDashboard = () => {
      const s = window.__appState;
      if (!s) return;
      setRoleBadge(s.role);
      setAvatar(s.user);
      setUserName(s.user);
      applyRoleVisibility(s.role);
      applyNavVisibility(s.role);
      renderDashboard(s.role);
      setActiveNav('nav-dashboard');
    };

    setRoleBadge(role);
    setAvatar(user);
    setUserName(user);
    applyRoleVisibility(role);
    applyNavVisibility(role);
    renderDashboard(role);
    setActiveNav('nav-dashboard');
  })();
});