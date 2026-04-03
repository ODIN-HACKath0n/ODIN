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
find_package(SQLite3 REQUIRED)
find_package(PostgreSQL REQUIRED)

# Створюємо ЄДИНИЙ модуль, додаючи ВСІ .cpp файли проекту
pybind11_add_module(logistics_core
    src/Algorithm_Path.cpp
    src/Storage_Manager.cpp
    src/Python_include.cpp # ОБОВ'ЯЗКОВО додати файл з PYBIND11_MODULE
)

target_include_directories(logistics_core PRIVATE includes)
target_include_directories(logistics_core PRIVATE ${PostgreSQL_INCLUDE_DIRS})
target_include_directories(logistics_core PRIVATE ${SQLite3_INCLUDE_DIRS})

# Лінкуємо і PostgreSQL, і SQLite3
target_link_libraries(logistics_core PRIVATE ${PostgreSQL_LIBRARIES} SQLite::SQLite3)