// pembeli_caritiket.js - Bus beroperasi setiap hari (tanpa tanggal di jadwal)

document.addEventListener('DOMContentLoaded', function() {
    initForm();
    initDate();
    loadArmada();
    checkUrlParams();
    initStickySearch();
    startFakePopups();
});

function initStickySearch() {
    window.addEventListener('scroll', function() {
        const searchWidget = document.querySelector('.search-widget-container');
        if (window.scrollY > 350) {
            searchWidget.classList.add('sticky-search');
        } else {
            searchWidget.classList.remove('sticky-search');
        }
    });
}

// tampilkan 4 armada tetap
function loadArmada() {
    const grid = document.querySelector('.fleet-grid');
    if (!grid) return;

    const armada = [
        { 
            icon: 'fa-bed',
            name: 'Sleeper Bus', 
            tag: 'Tidur Nyaman',
            desc: 'Kursi tidur flatbed 180° untuk perjalanan malam hari yang maksimal',
            fasilitas: ['AC Double', 'Selimut & Bantal', 'Colokan USB', 'Toilet'],
        },
        { 
            icon: 'fa-bus',
            name: 'Double Decker', 
            tag: 'Lantai 2',
            desc: 'Bus tingkat 2 lantai dengan kursi panorama dan pemandangan terbaik',
            fasilitas: ['WiFi', 'TV LCD', 'AC', 'Colokan USB'],
        },
        { 
            icon: 'fa-truck',
            name: 'Tronton', 
            tag: 'Kapasitas Besar',
            desc: 'Bus besar berkapasitas tinggi, ideal untuk perjalanan rombongan',
            fasilitas: ['AC', 'Reclining Seat', 'Bagasi Luas', 'Toilet'],
        },
        { 
            icon: 'fa-crown',
            name: 'VIP Class', 
            tag: 'Premium',
            desc: 'Kursi VIP eksklusif dengan pelayanan setara kabin pesawat First Class',
            fasilitas: ['Suite Seat', 'Makan Gratis', 'WiFi Premium', 'Lounge'],
        },
    ];

    grid.innerHTML = armada.map(a => `
        <div class="fleet-item-pro">
            <div class="fleet-icon-pro">
                <i class="fas ${a.icon}"></i>
            </div>
            <div class="fleet-tag-pro">${a.tag}</div>
            <h4 class="fleet-name-pro">${a.name}</h4>
            <p class="fleet-desc-pro">${a.desc}</p>
            <div class="fleet-fasilitas">
                ${a.fasilitas.map(f => `<span class="fasilitas-item"><i class="fas fa-check"></i> ${f}</span>`).join('')}
            </div>
        </div>
    `).join('');
}


function initForm() {
    const form = document.getElementById('searchForm');
    if (form) form.addEventListener('submit', e => { e.preventDefault(); cariTiket(); });
}

function initDate() {
    const dateInput = document.getElementById('departureDate');
    if (!dateInput) return;
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    const max = new Date();
    max.setMonth(max.getMonth() + 3);
    dateInput.max = max.toISOString().split('T')[0];
    // set default besok
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
}

function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const origin = params.get('origin');
    const destination = params.get('destination');
    const date = params.get('date');
    const passengers = params.get('passengers');

    if (origin && destination && date) {
        const originSelect = document.getElementById('origin');
        const destSelect = document.getElementById('destination');
        const dateInput = document.getElementById('departureDate');
        const passSelect = document.getElementById('passengers');

        if (originSelect) originSelect.value = origin;
        if (destSelect) destSelect.value = destination;
        if (dateInput) dateInput.value = date;
        if (passSelect && passengers) passSelect.value = passengers;

        // Auto trigger search with slight delay to show loading animation properly
        setTimeout(() => {
            cariTiket();
        }, 300);
    }
}

