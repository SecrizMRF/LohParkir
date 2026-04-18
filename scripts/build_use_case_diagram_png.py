"""Generate UML Use Case Diagram (PNG) for LohParkir using matplotlib."""
from pathlib import Path
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, FancyBboxPatch, Rectangle
import matplotlib.lines as mlines

PRIMARY = "#0D47A1"
ACCENT = "#1565C0"
WARN = "#E65100"
SUCCESS = "#2E7D32"
MUTED = "#666666"
SYSTEM_BG = "#F4F8FE"
TEXT = "#1A1A1A"

W, H = 16, 11
fig, ax = plt.subplots(figsize=(W, H), dpi=160)
ax.set_xlim(0, 1600)
ax.set_ylim(0, 1100)
ax.invert_yaxis()
ax.axis("off")

# Title
ax.text(800, 35, "Use Case Diagram — Aplikasi LohParkir",
        ha="center", va="center", fontsize=20, fontweight="bold", color=PRIMARY)
ax.text(800, 65, "Sistem Verifikasi Parkir Berbasis QR Code untuk Dishub Kota Medan",
        ha="center", va="center", fontsize=11, color=MUTED, style="italic")

# System boundary
sys_x, sys_y, sys_w, sys_h = 360, 100, 880, 950
ax.add_patch(FancyBboxPatch((sys_x, sys_y), sys_w, sys_h,
                            boxstyle="round,pad=8,rounding_size=14",
                            linewidth=2, edgecolor=PRIMARY, facecolor=SYSTEM_BG))
ax.text(sys_x + sys_w / 2, sys_y + 25, "Sistem LohParkir",
        ha="center", va="center", fontsize=13, fontweight="bold", color=PRIMARY)

# ----- Actor stick figure -----
def draw_actor(x, y, label, color):
    head_r = 14
    body_top = y + head_r
    body_bot = y + 70
    arms_y = y + 35
    ax.add_patch(plt.Circle((x, y), head_r, fill=False, edgecolor=color, linewidth=2.4))
    ax.plot([x, x], [body_top, body_bot], color=color, linewidth=2.4)
    ax.plot([x - 24, x + 24], [arms_y, arms_y], color=color, linewidth=2.4)
    ax.plot([x, x - 20], [body_bot, body_bot + 36], color=color, linewidth=2.4)
    ax.plot([x, x + 20], [body_bot, body_bot + 36], color=color, linewidth=2.4)
    ax.text(x, body_bot + 60, label, ha="center", va="top",
            fontsize=11, fontweight="bold", color=color)
    return (x, arms_y)

# ----- Use case ellipse -----
def draw_uc(cx, cy, w, h, label, color):
    ax.add_patch(Ellipse((cx, cy), w, h, facecolor="white", edgecolor=color, linewidth=1.8))
    ax.text(cx, cy, label, ha="center", va="center", fontsize=9.5, color=TEXT, wrap=True)
    return (cx, cy, w, h)

def edge(p, uc, color=MUTED, dashed=False, lw=1.1):
    """Connect actor anchor to nearest edge of ellipse."""
    cx, cy, w, h = uc
    # find point on ellipse closest to actor anchor
    import math
    dx = p[0] - cx
    dy = p[1] - cy
    if dx == 0 and dy == 0:
        return
    angle = math.atan2(dy / (h / 2), dx / (w / 2))
    ex = cx + (w / 2) * math.cos(angle)
    ey = cy + (h / 2) * math.sin(angle)
    ls = (0, (5, 4)) if dashed else "-"
    ax.plot([p[0], ex], [p[1], ey], color=color, linewidth=lw, linestyle=ls)

def relation(uc1, uc2, label):
    """Dashed arrow with stereotype between two use cases."""
    import math
    c1x, c1y, w1, h1 = uc1
    c2x, c2y, w2, h2 = uc2
    dx, dy = c2x - c1x, c2y - c1y
    if dx == 0 and dy == 0:
        return
    a1 = math.atan2(dy / (h1 / 2), dx / (w1 / 2))
    sx = c1x + (w1 / 2) * math.cos(a1)
    sy = c1y + (h1 / 2) * math.sin(a1)
    a2 = math.atan2(-dy / (h2 / 2), -dx / (w2 / 2))
    ex = c2x + (w2 / 2) * math.cos(a2)
    ey = c2y + (h2 / 2) * math.sin(a2)
    ax.annotate("", xy=(ex, ey), xytext=(sx, sy),
                arrowprops=dict(arrowstyle="->", color=PRIMARY, lw=1.2,
                                linestyle=(0, (5, 4))))
    mx, my = (sx + ex) / 2, (sy + ey) / 2
    ax.text(mx, my - 6, label, ha="center", va="bottom",
            fontsize=8.5, fontstyle="italic", color=PRIMARY,
            bbox=dict(boxstyle="round,pad=0.15", fc="white", ec="none", alpha=0.9))

