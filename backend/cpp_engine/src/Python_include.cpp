#include <pybind11/pybind11.h>
#include <pybind11/stl.h> // Дуже важливо! Автоматично конвертує vector та unordered_map
#include "Algorithm_Path.hpp" // Ваш оригінальний заголовочний файл

namespace py = pybind11;

// "routing_engine" - це назва модуля, яку ви будете імпортувати в Python
PYBIND11_MODULE(routing_engine, m) {
    m.doc() = "High-performance C++ routing engine for logistics";

    // Біндимо Enum
    py::enum_<Priority>(m, "Priority")
        .value("NORMAL", Priority::NORMAL)
        .value("HIGH", Priority::HIGH)
        .value("CRITICAL", Priority::CRITICAL)
        .export_values();

    // Біндимо Request
    py::class_<Request>(m, "Request")
        .def(py::init<>())
        .def_readwrite("id", &Request::id)
        .def_readwrite("timestamp", &Request::timestamp)
        .def_readwrite("priority", &Request::priority)
        .def_readwrite("itemNeeded", &Request::itemNeeded)
        .def_readwrite("px", &Request::px)
        .def_readwrite("py", &Request::py)
        .def_readwrite("targetPx", &Request::targetPx)
        .def_readwrite("targetPy", &Request::targetPy)
        .def_readwrite("currentLoad", &Request::currentLoad)
        .def_readwrite("itemWeight", &Request::itemWeight)
        .def_readwrite("maxCapacity", &Request::maxCapacity);

    // Біндимо Warehouse (вказуємо std::shared_ptr, бо ви використовуєте його в алгоритмі)
    py::class_<Warehouse, std::shared_ptr<Warehouse>>(m, "Warehouse")
        .def(py::init<>())
        .def_readwrite("id", &Warehouse::id)
        .def_readwrite("px", &Warehouse::px)
        .def_readwrite("py", &Warehouse::py)
        .def_readwrite("inventory", &Warehouse::inventory);

    // Біндимо RouteResult
    py::class_<RouteResult>(m, "RouteResult")
        .def_readonly("isFound", &RouteResult::isFound)
        .def_readonly("optimalWarehouse", &RouteResult::optimalWarehouse)
        .def_readonly("totalDistance", &RouteResult::totalDistance)
        .def_readonly("straightDistance", &RouteResult::straightDistance);

    // Біндимо клас ResourceFinder
    py::class_<ResourceFinder>(m, "ResourceFinder")
        .def(py::init<>())
        .def("findBestPath", &ResourceFinder::findBestPath);
}