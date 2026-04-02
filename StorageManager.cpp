#include "StorageManager.hpp"
#include <iostream>
#include <filesystem>
#include <algorithm>
#include <vector>

typedef std::shared_lock<SharedMutex> SharedLock;
typedef std::unique_lock<SharedMutex> UniqueLock;

void Driver::takeTruck(StorageManager& db, const std::string& truckId) {
    db.internalAssignRoute(this->id, Request{});
    this->assignedTruckId = truckId;
    this->status = "ON_ROUTE";
}

void Driver::updateLocation(StorageManager& db, double newPx, double newPy) {
    db.internalUpdateDriverLocation(this->id, newPx, newPy);
    this->px = newPx;
    this->py = newPy;
}

void Dispatcher::createRequest(StorageManager& db, const Request& r) {
    db.internalAddRequest(r);
}

void Dispatcher::assignRouteToDriver(StorageManager& db, const std::string& driverId, const Request& req) {
    db.internalAssignRoute(driverId, req);
}

void Manager::addDispatcher(StorageManager& db, const Dispatcher& d) {
    db.internalAddDispatcher(d);
}

void Manager::addDriver(StorageManager& db, const Driver& d) {
    db.internalAddDriver(d);
}

void Director::addManager(StorageManager& db, const Manager& m) {
    db.internalAddManager(m);
}

void Director::createWarehouse(StorageManager& db, const Warehouse& w) {
    db.internalAddWarehouse(w);
}

// ВИПРАВЛЕНО: конструктор тепер правильно обробляє невдале з'єднання
StorageManager::StorageManager() {
    const char* conninfo = "host=localhost port=5432 dbname=logistics_db user=postgres password=2805";
    conn = PQconnectdb(conninfo);

    if (PQstatus(conn) != CONNECTION_OK) {
        std::cerr << "[DB ERROR] " << PQerrorMessage(conn) << std::endl;
        PQfinish(conn);
        conn = nullptr; // ВИПРАВЛЕНО: позначаємо що conn недійсний
    }
    else {
        PQsetClientEncoding(conn, "UTF8");
    }

    loadFromDiskBinary();

    if (conn != nullptr) { // ВИПРАВЛЕНО: SQL тільки якщо з'єднання є
        loadFromSQL();
    }

    backgroundSaver = std::thread(&StorageManager::saverLoop, this);
}

StorageManager::~StorageManager() {
    keepRunning = false;
    if (backgroundSaver.joinable()) {
        backgroundSaver.join();
    }
    saveToDiskBinary();

    if (conn != nullptr) {
        PQfinish(conn);
    }
}

void StorageManager::testConnection() {
    const char* conninfo = "host=localhost port=5432 dbname=logistics_db user=postgres password=2805 options='-c client_encoding=UTF8'";
    PGconn* testConn = PQconnectdb(conninfo);

    if (PQstatus(testConn) != CONNECTION_OK) {
        std::cerr << "[DB ERROR] " << PQerrorMessage(testConn) << std::endl;
    }
    else {
        PGresult* res = PQexec(testConn, "SELECT version();");
        std::cout << PQgetvalue(res, 0, 0) << std::endl;
        PQclear(res);
    }
    PQfinish(testConn);
}

void StorageManager::registerAccount(const std::string& id, const std::string& email, const std::string& phone) {
    if (conn == nullptr) return; // ВИПРАВЛЕНО
    std::string sql = "INSERT INTO users (id, email, phone, is_online) VALUES ('" +
        id + "', '" + email + "', '" + phone + "', TRUE) ON CONFLICT DO NOTHING;";
    PGresult* res = PQexec(conn, sql.c_str());
    PQclear(res);
}

std::vector<Driver> StorageManager::getOnlineDrivers() const {
    SharedLock lock(peopleMutex);
    std::vector<Driver> onlineDrivers;
    for (const auto& [id, d] : drivers) {
        if (d.isOnline) onlineDrivers.push_back(d);
    }
    return onlineDrivers;
}

