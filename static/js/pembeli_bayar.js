// ============================================
// PEMBAYARAN TIKET BUS - JAVASCRIPT LANGSUNG JADI
// ============================================

// Global Variables
let selectedPaymentMethod = 'bank-transfer';
let uploadedFile = null;
let paymentTimer = null;
let timeLeft = 1800; // 30 minutes in seconds

// Main Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('💰 Pembayaran Tiket JS Loaded');
    
    // Load data from storage
    loadPaymentData();
    
    // Setup all event listeners
    setupAllEventListeners();
    
    // Start payment timer
    startPaymentTimer();
    
    // Auto select bank transfer as default
    selectPaymentMethod('bank-transfer');
    
    // Add dynamic styles
    addCustomStyles();
});

// ============================================
// 1. LOAD PAYMENT DATA
// ============================================
function loadPaymentData() {
    // Try from localStorage first
    const savedData = localStorage.getItem('busBookingData') || 
                     localStorage.getItem('paymentData') ||
                     sessionStorage.getItem('busBookingData');
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            displayPaymentData(data);
            console.log('✅ Data loaded from storage:', data);
        } catch (e) {
            console.error('❌ Error parsing data:', e);
            loadFromUrlParams();
        }
    } else {
        loadFromUrlParams();
    }
}

function loadFromUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const idBus = urlParams.get('id_bus');
    const kursi = urlParams.get('kursi');
    const harga = urlParams.get('harga') || '450000';
    
    const data = {
        id_bus: idBus || 'BUS-001',
        kursi: kursi ? kursi.split(',') : ['A1', 'B2'],
        totalAmount: parseInt(harga),
        bookingId: generateBookingId(),
        busName: urlParams.get('bus') || 'Suite Class',
        origin: urlParams.get('origin') || 'Jakarta',
        destination: urlParams.get('destination') || 'Bandung',
        date: urlParams.get('date') || new Date().toISOString().split('T')[0],
        tanggalBerangkat: urlParams.get('date') || new Date().toISOString().split('T')[0],
        jamBerangkat: urlParams.get('time') || '08:00',
        scheduleId: urlParams.get('scheduleId') || ''
    };
    
    displayPaymentData(data);
}

function displayPaymentData(data) {
    // Update booking info
    document.getElementById('booking-id').textContent = data.bookingId || generateBookingId();
    document.getElementById('id-bus').textContent = data.busName || data.scheduleId || 'BUS-001';
    
    // Format kursi
    const actualSeats = data.seats || data.kursi;
    const kursiList = Array.isArray(actualSeats) ? actualSeats.join(', ') : actualSeats;
    document.getElementById('kursi-list').textContent = kursiList || 'Tidak ada kursi';
    
    // Calculate total
    const basePrice = data.price || data.totalAmount || data.basePrice || 450000;
    const seatCount = Array.isArray(data.kursi) ? data.kursi.length : 
                     (data.seats ? data.seats.length : 2);
                     
    // Gunakan totalPrice dari pilihkursi jika ada, jika tidak kalikan basePrice * seatCount
    const subtotal = data.totalPrice || (basePrice * seatCount);
    const serviceFee = 0; // Dihilangkan agar total akhir sinkron 100% dengan total kursi
    const grandTotal = subtotal + serviceFee;
    
    // Display amounts
    document.getElementById('total-amount-display').textContent = formatCurrency(grandTotal);
    document.getElementById('subtotal-breakdown').textContent = formatCurrency(subtotal);
    document.getElementById('service-fee-breakdown').textContent = formatCurrency(serviceFee);
    document.getElementById('grand-total-breakdown').textContent = formatCurrency(grandTotal);
    
    // Save for later use
    window.paymentData = {
        ...data,
        subtotal: subtotal,
        serviceFee: serviceFee,
        grandTotal: grandTotal,
        seatCount: seatCount
    };
}