function cariTiket() {
    const origin = document.getElementById('origin')?.value;
    const destination = document.getElementById('destination')?.value;
    const date = document.getElementById('departureDate')?.value;

    if (!origin || !destination || !date) {
        showNotif('Harap isi semua field!', 'error'); return;
    }
    if (origin === destination) {
        showNotif('Kota asal dan tujuan tidak boleh sama!', 'error'); return;
    }

    showLoading(true);

    fetch(`/api/jadwal/cari?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${date}`)
        .then(r => {
            if (r.redirected) {
                window.location.href = r.url;
                return Promise.reject('Sesi berakhir, silakan login kembali.');
            }
            return r.json();
        })
        .then(data => {
            showLoading(false);
            if (data.success && data.results.length > 0) {
                tampilHasil(data.results, date);
                showNotif(`Ditemukan ${data.results.length} jadwal`, 'success');
            } else {
                tampilKosong(origin, destination);
                showNotif('Tidak ada jadwal tersedia untuk rute ini', 'warning');
            }
        })
        .catch(() => {
            showLoading(false);
            showNotif('Terjadi kesalahan, coba lagi', 'error');
        });
}

function tampilHasil(results, selectedDate) {
    const busList = document.getElementById('busList');
    const noResults = document.getElementById('noResults');
    const searchResults = document.getElementById('searchResults');
    const resultsCount = document.getElementById('resultsCount');

    resultsCount.textContent = `${results.length} jadwal ditemukan`;
    busList.innerHTML = '';

    // Format tanggal untuk display
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dateDisplay = dateObj.toLocaleDateString('id-ID', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });

    results.forEach(bus => {
        const card = document.createElement('div');
        card.className = 'bus-card';
        const seatPct = Math.round((bus.availableSeats / bus.totalSeats) * 100);
        const seatColor = seatPct > 50 ? '#27ae60' : seatPct > 20 ? '#f39c12' : '#e74c3c';
        const isFull = bus.availableSeats <= 0;

        card.innerHTML = `
            <div class="bus-card-header">
                <div>
                    <h3>${bus.busName}</h3>
                    <div class="bus-number">${bus.departureTime}${bus.arrivalTime ? ' - ' + bus.arrivalTime : ''}</div>
                </div>
                <span class="bus-type-badge">${isFull ? '🔴 Penuh' : '🟢 Tersedia'}</span>
            </div>
            <div class="bus-card-body">
                <div class="route-row">
                    <div class="route-city">
                        <div class="city-name">${bus.origin}</div>
                        <small style="color:#999;font-size:11px;">Asal</small>
                    </div>
                    <div class="route-arrow">
                        <div class="arrow-line"></div>
                        <small>${dateDisplay}</small>
                    </div>
                    <div class="route-city">
                        <div class="city-name">${bus.destination}</div>
                        <small style="color:#999;font-size:11px;">Tujuan</small>
                    </div>
                </div>
                <div class="bus-info-row">
                    <span>🪑 <b style="color:${seatColor}">${bus.availableSeats}</b>/${bus.totalSeats} kursi tersedia</span>
                    <span style="margin-left:auto;font-size:12px;color:${seatColor};font-weight:600;">${seatPct}% tersedia</span>
                </div>
            </div>
            <div class="bus-card-footer">
                <div class="price-tag">
                    ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(bus.price)}
                    <small>/orang</small>
                </div>
                ${isFull 
                    ? '<button class="select-btn" disabled style="opacity:0.5;cursor:not-allowed;">Kursi Penuh</button>'
                    : '<button class="select-btn">Pilih Jadwal →</button>'
                }
            </div>
        `;

        if (!isFull) {
            card.querySelector('.select-btn').addEventListener('click', function() {
                pilihJadwal(bus.id, bus.busName, bus, selectedDate);
            });
        }

        busList.appendChild(card);
    });

    noResults.style.display = 'none';
    searchResults.style.display = 'block';
}

function tampilKosong(origin, destination) {
    const noResults = document.getElementById('noResults');
    const searchResults = document.getElementById('searchResults');
    const resultsCount = document.getElementById('resultsCount');

    resultsCount.textContent = '0 jadwal ditemukan';
    noResults.style.display = 'block';
    noResults.innerHTML = `
        <i class="fas fa-search"></i>
        <h3>Tidak ada jadwal tersedia</h3>
        <p>Belum ada jadwal untuk rute ${origin} - ${destination}. Coba rute lain atau hubungi kami.</p>
    `;
    searchResults.style.display = 'none';
}

