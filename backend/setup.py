from setuptools import setup, Extension
import pybind11
import os

# Визначаємо шляхи до вихідного коду та заголовків
cpp_root = 'cpp_engine'
sources = [
    os.path.join(cpp_root, 'src', 'Algorithm_Path.cpp'),
    os.path.join(cpp_root, 'src', 'Python_include.cpp')
]
include_dirs = [
    os.path.join(cpp_root, 'includes'),
    pybind11.get_include()
]

ext_modules = [
    Extension(
        'routing_engine',
        sources=sources,
        include_dirs=include_dirs,
        language='c++'
    ),
]

setup(
    name='routing_engine',
    version='0.1',
    ext_modules=ext_modules,
    install_requires=['pybind11'],
)