document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi halaman
    function initializePage() {
        setupEventListeners();
        generateQRCode();
        setupCountdownTimer();
        
        console.log('Halaman E-Ticket telah dimuat (Data dari Database)');
    }

    // Ambil teks dari elemen DOM
    function getText(id) {
        const el = document.getElementById(id);
        return el ? el.textContent.trim() : '';
    }

    // Generate QR code simulasi
    function generateQRCode() {
        const qrContainer = document.getElementById('qr-code-container');
        if (!qrContainer) return;
        
        const bookingId = getText('booking-id');
        
        qrContainer.innerHTML = `
            <div class="qr-code-placeholder">
                <i class="fas fa-qrcode"></i>
                <p>Scan QR Code</p>
                <small>Booking ID: ${bookingId}</small>
            </div>
            <p class="qr-instructions">Tunjukkan QR code ini kepada petugas saat naik bus</p>
        `;
    }

    // Setup countdown timer untuk validitas tiket
    function setupCountdownTimer() {
        const timerElement = document.getElementById('validity-timer');
        if (!timerElement) return;
        
        // Asumsikan tiket valid 24 jam dari waktu akses untuk contoh simulasi
        const validityEnd = new Date();
        validityEnd.setHours(validityEnd.getHours() + 24);
        
        function updateTimer() {
            const now = new Date();
            const diff = validityEnd - now;
            
            if (diff <= 0) {
                timerElement.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Tiket telah kedaluwarsa</span>
                `;
                timerElement.style.color = '#e74c3c';
                return;
            }
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            timerElement.innerHTML = `
                <i class="fas fa-clock"></i>
                <span>Berlaku hingga: ${hours} jam ${minutes} menit ${seconds} detik</span>
            `;
            
            if (hours < 1) {
                timerElement.style.color = '#e74c3c';
            } else if (hours < 6) {
                timerElement.style.color = '#f39c12';
            } else {
                timerElement.style.color = '#27ae60';
            }
        }
        
        updateTimer();
        setInterval(updateTimer, 1000);
    }

    // Setup event listeners
    function setupEventListeners() {
        const printBtn = document.getElementById('print-ticket-btn');
        if (printBtn) {
            printBtn.addEventListener('click', function() {
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mempersiapkan cetakan...';
                
                setTimeout(() => {
                    window.print();
                    this.innerHTML = '<i class="fas fa-print"></i> Cetak Tiket';
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Tiket Siap Dicetak',
                        text: 'Dialog cetak telah dibuka. Pastikan printer Anda tersambung.',
                        confirmButtonColor: '#3498db',
                        timer: 3000
                    });
                }, 1000);
            });
        }
        
        const savePdfBtn = document.getElementById('save-pdf-btn');
        if (savePdfBtn) {
            savePdfBtn.addEventListener('click', function() {
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuat PDF...';
                const bookingId = getText('booking-id');
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-file-pdf"></i> Simpan PDF';
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'PDF Berhasil Disimpan',
                        html: `
                            <p>Tiket Anda telah disimpan sebagai PDF.</p>
                            <p><strong>Nama file:</strong> tiket-${bookingId}.pdf</p>
                        `,
                        confirmButtonText: 'Unduh Sekarang',
                        showCancelButton: true,
                        cancelButtonText: 'Nanti Saja',
                        confirmButtonColor: '#27ae60'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            Swal.fire({
                                icon: 'info',
                                title: 'Download Dimulai',
                                text: 'File PDF sedang diunduh...',
                                timer: 2000
                            });
                        }
                    });
                }, 1500);
            });
        }
        
        const shareBtn = document.getElementById('share-ticket-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', function() {
                Swal.fire({
                    title: 'Bagikan Tiket',
                    html: `
                        <p>Pilih metode untuk berbagi tiket:</p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
                            <button class="share-option" data-method="whatsapp" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer;">
                                <i class="fab fa-whatsapp" style="color: #25D366; font-size: 24px;"></i>
                                <div style="margin-top: 5px;">WhatsApp</div>
                            </button>
                            <button class="share-option" data-method="email" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer;">
                                <i class="fas fa-envelope" style="color: #EA4335; font-size: 24px;"></i>
                                <div style="margin-top: 5px;">Email</div>
                            </button>
                        </div>
                    `,
                    showConfirmButton: false,
                    showCloseButton: true
                });
                
                setTimeout(() => {
                    document.querySelectorAll('.share-option').forEach(option => {
                        option.addEventListener('click', function() {
                            shareTicket(this.dataset.method);
                        });
                    });
                }, 100);
            });
        }
        
        const backBtn = document.getElementById('back-dashboard-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                window.location.href = '/pembeli/dashboard';
            });
        }
    }

    // Fungsi untuk berbagi tiket
    function shareTicket(method) {
        const fromCity = getText('from-city');
        const toCity = getText('to-city');
        const travelDate = getText('travel-date');
        const bookingId = getText('booking-id');
        const passengerName = getText('passenger-name');
        const busName = getText('bus-name');
        const departureTime = getText('booking-time');
        
        const shareData = {
            title: `Tiket Bus ${fromCity} → ${toCity}`,
            text: `Saya telah memesan tiket bus ${busName} dari ${fromCity} ke ${toCity} pada ${travelDate}. Booking ID: ${bookingId}`,
            url: window.location.href
        };
        
        if (method === 'whatsapp') {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`;
            Swal.fire({
                icon: 'info',
                title: 'Berbagi via WhatsApp',
                html: `<p>Anda akan diarahkan ke WhatsApp untuk berbagi tiket.</p>`,
                confirmButtonText: 'Buka WhatsApp',
                showCancelButton: true,
                confirmButtonColor: '#25D366'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.open(whatsappUrl, '_blank');
                }
            });
        } else if (method === 'email') {
            const emailSubject = `Tiket Bus: ${bookingId}`;
            const emailBody = `
Halo,

Berikut adalah detail tiket bus yang telah saya pesan:

Booking ID: ${bookingId}
Nama Penumpang: ${passengerName}
Rute: ${fromCity} → ${toCity}
Tanggal: ${travelDate}
Jam Keberangkatan: ${departureTime}
Bus: ${busName}

Tiket ini dapat dilihat di: ${shareData.url}

Terima kasih.
            `;
            const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
            
            Swal.fire({
                icon: 'info',
                title: 'Berbagi via Email',
                html: `<p>Aplikasi email default Anda akan terbuka untuk mengirim tiket.</p>`,
                confirmButtonText: 'Buka Email',
                showCancelButton: true,
                confirmButtonColor: '#EA4335'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = mailtoUrl;
                }
            });
        }
        Swal.close();
    }

    if (!document.querySelector('link[href*="sweetalert2"]')) {
        const sweetAlertCSS = document.createElement('link');
        sweetAlertCSS.rel = 'stylesheet';
        sweetAlertCSS.href = 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css';
        document.head.appendChild(sweetAlertCSS);
        
        const sweetAlertJS = document.createElement('script');
        sweetAlertJS.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        document.body.appendChild(sweetAlertJS);
        
        sweetAlertJS.onload = initializePage;
    } else {
        initializePage();
    }
});