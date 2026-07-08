import re

target_file = r'd:\project-ticketing-bus\templates\pembeli_pilihkursi.html'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the inline style block
content = re.sub(r'<style>.*?</style>', '', content, flags=re.DOTALL)

# Replace the nav block
header_html = """    <!-- Header -->
    <header class="dashboard-header">
        <div class="header-content">
            <a href="{{ url_for('main.index') }}" class="logo" style="text-decoration: none;">
                <img src="{{ url_for('static', filename='img/logo-kresna.jpg') }}" alt="Logo Kresna">
                <h1>PT KRESNA PRIME <span style="color: #d4af37;">MOBILITY</span></h1>
            </a>
            
            <div class="user-menu">
                <div class="welcome-text">
                    <span class="greeting" style="display: block; font-size: 0.8rem; color: #aaa;">Selamat datang,</span>
                    <span class="user-name" style="color: #d4af37; font-weight: bold; font-size: 0.95rem;">{{ current_user.nama if current_user else nama }}</span>
                </div>
                <a href="{{ url_for('main.logout') }}" class="logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Keluar
                </a>
            </div>
        </div>
    </header>"""

content = re.sub(r'<!-- Header Navigation -->\s*<nav.*?</nav>', header_html, content, flags=re.DOTALL)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed pembeli_pilihkursi.html (removed inline style and updated header).')
