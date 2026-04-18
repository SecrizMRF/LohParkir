"""Generate UML Use Case Diagram (SVG) for LohParkir."""
from pathlib import Path

W, H = 1400, 1000
PRIMARY = "#0D47A1"
ACCENT = "#1565C0"
WARN = "#E65100"
SUCCESS = "#2E7D32"
DANGER = "#C62828"
BG = "#FFFFFF"
SYSTEM_BG = "#F5F9FF"
TEXT = "#1A1A1A"
MUTED = "#555555"

def actor(x, y, label, color=PRIMARY):
    """Stick-figure actor at (x,y) (head center)."""
    parts = [
        f'<circle cx="{x}" cy="{y}" r="14" fill="none" stroke="{color}" stroke-width="2.5"/>',
        f'<line x1="{x}" y1="{y+14}" x2="{x}" y2="{y+60}" stroke="{color}" stroke-width="2.5"/>',
        f'<line x1="{x-22}" y1="{y+30}" x2="{x+22}" y2="{y+30}" stroke="{color}" stroke-width="2.5"/>',
        f'<line x1="{x}" y1="{y+60}" x2="{x-18}" y2="{y+92}" stroke="{color}" stroke-width="2.5"/>',
        f'<line x1="{x}" y1="{y+60}" x2="{x+18}" y2="{y+92}" stroke="{color}" stroke-width="2.5"/>',
        f'<text x="{x}" y="{y+115}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="15" font-weight="700" fill="{color}">{label}</text>',
    ]
    return "\n".join(parts)

def use_case(cx, cy, rx, ry, label, color=ACCENT):
    """Ellipse use case."""
    label_lines = label.split("\n")
    text_svg = ""
    for i, ln in enumerate(label_lines):
        offset = (i - (len(label_lines) - 1) / 2) * 14 + 5
        text_svg += f'<text x="{cx}" y="{cy + offset}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="12" fill="{TEXT}">{ln}</text>'
    return (
        f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="white" stroke="{color}" stroke-width="2"/>'
        + text_svg
    )

def line(x1, y1, x2, y2, dashed=False, color=MUTED):
    dash = ' stroke-dasharray="6,4"' if dashed else ""
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="1.4"{dash}/>'

svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="Calibri, Arial, sans-serif">']
svg.append(f'<rect width="{W}" height="{H}" fill="{BG}"/>')

# Title
svg.append(f'<text x="{W/2}" y="40" text-anchor="middle" font-size="22" font-weight="700" fill="{PRIMARY}">Use Case Diagram — Aplikasi LohParkir</text>')
svg.append(f'<text x="{W/2}" y="62" text-anchor="middle" font-size="13" fill="{MUTED}">Sistem Verifikasi Parkir Berbasis QR Code untuk Dishub Kota Medan</text>')

# System boundary box
sys_x, sys_y, sys_w, sys_h = 320, 90, 760, 870
svg.append(f'<rect x="{sys_x}" y="{sys_y}" width="{sys_w}" height="{sys_h}" rx="14" fill="{SYSTEM_BG}" stroke="{PRIMARY}" stroke-width="2"/>')
svg.append(f'<text x="{sys_x + sys_w/2}" y="{sys_y + 25}" text-anchor="middle" font-size="14" font-weight="700" fill="{PRIMARY}">Sistem LohParkir</text>')

# ===== Actors =====
# Left side: Warga & Juru Parkir
svg.append(actor(120, 200, "Warga (Publik)", PRIMARY))
svg.append(actor(120, 600, "Juru Parkir", SUCCESS))
# Right side: Admin Dishub
svg.append(actor(1280, 380, "Admin Dishub", WARN))
# Bottom right secondary: Payment Gateway
svg.append(actor(1280, 760, "Payment Gateway\n(QRIS)", MUTED))

# ===== Use cases =====
# WARGA cluster (top)
uc_warga = [
    (480, 150, "Scan QR Jukir"),
    (480, 215, "Input QR Manual"),
    (480, 280, "Bayar via QRIS"),
    (480, 345, "Terima Karcis Digital"),
    (700, 150, "Beri Rating Jukir"),
    (700, 215, "Lapor Pungli /\nJukir Liar"),
    (700, 295, "Lihat Riwayat\n& Poin"),
    (700, 365, "Lihat Statistik\nPublik"),
    (480, 410, "Daftar / Login\n(opsional)"),
]
for cx, cy, lbl in uc_warga:
    rx = 92 if "\n" in lbl else 88
    svg.append(use_case(cx, cy, rx, 28 if "\n" in lbl else 24, lbl, ACCENT))

