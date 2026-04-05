#pragma once
#include <iostream>
#include <cmath>
#include <queue>
#include <vector>
#include <cstdint>
#include <unordered_map>
#include <chrono>
#include <string>
#include <memory>

// Define Warehouse ONCE at the top
struct Warehouse {
    int id;
    double px;
    double py;
    std::unordered_map<std::string, int> inventory;
};

// Now RouteResult can safely use Warehouse
struct RouteResult {
    bool isFound;
    std::shared_ptr<Warehouse> optimalWarehouse;
    double totalDistance;
    double straightDistance;
};

enum class Priority {
    NORMAL = 0,
    HIGH = 1,
    CRITICAL = 2
};

// Define Request ONCE
struct Request {
    unsigned int id;
    int64_t timestamp;
    Priority priority;
    std::string itemNeeded;
    double px;
    double py;
    double targetPx;
    double targetPy;
    int currentLoad;
    float itemWeight;
    int maxCapacity;
};

class GeoMath {
public:
    static double calculateDistance(double ax1, double ay1, double bx1, double by1);
};

class PriorityManager {
public:
    void addRequest(const Request& req);
    Request getTopRequest();
    bool hasRequests();
};

double getDeviationFactor(Priority p);

class ResourceFinder {
public:
    // Notice I changed the return type to RouteResult to match your Python_include.cpp
    // and removed 'static' to match your def(py::init<>()) in python binding.
    RouteResult findBestPath(const Request& req, const std::vector<std::shared_ptr<Warehouse>>& allWarehouses);
};