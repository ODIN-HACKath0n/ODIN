#include "Storage_Manager.hpp"
#include <iostream>
#include <algorithm>
#include <vector>

typedef std::shared_lock<SharedMutex> SharedLock;
typedef std::unique_lock<SharedMutex> UniqueLock;

// === МЕТОДИ ВОДІЯ ===
void Driver::takeTruck(StorageManager& db, const std::string& truckId) {
    db.internalAssignRoute(this->id, Request{});
    this->assignedTruckId = truckId;
    this->status = "ON_ROUTE";
}

// === МЕТОДИ ДИСПЕТЧЕРА ===
void Dispatcher::createRequest(StorageManager& db, const Request& r) {
    db.internalAddRequest(r);
}

void Dispatcher::assignRouteToDriver(StorageManager& db, const std::string& driverId, const Request& req) {
    db.internalAssignRoute(driverId, req);
}

// === МЕТОДИ МЕНЕДЖЕРА ===
void Manager::addDispatcher(StorageManager& db, const Dispatcher& d) {
    db.internalAddDispatcher(d);
}

void Manager::addDriver(StorageManager& db, const Driver& d) {
    db.internalAddDriver(d);
}

void Manager::updateLocation(StorageManager& db, double newPx, double newPy) {
    db.internalUpdateManagerLocation(this->id, newPx, newPy);
    this->px = newPx;
    this->py = newPy;
}

bool Manager::assignTransportation(StorageManager& db, const std::string& driverId, const Request& req) {
    auto allWh = db.getWarehousesList();

    // Менеджер використовує алгоритм пошуку
    auto bestWh = ResourceFinder::findBestPath(req, allWh);
    
    if (bestWh != nullptr) {
        std::cout << "[МЕНЕДЖЕР " << this->name << "] Знайдено найкращий склад (ID: "
            << bestWh->id << ") для товару '" << req.itemNeeded << "'. Відправляю водія!" << std::endl;

        db.internalAssignRoute(driverId, req);
        return true;
    }
    else {
        std::cout << "[МЕНЕДЖЕР " << this->name << "] Увага! Не знайдено складу з товаром '"
            << req.itemNeeded << "' або бракує місця у вантажівці." << std::endl;
        return false;
    }
}

// === МЕТОДИ ДИРЕКТОРА ===
void Director::addManager(StorageManager& db, const Manager& m) {
    db.internalAddManager(m);
}

void Director::createWarehouse(StorageManager& db, const Warehouse& w) {
    db.internalAddWarehouse(w);
}

// === STORAGE MANAGER (Конструктор та Деструктор) ===
StorageManager::StorageManager() {
    // 1. Підключення до PostgreSQL
    const char* conninfo = "host=localhost port=5432 dbname=logistics_db user=postgres password=2805";
    conn = PQconnectdb(conninfo);

    if (PQstatus(conn) != CONNECTION_OK) {
        std::cerr << "[ГЛОБАЛЬНА БД] Немає зв'язку: " << PQerrorMessage(conn) << std::endl;
        PQfinish(conn);
        conn = nullptr;
    }
    else {
        PQsetClientEncoding(conn, "UTF8");
        loadFromSQL();
    }

    // 2. Підключення до SQLite (створення офлайн-таблиць)
    int rc = sqlite3_open("offline_data.db", &localDB);
    if (rc) {
        std::cerr << "[ЛОКАЛЬНА БД] Помилка: " << sqlite3_errmsg(localDB) << std::endl;
    }
    else {
        std::string sql =
            "CREATE TABLE IF NOT EXISTS offline_users (id TEXT PRIMARY KEY, email TEXT, pass TEXT, name TEXT, phone TEXT, role TEXT, mid TEXT);"
            "CREATE TABLE IF NOT EXISTS offline_driver_profiles (uid TEXT, truck TEXT, status TEXT, license TEXT, exp INTEGER, max_c INTEGER, cur_l INTEGER);"
            "CREATE TABLE IF NOT EXISTS offline_manager_profiles (uid TEXT, dept TEXT, region TEXT, px REAL, py REAL);"
            "CREATE TABLE IF NOT EXISTS offline_director_profiles (uid TEXT, company TEXT, clearance INTEGER);";

        sqlite3_exec(localDB, sql.c_str(), 0, 0, 0);
    }

    // 3. ОСЬ ТУТ МИ ЇЇ ВИКЛИКАЄМО!
    // Синхронізуємо тільки якщо ОБИДВІ бази успішно підключені
    if (conn != nullptr && localDB != nullptr) {
        syncOfflineData();
    }
}

