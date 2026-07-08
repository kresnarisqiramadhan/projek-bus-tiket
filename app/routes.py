"""
BUS TICKET ONLINE - ROUTES.PY
Jadwal bus = rute harian (beroperasi setiap hari, tanpa perlu input tanggal).
User yang pilih tanggal saat booking.
"""

from functools import wraps
from datetime import datetime
from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from app import db
from app.models import Pembeli, Admin, Agen, Pembayaran, Jadwal, KursiHarian
import os
from werkzeug.utils import secure_filename
from flask import current_app

main = Blueprint('main', __name__)


# =========================
# HELPER DECORATOR
# =========================
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user.is_authenticated or not isinstance(current_user._get_current_object(), Admin):
            flash('Akses admin diperlukan. Silakan login sebagai admin.', 'error')
            return redirect(url_for('main.admin_login'))
        return f(*args, **kwargs)
    return decorated


def agen_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user.is_authenticated or not isinstance(current_user._get_current_object(), Agen):
            flash('Akses agen diperlukan. Silakan login sebagai agen.', 'error')
            return redirect(url_for('main.agen_login'))
        return f(*args, **kwargs)
    return decorated


def pembeli_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user.is_authenticated or not isinstance(current_user._get_current_object(), Pembeli):
            flash('Silakan login terlebih dahulu.', 'info')
            return redirect(url_for('main.pembeli_login'))
        return f(*args, **kwargs)
    return decorated


# =========================
# LANDING
# =========================
@main.route('/')
@main.route('/index')
@main.route('/home')
def index():
    return render_template('index.html')


@main.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Anda telah berhasil logout.', 'info')
    return redirect(url_for('main.index'))


# =========================
# PEMBELI
# =========================
@main.route('/pembeli/login', methods=['GET', 'POST'])
def pembeli_login():
    if current_user.is_authenticated:
        if isinstance(current_user._get_current_object(), Pembeli):
            return redirect(url_for('main.pembeli_dashboard'))
        elif isinstance(current_user._get_current_object(), Admin):
            return redirect(url_for('main.admin_dashboard'))

    if request.method == 'POST':
        email = request.form.get('email', '').lower().strip()
        password = request.form.get('password', '')
        remember = bool(request.form.get('remember'))

        if not email or not password:
            flash('Harap isi email dan password!', 'error')
            return render_template('login.html')

        # Cek Admin
        admin = Admin.query.filter_by(email=email).first()
        if admin and admin.check_password(password):
            login_user(admin, remember=remember)
            flash(f'Selamat datang, Admin {admin.nama}!', 'success')
            return redirect(url_for('main.admin_dashboard'))

        # Cek Pembeli
        pembeli = Pembeli.query.filter_by(email=email).first()
        if pembeli and pembeli.check_password(password):
            login_user(pembeli, remember=remember)
            flash(f'Selamat datang, {pembeli.nama}!', 'success')
            return redirect(url_for('main.pembeli_dashboard'))

        flash('Email atau password salah!', 'error')

    return render_template('login.html')


@main.route('/pembeli/register', methods=['GET', 'POST'])
def pembeli_register():
    if current_user.is_authenticated:
        logout_user()
        
    if request.method == 'POST':
        nama = request.form.get('nama', '').strip()
        email = request.form.get('email', '').lower().strip()
        password = request.form.get('password', '')

        if not nama or not email or not password:
            flash('Harap lengkapi semua field!', 'error')
            return render_template('pembeli_register.html')

        if Pembeli.query.filter_by(email=email).first():
            flash('Email sudah terdaftar!', 'error')
            return render_template('pembeli_register.html')

        pembeli = Pembeli(nama=nama, email=email)
        pembeli.set_password(password)

        try:
            db.session.add(pembeli)
            db.session.commit()
            flash('Registrasi berhasil! Silakan login.', 'success')
            return redirect(url_for('main.pembeli_login'))
        except Exception:
            db.session.rollback()
            flash('Terjadi kesalahan sistem.', 'error')

    return render_template('pembeli_register.html')