# JURU PARKIR cluster (bottom-left)
uc_jukir = [
    (480, 555, "Login dengan NIP"),
    (480, 615, "Tampilkan QR\nMotor & Mobil"),
    (480, 685, "Catat Pembayaran\nTunai"),
    (480, 755, "Lihat Tarif Resmi"),
]
for cx, cy, lbl in uc_jukir:
    svg.append(use_case(cx, cy, 95, 28 if "\n" in lbl else 24, lbl, SUCCESS))

# ADMIN cluster (right)
uc_admin = [
    (920, 200, "Login Admin"),
    (920, 270, "Kelola Data\nPetugas (CRUD)"),
    (920, 345, "Generate QR\nPetugas"),
    (920, 420, "Kelola Laporan\nPelanggaran"),
    (920, 495, "Pantau Dashboard\nStatistik"),
    (920, 570, "Audit Riwayat\nPembayaran"),
    (920, 645, "Lihat Aktivitas\nScan Realtime"),
    (920, 720, "Kelola Akun\nSuper Admin"),
]
for cx, cy, lbl in uc_admin:
    svg.append(use_case(cx, cy, 100, 28 if "\n" in lbl else 24, lbl, WARN))

# Payment gateway use case
svg.append(use_case(920, 825, 95, 28, "Proses Transaksi\nQRIS", MUTED))

# ===== Associations =====
# Warga -> use cases
warga_xy = (140, 215)
for cx, cy, _ in uc_warga:
    svg.append(line(warga_xy[0]+15, warga_xy[1], cx-90, cy))

# Juru parkir -> use cases
jukir_xy = (140, 615)
for cx, cy, _ in uc_jukir:
    svg.append(line(jukir_xy[0]+15, jukir_xy[1], cx-95, cy))

# Admin -> use cases
admin_xy = (1260, 395)
for cx, cy, _ in uc_admin:
    svg.append(line(admin_xy[0]-15, admin_xy[1], cx+100, cy))

# Payment gateway -> QRIS use case
svg.append(line(1260, 775, 1020, 825))

# Warga also bayar QRIS triggers payment gateway
svg.append(line(140, 215, 825, 825, dashed=True))

# ===== <<include>> / <<extend>> relationships =====
def relation(x1, y1, x2, y2, label):
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2 - 8
    return (
        f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{PRIMARY}" stroke-width="1.2" stroke-dasharray="5,4" marker-end="url(#arrow)"/>'
        f'<text x="{mx}" y="{my}" text-anchor="middle" font-size="10" font-style="italic" fill="{PRIMARY}">{label}</text>'
    )

# arrow marker
svg.append('<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#0D47A1"/></marker></defs>')

# Scan QR -> Bayar QRIS  (include)
svg.append(relation(480, 174, 480, 256, "«include»"))
# Bayar QRIS -> Terima karcis (include)
svg.append(relation(480, 304, 480, 321, "«include»"))
# Terima Karcis -> Beri Rating (extend)
svg.append(relation(572, 345, 612, 165, "«extend»"))
# Scan QR -> Lapor Pungli (extend, ketika QR palsu)
svg.append(relation(560, 142, 612, 200, "«extend»"))
# Login Admin -> kelola petugas (include)
svg.append(relation(920, 224, 920, 246, "«include»"))
# Kelola Petugas -> Generate QR (include)
svg.append(relation(920, 298, 920, 321, "«include»"))
# Bayar QRIS -> Proses QRIS (include)
svg.append(relation(572, 280, 825, 825, "«include»"))

# ===== Legend =====
lx, ly = 30, 880
svg.append(f'<rect x="{lx}" y="{ly}" width="260" height="100" rx="8" fill="white" stroke="{MUTED}"/>')
svg.append(f'<text x="{lx+10}" y="{ly+20}" font-size="12" font-weight="700" fill="{TEXT}">Keterangan:</text>')
svg.append(f'<line x1="{lx+10}" y1="{ly+38}" x2="{lx+50}" y2="{ly+38}" stroke="{MUTED}" stroke-width="1.4"/>')
svg.append(f'<text x="{lx+58}" y="{ly+42}" font-size="11" fill="{TEXT}">Asosiasi aktor — use case</text>')
svg.append(f'<line x1="{lx+10}" y1="{ly+58}" x2="{lx+50}" y2="{ly+58}" stroke="{PRIMARY}" stroke-width="1.2" stroke-dasharray="5,4"/>')
svg.append(f'<text x="{lx+58}" y="{ly+62}" font-size="11" fill="{TEXT}">«include» / «extend»</text>')
svg.append(f'<text x="{lx+10}" y="{ly+82}" font-size="11" fill="{MUTED}">Aktor sekunder: Payment Gateway QRIS</text>')

svg.append("</svg>")

out_svg = Path("attached_assets/use_case_diagram_lohparkir.svg")
out_svg.write_text("\n".join(svg), encoding="utf-8")
print(f"Saved: {out_svg}")