StorageManager::~StorageManager() {
    if (conn != nullptr) {
        PQfinish(conn);
    }
    if (localDB != nullptr) {
        sqlite3_close(localDB);
    }
}

// === STORAGE MANAGER (Інші методи) ===
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

std::vector<std::shared_ptr<Warehouse>> StorageManager::getWarehousesList() const {
    SharedLock lock(warehouseMutex);
    std::vector<std::shared_ptr<Warehouse>> list;
    for (const auto& [id, w] : warehouses) {
        list.push_back(std::make_shared<Warehouse>(w));
    }
    return list;
}

// === ВНУТРІШНІ МЕТОДИ SQL ===
void StorageManager::internalAddManager(const Manager& m) {
    {
        UniqueLock lock(peopleMutex);
        managers[m.id] = m;
    }

    if (conn != nullptr) {
        // 1. Спільна таблиця
        std::string sqlUser = "INSERT INTO users (id, email, password_hash, name, phone, role, managed_by_id) VALUES ('" +
            m.id + "', '" + m.email + "', '" + m.password + "', '" + m.name + "', '" + m.phone + "', 'MANAGER', '" + m.managedById + "') " +
            "ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;";
        PQclear(PQexec(conn, sqlUser.c_str()));

        // 2. Профіль менеджера
        std::string sqlProf = "INSERT INTO manager_profiles (user_id, department, managed_region, px, py) VALUES ('" +
            m.id + "', '" + m.department + "', '" + m.managedRegion + "', " + std::to_string(m.px) + ", " + std::to_string(m.py) + ") " +
            "ON CONFLICT (user_id) DO UPDATE SET department = EXCLUDED.department;";
        PQclear(PQexec(conn, sqlProf.c_str()));
    }
    else if (localDB != nullptr) {
        std::string s1 = "INSERT INTO offline_users VALUES ('" + m.id + "','" + m.email + "','" + m.password + "','" + m.name + "','" + m.phone + "','MANAGER','" + m.managedById + "');";
        std::string s2 = "INSERT INTO offline_manager_profiles VALUES ('" + m.id + "','" + m.department + "','" + m.managedRegion + "'," + std::to_string(m.px) + "," + std::to_string(m.py) + ");";
        sqlite3_exec(localDB, s1.c_str(), 0, 0, 0);
        sqlite3_exec(localDB, s2.c_str(), 0, 0, 0);
    }
}

void StorageManager::internalAddDispatcher(const Dispatcher& d) {
    {
        UniqueLock lock(peopleMutex);
        dispatchers[d.id] = d;
    }

    if (conn != nullptr) {
        std::string sql = "INSERT INTO users (id, email, password_hash, name, phone, role, managed_by_id) VALUES ('" +
            d.id + "', '" + d.email + "', '" + d.password + "', '" + d.name + "', '" + d.phone + "', 'DISPATCHER', '" + d.managedById + "') " +
            "ON CONFLICT (id) DO UPDATE SET managed_by_id = EXCLUDED.managed_by_id;";
        PQclear(PQexec(conn, sql.c_str()));
    }
    else if (localDB != nullptr) {
        std::string sql = "INSERT INTO offline_users VALUES ('" + d.id + "','" + d.email + "','" + d.password + "','" + d.name + "','" + d.phone + "','DISPATCHER','" + d.managedById + "');";
        sqlite3_exec(localDB, sql.c_str(), 0, 0, 0);
    }
}