@main.route('/pembeli/dashboard')
@pembeli_required
def pembeli_dashboard():
    return render_template(
        'pembeli_dashboard.html',
        nama=current_user.nama,
        email=current_user.email,
        join_date=current_user.created_at.strftime('%d %B %Y')
    )


@main.route('/pembeli/cari')
@pembeli_required
def pembeli_caritiket():
    return render_template('pembeli_caritiket.html', nama=current_user.nama)


@main.route('/pembeli/hasil')
@pembeli_required
def pembeli_hasilnya():
    return render_template('pembeli_hasilnya.html')


@main.route('/pembeli/kursi')
@pembeli_required
def pembeli_pilihkursi():
    schedule_id = request.args.get('schedule')
    if not schedule_id:
        flash('Silakan pilih jadwal terlebih dahulu', 'error')
        return redirect(url_for('main.pembeli_caritiket'))
    return render_template('pembeli_pilihkursi.html', schedule_id=schedule_id)


@main.route('/pembeli/pemesanan')
@pembeli_required
def pembeli_pemesanan():
    return render_template('pembeli_pemesanan.html')


@main.route('/pembeli/bayar')
@pembeli_required
def pembeli_bayar():
    return render_template('pembeli_bayar.html')


@main.route('/pembeli/riwayat')
@pembeli_required
def pembeli_riwayat():
    pembayaran = Pembayaran.query.filter_by(email_pembeli=current_user.email).order_by(Pembayaran.created_at.desc()).all()
    return render_template('pembeli_riwayat.html', riwayat=pembayaran)


@main.route('/pembeli/e-tiket/<transaction_id>')
@pembeli_required
def pembeli_etiket(transaction_id):
    bayar = Pembayaran.query.filter_by(transaction_id=transaction_id, email_pembeli=current_user.email).first_or_404()
    if bayar.status != 'Lunas':
        flash('E-Tiket belum tersedia karena pembayaran belum diverifikasi atau ditolak.', 'warning')
        return redirect(url_for('main.pembeli_riwayat'))
    return render_template('pembeli_e-tiket.html', bayar=bayar)


