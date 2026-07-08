import re

history_file = r'C:\Users\MyBook Hype AMD\AppData\Roaming\Code\User\History\76200c69\hyrC.html'
target_file = r'd:\project-ticketing-bus\templates\pembeli_caritiket.html'

with open(history_file, 'r', encoding='utf-8') as f:
    content = f.read()

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

new_content = re.sub(r'<!-- Header -->\s*<header.*?</header>', header_html, content, flags=re.DOTALL)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Restored pembeli_caritiket.html and updated header.')