function pilihJadwal(scheduleId, busName, busData, selectedDate) {
    sessionStorage.setItem('bookingData', JSON.stringify({
        scheduleId, busName,
        origin: busData.origin,
        destination: busData.destination,
        date: selectedDate,  // tanggal yang dipilih user
        departureTime: busData.departureTime,
        arrivalTime: busData.arrivalTime || '',
        price: busData.price,
        availableSeats: busData.availableSeats,
        totalSeats: busData.totalSeats,
        passengers: parseInt(document.getElementById('passengers')?.value || 1),
        timestamp: new Date().toISOString()
    }));

    localStorage.setItem('selectedScheduleId', scheduleId);
    localStorage.setItem('selectedBusName', busName);

    showNotif(`Memilih ${busName}`, 'success');
    setTimeout(() => { window.location.href = `/pembeli/kursi?schedule=${scheduleId}`; }, 800);
}

function startFakePopups() {
    const messages = [
        "Seseorang baru saja memesan tiket ke rute ini!",
        "3 kursi terakhir di bus Premium hampir habis.",
        "5 orang sedang melihat rute ini sekarang.",
        "Harga tiket termurah ditemukan untuk besok!"
    ];
    setInterval(() => {
        if(Math.random() > 0.4) {
            const msg = messages[Math.floor(Math.random() * messages.length)];
            const div = document.createElement('div');
            div.className = 'fake-popup';
            div.innerHTML = `<i class="fas fa-bell"></i> <div><h4 style="margin:0; font-size: 13px; color:#d4af37; margin-bottom: 2px;">Pemberitahuan</h4><p style="margin:0; font-size: 12px; opacity: 0.9;">${msg}</p></div>`;
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 6000);
        }
    }, 15000);
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    const searchResults = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');
    if (loading) loading.style.display = show ? 'block' : 'none';
    if (searchResults && show) searchResults.style.display = 'none';
    if (noResults && show) noResults.style.display = 'none';
}

function showNotif(msg, type = 'info') {
    const old = document.querySelector('.notif-toast');
    if (old) old.remove();
    const n = document.createElement('div');
    n.className = 'notif-toast';
    n.style.cssText = `position:fixed;top:20px;right:20px;padding:14px 20px;border-radius:8px;color:white;font-size:14px;z-index:9999;
        background:${type==='success'?'#27ae60':type==='error'?'#e74c3c':type==='warning'?'#f39c12':'#3498db'}`;
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 4000);
}