std::vector<Person> StorageManager::getAllOnlineStaff() const {
    SharedLock lock(peopleMutex);
    std::vector<Person> onlineStaff;

    for (const auto& [id, d] : directors) if (d.isOnline) onlineStaff.push_back(d);
    for (const auto& [id, m] : managers) if (m.isOnline) onlineStaff.push_back(m);
    for (const auto& [id, d] : dispatchers) if (d.isOnline) onlineStaff.push_back(d);
    for (const auto& [id, d] : drivers) if (d.isOnline) onlineStaff.push_back(d);

    return onlineStaff;
}

std::vector<Request> StorageManager::getSortedRequests() const {
    SharedLock lock(requestMutex);
    std::vector<Request> sorted;
    for (const auto& [id, r] : requests) {
        sorted.push_back(r);
    }
    std::sort(sorted.begin(), sorted.end(), [](const Request& a, const Request& b) {
        if (a.priority != b.priority) return a.priority > b.priority;
        return a.timestamp < b.timestamp;
        });
    return sorted;
}

void StorageManager::internalAddManager(const Manager& m) {
    {
        UniqueLock lock(peopleMutex);
        managers[m.id] = m;
    }
    if (conn == nullptr) return; // ВИПРАВЛЕНО
    std::string sql = "INSERT INTO managers (id, name, email, phone, department, managed_region, managed_by_id) VALUES ('" +
        m.id + "', '" + m.name + "', '" + m.email + "', '" + m.phone + "', '" +
        m.department + "', '" + m.managedRegion + "', '" + m.managedById + "') " +
        "ON CONFLICT (id) DO UPDATE SET department = EXCLUDED.department, managed_region = EXCLUDED.managed_region;";
    PGresult* res = PQexec(conn, sql.c_str());
    PQclear(res);
}

void StorageManager::internalAddDispatcher(const Dispatcher& d) {
    {
        UniqueLock lock(peopleMutex);
        dispatchers[d.id] = d;
    }
    if (conn == nullptr) return; // ВИПРАВЛЕНО
    std::string sql = "INSERT INTO dispatchers (id, name, email, phone, managed_by_id) VALUES ('" +
        d.id + "', '" + d.name + "', '" + d.email + "', '" + d.phone + "', '" + d.managedById + "') " +
        "ON CONFLICT (id) DO UPDATE SET managed_by_id = EXCLUDED.managed_by_id;";
    PGresult* res = PQexec(conn, sql.c_str());
    PQclear(res);
}

void StorageManager::internalAddDriver(const Driver& d) {
    {
        UniqueLock lock(peopleMutex);
        drivers[d.id] = d;
    }
    if (conn == nullptr) {
        std::cerr << "[!] Помилка: Запис у БД неможливий, немає з'єднання!" << std::endl;
        return;
    }

    std::string sql = "INSERT INTO drivers (id, name, email, phone, is_online, assigned_truck_id, status, license_type, experience_years, px, py, max_capacity, current_load, managed_by_id) "
        "VALUES ('" + d.id + "', '" + d.name + "', '" + d.email + "', '" + d.phone + "', " +
        (d.isOnline ? "TRUE" : "FALSE") + ", '" + d.assignedTruckId + "', '" + d.status + "', '" +
        d.licenseType + "', " + std::to_string(d.experienceYears) + ", " +
        std::to_string(d.px) + ", " + std::to_string(d.py) + ", " +
        std::to_string(d.maxCapacity) + ", " + std::to_string(d.currentLoad) + ", '" + d.managedById + "') "
        "ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, px = EXCLUDED.px, py = EXCLUDED.py;";

    PGresult* res = PQexec(conn, sql.c_str());

    // --- ДОДАЙ ЦЕЙ БЛОК ДЛЯ ПЕРЕВІРКИ ---
    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        std::cerr << "[SQL Error] Дані не збережено: " << PQerrorMessage(conn) << std::endl;
    }
    else {
        std::cout << "[SQL OK] Водій збережений у PostgreSQL!" << std::endl;
    }
    // ------------------------------------

    PQclear(res);
}

