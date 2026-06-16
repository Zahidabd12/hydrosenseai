# ∿ HydroSense AI
**Enterprise Climate Intelligence & Rainfall Prediction System**

![HydroSense AI Banner](https://img.shields.io/badge/HydroSense-AI-0ea5e9?style=for-the-badge&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi) ![XGBoost](https://img.shields.io/badge/XGBoost-126046?style=for-the-badge) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

HydroSense AI adalah platform intelijen iklim modern yang menggabungkan analisis geospasial (*Spatial Radar*) dengan pemodelan *Machine Learning* tingkat lanjut untuk memprediksi intensitas curah hujan secara presisi. Dibangun khusus untuk pemantauan mitigasi bencana, pertanian, dan tata kelola sumber daya air.

🔗 **[Live Demo di Vercel](https://hydrosenseai-ibvb.vercel.app/)**

---

## 🎯 Fitur Utama

- **Peta Radar Spasial (Grid)**: Visualisasi intensitas hujan secara *real-time* berbasis grid koordinat untuk mendeteksi anomali cuaca ekstrem (titik puncak awan cumulonimbus).
- **Explainable AI (XAI) Dashboard**: Prediksi curah hujan harian interaktif di mana pengguna dapat memanipulasi variabel meteorologi (Suhu, Kelembapan, Angin, Tekanan) dengan visualisasi *Feature Importance* secara langsung.
- **Standar Klasifikasi BMKG**: Konversi otomatis curah hujan (mm/hari) ke dalam label mitigasi standar BMKG (Ringan, Sedang, Lebat, Sangat Lebat).
- **Time-Series Analysis**: Pemantauan tren agregat bulanan dan deteksi pergeseran pola hujan.
- **Zero-Dependency Inference**: Memanfaatkan **`m2cgen`** (Model 2 Code Generator) untuk menerjemahkan model XGBoost kompleks menjadi fungsi murni Python, memungkinkan inferensi super cepat di lingkungan *Serverless* Vercel tanpa membebani limit ukuran (*size limit*).

---

## 🧠 Arsitektur Machine Learning

Pemodelan AI dalam HydroSense dilatih menggunakan dataset iklim global historis dari **NASA POWER (2020-2026)**. 
- **Target Variabel**: `PRECTOTCORR` (Curah Hujan Terkoreksi).
- **Fitur Ekstraksi**: `RH2M` (Kelembapan), `T2M` (Suhu), `WS10M` (Angin), `PS` (Tekanan).
- **Algoritma**: *XGBoost Regressor* dengan optimasi hiperparameter.
- **Evaluasi Objektif**: Diuji dengan *5-Fold Cross Validation* untuk memastikan tidak ada indikasi *Overfitting*. Model ini berhasil meraih skor $R^2 > 0.85$ untuk prediksi harian komprehensif.

*(Detail pelatihan model dapat dilihat di `training_pipeline/train_model.ipynb`)*

---

## 🛠 Instalasi & Menjalankan Secara Lokal

1. **Clone repositori ini**
   ```bash
   git clone https://github.com/Zahidabd12/hydrosenseai.git
   cd hydrosenseai
   ```

2. **Buat Virtual Environment (Opsional namun direkomendasikan)**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Untuk Linux/Mac
   venv\Scripts\activate     # Untuk Windows
   ```

3. **Instalasi Dependensi**
   ```bash
   pip install -r requirements.txt
   ```

4. **Jalankan Server FastAPI**
   ```bash
   uvicorn api.index:app --reload
   ```
   Aplikasi akan berjalan di `http://127.0.0.1:8000`.

---

## 👥 Tim Pengembang

Proyek **Perancangan Aplikasi Sains Data** ini dikembangkan secara kolaboratif oleh:

| Nama Lengkap | NIM |
| :--- | :--- |
| **Nashwa Aqeela Irtisa Rudin** | 103102400006 |
| **Muhammad Ridwan** | 103102400012 |
| **Nisrina Hibatullah** | 103102400013 |
| **Zahid Abdullah Nur Mukhlishin** | 103102400034 |
| **Auliya Nisa’ Nur Rohmah** | 103102400056 |

---
*Dibuat untuk mendorong inovasi sains data pada manajemen iklim tropis.*
