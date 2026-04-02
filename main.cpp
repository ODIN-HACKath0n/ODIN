#include <iostream>
#include <string>
#include "StorageManager.hpp"
#include <windows.h>

// Допоміжна функція для очищення буфера
void clearInput() {
    std::cin.clear();
    std::cin.ignore(10000, '\n');
}

// --- ФУНКЦІЇ ВВОДУ ---

void addDirectorUI(StorageManager& db) {
    Director d;
    std::cout << "\n--- Реєстрація Директора ---" << std::endl;
    std::cout << "ID: "; std::cin >> d.id; clearInput();
    std::cout << "Ім'я: "; std::getline(std::cin, d.name);
    std::cout << "Email: "; std::cin >> d.email;
    std::cout << "Телефон: "; std::cin >> d.phone;
    std::cout << "Компанія: "; clearInput(); std::getline(std::cin, d.companyName);
    std::cout << "Рівень доступу (1-5): "; std::cin >> d.clearanceLevel;
    d.role = "DIRECTOR"; d.isOnline = true;
    db.internalAddDirector(d);
    std::cout << "[OK] Директор доданий!" << std::endl;
}

void addManagerUI(StorageManager& db) {
    Manager m;
    std::cout << "\n--- Реєстрація Менеджера ---" << std::endl;
    std::cout << "ID: "; std::cin >> m.id; clearInput();
    std::cout << "Ім'я: "; std::getline(std::cin, m.name);
    std::cout << "Email: "; std::cin >> m.email;
    std::cout << "Телефон: "; std::cin >> m.phone;
    std::cout << "Відділ: "; clearInput(); std::getline(std::cin, m.department);
    std::cout << "Регіон: "; std::getline(std::cin, m.managedRegion);
    std::cout << "ID Директора (керівника): "; std::cin >> m.managedById;
    m.role = "MANAGER"; m.isOnline = true;
    db.internalAddManager(m);
    std::cout << "[OK] Менеджер доданий!" << std::endl;
}

void addDispatcherUI(StorageManager& db) {
    Dispatcher disp;
    std::cout << "\n--- Реєстрація Диспечера ---" << std::endl;
    std::cout << "ID: "; std::cin >> disp.id; clearInput();
    std::cout << "Ім'я: "; std::getline(std::cin, disp.name);
    std::cout << "Email: "; std::cin >> disp.email;
    std::cout << "Телефон: "; std::cin >> disp.phone;
    std::cout << "ID Менеджера (керівника): "; std::cin >> disp.managedById;
    disp.role = "DISPATCHER"; disp.isOnline = true;
    db.internalAddDispatcher(disp);
    std::cout << "[OK] Диспечер доданий!" << std::endl;
}

void addDriverUI(StorageManager& db) {
    Driver drv;
    std::cout << "\n--- Реєстрація Водія ---" << std::endl;
    std::cout << "ID: "; std::cin >> drv.id; clearInput();
    std::cout << "Ім'я: "; std::getline(std::cin, drv.name);
    std::cout << "Email: "; std::cin >> drv.email;
    std::cout << "Телефон: "; std::cin >> drv.phone;
    std::cout << "Категорія прав: "; std::cin >> drv.licenseType;
    std::cout << "Стаж: "; std::cin >> drv.experienceYears;
    std::cout << "Вантажопідйомність (кг): "; std::cin >> drv.maxCapacity;
    std::cout << "ID Менеджера: "; std::cin >> drv.managedById;
    drv.role = "DRIVER"; drv.status = "IDLE"; drv.isOnline = true;
    db.internalAddDriver(drv);
    std::cout << "[OK] Водій доданий!" << std::endl;
}

// --- ГОЛОВНЕ МЕНЮ ---

int main() {
    SetConsoleCP(65001);
    SetConsoleOutputCP(65001);
    
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);
    
    StorageManager db;
    db.testConnection();

    int choice = -1;
    while (choice != 0) {
        std::cout << "\n========== Menu ==========" << std::endl;
        std::cout << "1. Add director" << std::endl;
        std::cout << "2. Add manager" << std::endl;
        std::cout << "3. Add Dispatcher" << std::endl;
        std::cout << "4. Add driver" << std::endl;
        std::cout << "0. Exit" << std::endl;
        std::cout << "============================================" << std::endl;
        std::cout << "Your choice: ";

        if (!(std::cin >> choice)) {
            clearInput();
            continue;
        }

        switch (choice) {
        case 1: addDirectorUI(db); break;
        case 2: addManagerUI(db); break;
        case 3: addDispatcherUI(db); break;
        case 4: addDriverUI(db); break;
        case 0: std::cout << "Ending work..." << std::endl; break;
        default: std::cout << "Wrong choice!" << std::endl;
        }
    }

    return 0;
}