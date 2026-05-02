// REGISTRATION





// Mobile Btn menu
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}


// Form hide Auth.html
function showForm(formType) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginTab = document.getElementById('loginTab');
  const signupTab = document.getElementById('signupTab');
  const footerText = document.getElementById('formFooterText');

  if (formType === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');

    loginTab.classList.remove('text-gray-500', 'hover:text-red-600', 'font-medium');
    loginTab.classList.add('text-red-700', 'border-b-2', 'border-red-700', 'font-semibold');

    signupTab.classList.remove('text-red-700', 'border-b-2', 'border-red-700', 'font-semibold');
    signupTab.classList.add('text-gray-500', 'hover:text-red-600', 'font-medium');

    footerText.innerHTML = 'Don\'t have an account? <a href="#" class="font-semibold text-red-700 hover:text-red-800" onclick="showForm(\'signup\')">Sign up for free</a>.';

  } else {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');

    signupTab.classList.remove('text-gray-500', 'hover:text-red-600', 'font-medium');
    signupTab.classList.add('text-red-700', 'border-b-2', 'border-red-700', 'font-semibold');

    loginTab.classList.remove('text-red-700', 'border-b-2', 'border-red-700', 'font-semibold');
    loginTab.classList.add('text-gray-500', 'hover:text-red-600', 'font-medium');

    footerText.innerHTML = 'Already have an account? <a href="#" class="font-semibold text-red-700 hover:text-red-800" onclick="showForm(\'login\')">Sign in</a>.';
  }
}

const terms = document.getElementById('tos');
if (terms) {
  terms.addEventListener('click', () => {
    alert('Sample Terms and Condition pop-up')
  });
}