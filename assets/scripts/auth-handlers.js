document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  // Determine API host Live Server 5500 use 8000 for db
  const usePort8000 = (location.port === '5500');
  const API_BASE = usePort8000 ? `${location.protocol}//${location.hostname}:8000` : '';
  const AUTH_URL = API_BASE + '/api/auth.php'; // palitan pag ilipat sa ibang folder

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      try {
        const res = await fetch(AUTH_URL, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ action: 'login', email, password })
        });

        let data;
        try {
          data = await res.json();
        } catch (err) {
          const text = await res.text();
          console.error('Non-JSON login response', res.status, text);
          alert('Server error during login');
          return;
        }
        console.log('Login response', data);
        if (data.success) {
          window.location.href = '/pages/main.html';
        } else {
          alert(data.message || 'Invalid credentials');
        }
      } catch (err) {
        console.error(err);
        alert('Login failed — check console for details.');
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const termsChecked = document.getElementById('terms').checked;
      if (!termsChecked) {
        alert('You must agree to the terms.');
        return;
      }

      try {
        const res = await fetch(AUTH_URL, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ action: 'signup', firstName, lastName, email, password })
        });

        let data;
        try {
          data = await res.json();
        } catch (err) {
          const text = await res.text();
          console.error('Non-JSON signup response', res.status, text);
          alert('Server error during signup');
          return;
        }
        console.log('Signup response', data);
        if (data.success) {
          // register auto login / if ever success no need to login 
          try {
            const loginRes = await fetch(AUTH_URL, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({ action: 'login', email, password })
            });

            let loginData;
            try {
              loginData = await loginRes.json();
            } catch (err) {
              loginData = null;
            }

            if (loginData && loginData.success) {
              window.location.href = '/pages/main.html';
            } else {
              alert('Account created. Please sign in.');
              if (typeof showForm === 'function') showForm('login');
            }
          } catch (err) {
            console.error('Auto-login failed', err);
            alert('Account created. Please sign in.');
            if (typeof showForm === 'function') showForm('login');
          }
        } else {
          alert(data.message || 'Signup failed');
        }
      } catch (err) {
        console.error(err);
        alert('Signup failed — (check dev tools tapos console)');
      }
    });
  }
});
