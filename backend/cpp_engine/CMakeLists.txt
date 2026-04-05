cmake_minimum_required(VERSION 3.15)
project(logistics_core)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 1. Вказуємо CMake, де шукати PostgreSQL
set(PostgreSQL_ROOT "C:/Program Files/PostgreSQL/18")

# 2. Завантажуємо pybind11
include(FetchContent)
FetchContent_Declare(
    pybind11
    GIT_REPOSITORY https://github.com/pybind/pybind11.git
    GIT_TAG        v2.13.6
)
FetchContent_MakeAvailable(pybind11)

# 3. Знаходимо залежності
find_package(Python COMPONENTS Interpreter Development REQUIRED)
find_package(PostgreSQL REQUIRED)

# 4. Створюємо модуль (додано sqlite3.c, тому find_package для SQLite не потрібен)
pybind11_add_module(logistics_core
    src/Algorithm_Path.cpp
    src/Storage_Manager.cpp
    src/Python_include.cpp
    src/sqlite3.c
)

# 5. Підключаємо заголовки
target_include_directories(logistics_core PRIVATE includes)
target_include_directories(logistics_core PRIVATE ${PostgreSQL_INCLUDE_DIRS})

# 6. Лінкуємо ТІЛЬКИ PostgreSQL
target_link_libraries(logistics_core PRIVATE ${PostgreSQL_LIBRARIES})