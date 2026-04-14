//Fetches the authenticated user's role from /api/me.php and renders the appropriate dashboard sections.


document.addEventListener('DOMContentLoaded', () => {
  const roleSelectWrapper = document.getElementById('role-select');
  if (roleSelectWrapper) roleSelectWrapper.style.display = 'none';

  // ── Fetch session user from server
  async function fetchUser() {
    try {
      // Support local dev where front-end may be served by Live Server (:5500)
      const usePort8000 = (location.port === '5500');
      const API_BASE = usePort8000 ? `${location.protocol}//${location.hostname}:8000` : '';
      const res = await fetch(API_BASE + '/api/me.php', { credentials: 'include' });

      // If server responded but with a non-OK status, surface that to caller
      if (!res.ok) {
        console.warn('fetchUser: non-OK response', res.status);
        return { error: true, status: res.status };
      }

      const data = await res.json();

      // Server explicitly reported not logged in
      if (data && data.logged_in === false) {
        return { logged_in: false };
      }

      // Authenticated — return the user object
      if (data && data.logged_in && data.user) {
        return data.user;
      }

      // Unexpected payload
      console.warn('fetchUser: unexpected payload', data);
      return { error: true };
    } catch (err) {
      console.error('fetchUser error', err);
      return { error: true, message: err.message };
    }
  }

  //Show/hide elements tagged with role-* classes
  function applyRoleVisibility(role) {
    document.querySelectorAll('[class*="role-"]').forEach(el => {
      const roleClasses = Array.from(el.classList).filter(c => c.startsWith('role-'));
      if (roleClasses.length === 0) return;
      const visible = roleClasses.includes('role-all') || roleClasses.includes('role-' + role);
      el.classList.toggle('hidden', !visible);
    });
  }

  //Update the "current role" badge 
  function setRoleBadge(role) {
    const badge = document.getElementById('current-role');
    if (!badge) return;
    // icon at role load tabi ng name
    const labels = {
      admin:       '🔑 Admin',
      pharmacist:  '💊 Pharmacist',
      staff:       '🏪 Staff',
      patient:     '🩺 Patient',
    };
    badge.textContent = labels[role] ?? role.charAt(0).toUpperCase() + role.slice(1);
    badge.classList.remove('hidden');
  }

  // Avatar set index[0]
  function setAvatar(user) {
    const avatar = document.getElementById('user-avatar');
    if (!avatar) return;
    const initials = ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase();
    avatar.textContent = initials || '?';
  }

  // fetch name to db
  function setUserName(user) {
    const nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.textContent = `${user.firstName} ${user.lastName}`;
  }

  // Render role-specific dashboard cards #role-dashboard 
  function renderDashboard(role) {
    const container = document.getElementById('role-dashboard');
    if (!container) return;

    // DOM
    const views = {
      admin: `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div class="stat-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow border-l-4 border-green-500">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Total Users</p>
            <p class="text-3xl font-bold mt-1" id="stat-users">—</p>
          </div>
          <div class="stat-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow border-l-4 border-blue-500">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Total Orders</p>
            <p class="text-3xl font-bold mt-1" id="stat-orders">—</p>
          </div>
          <div class="stat-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow border-l-4 border-yellow-500">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Appointments</p>
            <p class="text-3xl font-bold mt-1" id="stat-appointments">—</p>
          </div>
          <div class="stat-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow border-l-4 border-red-500">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Notifications</p>
            <p class="text-3xl font-bold mt-1" id="stat-notifications">—</p>
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 class="font-semibold mb-4 text-gray-700 dark:text-gray-200">📦 Product Management</h2>
            <div class="flex gap-2 mb-4 flex-wrap">
              <button class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">➕ Add Product</button>
              <button class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm">✏️ Edit</button>
              <button class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm">🗑 Delete</button>
            </div>
            <table class="w-full text-sm">
              <thead><tr class="text-left border-b dark:border-gray-700 text-gray-500">
                <th class="py-2">Product</th><th>Stock</th><th>Price</th>
              </tr></thead>
              <tbody class="text-gray-600 dark:text-gray-300">
                <tr class="border-b dark:border-gray-700"><td class="py-2">Paracetamol</td><td>100</td><td>₱50</td></tr>
                <tr class="border-b dark:border-gray-700"><td class="py-2">Vitamin C</td><td>80</td><td>₱120</td></tr>
                <tr class="border-b dark:border-gray-700"><td class="py-2">Amoxicillin</td><td>45</td><td>₱75</td></tr>
              </tbody>
            </table>
          </div>
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 class="font-semibold mb-4 text-gray-700 dark:text-gray-200">👤 User Management</h2>
            <div class="space-y-3">
              <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                <span>Juan Dela Cruz</span><span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">pharmacist</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                <span>Maria Santos</span><span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">staff</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                <span>Pedro Reyes</span><span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">patient</span>
              </div>
            </div>
            <button class="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm">➕ Add New User</button>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mt-6">
          <h2 class="font-semibold mb-4 text-gray-700 dark:text-gray-200">📋 Audit Logs</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-gray-600 dark:text-gray-300">
              <thead><tr class="text-left border-b dark:border-gray-700 text-gray-500">
                <th class="py-2">User</th><th>Action</th><th>Table</th><th>Time</th>
              </tr></thead>
              <tbody>
                <tr class="border-b dark:border-gray-700"><td class="py-2">admin@rs.ph</td><td>UPDATE</td><td>products</td><td>Just now</td></tr>
                <tr class="border-b dark:border-gray-700"><td class="py-2">juan@rs.ph</td><td>INSERT</td><td>orders</td><td>5 min ago</td></tr>
              </tbody>
            </table>
          </div>
        </div>`,

      pharmacist: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div class="stat-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow border-l-4 border-blue-500">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Today's Orders</p>
            <p class="text-3xl font-bold mt-1">12</p>
          </div>
          <div class="stat-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow border-l-4 border-yellow-500">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Pending Prescriptions</p>
            <p class="text-3xl font-bold mt-1">4</p>
          </div>
          <div class="stat-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow border-l-4 border-green-500">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Appointments Today</p>
            <p class="text-3xl font-bold mt-1">3</p>
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 class="font-semibold mb-4 text-gray-700 dark:text-gray-200">🛒 Recent Orders</h2>
            <div class="space-y-3">
              <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded flex justify-between items-center text-sm">
                <span>Order #001 — Juan Dela Cruz</span>
                <div class="flex gap-2">
                  <button class="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Approve</button>
                  <button class="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">Reject</button>
                </div>
              </div>
              <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded flex justify-between items-center text-sm">
                <span>Order #002 — Maria Santos</span>
                <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Completed</span>
              </div>
              <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded flex justify-between items-center text-sm">
                <span>Order #003 — Online</span>
                <span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Pending</span>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 class="font-semibold mb-4 text-gray-700 dark:text-gray-200">📜 Prescription Queue</h2>
            <div class="space-y-3">
              <div class="p-3 bg-yellow-50 dark:bg-gray-700 rounded text-sm border-l-4 border-yellow-400">
                <p class="font-medium">Rx #045 — Pedro Reyes</p>
                <p class="text-gray-500 text-xs mt-1">Dr. Santos • Valid until May 2026</p>
              </div>
              <div class="p-3 bg-yellow-50 dark:bg-gray-700 rounded text-sm border-l-4 border-yellow-400">
                <p class="font-medium">Rx #046 — Ana Lim</p>
                <p class="text-gray-500 text-xs mt-1">Dr. Cruz • Valid until Jun 2026</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mt-6">
          <h2 class="font-semibold mb-4 text-gray-700 dark:text-gray-200">📦 Inventory Alerts</h2>
          <div class="space-y-2">
            <div class="flex justify-between text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
              <span>Amoxicillin 500mg</span><span class="text-red-600 font-medium">Low Stock: 5 left</span>
            </div>
            <div class="flex justify-between text-sm p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
              <span>Metformin 500mg</span><span class="text-orange-600 font-medium">Expiring: Mar 2026</span>
            </div>
          </div>
        </div>`,

      staff: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div class="stat-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow border-l-4 border-blue-500">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Walk-in Orders Today</p>
            <p class="text-3xl font-bold mt-1">7</p>
          </div>
          <div class="stat-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow border-l-4 border-yellow-500">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Pending Orders</p>
            <p class="text-3xl font-bold mt-1">3</p>
          </div>
          <div class="stat-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow border-l-4 border-green-500">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Notifications</p>
            <p class="text-3xl font-bold mt-1">2</p>
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 class="font-semibold mb-4 text-gray-700 dark:text-gray-200">📦 Product Lookup</h2>
            <div class="flex gap-2 mb-4">
              <input type="text" placeholder="Search product…" class="flex-1 border dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500">
              <button class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">Search</button>
            </div>
            <table class="w-full text-sm">
              <thead><tr class="text-left border-b dark:border-gray-700 text-gray-500">
                <th class="py-2">Product</th><th>Stock</th><th>Price</th>
              </tr></thead>
              <tbody class="text-gray-600 dark:text-gray-300">
                <tr class="border-b dark:border-gray-700"><td class="py-2">Paracetamol</td><td>100</td><td>₱50</td></tr>
                <tr class="border-b dark:border-gray-700"><td class="py-2">Vitamin C</td><td>80</td><td>₱120</td></tr>
              </tbody>
            </table>
          </div>
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 class="font-semibold mb-4 text-gray-700 dark:text-gray-200">🛒 Process Walk-in Order</h2>
            <div class="space-y-3">
              <div>
                <label class="text-xs text-gray-500">Patient Name</label>
                <input type="text" placeholder="Enter name…" class="w-full border dark:border-gray-600 rounded px-3 py-2 text-sm mt-1 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500">
              </div>
              <div>
                <label class="text-xs text-gray-500">Payment Method</label>
                <select class="w-full border dark:border-gray-600 rounded px-3 py-2 text-sm mt-1 bg-white dark:bg-gray-700 dark:text-white">
                  <option>Cash</option><option>GCash</option><option>Card</option>
                </select>
              </div>
              <button class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm font-medium">Create Order</button>
            </div>
          </div>
        </div>`,

      patient: `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div class="stat-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow border-l-4 border-blue-500">
            <p class="text-xs text-gray-500 uppercase tracking-wide">My Orders</p>
            <p class="text-3xl font-bold mt-1">3</p>
          </div>
          <div class="stat-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow border-l-4 border-green-500">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Upcoming Appointments</p>
            <p class="text-3xl font-bold mt-1">1</p>
          </div>
          <div class="stat-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow border-l-4 border-yellow-500">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Active Prescriptions</p>
            <p class="text-3xl font-bold mt-1">2</p>
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 class="font-semibold mb-4 text-gray-700 dark:text-gray-200">🛒 My Orders</h2>
            <div class="space-y-3">
              <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                <div class="flex justify-between"><span class="font-medium">Order #001</span><span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Completed</span></div>
                <p class="text-gray-500 text-xs mt-1">Paracetamol × 2 — ₱100 • GCash</p>
              </div>
              <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                <div class="flex justify-between"><span class="font-medium">Order #002</span><span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Pending</span></div>
                <p class="text-gray-500 text-xs mt-1">Vitamin C × 1 — ₱120 • Cash</p>
              </div>
            </div>
            <button class="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm">🛒 Browse Products</button>
          </div>
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 class="font-semibold mb-4 text-gray-700 dark:text-gray-200">📅 My Appointments</h2>
            <div class="space-y-3">
              <div class="p-3 bg-blue-50 dark:bg-gray-700 rounded text-sm border-l-4 border-blue-400">
                <p class="font-medium">Medication Consultation</p>
                <p class="text-gray-500 text-xs mt-1">Apr 18, 2026 • 10:00 AM • 30 min</p>
              </div>
            </div>
            <button class="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm">📅 Book Appointment</button>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mt-6">
          <h2 class="font-semibold mb-4 text-gray-700 dark:text-gray-200">📜 My Prescriptions</h2>
          <div class="space-y-3">
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm flex justify-between items-center">
              <div>
                <p class="font-medium">Rx #045</p>
                <p class="text-gray-500 text-xs">Dr. Santos • Issued Apr 1, 2026</p>
              </div>
              <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Approved</span>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm flex justify-between items-center">
              <div>
                <p class="font-medium">Rx #032</p>
                <p class="text-gray-500 text-xs">Dr. Cruz • Issued Mar 10, 2026</p>
              </div>
              <span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Pending</span>
            </div>
          </div>
          <button class="mt-4 w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 text-sm">📤 Upload New Prescription</button>
        </div>`,
    };

    container.innerHTML = views[role] ?? `<div class="text-center text-gray-400 py-20">Unknown role: ${role}</div>`;
  }

  // ── Sidebar navigation visibility per role ─────────────────────────────
  function applyNavVisibility(role) {
    // Already handled by applyRoleVisibility via role-* classes on nav links
    // but we can also hide the manual role select row
    const roleSelect = document.getElementById('role-select');
    if (roleSelect) roleSelect.closest('.flex')?.classList?.add('hidden');
  }

  // wrong pass
  function redirectToLogin() {
    // bounce back wrong pass
    window.location.href = '/pages/auth.html';
  }

  // ── Main init
  (async () => {
    const fetched = await fetchUser();
    if (fetched && fetched.logged_in === false) {
      redirectToLogin();
      return;
    }

    // Network or unexpected error
    if (!fetched || fetched.error) {
      console.warn('Unable to verify session; not redirecting.');
      return;
    }

    const user = fetched; // authenticated user object
    const role = user.role; // admin, pharmacist, staff, patient

    setRoleBadge(role);
    setAvatar(user);
    setUserName(user);
    applyRoleVisibility(role);
    applyNavVisibility(role);
    renderDashboard(role);
  })();
});