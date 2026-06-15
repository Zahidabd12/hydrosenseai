# %% [markdown]
# # ML Training Pipeline untuk HydroSense AI
# Script ini dirancang agar dapat dijalankan secara interaktif (seperti Jupyter Notebook)
# menggunakan ekstensi Jupyter di VS Code, atau dijalankan secara langsung.
# File ini berfungsi sebagai "Evidence" proses training model dan Exploratory Data Analysis.

# %% [markdown]
# ## 1. Import Libraries
# %%
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import glob
import os
import m2cgen as m2c

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from xgboost import XGBRegressor

# Set styling untuk plot
plt.style.use('ggplot')
sns.set_palette('viridis')

# %% [markdown]
# ## 2. Data Loading
# Membaca seluruh file CSV curah hujan NASA POWER dari folder data.
# %%
# Sesuaikan path ini dengan folder data lokal Anda
data_dir = r"D:\DATA\Kuliah\SEMESTER 4\Perancangan Aplikasi Sains Data\data"
all_files = glob.glob(os.path.join(data_dir, "*.csv"))

df_list = []
for file in all_files:
    # Membaca CSV (dengan asumsi NASA POWER header skip, ubah baris skiprows jika perlu)
    # Biasanya data NASA mulai baris ke 10 atau lebih, tetapi jika data sudah bersih, langsung dibaca
    try:
        df = pd.read_csv(file)
        df_list.append(df)
    except Exception as e:
        print(f"Error membaca {file}: {e}")

# Gabungkan seluruh data dari tahun 2020 hingga 2026
data = pd.concat(df_list, ignore_index=True)
print(f"Total baris data: {len(data)}")
print(data.head())

# %% [markdown]
# ## 3. Data Preprocessing & Feature Engineering
# Konversi waktu, pembersihan nilai Null, dan pembuatan fitur.
# Asumsi kolom NASA: YEAR, DOY, T2M (Suhu), RH2M (Lembap), WS10M (Angin), PS (Tekanan), PRECTOTCORR (Hujan)
# %%
# Konversi DOY ke Datetime
data['Date'] = pd.to_datetime(data['YEAR'].astype(str) + '-' + data['DOY'].astype(str), format='%Y-%j')

# Memilih fitur yang relevan untuk Training
features = ['T2M', 'RH2M', 'WS10M', 'PS'] # Fitur (Suhu, Lembap, Angin, Tekanan Udara)
target = 'PRECTOTCORR' # Target (Curah Hujan)

# Memastikan hanya memproses baris yang memiliki data lengkap
df_clean = data[features + [target]].dropna()

X = df_clean[features]
y = df_clean[target]

print(f"Dimensi X: {X.shape}")
print(f"Dimensi y: {y.shape}")

# %% [markdown]
# ## 4. Exploratory Data Analysis (EDA)
# Melihat korelasi antar fitur dan distribusi curah hujan
# %%
# Plot 1: Distribusi Curah Hujan
plt.figure(figsize=(10, 5))
sns.histplot(y, bins=50, kde=True, color='blue')
plt.title("Distribusi Curah Hujan (PRECTOTCORR)")
plt.xlabel("Curah Hujan (mm/hari)")
plt.ylabel("Frekuensi")
plt.xlim(0, 100) # Membatasi plot untuk melihat detail nilai rendah
plt.show()

# Plot 2: Matriks Korelasi
plt.figure(figsize=(8, 6))
correlation = df_clean.corr()
sns.heatmap(correlation, annot=True, cmap='coolwarm', fmt=".2f")
plt.title("Matriks Korelasi Variabel Cuaca")
plt.show()

# %% [markdown]
# ## 5. Pemisahan Data (Train/Test Split)
# Membagi 80% data untuk training, 20% untuk pengujian (test)
# %%
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training data: {X_train.shape[0]} baris")
print(f"Testing data: {X_test.shape[0]} baris")

# %% [markdown]
# ## 6. Training Model Machine Learning (XGBoost)
# Melatih model XGBoost Regressor untuk memprediksi curah hujan
# %%
# Inisialisasi model
# Kita membatasi kedalaman (max_depth) dan jumlah pohon (n_estimators)
# agar kode terjemahan Python nantinya tidak terlalu membengkak (size efisien)
xgb_model = XGBRegressor(n_estimators=50, max_depth=4, learning_rate=0.1, random_state=42)

# Proses Training (Lama eksekusi bergantung pada CPU)
print("Memulai proses training XGBoost...")
xgb_model.fit(X_train, y_train)
print("Training Selesai!")

# %% [markdown]
# ## 7. Evaluasi Model (Model Evaluation)
# Memeriksa akurasi model menggunakan data Test
# %%
# Melakukan prediksi pada data pengujian
y_pred = xgb_model.predict(X_test)

# Menghitung Metrik Error
mse = mean_squared_error(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("=== Hasil Evaluasi Model ===")
print(f"Mean Squared Error (MSE)   : {mse:.2f}")
print(f"Mean Absolute Error (MAE)  : {mae:.2f} mm")
print(f"R-squared Score (R2)       : {r2:.2f}")

# Plot Prediksi vs Aktual
plt.figure(figsize=(8, 8))
plt.scatter(y_test, y_pred, alpha=0.3, color='purple')
plt.plot([0, 100], [0, 100], 'r--') # Garis diagonal sempurna
plt.title("Aktual vs Prediksi XGBoost")
plt.xlabel("Curah Hujan Aktual (mm)")
plt.ylabel("Curah Hujan Prediksi (mm)")
plt.xlim(0, 100)
plt.ylim(0, 100)
plt.show()

# %% [markdown]
# ## 8. "MAGIC TRICK" - Translate XGBoost to Pure Python!
# Menggunakan m2cgen untuk mengubah model yang sudah ditraining
# menjadi kode Python murni berupa fungsi raksasa.
# Ini akan menghindari penggunaan library XGBoost di Vercel backend.
# %%
print("Menerjemahkan otak model XGBoost ke dalam native Python...")
python_code = m2c.export_to_python(xgb_model)

# Menyimpan hasil terjemahan ke file
output_path = "m2cgen_inference.py"
with open(output_path, "w") as f:
    f.write(python_code)

print(f"Selesai! Fungsi if-else murni berhasil diekspor ke {output_path}.")
print("\nAnda sekarang bisa menyalin fungsi `score(input)` di file tersebut")
print("untuk menggantikan logika mock di `app/core/ml_engine.py` Anda!")

# %%
