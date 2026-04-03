#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include "Storage_Manager.hpp"
#include "Algorithm_Path.hpp"

namespace py = pybind11;

PYBIND11_MODULE(logistics_core, m) {
    py::enum_<Priority>(m, "Priority")
        .value("CRITICAL", Priority::CRITICAL)
        .value("HIGH", Priority::HIGH)
        .value("NORMAL", Priority::NORMAL)
        .export_values();

    py::class_<PriorityManager>(m, "PriorityManager")
        .def(py::init<>())
        .def("add_request", &PriorityManager::addRequest)
        .def("get_top_request", &PriorityManager::getTopRequest)
        .def("has_requests", &PriorityManager::hasRequests);

    py::class_<ResourceFinder>(m, "ResourceFinder")
        .def(py::init<>())
        .def_static("find_best_path", &ResourceFinder::findBestPath);

    py::class_<GeoMath>(m, "GeoMath")
        .def_static("calculate_distance", &GeoMath::calculateDistance);

    py::class_<Warehouse, std::shared_ptr<Warehouse>>(m, "Warehouse")
        .def(py::init<>())
        .def_readwrite("id", &Warehouse::id)
        .def_readwrite("px", &Warehouse::px)
        .def_readwrite("py", &Warehouse::py)
        .def_readwrite("inventory", &Warehouse::inventory);

    py::class_<Request>(m, "Request")
        .def(py::init<>())
        .def_readwrite("id", &Request::id)
        .def_readwrite("itemNeeded", &Request::itemNeeded)
        .def_readwrite("priority", &Request::priority)
        .def_readwrite("timestamp", &Request::timestamp)
        .def_readwrite("px", &Request::px)
        .def_readwrite("py", &Request::py)
        .def_readwrite("targetPx", &Request::targetPx)
        .def_readwrite("targetPy", &Request::targetPy)
        .def_readwrite("itemWeight", &Request::itemWeight)
        .def_readwrite("currentLoad", &Request::currentLoad)
        .def_readwrite("maxCapacity", &Request::maxCapacity);


    py::class_<Person>(m, "Person")
        .def_readwrite("id", &Person::id)
        .def_readwrite("name", &Person::name)
        .def_readwrite("email", &Person::email)
        .def_readwrite("password", &Person::password)
        .def_readwrite("phone", &Person::phone)
        .def_readwrite("role", &Person::role)
        .def_readwrite("isOnline", &Person::isOnline);

    py::class_<Director, Person>(m, "Director")
        .def(py::init<>())
        .def_readwrite("companyName", &Director::companyName)
        .def_readwrite("clearanceLevel", &Director::clearanceLevel)
        .def("create_warehouse", &Director::createWarehouse)
        .def("add_manager", &Director::addManager); 

    py::class_<Manager, Person>(m, "Manager")
        .def(py::init<>())
        .def_readwrite("department", &Manager::department)
        .def_readwrite("managedRegion", &Manager::managedRegion)
        .def_readwrite("managedById", &Manager::managedById) 
        .def_readwrite("px", &Manager::px)                  
        .def_readwrite("py", &Manager::py)                
        .def("add_dispatcher", &Manager::addDispatcher)    
        .def("add_driver", &Manager::addDriver)             
        .def("update_location", &Manager::updateLocation)   
        .def("assign_transportation", &Manager::assignTransportation); 


    py::class_<Dispatcher, Person>(m, "Dispatcher")
        .def(py::init<>())
        .def_readwrite("managedById", &Dispatcher::managedById)
        .def("create_request", &Dispatcher::createRequest)
        .def("assign_route_to_driver", &Dispatcher::assignRouteToDriver);

    py::class_<Driver, Person>(m, "Driver")
        .def(py::init<>())
        .def_readwrite("assignedTruckId", &Driver::assignedTruckId)
        .def_readwrite("status", &Driver::status)
        .def_readwrite("licenseType", &Driver::licenseType)
        .def_readwrite("experienceYears", &Driver::experienceYears)
        .def_readwrite("maxCapacity", &Driver::maxCapacity)  
        .def_readwrite("currentLoad", &Driver::currentLoad)  
        .def_readwrite("managedById", &Driver::managedById)  
        .def("take_truck", &Driver::takeTruck);


    py::class_<StorageManager>(m, "StorageManager")
        .def(py::init<>())


        .def("test_connection", &StorageManager::testConnection)
        .def("register_account", &StorageManager::registerAccount,
            py::arg("id"), py::arg("email"), py::arg("phone"), py::arg("password"), py::arg("role"), py::arg("name") = "New User")
        .def("login", &StorageManager::login)
        .def("logout", &StorageManager::logout)
        .def("get_user_auth_data", &StorageManager::getUserAuthData)

        .def("get_online_drivers", &StorageManager::getOnlineDrivers)
        .def("get_all_online_staff", &StorageManager::getAllOnlineStaff)
        .def("get_sorted_requests", &StorageManager::getSortedRequests)
        .def("get_warehouses_list", &StorageManager::getWarehousesList)

        .def("add_manager", &StorageManager::internalAddManager)
        .def("add_dispatcher", &StorageManager::internalAddDispatcher)
        .def("add_driver", &StorageManager::internalAddDriver)
        .def("add_director", &StorageManager::internalAddDirector)         
        .def("add_request", &StorageManager::internalAddRequest)           
        .def("assign_route", &StorageManager::internalAssignRoute)         
        .def("update_manager_location", &StorageManager::internalUpdateManagerLocation) 
        .def("add_warehouse", &StorageManager::internalAddWarehouse)       

        .def("get_person_by_id", &StorageManager::getPersonById)
        .def("cast_person_by_role", &StorageManager::castPersonByRole)

        .def("sync_offline_data", &StorageManager::syncOfflineData)
        .def("load_from_sql", &StorageManager::loadFromSQL);
}
