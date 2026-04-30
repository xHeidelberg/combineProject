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

    function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

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

        // set products nav active
        (function setActiveNav(id) {
            const links = document.querySelectorAll('#sidebar nav a');
            links.forEach(a => {
                a.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-900', 'dark:text-white');
            });
            const el = document.getElementById(id);
            if (el) el.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-900', 'dark:text-white');
        })('nav-products');

        container.innerHTML = `
      <div class="mb-4 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200">📦 Products</h2>
        <div>
          ${role === 'admin' ? '<button id="dashboard-add" class="bg-green-600 text-white px-3 py-1 rounded text-sm">➕ New Product</button>' : ''}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <table id="prod-table" class="w-full text-sm bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
            <thead class="bg-gray-50 dark:bg-gray-700 text-left text-xs text-gray-600 dark:text-gray-300"><tr>
              <th class="p-2">Product</th>
              <th class="p-2">Generic</th>
              <th class="p-2">Category</th>
              <th class="p-2">Price</th>
              <th class="p-2">Qty</th>
              <th class="p-2">Actions</th>
            </tr></thead>
            <tbody id="prod-tbody" class="text-gray-700 dark:text-gray-300"></tbody>
          </table>
        </div>

        <div>
          <form id="prod-form" class="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h3 class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">Product / Inventory</h3>

            <label class="text-xs">Product Name:</label>
            <input type="text" id="product_name" name="product_name" placeholder="e.g., Amoxicillin" required class="w-full border dark:border-gray-600 rounded px-2 py-1 mt-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />

            <label class="text-xs mt-2">Generic Name:</label>
            <input type="text" id="generic_name" name="generic_name" placeholder="e.g., Amoxil" class="w-full border dark:border-gray-600 rounded px-2 py-1 mt-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />

            <label class="text-xs mt-2">Category:</label>
            <select id="category" name="category" class="w-full border dark:border-gray-600 rounded px-2 py-1 mt-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
              <option value="Tablet">Tablet</option>
              <option value="Syrup">Syrup</option>
              <option value="Capsule">Capsule</option>
            </select>

            <label class="text-xs mt-2">Price ($):</label>
            <input type="number" step="0.01" id="price" name="price" required class="w-full border dark:border-gray-600 rounded px-2 py-1 mt-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />

            <div class="flex items-center gap-2 mt-2">
              <input type="checkbox" id="rx" name="requires_prescription" value="1" />
              <label class="text-xs">Requires Prescription?</label>
            </div>

            <hr class="my-3" />

            <label class="text-xs">Batch Number:</label>
            <input type="text" id="batch_number" name="batch_number" required class="w-full border dark:border-gray-600 rounded px-2 py-1 mt-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />

            <label class="text-xs mt-2">Initial Quantity:</label>
            <input type="number" id="quantity" name="quantity" required class="w-full border dark:border-gray-600 rounded px-2 py-1 mt-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />

            <label class="text-xs mt-2">Expiry Date:</label>
            <input type="date" id="expiry_date" name="expiry_date" required class="w-full border dark:border-gray-600 rounded px-2 py-1 mt-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />

            <label class="text-xs mt-2">Storage Location:</label>
            <input type="text" id="location" name="location" placeholder="e.g., Shelf A-12" class="w-full border dark:border-gray-600 rounded px-2 py-1 mt-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />

            <input type="hidden" id="editing_id" />

            <div class="mt-4 flex justify-end gap-2">
              ${role === 'admin' ? '<button id="save-product" class="bg-green-600 text-white px-3 py-1 rounded">Save Product</button>' : ''}
              ${role === 'pharmacist' ? '<button id="adjust-stock" class="bg-blue-600 text-white px-3 py-1 rounded">Adjust Stock</button>' : ''}
              ${role === 'staff' ? '<button id="add-to-order" class="bg-green-600 text-white px-3 py-1 rounded">Add to Order</button>' : ''}
            </div>
          </form>
        </div>
      </div>
    `;

        // render table rows
        function renderTable() {
            const tbody = document.getElementById('prod-tbody');
            tbody.innerHTML = '';
            sampleProducts.forEach(p => {
                const tr = document.createElement('tr');
                tr.className = 'border-b dark:border-gray-700';
                tr.innerHTML = `
          <td class="p-2">${escapeHtml(p.name)}</td>
          <td class="p-2">${escapeHtml(p.generic)}</td>
          <td class="p-2">${escapeHtml(p.category)}</td>
          <td class="p-2">₱${escapeHtml(String(p.price))}</td>
          <td class="p-2">${escapeHtml(String(p.quantity))}</td>
          <td class="p-2"><button data-id="${p.id}" class="view-btn text-xs text-blue-600">View</button> ${role === 'admin' ? '<button data-id="' + p.id + '" class="edit-btn text-xs text-green-600 ml-2">Edit</button> <button data-id="' + p.id + '" class="del-btn text-xs text-red-600 ml-2">Delete</button>' : ''}</td>
        `;
                tbody.appendChild(tr);
            });

            // attach view/edit/delete handlers
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

        // form handlers
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
            // clear form
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

        // optional quick-create button
        document.getElementById('dashboard-add')?.addEventListener('click', () => {
            document.getElementById('prod-form').scrollIntoView({ behavior: 'smooth' });
        });
    }

    nav.addEventListener('click', (e) => {
        e.preventDefault();
        const role = detectRole();
        populateDashboardWithProducts(role);
    });

    // allow restoring the initial dashboard when Dashboard nav is clicked
    const navDashboard = document.getElementById('nav-dashboard');
    if (navDashboard) {
        navDashboard.addEventListener('click', (ev) => {
            ev.preventDefault();
            if (typeof window.showInitialDashboard === 'function') {
                window.showInitialDashboard();
            } else {
                // fallback: reload page
                location.reload();
            }
        });
    }
});
