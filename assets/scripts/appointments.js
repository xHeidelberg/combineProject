document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav-appointments');
    const container = document.getElementById('role-dashboard');
    if (!nav || !container) return;
    // ================================================ sample data (replace mo nalang API fetch later)
    const doctors = [
        { id: 'D1', name: 'Dr. Maria Cruz', specialty: 'General Practitioner', availability: ['09:00', '10:00', '11:00', '14:00', '15:00'], color: '#e53935' },
        { id: 'D2', name: 'Dr. Jose Ramos', specialty: 'Pediatrician', availability: ['08:30', '09:30', '10:30', '13:30', '14:30'], color: '#3b82f6' },
        { id: 'D3', name: 'Dr. Ana Lopez', specialty: 'Internal Medicine', availability: ['10:00', '11:00', '12:00', '15:00', '16:00'], color: '#10b981' },
    ];

    const APPOINTMENT_TYPES = ['Checkup', 'Vaccination', 'Consultation', 'Follow-up', 'Lab Review', 'Other'];
    const STATUS_OPTIONS = ['Scheduled', 'Completed', 'Cancelled'];

    const appointments = [
        { id: 'APT-001', doctorId: 'D1', date: '2026-05-04', time: '09:00', customer: 'Juan Dela Cruz', note: 'Routine checkup', type: 'Checkup', status: 'Scheduled' },
        { id: 'APT-002', doctorId: 'D2', date: '2026-05-05', time: '10:30', customer: 'Maria Santos', note: 'Child vaccination', type: 'Vaccination', status: 'Scheduled' },
        { id: 'APT-003', doctorId: 'D3', date: '2026-05-02', time: '11:00', customer: 'Pedro Reyes', note: 'Blood pressure', type: 'Consultation', status: 'Completed' },
    ];

    let viewYear = new Date().getFullYear();
    let viewMonth = new Date().getMonth();
    let filterDoctor = null;
    let activeView = 'calendar'; // 'calendar' | 'list'

    // ── Helpers ──────────────────────────────────────────────────────────────

    function getRole() {
        const badge = document.getElementById('current-role');
        const userName = document.getElementById('user-name')?.textContent?.trim() || '';
        if (!badge) return { role: 'patient', userName };
        const txt = badge.textContent || '';
        if (/admin/i.test(txt)) return { role: 'admin', userName };
        if (/pharmacist/i.test(txt)) return { role: 'pharmacist', userName };
        if (/staff/i.test(txt)) return { role: 'staff', userName };
        return { role: 'patient', userName };
    }

    function setActiveNav(target) {
      if (window.setActiveSidebar) return window.setActiveSidebar(target);
      const links = document.querySelectorAll('#sidebar nav a');
      links.forEach(a => a.classList.remove('active-nav','bg-[#e53935]','text-white'));
      const el = (typeof target === 'string') ? document.getElementById(target) : target;
      if (el) el.classList.add('active-nav');
    }

    function monthName(y, m) {
        return new Date(y, m, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
    }

    function doctorById(id) { return doctors.find(d => d.id === id); }

    function todayISO() { return new Date().toISOString().slice(0, 10); }

    // format 'HH:MM' -> 'h:mm AM/PM'
    function formatTime(t) {
        if (!t) return '';
        const parts = String(t).split(':');
        if (parts.length < 2) return t;
        const hh = parseInt(parts[0], 10);
        const mm = parseInt(parts[1], 10);
        const ampm = hh >= 12 ? 'PM' : 'AM';
        const h12 = ((hh + 11) % 12) + 1;
        return `${h12}:${String(mm).padStart(2, '0')} ${ampm}`;
    }

    // Status pill
    const statusBadge = (status) => {
        const s = {
            Scheduled: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
            Completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
            Cancelled: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
        };
        const icons = { Scheduled: '🕐', Completed: '✅', Cancelled: '❌' };
        return `<span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg ${s[status] || s.Scheduled}">${icons[status] || ''} ${status}</span>`;
    };

    const typeBadge = (type) =>
        `<span class="text-[10px] font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-lg">${type}</span>`;

    const inputCls = 'w-full border border-gray-200 dark:border-white/[0.1] rounded-xl px-3 py-2.5 mt-1.5 text-sm bg-gray-50 dark:bg-white/[0.03] text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow';
    const labelCls = 'text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mt-3';

    // ── Stats bar ─────────────────────────────────────────────────────────────

    function buildStats(roleObj) {
        const today = todayISO();
        const todayApts = appointments.filter(a => a.date === today && visibleForRole(a, roleObj));
        const upcoming = appointments.filter(a => a.date >= today && a.status === 'Scheduled' && visibleForRole(a, roleObj));
        const completed = appointments.filter(a => a.status === 'Completed' && visibleForRole(a, roleObj));

        const stat = (label, val, color, icon) => `
      <div class="bg-white dark:bg-[#161616] rounded-2xl p-4 border border-gray-100 dark:border-white/[0.05] shadow-sm flex items-start justify-between">
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">${label}</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-white">${val}</p>
        </div>
        <div class="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style="background:${color}18">${icon}</div>
      </div>`;

        return `
      <div class="grid grid-cols-3 gap-3 mb-4">
        ${stat("Today's Appointments", todayApts.length, '#3b82f6', '📅')}
        ${stat('Upcoming', upcoming.length, '#e53935', '⏳')}
        ${stat('Completed', completed.length, '#10b981', '✅')}
      </div>`;
    }

    // ── Doctor sidebar ─────────────────────────────────────────────────────────

    function buildDoctorPanel(roleObj) {
        const thisMonthApts = appointments.filter(a =>
            new Date(a.date).getMonth() === viewMonth &&
            new Date(a.date).getFullYear() === viewYear
        );

        const doctorCards = doctors.map(d => {
            const count = thisMonthApts.filter(a => a.doctorId === d.id).length;
            const next = appointments
                .filter(a => a.doctorId === d.id && a.date >= todayISO() && a.status === 'Scheduled')
                .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];

            return `
        <div class="p-3.5 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] hover:border-gray-200 dark:hover:border-white/[0.1] transition-colors">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
              style="background:${d.color}">
              ${d.name.split(' ').filter((_, i) => i > 0).map(n => n[0]).join('')}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-snug">${d.name}</div>
              <div class="text-[11px] text-gray-400 mt-0.5">${d.specialty}</div>
              <div class="flex items-center gap-2 mt-2 flex-wrap">
                <span class="text-[10px] font-semibold bg-white dark:bg-white/[0.06] border border-gray-100 dark:border-white/[0.06] px-2 py-0.5 rounded-lg text-gray-500 dark:text-gray-400">${count} this month</span>
                ${next ? `<span class="text-[10px] text-gray-400">Next: ${next.date} ${formatTime(next.time)}</span>` : ''}
              </div>
            </div>
          </div>
            <div class="mt-2.5 flex flex-wrap gap-1">
            ${d.availability.slice(0, 4).map(t => `<span class="text-[10px] font-semibold bg-white dark:bg-white/[0.05] border border-gray-100 dark:border-white/[0.07] text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md">${formatTime(t)}</span>`).join('')}
            ${d.availability.length > 4 ? `<span class="text-[10px] text-gray-400">+${d.availability.length - 4} more</span>` : ''}
          </div>
        </div>`;
        }).join('');

        // Upcoming list
        const today = todayISO();
        const upcomingList = appointments
            .filter(a => a.date >= today && a.status === 'Scheduled' && visibleForRole(a, roleObj))
            .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
            .slice(0, 4);

        const upcomingHtml = upcomingList.length === 0
            ? `<p class="text-xs text-gray-400 py-2">No upcoming appointments</p>`
            : upcomingList.map(a => {
                const doc = doctorById(a.doctorId);
                return `
            <div class="flex items-start gap-2.5 py-2.5 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
              <div class="w-1.5 h-full min-h-[28px] rounded-full flex-shrink-0 mt-1" style="background:${doc?.color || '#e53935'}"></div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">${a.customer}</div>
                        <div class="text-[10px] text-gray-400 mt-0.5">${doc?.name || '—'} · ${a.date} ${formatTime(a.time)}</div>
              </div>
              ${typeBadge(a.type || 'Checkup')}
            </div>`;
            }).join('');

        return `
      <div class="space-y-4">
        <!-- Upcoming -->
        <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm p-4">
          <h4 class="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-3">Upcoming</h4>
          ${upcomingHtml}
        </div>

        <!-- Doctors -->
        <div class="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm p-4">
          <h4 class="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-3">Doctors</h4>
          <div class="space-y-2">${doctorCards}</div>
        </div>
      </div>`;
    }

    // ── Visibility filter ─────────────────────────────────────────────────────

    function visibleForRole(a, roleObj) {
        if (roleObj.role === 'patient') return a.customer === roleObj.userName || a.customer === '';
        return true;
    }

    // ── Calendar view ──────────────────────────────────────────────────────────

    function buildCalendar(year, month, roleObj) {
        const first = new Date(year, month, 1);
        const startWeek = first.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = todayISO();

        let cells = [];
        for (let i = 0; i < startWeek; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
        while (cells.length % 7 !== 0) cells.push(null);

        const weeks = [];
        for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const rows = weeks.map(week => week.map(day => {
            if (!day) return `<div class="min-h-[90px] rounded-xl bg-gray-50/50 dark:bg-white/[0.01]"></div>`;
            const iso = day.toISOString().slice(0, 10);
            const dayNum = day.getDate();
            const isToday = iso === today;
            const isPast = iso < today;

            const dayApts = appointments.filter(a =>
                a.date === iso &&
                visibleForRole(a, roleObj) &&
                (filterDoctor === null || filterDoctor === 'all' || a.doctorId === filterDoctor)
            );

            const dotColors = [...new Set(dayApts.map(a => doctorById(a.doctorId)?.color || '#e53935'))];

            return `
        <div data-date="${iso}"
          class="min-h-[90px] p-2 rounded-xl border cursor-pointer transition-all
            ${isToday
                    ? 'border-[#e53935]/40 bg-[#e53935]/5 dark:bg-[#e53935]/10 ring-1 ring-[#e53935]/30'
                    : isPast
                        ? 'border-gray-100 dark:border-white/[0.04] bg-gray-50/60 dark:bg-white/[0.01] opacity-75'
                        : 'border-gray-100 dark:border-white/[0.05] bg-white dark:bg-[#161616] hover:border-gray-300 dark:hover:border-white/[0.12] hover:shadow-sm'}">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-bold ${isToday ? 'text-[#e53935]' : 'text-gray-700 dark:text-gray-300'}">${dayNum}</span>
            <div class="flex gap-0.5">
              ${dotColors.slice(0, 3).map(c => `<span class="w-1.5 h-1.5 rounded-full" style="background:${c}"></span>`).join('')}
            </div>
          </div>
          <div class="space-y-1">
            ${dayApts.slice(0, 2).map(a => {
                            const doc = doctorById(a.doctorId);
                            return `<div class="text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate text-white"
                style="background:${doc?.color || '#e53935'}cc">${formatTime(a.time)} ${a.customer.split(' ')[0]}</div>`;
                        }).join('')}
            ${dayApts.length > 2 ? `<div class="text-[10px] text-gray-400 px-1">+${dayApts.length - 2} more</div>` : ''}
            ${dayApts.length === 0 && !isPast ? `<div class="text-[10px] text-gray-300 dark:text-gray-600 px-0.5">Available</div>` : ''}
          </div>
        </div>`;
        }).join('')).join('');

        return `
      <!-- Calendar toolbar -->
      <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div class="flex items-center gap-2">
          <button id="cal-prev" class="w-8 h-8 rounded-xl border border-gray-200 dark:border-white/[0.1] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors text-sm font-bold">‹</button>
          <h3 class="text-sm font-bold text-gray-800 dark:text-white min-w-[160px] text-center">${monthName(year, month)}</h3>
          <button id="cal-next" class="w-8 h-8 rounded-xl border border-gray-200 dark:border-white/[0.1] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors text-sm font-bold">›</button>
          <button id="cal-today" class="text-[11px] font-semibold text-[#e53935] hover:bg-red-50 dark:hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-colors">Today</button>
        </div>
        <div class="flex items-center gap-2">
          <select id="doctor-filter"
            class="border border-gray-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-xs font-medium bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-shadow">
            <option value="all">All Doctors</option>
            ${doctors.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
          </select>
          <div class="flex rounded-xl border border-gray-200 dark:border-white/[0.1] overflow-hidden">
            <button id="view-cal" class="text-[11px] font-semibold px-3 py-2 transition-colors ${activeView === 'calendar' ? 'bg-[#e53935] text-white' : 'bg-gray-50 dark:bg-white/[0.03] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]'}">Calendar</button>
            <button id="view-list" class="text-[11px] font-semibold px-3 py-2 transition-colors ${activeView === 'list' ? 'bg-[#e53935] text-white' : 'bg-gray-50 dark:bg-white/[0.03] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]'}">List</button>
          </div>
        </div>
      </div>

      <!-- Weekday labels -->
      <div class="grid grid-cols-7 gap-1.5 mb-1.5">
        ${weekdays.map(w => `<div class="text-[10px] font-semibold text-center text-gray-400 dark:text-gray-500 uppercase tracking-wider py-1">${w}</div>`).join('')}
      </div>

      <!-- Day grid -->
      <div class="grid grid-cols-7 gap-1.5">${rows}</div>`;
    }

    // ── List view ──────────────────────────────────────────────────────────────

    function buildListView(roleObj) {
        const today = todayISO();
        const visible = appointments
            .filter(a => visibleForRole(a, roleObj) &&
                (filterDoctor === null || filterDoctor === 'all' || a.doctorId === filterDoctor))
            .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

        if (visible.length === 0) return `
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-2xl mb-3">📅</div>
        <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">No appointments found</p>
      </div>`;

        return `
      <div class="divide-y divide-gray-50 dark:divide-white/[0.04]">
        ${visible.map(a => {
            const doc = doctorById(a.doctorId);
            const isPast = a.date < today;
            return `
            <div class="flex items-start gap-4 py-3.5 px-1 hover:bg-gray-50 dark:hover:bg-white/[0.02] rounded-xl transition-colors" data-apt-id="${a.id}">
              <div class="w-10 flex-shrink-0 text-center">
                <div class="text-[10px] font-semibold text-gray-400 uppercase">${new Date(a.date).toLocaleString('default', { month: 'short' })}</div>
                <div class="text-xl font-bold text-gray-700 dark:text-gray-200 leading-none">${new Date(a.date).getDate()}</div>
              </div>
              <div class="w-1 self-stretch rounded-full flex-shrink-0" style="background:${doc?.color || '#e53935'}"></div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div class="text-sm font-semibold text-gray-700 dark:text-gray-200">${a.customer}</div>
                    <div class="text-[11px] text-gray-400 mt-0.5">${doc?.name || '—'} · ${doc?.specialty || ''} · ${formatTime(a.time)}</div>
                    ${a.note ? `<div class="text-[11px] text-gray-400 mt-1 italic">"${a.note}"</div>` : ''}
                  </div>
                  <div class="flex items-center gap-1.5 flex-wrap">
                    ${typeBadge(a.type || 'Checkup')}
                    ${statusBadge(a.status || 'Scheduled')}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1 flex-shrink-0">
                ${!isPast && (roleObj.role !== 'patient') ? `
                  <button data-cancel="${a.id}" class="text-[10px] font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-2 py-1.5 rounded-lg transition-colors">Cancel</button>
                ` : ''}
              </div>
            </div>`;
        }).join('')}
      </div>`;
    }

    // ── Main render ────────────────────────────────────────────────────────────

    function render() {
        setActiveNav(nav);
        const roleObj = getRole();

        const mainContent = activeView === 'calendar'
            ? buildCalendar(viewYear, viewMonth, roleObj)
            : buildListView(roleObj);

        container.innerHTML = `
      <!-- Page header -->
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-gray-800 dark:text-white tracking-tight">📅 Appointments</h2>
          <p class="text-xs text-gray-400 mt-0.5">Schedule and manage patient appointments</p>
        </div>
        <button id="new-apt-btn"
          class="bg-[#e53935] hover:bg-[#c62828] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20 flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
          New Appointment
        </button>
      </div>

      <!-- Stats -->
      ${buildStats(roleObj)}

      <!-- Main grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        <!-- Calendar / List panel -->
        <div class="lg:col-span-2 bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm p-5">
          ${mainContent}
        </div>

        <!-- Right column -->
        <div>${buildDoctorPanel(roleObj)}</div>
      </div>

      <!-- ── Modal ── -->
      <div id="apt-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none opacity-0 transition-opacity duration-200">
        <div id="apt-modal-overlay" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div id="apt-modal-panel"
          class="relative w-full max-w-md pointer-events-auto bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07] scale-95 transition-transform duration-200">

          <!-- Modal header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-[#e53935]/10 flex items-center justify-center text-sm">📅</div>
              <div>
                <h4 class="text-sm font-bold text-gray-800 dark:text-white">Create Appointment</h4>
                <p class="text-[10px] text-gray-400 mt-0.5">Fill in the appointment details</p>
              </div>
            </div>
            <button id="apt-modal-close"
              class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors text-sm">✕</button>
          </div>

          <!-- Modal body -->
          <div class="p-5 space-y-0 overflow-y-auto max-h-[70vh]">
            <label class="${labelCls} mt-0">Doctor</label>
            <select id="apt-doctor" class="${inputCls}">
              ${doctors.map(d => `<option value="${d.id}">${d.name} — ${d.specialty}</option>`).join('')}
            </select>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="${labelCls}">Date</label>
                <input id="apt-date" type="date" class="${inputCls}" min="${todayISO()}" />
              </div>
              <div>
                <label class="${labelCls}">Time</label>
                <select id="apt-time" class="${inputCls}"></select>
              </div>
            </div>

            <label class="${labelCls}">Appointment Type</label>
            <select id="apt-type" class="${inputCls}">
              ${APPOINTMENT_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
            </select>

            ${roleObj.role !== 'patient' ? `
              <label class="${labelCls}">Patient Name</label>
              <input id="apt-customer" class="${inputCls}" placeholder="Full name or 'Walk-in'" />
            ` : `<input id="apt-customer" type="hidden" value="${roleObj.userName || 'Patient'}" />`}

            <label class="${labelCls}">Note (optional)</label>
            <input id="apt-note" class="${inputCls}" placeholder="e.g., Bring previous lab results" />

            <!-- Slot preview -->
            <div id="slot-preview" class="mt-3 p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-white/[0.06] text-xs text-gray-500 dark:text-gray-400">
              Select a doctor and time to preview the slot.
            </div>

            <button id="apt-save"
              class="w-full mt-4 bg-[#e53935] hover:bg-[#c62828] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-sm shadow-red-200 dark:shadow-red-900/20">
              Confirm Appointment
            </button>
          </div>
        </div>
      </div>
    `;

        wireControls(roleObj);
    }

    // ── Wire all controls ──────────────────────────────────────────────────────

    function wireControls(roleObj) {
        const modalRoot = document.getElementById('apt-modal');
        const modalPanel = document.getElementById('apt-modal-panel');
        const modalClose = document.getElementById('apt-modal-close');
        const modalOverlay = document.getElementById('apt-modal-overlay');
        const aptDoctor = document.getElementById('apt-doctor');
        const aptDate = document.getElementById('apt-date');
        const aptTime = document.getElementById('apt-time');
        const aptCustomer = document.getElementById('apt-customer');
        const aptNote = document.getElementById('apt-note');
        const aptType = document.getElementById('apt-type');
        const aptSave = document.getElementById('apt-save');
        const slotPreview = document.getElementById('slot-preview');

        // Nav controls
        container.querySelector('#cal-prev')?.addEventListener('click', () => {
            viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } render();
        });
        container.querySelector('#cal-next')?.addEventListener('click', () => {
            viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } render();
        });
        container.querySelector('#cal-today')?.addEventListener('click', () => {
            viewYear = new Date().getFullYear(); viewMonth = new Date().getMonth(); render();
        });
        container.querySelector('#doctor-filter')?.addEventListener('change', (e) => {
            filterDoctor = e.target.value; render();
        });
        container.querySelector('#view-cal')?.addEventListener('click', () => { activeView = 'calendar'; render(); });
        container.querySelector('#view-list')?.addEventListener('click', () => { activeView = 'list'; render(); });

        // New appointment button
        container.querySelector('#new-apt-btn')?.addEventListener('click', () => {
            openModal(null);
        });

        // Calendar day cells
        container.querySelectorAll('[data-date]').forEach(cell => {
            cell.addEventListener('click', () => openModal(cell.getAttribute('data-date')));
        });

        // List cancel buttons
        container.querySelectorAll('[data-cancel]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-cancel');
                const apt = appointments.find(a => a.id === id);
                if (!apt) return;
                if (!confirm(`Cancel appointment for ${apt.customer}?`)) return;
                apt.status = 'Cancelled';
                render();
            });
        });

        // ── Modal logic ──────────────────────────────────────────────────────

        function openModal(date) {
            modalRoot.classList.remove('pointer-events-none');
            requestAnimationFrame(() => {
                modalRoot.style.opacity = '1';
                if (modalPanel) modalPanel.style.transform = 'scale(1)';
            });
            if (aptDate && date) aptDate.value = date;
            if (aptDoctor) {
                aptDoctor.value = (filterDoctor && filterDoctor !== 'all') ? filterDoctor : doctors[0].id;
                populateTimes(aptDoctor.value);
            }
            updateSlotPreview();
        }

        function closeModal() {
            modalRoot.style.opacity = '0';
            if (modalPanel) modalPanel.style.transform = 'scale(0.95)';
            setTimeout(() => modalRoot.classList.add('pointer-events-none'), 200);
        }

        function populateTimes(doctorId) {
            const doc = doctors.find(x => x.id === doctorId) || doctors[0];
            if (!aptTime) return;
            aptTime.innerHTML = doc.availability.map(t => `<option value="${t}">${formatTime(t)}</option>`).join('');
            updateSlotPreview();
        }

        function updateSlotPreview() {
            if (!slotPreview || !aptDoctor || !aptDate || !aptTime) return;
            const doc = doctorById(aptDoctor.value);
            const date = aptDate.value;
            const time = aptTime.value;
            if (!doc || !date || !time) { slotPreview.textContent = 'Select a doctor and time to preview the slot.'; return; }

            const conflict = appointments.find(a =>
                a.doctorId === aptDoctor.value && a.date === date && a.time === time && a.status !== 'Cancelled'
            );

            slotPreview.innerHTML = conflict
                ? `<span class="text-red-500 dark:text-red-400 font-semibold">⚠️ This slot is already booked.</span>`
                : `<span class="text-emerald-600 dark:text-emerald-400 font-semibold">✅ Available</span>
           <span class="mx-1.5 text-gray-300 dark:text-gray-600">·</span>
           <span style="color:${doc.color}" class="font-semibold">${doc.name}</span>
           <span class="text-gray-400"> · ${date} at ${formatTime(time)}</span>`;
        }

        aptDoctor?.addEventListener('change', () => populateTimes(aptDoctor.value));
        aptDate?.addEventListener('change', updateSlotPreview);
        aptTime?.addEventListener('change', updateSlotPreview);

        aptSave?.addEventListener('click', () => {
            const doctorId = aptDoctor?.value;
            const date = aptDate?.value;
            const time = aptTime?.value;
            const type = aptType?.value || 'Checkup';
            const note = aptNote?.value || '';
            const customer = (roleObj.role === 'patient')
                ? (roleObj.userName || 'Patient')
                : (aptCustomer?.value?.trim() || 'Walk-in');

            if (!doctorId || !date || !time) { alert('Please fill in all required fields.'); return; }

            const conflict = appointments.find(a =>
                a.doctorId === doctorId && a.date === date && a.time === time && a.status !== 'Cancelled'
            );
            if (conflict) { alert('Selected slot is already booked. Please choose a different time.'); return; }

            appointments.push({
                id: 'APT-' + String(1000 + appointments.length + 1),
                doctorId, date, time, customer, note, type,
                status: 'Scheduled'
            });
            closeModal();
            render();
        });

        modalClose?.addEventListener('click', closeModal);
        modalOverlay?.addEventListener('click', closeModal);
        document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeModal(); });
    }

    // ── Boot ───────────────────────────────────────────────────────────────────
    nav.addEventListener('click', (e) => { e.preventDefault(); render(); });
    if (location.hash === '#appointments') render();
});