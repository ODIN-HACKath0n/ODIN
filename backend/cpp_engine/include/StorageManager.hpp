#pragma once
#include "headerAlgoritm.hpp" 
#include <shared_mutex>
#include <unordered_map>
#include <thread>
#include <atomic>
#include <string>
#include <vector>
#include <stdexcept>
#include <fstream>
#include <libpq-fe.h>

class StorageManager;

class Person {
public:
    std::string id;
    std::string name;
    std::string email;
    std::string phone;
    std::string role;
    bool isOnline;

    Person() : isOnline(false) {}

    Person(std::string id, std::string name, std::string email, std::string phone, std::string role, bool isOnline = false)
        : id(id), name(name), email(email), phone(phone), role(role), isOnline(isOnline) {
    }

    virtual ~Person() = default;
};

class Driver : public Person {
public:
    std::string assignedTruckId;
    std::string status;
    std::string licenseType;
    int experienceYears;
    double px;
    double py;
    int maxCapacity;
    int currentLoad;
    std::string managedById;

    Driver() : Person(), px(0.0), py(0.0), maxCapacity(0), currentLoad(0), experienceYears(0) {}

    Driver(std::string id, std::string name, std::string email, std::string phone, bool isOnline,
        std::string truckId, std::string status, std::string license, int exp,
        double px, double py, int maxCap, int curLoad, std::string managerId)
        : Person(id, name, email, phone, "DRIVER", isOnline),
        assignedTruckId(truckId), status(status), licenseType(license), experienceYears(exp),
        px(px), py(py), maxCapacity(maxCap), currentLoad(curLoad), managedById(managerId) {
    }

    void takeTruck(StorageManager& db, const std::string& truckId);
    void updateLocation(StorageManager& db, double newPx, double newPy);
};

class Dispatcher : public Person {
public:
    std::string managedById;

    Dispatcher() : Person() {}

    Dispatcher(std::string id, std::string name, std::string email, std::string phone, bool isOnline, std::string managerId)
        : Person(id, name, email, phone, "DISPATCHER", isOnline), managedById(managerId) {
    }

    void createRequest(StorageManager& db, const Request& r);
    void assignRouteToDriver(StorageManager& db, const std::string& driverId, const Request& req);
};

class Manager : public Person {
public:
    std::string department;
    std::string managedRegion;
    std::string managedById;

    Manager() : Person() {}

    Manager(std::string id, std::string name, std::string email, std::string phone, bool isOnline,
        std::string dept, std::string region, std::string directorId)
        : Person(id, name, email, phone, "MANAGER", isOnline),
        department(dept), managedRegion(region), managedById(directorId) {
    }

    void addDispatcher(StorageManager& db, const Dispatcher& d);
    void addDriver(StorageManager& db, const Driver& d);
};

class Director : public Person {
public:
    std::string companyName;
    int clearanceLevel;

    Director() : Person(), clearanceLevel(0) {}

    Director(std::string id, std::string name, std::string email, std::string phone, bool isOnline,
        std::string company, int clearance)
        : Person(id, name, email, phone, "DIRECTOR", isOnline),
        companyName(company), clearanceLevel(clearance) {
    }

    void addManager(StorageManager& db, const Manager& m);
    void createWarehouse(StorageManager& db, const Warehouse& w);
};

typedef std::shared_mutex SharedMutex;
typedef std::unordered_map<int, Warehouse> WarehouseMap;
typedef std::unordered_map<unsigned int, Request> RequestMap;
typedef std::unordered_map<std::string, Manager> ManagerMap;
typedef std::unordered_map<std::string, Director> DirectorMap;
typedef std::unordered_map<std::string, Dispatcher> DispatcherMap;
typedef std::unordered_map<std::string, Driver> DriverMap;

class StorageManager {
private:
    WarehouseMap warehouses;
    RequestMap requests;
    ManagerMap managers;
    DirectorMap directors;
    DispatcherMap dispatchers;
    DriverMap drivers;

    PGconn* conn;

    mutable SharedMutex warehouseMutex;
    mutable SharedMutex requestMutex;
    mutable SharedMutex peopleMutex;
    std::string dbFilename = "database.bin";
    std::atomic<bool> keepRunning{ true };
    std::thread backgroundSaver;

    void saverLoop();

public:
    StorageManager();
    ~StorageManager();
    void testConnection();

    void registerAccount(const std::string& id, const std::string& email, const std::string& phone);

    std::vector<Driver> getOnlineDrivers() const;
    std::vector<Person> getAllOnlineStaff() const;
    std::vector<Request> getSortedRequests() const;

    void internalAddManager(const Manager& m);
    void internalAddDispatcher(const Dispatcher& d);
    void internalAddDriver(const Driver& d);
    void internalAddRequest(const Request& r);
    void internalAssignRoute(const std::string& driverId, const Request& req);
    void internalUpdateDriverLocation(const std::string& driverId, double px, double py);
    void internalAddWarehouse(const Warehouse& w);
    void internalAddDirector(const Director& d);

    void loadFromSQL();
    void saveToDiskBinary();
    void loadFromDiskBinary();
};
