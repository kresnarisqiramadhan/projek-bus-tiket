// static/js/pembeli_dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Dashboard loaded successfully!');
    
    // 1. Set current date
    setCurrentDate();
    
    // 2. Update greeting based on time
    updateGreeting();
    
    // 3. Setup logout confirmation
    setupLogoutButton();
    
    // 4. Add click effects to menu cards
    setupMenuCards();
    
    // 5. Setup Dashboard Search
    setupDashboardSearch();
    
    console.log('🎯 Dashboard JS initialized');
});

function setCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateString = now.toLocaleDateString('id-ID', options);
        dateElement.textContent = dateString;
        console.log('📅 Date set:', dateString);
    }
}

function updateGreeting() {
    const greetingElement = document.querySelector('.greeting');
    if (greetingElement) {
        const hour = new Date().getHours();
        let greeting = 'Selamat siang';
        
        if (hour < 11) greeting = 'Selamat pagi';
        if (hour >= 18) greeting = 'Selamat malam';
        
        greetingElement.textContent = greeting + ', ';
        console.log('👋 Greeting:', greeting);
    }
}

function setupLogoutButton() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            if (!confirm('Yakin ingin logout?')) {
                event.preventDefault();
            }
        });
        console.log('🚪 Logout button ready');
    }
}

function setupMenuCards() {
    const menuCards = document.querySelectorAll('.menu-card');
    
    menuCards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            this.style.transition = 'transform 0.2s';
            
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
            
            console.log('📱 Menu clicked:', this.querySelector('h3').textContent);
        });
    });
    
    console.log('🎯 Menu cards:', menuCards.length);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : '#3498db'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function setupDashboardSearch() {
    const form = document.getElementById('dashboardSearchForm');
    if (form) {
        const dateInput = document.getElementById('dashDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.value = tomorrow.toISOString().split('T')[0];
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const origin = document.getElementById('dashOrigin').value;
            const destination = document.getElementById('dashDestination').value;
            const date = document.getElementById('dashDate').value;
            const passengers = document.getElementById('dashPassengers').value;

            if (!origin || !destination || !date) {
                showNotification('Harap isi semua kolom pencarian!', 'error');
                return;
            }

            if (origin === destination) {
                showNotification('Kota asal dan tujuan tidak boleh sama!', 'error');
                return;
            }

            // Redirect to search page with parameters
            const url = `/pembeli/cari?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${date}&passengers=${passengers}`;
            window.location.href = url;
        });
        console.log('🔍 Dashboard search initialized');
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);