void StorageManager::internalAddWarehouse(const Warehouse& w) {
    {
        UniqueLock lock(warehouseMutex);
        warehouses[w.id] = w;
    }
    if (conn == nullptr) return; // ВИПРАВЛЕНО
    std::string inventoryJson = "{";
    bool first = true;
    for (const auto& [item, count] : w.inventory) {
        if (!first) inventoryJson += ", ";
        inventoryJson += "\"" + item + "\": " + std::to_string(count);
        first = false;
    }
    inventoryJson += "}";

    std::string sql = "INSERT INTO warehouses (id, px, py, inventory) VALUES (" +
        std::to_string(w.id) + ", " + std::to_string(w.px) + ", " + std::to_string(w.py) + ", '" + inventoryJson + "') " +
        "ON CONFLICT (id) DO UPDATE SET px = EXCLUDED.px, py = EXCLUDED.py, inventory = EXCLUDED.inventory;";
    PGresult* res = PQexec(conn, sql.c_str());
    PQclear(res);
}

void StorageManager::internalAddRequest(const Request& r) {
    {
        UniqueLock lock(requestMutex);
        requests[r.id] = r;
    }
    if (conn == nullptr) return; // ВИПРАВЛЕНО
    std::string priorityStr = (r.priority == Priority::CRITICAL) ? "CRITICAL" : (r.priority == Priority::HIGH) ? "HIGH" : "NORMAL";

    std::string sql = "INSERT INTO requests (id, timestamp, priority, item_needed, px, py, target_px, target_py, current_load, item_weight, max_capacity) VALUES (" +
        std::to_string(r.id) + ", " + std::to_string(r.timestamp) + ", '" + priorityStr + "', '" + r.itemNeeded + "', " +
        std::to_string(r.px) + ", " + std::to_string(r.py) + ", " + std::to_string(r.targetPx) + ", " + std::to_string(r.targetPy) + ", " +
        std::to_string(r.currentLoad) + ", " + std::to_string(r.itemWeight) + ", " + std::to_string(r.maxCapacity) + ") " +
        "ON CONFLICT (id) DO UPDATE SET priority = EXCLUDED.priority, item_needed = EXCLUDED.item_needed;";
    PGresult* res = PQexec(conn, sql.c_str());
    PQclear(res);
}

void StorageManager::internalAddDirector(const Director& d) {
    {
        UniqueLock lock(peopleMutex);
        directors[d.id] = d;
    }
    if (conn == nullptr) return;
    std::string sql = "INSERT INTO directors (id, name, email, phone, company_name, clearance_level) VALUES ('" +
        d.id + "', '" + d.name + "', '" + d.email + "', '" + d.phone + "', '" +
        d.companyName + "', " + std::to_string(d.clearanceLevel) + ") " +
        "ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;";
    PGresult* res = PQexec(conn, sql.c_str());
    PQclear(res);
}

void StorageManager::internalAssignRoute(const std::string& driverId, const Request& req) {
    {
        UniqueLock lock(peopleMutex);
        if (drivers.find(driverId) != drivers.end()) {
            drivers[driverId].status = "ON_ROUTE";
        }
    }
    if (conn == nullptr) return; // ВИПРАВЛЕНО
    std::string sql = "UPDATE drivers SET status = 'ON_ROUTE' WHERE id = '" + driverId + "';";
    PGresult* res = PQexec(conn, sql.c_str());
    PQclear(res);
}

void StorageManager::internalUpdateDriverLocation(const std::string& driverId, double px, double py) {
    {
        UniqueLock lock(peopleMutex);
        if (drivers.find(driverId) != drivers.end()) {
            drivers[driverId].px = px;
            drivers[driverId].py = py;
        }
    }
    if (conn == nullptr) return; // ВИПРАВЛЕНО
    std::string sql = "UPDATE drivers SET px = " + std::to_string(px) + ", py = " + std::to_string(py) + " WHERE id = '" + driverId + "';";
    PGresult* res = PQexec(conn, sql.c_str());
    PQclear(res);
}