void StorageManager::internalAddDriver(const Driver& d) {
    {
        UniqueLock lock(peopleMutex);
        drivers[d.id] = d;
    }

    if (conn != nullptr) {
        // 1. Запис у USERS (Фундамент)
        std::string sqlUser = "INSERT INTO users (id, email, password_hash, name, phone, role, managed_by_id) VALUES ('" +
            d.id + "', '" + d.email + "', '" + d.password + "', '" + d.name + "', '" + d.phone + "', 'DRIVER', '" + d.managedById + "') " +
            "ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone;";
        PQclear(PQexec(conn, sqlUser.c_str()));

        // 2. Запис у DRIVER_PROFILES (Специфіка)
        std::string sqlProfile = "INSERT INTO driver_profiles (user_id, assigned_truck_id, status, license_type, experience_years, max_capacity, current_load) VALUES ('" +
            d.id + "', '" + d.assignedTruckId + "', '" + d.status + "', '" + d.licenseType + "', " +
            std::to_string(d.experienceYears) + ", " + std::to_string(d.maxCapacity) + ", " + std::to_string(d.currentLoad) + ") " +
            "ON CONFLICT (user_id) DO UPDATE SET status = EXCLUDED.status, current_load = EXCLUDED.current_load;";
        PQclear(PQexec(conn, sqlProfile.c_str()));
    }
    else if (localDB != nullptr) {
        // ОФЛАЙН (теж у дві таблиці)
        std::string s1 = "INSERT INTO offline_users VALUES ('" + d.id + "','" + d.email + "','" + d.password + "','" + d.name + "','" + d.phone + "','DRIVER',0,'" + d.managedById + "');";
        std::string s2 = "INSERT INTO offline_driver_profiles VALUES ('" + d.id + "','" + d.assignedTruckId + "','" + d.status + "','" + d.licenseType + "'," + std::to_string(d.experienceYears) + "," + std::to_string(d.maxCapacity) + "," + std::to_string(d.currentLoad) + ");";
        sqlite3_exec(localDB, s1.c_str(), 0, 0, 0);
        sqlite3_exec(localDB, s2.c_str(), 0, 0, 0);
    }
}

void StorageManager::internalAddWarehouse(const Warehouse& w) {
    {
        UniqueLock lock(warehouseMutex);
        warehouses[w.id] = w;
    }
    if (conn == nullptr) return;
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
    PQclear(PQexec(conn, sql.c_str()));
}

void StorageManager::internalAddRequest(const Request& r) {
    {
        UniqueLock lock(requestMutex);
        requests[r.id] = r;
    }
    if (conn == nullptr) return;
    std::string priorityStr = (r.priority == Priority::CRITICAL) ? "CRITICAL" : (r.priority == Priority::HIGH) ? "HIGH" : "NORMAL";

    std::string sql = "INSERT INTO requests (id, timestamp, priority, item_needed, px, py, target_px, target_py, current_load, item_weight, max_capacity) VALUES (" +
        std::to_string(r.id) + ", " + std::to_string(r.timestamp) + ", '" + priorityStr + "', '" + r.itemNeeded + "', " +
        std::to_string(r.px) + ", " + std::to_string(r.py) + ", " + std::to_string(r.targetPx) + ", " + std::to_string(r.targetPy) + ", " +
        std::to_string(r.currentLoad) + ", " + std::to_string(r.itemWeight) + ", " + std::to_string(r.maxCapacity) + ") " +
        "ON CONFLICT (id) DO UPDATE SET priority = EXCLUDED.priority, item_needed = EXCLUDED.item_needed;";
    PQclear(PQexec(conn, sql.c_str()));
}

void StorageManager::internalAddDirector(const Director& d) {
    {
        UniqueLock lock(peopleMutex);
        directors[d.id] = d;
    }

    if (conn != nullptr) {
        // ОНЛАЙН (PostgreSQL) - Явно вказуємо імена колонок!
        std::string sqlUser = "INSERT INTO users (id, email, password_hash, name, phone, role) VALUES ('" +
            d.id + "', '" + d.email + "', '" + d.password + "', '" + d.name + "', '" + d.phone + "', 'DIRECTOR') " +
            "ON CONFLICT (id) DO NOTHING;";
        PQclear(PQexec(conn, sqlUser.c_str()));

        std::string sqlProf = "INSERT INTO director_profiles (user_id, company_name, clearance_level) VALUES ('" +
            d.id + "', '" + d.companyName + "', " + std::to_string(d.clearanceLevel) + ") " +
            "ON CONFLICT (user_id) DO NOTHING;";
        PQclear(PQexec(conn, sqlProf.c_str()));
    }
    else if (localDB != nullptr) {
        // ОФЛАЙН (SQLite)
        // Переконайся, що в таблиці offline_users перша колонка - це ID
        std::string s1 = "INSERT INTO offline_users (id, email, pass, name, phone, role) VALUES ('" +
            d.id + "', '" + d.email + "', '" + d.password + "', '" + d.name + "', '" + d.phone + "', 'DIRECTOR');";

        std::string s2 = "INSERT INTO offline_director_profiles (uid, company, clearance) VALUES ('" +
            d.id + "', '" + d.companyName + "', " + std::to_string(d.clearanceLevel) + ");";

        sqlite3_exec(localDB, s1.c_str(), 0, 0, 0);
        sqlite3_exec(localDB, s2.c_str(), 0, 0, 0);
    }
}