# =========================
# ADMIN
# =========================
@main.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if current_user.is_authenticated and isinstance(current_user, Admin):
        return redirect(url_for('main.admin_dashboard'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')

        admin = Admin.query.filter_by(email=email).first()
        if admin and admin.check_password(password):
            login_user(admin)
            flash(f'Selamat datang, {admin.nama}!', 'success')
            return redirect(url_for('main.admin_dashboard'))

        flash('Email atau password salah!', 'error')

    return render_template('admin_login.html')


@main.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    total_pembeli = Pembeli.query.count()
    total_agen = Agen.query.count()
    pembayaran_all = Pembayaran.query.all()
    transaksi_lunas = [p for p in pembayaran_all if p.status == 'Lunas']
    menunggu = [p for p in pembayaran_all if p.status == 'Menunggu Verifikasi']

    return render_template(
        'admin_dashboard.html',
        nama=current_user.nama,
        total_pembeli=total_pembeli,
        total_agen=total_agen,
        total_transaksi=len(transaksi_lunas),
        menunggu_verifikasi=len(menunggu)
    )


# -------- KELOLA JADWAL (RUTE HARIAN - TANPA TANGGAL) --------
@main.route('/admin/jadwal')
@admin_required
def admin_jadwal():
    jadwal = Jadwal.query.order_by(Jadwal.created_at.desc()).all()
    return render_template('admin_kelolajadwal.html', jadwal=jadwal)


@main.route('/admin/jadwal/tambah', methods=['POST'])
@admin_required
def admin_jadwal_tambah():
    try:
        item = Jadwal(
            nama_bus=request.form.get('nama_bus', '').strip(),
            rute_detail=request.form.get('rute_detail', '').strip(),
            jam_berangkat=request.form.get('jam_berangkat', '00:00'),
            jam_tiba=request.form.get('jam_tiba', ''),
            harga=int(request.form.get('harga', 0)),
            total_kursi=int(request.form.get('total_kursi', 40)),
            status=request.form.get('status', 'Aktif')
        )
        db.session.add(item)
        db.session.commit()
        flash('Rute jadwal berhasil ditambahkan! Bus akan beroperasi setiap hari.', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Gagal menambahkan jadwal: {e}', 'error')

    return redirect(url_for('main.admin_jadwal'))


@main.route('/admin/jadwal/edit/<int:jadwal_id>', methods=['POST'])
@admin_required
def admin_jadwal_edit(jadwal_id):
    item = Jadwal.query.get_or_404(jadwal_id)
    try:
        item.nama_bus = request.form.get('nama_bus', '').strip()
        item.rute_detail = request.form.get('rute_detail', '').strip()
        item.jam_berangkat = request.form.get('jam_berangkat', '00:00')
        item.jam_tiba = request.form.get('jam_tiba', '')
        item.harga = int(request.form.get('harga', 0))
        item.total_kursi = int(request.form.get('total_kursi', 40))
        item.status = request.form.get('status', 'Aktif')

        db.session.commit()
        flash('Jadwal berhasil diperbarui!', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Gagal memperbarui jadwal: {e}', 'error')

    return redirect(url_for('main.admin_jadwal'))


@main.route('/admin/jadwal/hapus/<int:jadwal_id>', methods=['POST'])
@admin_required
def admin_jadwal_hapus(jadwal_id):
    item = Jadwal.query.get_or_404(jadwal_id)
    try:
        # Hapus juga data kursi harian terkait
        KursiHarian.query.filter_by(jadwal_id=jadwal_id).delete()
        db.session.delete(item)
        db.session.commit()
        flash('Jadwal berhasil dihapus!', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Gagal menghapus jadwal: {e}', 'error')

    return redirect(url_for('main.admin_jadwal'))


# -------- KELOLA PENGGUNA --------
@main.route('/admin/pengguna')
@admin_required
def admin_pengguna():
    pembeli_list = Pembeli.query.order_by(Pembeli.created_at.desc()).all()
    agen_list = Agen.query.order_by(Agen.created_at.desc()).all()
    return render_template(
        'admin_pengguna.html',
        pembeli_list=pembeli_list,
        agen_list=agen_list
    )


# -------- LAPORAN --------
@main.route('/admin/laporan')
@admin_required
def admin_laporan():

    pembayaran = Pembayaran.query.order_by(
        Pembayaran.created_at.desc()
    ).all()

    print("=" * 50)
    print("JUMLAH PEMBAYARAN :", len(pembayaran))

    for p in pembayaran:
        print(
            p.id,
            p.transaction_id,
            p.nama_pembeli,
            p.total,
            p.status
        )

    print("=" * 50)

    transaksi_lunas = [p for p in pembayaran if p.status == 'Lunas']
    
    total_transaksi = len(transaksi_lunas)

    total_pendapatan = sum(
        p.total or 0
        for p in transaksi_lunas
    )

    return render_template(
        'admin_laporan.html',
        pembayaran=pembayaran,
        total_transaksi=total_transaksi,
        total_pendapatan=total_pendapatan
    )

@main.route('/admin/laporan/verifikasi/<int:bayar_id>/<aksi>', methods=['POST'])
@admin_required
def admin_verifikasi_bayar(bayar_id, aksi):
    bayar = Pembayaran.query.get_or_404(bayar_id)
    try:
        if aksi == 'lunas':
            bayar.status = 'Lunas'
            flash(f'Pembayaran {bayar.transaction_id} berhasil diverifikasi sebagai Lunas.', 'success')
        elif aksi == 'tolak':
            if bayar.status != 'Ditolak':
                bayar.status = 'Ditolak'
                
                # Mengembalikan kursi yang dibatalkan ke KursiHarian
                jadwal = Jadwal.query.filter_by(nama_bus=bayar.bus).first()
                if jadwal and bayar.tanggal_berangkat and bayar.kursi:
                    record = KursiHarian.query.filter_by(
                        jadwal_id=jadwal.id,
                        tanggal=bayar.tanggal_berangkat
                    ).with_for_update().first()
                    
                    if record:
                        kursi_batal = [k.strip() for k in bayar.kursi.split(',')]
                        existing = [k.strip() for k in record.kursi_list.split(',') if k.strip()]
                        
                        # Hapus kursi_batal dari existing
                        existing_baru = [k for k in existing if k not in kursi_batal]
                        
                        record.kursi_list = ','.join(existing_baru)
                        record.kursi_terisi = max(0, record.kursi_terisi - len(kursi_batal))
                        
                flash(f'Pembayaran {bayar.transaction_id} ditolak dan kursi telah dirilis.', 'success')

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        flash(f'Gagal memperbarui status: {e}', 'error')

    return redirect(url_for('main.admin_laporan'))


# =========================
# AGEN
# =========================
@main.route('/agen/login', methods=['GET', 'POST'])
def agen_login():
    if current_user.is_authenticated and isinstance(current_user, Agen):
        return redirect(url_for('main.agen_dashboard'))

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')

        agen = Agen.query.filter_by(username=username).first()
        if agen and agen.check_password(password):
            login_user(agen)
            flash(f'Selamat datang, {agen.nama}!', 'success')
            return redirect(url_for('main.agen_dashboard'))

        flash('Username atau password salah!', 'error')

    return render_template('agen_login.html')


@main.route('/agen/dashboard')
@agen_required
def agen_dashboard():
    return render_template('agen_dashboard.html', nama=current_user.nama)


# =========================
# API
# =========================
@main.route('/api/pembayaran', methods=['POST'])
@pembeli_required
def api_pembayaran():
    try:
        # Jika request adalah JSON (lama), ambil get_json(). Jika FormData, pakai request.form
        if request.is_json:
            data = request.get_json() or {}
        else:
            data = request.form

        # Mengambil daftar kursi
        if request.is_json:
            kursi = data.get('kursi', data.get('seats', []))
            kursi_str = ', '.join(kursi) if isinstance(kursi, list) else str(kursi)
        else:
            # Dari form data, kursi bisa berupa list atau JSON string
            kursi_raw = data.get('kursi', '') or data.get('seats', '')
            import json
            try:
                kursi = json.loads(kursi_raw)
                kursi_str = ', '.join(kursi) if isinstance(kursi, list) else str(kursi)
            except:
                kursi = kursi_raw.split(',') if kursi_raw else []
                kursi_str = kursi_raw

        # Parse tanggal dari data booking
        tanggal_str = data.get('tanggalBerangkat', '') or data.get('date', '')
        tanggal_berangkat = None
        if tanggal_str:
            try:
                # Handle ISO format from JS if it has Time part
                if 'T' in tanggal_str:
                    tanggal_str = tanggal_str.split('T')[0]
                tanggal_berangkat = datetime.strptime(tanggal_str, '%Y-%m-%d').date()
                tanggal_berangkat = datetime.strptime(tanggal_str, '%Y-%m-%d').date()
            except ValueError:
                pass

        # Validasi Kursi Bentrok (Double Booking) & Update KursiHarian
        jadwal_id = data.get('jadwalId')
        if jadwal_id and tanggal_berangkat and kursi:
            kursi_count = len(kursi) if isinstance(kursi, list) else 1
            kursi_baru = [k.strip() for k in (kursi if isinstance(kursi, list) else [str(kursi)])]
            
            record = KursiHarian.query.filter_by(
                jadwal_id=jadwal_id,
                tanggal=tanggal_berangkat
            ).with_for_update().first() # Lock the row to prevent race conditions

            if record:
                existing = record.kursi_list.split(',') if record.kursi_list else []
                existing = [k.strip() for k in existing if k.strip()]
                
                # Cek bentrok
                for k in kursi_baru:
                    if k in existing:
                        db.session.rollback()
                        return jsonify({'success': False, 'message': f'Mohon maaf, kursi {k} baru saja dipesan oleh orang lain. Silakan kembali dan pilih kursi lain.'}), 400
                        
                # Aman, tambahkan
                record.kursi_terisi += kursi_count
                existing.extend(kursi_baru)
                record.kursi_list = ','.join(existing)
            else:
                new_record = KursiHarian(
                    jadwal_id=jadwal_id,
                    tanggal=tanggal_berangkat,
                    kursi_terisi=kursi_count,
                    kursi_list=','.join(kursi_baru)
                )
                db.session.add(new_record)

        # Handle File Upload
        bukti_pembayaran_filename = ''
        if 'paymentFile' in request.files:
            file = request.files['paymentFile']
            if file and file.filename != '':
                filename = secure_filename(file.filename)
                transaction_id_temp = data.get('transactionId', f"TRX-{int(datetime.utcnow().timestamp())}")
                new_filename = f"{transaction_id_temp}_{filename}"
                
                upload_folder = os.path.join(current_app.static_folder, 'uploads')
                os.makedirs(upload_folder, exist_ok=True)
                file.save(os.path.join(upload_folder, new_filename))
                bukti_pembayaran_filename = new_filename
        else:
            bukti_pembayaran_filename = data.get('paymentFile', '')

        pembayaran = Pembayaran(
            transaction_id=data.get('transactionId', f"TRX-{int(datetime.utcnow().timestamp())}"),
            booking_id=data.get('bookingId', ''),
            nama_pembeli=current_user.nama,
            email_pembeli=current_user.email,
            bus=data.get('busName', '-'),
            asal=data.get('origin', '-'),
            tujuan=data.get('destination', '-'),
            tanggal_berangkat=tanggal_berangkat,
            jam_berangkat=data.get('jamBerangkat', '-'),
            kursi=kursi_str,
            subtotal=data.get('subtotal', 0),
            biaya_layanan=data.get('serviceFee', 0),
            total=data.get('grandTotal', 0),
            metode_pembayaran=data.get('paymentMethod', 'bank-transfer'),
            bukti_pembayaran=bukti_pembayaran_filename or 'TERVERIFIKASI_SISTEM_Otomatis',
            status='Lunas'
        )

        db.session.add(pembayaran)
        db.session.commit()

        print("=== PEMBAYARAN BARU TERSIMPAN ===")
        print(pembayaran.transaction_id, pembayaran.nama_pembeli, pembayaran.total)

        return jsonify({
            'success': True,
            'message': 'Pembayaran berhasil disimpan',
            'transaction_id': pembayaran.transaction_id
        })

    except Exception as e:
        db.session.rollback()
        print("=== GAGAL SIMPAN PEMBAYARAN ===", e)
        return jsonify({'success': False, 'message': str(e)}), 500


@main.route('/api/check_email', methods=['POST'])
def check_email():
    data = request.get_json() or {}
    email = data.get('email', '').lower().strip()
    return jsonify({'exists': Pembeli.query.filter_by(email=email).first() is not None})


@main.route('/api/user_info')
@login_required
def user_info():
    role = (
        'pembeli' if isinstance(current_user, Pembeli)
        else 'admin' if isinstance(current_user, Admin)
        else 'agen'
    )
    return jsonify({
        'nama': current_user.nama,
        'email': getattr(current_user, 'email', ''),
        'role': role
    })

@main.route('/api/jadwal')
def api_jadwal():
    """
    Daftar semua jadwal aktif (rute harian).
    Tidak ada filter tanggal - karena bus beroperasi setiap hari.
    """
    jadwal = Jadwal.query.filter_by(status='Aktif').all()

    data = []
    for j in jadwal:
        data.append({
            "id": j.id,
            "nama_bus": j.nama_bus,
            "rute_detail": j.rute_detail,
            "jam_berangkat": j.jam_berangkat,
            "jam_tiba": j.jam_tiba or '',
            "harga": j.harga,
            "total_kursi": j.total_kursi
        })

    return jsonify(data)


@main.route('/api/jadwal/cari')
@pembeli_required
def api_jadwal_cari():
    """
    Cari jadwal berdasarkan asal, tujuan, dan tanggal.
    Karena jadwal = rute harian, semua jadwal aktif tersedia di tanggal apa pun.
    Yang berbeda hanya jumlah kursi yang sudah terisi di tanggal itu.
    """
    origin = request.args.get('origin', '').strip()
    destination = request.args.get('destination', '').strip()
    tanggal = request.args.get('date', '').strip()

    query = Jadwal.query.filter_by(status='Aktif')
    
    if origin:
        query = query.filter(Jadwal.rute_detail.like(f'%|{origin}|%'))
    if destination:
        query = query.filter(Jadwal.rute_detail.like(f'%|{destination}|%'))

    hasil_awal = query.all()
    
    # Filter urutan kota di Python untuk mencegah bug overlapping delimiter di SQL
    hasil = []
    for j in hasil_awal:
        if origin and destination:
            rute_list = [c for c in j.rute_detail.split('|') if c]
            try:
                if rute_list.index(origin) < rute_list.index(destination):
                    hasil.append(j)
            except ValueError:
                pass
        else:
            hasil.append(j)

    # Parse tanggal untuk hitung kursi yang sudah terisi di tanggal tsb
    tgl = None
    if tanggal:
        try:
            tgl = datetime.strptime(tanggal, '%Y-%m-%d').date()
        except ValueError:
            pass

    data = []
    for j in hasil:
        kursi_terisi = j.kursi_terisi_pada(tgl) if tgl else 0
        sisa_kursi = j.total_kursi - kursi_terisi

        # Use base price instead of multiplying by hops to avoid 1M+ prices
        dynamic_price = j.harga

        data.append({
            'id': j.id,
            'busName': j.nama_bus,
            'origin': origin or rute_list[0],
            'destination': destination or rute_list[-1],
            'date': tanggal or '',
            'departureTime': j.jam_berangkat,
            'arrivalTime': j.jam_tiba or '',
            'price': dynamic_price,
            'totalSeats': j.total_kursi,
            'availableSeats': max(0, sisa_kursi)
        })

    return jsonify({'success': True, 'results': data})


@main.route('/api/jadwal/<int:jadwal_id>/kursi')
@pembeli_required
def api_kursi_jadwal(jadwal_id):
    """
    Ambil data kursi yang sudah terisi pada jadwal & tanggal tertentu.
    Dipakai oleh halaman pilih kursi.
    """
    tanggal = request.args.get('date', '').strip()
    jadwal = Jadwal.query.get_or_404(jadwal_id)

    occupied_seats = []
    if tanggal:
        try:
            tgl = datetime.strptime(tanggal, '%Y-%m-%d').date()
            record = KursiHarian.query.filter_by(
                jadwal_id=jadwal_id,
                tanggal=tgl
            ).first()
            if record and record.kursi_list:
                occupied_seats = [s.strip() for s in record.kursi_list.split(',') if s.strip()]
        except ValueError:
            pass

    return jsonify({
        'success': True,
        'jadwal_id': jadwal_id,
        'nama_bus': jadwal.nama_bus,
        'rute_detail': jadwal.rute_detail,
        'jam_berangkat': jadwal.jam_berangkat,
        'total_kursi': jadwal.total_kursi,
        'harga': jadwal.harga,
        'occupied_seats': occupied_seats,
        'tanggal': tanggal
    })


# =========================
# ERROR HANDLER
# =========================
@main.app_errorhandler(404)
def not_found(e):
    return render_template('404.html'), 404


@main.app_errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500