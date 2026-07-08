import os

templates = {
    'agen_dashboard.html': """<!DOCTYPE html>
<html>
<head>
    <title>Dashboard Agen - PT KRESNA PRIME MOBILITY</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/global.css') }}">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/admin_dashboard.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Navbar -->
    <nav class="top-navbar">
        <a href="{{ url_for('main.agen_dashboard') }}" class="nav-brand">
            <img src="{{ url_for('static', filename='img/logo-kresna.jpg') }}" alt="Logo Kresna" style="height: 40px; object-fit: contain;">
            <span>PT KRESNA PRIME MOBILITY</span>
        </a>
        <div class="nav-links">
            <a href="{{ url_for('main.agen_dashboard') }}" class="active"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
            <a href="{{ url_for('main.agen_verifikasi') }}"><i class="fas fa-check-circle"></i> Verifikasi</a>
            <a href="{{ url_for('main.agen_ereceipt') }}"><i class="fas fa-receipt"></i> E-Receipt</a>
            <a href="{{ url_for('main.agen_pesanan') }}"><i class="fas fa-list"></i> Pesanan</a>
            <a href="{{ url_for('main.logout') }}" class="nav-logout" onclick="return confirm('Apakah Anda yakin ingin keluar?')"><i class="fas fa-sign-out-alt"></i> Keluar</a>
        </div>
    </nav>

    <div class="dashboard-container" style="margin-top: 30px;">
        <div id="welcome-message" style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: var(--primary-color); font-size: 28px; margin-bottom: 8px;">Selamat datang, {{ nama }}!</h2>
            <p style="color: var(--text-secondary);">Pantau dan kelola tiket penumpang dari panel agen ini.</p>
        </div>

        <div class="dashboard-content" style="grid-template-columns: repeat(3, 1fr);">
            <div class="dashboard-card">
                <div class="card-content">
                    <div class="card-icon"><i class="fas fa-check-circle"></i></div>
                    <h3>Verifikasi Pembayaran</h3>
                    <p>Verifikasi bukti pembayaran penumpang yang masuk.</p>
                    <a href="{{ url_for('main.agen_verifikasi') }}" class="card-btn"><i class="fas fa-arrow-right"></i> Buka</a>
                </div>
            </div>

            <div class="dashboard-card">
                <div class="card-content">
                    <div class="card-icon"><i class="fas fa-receipt"></i></div>
                    <h3>Input E-Receipt</h3>
                    <p>Masukkan kode e-receipt untuk tiket penumpang.</p>
                    <a href="{{ url_for('main.agen_ereceipt') }}" class="card-btn"><i class="fas fa-arrow-right"></i> Buka</a>
                </div>
            </div>

            <div class="dashboard-card">
                <div class="card-content">
                    <div class="card-icon"><i class="fas fa-list"></i></div>
                    <h3>Data Pesanan</h3>
                    <p>Lihat semua data pesanan tiket yang sudah diproses.</p>
                    <a href="{{ url_for('main.agen_pesanan') }}" class="card-btn"><i class="fas fa-arrow-right"></i> Buka</a>
                </div>
            </div>
        </div>
    </div>

    <div class="dashboard-footer" style="margin-top: 40px; text-align: center; color: var(--text-muted);">
        <p>&copy; 2024 PT KRESNA PRIME MOBILITY</p>
    </div>
</body>
</html>""",

    'agen_verifikasibayaran.html': """<!DOCTYPE html>
<html>
<head>
    <title>Verifikasi Pembayaran - PT KRESNA PRIME MOBILITY</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/global.css') }}">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/admin_dashboard.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        .custom-table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .custom-table th { background: var(--primary-color); color: white; padding: 12px 15px; text-align: left; }
        .custom-table td { padding: 12px 15px; border-bottom: 1px solid #eee; color: #333; }
        .custom-table tr:hover { background-color: #f9f9f9; }
        .action-btn { background: var(--success-color); color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 0.9rem; }
        .action-btn:hover { background: var(--success-hover); color: white; }
    </style>
</head>
<body>
    <nav class="top-navbar">
        <a href="{{ url_for('main.agen_dashboard') }}" class="nav-brand">
            <img src="{{ url_for('static', filename='img/logo-kresna.jpg') }}" alt="Logo Kresna" style="height: 40px; object-fit: contain;">
            <span>PT KRESNA PRIME MOBILITY</span>
        </a>
        <div class="nav-links">
            <a href="{{ url_for('main.agen_dashboard') }}"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
            <a href="{{ url_for('main.agen_verifikasi') }}" class="active"><i class="fas fa-check-circle"></i> Verifikasi</a>
            <a href="{{ url_for('main.logout') }}" class="nav-logout"><i class="fas fa-sign-out-alt"></i> Keluar</a>
        </div>
    </nav>

    <div class="dashboard-container" style="margin-top: 30px;">
        <h2 style="color: var(--primary-color); margin-bottom: 20px;"><i class="fas fa-check-circle"></i> Verifikasi Pembayaran</h2>
        
        <table class="custom-table">
            <tr>
                <th>ID</th>
                <th>Nama Pembeli</th>
                <th>Bus</th>
                <th>Kursi</th>
                <th>Status</th>
                <th>Aksi</th>
            </tr>
            {% for p in pembayaran %}
            <tr>
                <td>{{ p.id }}</td>
                <td><strong>{{ p.nama }}</strong></td>
                <td>{{ p.bus }}</td>
                <td><span style="background:#eee; padding:3px 8px; border-radius:4px;">{{ p.kursi }}</span></td>
                <td><span style="color:var(--warning-color); font-weight:bold;">{{ p.status }}</span></td>
                <td>
                    <a href="/agen/ereceipt?id={{ p.id }}" class="action-btn"><i class="fas fa-check"></i> Verifikasi</a>
                </td>
            </tr>
            {% else %}
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #777;">Tidak ada pembayaran yang perlu diverifikasi saat ini.</td>
            </tr>
            {% endfor %}
        </table>
    </div>
</body>
</html>""",

    'agen_datapesanan.html': """<!DOCTYPE html>
<html>
<head>
    <title>Data Pesanan - PT KRESNA PRIME MOBILITY</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/global.css') }}">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/admin_dashboard.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        .custom-table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .custom-table th { background: var(--primary-color); color: white; padding: 12px 15px; text-align: left; }
        .custom-table td { padding: 12px 15px; border-bottom: 1px solid #eee; color: #333; }
        .custom-table tr:hover { background-color: #f9f9f9; }
        .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; }
    </style>
</head>
<body>
    <nav class="top-navbar">
        <a href="{{ url_for('main.agen_dashboard') }}" class="nav-brand">
            <img src="{{ url_for('static', filename='img/logo-kresna.jpg') }}" alt="Logo Kresna" style="height: 40px; object-fit: contain;">
            <span>PT KRESNA PRIME MOBILITY</span>
        </a>
        <div class="nav-links">
            <a href="{{ url_for('main.agen_dashboard') }}"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
            <a href="{{ url_for('main.agen_pesanan') }}" class="active"><i class="fas fa-list"></i> Pesanan</a>
            <a href="{{ url_for('main.logout') }}" class="nav-logout"><i class="fas fa-sign-out-alt"></i> Keluar</a>
        </div>
    </nav>

    <div class="dashboard-container" style="margin-top: 30px;">
        <h2 style="color: var(--primary-color); margin-bottom: 20px;"><i class="fas fa-list"></i> Data Pesanan</h2>
        
        <table class="custom-table">
            <tr>
                <th>ID</th>
                <th>Nama Pembeli</th>
                <th>Bus</th>
                <th>Kursi</th>
                <th>Harga</th>
                <th>Status</th>
                <th>Kode E-Receipt</th>
            </tr>
            {% for p in pesanan %}
            <tr>
                <td>{{ p.id }}</td>
                <td><strong>{{ p.nama }}</strong></td>
                <td>{{ p.bus }}</td>
                <td><span style="background:#eee; padding:3px 8px; border-radius:4px;">{{ p.kursi }}</span></td>
                <td>Rp {{ p.harga }}</td>
                <td>
                    {% if p.status == 'Sudah Dibayar' %}
                        <span class="status-badge" style="background:#d4edda; color:#155724;"><i class="fas fa-check"></i> {{ p.status }}</span>
                    {% else %}
                        <span class="status-badge" style="background:#fff3cd; color:#856404;">{{ p.status }}</span>
                    {% endif %}
                </td>
                <td><code>{{ p.receipt }}</code></td>
            </tr>
            {% else %}
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #777;">Belum ada data pesanan.</td>
            </tr>
            {% endfor %}
        </table>
    </div>
</body>
</html>""",
    
    'agen_ereceipt.html': """<!DOCTYPE html>
<html>
<head>
    <title>Input E-Receipt - PT KRESNA PRIME MOBILITY</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/global.css') }}">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/admin_dashboard.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        .form-container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 500px; margin: 0 auto; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #333; }
        .form-group input { width: 100%; padding: 10px 15px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        .submit-btn { background: var(--primary-color); color: white; border: none; padding: 12px 20px; width: 100%; border-radius: 4px; font-size: 1rem; font-weight: bold; cursor: pointer; }
        .submit-btn:hover { background: var(--primary-hover); }
    </style>
</head>
<body>
    <nav class="top-navbar">
        <a href="{{ url_for('main.agen_dashboard') }}" class="nav-brand">
            <img src="{{ url_for('static', filename='img/logo-kresna.jpg') }}" alt="Logo Kresna" style="height: 40px; object-fit: contain;">
            <span>PT KRESNA PRIME MOBILITY</span>
        </a>
        <div class="nav-links">
            <a href="{{ url_for('main.agen_dashboard') }}"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
            <a href="{{ url_for('main.agen_ereceipt') }}" class="active"><i class="fas fa-receipt"></i> E-Receipt</a>
            <a href="{{ url_for('main.logout') }}" class="nav-logout"><i class="fas fa-sign-out-alt"></i> Keluar</a>
        </div>
    </nav>

    <div class="dashboard-container" style="margin-top: 50px;">
        <div class="form-container">
            <h2 style="color: var(--primary-color); margin-bottom: 20px; text-align: center;"><i class="fas fa-file-invoice"></i> Input Kode E-Receipt</h2>
            
            {% with messages = get_flashed_messages() %}
              {% if messages %}
                <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 4px; margin-bottom: 20px; text-align: center;">
                {% for message in messages %}
                  {{ message }}
                {% endfor %}
                </div>
              {% endif %}
            {% endwith %}

            <form method="POST">
                <div class="form-group">
                    <label>ID Pemesanan:</label>
                    <input type="text" name="pesanan_id" value="{{ request.args.get('id', '') }}" required placeholder="Contoh: 12">
                </div>
                
                <div class="form-group">
                    <label>Kode E-Receipt:</label>
                    <input type="text" name="kode_receipt" required placeholder="Contoh: KRESNA-12345">
                </div>
                
                <button type="submit" class="submit-btn"><i class="fas fa-save"></i> Simpan E-Receipt</button>
            </form>
        </div>
    </div>
</body>
</html>"""
}

base_dir = r"d:\project-ticketing-bus\templates"

for filename, content in templates.items():
    path = os.path.join(base_dir, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
        
print("Agent templates updated to Black & Gold!")