void StorageManager::internalAssignRoute(const std::string& driverId, const Request& req) {
    {
        UniqueLock lock(peopleMutex);
        if (drivers.find(driverId) != drivers.end()) {
            drivers[driverId].status = "ON_ROUTE";
        }
    }
    if (conn == nullptr) return;
    std::string sql = "UPDATE drivers SET status = 'ON_ROUTE' WHERE id = '" + driverId + "';";
    PQclear(PQexec(conn, sql.c_str()));
}

void StorageManager::internalUpdateManagerLocation(const std::string& managerId, double px, double py) {
    {
        UniqueLock lock(peopleMutex);
        if (managers.find(managerId) != managers.end()) {
            managers[managerId].px = px;
            managers[managerId].py = py;
        }
    }
    if (conn == nullptr) return;
    std::string sql = "UPDATE managers SET px = " + std::to_string(px) + ", py = " + std::to_string(py) + " WHERE id = '" + managerId + "';";
    PQclear(PQexec(conn, sql.c_str()));
}

void StorageManager::loadFromSQL() {
    if (conn == nullptr) return;
    UniqueLock lock(peopleMutex);

    // 1. Завантаження ВОДІЇВ (Об'єднуємо users та driver_profiles)
    std::string sqlDr =
        "SELECT u.id, u.name, u.email, u.password_hash, u.phone, u.is_online, "
        "p.assigned_truck_id, p.status, p.license_type, p.experience_years, p.max_capacity, p.current_load, u.managed_by_id "
        "FROM users u "
        "JOIN driver_profiles p ON u.id = p.user_id "
        "WHERE u.role = 'DRIVER';";

    PGresult* resDr = PQexec(conn, sqlDr.c_str());
    if (PQresultStatus(resDr) == PGRES_TUPLES_OK) {
        drivers.clear();
        for (int i = 0; i < PQntuples(resDr); i++) {
            Driver d(
                PQgetvalue(resDr, i, 0),  // id
                PQgetvalue(resDr, i, 1),  // name
                PQgetvalue(resDr, i, 2),  // email
                PQgetvalue(resDr, i, 3),  // password
                PQgetvalue(resDr, i, 4),  // phone
                PQgetvalue(resDr, i, 6),  // truck
                PQgetvalue(resDr, i, 7),  // status
                PQgetvalue(resDr, i, 8),  // license
                std::stoi(PQgetvalue(resDr, i, 9)),  // exp
                std::stoi(PQgetvalue(resDr, i, 10)), // max_cap
                std::stoi(PQgetvalue(resDr, i, 11)), // current_load
                PQgetvalue(resDr, i, 12) // managed_by
            );
            d.isOnline = (std::string(PQgetvalue(resDr, i, 5)) == "t");
            drivers[d.id] = d;
        }
    }
    PQclear(resDr);

    // 2. Завантаження МЕНЕДЖЕРІВ (users + manager_profiles)
    std::string sqlMg =
        "SELECT u.id, u.name, u.email, u.password_hash, u.phone, u.is_online, "
        "p.department, p.managed_region, u.managed_by_id, p.px, p.py "
        "FROM users u "
        "JOIN manager_profiles p ON u.id = p.user_id "
        "WHERE u.role = 'MANAGER';";

    PGresult* resMg = PQexec(conn, sqlMg.c_str());
    if (PQresultStatus(resMg) == PGRES_TUPLES_OK) {
        managers.clear();
        for (int i = 0; i < PQntuples(resMg); i++) {
            Manager m(
                PQgetvalue(resMg, i, 0),
                PQgetvalue(resMg, i, 1),
                PQgetvalue(resMg, i, 2),
                PQgetvalue(resMg, i, 3),
                PQgetvalue(resMg, i, 4),
                PQgetvalue(resMg, i, 6), // dept
                PQgetvalue(resMg, i, 7), // region
                PQgetvalue(resMg, i, 8), // mid
                std::stod(PQgetvalue(resMg, i, 9)), // px
                std::stod(PQgetvalue(resMg, i, 10)) // py
            );
            m.isOnline = (std::string(PQgetvalue(resMg, i, 5)) == "t");
            managers[m.id] = m;
        }
    }
    PQclear(resMg);
}

