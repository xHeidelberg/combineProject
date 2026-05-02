document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav-patients');
    const container = document.getElementById('role-dashboard');
    if (!nav || !container) return;

    // ================================================ sample data (replace mo nalang API fetch later)
    const doctors = [
        { id: 'D1', name: 'Dr. Maria Cruz', specialty: 'General Practitioner', color: '#e53935' },
        { id: 'D2', name: 'Dr. Jose Ramos', specialty: 'Pediatrician', color: '#3b82f6' },
        { id: 'D3', name: 'Dr. Ana Lopez', specialty: 'Internal Medicine', color: '#10b981' },
    ];

    const patients = [
        { id: 'PT-001', name: 'Juan Dela Cruz', dob: '1985-02-20', phone: '09171234567', gender: 'Male', bloodType: 'O+', assignedDoctor: 'D1', allergies: ['Penicillin'], medicalHistory: 'Hypertension', initialDiagnosis: 'Routine checkup', doctorComment: 'Monitor blood pressure weekly', status: 'Active' },
        { id: 'PT-002', name: 'Maria Santos', dob: '1992-07-10', phone: '09179876543', gender: 'Female', bloodType: 'A+', assignedDoctor: 'D2', allergies: [], medicalHistory: '', initialDiagnosis: '', doctorComment: '', status: 'Active' },
        { id: 'PT-003', name: 'Pedro Reyes', dob: '1978-11-05', phone: '09170001111', gender: 'Male', bloodType: 'B-', assignedDoctor: 'D3', allergies: ['Aspirin'], medicalHistory: 'Diabetes type 2', initialDiagnosis: 'High blood sugar', doctorComment: 'Advise diet change and follow-up in 2 weeks', status: 'Active' },
        { id: 'PT-004', name: 'Ana Lim', dob: '2001-03-18', phone: '09180001234', gender: 'Female', bloodType: 'AB+', assignedDoctor: 'D1', allergies: ['Sulfa', 'Ibuprofen'], medicalHistory: 'Asthma', initialDiagnosis: 'Mild asthma attack', doctorComment: 'Prescribe reliever inhaler', status: 'Inactive' },
    ];

    const appointments = [
        { id: 'APT-001', patientId: 'PT-001', doctorId: 'D1', date: '2026-05-04', time: '09:00', type: 'Checkup', status: 'Scheduled' },
        { id: 'APT-002', patientId: 'PT-002', doctorId: 'D2', date: '2026-05-05', time: '10:30', type: 'Vaccination', status: 'Scheduled' },
        { id: 'APT-003', patientId: 'PT-003', doctorId: 'D3', date: '2026-04-20', time: '11:00', type: 'Follow-up', status: 'Completed' },
        { id: 'APT-004', patientId: 'PT-001', doctorId: 'D1', date: '2026-04-10', time: '14:00', type: 'Consultation', status: 'Completed' },
    ];

    let activeFilter = 'all'; // 'all' | 'with-apt' | 'active' | 'inactive'
    let searchQuery = '';

    // ── Helpers ────────────────────────────────────────────────────────────────

    function getRole() {
        const badge = document.getElementById('current-role');
        const userName = document.getElementById('user-name')?.textContent?.trim() || '';
        if (!badge) return { role: 'patient', userName };
        const txt = badge.textContent || '';
        if (/admin/i.test(txt)) return { role: 'admin', userName };
        if (/staff/i.test(txt)) return { role: 'staff', userName };
        return { role: 'patient', userName };
    }

    function setActiveNav(target){
      if (window.setActiveSidebar) return window.setActiveSidebar(target);
      const links = document.querySelectorAll('#sidebar nav a');
      links.forEach(a => a.classList.remove('active-nav','bg-[#e53935]','text-white'));
      const el = (typeof target === 'string') ? document.getElementById(target) : target;
      if (el) el.classList.add('active-nav');
    }

    function calcAge(dob) {
        if (!dob) return '—';
        const diff = Date.now() - new Date(dob).getTime();
        return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
    }

    function fmt12(t) {
        if (!t) return '';
        const [hh, mm] = t.split(':').map(Number);
        const ampm = hh >= 12 ? 'PM' : 'AM';
        return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${ampm}`;
    }

    function todayISO() { return new Date().toISOString().slice(0, 10); }

    function initials(name) {
        return name.split(' ').filter((_, i) => i === 0 || i === name.split(' ').length - 1)
            .map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    const avatarColor = (id) => {
        const palette = ['#e53935', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        return palette[parseInt(id.replace(/\D/g, ''), 10) % palette.length];
    };

    // ── Shared UI tokens ───────────────────────────────────────────────────────

    const inputCls = 'w-full border border-gray-200 dark:border-white/[0.1] rounded-xl px-3 py-2.5 mt-1.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow';
    const labelCls = 'text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mt-3';

    const statusBadge = (status) => {
        const s = { Active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', Inactive: 'bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-gray-400' };
        return `<span class="text-[10px] font-semibold px-2 py-0.5 rounded-lg ${s[status] || s.Active}">${status}</span>`;
    };

    const aptStatusBadge = (status) => {
        const s = { Scheduled: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400', Completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', Cancelled: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' };
        return `<span class="text-[10px] font-semibold px-2 py-0.5 rounded-lg ${s[status] || s.Scheduled}">${status}</span>`;
    };

    const allergyPill = (a) =>
        `<span class="text-[10px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 px-2 py-0.5 rounded-lg">${a}</span>`;

    // ── Stats ──────────────────────────────────────────────────────────────────

    function buildStats() {
        const today = todayISO();
        const active = patients.filter(p => p.status === 'Active').length;
        const todayApts = appointments.filter(a => a.date === today && a.status === 'Scheduled').length;
        const withAllergies = patients.filter(p => p.allergies?.length > 0).length;

        const stat = (label, val, color, icon) => `
      <div class="bg-white dark:bg-[#161616] rounded-2xl p-4 border border-gray-100 dark:border-white/[0.05] shadow-sm flex items-start justify-between">
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">${label}</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-white">${val}</p>
        </div>
        <div class="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style="background:${color}18">${icon}</div>
      </div>`;

        return `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        ${stat('Total Patients', patients.length, '#3b82f6', '🧑‍⚕️')}
        ${stat('Active', active, '#10b981', '✅')}
        ${stat("Today's Appts", todayApts, '#e53935', '📅')}
        ${stat('With Allergies', withAllergies, '#f59e0b', '⚠️')}
      </div>`;
    }

    // ── Patient card ───────────────────────────────────────────────────────────

    function buildPatientCard(pt, roleObj) {
        const doc = doctors.find(d => d.id === pt.assignedDoctor);
        const upcoming = appointments
            .filter(a => a.patientId === pt.id && a.date >= todayISO() && a.status === 'Scheduled')
            .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
        const aptDoc = upcoming ? doctors.find(d => d.id === upcoming.doctorId) : null;
        const age = calcAge(pt.dob);
        const color = avatarColor(pt.id);

        return `
      <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm p-4 hover:shadow-md transition-shadow">
        <div class="flex items-start gap-3">

          <!-- Avatar -->
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style="background:${color}">
            ${initials(pt.name)}
          </div>

          <!-- Main info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <div class="text-sm font-bold text-gray-800 dark:text-gray-100">${pt.name}</div>
                <div class="text-[11px] text-gray-400 mt-0.5">
                  ${age} yrs · ${pt.gender || '—'} · ${pt.bloodType || '—'} · ${pt.phone}
                </div>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap">
                ${statusBadge(pt.status || 'Active')}
                ${(pt.allergies?.length > 0) ? `<span class="text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-lg">⚠️ Allergies</span>` : ''}
              </div>
            </div>

            <!-- Doctor & next appointment -->
            <div class="mt-2.5 flex items-center gap-3 flex-wrap">
              ${doc ? `
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full flex-shrink-0" style="background:${doc.color}"></span>
                  <span class="text-[11px] text-gray-500 dark:text-gray-400">${doc.name}</span>
                </div>` : ''}
              <div class="text-[11px] ${upcoming ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-400'}">
                ${upcoming
                ? `📅 ${upcoming.date} · ${fmt12(upcoming.time)} · ${aptDoc?.name || '—'}`
                : 'No upcoming appointment'}
              </div>
            </div>

            <!-- Medical note preview -->
            ${pt.initialDiagnosis ? `<div class="mt-2 text-[11px] text-gray-400 dark:text-gray-500 italic truncate">"${pt.initialDiagnosis}"</div>` : ''}
          </div>
        </div>

        <!-- Action buttons -->
        <div class="mt-3 pt-3 border-t border-gray-50 dark:border-white/[0.04] flex items-center gap-1.5 flex-wrap">
          <button data-view="${pt.id}"
            class="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-2.5 py-1.5 rounded-lg transition-colors">
            View Profile
          </button>
          ${roleObj.role === 'admin' ? `
            <button data-edit="${pt.id}"
              class="text-[11px] font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] px-2.5 py-1.5 rounded-lg transition-colors">
              Edit
            </button>` : ''}
          ${roleObj.role !== 'patient' ? `
            <button data-book="${pt.id}"
              class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg transition-colors ml-auto">
              + Book Appointment
            </button>` : ''}
        </div>
      </div>`;
    }

    // ── Patient list with filter/search ───────────────────────────────────────

    function getFilteredPatients(roleObj) {
        let list = patients;
        if (roleObj.role === 'patient') list = patients.filter(p => p.name === roleObj.userName);

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.phone.includes(q) ||
                p.id.toLowerCase().includes(q) ||
                (p.medicalHistory || '').toLowerCase().includes(q)
            );
        }

        if (activeFilter === 'with-apt') list = list.filter(p => appointments.some(a => a.patientId === p.id && a.date >= todayISO() && a.status === 'Scheduled'));
        if (activeFilter === 'active') list = list.filter(p => p.status === 'Active');
        if (activeFilter === 'inactive') list = list.filter(p => p.status === 'Inactive');
        if (activeFilter === 'allergies') list = list.filter(p => p.allergies?.length > 0);

        return list;
    }

    function buildPatientList(roleObj) {
        const list = getFilteredPatients(roleObj);
        if (list.length === 0) return `
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-2xl mb-3">🔍</div>
        <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">No patients found</p>
        <p class="text-xs text-gray-400 mt-1">Try a different search or filter</p>
      </div>`;

        return `<div class="space-y-3">${list.map(p => buildPatientCard(p, roleObj)).join('')}</div>`;
    }

    // ── Sidebar panels ─────────────────────────────────────────────────────────

    function buildSidebar(roleObj) {
        const filterBtn = (id, label, icon) => {
            const active = activeFilter === id;
            return `<button data-filter="${id}"
        class="w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors
          ${active
                    ? 'bg-[#e53935] text-white shadow-sm shadow-red-200 dark:shadow-red-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.05]'}">
        <span>${icon}</span><span>${label}</span>
      </button>`;
        };

        const todayApts = appointments.filter(a => a.date === todayISO() && a.status === 'Scheduled');

        return `
      <!-- Quick filters -->
      <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm p-4">
        <h4 class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Quick Filters</h4>
        <div class="space-y-1">
          ${filterBtn('all', 'All Patients', '🧑‍⚕️')}
          ${filterBtn('active', 'Active Only', '✅')}
          ${filterBtn('inactive', 'Inactive', '⏸')}
          ${filterBtn('with-apt', 'With Upcoming Appts', '📅')}
          ${filterBtn('allergies', 'Has Allergies', '⚠️')}
        </div>
      </div>

      <!-- Today's schedule -->
      <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm p-4">
        <h4 class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Today's Schedule</h4>
        ${todayApts.length === 0
                ? `<p class="text-xs text-gray-400 py-2">No appointments today</p>`
                : todayApts.map(a => {
                    const pt = patients.find(p => p.id === a.patientId);
                    const doc = doctors.find(d => d.id === a.doctorId);
                    return `
                <div class="flex items-start gap-2.5 py-2.5 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
                  <div class="w-1.5 min-h-[28px] rounded-full flex-shrink-0 mt-0.5" style="background:${doc?.color || '#e53935'}"></div>
                  <div>
                    <div class="text-xs font-semibold text-gray-700 dark:text-gray-200">${pt?.name || '—'}</div>
                    <div class="text-[10px] text-gray-400 mt-0.5">${fmt12(a.time)} · ${doc?.name || '—'}</div>
                    <div class="text-[10px] text-gray-400">${a.type}</div>
                  </div>
                </div>`;
                }).join('')}
      </div>

      <!-- Doctors -->
      <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm p-4">
        <h4 class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Doctors on Roster</h4>
        <div class="space-y-2.5">
          ${doctors.map(d => {
                    const count = patients.filter(p => p.assignedDoctor === d.id).length;
                    return `
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style="background:${d.color}">
                  ${d.name.split(' ').filter((_, i) => i > 0).map(n => n[0]).join('')}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">${d.name}</div>
                  <div class="text-[10px] text-gray-400">${d.specialty}</div>
                </div>
                <span class="text-[10px] font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-lg">${count} pts</span>
              </div>`;
                }).join('')}
        </div>
      </div>`;
    }

    // ── Main render ────────────────────────────────────────────────────────────

    function render() {
        setActiveNav(nav);
        const roleObj = getRole();

        container.innerHTML = `
      <!-- Header -->
      <div class="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 class="text-base font-bold text-gray-800 dark:text-white tracking-tight">🩺 Patient Management</h2>
          <p class="text-xs text-gray-400 mt-0.5">Manage patient records and medical history</p>
        </div>
        <div class="flex items-center gap-2">
          ${roleObj.role !== 'patient' ? `<button id="new-apt" class="border border-gray-200 dark:border-white/[0.1] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors">📅 New Appointment</button>` : ''}
          ${roleObj.role === 'admin' ? `<button id="add-patient" class="bg-[#e53935] hover:bg-[#c62828] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20 flex items-center gap-1.5"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>Add Patient</button>` : ''}
        </div>
      </div>

      <!-- Stats -->
      ${buildStats()}

      <!-- Search bar -->
      <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm px-4 py-3 mb-4 flex items-center gap-2.5">
        <svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input id="patient-search" placeholder="Search by name, phone, ID, or condition…"
          class="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400"
          value="${searchQuery}" />
        ${searchQuery ? `<button id="clear-search" class="text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors">✕ Clear</button>` : ''}
      </div>

      <!-- Main grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        <!-- Patient list -->
        <div class="lg:col-span-2">
          <div class="flex items-center justify-between mb-3 px-0.5">
            <p class="text-[11px] font-semibold text-gray-400">${getFilteredPatients(roleObj).length} patient${getFilteredPatients(roleObj).length !== 1 ? 's' : ''} shown</p>
          </div>
          <div id="patient-list-container">${buildPatientList(roleObj)}</div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">${buildSidebar(roleObj)}</div>
      </div>

      <!-- ── Modal ── -->
      <div id="pm-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none opacity-0 transition-opacity duration-200">
        <div id="pm-modal-overlay" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div id="pm-modal-panel"
          class="relative w-full max-w-lg pointer-events-auto bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07] scale-95 transition-transform duration-200">
          <div id="pm-modal-body"></div>
        </div>
      </div>
    `;

        wire(roleObj);
    }

    // ── Modal helpers ──────────────────────────────────────────────────────────

    function modalHeader(icon, title, sub = '') {
        return `
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-[#e53935]/10 flex items-center justify-center text-sm">${icon}</div>
          <div>
            <h4 class="text-sm font-bold text-gray-800 dark:text-white">${title}</h4>
            ${sub ? `<p class="text-[10px] text-gray-400 mt-0.5">${sub}</p>` : ''}
          </div>
        </div>
        <button id="pm-modal-close"
          class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors text-sm">✕</button>
      </div>
      <div class="p-5 overflow-y-auto max-h-[75vh]">`;
    }

    function openModal(html) {
        const root = document.getElementById('pm-modal');
        const panel = document.getElementById('pm-modal-panel');
        const body = document.getElementById('pm-modal-body');
        if (!root || !body) return;
        body.innerHTML = html + '</div>';
        root.classList.remove('pointer-events-none');
        requestAnimationFrame(() => { root.style.opacity = '1'; if (panel) panel.style.transform = 'scale(1)'; });
        document.getElementById('pm-modal-close')?.addEventListener('click', closeModal);
        document.getElementById('pm-modal-overlay')?.addEventListener('click', closeModal);
    }

    function closeModal() {
        const root = document.getElementById('pm-modal');
        const panel = document.getElementById('pm-modal-panel');
        if (!root) return;
        root.style.opacity = '0';
        if (panel) panel.style.transform = 'scale(0.95)';
        setTimeout(() => root.classList.add('pointer-events-none'), 200);
    }

    // ── Wire events ────────────────────────────────────────────────────────────

    function wire(roleObj) {

        // Search
        document.getElementById('patient-search')?.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            document.getElementById('patient-list-container').innerHTML = buildPatientList(roleObj);
            const countEl = container.querySelector('.lg\\:col-span-2 p');
            if (countEl) countEl.textContent = `${getFilteredPatients(roleObj).length} patient${getFilteredPatients(roleObj).length !== 1 ? 's' : ''} shown`;
        });
        document.getElementById('clear-search')?.addEventListener('click', () => { searchQuery = ''; render(); });

        // Quick filters
        container.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                activeFilter = btn.getAttribute('data-filter');
                render();
            });
        });

        // ── View patient ────────────────────────────────────────────────────────

        container.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {
            const pt = patients.find(x => x.id === b.getAttribute('data-view'));
            if (!pt) return;
            const doc = doctors.find(d => d.id === pt.assignedDoctor);
            const color = avatarColor(pt.id);
            const ptApts = appointments
                .filter(a => a.patientId === pt.id)
                .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

            const html = modalHeader('🩺', pt.name, `Patient ID: ${pt.id}`) + `
        <!-- Avatar + basic -->
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base font-bold flex-shrink-0"
            style="background:${color}">${initials(pt.name)}</div>
          <div>
            <div class="text-sm font-bold text-gray-800 dark:text-white">${pt.name}</div>
            <div class="text-[11px] text-gray-400">${calcAge(pt.dob)} yrs · ${pt.gender || '—'} · ${pt.bloodType || '—'}</div>
            <div class="flex gap-1.5 mt-1">${statusBadge(pt.status || 'Active')} ${(pt.allergies?.length > 0) ? `<span class="text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-lg">⚠️ Allergies</span>` : ''}</div>
          </div>
        </div>

        <!-- Info grid -->
        <div class="grid grid-cols-2 gap-2.5 mb-4">
          <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3">
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Date of Birth</p>
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">${pt.dob || '—'}</p>
          </div>
          <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3">
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">${pt.phone || '—'}</p>
          </div>
          <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3 col-span-2">
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Assigned Doctor</p>
            <div class="flex items-center gap-2">
              ${doc ? `<span class="w-2 h-2 rounded-full" style="background:${doc.color}"></span>` : ''}
              <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">${doc ? `${doc.name} — ${doc.specialty}` : '—'}</p>
            </div>
          </div>
        </div>

        <!-- Allergies -->
        ${pt.allergies?.length > 0 ? `
          <div class="mb-3">
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Allergies</p>
            <div class="flex flex-wrap gap-1.5">${pt.allergies.map(allergyPill).join('')}</div>
          </div>` : ''}

        <!-- Medical info -->
        ${pt.medicalHistory || pt.initialDiagnosis || pt.doctorComment ? `
          <div class="space-y-2.5 mb-4">
            ${pt.medicalHistory ? `
              <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3">
                <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Medical History</p>
                <p class="text-sm text-gray-700 dark:text-gray-200">${pt.medicalHistory}</p>
              </div>` : ''}
            ${pt.initialDiagnosis ? `
              <div class="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3">
                <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Initial Diagnosis</p>
                <p class="text-sm text-gray-700 dark:text-gray-200">${pt.initialDiagnosis}</p>
              </div>` : ''}
            ${pt.doctorComment ? `
              <div class="bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-xl p-3">
                <p class="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Doctor's Note</p>
                <p class="text-sm text-gray-700 dark:text-gray-300 italic">"${pt.doctorComment}"</p>
              </div>` : ''}
          </div>` : ''}

        <!-- Appointment history -->
        ${ptApts.length > 0 ? `
          <div>
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Appointment History</p>
            <div class="space-y-2">
              ${ptApts.slice(0, 4).map(a => {
                const adoc = doctors.find(d => d.id === a.doctorId);
                return `
                  <div class="flex items-center justify-between gap-2 bg-gray-50 dark:bg-white/[0.03] rounded-xl px-3 py-2.5">
                    <div class="flex items-center gap-2">
                      <span class="w-1.5 h-6 rounded-full flex-shrink-0" style="background:${adoc?.color || '#e53935'}"></span>
                      <div>
                        <div class="text-xs font-semibold text-gray-700 dark:text-gray-200">${a.type}</div>
                        <div class="text-[10px] text-gray-400">${a.date} · ${fmt12(a.time)} · ${adoc?.name || '—'}</div>
                      </div>
                    </div>
                    ${aptStatusBadge(a.status || 'Scheduled')}
                  </div>`;
            }).join('')}
            </div>
          </div>` : ''}
      `;
            openModal(html);
        }));

        // ── Edit patient ────────────────────────────────────────────────────────

        container.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
            const pt = patients.find(x => x.id === b.getAttribute('data-edit'));
            if (!pt) return;

            const html = modalHeader('✏️', `Edit Patient`, pt.name) + `
        <label class="${labelCls} mt-0">Full Name</label>
        <input id="pm-name" class="${inputCls}" value="${pt.name}" />

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="${labelCls}">Date of Birth</label>
            <input id="pm-dob" type="date" class="${inputCls}" value="${pt.dob}" />
          </div>
          <div>
            <label class="${labelCls}">Gender</label>
            <select id="pm-gender" class="${inputCls}">
              ${['Male', 'Female', 'Other'].map(g => `<option ${pt.gender === g ? 'selected' : ''}>${g}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="${labelCls}">Phone</label>
            <input id="pm-phone" class="${inputCls}" value="${pt.phone}" />
          </div>
          <div>
            <label class="${labelCls}">Blood Type</label>
            <select id="pm-blood" class="${inputCls}">
              ${['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => `<option ${pt.bloodType === bt ? 'selected' : ''}>${bt}</option>`).join('')}
            </select>
          </div>
        </div>

        <label class="${labelCls}">Assigned Doctor</label>
        <select id="pm-doc" class="${inputCls}">
          ${doctors.map(d => `<option value="${d.id}" ${pt.assignedDoctor === d.id ? 'selected' : ''}>${d.name} — ${d.specialty}</option>`).join('')}
        </select>

        <label class="${labelCls}">Status</label>
        <select id="pm-status" class="${inputCls}">
          ${['Active', 'Inactive'].map(s => `<option ${pt.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>

        <label class="${labelCls}">Allergies (comma-separated)</label>
        <input id="pm-allergies" class="${inputCls}" value="${(pt.allergies || []).join(', ')}" placeholder="e.g. Penicillin, Aspirin" />

        <label class="${labelCls}">Medical History</label>
        <input id="pm-history" class="${inputCls}" value="${pt.medicalHistory || ''}" />

        <label class="${labelCls}">Initial Diagnosis</label>
        <input id="pm-diagnosis" class="${inputCls}" value="${pt.initialDiagnosis || ''}" />

        <label class="${labelCls}">Doctor's Note</label>
        <input id="pm-note" class="${inputCls}" value="${pt.doctorComment || ''}" />

        <button id="pm-save"
          class="w-full mt-5 bg-[#e53935] hover:bg-[#c62828] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20">
          Save Changes
        </button>
      `;
            openModal(html);

            document.getElementById('pm-save')?.addEventListener('click', () => {
                pt.name = document.getElementById('pm-name').value.trim() || pt.name;
                pt.dob = document.getElementById('pm-dob').value || pt.dob;
                pt.gender = document.getElementById('pm-gender').value;
                pt.phone = document.getElementById('pm-phone').value.trim() || pt.phone;
                pt.bloodType = document.getElementById('pm-blood').value;
                pt.assignedDoctor = document.getElementById('pm-doc').value;
                pt.status = document.getElementById('pm-status').value;
                pt.allergies = document.getElementById('pm-allergies').value.split(',').map(s => s.trim()).filter(Boolean);
                pt.medicalHistory = document.getElementById('pm-history').value;
                pt.initialDiagnosis = document.getElementById('pm-diagnosis').value;
                pt.doctorComment = document.getElementById('pm-note').value;
                closeModal();
                render();
            });
        }));

        // ── Book appointment ────────────────────────────────────────────────────

        container.querySelectorAll('[data-book]').forEach(b => b.addEventListener('click', () => {
            const pt = patients.find(x => x.id === b.getAttribute('data-book'));
            if (!pt) return;

            const html = modalHeader('📅', `Book Appointment`, pt.name) + `
        <label class="${labelCls} mt-0">Doctor</label>
        <select id="pm-doc-book" class="${inputCls}">
          ${doctors.map(d => `<option value="${d.id}" ${pt.assignedDoctor === d.id ? 'selected' : ''}>${d.name} — ${d.specialty}</option>`).join('')}
        </select>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="${labelCls}">Date</label>
            <input id="pm-date" type="date" class="${inputCls}" min="${todayISO()}" />
          </div>
          <div>
            <label class="${labelCls}">Time</label>
            <input id="pm-time" type="time" class="${inputCls}" />
          </div>
        </div>

        <label class="${labelCls}">Type</label>
        <select id="pm-type" class="${inputCls}">
          ${['Checkup', 'Consultation', 'Follow-up', 'Vaccination', 'Lab Review', 'Other'].map(t => `<option>${t}</option>`).join('')}
        </select>

        <button id="pm-book-save"
          class="w-full mt-5 bg-[#e53935] hover:bg-[#c62828] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20">
          Confirm Booking
        </button>
      `;
            openModal(html);

            document.getElementById('pm-book-save')?.addEventListener('click', () => {
                const date = document.getElementById('pm-date').value;
                const time = document.getElementById('pm-time').value;
                if (!date || !time) { alert('Please select a date and time.'); return; }
                appointments.push({
                    id: 'APT-' + String(1000 + appointments.length + 1),
                    patientId: pt.id,
                    doctorId: document.getElementById('pm-doc-book').value,
                    date, time,
                    type: document.getElementById('pm-type').value,
                    status: 'Scheduled'
                });
                closeModal();
                render();
            });
        }));

        // ── Add patient ─────────────────────────────────────────────────────────

        document.getElementById('add-patient')?.addEventListener('click', () => {
            const html = modalHeader('➕', 'Add New Patient', 'Enter patient details below') + `
        <label class="${labelCls} mt-0">Full Name</label>
        <input id="pm-new-name" class="${inputCls}" placeholder="e.g. Juan Dela Cruz" />

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="${labelCls}">Date of Birth</label>
            <input id="pm-new-dob" type="date" class="${inputCls}" />
          </div>
          <div>
            <label class="${labelCls}">Gender</label>
            <select id="pm-new-gender" class="${inputCls}">
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="${labelCls}">Phone</label>
            <input id="pm-new-phone" class="${inputCls}" placeholder="09XXXXXXXXX" />
          </div>
          <div>
            <label class="${labelCls}">Blood Type</label>
            <select id="pm-new-blood" class="${inputCls}">
              ${['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => `<option>${bt}</option>`).join('')}
            </select>
          </div>
        </div>

        <label class="${labelCls}">Assigned Doctor</label>
        <select id="pm-new-doc" class="${inputCls}">
          ${doctors.map(d => `<option value="${d.id}">${d.name} — ${d.specialty}</option>`).join('')}
        </select>

        <label class="${labelCls}">Allergies (comma-separated)</label>
        <input id="pm-new-allergies" class="${inputCls}" placeholder="e.g. Penicillin, Aspirin" />

        <button id="pm-new-save"
          class="w-full mt-5 bg-[#e53935] hover:bg-[#c62828] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20">
          Create Patient Record
        </button>
      `;
            openModal(html);

            document.getElementById('pm-new-save')?.addEventListener('click', () => {
                const name = document.getElementById('pm-new-name').value.trim();
                if (!name) { alert('Name is required.'); return; }
                patients.push({
                    id: 'PT-' + String(100 + patients.length + 1),
                    name,
                    dob: document.getElementById('pm-new-dob').value,
                    gender: document.getElementById('pm-new-gender').value,
                    phone: document.getElementById('pm-new-phone').value.trim(),
                    bloodType: document.getElementById('pm-new-blood').value,
                    assignedDoctor: document.getElementById('pm-new-doc').value,
                    allergies: document.getElementById('pm-new-allergies').value.split(',').map(s => s.trim()).filter(Boolean),
                    medicalHistory: '', initialDiagnosis: '', doctorComment: '',
                    status: 'Active'
                });
                closeModal();
                render();
            });
        });

        // ── New appointment (generic) ───────────────────────────────────────────

        document.getElementById('new-apt')?.addEventListener('click', () => {
            const html = modalHeader('📅', 'New Appointment', 'Schedule for any patient') + `
        <label class="${labelCls} mt-0">Patient</label>
        <select id="pm-patient" class="${inputCls}">
          ${patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
        </select>

        <label class="${labelCls}">Doctor</label>
        <select id="pm-doc2" class="${inputCls}">
          ${doctors.map(d => `<option value="${d.id}">${d.name} — ${d.specialty}</option>`).join('')}
        </select>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="${labelCls}">Date</label>
            <input id="pm-date2" type="date" class="${inputCls}" min="${todayISO()}" />
          </div>
          <div>
            <label class="${labelCls}">Time</label>
            <input id="pm-time2" type="time" class="${inputCls}" />
          </div>
        </div>

        <label class="${labelCls}">Type</label>
        <select id="pm-type2" class="${inputCls}">
          ${['Checkup', 'Consultation', 'Follow-up', 'Vaccination', 'Lab Review', 'Other'].map(t => `<option>${t}</option>`).join('')}
        </select>

        <button id="pm-new-apt-save"
          class="w-full mt-5 bg-[#e53935] hover:bg-[#c62828] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20">
          Confirm Appointment
        </button>
      `;
            openModal(html);

            document.getElementById('pm-new-apt-save')?.addEventListener('click', () => {
                const date = document.getElementById('pm-date2').value;
                const time = document.getElementById('pm-time2').value;
                if (!date || !time) { alert('Date and time are required.'); return; }
                appointments.push({
                    id: 'APT-' + String(1000 + appointments.length + 1),
                    patientId: document.getElementById('pm-patient').value,
                    doctorId: document.getElementById('pm-doc2').value,
                    date, time,
                    type: document.getElementById('pm-type2').value,
                    status: 'Scheduled'
                });
                closeModal();
                render();
            });
        });

        document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeModal(); });
    }

    nav.addEventListener('click', (e) => { e.preventDefault(); render(); });
    if (location.hash === '#patients') render();
});