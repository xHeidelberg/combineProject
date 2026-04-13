// Auth handlers: sends login/signup requests to /api/auth.php

// Assumes `showForm()` exists in scripts.js

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  // Determine API host: if page is served by Live Server (:5500) use localhost:8000 for PHP
  const usePort8000 = (location.port === '5500');
  const API_BASE = usePort8000 ? `${location.protocol}//${location.hostname}:8000` : '';
  const AUTH_URL = API_BASE + '/api/auth.php';

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
          alert('Account created. You can now sign in.');
          if (typeof showForm === 'function') showForm('login');
        } else {
          alert(data.message || 'Signup failed');
        }
      } catch (err) {
        console.error(err);
        alert('Signup failed — check console for details.');
      }
    });
  }
});
