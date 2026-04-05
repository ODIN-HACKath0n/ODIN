cmake_minimum_required(VERSION 3.15)
project(routing_engine)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 1. Завантажуємо pybind11
include(FetchContent)
FetchContent_Declare(
    pybind11
    GIT_REPOSITORY https://github.com/pybind/pybind11.git
    GIT_TAG        v2.13.6
)
FetchContent_MakeAvailable(pybind11)

# 2. Знаходимо Python
find_package(Python COMPONENTS Interpreter Development REQUIRED)

# 3. Створюємо модуль (тільки ваші C++ файли з алгоритмами та обгорткою)
pybind11_add_module(routing_engine
    src/Algorithm_Path.cpp
    src/Python_include.cpp
)

# 4. Вказуємо папку з заголовками (hpp)
target_include_directories(routing_engine PRIVATE includes)