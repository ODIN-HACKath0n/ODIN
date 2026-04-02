#include<iostream>
#include<cmath>
#include<queue>
#include<vector>
#include<cstdint>
#include<math.h>
#include<unordered_map>
#include<chrono>

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
	double targetPy;      // ВИПРАВЛЕНО: було targetPY
	int currentLoad;      // ДОДАНО
	float itemWeight;     // ДОДАНО
	int maxCapacity;      // ДОДАНО
}Request;

typedef struct{
	int id;
	double px;
	double py;
	std::unordered_map<std::string, int> inventory; // ВИПРАВЛЕНО: було invertory
}Warehouse;

class GeoMath {
public:
	static double claculateDistance(double ax1, double ay1, double bx1, double by1);
};

class PriorityManager {
public:
	void addRequest(const Request& req);
	Request getTopRequest();
	bool hasRequests();
};

class ResourceFinder {
public:
	static std::shared_ptr<Warehouse> findBestPath(double ax1, double ay1, const std::string& itemNeeded, std::vector<std::shared_ptr<Warehouse>>& allWareHousse);
};
