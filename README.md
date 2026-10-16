# 🌸 Soft Pink Booth

Photobooth web sederhana nuansa pink soft & putih. Murni HTML + CSS + JavaScript, tanpa library.

## Fitur
- Ambil foto lewat kamera (timer 3/5/10 detik) atau upload foto dari galeri
- Jumlah foto 1, 2, 3, 4, atau 6
- Layout strip vertikal atau grid 2 kolom
- 6 filter dan 8 warna frame
- 20 stiker yang ditempel setelah foto jadi (ukuran bisa diatur, ada Undo)
- Download hasil sebagai PNG, dan tombol ambil ulang

## Cara menjalankan di VS Code
1. Ekstrak zip, lalu buka foldernya di VS Code (File > Open Folder).
2. Pasang ekstensi **Live Server** (akan disarankan otomatis).
3. Klik kanan `index.html` > **Open with Live Server**.

Kamera hanya bisa dipakai lewat `localhost` atau HTTPS, jadi jangan buka `index.html` langsung dengan klik dua kali. Pakai Live Server atau `python3 -m http.server`.

## Struktur
- `index.html` - kerangka halaman
- `style.css` - tampilan (warna ada di variabel `:root`)
- `script.js` - logika kamera, canvas, stiker, download

## Kustomisasi cepat (di `script.js`)
- `FILTERS`, `FRAMES`, `PAL` - tambah filter, warna frame, dan stiker
- `W`, `H`, `P`, `G`, `F` - ukuran foto, padding, jarak, dan tinggi footer pada hasil
- Teks footer: cari `soft pink booth` di fungsi `draw()`