// ============================================
// 2. PAYMENT METHOD SELECTION
// ============================================
function setupAllEventListeners() {
    // Payment method cards
    document.querySelectorAll('.method-card').forEach(card => {
        card.addEventListener('click', function() {
            const method = this.dataset.method;
            selectPaymentMethod(method);
        });
    });
    
    // Form submission
    document.getElementById('paymentForm').addEventListener('submit', handleFormSubmit);
    
    // Enable submit button automatically
    document.getElementById('submitBtn').disabled = false;
    
    // Navigation buttons
    document.getElementById('backBtn').addEventListener('click', () => {
        window.history.back();
    });
    
    document.getElementById('dashboardBtn').addEventListener('click', () => {
        window.location.href = '/pembeli/dashboard';
    });
    
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', loadPaymentData);
    
    // QR Modal
    document.getElementById('closeModal').addEventListener('click', hideQRModal);
    document.addEventListener('click', (e) => {
        if (e.target.id === 'qrModal') hideQRModal();
    });
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update UI
    document.querySelectorAll('.method-card').forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.method === method) {
            card.classList.add('selected');
        }
    });
    
    // Show instructions
    showPaymentInstructions(method);
    
    // Update submit button text
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i> Saya Sudah Bayar';
    submitBtn.disabled = false;
    
    console.log(`✅ Selected payment method: ${method}`);
}