void StorageManager::syncOfflineData() {
    if (conn == nullptr || localDB == nullptr) return;

    std::cout << "\n[СИНХРОНІЗАЦІЯ] Початок вивантаження даних..." << std::endl;
    sqlite3_stmt* stmt;
    int totalSynced = 0;

    // ==========================================================
    // 1. СИНХРОНІЗАЦІЯ ВОДІЇВ (Users + Driver_Profiles)
    // ==========================================================
    std::string sqlDr = "SELECT u.id, u.email, u.password_hash, u.name, u.phone, u.mid, "
        "p.truck, p.status, p.license, p.exp, p.max_c, p.cur_l "
        "FROM offline_users u "
        "JOIN offline_driver_profiles p ON u.id = p.uid "
        "WHERE u.role = 'DRIVER';";

    if (sqlite3_prepare_v2(localDB, sqlDr.c_str(), -1, &stmt, nullptr) == SQLITE_OK) {
        while (sqlite3_step(stmt) == SQLITE_ROW) {
            // Дані з таблиці users
            std::string id = (const char*)sqlite3_column_text(stmt, 0);
            std::string email = (const char*)sqlite3_column_text(stmt, 1);
            std::string pass = (const char*)sqlite3_column_text(stmt, 2);
            std::string name = (const char*)sqlite3_column_text(stmt, 3);
            std::string phone = (const char*)sqlite3_column_text(stmt, 4);
            std::string mid = (const char*)sqlite3_column_text(stmt, 5);
            // Дані з профілю
            std::string truck = (const char*)sqlite3_column_text(stmt, 6);
            std::string stat = (const char*)sqlite3_column_text(stmt, 7);
            std::string lic = (const char*)sqlite3_column_text(stmt, 8);
            int exp = sqlite3_column_int(stmt, 9);
            int max_c = sqlite3_column_int(stmt, 10);
            int cur_l = sqlite3_column_int(stmt, 11);

            // Крок А: Запис у глобальну users
            std::string q1 = "INSERT INTO users (id, email, password_hash, name, phone, role, managed_by_id) VALUES ('" +
                id + "','" + email + "','" + pass + "','" + name + "','" + phone + "','DRIVER','" + mid + "') ON CONFLICT DO NOTHING;";
            PQclear(PQexec(conn, q1.c_str()));

            // Крок Б: Запис у глобальну driver_profiles
            std::string q2 = "INSERT INTO driver_profiles (user_id, assigned_truck_id, status, license_type, experience_years, max_capacity, current_load) VALUES ('" +
                id + "','" + truck + "','" + stat + "','" + lic + "'," + std::to_string(exp) + "," + std::to_string(max_c) + "," + std::to_string(cur_l) + ") ON CONFLICT DO NOTHING;";
            PQclear(PQexec(conn, q2.c_str()));

            totalSynced++;
        }
        sqlite3_finalize(stmt);
    }

    // ==========================================================
    // 2. СИНХРОНІЗАЦІЯ МЕНЕДЖЕРІВ (Users + Manager_Profiles)
    // ==========================================================
    std::string sqlMg = "SELECT u.id, u.email, u.password_hash, u.name, u.phone, u.mid, "
        "p.dept, p.region, p.px, p.py "
        "FROM offline_users u "
        "JOIN offline_manager_profiles p ON u.id = p.uid "
        "WHERE u.role = 'MANAGER';";

    if (sqlite3_prepare_v2(localDB, sqlMg.c_str(), -1, &stmt, nullptr) == SQLITE_OK) {
        while (sqlite3_step(stmt) == SQLITE_ROW) {
            std::string id = (const char*)sqlite3_column_text(stmt, 0);
            std::string email = (const char*)sqlite3_column_text(stmt, 1);
            std::string pass = (const char*)sqlite3_column_text(stmt, 2);
            std::string name = (const char*)sqlite3_column_text(stmt, 3);
            std::string phone = (const char*)sqlite3_column_text(stmt, 4);
            std::string mid = (const char*)sqlite3_column_text(stmt, 5);
            std::string dept = (const char*)sqlite3_column_text(stmt, 6);
            std::string reg = (const char*)sqlite3_column_text(stmt, 7);
            double px = sqlite3_column_double(stmt, 8);
            double py = sqlite3_column_double(stmt, 9);

            std::string q1 = "INSERT INTO users (id, email, password_hash, name, phone, role, managed_by_id) VALUES ('" +
                id + "','" + email + "','" + pass + "','" + name + "','" + phone + "','MANAGER','" + mid + "') ON CONFLICT DO NOTHING;";
            PQclear(PQexec(conn, q1.c_str()));

            std::string q2 = "INSERT INTO manager_profiles (user_id, department, managed_region, px, py) VALUES ('" +
                id + "','" + dept + "','" + reg + "'," + std::to_string(px) + "," + std::to_string(py) + ") ON CONFLICT DO NOTHING;";
            PQclear(PQexec(conn, q2.c_str()));

            totalSynced++;
        }
        sqlite3_finalize(stmt);
    }

    // ==========================================================
    // 3. СИНХРОНІЗАЦІЯ ДИРЕКТОРІВ (Users + Director_Profiles)
    // ==========================================================
    std::string sqlDir = "SELECT u.id, u.email, u.password_hash, u.name, u.phone, "
        "p.company, p.clearance "
        "FROM offline_users u "
        "JOIN offline_director_profiles p ON u.id = p.uid "
        "WHERE u.role = 'DIRECTOR';";

    if (sqlite3_prepare_v2(localDB, sqlDir.c_str(), -1, &stmt, nullptr) == SQLITE_OK) {
        while (sqlite3_step(stmt) == SQLITE_ROW) {
            std::string id = (const char*)sqlite3_column_text(stmt, 0);
            std::string email = (const char*)sqlite3_column_text(stmt, 1);
            std::string pass = (const char*)sqlite3_column_text(stmt, 2);
            std::string name = (const char*)sqlite3_column_text(stmt, 3);
            std::string phone = (const char*)sqlite3_column_text(stmt, 4);
            std::string comp = (const char*)sqlite3_column_text(stmt, 5);
            int clear = sqlite3_column_int(stmt, 6);

            std::string q1 = "INSERT INTO users (id, email, password_hash, name, phone, role) VALUES ('" +
                id + "','" + email + "','" + pass + "','" + name + "','" + phone + "','DIRECTOR') ON CONFLICT DO NOTHING;";
            PQclear(PQexec(conn, q1.c_str()));

            std::string q2 = "INSERT INTO director_profiles (user_id, company_name, clearance_level) VALUES ('" +
                id + "','" + comp + "'," + std::to_string(clear) + ") ON CONFLICT DO NOTHING;";
            PQclear(PQexec(conn, q2.c_str()));

            totalSynced++;
        }
        sqlite3_finalize(stmt);
    }

    // ==========================================================
    // 4. СИНХРОНІЗАЦІЯ ДИСПЕТЧЕРІВ (Тільки Users)
    // ==========================================================
    std::string sqlDisp = "SELECT id, email, password_hash, name, phone, mid FROM offline_users WHERE role = 'DISPATCHER';";
    if (sqlite3_prepare_v2(localDB, sqlDisp.c_str(), -1, &stmt, nullptr) == SQLITE_OK) {
        while (sqlite3_step(stmt) == SQLITE_ROW) {
            std::string id = (const char*)sqlite3_column_text(stmt, 0);
            std::string email = (const char*)sqlite3_column_text(stmt, 1);
            std::string pass = (const char*)sqlite3_column_text(stmt, 2);
            std::string name = (const char*)sqlite3_column_text(stmt, 3);
            std::string phone = (const char*)sqlite3_column_text(stmt, 4);
            std::string mid = (const char*)sqlite3_column_text(stmt, 5);

            std::string pg = "INSERT INTO users (id, email, password_hash, name, phone, role, managed_by_id) VALUES ('" +
                id + "','" + email + "','" + pass + "','" + name + "','" + phone + "','DISPATCHER','" + mid + "') ON CONFLICT DO NOTHING;";
            PQclear(PQexec(conn, pg.c_str()));
            totalSynced++;
        }
        sqlite3_finalize(stmt);
    }

    // ОЧИЩЕННЯ ПІСЛЯ УСПІХУ
    if (totalSynced > 0) {
        sqlite3_exec(localDB, "DELETE FROM offline_users; DELETE FROM offline_driver_profiles; DELETE FROM offline_manager_profiles; DELETE FROM offline_director_profiles;", 0, 0, 0);
        std::cout << "[СИНХРОНІЗАЦІЯ] Успішно передано записів: " << totalSynced << std::endl;
    }
    else {
        std::cout << "[СИНХРОНІЗАЦІЯ] Локальна база порожня." << std::endl;
    }
}