void StorageManager::loadFromSQL() {
    if (conn == nullptr) return; // ВИПРАВЛЕНО
    UniqueLock lock(peopleMutex);
    PGresult* res = PQexec(conn, "SELECT id, name, email, phone, is_online, assigned_truck_id, status, license_type, experience_years, px, py, max_capacity, current_load, managed_by_id FROM drivers");
    if (PQresultStatus(res) == PGRES_TUPLES_OK) {
        drivers.clear();
        int rows = PQntuples(res);
        for (int i = 0; i < rows; i++) {
            Driver d;
            d.id = PQgetvalue(res, i, 0);
            d.name = PQgetvalue(res, i, 1);
            d.email = PQgetvalue(res, i, 2);
            d.phone = PQgetvalue(res, i, 3);
            d.isOnline = (std::string(PQgetvalue(res, i, 4)) == "t");
            d.assignedTruckId = PQgetvalue(res, i, 5);
            d.status = PQgetvalue(res, i, 6);
            d.licenseType = PQgetvalue(res, i, 7);
            d.experienceYears = std::stoi(PQgetvalue(res, i, 8));
            d.px = std::stod(PQgetvalue(res, i, 9));
            d.py = std::stod(PQgetvalue(res, i, 10));
            d.maxCapacity = std::stoi(PQgetvalue(res, i, 11));
            d.currentLoad = std::stoi(PQgetvalue(res, i, 12));
            d.managedById = PQgetvalue(res, i, 13);
            d.role = "DRIVER";
            drivers[d.id] = d;
        }
    }
    PQclear(res);
}

void StorageManager::saveToDiskBinary() {
    std::string tmpFile = dbFilename + ".tmp";
    std::ofstream out(tmpFile, std::ios::binary);
    if (!out.is_open()) return;

    auto writeStr = [&out](const std::string& str) {
        size_t size = str.size();
        out.write(reinterpret_cast<const char*>(&size), sizeof(size));
        out.write(str.c_str(), size);
        };
    {
        std::shared_lock<SharedMutex> lock(warehouseMutex);
        size_t wSize = warehouses.size();
        out.write(reinterpret_cast<const char*>(&wSize), sizeof(wSize));
        for (const auto& [id, w] : warehouses) {
            out.write(reinterpret_cast<const char*>(&w.id), sizeof(w.id));
            out.write(reinterpret_cast<const char*>(&w.px), sizeof(w.px));
            out.write(reinterpret_cast<const char*>(&w.py), sizeof(w.py));
            size_t invSize = w.inventory.size();
            out.write(reinterpret_cast<const char*>(&invSize), sizeof(invSize));
            for (const auto& [itemName, count] : w.inventory) {
                writeStr(itemName);
                out.write(reinterpret_cast<const char*>(&count), sizeof(count));
            }
        }
    }

    {
        std::shared_lock<SharedMutex> lock(requestMutex);
        size_t rSize = requests.size();
        out.write(reinterpret_cast<const char*>(&rSize), sizeof(rSize));
        for (const auto& [id, r] : requests) {
            out.write(reinterpret_cast<const char*>(&r.id), sizeof(r.id));
            out.write(reinterpret_cast<const char*>(&r.timestamp), sizeof(r.timestamp));
            out.write(reinterpret_cast<const char*>(&r.priority), sizeof(r.priority));
            writeStr(r.itemNeeded);
            out.write(reinterpret_cast<const char*>(&r.px), sizeof(r.px));
            out.write(reinterpret_cast<const char*>(&r.py), sizeof(r.py));
            out.write(reinterpret_cast<const char*>(&r.targetPx), sizeof(r.targetPx));
            out.write(reinterpret_cast<const char*>(&r.targetPy), sizeof(r.targetPy));
            out.write(reinterpret_cast<const char*>(&r.currentLoad), sizeof(r.currentLoad));
            out.write(reinterpret_cast<const char*>(&r.itemWeight), sizeof(r.itemWeight));
            out.write(reinterpret_cast<const char*>(&r.maxCapacity), sizeof(r.maxCapacity));
        }
    }

    {
        std::shared_lock<SharedMutex> lock(peopleMutex);
        size_t dSize = directors.size();
        out.write(reinterpret_cast<const char*>(&dSize), sizeof(dSize));
        for (const auto& [id, d] : directors) {
            writeStr(d.id); writeStr(d.name); writeStr(d.email); writeStr(d.phone); writeStr(d.role);
            out.write(reinterpret_cast<const char*>(&d.isOnline), sizeof(d.isOnline));
            writeStr(d.companyName);
            out.write(reinterpret_cast<const char*>(&d.clearanceLevel), sizeof(d.clearanceLevel));
        }

        size_t mSize = managers.size();
        out.write(reinterpret_cast<const char*>(&mSize), sizeof(mSize));
        for (const auto& [id, m] : managers) {
            writeStr(m.id); writeStr(m.name); writeStr(m.email); writeStr(m.phone); writeStr(m.role);
            out.write(reinterpret_cast<const char*>(&m.isOnline), sizeof(m.isOnline));
            writeStr(m.department); writeStr(m.managedRegion); writeStr(m.managedById);
        }

        size_t dispSize = dispatchers.size();
        out.write(reinterpret_cast<const char*>(&dispSize), sizeof(dispSize));
        for (const auto& [id, disp] : dispatchers) {
            writeStr(disp.id); writeStr(disp.name); writeStr(disp.email); writeStr(disp.phone); writeStr(disp.role);
            out.write(reinterpret_cast<const char*>(&disp.isOnline), sizeof(disp.isOnline));
            writeStr(disp.managedById);
        }

        size_t drSize = drivers.size();
        out.write(reinterpret_cast<const char*>(&drSize), sizeof(drSize));
        for (const auto& [id, dr] : drivers) {
            writeStr(dr.id); writeStr(dr.name); writeStr(dr.email); writeStr(dr.phone); writeStr(dr.role);
            out.write(reinterpret_cast<const char*>(&dr.isOnline), sizeof(dr.isOnline));
            writeStr(dr.assignedTruckId); writeStr(dr.status); writeStr(dr.licenseType);
            out.write(reinterpret_cast<const char*>(&dr.experienceYears), sizeof(dr.experienceYears));
            out.write(reinterpret_cast<const char*>(&dr.px), sizeof(dr.px));
            out.write(reinterpret_cast<const char*>(&dr.py), sizeof(dr.py));
            out.write(reinterpret_cast<const char*>(&dr.maxCapacity), sizeof(dr.maxCapacity));
            out.write(reinterpret_cast<const char*>(&dr.currentLoad), sizeof(dr.currentLoad));
            writeStr(dr.managedById);
        }
    }

    out.close();
    std::filesystem::rename(tmpFile, dbFilename);
}

