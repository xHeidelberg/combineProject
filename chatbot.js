/* ════════════════════════════════════════════════
   THEME TOGGLE
════════════════════════════════════════════════ */
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

function setTheme(dark) {
  html.setAttribute('data-theme', dark ? 'dark' : 'light');
  themeToggle.textContent = dark ? '☀️' : '🌙';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) setTheme(savedTheme === 'dark');
else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme(true);

themeToggle.addEventListener('click', () => setTheme(html.getAttribute('data-theme') !== 'dark'));

/* ════════════════════════════════════════════════
   MOBILE MENU
════════════════════════════════════════════════ */
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;
menuBtn.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.style.display = menuOpen ? 'flex' : 'none';
  menuBtn.textContent = menuOpen ? '✕' : '☰';
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menuOpen = false;
  mobileMenu.style.display = 'none';
  menuBtn.textContent = '☰';
}));

/* ════════════════════════════════════════════════
   SCROLL REVEAL
════════════════════════════════════════════════ */
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => io.observe(el));

/* ════════════════════════════════════════════════
   ACTIVE NAV LINK ON SCROLL
════════════════════════════════════════════════ */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('#navLinks a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
  navLinks.forEach(a => { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
}, { passive: true });

/* ════════════════════════════════════════════════
   PRODUCT FILTER TABS
════════════════════════════════════════════════ */
document.getElementById('filterTabs').addEventListener('click', e => {
  const btn = e.target.closest('.filter-tab');
  if (!btn) return;
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filter = btn.dataset.filter;
  document.querySelectorAll('#productsGrid .product-card').forEach(card => {
    const match = filter === 'all' || card.dataset.cat === filter;
    card.style.display = match ? '' : 'none';
  });
});

/* ════════════════════════════════════════════════
   ADD TO CART (TOAST)
════════════════════════════════════════════════ */
function addToCart(name) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:100px;left:50%;transform:translateX(-50%) translateY(16px);
    background:#111;color:#fff;padding:12px 22px;border-radius:12px;
    font-size:13.5px;font-weight:600;z-index:300;
    box-shadow:0 8px 28px rgba(0,0,0,.25);
    opacity:0;transition:all .3s;pointer-events:none;
    display:flex;align-items:center;gap:10px;white-space:nowrap;
  `;
  toast.innerHTML = `<span style="color:#4ade80">✓</span> ${name} added to cart`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => {
    toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(8px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// CHA T BOT
const chatWindow = document.getElementById('chatbot-window');
const chatToggle = document.getElementById('chatbot-toggle');
const cbClose = document.getElementById('cb-close');
const cbMessages = document.getElementById('cb-messages');
const cbInput = document.getElementById('cb-input');
const cbSend = document.getElementById('cb-send');
const cbQuickBtns = document.getElementById('cb-quick-btns');
let chatOpened = false;

const BOT_RESPONSES = {
  'order status':   "To check your order status, please log in to your account at <b>rsmedstar.ph/account</b> or provide your order number and I'll look it up for you.",
  'drug inquiry':   "I can help with general drug information! Please note that for specific medical advice, always consult our licensed pharmacist. What medicine would you like to know about?",
  'store hours':    "We're open <b>Mon–Fri 8AM–9PM</b>, <b>Saturday 8AM–8PM</b>, and <b>Sunday 9AM–6PM</b>. Holidays are 10AM–4PM. Emergency inquiries can be sent here anytime!",
  'upload rx':      "To upload your prescription, <a href='./pages/auth.html' style='color:var(--red)'>log into your account</a> and go to My Prescriptions → Upload New. We accept JPEG, PNG, and PDF.",
  'delivery info':  "We offer <b>same-day delivery</b> within Quezon City for orders placed before 3PM. Metro Manila next-day, province 2–5 business days. Free delivery on orders over ₱500!",
  'default':        "Thanks for your message! For specific questions, please call us at <b>(02) 8123-4567</b> or email <b>hello@rsmedstar.ph</b>. How else can I help you?"
};

function findResponse(msg) {
  const m = msg.toLowerCase();
  if (m.includes('order') || m.includes('status')) return BOT_RESPONSES['order status'];
  if (m.includes('drug') || m.includes('medicine') || m.includes('medication') || m.includes('tablet') || m.includes('capsule')) return BOT_RESPONSES['drug inquiry'];
  if (m.includes('hour') || m.includes('open') || m.includes('close') || m.includes('time') || m.includes('schedule')) return BOT_RESPONSES['store hours'];
  if (m.includes('prescription') || m.includes('rx') || m.includes('upload')) return BOT_RESPONSES['upload rx'];
  if (m.includes('deliver') || m.includes('ship') || m.includes('shipping') || m.includes('free')) return BOT_RESPONSES['delivery info'];
  if (m.includes('hello') || m.includes('hi') || m.includes('hey')) return "Hello! 👋 Welcome to RS Medstar Pharmacy. How can I help you today?";
  if (m.includes('thank')) return "You're welcome! 😊 Is there anything else I can help you with?";
  if (m.includes('price') || m.includes('cost') || m.includes('how much')) return "For product prices, please browse our <a href='#products' style='color:var(--red)'>Products section</a> or call us at (02) 8123-4567 for specific items.";
  return BOT_RESPONSES['default'];
}

function addMessage(text, type) {
  const msg = document.createElement('div');
  msg.className = `cb-msg ${type}`;
  msg.innerHTML = text;
  cbMessages.appendChild(msg);
  cbMessages.scrollTop = cbMessages.scrollHeight;
  return msg;
}

function showTyping() {
  const msg = addMessage('<div class="typing-dots"><span></span><span></span><span></span></div>', 'bot typing');
  return msg;
}

function botReply(text) {
  const typing = showTyping();
  setTimeout(() => {
    typing.remove();
    addMessage(text, 'bot');
  }, 900 + Math.random() * 400);
}

chatToggle.addEventListener('click', () => {
  chatWindow.classList.toggle('open');
  if (!chatOpened) {
    chatOpened = true;
    setTimeout(() => {
      addMessage("👋 Hi there! Welcome to <b>RS Medstar Pharmacy</b>. I'm your virtual assistant. How can I help you today?", 'bot');
    }, 300);
    setTimeout(() => {
      addMessage("You can ask me about our products, delivery, store hours, or how to upload a prescription.", 'bot');
    }, 1200);
  }
  chatToggle.querySelector('.notif-dot').style.display = 'none';
});

cbClose.addEventListener('click', () => chatWindow.classList.remove('open'));

cbSend.addEventListener('click', sendMessage);
cbInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

function sendMessage() {
  const text = cbInput.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  cbInput.value = '';
  cbQuickBtns.style.display = 'none';
  botReply(findResponse(text));
}

cbQuickBtns.querySelectorAll('.cb-quick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = btn.textContent.replace(/^[^\w]+/, '').trim();
    addMessage(btn.textContent, 'user');
    cbQuickBtns.style.display = 'none';
    const key = text.toLowerCase().replace('drug inquiry','drug').replace('order status','order').replace('store hours','hour').replace('upload rx','prescription').replace('delivery info','deliver');
    botReply(findResponse(key));
  });
});