// styles tambahan
const style = document.createElement('style');
style.textContent = `
    /* Armada Kami - Professional Black & Gold */
    .fleet-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 14px; }
    .fleet-item-pro {
        background: linear-gradient(160deg, #1a1a1a 0%, #111 100%);
        border: 1px solid rgba(212, 175, 55, 0.2);
        border-radius: 16px;
        padding: 28px 22px;
        text-align: center;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
        cursor: default;
        position: relative;
        overflow: hidden;
    }
    .fleet-item-pro::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: linear-gradient(to right, #d4af37, #f9d976, #d4af37);
    }
    .fleet-item-pro:hover { transform: translateY(-8px); box-shadow: 0 16px 40px rgba(0,0,0,0.7); border-color: rgba(212, 175, 55, 0.5); }
    .fleet-icon-pro {
        width: 70px; height: 70px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 16px;
        background: rgba(212, 175, 55, 0.1);
        border: 2px solid rgba(212, 175, 55, 0.3);
        font-size: 26px;
        color: #d4af37;
        transition: background 0.3s;
    }
    .fleet-item-pro:hover .fleet-icon-pro { background: rgba(212, 175, 55, 0.2); }
    .fleet-tag-pro {
        display: inline-block;
        padding: 4px 14px;
        border-radius: 20px;
        font-size: 10px;
        font-weight: 700;
        margin-bottom: 10px;
        letter-spacing: 1px;
        text-transform: uppercase;
        background: rgba(212, 175, 55, 0.12);
        color: #d4af37;
        border: 1px solid rgba(212, 175, 55, 0.25);
    }
    .fleet-name-pro { font-weight: 800; font-size: 17px; margin-bottom: 8px; color: #fff; font-family: 'Playfair Display', serif; }
    .fleet-desc-pro { font-size: 12px; color: #888; line-height: 1.6; margin-bottom: 14px; }
    .fleet-fasilitas { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 4px; }
    .fasilitas-item {
        font-size: 10px;
        padding: 3px 9px;
        border-radius: 10px;
        background: rgba(255,255,255,0.05);
        color: #bbb;
        border: 1px solid #333;
        display: flex; align-items: center; gap: 4px;
    }
    .fasilitas-item i { color: #d4af37; font-size: 9px; }
    @media (max-width: 900px) { .fleet-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 500px) { .fleet-grid { grid-template-columns: 1fr; } }
    /* Kartu Bus Hasil Pencarian - Luxury Theme */
    .bus-card {
        background: #111;
        border-radius: 16px;
        padding: 0;
        margin-bottom: 20px;
        box-shadow: 0 5px 25px rgba(0,0,0,0.5);
        overflow: hidden;
        border: 1px solid rgba(212, 175, 55, 0.2);
        transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
    }
    .bus-card:hover { transform: translateY(-4px); box-shadow: 0 12px 35px rgba(0,0,0,0.7); border-color: rgba(212, 175, 55, 0.5); }

    .bus-card-header {
        background: linear-gradient(135deg, #151515, #222);
        border-bottom: 1px solid rgba(212, 175, 55, 0.15);
        color: #d4af37;
        padding: 16px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .bus-card-header h3 { margin: 0; font-size: 19px; font-weight: 800; font-family: 'Playfair Display', serif; letter-spacing: 0.5px; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.8); }
    .bus-number { font-size: 13px; color: #aaa; margin-top: 4px; font-weight: 600; }
    .bus-type-badge {
        background: rgba(212, 175, 55, 0.1);
        border: 1px solid rgba(212, 175, 55, 0.3);
        color: #d4af37;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .bus-card-body { padding: 20px 24px; background: #0a0a0a; }

    .route-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        margin-bottom: 20px;
        background: #151515;
        border-radius: 12px;
        padding: 16px;
        border: 1px solid #222;
    }
    .route-city { text-align: center; }
    .route-city .city-name { font-weight: 800; font-size: 18px; color: #fff; }
    .route-arrow {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #d4af37;
        flex: 1;
    }
    .route-arrow .arrow-line { width: 100%; height: 2px; background: linear-gradient(to right, #d4af37, #f9d976); position: relative; }
    .route-arrow .arrow-line::after { content: '▶'; position: absolute; right: -6px; top: -8.5px; color: #f9d976; font-size: 14px; }
    .route-arrow small { font-size: 12px; color: #888; margin-top: 6px; font-weight: 600; }

    .bus-info-row {
        display: flex;
        gap: 16px;
        font-size: 13px;
        color: #aaa;
        padding-top: 5px;
    }
    .bus-info-row span { display: flex; align-items: center; gap: 6px; font-weight: 500; }

    .bus-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 24px;
        border-top: 1px solid rgba(212, 175, 55, 0.15);
        background: #111;
    }
    .price-tag { font-size: 26px; font-weight: 900; color: #f9d976; line-height: 1; }
    .price-tag small { font-size: 13px; color: #888; font-weight: 500; display: block; margin-top: 4px; }
    .select-btn {
        background: linear-gradient(135deg, #d4af37, #b5952f);
        color: #111; border: none;
        padding: 14px 32px;
        border-radius: 12px;
        font-weight: 800;
        cursor: pointer;
        font-size: 15px;
        transition: all 0.3s;
        text-transform: uppercase;
        box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
    }
    .select-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(212, 175, 55, 0.5); background: linear-gradient(135deg, #f9d976, #d4af37); }
`;
document.head.appendChild(style);