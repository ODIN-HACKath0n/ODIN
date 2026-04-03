#pragma once
#include "Algoritm_Path.hpp" 
#include "sqlite3.h"
#include <shared_mutex>
#include <unordered_map>
#include <string>
#include <vector>
#include <stdexcept>
#include <libpq-fe.h>
#include <memory>
#include <iostream>

class StorageManager;

// === ІЄРАРХІЯ КОРИСТУВАЧІВ ===
class Person {
public:
    std::string id, name, email, password, phone, role;
    bool isOnline;

    Person() : isOnline(false) {}
    Person(std::string id, std::string name, std::string email, std::string pass, std::string phone, std::string role, bool isOnline = false)
        : id(id), name(name), email(email), password(pass), phone(phone), role(role), isOnline(isOnline) {
    }
    virtual ~Person() = default;
};

class Driver : public Person {
public:
    std::string assignedTruckId, status, licenseType, managedById;
    int experienceYears, maxCapacity, currentLoad;

    Driver() : Person(), experienceYears(0), maxCapacity(0), currentLoad(0) {}
    Driver(std::string id, std::string name, std::string email, std::string pass, std::string phone,
        std::string truck, std::string stat, std::string lic, int exp, int maxCap, int curLoad, std::string mid)
        : Person(id, name, email, pass, phone, "DRIVER"),
        assignedTruckId(truck), status(stat), licenseType(lic),
        experienceYears(exp), maxCapacity(maxCap), currentLoad(curLoad), managedById(mid) {
    }

    void takeTruck(StorageManager& db, const std::string& truckId);
};

class Dispatcher : public Person {
public:
    std::string managedById;

    Dispatcher() : Person() {}
    Dispatcher(std::string id, std::string name, std::string email, std::string pass, std::string phone, std::string mid)
        : Person(id, name, email, pass, phone, "DISPATCHER"), managedById(mid) {
    }

    void createRequest(StorageManager& db, const Request& r);
    void assignRouteToDriver(StorageManager& db, const std::string& driverId, const Request& req);
};

class Manager : public Person {
public:
    std::string department, managedRegion, managedById;
    double px, py;

    Manager() : Person(), px(0.0), py(0.0) {}
    Manager(std::string id, std::string name, std::string email, std::string pass, std::string phone,
        std::string dept, std::string region, std::string mid, double x, double y)
        : Person(id, name, email, pass, phone, "MANAGER"),
        department(dept), managedRegion(region), managedById(mid), px(x), py(y) {
    }

    void addDispatcher(StorageManager& db, const Dispatcher& d);
    void addDriver(StorageManager& db, const Driver& d);
    void updateLocation(StorageManager& db, double newPx, double newPy);
    bool assignTransportation(StorageManager& db, const std::string& driverId, const Request& req);
};

class Director : public Person {
public:
    std::string companyName;
    int clearanceLevel;

    Director() : Person(), clearanceLevel(0) {}
    Director(std::string id, std::string name, std::string email, std::string pass, std::string phone,
        std::string company, int clearance)
        : Person(id, name, email, pass, phone, "DIRECTOR"),
        companyName(company), clearanceLevel(clearance) {
    }

    void addManager(StorageManager& db, const Manager& m);
    void createWarehouse(StorageManager& db, const Warehouse& w);
};

// === ТИПІЗАЦІЯ МАП (Повертаємо те, що я випадково видалив) ===
typedef std::shared_mutex SharedMutex;
typedef std::unordered_map<int, Warehouse> WarehouseMap;
typedef std::unordered_map<unsigned int, Request> RequestMap;
typedef std::unordered_map<std::string, Manager> ManagerMap;
typedef std::unordered_map<std::string, Director> DirectorMap;
typedef std::unordered_map<std::string, Dispatcher> DispatcherMap;
typedef std::unordered_map<std::string, Driver> DriverMap;

// === ГОЛОВНИЙ КЛАС БД ===
class StorageManager {
private:
    WarehouseMap warehouses;
    RequestMap requests;
    ManagerMap managers;
    DirectorMap directors;
    DispatcherMap dispatchers;
    DriverMap drivers;
    sqlite3* localDB;
    PGconn* conn;

    mutable SharedMutex warehouseMutex;
    mutable SharedMutex requestMutex;
    mutable SharedMutex peopleMutex;

public:
    StorageManager();
    ~StorageManager();
    void testConnection();

    // Авторизація та Реєстрація
    void registerAccount(const std::string& id, const std::string& email, const std::string& phone, const std::string& password, const std::string& role, const std::string& name = "New User");
    std::string login(const std::string& email, const std::string& password);
    void logout(const std::string& userId, const std::string& role);

    // Гетери
    std::vector<Driver> getOnlineDrivers() const;
    std::vector<Person> getAllOnlineStaff() const;
    std::vector<Request> getSortedRequests() const;
    std::vector<std::shared_ptr<Warehouse>> getWarehousesList() const;

    // Внутрішні методи запису
    void internalAddManager(const Manager& m);
    void internalAddDispatcher(const Dispatcher& d);
    void internalAddDriver(const Driver& d);
    void internalAddRequest(const Request& r);
    void internalAssignRoute(const std::string& driverId, const Request& req);
    void internalUpdateManagerLocation(const std::string& managerId, double px, double py);
    void internalAddWarehouse(const Warehouse& w);
    void internalAddDirector(const Director& d);
    std::unordered_map<std::string, std::string> getUserAuthData(const std::string& email);

    const Person* getPersonById(const std::string& personId) const;
    void castPersonByRole(const Person* person) const;

    // Синхронізація
    void syncOfflineData();
    void loadFromSQL();
};
