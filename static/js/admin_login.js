// ============================================
// ADMIN LOGIN - JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Admin Login JS Loaded');
    setupEventListeners();
    checkSavedCredentials();
    checkUrlParams();
    addCustomStyles();
});

function setupEventListeners() {
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) togglePassword.addEventListener('click', togglePasswordVisibility);

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleFormSubmit);

    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) forgotPassword.addEventListener('click', handleForgotPassword);

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
        emailInput.addEventListener('input', clearEmailError);
    }
    if (passwordInput) {
        passwordInput.addEventListener('blur', validatePassword);
        passwordInput.addEventListener('input', clearPasswordError);
    }
}

// ============================================
// FORM HANDLING — submit ke Flask langsung
// ============================================
function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    const remember = form.remember ? form.remember.checked : false;

    if (!validateForm(email, password)) return;

    showLoading(true);

    if (remember) {
        saveCredentials(email);
    } else {
        clearCredentials();
    }

    // Submit ke Flask — bukan simulasi
    form.submit();
}

function validateForm(email, password) {
    let isValid = true;
    if (!validateEmailInput(email)) {
        showInputError('email', 'Email tidak valid');
        isValid = false;
    }
    if (!validatePasswordInput(password)) {
        showInputError('password', 'Password minimal 6 karakter');
        isValid = false;
    }
    return isValid;
}

function validateEmail() {
    const emailInput = document.getElementById('email');
    if (emailInput && emailInput.value.trim()) {
        if (!validateEmailInput(emailInput.value)) {
            showInputError('email', 'Format email tidak valid');
            return false;
        }
    }
    return true;
}

function validatePassword() {
    const passwordInput = document.getElementById('password');
    if (passwordInput && passwordInput.value.trim()) {
        if (!validatePasswordInput(passwordInput.value)) {
            showInputError('password', 'Password minimal 6 karakter');
            return false;
        }
    }
    return true;
}

function validateEmailInput(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePasswordInput(password) {
    return password.length >= 6;
}

function clearEmailError() {
    const el = document.getElementById('email');
    if (el) {
        el.classList.remove('error');
        const err = el.parentElement.querySelector('.input-error');
        if (err) err.remove();
    }
}

function clearPasswordError() {
    const el = document.getElementById('password');
    if (el) {
        el.classList.remove('error');
        const err = el.parentElement.querySelector('.input-error');
        if (err) err.remove();
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('togglePassword').querySelector('i');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.replace('fa-eye-slash', 'fa-eye');
    }
    passwordInput.focus();
}

function showLoading(show) {
    const submitBtn = document.getElementById('submitBtn');
    const buttonText = document.getElementById('buttonText');
    if (show) {
        submitBtn.disabled = true;
        buttonText.innerHTML = '<span class="loading"></span> Memproses...';
    } else {
        submitBtn.disabled = false;
        buttonText.textContent = 'Login ke Dashboard';
    }
}

function showMessage(message, type = 'error') {
    const container = document.getElementById('messageContainer');
    container.innerHTML = '';
    const div = document.createElement('div');
    div.className = `${type}-message`;
    const icon = type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    div.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    container.appendChild(div);
    if (type !== 'error') {
        setTimeout(() => { div.style.opacity = '0'; setTimeout(() => div.remove(), 300); }, 5000);
    }
}

function showInputError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.add('error', 'shake');
    setTimeout(() => input.classList.remove('shake'), 500);
    const existing = input.parentElement.querySelector('.input-error');
    if (existing) existing.remove();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'input-error';
    errorDiv.style.cssText = 'color:#d32f2f;font-size:0.8rem;margin-top:5px;display:flex;align-items:center;gap:5px;';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
    input.parentElement.appendChild(errorDiv);
}

function checkSavedCredentials() {
    const savedEmail = localStorage.getItem('admin_email');
    const rememberChecked = localStorage.getItem('admin_remember') === 'true';
    if (savedEmail && rememberChecked) {
        const emailInput = document.getElementById('email');
        const rememberCheckbox = document.getElementById('remember');
        if (emailInput) emailInput.value = savedEmail;
        if (rememberCheckbox) {
            rememberCheckbox.checked = true;
            const passwordInput = document.getElementById('password');
            if (passwordInput) setTimeout(() => passwordInput.focus(), 100);
        }
    }
}

function saveCredentials(email) {
    localStorage.setItem('admin_email', email);
    localStorage.setItem('admin_remember', 'true');
}

function clearCredentials() {
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_remember');
}

function handleForgotPassword(e) {
    e.preventDefault();
    const emailInput = document.getElementById('email');
    const email = emailInput ? emailInput.value.trim() : '';
    if (!email) { showMessage('Masukkan email untuk reset password', 'error'); emailInput.focus(); return; }
    if (!validateEmailInput(email)) { showMessage('Format email tidak valid', 'error'); return; }
    if (confirm(`Kirim reset password ke ${email}?`)) {
        showMessage('Hubungi administrator sistem untuk reset password.', 'info');
    }
}

function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
        const msgs = { invalid: 'Email atau password tidak valid', session: 'Sesi telah berakhir', unauthorized: 'Akses tidak diizinkan', required: 'Email dan password diperlukan' };
        showMessage(msgs[error] || 'Terjadi kesalahan saat login', 'error');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (urlParams.get('success') === 'logout') {
        showMessage('Anda telah logout', 'success');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}   

function addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `.error{border-color:#d32f2f!important;background:#fff5f5!important}.error:focus{box-shadow:0 0 0 3px rgba(211,47,47,.1)!important}`;
    document.head.appendChild(style);
}

window.validateEmail = validateEmail;
window.validatePassword = validatePassword;
window.togglePasswordVisibility = togglePasswordVisibility;
window.handleForgotPassword = handleForgotPassword;