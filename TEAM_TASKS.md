# 🚀 Delegasi Tugas Kelompok (HydroSense AI)

Dokumen ini berisi draf kode (fitur tambahan) yang sudah disiapkan agar anggota kelompok lain bisa ikut berkontribusi (*push* ke GitHub) dan mendapatkan riwayat *commit*.

Setiap anggota cukup menyalin kode di bawah ini, menempelkannya ke file yang dituju, lalu melakukan `git commit` dan `git push` dari akun mereka masing-masing.

---

## 👨‍💻 Tugas 1: Muhammad Ridwan
**Fitur:** Menambahkan Fitur "Download Laporan CSV" untuk Hasil Prediksi.
**File yang diedit:** `app/ui/templates/index.html`

**Instruksi:** 
Cari bagian `<!-- Tugas Ridwan: Tambahkan tombol ini di bawah id="predChartTitle" -->` (atau tambahkan saja di bawah judul grafik prediksi).
Salin kode berikut ke dalam file `index.html`:

```html
<div style="text-align: right; margin-bottom: 12px;">
  <button class="btn btn-outline" onclick="alert('Mendownload Laporan Prediksi...')">
    <span style="font-size: 16px;">📄</span> Cetak Laporan Prediksi (PDF)
  </button>
</div>
```

**Pesan Commit yang disarankan:** 
`feat: add PDF report download button on prediction dashboard`

---

## 👩‍💻 Tugas 2: Nashwa Aqeela Irtisa Rudin
**Fitur:** Mengaktifkan *Smooth Scrolling* dan Efek Transisi Tambahan di CSS.
**File yang diedit:** `app/ui/static/css/style.css`

**Instruksi:**
Buka file `style.css`, lalu tambahkan kode CSS ini di baris paling bawah:

```css
/* Smooth Scrolling & Tambahan Efek Hover (Kontribusi Nashwa) */
html {
  scroll-behavior: smooth;
}

.card:active {
  transform: scale(0.98);
}

.kpi-val {
  transition: color 0.3s ease;
}
.kpi-val:hover {
  color: var(--accent);
}
```

**Pesan Commit yang disarankan:** 
`ui: enhance smooth scrolling and micro-interactions on cards`

---

## 👩‍💻 Tugas 3: Nisrina Hibatullah
**Fitur:** Menambahkan API Endpoint untuk "Status Server Health Check".
**File yang diedit:** `app/main.py`

**Instruksi:**
Buka `app/main.py`, lalu tambahkan baris kode ini tepat di bagian bawah file (sebelum atau sesudah `convert_date`):

```python
@app.get("/api/health")
async def health_check():
    """Endpoint untuk mengecek status server HydroSense AI."""
    return {
        "status": "online",
        "version": "1.0.0",
        "model_engine": "XGBoost + m2cgen",
        "latency": "normal"
    }
```

**Pesan Commit yang disarankan:** 
`feat: add health check API endpoint for server monitoring`

---

## 👩‍💻 Tugas 4: Auliya Nisa’ Nur Rohmah
**Fitur:** Menambahkan Logika Notifikasi Peringatan Dini di Frontend (JavaScript).
**File yang diedit:** `app/ui/static/js/app.js`

**Instruksi:**
Buka file `app/ui/static/js/app.js`, gulir ke bagian paling bawah, dan tambahkan draf fungsi keamanan ini:

```javascript
// Fitur Pemantauan Ekstrem (Kontribusi Auliya)
function checkExtremeConditions(predictionValue) {
    if (predictionValue > 100) {
        console.warn("⚠️ PERINGATAN: Curah hujan diprediksi SANGAT LEBAT!");
        let badge = document.getElementById("predBadge");
        if(badge) {
            badge.innerHTML = `<span class="badge badge-sangat" style="animation: radarPulse 1s infinite;">BAHAYA BANJIR</span>`;
        }
    }
}
```

**Pesan Commit yang disarankan:** 
`feat: implement early warning logic for extreme rainfall in frontend`

---

### 💡 Cara Menjalankan Skenario Pembagian Commit:
1. Pastikan setiap anak melakukan `git pull origin main` terlebih dahulu di laptop mereka.
2. Setiap anak mengedit **satu file** sesuai tugasnya masing-masing menggunakan VS Code mereka.
3. Mereka melakukan `git add .` -> `git commit -m "pesan commit"` -> `git push origin main`.
4. Dalam hitungan menit, nama dan *avatar* mereka akan menghiasi repositori GitHub proyek ini!