void StorageManager::registerAccount(const std::string& id, const std::string& email, const std::string& phone, const std::string& password, const std::string& role, const std::string& name) {
    if (conn == nullptr) return;

    // 1. Запис у головну таблицю USERS
    std::string sqlUser = "INSERT INTO users (id, email, phone, password_hash, role, name, is_online) VALUES ('" +
        id + "', '" + email + "', '" + phone + "', '" + password + "', '" + role + "', '" + name + "', FALSE) " +
        "ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;";

    std::cout << "[DEBUG SQL]: " << sqlUser << std::endl; // ТУТ ТИ ПОБАЧИШ, ЧИ ПРАВИЛЬНИЙ ID

    PGresult* res = PQexec(conn, sqlUser.c_str());
    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        std::cerr << "Помилка таблиці users: " << PQerrorMessage(conn) << std::endl;
        PQclear(res); return;
    }
    PQclear(res);

    // 2. Створення порожнього профілю
    std::string sqlProf = "";
    if (role == "DRIVER") sqlProf = "INSERT INTO driver_profiles (user_id, status) VALUES ('" + id + "', 'IDLE') ON CONFLICT DO NOTHING;";
    else if (role == "MANAGER") sqlProf = "INSERT INTO manager_profiles (user_id) VALUES ('" + id + "') ON CONFLICT DO NOTHING;";
    else if (role == "DIRECTOR") sqlProf = "INSERT INTO director_profiles (user_id) VALUES ('" + id + "') ON CONFLICT DO NOTHING;";

    if (!sqlProf.empty()) PQclear(PQexec(conn, sqlProf.c_str()));
}

