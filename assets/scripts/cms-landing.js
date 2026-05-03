(function () {

  // ── Helpers ────────────────────────────────────────────────────────────────

  function getRole() {
    const el = document.getElementById('current-role');
    return el ? el.textContent.trim().toLowerCase() : '';
  }

  function sanitize(str) { return String(str || ''); }

  function escapeHtml(s) {
    return sanitize(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function setActiveNav(el) {
    document.querySelectorAll('#sidebar nav a').forEach(a => a.classList.remove('bg-[#e53935]', 'text-white'));
    if (el) el.classList.add('bg-[#e53935]', 'text-white');
  }

  async function fetchIndexHtml() {
    const res = await fetch('../index.html');
    if (!res.ok) throw new Error('Failed to fetch index.html (status ' + res.status + ')');
    return await res.text();
  }

  async function parseInitial(htmlText) {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(htmlText, 'text/html');
    const qs     = sel => doc.querySelector(sel);

    const announce      = qs('.announce-bar')?.textContent.trim()           || '';
    const heroTitle     = qs('.hero-title')?.innerHTML.trim()                || '';
    const heroDesc      = qs('.hero-desc')?.textContent.trim()               || '';
    const ctaPrimary    = qs('.hero-cta .btn-primary')?.textContent.trim()   || '';
    const ctaSecondary  = qs('.hero-cta .btn-outline')?.textContent.trim()   || '';
    const popularItems  = Array.from(doc.querySelectorAll('.hc-items .hc-item'))
                            .map(el => el.textContent.trim().replace(/\s+/g, ' '));

    // Extra sections
    const tagline     = qs('.hero-tagline')?.textContent.trim()              || '';
    const footerText  = qs('footer .footer-copy')?.textContent.trim()        || '';
    const metaTitle   = qs('title')?.textContent.trim()                      || '';
    const metaDesc    = qs('meta[name="description"]')?.getAttribute('content') || '';
    const ogTitle     = qs('meta[property="og:title"]')?.getAttribute('content') || '';
    const ogDesc      = qs('meta[property="og:description"]')?.getAttribute('content') || '';

    return {
      announce, heroTitle, heroDesc, ctaPrimary, ctaSecondary,
      popularItems: popularItems.length ? popularItems : ['Paracetamol 500mg', 'Vitamin C', 'Amoxicillin'],
      tagline, footerText, metaTitle, metaDesc, ogTitle, ogDesc,
      raw: htmlText
    };
  }

  async function generateUpdatedHtml(initialHtml, edits) {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(initialHtml, 'text/html');
    const qs     = sel => doc.querySelector(sel);

    if (qs('.announce-bar'))            qs('.announce-bar').textContent     = edits.announce;
    if (qs('.hero-title'))              qs('.hero-title').innerHTML          = edits.heroTitle;
    if (qs('.hero-desc'))               qs('.hero-desc').textContent         = edits.heroDesc;
    if (qs('.hero-cta .btn-primary'))   qs('.hero-cta .btn-primary').textContent  = edits.ctaPrimary;
    if (qs('.hero-cta .btn-outline'))   qs('.hero-cta .btn-outline').textContent  = edits.ctaSecondary;
    if (qs('.hero-tagline'))            qs('.hero-tagline').textContent      = edits.tagline;
    if (qs('footer .footer-copy'))      qs('footer .footer-copy').textContent = edits.footerText;
    if (qs('title'))                    qs('title').textContent               = edits.metaTitle;
    if (qs('meta[name="description"]')) qs('meta[name="description"]').setAttribute('content', edits.metaDesc);
    if (qs('meta[property="og:title"]'))       qs('meta[property="og:title"]').setAttribute('content', edits.ogTitle);
    if (qs('meta[property="og:description"]')) qs('meta[property="og:description"]').setAttribute('content', edits.ogDesc);

    const hcItems = qs('.hc-items');
    if (hcItems) {
      hcItems.innerHTML = '';
      edits.popularItems.forEach(text => {
        const div = doc.createElement('div');
        div.className   = 'hc-item';
        div.textContent = text;
        hcItems.appendChild(div);
      });
    }

    return '<!doctype html>\n' + doc.documentElement.outerHTML;
  }

  function renderPreviewFromDOMString(htmlStr, previewEl) {
    try {
      const parser = new DOMParser();
      const doc    = parser.parseFromString(htmlStr, 'text/html');
      const hero   = doc.querySelector('#hero');
      previewEl.innerHTML = '';
      if (hero) {
        const clone = document.importNode(hero, true);
        clone.style.maxWidth  = '100%';
        clone.style.borderRadius = '12px';
        clone.style.overflow  = 'hidden';
        previewEl.appendChild(clone);
      } else {
        previewEl.innerHTML = `<p class="text-sm text-gray-400 text-center py-8">No #hero section found in index.html</p>`;
      }
    } catch (err) {
      previewEl.textContent = 'Preview error: ' + err.message;
    }
  }

  // ── Shared UI tokens ───────────────────────────────────────────────────────

  const inputCls = 'w-full border border-gray-200 dark:border-white/[0.1] rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow font-[inherit]';
  const labelCls = 'text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5';

  function sectionCard(title, icon, content) {
    return `
      <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm overflow-hidden">
        <div class="px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2.5">
          <span class="text-sm">${icon}</span>
          <h4 class="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">${title}</h4>
        </div>
        <div class="p-5 space-y-4">${content}</div>
      </div>`;
  }

  function field(id, label, type, value, rows, hint) {
    const el = type === 'textarea'
      ? `<textarea id="${id}" class="${inputCls}" rows="${rows || 3}">${escapeHtml(value)}</textarea>`
      : `<input id="${id}" type="text" class="${inputCls}" value="${escapeHtml(value)}" />`;
    return `
      <div>
        <label for="${id}" class="${labelCls}">${label}</label>
        ${el}
        ${hint ? `<p class="text-[10px] text-gray-400 mt-1">${hint}</p>` : ''}
      </div>`;
  }

  // ── Build the editor shell ─────────────────────────────────────────────────

  function buildEditor(initial) {
    return `
      <!-- Header -->
      <div class="mb-5 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 class="text-base font-bold text-gray-800 dark:text-white tracking-tight">🖊️ CMS — Landing Page Editor</h2>
          <p class="text-xs text-gray-400 mt-0.5">Edit and preview the public-facing landing page content</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button id="cms-preview-btn"
            class="inline-flex items-center gap-1.5 border border-gray-200 dark:border-white/[0.1] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Preview in Tab
          </button>
          <button id="cms-download-btn"
            class="inline-flex items-center gap-1.5 border border-gray-200 dark:border-white/[0.1] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download HTML
          </button>
          <button id="cms-apply-btn"
            class="inline-flex items-center gap-1.5 bg-[#e53935] hover:bg-[#c62828] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Apply & Preview
          </button>
        </div>
      </div>

      <!-- Status bar -->
      <div id="cms-status" class="hidden mb-4 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2"></div>

      <!-- Unsaved changes badge -->
      <div id="cms-dirty" class="hidden mb-4 px-4 py-3 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 flex items-center gap-2">
        ⚠️ You have unsaved changes — click <strong>Apply & Preview</strong> to update the preview, or <strong>Download HTML</strong> to save.
        <button id="cms-reset-btn" class="ml-auto text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline">Reset</button>
      </div>

      <!-- Tab nav -->
      <div class="flex gap-1 mb-4 bg-gray-100 dark:bg-white/[0.04] p-1 rounded-xl w-fit">
        ${['Content', 'SEO & Meta', 'Preview'].map((tab, i) => `
          <button data-tab="${i}"
            class="cms-tab text-xs font-semibold px-4 py-2 rounded-lg transition-colors
              ${i === 0 ? 'bg-white dark:bg-white/[0.08] text-gray-700 dark:text-gray-200 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}">
            ${['📝 Content', '🔍 SEO & Meta', '👁️ Preview'][i]}
          </button>`).join('')}
      </div>

      <!-- Tab: Content -->
      <div id="cms-tab-0" class="cms-tab-panel space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

          ${sectionCard('Announcement Bar', '📢', `
            ${field('cms-ann', 'Announcement text', 'text', initial.announce, null, 'Shown at the very top of the page. Keep it short (under 80 characters).')}
          `)}

          ${sectionCard('Hero Section', '🦸', `
            ${field('cms-hero-tagline', 'Tagline / Eyebrow', 'text', initial.tagline, null, 'Small text shown above the main title.')}
            ${field('cms-hero-title', 'Hero Title (HTML allowed)', 'textarea', initial.heroTitle, 4, 'You can use &lt;strong&gt;, &lt;br&gt;, or &lt;span class="..."&gt; here.')}
            ${field('cms-hero-desc', 'Hero Description', 'textarea', initial.heroDesc, 3, 'One to two sentences describing the pharmacy.')}
          `)}

          ${sectionCard('Call-to-Action Buttons', '🖱️', `
            ${field('cms-cta-primary', 'Primary Button Label', 'text', initial.ctaPrimary, null, 'Main action — e.g. "Shop Now" or "Book Appointment".')}
            ${field('cms-cta-secondary', 'Secondary Button Label', 'text', initial.ctaSecondary, null, 'Supporting action — e.g. "Learn More" or "Browse Products".')}
          `)}

          ${sectionCard('Popular / Featured Items', '💊', `
            ${field('cms-popular', 'Popular Items (one per line)', 'textarea', initial.popularItems.join('\n'), 8, 'Each line becomes one item card in the hero visual area.')}
            <div id="popular-preview" class="flex flex-wrap gap-2 mt-1">
              ${initial.popularItems.map(p => `<span class="text-[11px] font-semibold bg-[#e53935]/10 text-[#e53935] border border-[#e53935]/20 px-2.5 py-1 rounded-lg">${escapeHtml(p)}</span>`).join('')}
            </div>
          `)}

        </div>

        ${sectionCard('Footer', '🦶', `
          ${field('cms-footer-copy', 'Footer copyright / tagline', 'text', initial.footerText, null, 'e.g. "© 2026 RS Pharmacy. All rights reserved."')}
        `)}
      </div>

      <!-- Tab: SEO & Meta -->
      <div id="cms-tab-1" class="cms-tab-panel hidden space-y-4">
        ${sectionCard('Page Meta', '🏷️', `
          <div class="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-400 font-medium mb-2">
            ⚠️ Meta tag changes affect SEO and social sharing. These are written into the downloaded HTML only.
          </div>
          ${field('cms-meta-title', 'Page Title (&lt;title&gt;)', 'text', initial.metaTitle, null, 'Shown in browser tab and Google results. Aim for 50–60 characters.')}
          ${field('cms-meta-desc', 'Meta Description', 'textarea', initial.metaDesc, 3, 'Shown in search results. Aim for 150–160 characters.')}
        `)}

        ${sectionCard('Open Graph (Social Sharing)', '🌐', `
          ${field('cms-og-title', 'OG Title', 'text', initial.ogTitle, null, 'Title shown when the page is shared on Facebook, Messenger, etc.')}
          ${field('cms-og-desc', 'OG Description', 'textarea', initial.ogDesc, 3, 'Description shown in social share cards.')}
        `)}

        <!-- Live SEO score -->
        <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm p-5">
          <h4 class="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-3">🧮 SEO Checklist</h4>
          <div id="seo-checklist" class="space-y-2 text-xs"></div>
        </div>
      </div>

      <!-- Tab: Preview -->
      <div id="cms-tab-2" class="cms-tab-panel hidden">
        <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.05]">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-red-400"></span>
              <span class="w-3 h-3 rounded-full bg-amber-400"></span>
              <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span class="ml-3 text-xs font-mono text-gray-400 dark:text-gray-500">index.html — Hero Preview</span>
            </div>
            <button id="cms-apply-preview-btn"
              class="text-[11px] font-semibold text-[#e53935] hover:bg-red-50 dark:hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-colors">
              ↺ Refresh Preview
            </button>
          </div>
          <div id="cms-preview-area" class="p-4 min-h-[200px] bg-gray-50 dark:bg-[#0d0d0d]">
            <p class="text-xs text-gray-400 text-center py-12">Click <strong>Apply & Preview</strong> to render the hero section here.</p>
          </div>
        </div>
      </div>
    `;
  }

  // ── SEO checklist ──────────────────────────────────────────────────────────

  function updateSeoChecklist() {
    const el = document.getElementById('seo-checklist');
    if (!el) return;

    const title   = (document.getElementById('cms-meta-title')?.value  || '').trim();
    const desc    = (document.getElementById('cms-meta-desc')?.value   || '').trim();
    const ogTitle = (document.getElementById('cms-og-title')?.value    || '').trim();
    const ogDesc  = (document.getElementById('cms-og-desc')?.value     || '').trim();
    const ann     = (document.getElementById('cms-ann')?.value         || '').trim();

    const checks = [
      { label: 'Page title set',              pass: title.length > 0,                    note: title.length ? `${title.length} chars` : 'Empty' },
      { label: 'Title ≤ 60 characters',       pass: title.length > 0 && title.length <= 60, note: title.length ? `${title.length}/60` : '—' },
      { label: 'Meta description set',        pass: desc.length > 0,                     note: desc.length ? `${desc.length} chars` : 'Empty' },
      { label: 'Meta description ≤ 160 chars',pass: desc.length > 0 && desc.length <= 160, note: desc.length ? `${desc.length}/160` : '—' },
      { label: 'OG title set',                pass: ogTitle.length > 0,                  note: ogTitle.length ? `${ogTitle.length} chars` : 'Empty' },
      { label: 'OG description set',          pass: ogDesc.length > 0,                   note: ogDesc.length ? `${ogDesc.length} chars` : 'Empty' },
      { label: 'Announcement bar not empty',  pass: ann.length > 0,                      note: ann.length ? `${ann.length} chars` : 'Empty' },
      { label: 'Announcement ≤ 80 chars',     pass: ann.length > 0 && ann.length <= 80,  note: ann.length ? `${ann.length}/80` : '—' },
    ];

    const passed = checks.filter(c => c.pass).length;
    const score  = Math.round((passed / checks.length) * 100);
    const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#e53935';

    el.innerHTML = `
      <div class="flex items-center gap-3 mb-3 p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
        <div class="text-2xl font-bold" style="color:${scoreColor}">${score}</div>
        <div>
          <div class="text-xs font-bold text-gray-700 dark:text-gray-200">SEO Score</div>
          <div class="text-[10px] text-gray-400">${passed}/${checks.length} checks passed</div>
        </div>
        <div class="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] ml-2">
          <div class="h-full rounded-full transition-all" style="width:${score}%;background:${scoreColor}"></div>
        </div>
      </div>
      ${checks.map(c => `
        <div class="flex items-center justify-between py-1.5">
          <div class="flex items-center gap-2">
            <span class="${c.pass ? 'text-emerald-500' : 'text-red-400'}">${c.pass ? '✅' : '❌'}</span>
            <span class="${c.pass ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}">${c.label}</span>
          </div>
          <span class="text-[10px] text-gray-400 font-mono">${c.note}</span>
        </div>`).join('')}`;
  }

  // ── Popular items live preview ─────────────────────────────────────────────

  function updatePopularPreview() {
    const el = document.getElementById('popular-preview');
    const ta = document.getElementById('cms-popular');
    if (!el || !ta) return;
    const items = ta.value.split('\n').map(s => s.trim()).filter(Boolean);
    el.innerHTML = items.map(p =>
      `<span class="text-[11px] font-semibold bg-[#e53935]/10 text-[#e53935] border border-[#e53935]/20 px-2.5 py-1 rounded-lg">${escapeHtml(p)}</span>`
    ).join('') || '<span class="text-xs text-gray-400">No items listed yet</span>';
  }

  // ── Character counters ─────────────────────────────────────────────────────

  function attachCharCounter(id, max) {
    const el = document.getElementById(id);
    if (!el) return;
    const wrap = el.parentElement;
    const hint = wrap.querySelector('p');
    el.addEventListener('input', () => {
      const len   = el.value.length;
      const over  = max && len > max;
      const color = over ? 'text-red-500' : len > max * 0.85 ? 'text-amber-500' : 'text-gray-400';
      if (hint) {
        hint.innerHTML = hint.innerHTML.replace(/\s*\(\d+\/\d+\)/, '');
        hint.innerHTML += ` <span class="${color}">(${len}${max ? '/' + max : ''})</span>`;
      }
    });
  }

  // ── Status toast ───────────────────────────────────────────────────────────

  function showStatus(msg, type = 'success') {
    const el = document.getElementById('cms-status');
    if (!el) return;
    const colors = {
      success: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20',
      error:   'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20',
    };
    el.className = `mb-4 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${colors[type]}`;
    el.innerHTML = `${type === 'success' ? '✅' : '❌'} ${msg}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 4000);
  }

  // ── Dirty flag ─────────────────────────────────────────────────────────────

  function watchDirty() {
    const ids = ['cms-ann','cms-hero-tagline','cms-hero-title','cms-hero-desc',
                 'cms-cta-primary','cms-cta-secondary','cms-popular','cms-footer-copy',
                 'cms-meta-title','cms-meta-desc','cms-og-title','cms-og-desc'];
    ids.forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => {
        document.getElementById('cms-dirty')?.classList.remove('hidden');
      });
    });
  }

  // ── Collect edits ──────────────────────────────────────────────────────────

  function collectEdits() {
    return {
      announce:     document.getElementById('cms-ann')?.value          || '',
      tagline:      document.getElementById('cms-hero-tagline')?.value || '',
      heroTitle:    document.getElementById('cms-hero-title')?.value   || '',
      heroDesc:     document.getElementById('cms-hero-desc')?.value    || '',
      ctaPrimary:   document.getElementById('cms-cta-primary')?.value  || '',
      ctaSecondary: document.getElementById('cms-cta-secondary')?.value || '',
      popularItems: (document.getElementById('cms-popular')?.value || '').split('\n').map(s => s.trim()).filter(Boolean),
      footerText:   document.getElementById('cms-footer-copy')?.value  || '',
      metaTitle:    document.getElementById('cms-meta-title')?.value   || '',
      metaDesc:     document.getElementById('cms-meta-desc')?.value    || '',
      ogTitle:      document.getElementById('cms-og-title')?.value     || '',
      ogDesc:       document.getElementById('cms-og-desc')?.value      || '',
    };
  }

  // ── Reset fields ───────────────────────────────────────────────────────────

  function resetFields(initial) {
    const map = {
      'cms-ann':          initial.announce,
      'cms-hero-tagline': initial.tagline,
      'cms-hero-title':   initial.heroTitle,
      'cms-hero-desc':    initial.heroDesc,
      'cms-cta-primary':  initial.ctaPrimary,
      'cms-cta-secondary':initial.ctaSecondary,
      'cms-popular':      initial.popularItems.join('\n'),
      'cms-footer-copy':  initial.footerText,
      'cms-meta-title':   initial.metaTitle,
      'cms-meta-desc':    initial.metaDesc,
      'cms-og-title':     initial.ogTitle,
      'cms-og-desc':      initial.ogDesc,
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
    document.getElementById('cms-preview-area').innerHTML =
      '<p class="text-xs text-gray-400 text-center py-12">Click <strong>Apply & Preview</strong> to render the hero section here.</p>';
    document.getElementById('cms-dirty')?.classList.add('hidden');
    updatePopularPreview();
    updateSeoChecklist();
  }

  // ── Tab switching ──────────────────────────────────────────────────────────

  function switchTab(idx) {
    document.querySelectorAll('.cms-tab-panel').forEach((p, i) => {
      p.classList.toggle('hidden', i !== idx);
    });
    document.querySelectorAll('.cms-tab').forEach((btn, i) => {
      const active = i === idx;
      btn.classList.toggle('bg-white', active);
      btn.classList.toggle('dark:bg-white/[0.08]', active);
      btn.classList.toggle('text-gray-700', active);
      btn.classList.toggle('dark:text-gray-200', active);
      btn.classList.toggle('shadow-sm', active);
      btn.classList.toggle('text-gray-500', !active);
      btn.classList.toggle('dark:text-gray-400', !active);
    });
    if (idx === 1) updateSeoChecklist();
  }

  // ── Main render ────────────────────────────────────────────────────────────

  async function render() {
    const cmsNav   = document.getElementById('nav-cms');
    const container = document.getElementById('role-dashboard');
    if (!container) return;

    setActiveNav(cmsNav);

    if (!getRole().includes('admin')) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <div class="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-3xl">🔒</div>
          <p class="text-sm font-bold text-gray-600 dark:text-gray-300">Access Restricted</p>
          <p class="text-xs text-gray-400">The CMS is visible to admins only.</p>
        </div>`;
      return;
    }

    // Loading state
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-64 gap-3 text-center animate-pulse">
        <div class="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-2xl">🖊️</div>
        <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">Loading index.html…</p>
      </div>`;

    let initialHtml, initial;
    try {
      initialHtml = await fetchIndexHtml();
      initial     = await parseInitial(initialHtml);
    } catch (err) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <div class="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-3xl">⚠️</div>
          <p class="text-sm font-bold text-gray-700 dark:text-gray-200">Could not load index.html</p>
          <p class="text-xs text-gray-400 max-w-xs">${escapeHtml(err.message)}</p>
          <p class="text-[10px] text-gray-400">Make sure the server is running and index.html is accessible at <code class="font-mono bg-gray-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded">../index.html</code></p>
        </div>`;
      return;
    }

    container.innerHTML = buildEditor(initial);
    container._lastUpdated = null;

    // Tab wiring
    document.querySelectorAll('.cms-tab').forEach((btn, i) => {
      btn.addEventListener('click', () => switchTab(i));
    });

    // Apply & Preview
    async function applyAndPreview() {
      try {
        const edits   = collectEdits();
        const updated = await generateUpdatedHtml(initialHtml, edits);
        container._lastUpdated = updated;
        switchTab(2);
        renderPreviewFromDOMString(updated, document.getElementById('cms-preview-area'));
        document.getElementById('cms-dirty')?.classList.add('hidden');
        showStatus('Preview updated successfully.');
      } catch (err) {
        showStatus('Error: ' + err.message, 'error');
      }
    }

    document.getElementById('cms-apply-btn')?.addEventListener('click', applyAndPreview);
    document.getElementById('cms-apply-preview-btn')?.addEventListener('click', applyAndPreview);

    // Preview in tab
    document.getElementById('cms-preview-btn')?.addEventListener('click', async () => {
      let data = container._lastUpdated;
      if (!data) {
        const edits = collectEdits();
        data = await generateUpdatedHtml(initialHtml, edits);
      }
      const w = window.open('', '_blank', 'noopener');
      if (!w) { showStatus('Popup blocked. Allow popups to preview.', 'error'); return; }
      w.document.open(); w.document.write(data); w.document.close(); w.focus();
    });

    // Download
    document.getElementById('cms-download-btn')?.addEventListener('click', async () => {
      let data = container._lastUpdated;
      if (!data) {
        const edits = collectEdits();
        data = await generateUpdatedHtml(initialHtml, edits);
      }
      const blob = new Blob([data], { type: 'text/html' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'index.updated.html';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      showStatus('index.updated.html downloaded.');
    });

    // Reset
    document.getElementById('cms-reset-btn')?.addEventListener('click', () => {
      if (!confirm('Reset all fields to the original values?')) return;
      resetFields(initial);
      showStatus('Fields reset to original values.');
    });

    // Popular preview live update
    document.getElementById('cms-popular')?.addEventListener('input', updatePopularPreview);

    // SEO checklist live update
    ['cms-meta-title','cms-meta-desc','cms-og-title','cms-og-desc','cms-ann'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', updateSeoChecklist);
    });

    // Character counters
    attachCharCounter('cms-ann',       80);
    attachCharCounter('cms-meta-title', 60);
    attachCharCounter('cms-meta-desc', 160);
    attachCharCounter('cms-og-title',   60);
    attachCharCounter('cms-og-desc',   160);

    // Dirty flag
    watchDirty();

    // Initial SEO check
    updateSeoChecklist();
  }

  // ── Wire nav ───────────────────────────────────────────────────────────────

  function wire() {
    const cmsNav = document.getElementById('nav-cms');
    if (!cmsNav) return;
    cmsNav.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.setActiveSidebar) window.setActiveSidebar('nav-cms');
      render();
    });
  }

  document.addEventListener('DOMContentLoaded', () => { wire(); });

})();