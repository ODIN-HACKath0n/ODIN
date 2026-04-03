#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include "StorageManager.hpp"

namespace py = pybind11;

PYBIND11_MODULE(logistics_core, m) {

    py::class_<Warehouse>(m, "Warehouse")
        .def(py::init<>())
        .def_readwrite("id", &Warehouse::id)
        .def_readwrite("px", &Warehouse::px)
        .def_readwrite("py", &Warehouse::py)
        .def_readwrite("inventory", &Warehouse::inventory); // ВИПРАВЛЕНО: було invertory

    py::class_<Request>(m, "Request")
        .def(py::init<>())
        .def_readwrite("id", &Request::id)
        .def_readwrite("itemNeeded", &Request::itemNeeded)
        .def_readwrite("targetPy", &Request::targetPy); // ВИПРАВЛЕНО: було targetPY

    py::class_<Person>(m, "Person")
        .def_readwrite("id", &Person::id)
        .def_readwrite("name", &Person::name);

    py::class_<Director, Person>(m, "Director")
        .def(py::init<>())
        .def_readwrite("companyName", &Director::companyName)
        .def_readwrite("clearanceLevel", &Director::clearanceLevel)
        .def("create_warehouse", &Director::createWarehouse);

    py::class_<Manager, Person>(m, "Manager")
        .def(py::init<>())
        .def_readwrite("department", &Manager::department)
        .def_readwrite("managedRegion", &Manager::managedRegion);
        // ВИПРАВЛЕНО: createRequest видалено — Manager не має цього методу

    py::class_<Driver, Person>(m, "Driver")
        .def(py::init<>())
        .def_readwrite("assignedTruckId", &Driver::assignedTruckId)
        .def_readwrite("status", &Driver::status)
        .def_readwrite("licenseType", &Driver::licenseType)
        .def_readwrite("experienceYears", &Driver::experienceYears)
        .def("take_truck", &Driver::takeTruck);

    py::class_<StorageManager>(m, "StorageManager")
        .def(py::init<>())
        .def("add_manager",    &StorageManager::internalAddManager)    // ВИПРАВЛЕНО
        .def("add_dispatcher", &StorageManager::internalAddDispatcher) // ВИПРАВЛЕНО
        .def("add_driver",     &StorageManager::internalAddDriver);    // ВИПРАВЛЕНО
}
