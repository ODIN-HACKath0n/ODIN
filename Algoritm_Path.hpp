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

enum class Priority {
    NORMAL = 0,
    HIGH = 1,
    CRITICAL = 2
};

typedef struct {
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
} Request;

typedef struct {
    int id;
    double px;
    double py;
    std::unordered_map<std::string, int> inventory;
} Warehouse;

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
    static std::shared_ptr<Warehouse> findBestPath(const Request& req, const std::vector<std::shared_ptr<Warehouse>>& allWarehouses);
};