void StorageManager::loadFromDiskBinary() {
    std::ifstream in(dbFilename, std::ios::binary);
    if (!in.is_open()) return;

    auto readStr = [&in]() -> std::string {
        size_t size;
        in.read(reinterpret_cast<char*>(&size), sizeof(size));
        std::string str(size, '\0');
        in.read(&str[0], size);
        return str;
        };

    {
        std::unique_lock<SharedMutex> lock(warehouseMutex);
        warehouses.clear();
        size_t wSize;
        if (in.read(reinterpret_cast<char*>(&wSize), sizeof(wSize))) {
            for (size_t i = 0; i < wSize; ++i) {
                Warehouse w;
                in.read(reinterpret_cast<char*>(&w.id), sizeof(w.id));
                in.read(reinterpret_cast<char*>(&w.px), sizeof(w.px));
                in.read(reinterpret_cast<char*>(&w.py), sizeof(w.py));
                size_t invSize;
                in.read(reinterpret_cast<char*>(&invSize), sizeof(invSize));
                for (size_t j = 0; j < invSize; ++j) {
                    std::string itemName = readStr();
                    int count;
                    in.read(reinterpret_cast<char*>(&count), sizeof(count));
                    w.inventory[itemName] = count;
                }
                warehouses[w.id] = w;
            }
        }
    }

    {
        std::unique_lock<SharedMutex> lock(requestMutex);
        requests.clear();
        size_t rSize;
        if (in.read(reinterpret_cast<char*>(&rSize), sizeof(rSize))) {
            for (size_t i = 0; i < rSize; ++i) {
                Request r;
                in.read(reinterpret_cast<char*>(&r.id), sizeof(r.id));
                in.read(reinterpret_cast<char*>(&r.timestamp), sizeof(r.timestamp));
                in.read(reinterpret_cast<char*>(&r.priority), sizeof(r.priority));
                r.itemNeeded = readStr();
                in.read(reinterpret_cast<char*>(&r.px), sizeof(r.px));
                in.read(reinterpret_cast<char*>(&r.py), sizeof(r.py));
                in.read(reinterpret_cast<char*>(&r.targetPx), sizeof(r.targetPx));
                in.read(reinterpret_cast<char*>(&r.targetPy), sizeof(r.targetPy));
                in.read(reinterpret_cast<char*>(&r.currentLoad), sizeof(r.currentLoad));
                in.read(reinterpret_cast<char*>(&r.itemWeight), sizeof(r.itemWeight));
                in.read(reinterpret_cast<char*>(&r.maxCapacity), sizeof(r.maxCapacity));
                requests[r.id] = r;
            }
        }
    }

    {
        std::unique_lock<SharedMutex> lock(peopleMutex);
        directors.clear(); managers.clear(); dispatchers.clear(); drivers.clear();

        size_t dSize;
        if (in.read(reinterpret_cast<char*>(&dSize), sizeof(dSize))) {
            for (size_t i = 0; i < dSize; ++i) {
                Director d;
                d.id = readStr(); d.name = readStr(); d.email = readStr(); d.phone = readStr(); d.role = readStr();
                in.read(reinterpret_cast<char*>(&d.isOnline), sizeof(d.isOnline));
                d.companyName = readStr();
                in.read(reinterpret_cast<char*>(&d.clearanceLevel), sizeof(d.clearanceLevel));
                directors[d.id] = d;
            }
        }

        size_t mSize;
        if (in.read(reinterpret_cast<char*>(&mSize), sizeof(mSize))) {
            for (size_t i = 0; i < mSize; ++i) {
                Manager m;
                m.id = readStr(); m.name = readStr(); m.email = readStr(); m.phone = readStr(); m.role = readStr();
                in.read(reinterpret_cast<char*>(&m.isOnline), sizeof(m.isOnline));
                m.department = readStr(); m.managedRegion = readStr(); m.managedById = readStr();
                managers[m.id] = m;
            }
        }

        size_t dispSize;
        if (in.read(reinterpret_cast<char*>(&dispSize), sizeof(dispSize))) {
            for (size_t i = 0; i < dispSize; ++i) {
                Dispatcher disp;
                disp.id = readStr(); disp.name = readStr(); disp.email = readStr(); disp.phone = readStr(); disp.role = readStr();
                in.read(reinterpret_cast<char*>(&disp.isOnline), sizeof(disp.isOnline));
                disp.managedById = readStr();
                dispatchers[disp.id] = disp;
            }
        }

        size_t drSize;
        if (in.read(reinterpret_cast<char*>(&drSize), sizeof(drSize))) {
            for (size_t i = 0; i < drSize; ++i) {
                Driver dr;
                dr.id = readStr(); dr.name = readStr(); dr.email = readStr(); dr.phone = readStr(); dr.role = readStr();
                in.read(reinterpret_cast<char*>(&dr.isOnline), sizeof(dr.isOnline));
                dr.assignedTruckId = readStr(); dr.status = readStr(); dr.licenseType = readStr();
                in.read(reinterpret_cast<char*>(&dr.experienceYears), sizeof(dr.experienceYears));
                in.read(reinterpret_cast<char*>(&dr.px), sizeof(dr.px));
                in.read(reinterpret_cast<char*>(&dr.py), sizeof(dr.py));
                in.read(reinterpret_cast<char*>(&dr.maxCapacity), sizeof(dr.maxCapacity));
                in.read(reinterpret_cast<char*>(&dr.currentLoad), sizeof(dr.currentLoad));
                dr.managedById = readStr();
                drivers[dr.id] = dr;
            }
        }
    }
}

void StorageManager::saverLoop() {
    while (keepRunning) {
        for (int i = 0; i < 100 && keepRunning; ++i) {
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        }
        if (keepRunning) saveToDiskBinary();
    }
}
