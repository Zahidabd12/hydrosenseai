import sys
import os
# Menambahkan direktori root (satu tingkat di atas folder api) ke dalam path python
# agar Vercel bisa mendeteksi modul 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
