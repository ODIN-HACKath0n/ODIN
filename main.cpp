#include <iostream>
#include <string>
#include "Storage_Manager.hpp"
#include <windows.h>
#include <random>

std::string readLine(const std::string& msg = "") {
    if (!msg.empty()) std::cout << msg;
    std::string line;
    std::getline(std::cin, line);
    return line;
}

const std::vector<std::string> TRUCK_FLEET = {
    "TRUCK-000", "TRUCK-001", "TRUCK-002", "TRUCK-003", "TRUCK-004", "TRUCK-005"
};

void addDirectorUI(StorageManager& db) {
    Director d;
    std::cout << "\n--- Реєстрація Директора ---" << std::endl;
    d.id          = readLine("ID: ");
    d.name        = readLine("Ім'я: ");
    d.email       = readLine("Email: ");
    d.phone       = readLine("Телефон: ");
    d.companyName = readLine("Компанія: ");
    std::cout << "Рівень доступу (1-5): ";
    std::cin >> d.clearanceLevel;
    std::cin.ignore(10000, '\n');
    d.role = "DIRECTOR";
    d.isOnline = true;
    db.registerAccount(d.id, d.email, d.phone, d.password, "DIRECTOR", d.name);
    std::cout << "[OK] Директор доданий!" << std::endl;
}

void addManagerUI(StorageManager& db) {
    Manager m;
    std::cout << "\n--- Реєстрація Менеджера ---" << std::endl;
    m.id            = readLine("ID: ");
    m.name          = readLine("Ім'я: ");
    m.email         = readLine("Email: ");
    m.phone         = readLine("Телефон: ");
    m.department    = readLine("Відділ: ");
    m.managedRegion = readLine("Регіон: ");
    m.managedById   = readLine("ID Директора (керівника): ");
    m.role = "MANAGER";
    m.isOnline = true;
    db.registerAccount(m.id, m.email, m.phone, m.password, "MANAGER", m.name);
    std::cout << "[OK] Менеджер доданий!" << std::endl;
}

void addDispatcherUI(StorageManager& db) {
    Dispatcher disp;
    std::cout << "\n--- Реєстрація Диспетчера ---" << std::endl;
    disp.id          = readLine("ID: ");
    disp.name        = readLine("Ім'я: ");
    disp.email       = readLine("Email: ");
    disp.phone       = readLine("Телефон: ");
    disp.managedById = readLine("ID Менеджера (керівника): ");
    disp.role = "DISPATCHER";
    disp.isOnline = true;
    db.registerAccount(disp.id, disp.email, disp.phone, disp.password, "DISPATCHER", disp.name);
    std::cout << "[OK] Диспетчер доданий!" << std::endl;
}

void addDriverUI(StorageManager& db) {
    Driver drv;
    std::cout << "\n--- Реєстрація Водія ---" << std::endl;
    drv.id          = readLine("ID: ");
    drv.name        = readLine("Ім'я: ");
    drv.email       = readLine("Email: ");
    drv.phone       = readLine("Телефон: ");
    drv.licenseType = readLine("Категорія прав (A/B/C/D): ");
    std::cout << "Стаж (років): ";
    std::cin >> drv.experienceYears;
    std::cout << "Вантажопідйомність (кг): ";
    std::cin >> drv.maxCapacity;
    std::cin.ignore(10000, '\n'); 
    drv.managedById = readLine("ID Менеджера: ");

    srand(static_cast<unsigned int>(time(0)));
    drv.assignedTruckId = TRUCK_FLEET[rand() % TRUCK_FLEET.size()];
    std::cout << "[СИСТЕМА] Водію призначено вантажівку: " << drv.assignedTruckId << std::endl;

    drv.role = "DRIVER";
    drv.status = "IDLE";
    drv.isOnline = true;
    drv.currentLoad = 0;
    db.registerAccount(drv.id, drv.email, drv.phone, drv.password, "DRIVER", drv.name);

    std::cout << "[OK] Водій успішно доданий!" << std::endl;
}

int main() {
    SetConsoleCP(65001);
    SetConsoleOutputCP(65001);

    StorageManager db;
    db.testConnection();

    int choice = -1;
    while (choice != 0) {
        std::cout << "\n========== Меню ==========" << std::endl;
        std::cout << "1. Додати директора"   << std::endl;
        std::cout << "2. Додати менеджера"   << std::endl;
        std::cout << "3. Додати диспетчера"  << std::endl;
        std::cout << "4. Додати водія"       << std::endl;
        std::cout << "0. Вийти"             << std::endl;
        std::cout << "==========================" << std::endl;
        std::cout << "Ваш вибір: ";

        if (!(std::cin >> choice)) {
            std::cin.clear();
            std::cin.ignore(10000, '\n');
            std::cout << "Невірний вибір!" << std::endl;
            continue;
        }
        std::cin.ignore(10000, '\n'); 

        switch (choice) {
        case 1: addDirectorUI(db);   break;
        case 2: addManagerUI(db);    break;
        case 3: addDispatcherUI(db); break;
        case 4: addDriverUI(db);     break;
        case 0: std::cout << "Завершення роботи..." << std::endl; break;
        default: std::cout << "Невірний вибір!" << std::endl;
        }
    }

    return 0;
}