# ----- Actors -----
warga = draw_actor(140, 230, "Warga (Publik)", PRIMARY)
jukir = draw_actor(140, 720, "Juru Parkir", SUCCESS)
admin = draw_actor(1450, 430, "Admin Dishub", WARN)
gateway = draw_actor(1450, 870, "Payment Gateway\n(QRIS)", MUTED)

# ----- Warga use cases -----
warga_ucs = {
    "scan":    draw_uc(540, 170, 200, 56, "Scan QR Jukir", ACCENT),
    "manual":  draw_uc(540, 250, 200, 56, "Input QR Manual", ACCENT),
    "bayar":   draw_uc(540, 330, 200, 56, "Bayar via QRIS", ACCENT),
    "karcis":  draw_uc(540, 410, 200, 56, "Terima Karcis Digital", ACCENT),
    "rating":  draw_uc(800, 170, 200, 56, "Beri Rating Jukir", ACCENT),
    "lapor":   draw_uc(800, 250, 200, 56, "Lapor Pungli /\nJukir Liar", ACCENT),
    "history": draw_uc(800, 340, 200, 56, "Lihat Riwayat\n& Poin", ACCENT),
    "stats":   draw_uc(800, 430, 200, 56, "Lihat Statistik\nPublik", ACCENT),
    "login":   draw_uc(540, 510, 200, 56, "Daftar / Login\n(opsional)", ACCENT),
}

# ----- Juru Parkir use cases -----
jukir_ucs = {
    "loginJ":  draw_uc(540, 640, 220, 56, "Login dengan NIP", SUCCESS),
    "showQR":  draw_uc(540, 720, 220, 56, "Tampilkan QR\nMotor & Mobil", SUCCESS),
    "cash":    draw_uc(540, 810, 220, 56, "Catat Pembayaran\nTunai", SUCCESS),
    "tarif":   draw_uc(540, 900, 220, 56, "Lihat Tarif Resmi", SUCCESS),
}

# ----- Admin use cases -----
admin_ucs = {
    "loginA":   draw_uc(1080, 220, 220, 56, "Login Admin", WARN),
    "petugas":  draw_uc(1080, 300, 220, 56, "Kelola Data\nPetugas (CRUD)", WARN),
    "genQR":    draw_uc(1080, 390, 220, 56, "Generate QR\nPetugas", WARN),
    "laporanA": draw_uc(1080, 480, 220, 56, "Kelola Laporan\nPelanggaran", WARN),
    "dash":     draw_uc(1080, 570, 220, 56, "Pantau Dashboard\nStatistik", WARN),
    "audit":    draw_uc(1080, 660, 220, 56, "Audit Riwayat\nPembayaran", WARN),
    "live":     draw_uc(1080, 750, 220, 56, "Lihat Aktivitas\nScan Realtime", WARN),
    "super":    draw_uc(1080, 840, 220, 56, "Kelola Akun\nSuper Admin", WARN),
}

# ----- Gateway use case -----
gateway_uc = draw_uc(1080, 935, 220, 56, "Proses Transaksi\nQRIS", MUTED)

# ----- Associations -----
for uc in warga_ucs.values():
    edge(warga, uc)
for uc in jukir_ucs.values():
    edge(jukir, uc, color=SUCCESS)
for uc in admin_ucs.values():
    edge(admin, uc, color=WARN)
edge(gateway, gateway_uc, color=MUTED)

# ----- Include / Extend relations -----
relation(warga_ucs["scan"], warga_ucs["bayar"], "«include»")
relation(warga_ucs["bayar"], warga_ucs["karcis"], "«include»")
relation(warga_ucs["karcis"], warga_ucs["rating"], "«extend»")
relation(warga_ucs["scan"], warga_ucs["lapor"], "«extend»")
relation(admin_ucs["loginA"], admin_ucs["petugas"], "«include»")
relation(admin_ucs["petugas"], admin_ucs["genQR"], "«include»")
relation(warga_ucs["bayar"], gateway_uc, "«include»")
relation(jukir_ucs["loginJ"], jukir_ucs["showQR"], "«include»")

# ----- Legend -----
lx, ly, lw, lh = 30, 970, 300, 110
ax.add_patch(Rectangle((lx, ly), lw, lh, facecolor="white", edgecolor=MUTED, linewidth=1))
ax.text(lx + 12, ly + 22, "Keterangan:", fontsize=11, fontweight="bold", color=TEXT)
ax.plot([lx + 14, lx + 60], [ly + 45, ly + 45], color=MUTED, linewidth=1.4)
ax.text(lx + 70, ly + 49, "Asosiasi aktor — use case", fontsize=10, color=TEXT)
ax.plot([lx + 14, lx + 60], [ly + 70, ly + 70], color=PRIMARY, linewidth=1.4, linestyle=(0, (5, 4)))
ax.text(lx + 70, ly + 74, "«include» / «extend»", fontsize=10, color=TEXT)
ax.text(lx + 14, ly + 98, "Aktor sekunder: Payment Gateway QRIS", fontsize=9.5, color=MUTED)

out = Path("attached_assets/use_case_diagram_lohparkir.png")
plt.savefig(out, dpi=160, bbox_inches="tight", facecolor="white")
print(f"Saved: {out}")