function showPaymentInstructions(method) {
    const container = document.getElementById('paymentInstructions');
    let html = '';
    
    switch(method) {
        case 'bank-transfer':
            html = `
                <div style="background: #1a1a1a; padding: 20px; border-radius: 12px; border-left: 4px solid #d4af37; border-top: 1px solid #333; border-right: 1px solid #333; border-bottom: 1px solid #333;">
                    <h4 style="color: #d4af37; margin-bottom: 15px; font-weight: 700;">
                        <i class="fas fa-university"></i> Transfer Bank Resmi
                    </h4>
                    <p style="margin-bottom: 15px; color: #aaa;">Pilih dan transfer ke salah satu rekening resmi PT Kresna Prime Mobility di bawah ini:</p>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
                        <div style="background: #252525; padding: 15px; border-radius: 8px; border: 1px solid #444; transition: 0.3s;" onmouseover="this.style.borderColor='#d4af37'" onmouseout="this.style.borderColor='#444'">
                            <strong style="color: #fff; font-size: 1.1rem; display: block; margin-bottom: 5px;">BCA</strong>
                            <span style="font-family: monospace; font-size: 1.2rem; color: #d4af37; display: block;">8880 1234 5678</span>
                            <small style="color: #888; font-size: 0.8rem; margin-top: 5px; display: block;">PT KRESNA PRIME MOBILITY</small>
                        </div>
                        <div style="background: #252525; padding: 15px; border-radius: 8px; border: 1px solid #444; transition: 0.3s;" onmouseover="this.style.borderColor='#d4af37'" onmouseout="this.style.borderColor='#444'">
                            <strong style="color: #fff; font-size: 1.1rem; display: block; margin-bottom: 5px;">Mandiri</strong>
                            <span style="font-family: monospace; font-size: 1.2rem; color: #d4af37; display: block;">1370 0000 1234</span>
                            <small style="color: #888; font-size: 0.8rem; margin-top: 5px; display: block;">PT KRESNA PRIME MOBILITY</small>
                        </div>
                        <div style="background: #252525; padding: 15px; border-radius: 8px; border: 1px solid #444; transition: 0.3s;" onmouseover="this.style.borderColor='#d4af37'" onmouseout="this.style.borderColor='#444'">
                            <strong style="color: #fff; font-size: 1.1rem; display: block; margin-bottom: 5px;">BRI</strong>
                            <span style="font-family: monospace; font-size: 1.2rem; color: #d4af37; display: block;">0001 0100 1234</span>
                            <small style="color: #888; font-size: 0.8rem; margin-top: 5px; display: block;">PT KRESNA PRIME MOBILITY</small>
                        </div>
                        <div style="background: #252525; padding: 15px; border-radius: 8px; border: 1px solid #444; transition: 0.3s;" onmouseover="this.style.borderColor='#d4af37'" onmouseout="this.style.borderColor='#444'">
                            <strong style="color: #fff; font-size: 1.1rem; display: block; margin-bottom: 5px;">BNI</strong>
                            <span style="font-family: monospace; font-size: 1.2rem; color: #d4af37; display: block;">0987 6543 21</span>
                            <small style="color: #888; font-size: 0.8rem; margin-top: 5px; display: block;">PT KRESNA PRIME MOBILITY</small>
                        </div>
                    </div>
                    
                    <div style="margin-top: 15px; background: #121212; padding: 15px; border-radius: 8px;">
                        <div class="info-bullet" style="color: #ccc;">
                            <i class="fas fa-info-circle" style="color: #d4af37;"></i>
                            <span>Atas Nama: <strong style="color: #fff;">PT KRESNA PRIME MOBILITY</strong></span>
                        </div>
                        <div class="info-bullet" style="color: #ccc;">
                            <i class="fas fa-check-circle" style="color: #d4af37;"></i>
                            <span>Pastikan nominal transfer sesuai hingga 3 digit terakhir.</span>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'e-wallet':
            html = `
                <div style="background: #1a1a1a; padding: 20px; border-radius: 12px; border-left: 4px solid #d4af37; border-top: 1px solid #333; border-right: 1px solid #333; border-bottom: 1px solid #333;">
                    <h4 style="color: #d4af37; margin-bottom: 15px; font-weight: 700;">
                        <i class="fas fa-qrcode"></i> E-Wallet & QRIS
                    </h4>
                    <p style="margin-bottom: 15px; color: #aaa;">Mendukung pembayaran instan dari semua dompet digital (GoPay, OVO, DANA, ShopeePay) dan Mobile Banking.</p>
                    
                    <div style="text-align: center; margin: 25px 0;">
                        <button onclick="showQRModal()" type="button"
                                style="background: linear-gradient(135deg, #d4af37, #b5952f); color: #121212; border: none; padding: 14px 30px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; font-size: 1.1rem;"
                                onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 5px 15px rgba(212,175,55,0.3)'" 
                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            <i class="fas fa-qrcode me-2"></i> Tampilkan QR Code Pembayaran
                        </button>
                    </div>
                    <div style="background: #121212; padding: 15px; border-radius: 8px;">
                        <div class="info-bullet" style="color: #ccc;">
                            <i class="fas fa-info-circle" style="color: #d4af37;"></i>
                            <span>Scan QR Code menggunakan aplikasi E-Wallet atau M-Banking Anda.</span>
                        </div>
                        <div class="info-bullet" style="color: #ccc;">
                            <i class="fas fa-check-circle" style="color: #d4af37;"></i>
                            <span>Sistem kami akan memverifikasi pembayaran Anda secara otomatis.</span>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
    
    container.innerHTML = html;
}

// ============================================
// 3. FILE UPLOAD HANDLING (REMOVED FOR GATEWAY SIMULATION)
// ============================================

// ============================================
// 4. PAYMENT PROCESSING
// ============================================
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate based on payment method
    if (selectedPaymentMethod === 'credit-card') {
        if (!validateCreditCard()) {
            return;
        }
    }
    
    // Show confirmation (Gateway Simulation)
    Swal.fire({
        title: 'Verifikasi Pembayaran',
        html: `
            <div style="text-align: left; padding: 15px;">
                <p>Sistem akan memverifikasi mutasi rekening/QRIS untuk transaksi ini.</p>
                <p><strong>Metode:</strong> ${getPaymentMethodName(selectedPaymentMethod)}</p>
                <p><strong>Total:</strong> ${formatCurrency(window.paymentData?.grandTotal || 495000)}</p>
            </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#d4af37',
        cancelButtonColor: '#333',
        confirmButtonText: 'Ya, Cek Status Pembayaran',
        cancelButtonText: 'Batal',
        width: 500
    }).then((result) => {
        if (result.isConfirmed) {
            processPayment();
        }
    });
}

function validateCreditCard() {
    const cardNumber = document.getElementById('cardNumber')?.value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('cardExpiry')?.value;
    const cardCVV = document.getElementById('cardCVV')?.value;
    
    if (!cardNumber || cardNumber.length !== 16) {
        showNotification('Nomor kartu tidak valid', 'error');
        return false;
    }
    
    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        showNotification('Format masa berlaku tidak valid (MM/YY)', 'error');
        return false;
    }
    
    if (!cardCVV || cardCVV.length !== 3) {
        showNotification('CVV harus 3 digit', 'error');
        return false;
    }
    
    return true;
}

function processPayment() {
    // Show loading
    Swal.fire({
        title: 'Memproses Pembayaran...',
        text: 'Harap tunggu sebentar',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Simulate payment processing
    setTimeout(() => {
        // Save transaction data
        const transactionData = {
            ...window.paymentData,
            paymentMethod: selectedPaymentMethod,
            paymentTime: new Date().toISOString(),
            paymentStatus: 'success',
            transactionId: generateTransactionId(),
            referenceNumber: 'PAY-' + Date.now(),
            tanggalBerangkat: window.paymentData.tanggalBerangkat || window.paymentData.date,
            jamBerangkat: window.paymentData.jamBerangkat,
            jadwalId: window.paymentData.scheduleId || window.paymentData.jadwalId
        };
        
        const formData = new FormData();
        // Memasukkan data string ke formData
        for (const key in transactionData) {
            if (key === 'seats' || key === 'kursi' || Array.isArray(transactionData[key])) {
                formData.append(key, JSON.stringify(transactionData[key]));
            } else if (typeof transactionData[key] === 'object' && transactionData[key] !== null) {
                formData.append(key, JSON.stringify(transactionData[key]));
            } else {
                formData.append(key, transactionData[key]);
            }
        }

        fetch('/api/pembayaran', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
                throw new Error('Sesi berakhir, silakan login kembali');
            }
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {
            if (result.success) {
                localStorage.setItem('transactionData', JSON.stringify(transactionData));
                console.log('Data tersimpan:', result);
                
                // Clear timer
                if (paymentTimer) {
                    clearInterval(paymentTimer);
                }
                
                // Show success
                Swal.fire({
                    title: 'Pembayaran Berhasil Dikirim!',
                    html: `
                        <div style="text-align: center; padding: 20px;">
                            <div style="font-size: 4rem; color: #28a745; margin-bottom: 20px;">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <p style="font-size: 1.2rem; margin-bottom: 15px;">
                                Pembayaran Anda sedang kami proses. E-Tiket akan tersedia setelah diverifikasi oleh Admin.
                            </p>
                            <p style="color: #666; margin-bottom: 10px;">
                                No. Referensi: <strong>${transactionData.referenceNumber}</strong>
                            </p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonColor: '#28a745',
                    confirmButtonText: 'Cek Riwayat Pemesanan'
                }).then(() => {
                    window.location.href = '/pembeli/riwayat';
                });
            } else {
                Swal.fire('Gagal!', result.message || 'Terjadi kesalahan saat memproses pembayaran', 'error');
            }
        })
        .catch(error => {
            console.error('Gagal simpan:', error);
            Swal.fire('Error!', 'Terjadi kesalahan pada server. Silakan coba lagi.', 'error');
        });
    }, 2000);
}

