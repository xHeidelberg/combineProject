document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav-appointments');
  const container = document.getElementById('role-dashboard');
  if (!nav || !container) return;

  const doctors = [
    { id: 'D1', name: 'Dr. Maria Cruz', specialty: 'General Practitioner', availability: ['09:00','10:00','11:00','14:00','15:00'] },
    { id: 'D2', name: 'Dr. Jose Ramos', specialty: 'Pediatrician', availability: ['08:30','09:30','10:30','13:30','14:30'] },
    { id: 'D3', name: 'Dr. Ana Lopez', specialty: 'Internal Medicine', availability: ['10:00','11:00','12:00','15:00','16:00'] },
  ];

  // in-memory appointments (sample)
  const appointments = [
    { id: 'APT-001', doctorId: 'D1', date: '2026-05-04', time: '09:00', customer: 'Juan Dela Cruz', note: 'Checkup' },
    { id: 'APT-002', doctorId: 'D2', date: '2026-05-05', time: '10:30', customer: 'Maria Santos', note: 'Vaccination' },
  ];

  // state
  let viewYear = new Date().getFullYear();
  let viewMonth = new Date().getMonth(); // 0-indexed
  let filterDoctor = null; // show all by default

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

  function setActiveNav(el) {
    document.querySelectorAll('#sidebar nav a').forEach(a => a.classList.remove('bg-[#e53935]','text-white'));
    if (el) el.classList.add('bg-[#e53935]','text-white');
  }

  function monthName(y,m) {
    return new Date(y,m,1).toLocaleString(undefined,{month:'long', year:'numeric'});
  }

  function buildDoctorSelect() {
    return `<select id="doctor-filter" class="px-2 py-2 border rounded"><option value="all">All doctors</option>${doctors.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}</select>`;
  }

  function buildCalendar(year, month, roleObj) {
    // first day and days in month
    const first = new Date(year, month, 1);
    const startWeek = first.getDay(); // 0 Sun - 6 Sat
    const daysInMonth = new Date(year, month+1, 0).getDate();

    // build grid cells
    let cells = [];
    for (let i=0;i<startWeek;i++) cells.push(null);
    for (let d=1; d<=daysInMonth; d++) cells.push(new Date(year, month, d));

    const weeks = [];
    for (let i=0;i<cells.length;i+=7) weeks.push(cells.slice(i,i+7));

    const header = `
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <button id="cal-prev" class="px-2 py-1 rounded border">‹</button>
          <div class="font-semibold">${monthName(year,month)}</div>
          <button id="cal-next" class="px-2 py-1 rounded border">›</button>
        </div>
        <div class="flex items-center gap-2">
          ${buildDoctorSelect()}
        </div>
      </div>
    `;

    const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const grid = `
      <div class="grid grid-cols-7 gap-2">
        ${weekdays.map(w=>`<div class="text-xs text-gray-500 text-center">${w}</div>`).join('')}
        ${weeks.map(week => week.map(day => {
          if (!day) return `<div class="min-h-[80px] p-2 bg-gray-50 rounded text-sm"></div>`;
          const iso = day.toISOString().slice(0,10);
          const dayNum = day.getDate();
          // collect appointments for this day, filtered by doctor and role
          const appts = appointments.filter(a => a.date === iso && (filterDoctor === null || filterDoctor === 'all' || a.doctorId === filterDoctor));
          const visibleAppts = appts.filter(a => {
            if (roleObj.role === 'patient') {
              return a.customer === roleObj.userName || a.customer === '';
            }
            return true;
          });

          const apptHtml = visibleAppts.slice(0,3).map(a => `<div class="text-[11px] p-1 rounded bg-white border">${a.time} • ${a.customer}</div>`).join('');

          const today = new Date();
          const isToday = today.toISOString().slice(0,10) === iso;

          return `<div data-date="${iso}" class="min-h-[80px] p-2 rounded text-sm ${isToday? 'ring-2 ring-[#e53935]/30':''}">
            <div class="flex items-center justify-between mb-1">
              <div class="font-semibold text-sm">${dayNum}</div>
              <div class="text-xs text-gray-400">${visibleAppts.length}</div>
            </div>
            <div class="space-y-1">${apptHtml || '<div class="text-xs text-gray-400">No appts</div>'}</div>
          </div>`;
        }).join('')).join('')}
      </div>`;

    return header + grid;
  }

  function buildRightColumn(roleObj) {
    // show doctor list and legend
    const list = doctors.map(d => `<div class="p-2 border rounded mb-2"><div class="font-medium">${d.name}</div><div class="text-xs text-gray-500">${d.specialty}</div></div>`).join('');
    return `<div class="card p-4"><h4 class="font-semibold mb-2">Doctors</h4>${list}</div>`;
  }

  function render(selectedDoctorId) {
    setActiveNav(nav);
    const roleObj = getRole();
    const calHtml = buildCalendar(viewYear, viewMonth, roleObj);
    const right = buildRightColumn(roleObj);

    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2">
          <div class="card p-4">
            ${calHtml}
          </div>
        </div>
        <div>
          ${right}
        </div>
      </div>

      <!-- Modal (reuse simple create modal) -->
      <div id="apt-modal" class="fixed inset-0 z-50 flex items-start justify-center p-4 pointer-events-none opacity-0 transition-opacity">
        <div id="apt-modal-overlay" class="absolute inset-0 bg-black/40"></div>
        <div class="relative w-full max-w-md pointer-events-auto bg-white rounded shadow-lg overflow-hidden">
          <div class="p-4 border-b flex items-center justify-between">
            <h4 class="text-lg font-semibold">Create Appointment</h4>
            <button id="apt-modal-close" class="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <div class="p-4 space-y-2">
            <div>
              <label class="text-xs text-gray-600">Doctor</label>
              <select id="apt-doctor" class="w-full px-3 py-2 border rounded">${doctors.map(d => `<option value="${d.id}">${d.name} — ${d.specialty}</option>`).join('')}</select>
            </div>
            <div>
              <label class="text-xs text-gray-600">Date</label>
              <input id="apt-date" type="date" class="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label class="text-xs text-gray-600">Time</label>
              <select id="apt-time" class="w-full px-3 py-2 border rounded"></select>
            </div>
            <div>
              <label class="text-xs text-gray-600">Customer name</label>
              <input id="apt-customer" class="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label class="text-xs text-gray-600">Note</label>
              <input id="apt-note" class="w-full px-3 py-2 border rounded" />
            </div>
            <div class="text-right">
              <button id="apt-save" class="px-3 py-2 rounded bg-[#e53935] text-white">Save</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // wire controls
    const prev = container.querySelector('#cal-prev');
    const next = container.querySelector('#cal-next');
    const docFilter = container.querySelector('#doctor-filter');
    const cells = container.querySelectorAll('[data-date]');
    const modalRoot = document.getElementById('apt-modal');
    const modalOverlay = document.getElementById('apt-modal-overlay');
    const modalClose = document.getElementById('apt-modal-close');
    const aptDoctor = document.getElementById('apt-doctor');
    const aptDate = document.getElementById('apt-date');
    const aptTime = document.getElementById('apt-time');
    const aptCustomer = document.getElementById('apt-customer');
    const aptNote = document.getElementById('apt-note');
    const aptSave = document.getElementById('apt-save');

    if (prev) prev.addEventListener('click', () => { viewMonth--; if (viewMonth<0){viewMonth=11;viewYear--;} render(); });
    if (next) next.addEventListener('click', () => { viewMonth++; if (viewMonth>11){viewMonth=0;viewYear++;} render(); });
    if (docFilter) docFilter.addEventListener('change', (e) => { filterDoctor = e.target.value; render(); });

    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        const date = cell.getAttribute('data-date');
        // open modal prefilling date and doctor
        modalRoot.classList.remove('pointer-events-none');
        requestAnimationFrame(() => { modalRoot.style.opacity = '1'; });
        aptDate.value = date;
        aptDoctor.value = filterDoctor && filterDoctor !== 'all' ? filterDoctor : doctors[0].id;
        populateTimes(aptDoctor.value);
      });
    });

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeModal(); });

    if (aptDoctor) aptDoctor.addEventListener('change', () => populateTimes(aptDoctor.value));
    function populateTimes(doctorId) { const d = doctors.find(x=>x.id===doctorId)||doctors[0]; aptTime.innerHTML = d.availability.map(t => `<option value="${t}">${t}</option>`).join(''); }

    if (aptSave) {
      aptSave.addEventListener('click', () => {
        const newApt = {
          id: 'APT-' + String(1000 + appointments.length + 1),
          doctorId: aptDoctor.value,
          date: aptDate.value,
          time: aptTime.value,
          customer: (getRole().role === 'patient') ? getRole().userName || 'Patient' : (aptCustomer.value || 'Walk-in'),
          note: aptNote.value || ''
        };
        // basic double-book prevention
        const conflict = appointments.find(a => a.doctorId === newApt.doctorId && a.date === newApt.date && a.time === newApt.time);
        if (conflict) { alert('Selected slot is already booked.'); return; }
        appointments.push(newApt);
        closeModal();
        render(aptDoctor.value);
      });
    }

    function closeModal() { if (!modalRoot) return; modalRoot.style.opacity = '0'; modalRoot.classList.add('pointer-events-none'); }
  }

  nav.addEventListener('click', (e) => { e.preventDefault(); render(); });
  if (location.hash === '#appointments') render();
});
