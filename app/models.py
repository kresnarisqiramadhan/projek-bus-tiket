from app import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


class Pembeli(db.Model, UserMixin):
    __tablename__ = 'pembeli'

    id = db.Column(db.Integer, primary_key=True)
    nama = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_id(self):
        return f"pembeli-{self.id}"

    def __repr__(self):
        return f'<Pembeli {self.email}>'


class Admin(db.Model, UserMixin):
    __tablename__ = 'admin'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    nama = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_id(self):
        return f"admin-{self.id}"

    def __repr__(self):
        return f'<Admin {self.username}>'


class Agen(db.Model, UserMixin):
    __tablename__ = 'agen'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    nama = db.Column(db.String(100), nullable=False)
    perusahaan = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_id(self):
        return f"agen-{self.id}"

    def __repr__(self):
        return f'<Agen {self.username}>'


class Pembayaran(db.Model):
    __tablename__ = 'pembayaran'

    id = db.Column(db.Integer, primary_key=True)

    transaction_id = db.Column(db.String(100), unique=True)
    booking_id = db.Column(db.String(100))

    nama_pembeli = db.Column(db.String(100))
    email_pembeli = db.Column(db.String(100))

    bus = db.Column(db.String(100))
    asal = db.Column(db.String(100))
    tujuan = db.Column(db.String(100))

    tanggal_berangkat = db.Column(db.Date)  # tanggal keberangkatan yang dipilih user
    jam_berangkat = db.Column(db.String(10)) # jam keberangkatan

    kursi = db.Column(db.String(100))

    subtotal = db.Column(db.Integer)
    biaya_layanan = db.Column(db.Integer)
    total = db.Column(db.Integer)

    metode_pembayaran = db.Column(db.String(50))
    bukti_pembayaran = db.Column(db.String(255))

    status = db.Column(
        db.String(50),
        default='Menunggu Verifikasi'
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    @property
    def created_at_wib(self):
        from datetime import timedelta
        if self.created_at:
            return self.created_at + timedelta(hours=7)
        return None

    def __repr__(self):
        return f'<Pembayaran {self.transaction_id}>'


class Jadwal(db.Model):
    """
    Jadwal bus HARIAN - beroperasi setiap hari.
    Admin cukup input 1x, bus otomatis tersedia setiap hari.
    Tidak ada kolom tanggal - user yang pilih tanggal saat booking.
    """
    __tablename__ = 'jadwal'

    id = db.Column(db.Integer, primary_key=True)

    nama_bus = db.Column(db.String(100), nullable=False)
    rute_detail = db.Column(db.Text, nullable=False)  # ex: |Jakarta|Bandung|Semarang|

    jam_berangkat = db.Column(db.String(10), nullable=False)
    jam_tiba = db.Column(db.String(10))

    harga = db.Column(db.Integer, nullable=False, default=0)
    total_kursi = db.Column(db.Integer, nullable=False, default=40)

    status = db.Column(db.String(20), default='Aktif')  # Aktif / Nonaktif

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relasi ke kursi harian
    kursi_harian = db.relationship('KursiHarian', backref='jadwal', lazy='dynamic')

    def __repr__(self):
        return f'<Jadwal {self.nama_bus} {self.rute_detail}>'

    def kursi_terisi_pada(self, tanggal):
        """Hitung kursi yang sudah terisi pada tanggal tertentu"""
        record = KursiHarian.query.filter_by(
            jadwal_id=self.id,
            tanggal=tanggal
        ).first()
        return record.kursi_terisi if record else 0

    def sisa_kursi_pada(self, tanggal):
        """Hitung sisa kursi pada tanggal tertentu"""
        return self.total_kursi - self.kursi_terisi_pada(tanggal)


class KursiHarian(db.Model):
    """
    Tracking kursi yang terisi per tanggal per jadwal.
    Dibuat otomatis saat ada booking baru.
    """
    __tablename__ = 'kursi_harian'

    id = db.Column(db.Integer, primary_key=True)
    jadwal_id = db.Column(db.Integer, db.ForeignKey('jadwal.id'), nullable=False)
    tanggal = db.Column(db.Date, nullable=False)
    kursi_terisi = db.Column(db.Integer, nullable=False, default=0)
    kursi_list = db.Column(db.Text, default='')  # comma-separated seat IDs, e.g. "1A,2B,3C"

    # Unique constraint: 1 record per jadwal per tanggal
    __table_args__ = (
        db.UniqueConstraint('jadwal_id', 'tanggal', name='uq_jadwal_tanggal'),
    )

    def __repr__(self):
        return f'<KursiHarian jadwal={self.jadwal_id} tgl={self.tanggal} terisi={self.kursi_terisi}>'