std::string StorageManager::login(const std::string& email, const std::string& password) {
    if (conn == nullptr) return "ERROR";

    std::string sql = "SELECT id, password_hash, role FROM users WHERE email = '" + email + "';";
    PGresult* res = PQexec(conn, sql.c_str());

    if (PQntuples(res) == 0) {
        PQclear(res); return "USER_NOT_FOUND";
    }

    std::string dbPass = PQgetvalue(res, 0, 1);
    std::string role = PQgetvalue(res, 0, 2);
    std::string uid = PQgetvalue(res, 0, 0);
    PQclear(res);

    if (dbPass != password) return "WRONG_PASSWORD";

    // Оновлюємо статус
    PQclear(PQexec(conn, ("UPDATE users SET is_online = TRUE WHERE id = '" + uid + "';").c_str()));
    return role;
}

void StorageManager::logout(const std::string& userId, const std::string& role) {
    if (conn != nullptr) {
        // Оновлюємо статус у глобальній БД
        std::string sql = "UPDATE users SET is_online = FALSE WHERE id = '" + userId + "';";
        PQclear(PQexec(conn, sql.c_str()));
    }

    // Оновлюємо локальні мапи (тепер змінні conn, drivers, peopleMutex будуть знайдені)
    {
        UniqueLock lock(peopleMutex);
        if (role == "DRIVER" && drivers.count(userId)) drivers[userId].isOnline = false;
        else if (role == "MANAGER" && managers.count(userId)) managers[userId].isOnline = false;
        else if (role == "DISPATCHER" && dispatchers.count(userId)) dispatchers[userId].isOnline = false;
        else if (role == "DIRECTOR" && directors.count(userId)) directors[userId].isOnline = false;
    }
    std::cout << "[AUTH] Користувач " << userId << " вийшов із системи." << std::endl;
}
