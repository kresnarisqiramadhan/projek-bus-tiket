// =====================
// PEMBELI LOGIN JS (CLEAN VERSION)
// Fokus UI / UX saja
// =====================

document.addEventListener('DOMContentLoaded', () => {
    initBackgroundAnimation();
    initFormValidation();
    initPasswordToggle();
    initSocialLogin();
    initRememberMe();
    initLanguageSelector();
    initVisitorCounter();

    // Auto focus email
    setTimeout(() => {
        const email = document.getElementById('email');
        if (email) email.focus();
    }, 400);
});

// =====================
// Background Animation
// =====================
function initBackgroundAnimation() {
    const bg = document.querySelector('.bg-animation');
    if (!bg) return;

    for (let i = 0; i < 15; i++) {
        const c = document.createElement('div');
        c.className = 'bg-circle';
        c.style.width = c.style.height = `${Math.random() * 80 + 40}px`;
        c.style.left = `${Math.random() * 100}%`;
        c.style.animationDelay = `${Math.random() * 8}s`;
        c.style.animationDuration = `${Math.random() * 15 + 10}s`;
        bg.appendChild(c);
    }
}

// =====================
// Form Validation
// =====================
function initFormValidation() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const btn = document.getElementById('loginBtn');

    const validateEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const updateBtn = () => {
        btn.disabled = !(
            validateEmail(email.value.trim()) &&
            password.value.length >= 6
        );
    };

    email.addEventListener('input', updateBtn);
    password.addEventListener('input', updateBtn);

    form.addEventListener('submit', () => {
        btn.classList.add('loading');
        btn.disabled = true;
    });
}

// =====================
// Password Toggle
// =====================
function initPasswordToggle() {
    const btn = document.getElementById('togglePassword');
    const input = document.getElementById('password');
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
        const isPwd = input.type === 'password';
        input.type = isPwd ? 'text' : 'password';
        btn.querySelector('i').className = `fas fa-eye${isPwd ? '-slash' : ''}`;
    });
}

// =====================
// Social Login (Dummy)
// =====================
function initSocialLogin() {
    ['googleLogin', 'facebookLogin'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.onclick = () =>
                showNotification('Fitur ini belum tersedia', 'info');
        }
    });
}

// =====================
// Remember Me (Email Only)
// =====================
function initRememberMe() {
    const cb = document.getElementById('rememberMe');
    const email = document.getElementById('email');
    if (!cb || !email) return;

    const saved = localStorage.getItem('rememberedEmail');
    if (saved) {
        email.value = saved;
        cb.checked = true;
    }

    cb.addEventListener('change', () => {
        cb.checked
            ? localStorage.setItem('rememberedEmail', email.value.trim())
            : localStorage.removeItem('rememberedEmail');
    });
}

// =====================
// Language Selector
// =====================
function initLanguageSelector() {
    const select = document.getElementById('languageSelect');
    if (!select) return;

    select.addEventListener('change', () => {
        showNotification(
            `Bahasa: ${select.value === 'id' ? 'Indonesia' : 'English'}`,
            'info'
        );
    });
}

// =====================
// Visitor Counter
// =====================
function initVisitorCounter() {
    const counter = document.getElementById('visitorCount');
    if (!counter) return;

    let count = Number(localStorage.getItem('visitorCount') || 0) + 1;
    localStorage.setItem('visitorCount', count);
    counter.textContent = count;
}

// =====================
// Notification
// =====================
function showNotification(msg, type = 'info') {
    const old = document.querySelector('.notification');
    if (old) old.remove();

    const n = document.createElement('div');
    n.className = `notification ${type}`;
    n.innerHTML = `<span>${msg}</span>`;
    document.body.appendChild(n);

    setTimeout(() => n.classList.add('show'), 10);
    setTimeout(() => n.remove(), 4000);
}
