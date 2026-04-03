cmake_minimum_required(VERSION 3.15)
project(logistics_core)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Завантажуємо pybind11 автоматично
include(FetchContent)
FetchContent_Declare(
    pybind11
    GIT_REPOSITORY https://github.com/pybind/pybind11.git
    GIT_TAG        v2.13.6 # остання стабільна версія
)
FetchContent_MakeAvailable(pybind11)

# Знаходимо ТІЛЬКИ Python (pybind11 ми вже завантажили вище)
find_package(Python COMPONENTS Interpreter Development REQUIRED)

# Знаходимо PostgreSQL (libpq)
find_package(PostgreSQL REQUIRED)

# Додаємо ваш модуль
pybind11_add_module(logistics_core
    src/Source.cpp
    src/StorageManager.cpp
    # Додайте сюди інші .cpp файли, якщо вони є (наприклад algoritm.cpp)
)

# Підключаємо папки із заголовками
target_include_directories(logistics_core PRIVATE include)
target_include_directories(logistics_core PRIVATE ${PostgreSQL_INCLUDE_DIRS})

# Лінкуємо PostgreSQL
target_link_libraries(logistics_core PRIVATE ${PostgreSQL_LIBRARIES})