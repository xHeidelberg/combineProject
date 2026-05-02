document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav-supply');
  const container = document.getElementById('role-dashboard');
  if (!nav || !container) return;

  const suppliers = [
    { id: 'S1', name: 'MediCorp Distributors' },
    { id: 'S2', name: 'Healthline Supply' },
    { id: 'S3', name: 'Pharma Global' }
  ];

  // sample stock supply transactions ======================================================================
  const supplies = [
    { id: 'TX-1001', supplierId: 'S1', frequency: 'monthly', date: '2026-04-20', items: [{ sku: 'P001', name: 'Paracetamol 500mg', qty: 100, unitCost: 30 }], agent: 'Agent A', receivedBy: 'Alice', paymentMode: 'bank', status: 'Received', notes: 'On-time', expectedSalePerUnit: 45 },
    { id: 'TX-1002', supplierId: 'S2', frequency: 'weekly', date: '2026-04-28', items: [{ sku: 'P003', name: 'Cough Syrup 100ml', qty: 50, unitCost: 70 }], agent: 'Agent B', receivedBy: 'Bob', paymentMode: 'cash', status: 'Ordered', notes: '', expectedSalePerUnit: 95 }
  ];

  function getRole(){ const b = document.getElementById('current-role'); const userName = document.getElementById('user-name')?.textContent?.trim()||''; if(!b) return {role:'staff', userName}; const t=b.textContent||''; if(/admin/i.test(t)) return {role:'admin', userName}; if(/staff/i.test(t)) return {role:'staff', userName}; return {role:'staff', userName}; }

  function setActiveNav(target){
    if (window.setActiveSidebar) return window.setActiveSidebar(target);
    const links = document.querySelectorAll('#sidebar nav a');
    links.forEach(a => a.classList.remove('active-nav','bg-[#e53935]','text-white'));
    const el = (typeof target === 'string') ? document.getElementById(target) : target;
    if (el) el.classList.add('active-nav');
  }

  function formatCurrency(n){ return '₱'+Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}); }

  function computeTotals(tx){
    const totalCost = tx.items.reduce((s,i)=> s + (i.qty * i.unitCost),0);
    const potentialRevenue = tx.items.reduce((s,i)=> s + (i.qty * (tx.expectedSalePerUnit || (i.unitCost*1.5))),0);
    const possibleProfit = potentialRevenue - totalCost;
    return { totalCost, potentialRevenue, possibleProfit };
  }

  function buildStats(){
    const totalSuppliers = suppliers.length;
    const totalTx = supplies.length;
    const received = supplies.filter(s=>s.status==='Received').length;
    return `
      <div class="grid grid-cols-3 gap-3 mb-4">
        <div class="bg-white dark:bg-[#161616] rounded-2xl p-4 border"> <p class="text-xs text-gray-400 uppercase">Suppliers</p><p class="text-2xl font-bold">${totalSuppliers}</p></div>
        <div class="bg-white dark:bg-[#161616] rounded-2xl p-4 border"> <p class="text-xs text-gray-400 uppercase">Transactions</p><p class="text-2xl font-bold">${totalTx}</p></div>
        <div class="bg-white dark:bg-[#161616] rounded-2xl p-4 border"> <p class="text-xs text-gray-400 uppercase">Received</p><p class="text-2xl font-bold">${received}</p></div>
      </div>`;
  }

  function buildList(){
    return supplies.map(tx=>{
      const sup = suppliers.find(s=>s.id===tx.supplierId) || {name:'—'};
      const totals = computeTotals(tx);
      return `
        <div class="p-3 rounded-xl border hover:bg-gray-50 dark:hover:bg-white/[0.02] flex items-start justify-between">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <div class="font-semibold truncate">${tx.id} — ${sup.name}</div>
              <div class="text-xs text-gray-400">${tx.frequency}</div>
            </div>
            <div class="text-sm text-gray-500 mt-1">Date: ${tx.date} · Items: ${tx.items.length} · Total: ${formatCurrency(totals.totalCost)}</div>
            <div class="text-xs text-gray-400 mt-1">Agent: ${tx.agent} · Received by: ${tx.receivedBy || '—'}</div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <div class="text-sm font-semibold ${tx.status==='Received'?'text-green-600':'text-gray-600'}">${tx.status}</div>
            <div class="flex gap-2">
              <button data-view="${tx.id}" class="px-3 py-1 rounded border text-sm">View</button>
              ${getRole().role === 'admin' ? `<button data-edit="${tx.id}" class="px-3 py-1 rounded bg-[#e53935] text-white text-sm">Edit</button>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');
  }

  function render(){
    setActiveNav(nav);
    container.innerHTML = `
      <div class="mb-5 flex items-center justify-between">
        <div><h2 class="text-base font-bold text-gray-800 dark:text-white">📦 Stock Supply</h2><p class="text-xs text-gray-400">Manage supplier orders and receipts</p></div>
        <div class="flex items-center gap-2">${getRole().role === 'admin' ? '<button id="add-supply" class="px-4 py-2 rounded bg-[#e53935] text-white text-sm">New Supply</button>' : ''}<button id="export-supply" class="px-4 py-2 rounded border text-sm">Export</button></div>
      </div>
      ${buildStats()}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 bg-white dark:bg-[#161616] rounded-2xl p-4 border">
          <div class="flex items-center gap-2 mb-3">
            <input id="s-search" placeholder="Search transactions or supplier" class="px-3 py-2 border rounded w-full" />
            <select id="s-filter-status" class="px-2 py-2 border rounded"><option value="all">All</option><option value="Ordered">Ordered</option><option value="Received">Received</option><option value="Cancelled">Cancelled</option></select>
          </div>
          <div id="s-list" class="space-y-3">${buildList()}</div>
        </div>
        <div>
          <div class="bg-white dark:bg-[#161616] rounded-2xl p-4 border">
            <h4 class="text-sm font-semibold mb-2">Suppliers</h4>
            <div class="text-sm">${suppliers.map(s=>`<div class="py-1">${s.name}</div>`).join('')}</div>
          </div>
          <div class="bg-white dark:bg-[#161616] rounded-2xl p-4 border mt-3">
            <h4 class="text-sm font-semibold mb-2">Filters</h4>
            <div class="space-y-2">
              <select id="s-filter-frequency" class="w-full border px-3 py-2 rounded"><option value="all">All frequencies</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
            </div>
          </div>
        </div>
      </div>

      <!-- modal -->
      <div id="s-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none opacity-0 transition-opacity">
        <div id="s-modal-overlay" class="absolute inset-0 bg-black/40"></div>
        <div id="s-modal-panel" class="relative w-full max-w-2xl pointer-events-auto bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 border">
          <div id="s-modal-body"></div>
          <div class="mt-3 text-right"><button id="s-modal-close" class="px-3 py-2 rounded border">Close</button></div>
        </div>
      </div>
    `;

    wire();
  }

  function openModal(html){ const root=document.getElementById('s-modal'); const panel=document.getElementById('s-modal-panel'); const body=document.getElementById('s-modal-body'); if(!root||!body) return; body.innerHTML=html; root.classList.remove('pointer-events-none'); requestAnimationFrame(()=>{ root.style.opacity='1'; if(panel) panel.style.transform='scale(1)'; }); document.getElementById('s-modal-close')?.addEventListener('click', closeModal); document.getElementById('s-modal-overlay')?.addEventListener('click', closeModal); }
  function closeModal(){ const root=document.getElementById('s-modal'); const panel=document.getElementById('s-modal-panel'); if(!root) return; root.style.opacity='0'; if(panel) panel.style.transform='scale(.98)'; setTimeout(()=>root.classList.add('pointer-events-none'),200); }

  function wire(){
    const roleObj = getRole();
    document.getElementById('s-search')?.addEventListener('input', updateList);
    document.getElementById('s-filter-status')?.addEventListener('change', updateList);
    document.getElementById('s-filter-frequency')?.addEventListener('change', updateList);
    document.getElementById('export-supply')?.addEventListener('click', ()=>{ alert('Export not implemented in sample.'); });

    // view/edit
    container.querySelectorAll('[data-view]').forEach(b=> b.addEventListener('click', ()=>{
      const id = b.getAttribute('data-view'); const tx = supplies.find(x=>x.id===id); if(!tx) return; const sup = suppliers.find(s=>s.id===tx.supplierId)||{name:'—'}; const totals=computeTotals(tx);
      const itemsHtml = tx.items.map(it=>`<tr><td>${it.name}</td><td class="text-right">${it.qty}</td><td class="text-right">${formatCurrency(it.unitCost)}</td><td class="text-right">${formatCurrency(it.qty*it.unitCost)}</td></tr>`).join('');
      const html = `
        <h4 class="font-semibold mb-2">${tx.id} — ${sup.name}</h4>
        <div class="text-sm mb-3">Date: ${tx.date} · Frequency: ${tx.frequency} · Agent: ${tx.agent} · Received by: ${tx.receivedBy || '—'}</div>
        <table class="w-full text-sm mb-3"><thead><tr><th>Item</th><th class="text-right">Qty</th><th class="text-right">Unit</th><th class="text-right">Amount</th></tr></thead><tbody>${itemsHtml}</tbody></table>
        <div class="text-sm">Total cost: ${formatCurrency(totals.totalCost)}</div>
        <div class="text-sm">Potential revenue: ${formatCurrency(totals.potentialRevenue)}</div>
        <div class="text-sm">Possible profit: ${formatCurrency(totals.possibleProfit)}</div>
        <div class="text-sm mt-2"><strong>Payment:</strong> ${tx.paymentMode}</div>
        <div class="text-sm mt-2"><strong>Status:</strong> ${tx.status}</div>
        <div class="text-sm mt-2"><strong>Notes:</strong> ${tx.notes || '—'}</div>
      `;
      openModal(html);
    }));

    container.querySelectorAll('[data-edit]').forEach(b=> b.addEventListener('click', ()=>{
      const id = b.getAttribute('data-edit'); const tx = supplies.find(x=>x.id===id); if(!tx) return;
      const html = `
        <h4 class="font-semibold mb-2">Edit ${tx.id}</h4>
        <div class="space-y-2">
          <label class="text-xs">Status</label>
          <select id="edit-status" class="w-full border px-3 py-2 rounded"><option>Ordered</option><option>Received</option><option>Cancelled</option></select>
          <label class="text-xs">Received by</label>
          <input id="edit-recv" class="w-full border px-3 py-2 rounded" value="${tx.receivedBy||''}" />
          <div class="text-right"><button id="edit-save" class="px-3 py-2 rounded bg-[#e53935] text-white">Save</button></div>
        </div>`;
      openModal(html);
      document.getElementById('edit-save')?.addEventListener('click', ()=>{ tx.status = document.getElementById('edit-status').value; tx.receivedBy = document.getElementById('edit-recv').value; closeModal(); render(); });
    }));

    document.getElementById('add-supply')?.addEventListener('click', ()=>{
      const html = `
        <h4 class="font-semibold mb-2">New Supply</h4>
        <div class="space-y-2">
          <label class="text-xs">Supplier</label>
          <select id="new-supplier" class="w-full border px-3 py-2 rounded">${suppliers.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}</select>
          <label class="text-xs">Frequency</label>
          <select id="new-frequency" class="w-full border px-3 py-2 rounded"><option>weekly</option><option>monthly</option><option>yearly</option></select>
          <label class="text-xs">Date</label>
          <input id="new-date" type="date" class="w-full border px-3 py-2 rounded" />
          <label class="text-xs">Agent</label>
          <input id="new-agent" class="w-full border px-3 py-2 rounded" />
          <label class="text-xs">Payment mode</label>
          <select id="new-payment" class="w-full border px-3 py-2 rounded"><option>cash</option><option>bank</option><option>credit</option></select>
          <div class="text-right"><button id="new-save" class="px-3 py-2 rounded bg-[#e53935] text-white">Create</button></div>
        </div>`;
      openModal(html);
      document.getElementById('new-save')?.addEventListener('click', ()=>{
        const supplierId = document.getElementById('new-supplier').value; const freq = document.getElementById('new-frequency').value; const date = document.getElementById('new-date').value || new Date().toISOString().slice(0,10); const agent = document.getElementById('new-agent').value || ''; const payment = document.getElementById('new-payment').value;
        supplies.unshift({ id: 'TX-'+(1000+supplies.length+1), supplierId, frequency: freq, date, items: [], agent, receivedBy: '', paymentMode: payment, status: 'Ordered', notes: '' , expectedSalePerUnit: 0 }); closeModal(); render();
      });
    });

    // re-wire view/edit buttons after render
    updateList();
  }

  function updateList(){
    const q = (document.getElementById('s-search')?.value||'').toLowerCase();
    const status = document.getElementById('s-filter-status')?.value || 'all';
    const freq = document.getElementById('s-filter-frequency')?.value || 'all';
    const listRoot = document.getElementById('s-list');
    if(!listRoot) return;
    let filtered = supplies.filter(tx=>{
      if(status !== 'all' && tx.status !== status) return false;
      if(freq !== 'all' && tx.frequency !== freq) return false;
      if(q){ const sup = suppliers.find(s=>s.id===tx.supplierId); if(!(tx.id.toLowerCase().includes(q) || (sup && sup.name.toLowerCase().includes(q)))) return false; }
      return true;
    });
    listRoot.innerHTML = filtered.map(tx=>{
      const sup = suppliers.find(s=>s.id===tx.supplierId)||{name:'—'}; const totals=computeTotals(tx);
      return `
        <div class="p-3 rounded-xl border hover:bg-gray-50 dark:hover:bg-white/[0.02] flex items-start justify-between">
          <div class="min-w-0">
            <div class="flex items-center gap-2"><div class="font-semibold truncate">${tx.id} — ${sup.name}</div><div class="text-xs text-gray-400">${tx.frequency}</div></div>
            <div class="text-sm text-gray-500 mt-1">Date: ${tx.date} · Items: ${tx.items.length} · Total: ${formatCurrency(totals.totalCost)}</div>
            <div class="text-xs text-gray-400 mt-1">Agent: ${tx.agent} · Received by: ${tx.receivedBy || '—'}</div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <div class="text-sm font-semibold ${tx.status==='Received'?'text-green-600':'text-gray-600'}">${tx.status}</div>
            <div class="flex gap-2">
              <button data-view="${tx.id}" class="px-3 py-1 rounded border text-sm">View</button>
              ${getRole().role === 'admin' ? `<button data-edit="${tx.id}" class="px-3 py-1 rounded bg-[#e53935] text-white text-sm">Edit</button>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');

    // attach handlers
    container.querySelectorAll('[data-view]').forEach(b=> b.addEventListener('click', ()=>{ const id=b.getAttribute('data-view'); const tx=supplies.find(x=>x.id===id); if(!tx) return; const sup=suppliers.find(s=>s.id===tx.supplierId)||{name:'—'}; const totals=computeTotals(tx); const itemsHtml = tx.items.map(it=>`<tr><td>${it.name}</td><td class="text-right">${it.qty}</td><td class="text-right">${formatCurrency(it.unitCost)}</td><td class="text-right">${formatCurrency(it.qty*it.unitCost)}</td></tr>`).join(''); const html=`<h4 class="font-semibold mb-2">${tx.id} — ${sup.name}</h4><div class="text-sm mb-3">Date: ${tx.date} · Frequency: ${tx.frequency} · Agent: ${tx.agent} · Received by: ${tx.receivedBy||'—'}</div><table class="w-full text-sm mb-3"><thead><tr><th>Item</th><th class="text-right">Qty</th><th class="text-right">Unit</th><th class="text-right">Amount</th></tr></thead><tbody>${itemsHtml}</tbody></table><div class="text-sm">Total cost: ${formatCurrency(totals.totalCost)}</div><div class="text-sm">Potential revenue: ${formatCurrency(totals.potentialRevenue)}</div><div class="text-sm">Possible profit: ${formatCurrency(totals.possibleProfit)}</div><div class="text-sm mt-2"><strong>Payment:</strong> ${tx.paymentMode}</div><div class="text-sm mt-2"><strong>Status:</strong> ${tx.status}</div><div class="text-sm mt-2"><strong>Notes:</strong> ${tx.notes||'—'}</div>`; openModal(html); }));

    container.querySelectorAll('[data-edit]').forEach(b=> b.addEventListener('click', ()=>{ const id=b.getAttribute('data-edit'); const tx=supplies.find(x=>x.id===id); if(!tx) return; const html=`<h4 class="font-semibold mb-2">Edit ${tx.id}</h4><div class="space-y-2"><label class="text-xs">Status</label><select id="edit-status" class="w-full border px-3 py-2 rounded"><option>Ordered</option><option>Received</option><option>Cancelled</option></select><label class="text-xs">Received by</label><input id="edit-recv" class="w-full border px-3 py-2 rounded" value="${tx.receivedBy||''}" /><div class="text-right"><button id="edit-save" class="px-3 py-2 rounded bg-[#e53935] text-white">Save</button></div></div>`; openModal(html); document.getElementById('edit-save')?.addEventListener('click', ()=>{ tx.status=document.getElementById('edit-status').value; tx.receivedBy=document.getElementById('edit-recv').value; closeModal(); render(); }); }));
  }

  nav.addEventListener('click', (e)=>{ e.preventDefault(); render(); });
  if(location.hash === '#stock-supply' || location.hash === '#supply') render();
});
