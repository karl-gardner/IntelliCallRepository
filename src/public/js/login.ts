/**
 * Login Page JavaScript
 * Handles login form and password visibility toggle
 */

(function() {
  'use strict';

  console.log('IntelliCall Login Page Loaded');

  // Password visibility toggle
  const togglePasswordBtn = document.getElementById('togglePassword') as HTMLButtonElement | null;
  const passwordInput = document.getElementById('password') as HTMLInputElement | null;
  const eyeIcon = document.getElementById('eyeIcon') as HTMLElement | null;
  const eyeOffIcon = document.getElementById('eyeOffIcon') as HTMLElement | null;

  if (togglePasswordBtn && passwordInput && eyeIcon && eyeOffIcon) {
    togglePasswordBtn.addEventListener('click', function() {
      // Toggle password visibility
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';

      // Toggle eye icons
      if (isPassword) {
        eyeIcon.style.display = 'none';
        eyeOffIcon.style.display = 'block';
      } else {
        eyeIcon.style.display = 'block';
        eyeOffIcon.style.display = 'none';
      }
    });
  }

  // Form validation (basic client-side)
  const loginForm = document.getElementById('loginForm') as HTMLFormElement | null;
  if (loginForm) {
    loginForm.addEventListener('submit', function(e: Event) {
      const usernameInput = document.getElementById('username') as HTMLInputElement | null;
      const passwordInputField = document.getElementById('password') as HTMLInputElement | null;

      const username = usernameInput?.value.trim() || '';
      const password = passwordInputField?.value || '';

      if (!username || !password) {
        e.preventDefault();
        alert('Please enter both username and password.');
      }
    });
  }

})();
