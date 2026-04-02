#pragma once

#include<iostream>
#include<cmath>
#include<queue>
#include<vector>
#include<cstdint>
#include<unordered_map>
#include<chrono>
#include<memory>
#include<string>

enum class Priority {
	NORMAL = 0,
	HIGH = 1,
	CRITICAL = 2
};

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
	int itemWeight;
	int maxCapacity;
};

struct Warehouse {
	int id;
	double px;
	double py;
	std::unordered_map<std::string, int> inventory;
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

class ResourceFinder {
public:
	static std::shared_ptr<Warehouse> findBestPath(
		const Request& req,
		const std::vector<std::shared_ptr<Warehouse>>& allWarehouses
	);
};

double getDeviationFactor(Priority p);