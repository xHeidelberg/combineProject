document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav-products');
    if (!nav) return;

    function detectRole() {
        const badge = document.getElementById('current-role');
        const txt = (badge?.textContent || '').toLowerCase();
        if (/admin/.test(txt)) return 'admin';
        if (/pharmacist/.test(txt)) return 'pharmacist';
        if (/staff/.test(txt)) return 'staff';
        if (/patient/.test(txt)) return 'patient';
        return '';
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // ================================================ sample data (replace with API fetch later)
    const sampleProducts = [
        { id: 1, name: 'Paracetamol', generic: 'Acetaminophen', category: 'Tablet', price: '50', requires_prescription: false, batch_number: 'A001', quantity: 100, expiry_date: '2026-12-31', location: 'Shelf A-1' },
        { id: 2, name: 'Vitamin C', generic: 'Ascorbic Acid', category: 'Tablet', price: '120', requires_prescription: false, batch_number: 'B002', quantity: 80, expiry_date: '2027-03-01', location: 'Shelf B-2' },
        { id: 3, name: 'Amoxicillin', generic: 'Amoxil', category: 'Capsule', price: '75', requires_prescription: true, batch_number: 'C003', quantity: 5, expiry_date: '2026-06-15', location: 'Shelf C-3' },
    ];
    // ================================================================================================

    function populateDashboardWithProducts(role) {
        const container = document.getElementById('role-dashboard');
        if (!container) { alert('Dashboard container not found'); return; }

        // Set products nav active
          function setActiveNav(target) {
            if (window.setActiveSidebar) return window.setActiveSidebar(target);
            const links = document.querySelectorAll('#sidebar nav a');
            links.forEach(a => a.classList.remove('active-nav','bg-[#e53935]', 'text-white', 'bg-gray-200', 'dark:bg-gray-700', 'text-gray-900', 'dark:text-white'));
            const el = (typeof target === 'string') ? document.getElementById(target) : target;
            if (el) el.classList.add('active-nav');
          }
          setActiveNav('nav-products');

        // Shared input class
        const inputCls = 'w-full border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 mt-1.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow';
        const labelCls = 'text-xs font-semibold text-gray-400 uppercase tracking-wider mt-3 block';

        container.innerHTML = `
      <div class="mb-5 flex justify-between items-center">
        <div>
          <h2 class="text-base font-bold text-gray-800 dark:text-white tracking-tight">📦 Products</h2>
          <p class="text-xs text-gray-400 mt-0.5">Manage inventory and product details</p>
        </div>
        <div>
          ${role === 'admin' ? `<button id="dashboard-add" class="bg-[#e53935] hover:bg-[#c62828] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20">➕ New Product</button>` : ''}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Product Table -->
        <div class="bg-white dark:bg-[#161616] rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.05] overflow-hidden">
          <div class="overflow-x-auto">
            <table id="prod-table" class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02]">
                  <th class="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Product</th>
                  <th class="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Generic</th>
                  <th class="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Type</th>
                  <th class="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Price</th>
                  <th class="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Qty</th>
                  <th class="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody id="prod-tbody" class="text-gray-700 dark:text-gray-300 divide-y divide-gray-50 dark:divide-white/[0.04]"></tbody>
            </table>
          </div>
        </div>

        <!-- Product Form -->
        <div class="bg-white dark:bg-[#161616] rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.05] p-5">
          <h3 class="text-sm font-bold text-gray-700 dark:text-gray-200 tracking-tight mb-4">Product / Inventory</h3>

          <form id="prod-form" onsubmit="return false">
            <label class="${labelCls} mt-0">Product Name</label>
            <input type="text" id="product_name" name="product_name" placeholder="e.g., Amoxicillin" required class="${inputCls}" />

            <label class="${labelCls}">Generic Name</label>
            <input type="text" id="generic_name" name="generic_name" placeholder="e.g., Amoxil" class="${inputCls}" />

            <label class="${labelCls}">Category</label>
            <select id="category" name="category" class="${inputCls}">
              <option value="Tablet">Tablet</option>
              <option value="Syrup">Syrup</option>
              <option value="Capsule">Capsule</option>
            </select>

            <label class="${labelCls}">Price (₱)</label>
            <input type="number" step="0.01" id="price" name="price" required class="${inputCls}" />

            <div class="flex items-center gap-3 mt-3 p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
              <input type="checkbox" id="rx" name="requires_prescription" value="1"
                class="w-4 h-4 rounded accent-[#e53935]" />
              <label for="rx" class="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">Requires Prescription?</label>
            </div>

            <div class="my-4 h-px bg-gray-100 dark:bg-white/[0.05]"></div>

            <label class="${labelCls} mt-0">Batch Number</label>
            <input type="text" id="batch_number" name="batch_number" required class="${inputCls}" />

            <label class="${labelCls}">Initial Quantity</label>
            <input type="number" id="quantity" name="quantity" required class="${inputCls}" />

            <label class="${labelCls}">Expiry Date</label>
            <input type="date" id="expiry_date" name="expiry_date" required class="${inputCls}" />

            <label class="${labelCls}">Storage Location</label>
            <input type="text" id="location" name="location" placeholder="e.g., Shelf A-12" class="${inputCls}" />

            <input type="hidden" id="editing_id" />

            <div class="mt-5 flex justify-end gap-2">
              ${role === 'admin' ? `<button id="save-product" class="bg-[#e53935] hover:bg-[#c62828] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20">Save Product</button>` : ''}
              ${role === 'pharmacist' ? `<button id="adjust-stock" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-blue-200 dark:shadow-blue-900/20">Adjust Stock</button>` : ''}
              ${role === 'staff' ? `<button id="add-to-order" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">Add to Order</button>` : ''}
            </div>
          </form>
        </div>
      </div>
    `;

        // Render table rows
        function renderTable() {
            const tbody = document.getElementById('prod-tbody');
            tbody.innerHTML = '';

            sampleProducts.forEach(p => {
                const isLow = p.quantity <= 10;
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors';
                tr.innerHTML = `
          <td class="py-3 px-4">
            <div class="font-semibold text-gray-700 dark:text-gray-200">${escapeHtml(p.name)}</div>
            ${p.requires_prescription ? `<span class="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Rx Required</span>` : ''}
          </td>
          <td class="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">${escapeHtml(p.generic)}</td>
          <td class="py-3 px-4">
            <span class="text-[10px] font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 px-2 py-1 rounded-lg">${escapeHtml(p.category)}</span>
          </td>
          <td class="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-300">₱${escapeHtml(String(p.price))}</td>
          <td class="py-3 px-4">
            <span class="text-sm font-semibold ${isLow ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}">${escapeHtml(String(p.quantity))}</span>
            ${isLow ? `<span class="ml-1 text-[10px] text-red-400">Low</span>` : ''}
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-1.5">
              <button data-id="${p.id}" class="view-btn text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-2 py-1 rounded-lg transition-colors">View</button>
              ${role === 'admin' ? `
                <button data-id="${p.id}" class="edit-btn text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-2 py-1 rounded-lg transition-colors">Edit</button>
                <button data-id="${p.id}" class="del-btn text-[11px] font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-2 py-1 rounded-lg transition-colors">Delete</button>
              ` : ''}
            </div>
          </td>
        `;
                tbody.appendChild(tr);
            });

            // Attach view/edit/delete handlers
            tbody.querySelectorAll('.view-btn').forEach(b => b.addEventListener('click', (e) => {
                const id = Number(e.currentTarget.dataset.id);
                const p = sampleProducts.find(x => x.id === id);
                if (p) fillFormWithProduct(p, role);
            }));
            tbody.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click', (e) => {
                const id = Number(e.currentTarget.dataset.id);
                const p = sampleProducts.find(x => x.id === id);
                if (p) fillFormWithProduct(p, role);
            }));
            tbody.querySelectorAll('.del-btn').forEach(b => b.addEventListener('click', (e) => {
                const id = Number(e.currentTarget.dataset.id);
                if (!confirm('Delete product?')) return;
                const idx = sampleProducts.findIndex(x => x.id === id);
                if (idx > -1) sampleProducts.splice(idx, 1);
                renderTable();
            }));
        }

        function fillFormWithProduct(p, role) {
            document.getElementById('product_name').value = p.name;
            document.getElementById('generic_name').value = p.generic;
            document.getElementById('category').value = p.category;
            document.getElementById('price').value = p.price;
            document.getElementById('rx').checked = !!p.requires_prescription;
            document.getElementById('batch_number').value = p.batch_number || '';
            document.getElementById('quantity').value = p.quantity || 0;
            document.getElementById('expiry_date').value = p.expiry_date || '';
            document.getElementById('location').value = p.location || '';
            document.getElementById('editing_id').value = p.id;
        }

        renderTable();

        // Form handlers
        const form = document.getElementById('prod-form');
        form.addEventListener('submit', (e) => e.preventDefault());

        document.getElementById('save-product')?.addEventListener('click', (ev) => {
            ev.preventDefault();
            const id = Number(document.getElementById('editing_id').value) || 0;
            const payload = {
                name: document.getElementById('product_name').value.trim(),
                generic: document.getElementById('generic_name').value.trim(),
                category: document.getElementById('category').value,
                price: document.getElementById('price').value.trim(),
                requires_prescription: document.getElementById('rx').checked,
                batch_number: document.getElementById('batch_number').value.trim(),
                quantity: Number(document.getElementById('quantity').value) || 0,
                expiry_date: document.getElementById('expiry_date').value,
                location: document.getElementById('location').value.trim(),
            };
            if (!payload.name || !payload.price) { alert('Name and price required'); return; }
            if (id) {
                const p = sampleProducts.find(x => x.id === id);
                if (p) Object.assign(p, payload);
            } else {
                const newId = Math.max(0, ...sampleProducts.map(x => x.id)) + 1;
                sampleProducts.push(Object.assign({ id: newId }, payload));
            }
            renderTable();
            form.reset();
            document.getElementById('editing_id').value = '';
        });

        document.getElementById('adjust-stock')?.addEventListener('click', (ev) => {
            ev.preventDefault();
            const id = Number(document.getElementById('editing_id').value) || 0;
            if (!id) { alert('Select a product first'); return; }
            const p = sampleProducts.find(x => x.id === id);
            if (!p) { alert('Product not found'); return; }
            const newQty = Number(document.getElementById('quantity').value) || 0;
            p.quantity = newQty;
            renderTable();
            alert('Stock updated (UI-only)');
        });

        document.getElementById('add-to-order')?.addEventListener('click', (ev) => {
            ev.preventDefault();
            const id = Number(document.getElementById('editing_id').value) || 0;
            if (!id) { alert('Select a product first'); return; }
            alert('Added to order (UI-only)');
        });

        document.getElementById('dashboard-add')?.addEventListener('click', () => {
            document.getElementById('prod-form').scrollIntoView({ behavior: 'smooth' });
        });
    }

    nav.addEventListener('click', (e) => {
        e.preventDefault();
        const role = detectRole();
        populateDashboardWithProducts(role);
    });

    // Allow restoring the initial dashboard when Dashboard nav is clicked
    const navDashboard = document.getElementById('nav-dashboard');
    if (navDashboard) {
        navDashboard.addEventListener('click', (ev) => {
            ev.preventDefault();
            if (typeof window.showInitialDashboard === 'function') {
                window.showInitialDashboard();
            } else {
                location.reload();
            }
        });
    }
});