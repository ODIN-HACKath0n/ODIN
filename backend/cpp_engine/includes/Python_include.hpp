#pragma once
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <unordered_map>
#include <string>
#include <mutex>
#include <stdexcept>

namespace py = pybind11;

// Структура даних
struct Location {
    int id;
    std::string name;
    float lat;
    float lon;
    int stock;
};

// Клас бази даних
class LogisticsDB {
private:
    std::unordered_map<int, Location> storage;
    std::mutex db_mutex; // Захист від одночасного доступу

public:
    LogisticsDB() {}

    // Метод для додавання запису
    void add_location(int id, const std::string& name, float lat, float lon, int stock) {
        std::lock_guard<std::mutex> lock(db_mutex); // Блокуємо доступ для інших потоків
        storage[id] = { id, name, lat, lon, stock };
    }

    // Метод для отримання запису
    Location get_location(int id) {
        std::lock_guard<std::mutex> lock(db_mutex);
        if (storage.find(id) != storage.end()) {
            return storage[id];
        }
        throw std::runtime_error("Локацію не знайдено"); // Викидаємо помилку, яку зловить Python
    }
};

// Експорт у Python через pybind11
PYBIND11_MODULE(custom_db, m) {
    // Експортуємо структуру (щоб Python бачив її поля)
    py::class_<Location>(m, "Location")
        .def_readonly("id", &Location::id)
        .def_readonly("name", &Location::name)
        .def_readonly("lat", &Location::lat)
        .def_readonly("lon", &Location::lon)
        .def_readonly("stock", &Location::stock);

    // Експортуємо клас бази даних
    py::class_<LogisticsDB>(m, "LogisticsDB")
        .def(py::init<>())
        .def("add_location", &LogisticsDB::add_location)
        .def("get_location", &LogisticsDB::get_location);
}

