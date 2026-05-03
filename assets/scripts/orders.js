document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav-orders');
  const container = document.getElementById('role-dashboard');
  if (!nav || !container) return;
  // ── Sample data ────────────────────────────────────────────────────────────
  // MAX LOAD DAPAT AY 20 ITEMS per page Fetch=> tapos lagay ng page 2, 3 4 ..... Max.length
  const sampleOrders = [
    { id: 'ORD-1001', date: '2026-04-30 11:02', customer: 'Juan Dela Cruz', items: 'Paracetamol x2', status: 'Pending', total: '₱100.00' },
    { id: 'ORD-1002', date: '2026-04-30 12:20', customer: 'Maria Santos', items: 'Vitamin C x1', status: 'Completed', total: '₱120.00' },
    { id: 'ORD-1003', date: '2026-05-01 09:50', customer: 'Pedro Reyes', items: 'Amoxicillin x1', status: 'Cancelled', total: '₱75.00' },
  ];

  function setActiveNav(target) {
    if (window.setActiveSidebar) return window.setActiveSidebar(target);
    const links = document.querySelectorAll('#sidebar nav a');
    links.forEach(a => a.classList.remove('active-nav','bg-[#e53935]', 'text-white'));
    const el = (typeof target === 'string') ? document.getElementById(target) : target;
    if (el) el.classList.add('active-nav');
  }

  function buildTable(rows) {
    return `
      <div class="card p-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Orders</h3>
          <button id="export-orders" class="px-3 py-1 rounded bg-[#e53935] text-white text-sm">Export CSV</button>
        </div>
        <table class="w-full text-sm mt-3">
          <thead>
            <tr class="text-left text-xs text-gray-400 uppercase">
              <th class="py-2 px-3">Order</th>
              <th class="py-2 px-3">Date</th>
              <th class="py-2 px-3">Customer</th>
              <th class="py-2 px-3">Items</th>
              <th class="py-2 px-3">Status</th>
              <th class="py-2 px-3">Total</th>
              <th class="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody class="text-gray-700">
            ${rows.map(r => `
              <tr class="border-t border-gray-100 hover:bg-gray-50">
                <td class="py-2 px-3 font-mono text-xs">${r.id}</td>
                <td class="py-2 px-3 text-xs">${r.date}</td>
                <td class="py-2 px-3">${r.customer}</td>
                <td class="py-2 px-3">${r.items}</td>
                <td class="py-2 px-3">${r.status}</td>
                <td class="py-2 px-3 font-mono">${r.total}</td>
                <td class="py-2 px-3">
                  <button class="view-order px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-100" data-order-id="${r.id}">View</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function render() {
    setActiveNav(nav);
    container.innerHTML = `
      <div class="space-y-4">
        ${buildTable(sampleOrders)}
      </div>

      <!-- Modal -->
      <div id="order-modal" class="fixed inset-0 z-50 flex items-start justify-center p-4 pointer-events-none opacity-0 transition-opacity">
        <div id="order-modal-overlay" class="absolute inset-0 bg-black/40"></div>
        <div class="relative w-full max-w-2xl pointer-events-auto bg-white rounded shadow-lg overflow-hidden">
          <div class="p-4 border-b flex items-center justify-between">
            <h4 id="order-modal-title" class="text-lg font-semibold">Order Details</h4>
            <button id="order-modal-close" class="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <div id="order-modal-body" class="p-4 text-sm text-gray-700"></div>
        </div>
      </div>
    `;

    const wrapper = document.getElementById('role-dashboard');
    const modalRoot = document.getElementById('order-modal');
    const modalBody = document.getElementById('order-modal-body');
    const modalClose = document.getElementById('order-modal-close');
    const modalOverlay = document.getElementById('order-modal-overlay');

    const exportBtn = wrapper.querySelector('#export-orders');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const csv = [
          ['Order','Date','Customer','Items','Status','Total'],
          ...sampleOrders.map(o => [o.id, o.date, o.customer, o.items, o.status, o.total])
        ].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      });
    }

    const viewBtns = wrapper.querySelectorAll('.view-order');
    function openModal(order) {
      if (!modalRoot) return;
      modalBody.innerHTML = `
        <div class="space-y-2">
          <div><strong>Order:</strong> <span class="font-mono">${order.id}</span></div>
          <div><strong>Date:</strong> ${order.date}</div>
          <div><strong>Customer:</strong> ${order.customer}</div>
          <div><strong>Items:</strong> ${order.items}</div>
          <div><strong>Status:</strong> ${order.status}</div>
          <div><strong>Total:</strong> ${order.total}</div>
        </div>
      `;
      modalRoot.classList.remove('pointer-events-none');
      requestAnimationFrame(() => { modalRoot.style.opacity = '1'; });
    }

    viewBtns.forEach(b => b.addEventListener('click', () => {
      const id = b.getAttribute('data-order-id');
      const order = sampleOrders.find(o => o.id === id);
      if (order) openModal(order);
    }));

    function closeModal() { if (!modalRoot) return; modalRoot.style.opacity = '0'; modalRoot.classList.add('pointer-events-none'); }
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeModal(); });
  }

  nav.addEventListener('click', (e) => { e.preventDefault(); render(); });
  if (location.hash === '#orders') render();
});
