# mock_db.py
import sys
import os

# Піднімаємось на 2 рівні вгору: з app/database у backend/, а потім йдемо у cpp_engine/build/Release
pyd_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'cpp_engine', 'build', 'Release'))
sys.path.append(pyd_path)

# Виведемо шлях у консоль для перевірки (можете потім видалити цей рядок)
print(f"Шукаємо C++ модуль за шляхом: {pyd_path}")
postgres_bin_path = r"C:\Program Files\PostgreSQL\18\bin"

# Явно додаємо папку з DLL (libpq.dll) для Python
if hasattr(os, 'add_dll_directory') and os.path.exists(postgres_bin_path):
    os.add_dll_directory(postgres_bin_path)

import logistics_core

class DatabaseWrapper:
    def __init__(self):
        # Ініціалізуємо C++ клас
        self.db = logistics_core.StorageManager()
        print("C++ StorageManager ініціалізовано!")

    def get_engine(self):
        return self.db

# Створюємо єдиний екземпляр бази для всього додатку
db_instance = DatabaseWrapper()
db_engine = db_instance.get_engine()