// ============================================
// 5. TIMER FUNCTIONS
// ============================================
function startPaymentTimer() {
    updateTimerDisplay();
    
    paymentTimer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(paymentTimer);
            showTimeUpWarning();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = document.getElementById('timerDisplay');
    
    if (display) {
        display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Change color based on time left
        if (timeLeft < 300) { // 5 minutes
            display.style.color = '#dc3545';
            display.style.fontWeight = 'bold';
        } else if (timeLeft < 600) { // 10 minutes
            display.style.color = '#ffc107';
        }
    }
}

// ============================================
// 6. UTILITY FUNCTIONS
// ============================================
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

function generateBookingId() {
    return 'BOOK-' + Date.now().toString().slice(-8) + 
           Math.random().toString(36).substring(2, 6).toUpperCase();
}

function generateTransactionId() {
    return 'TRX-' + Date.now().toString().slice(-10) + 
           Math.random().toString(36).substring(2, 5).toUpperCase();
}

function getPaymentMethodName(method) {
    const names = {
        'bank-transfer': 'Transfer Bank',
        'e-wallet': 'E-Wallet',
        'credit-card': 'Kartu Kredit',
        'convenience-store': 'Gerai Retail'
    };
    return names[method] || 'Transfer Bank';
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Tersalin ke clipboard!', 'success');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('Tersalin ke clipboard!', 'success');
    });
}

