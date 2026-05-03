document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav-sales-trends');
  const container = document.getElementById('role-dashboard');
  if (!nav || !container) return;

    // ================================================ sample data (replace mo nalang API fetch later)

  const AGENTS   = ['John Reyes', 'Mona Cruz', 'Alice Tan', 'Dr. Emeka', 'Ramon Lim'];
  const PRODUCTS = ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Vitamin C 500mg', 'Cough Syrup 100ml', 'Insulin 10ml', 'Metformin 500mg', 'Omeprazole 20mg'];
  const METHODS  = ['Cash', 'GCash', 'Card'];

  const sampleSales = generateSampleSales();

  function generateSampleSales() {
    const arr = [];
    for (let i = 0; i < 90; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const iso = d.toISOString();
      const count = 2 + Math.floor(Math.random() * 7);
      for (let j = 0; j < count; j++) {
        const agent   = AGENTS[Math.floor(Math.random() * AGENTS.length)];
        const channel = Math.random() > 0.55 ? 'Online' : 'POS';
        const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
        const method  = METHODS[Math.floor(Math.random() * METHODS.length)];
        const items   = Math.floor(1 + Math.random() * 5);
        const total   = Math.round(20 + Math.random() * 280);
        arr.push({ id: `S-${i}-${j}`, time: iso, agent, channel, product, method, total, items });
      }
    }
    return arr;
  }

  // ── State ──────────────────────────────────────────────────────────────────

  let periodDays    = 30;
  let filterAgent   = 'all';
  let filterChannel = 'all';
  let trendGrouping = 'daily'; // 'daily' | 'weekly'

  // ── Helpers ────────────────────────────────────────────────────────────────

  function getRole() {
    const b    = document.getElementById('current-role');
    const userName = document.getElementById('user-name')?.textContent?.trim() || '';
    if (!b) return { role: 'staff', userName };
    const t = b.textContent || '';
    if (/admin/i.test(t)) return { role: 'admin', userName };
    return { role: 'staff', userName };
  }

  function setActiveNav(el) {
    document.querySelectorAll('#sidebar nav a').forEach(a => a.classList.remove('bg-[#e53935]', 'text-white'));
    if (el) el.classList.add('bg-[#e53935]', 'text-white');
  }

  function fmt(n) {
    return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fmtK(n) {
    if (n >= 1000) return '₱' + (n / 1000).toFixed(1) + 'k';
    return '₱' + n;
  }

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  function getFilteredSales() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodDays);
    const cutoffISO = cutoff.toISOString().slice(0, 10);
    return sampleSales.filter(s => {
      if (s.time.slice(0, 10) < cutoffISO) return false;
      if (filterAgent !== 'all' && s.agent !== filterAgent) return false;
      if (filterChannel !== 'all' && s.channel !== filterChannel) return false;
      return true;
    });
  }

  function summarize(list) {
    const total  = list.reduce((s, r) => s + (r.total || 0), 0);
    const tx     = list.length;
    const avg    = tx ? Math.round(total / tx) : 0;
    const items  = list.reduce((s, r) => s + (r.items || 0), 0);
    return { total, tx, avg, items };
  }

  function pctChange(curr, prev) {
    if (!prev) return null;
    return Math.round(((curr - prev) / prev) * 100);
  }

  // ── SVG chart builders ─────────────────────────────────────────────────────

  function buildAreaChart(points, color = '#e53935', gradId = 'grad1') {
    if (points.length < 2) return '<div class="text-xs text-gray-400 text-center py-8">Not enough data</div>';
    const W = 680, H = 140, padL = 40, padR = 12, padT = 12, padB = 28;
    const max = Math.max(...points.map(p => p.value), 1);
    const xStep = (W - padL - padR) / (points.length - 1);

    const coords = points.map((p, i) => ({
      x: padL + i * xStep,
      y: padT + (H - padT - padB) * (1 - p.value / max),
      ...p
    }));

    // Catmull-Rom smooth path
    function catmullRom(pts) {
      if (pts.length < 2) return '';
      let d = `M ${pts[0].x},${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(i - 1, 0)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(i + 2, pts.length - 1)];
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
      }
      return d;
    }

    const linePath = catmullRom(coords);
    const areaPath = linePath + ` L ${coords[coords.length - 1].x},${H - padB} L ${coords[0].x},${H - padB} Z`;

    // Y-axis grid lines
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map(frac => {
      const y  = padT + (H - padT - padB) * (1 - frac);
      const val = Math.round(max * frac);
      return `
        <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="currentColor" stroke-width="0.5" stroke-dasharray="4,4" class="text-gray-200 dark:text-gray-700"/>
        <text x="${padL - 4}" y="${y + 4}" font-size="9" fill="currentColor" class="text-gray-400" text-anchor="end">${fmtK(val)}</text>`;
    }).join('');

    // X-axis labels (show every Nth)
    const nth = Math.max(1, Math.floor(points.length / 8));
    const xLabels = coords.filter((_, i) => i % nth === 0).map(c =>
      `<text x="${c.x}" y="${H - 4}" font-size="9" fill="#9ca3af" text-anchor="middle">${c.label || ''}</text>`
    ).join('');

    // Dots on data points
    const dots = coords.map(c =>
      `<circle cx="${c.x}" cy="${c.y}" r="3" fill="${color}" stroke="white" stroke-width="1.5" opacity="0.85"/>`
    ).join('');

    return `
      <svg width="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="overflow:visible">
        <defs>
          <linearGradient id="${gradId}" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${gridLines}
        <path d="${areaPath}" fill="url(#${gradId})"/>
        <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
        ${dots}
        ${xLabels}
      </svg>`;
  }

  function buildBarChart(items, color = '#e53935') {
    if (!items.length) return '<div class="text-xs text-gray-400 text-center py-6">No data</div>';
    const W = 380, H = 130, padL = 70, padR = 12, padT = 10, padB = 10;
    const max = Math.max(...items.map(i => i.value), 1);
    const barH = (H - padT - padB) / items.length;
    const bars = items.map((item, idx) => {
      const barW = ((item.value / max) * (W - padL - padR));
      const y    = padT + idx * barH;
      return `
        <rect x="${padL}" y="${y + barH * 0.15}" width="${barW}" height="${barH * 0.7}" rx="4" fill="${color}" fill-opacity="0.85"/>
        <text x="${padL - 4}" y="${y + barH * 0.65}" font-size="9.5" fill="#6b7280" text-anchor="end">${item.label}</text>
        <text x="${padL + barW + 4}" y="${y + barH * 0.65}" font-size="9" fill="#6b7280">${fmtK(item.value)}</text>`;
    }).join('');
    return `<svg width="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${bars}</svg>`;
  }

  function buildDonutChart(segments, total) {
    const cx = 60, cy = 60, r = 48, stroke = 14;
    const circumference = 2 * Math.PI * r;
    let offset = 0;
    const colors = ['#e53935', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    const paths = segments.map((seg, i) => {
      const dash = (seg.value / total) * circumference;
      const gap  = circumference - dash;
      const el = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors[i % colors.length]}"
        stroke-width="${stroke}" stroke-dasharray="${dash} ${gap}"
        stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})" opacity="0.9"/>`;
      offset += dash;
      return el;
    });
    const legend = segments.map((seg, i) => `
      <div class="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400">
        <span class="w-2 h-2 rounded-full flex-shrink-0" style="background:${colors[i % colors.length]}"></span>
        ${seg.label} <span class="text-gray-400">(${Math.round((seg.value / total) * 100)}%)</span>
      </div>`).join('');
    return `
      <div class="flex items-center gap-4">
        <svg width="120" height="120" viewBox="0 0 120 120" flex-shrink-0>
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f3f4f6" stroke-width="${stroke}"/>
          ${paths.join('')}
          <text x="${cx}" y="${cy - 4}" font-size="11" font-weight="700" fill="#111" text-anchor="middle">${fmtK(total)}</text>
          <text x="${cx}" y="${cy + 12}" font-size="8" fill="#9ca3af" text-anchor="middle">Total</text>
        </svg>
        <div class="space-y-1.5 flex-1">${legend}</div>
      </div>`;
  }

  // ── Section builders ───────────────────────────────────────────────────────

  function buildStats(filtered) {
    const pos    = filtered.filter(s => s.channel === 'POS');
    const online = filtered.filter(s => s.channel === 'Online');
    const posSum = summarize(pos);
    const onSum  = summarize(online);
    const all    = summarize(filtered);

    // Compare to prev period
    const cutoff2 = new Date(); cutoff2.setDate(cutoff2.getDate() - periodDays * 2);
    const cutoff1 = new Date(); cutoff1.setDate(cutoff1.getDate() - periodDays);
    const prevPeriod = sampleSales.filter(s => {
      const d = s.time.slice(0, 10);
      return d >= cutoff2.toISOString().slice(0, 10) && d < cutoff1.toISOString().slice(0, 10);
    });
    const prevSum = summarize(prevPeriod);
    const pct = pctChange(all.total, prevSum.total);

    const trend = pct === null ? '' : pct >= 0
      ? `<span class="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">▲ ${pct}% vs prev period</span>`
      : `<span class="text-red-500 text-[10px] font-bold">▼ ${Math.abs(pct)}% vs prev period</span>`;

    const stat = (label, val, sub, color, icon) => `
      <div class="bg-white dark:bg-[#161616] rounded-2xl p-4 border border-gray-100 dark:border-white/[0.05] shadow-sm flex items-start justify-between">
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">${label}</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">${val}</p>
          <p class="text-[11px] text-gray-400 mt-1">${sub}</p>
        </div>
        <div class="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style="background:${color}18">${icon}</div>
      </div>`;

    return `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        ${stat('Total Revenue',    fmt(all.total),    `${all.tx} transactions · ${trend}`,      '#e53935', '💰')}
        ${stat('POS Revenue',      fmt(posSum.total), `${posSum.tx} orders · Avg ${fmt(posSum.avg)}`, '#3b82f6', '🖥️')}
        ${stat('Online Revenue',   fmt(onSum.total),  `${onSum.tx} orders · Avg ${fmt(onSum.avg)}`,  '#10b981', '🌐')}
        ${stat('Avg Order Value',  fmt(all.avg),      `${all.items} total items sold`,               '#f59e0b', '📦')}
      </div>`;
  }

  function buildMainChart(filtered) {
    // Group by day or week
    const groups = {};
    filtered.forEach(s => {
      let key;
      const d = new Date(s.time);
      if (trendGrouping === 'weekly') {
        const start = new Date(d); start.setDate(d.getDate() - d.getDay());
        key = start.toISOString().slice(0, 10);
      } else {
        key = s.time.slice(0, 10);
      }
      groups[key] = (groups[key] || 0) + s.total;
    });

    const points = Object.entries(groups)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => ({
        value: v,
        label: trendGrouping === 'weekly'
          ? 'W' + Math.ceil(new Date(k).getDate() / 7) + '/' + (new Date(k).getMonth() + 1)
          : k.slice(5)
      }));

    return `
      <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm p-5 mb-4">
        <div class="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <h4 class="text-sm font-bold text-gray-800 dark:text-white tracking-tight">Revenue Over Time</h4>
            <p class="text-[11px] text-gray-400 mt-0.5">${trendGrouping === 'daily' ? 'Daily' : 'Weekly'} totals · last ${periodDays} days</p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <div class="flex rounded-xl border border-gray-200 dark:border-white/[0.1] overflow-hidden">
              <button id="grp-daily" class="text-[11px] font-semibold px-3 py-1.5 transition-colors ${trendGrouping === 'daily' ? 'bg-[#e53935] text-white' : 'bg-gray-50 dark:bg-white/[0.03] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]'}">Daily</button>
              <button id="grp-weekly" class="text-[11px] font-semibold px-3 py-1.5 transition-colors ${trendGrouping === 'weekly' ? 'bg-[#e53935] text-white' : 'bg-gray-50 dark:bg-white/[0.03] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]'}">Weekly</button>
            </div>
          </div>
        </div>
        <div class="overflow-x-auto">${buildAreaChart(points, '#e53935', 'gradMain')}</div>
      </div>`;
  }

  function buildChannelBreakdown(filtered) {
    const pos    = summarize(filtered.filter(s => s.channel === 'POS'));
    const online = summarize(filtered.filter(s => s.channel === 'Online'));
    const total  = pos.total + online.total;

    const methodTotals = {};
    filtered.forEach(s => { methodTotals[s.method] = (methodTotals[s.method] || 0) + s.total; });
    const methodSegs = Object.entries(methodTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));

    return `
      <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm p-5">
        <h4 class="text-sm font-bold text-gray-800 dark:text-white mb-1 tracking-tight">Channel & Payment Breakdown</h4>
        <p class="text-[11px] text-gray-400 mb-4">Revenue split by source and payment method</p>

        <!-- Channel bars -->
        <div class="space-y-2.5 mb-4">
          ${[{ label: '🖥️ POS', val: pos.total, color: '#3b82f6' }, { label: '🌐 Online', val: online.total, color: '#10b981' }].map(ch => `
            <div>
              <div class="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                <span>${ch.label}</span><span>${fmt(ch.val)}</span>
              </div>
              <div class="h-2 rounded-full bg-gray-100 dark:bg-white/[0.06]">
                <div class="h-full rounded-full transition-all" style="width:${total ? Math.round((ch.val / total) * 100) : 0}%;background:${ch.color}"></div>
              </div>
            </div>`).join('')}
        </div>

        <div class="h-px bg-gray-100 dark:bg-white/[0.05] my-3"></div>

        <!-- Payment donut -->
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Methods</p>
        ${buildDonutChart(methodSegs, total)}
      </div>`;
  }

  function buildProductPerformance(filtered) {
    const prodTotals = {};
    filtered.forEach(s => { prodTotals[s.product] = (prodTotals[s.product] || 0) + s.total; });
    const sorted = Object.entries(prodTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([label, value]) => ({ label: label.replace(' 500mg','').replace(' 250mg','').replace(' 100ml','').replace(' 20mg',''), value }));

    return `
      <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm p-5">
        <h4 class="text-sm font-bold text-gray-800 dark:text-white mb-1 tracking-tight">Top Products</h4>
        <p class="text-[11px] text-gray-400 mb-4">Revenue contribution by product</p>
        ${buildBarChart(sorted, '#e53935')}
      </div>`;
  }

  function buildStaffLeaderboard(filtered) {
    const agentTotals = {};
    const agentTx     = {};
    filtered.forEach(s => {
      agentTotals[s.agent] = (agentTotals[s.agent] || 0) + s.total;
      agentTx[s.agent]     = (agentTx[s.agent] || 0) + 1;
    });
    const sorted = Object.entries(agentTotals).sort((a, b) => b[1] - a[1]);
    const maxVal = sorted[0]?.[1] || 1;
    const medals = ['🥇', '🥈', '🥉'];

    const rows = sorted.map(([name, val], idx) => `
      <div class="flex items-center gap-3 py-2.5 ${idx < sorted.length - 1 ? 'border-b border-gray-50 dark:border-white/[0.04]' : ''}">
        <span class="text-base w-5 flex-shrink-0">${medals[idx] || `<span class="text-xs font-bold text-gray-400">${idx + 1}</span>`}</span>
        <div class="w-8 h-8 rounded-xl bg-[#e53935]/10 text-[#e53935] flex items-center justify-center text-[11px] font-bold flex-shrink-0">
          ${name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-semibold text-gray-700 dark:text-gray-200">${name}</div>
          <div class="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] mt-1.5">
            <div class="h-full rounded-full bg-[#e53935]" style="width:${Math.round((val / maxVal) * 100)}%"></div>
          </div>
        </div>
        <div class="text-right flex-shrink-0">
          <div class="text-xs font-bold text-gray-700 dark:text-gray-200">${fmt(val)}</div>
          <div class="text-[10px] text-gray-400">${agentTx[name]} orders</div>
        </div>
        <button data-agent="${name}" class="view-agent text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-2 py-1 rounded-lg transition-colors flex-shrink-0">View</button>
      </div>`).join('');

    return `
      <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm p-5">
        <h4 class="text-sm font-bold text-gray-800 dark:text-white mb-1 tracking-tight">🏆 Staff Leaderboard</h4>
        <p class="text-[11px] text-gray-400 mb-3">Ranked by revenue generated</p>
        <div class="divide-y-0">${rows}</div>
      </div>`;
  }

  function buildRecentTransactions(filtered) {
    const recent = [...filtered]
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 8);

    const methodColor = { Cash: 'emerald', GCash: 'blue', Card: 'violet' };
    const channelColor = { POS: 'gray', Online: 'blue' };

    return `
      <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm p-5">
        <h4 class="text-sm font-bold text-gray-800 dark:text-white mb-1 tracking-tight">Recent Transactions</h4>
        <p class="text-[11px] text-gray-400 mb-4">Latest ${recent.length} sales in selected period</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 dark:border-white/[0.05]">
                ${['Agent','Product','Channel','Method','Items','Amount'].map(h =>
                  `<th class="py-2 px-2 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">${h}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-white/[0.04]">
              ${recent.map(s => `
                <tr class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td class="py-2.5 px-2 text-xs font-semibold text-gray-700 dark:text-gray-200">${s.agent.split(' ')[0]}</td>
                  <td class="py-2.5 px-2 text-xs text-gray-500 dark:text-gray-400 max-w-[120px] truncate">${s.product}</td>
                  <td class="py-2.5 px-2">
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded-lg
                      ${s.channel === 'Online' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-400'}">
                      ${s.channel}
                    </span>
                  </td>
                  <td class="py-2.5 px-2">
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded-lg
                      ${s.method === 'GCash' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                        s.method === 'Card'  ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' :
                                               'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'}">
                      ${s.method === 'GCash' ? '📱' : s.method === 'Card' ? '💳' : '💵'} ${s.method}
                    </span>
                  </td>
                  <td class="py-2.5 px-2 text-xs text-gray-500 dark:text-gray-400 text-center">${s.items}</td>
                  <td class="py-2.5 px-2 font-mono text-xs font-bold text-gray-800 dark:text-gray-100">${fmt(s.total)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  // ── Main render ────────────────────────────────────────────────────────────

  function render() {
    setActiveNav(nav);

    if (getRole().role !== 'admin') {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <div class="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-3xl">🔒</div>
          <p class="text-sm font-bold text-gray-600 dark:text-gray-300">Access Restricted</p>
          <p class="text-xs text-gray-400">Sales analytics are visible to admins only.</p>
        </div>`;
      return;
    }

    const filtered = getFilteredSales();

    container.innerHTML = `
      <!-- Page header -->
      <div class="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 class="text-base font-bold text-gray-800 dark:text-white tracking-tight">📈 Sales Trends & Analytics</h2>
          <p class="text-xs text-gray-400 mt-0.5">Revenue performance, channel breakdown, and staff leaderboard</p>
        </div>

        <!-- Global filters -->
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Period -->
          <div class="flex rounded-xl border border-gray-200 dark:border-white/[0.1] overflow-hidden">
            ${[7, 30, 60, 90].map(d => `
              <button data-period="${d}"
                class="period-btn text-[11px] font-semibold px-3 py-2 transition-colors
                  ${periodDays === d ? 'bg-[#e53935] text-white' : 'bg-gray-50 dark:bg-white/[0.03] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]'}">
                ${d}d
              </button>`).join('')}
          </div>

          <!-- Channel -->
          <select id="filter-channel"
            class="border border-gray-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-xs font-medium bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow">
            <option value="all">All Channels</option>
            <option value="POS">POS Only</option>
            <option value="Online">Online Only</option>
          </select>

          <!-- Agent -->
          <select id="filter-agent"
            class="border border-gray-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-xs font-medium bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow">
            <option value="all">All Agents</option>
            ${AGENTS.map(a => `<option value="${a}" ${filterAgent === a ? 'selected' : ''}>${a}</option>`).join('')}
          </select>

          <!-- Export -->
          <button id="export-csv"
            class="bg-[#e53935] hover:bg-[#c62828] text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20 flex items-center gap-1.5">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      <!-- Stats row -->
      ${buildStats(filtered)}

      <!-- Main chart -->
      ${buildMainChart(filtered)}

      <!-- Row: Channel + Products -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        ${buildChannelBreakdown(filtered)}
        ${buildProductPerformance(filtered)}
      </div>

      <!-- Row: Staff leaderboard + Recent transactions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        ${buildStaffLeaderboard(filtered)}
        ${buildRecentTransactions(filtered)}
      </div>

      <!-- Agent profile modal -->
      <div id="ast-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none opacity-0 transition-opacity duration-200">
        <div id="ast-modal-overlay" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div id="ast-modal-panel"
          class="relative w-full max-w-md pointer-events-auto bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07] scale-95 transition-transform duration-200">
          <div id="ast-modal-body"></div>
        </div>
      </div>
    `;

    wire();
  }

  // ── Wire ───────────────────────────────────────────────────────────────────

  function wire() {
    // Period buttons
    container.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        periodDays = Number(btn.getAttribute('data-period'));
        render();
      });
    });

    // Channel filter
    document.getElementById('filter-channel')?.addEventListener('change', (e) => {
      filterChannel = e.target.value; render();
    });

    // Agent filter
    document.getElementById('filter-agent')?.addEventListener('change', (e) => {
      filterAgent = e.target.value; render();
    });

    // Grouping toggle
    document.getElementById('grp-daily')?.addEventListener('click',  () => { trendGrouping = 'daily';  render(); });
    document.getElementById('grp-weekly')?.addEventListener('click', () => { trendGrouping = 'weekly'; render(); });

    // Export CSV
    document.getElementById('export-csv')?.addEventListener('click', () => {
      const filtered = getFilteredSales();
      const csv = [
        ['ID', 'Date', 'Agent', 'Channel', 'Product', 'Method', 'Items', 'Total'],
        ...filtered.map(s => [s.id, s.time.slice(0, 10), s.agent, s.channel, s.product, s.method, s.items, s.total])
      ].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'sales-trends.csv';
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    });

    // Agent profile drill-down
    container.querySelectorAll('.view-agent').forEach(btn => {
      btn.addEventListener('click', () => openAgentProfile(btn.getAttribute('data-agent')));
    });
  }

  function openAgentProfile(name) {
    const modal  = document.getElementById('ast-modal');
    const panel  = document.getElementById('ast-modal-panel');
    const body   = document.getElementById('ast-modal-body');
    if (!modal || !body) return;

    const agentSales = getFilteredSales().filter(s => s.agent === name);
    const sum        = summarize(agentSales);
    const byChannel  = { POS: 0, Online: 0 };
    const byMethod   = {};
    const byDay      = {};
    agentSales.forEach(s => {
      byChannel[s.channel]  = (byChannel[s.channel]  || 0) + s.total;
      byMethod[s.method]    = (byMethod[s.method]    || 0) + s.total;
      const d = s.time.slice(0, 10);
      byDay[d] = (byDay[d] || 0) + s.total;
    });
    const dayPoints = Object.entries(byDay)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => ({ value: v, label: k.slice(5) }));

    body.innerHTML = `
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-[#e53935]/10 text-[#e53935] flex items-center justify-center text-sm font-bold">
            ${name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 class="text-sm font-bold text-gray-800 dark:text-white">${name}</h4>
            <p class="text-[10px] text-gray-400">Sales Agent Profile</p>
          </div>
        </div>
        <button id="ast-close" class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors text-sm">✕</button>
      </div>
      <div class="p-5 overflow-y-auto max-h-[70vh]">
        <!-- KPIs -->
        <div class="grid grid-cols-3 gap-2.5 mb-4">
          ${[
            ['Revenue',    fmt(sum.total), '#e53935'],
            ['Orders',     sum.tx,         '#3b82f6'],
            ['Avg Order',  fmt(sum.avg),   '#10b981'],
          ].map(([l, v, c]) => `
            <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3 text-center border border-gray-100 dark:border-white/[0.05]">
              <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">${l}</p>
              <p class="text-sm font-bold text-gray-800 dark:text-white">${v}</p>
            </div>`).join('')}
        </div>

        <!-- Revenue chart -->
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Revenue Trend</p>
        <div class="mb-4">${buildAreaChart(dayPoints, '#e53935', 'gradAgent')}</div>

        <!-- Breakdown -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3 border border-gray-100 dark:border-white/[0.05]">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Channel Split</p>
            ${Object.entries(byChannel).map(([ch, v]) => `
              <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-600 dark:text-gray-400">${ch}</span>
                <span class="font-semibold text-gray-700 dark:text-gray-200">${fmt(v)}</span>
              </div>`).join('')}
          </div>
          <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3 border border-gray-100 dark:border-white/[0.05]">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Methods</p>
            ${Object.entries(byMethod).sort((a,b)=>b[1]-a[1]).map(([m, v]) => `
              <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-600 dark:text-gray-400">${m}</span>
                <span class="font-semibold text-gray-700 dark:text-gray-200">${fmt(v)}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('pointer-events-none');
    requestAnimationFrame(() => {
      modal.style.opacity  = '1';
      if (panel) panel.style.transform = 'scale(1)';
    });

    document.getElementById('ast-close')?.addEventListener('click', closeModal);
    document.getElementById('ast-modal-overlay')?.addEventListener('click', closeModal);
  }

  function closeModal() {
    const modal = document.getElementById('ast-modal');
    const panel = document.getElementById('ast-modal-panel');
    if (!modal) return;
    modal.style.opacity = '0';
    if (panel) panel.style.transform = 'scale(0.95)';
    setTimeout(() => modal.classList.add('pointer-events-none'), 200);
  }

  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeModal(); });

  nav.addEventListener('click', e => { e.preventDefault(); render(); });
  if (location.hash === '#sales-trends' || location.hash === '#analytics-sales-trends') render();
});