function showQRModal() {
    document.getElementById('qrModal').style.display = 'flex';
}

function hideQRModal() {
    document.getElementById('qrModal').style.display = 'none';
}

function setupCreditCardInputs() {
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardCVV = document.getElementById('cardCVV');
    
    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = value.substring(0, 19);
        });
    }
    
    if (cardExpiry) {
        cardExpiry.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value.substring(0, 5);
        });
    }
    
    if (cardCVV) {
        cardCVV.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
        });
    }
}

// ============================================
// 7. NOTIFICATION FUNCTIONS
// ============================================
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const oldNotif = document.querySelector('.custom-notification');
    if (oldNotif) oldNotif.remove();
    
    // Create new notification
    const notif = document.createElement('div');
    notif.className = `custom-notification ${type}`;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : 
                     type === 'error' ? '#dc3545' : 
                     type === 'warning' ? '#ffc107' : '#17a2b8'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
    `;
    
    const icon = type === 'success' ? 'fa-check-circle' :
                 type === 'error' ? 'fa-exclamation-circle' :
                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    notif.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notif);
    
    // Auto remove
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(100px)';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

function showTimeUpWarning() {
    Swal.fire({
        title: 'Waktu Pembayaran Habis!',
        html: `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 4rem; color: #dc3545; margin-bottom: 20px;">
                    <i class="fas fa-clock"></i>
                </div>
                <p style="font-size: 1.2rem; margin-bottom: 15px;">
                    Waktu pembayaran Anda telah habis
                </p>
                <p style="color: #666;">
                    Silakan lakukan pemesanan ulang
                </p>
            </div>
        `,
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Pesan Ulang',
        allowOutsideClick: false
    }).then(() => {
        // Clear data and redirect
        localStorage.removeItem('busBookingData');
        localStorage.removeItem('paymentData');
        sessionStorage.clear();
        window.location.href = '/pembeli/caritiket';
    });
}

// ============================================
// 8. CUSTOM STYLES
// ============================================
function addCustomStyles() {
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
        
        .virtual-account-display {
            font-family: 'Courier New', monospace;
            font-size: 1.3rem;
            letter-spacing: 2px;
            background: #f8f9fa;
            padding: 12px;
            border-radius: 8px;
            border: 2px dashed #dee2e6;
            margin: 10px 0;
            text-align: center;
        }
        
        .info-bullet {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin: 8px 0;
            font-size: 0.95rem;
        }
        
        .info-bullet i {
            color: #28a745;
            margin-top: 3px;
            min-width: 20px;
        }
        
        /* Payment method animations */
        .method-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .method-card.selected {
            animation: pulse 0.5s ease;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        /* File upload animations */
        .upload-section.drag-over {
            animation: shake 0.5s ease;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        /* Timer animation */
        .timer-display {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// 9. GLOBAL EXPORTS
// ============================================
window.copyToClipboard = copyToClipboard;
window.showQRModal = showQRModal;
window.hideQRModal = hideQRModal;
window.removeFile = removeFile;
window.selectPaymentMethod = selectPaymentMethod;

console.log('🚀 Pembayaran Tiket JS siap digunakan!');