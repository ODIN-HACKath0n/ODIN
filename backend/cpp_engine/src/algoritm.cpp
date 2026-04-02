#include "headerAlgoritm.hpp"
#include<algorithm>

struct RequestCompare {
	bool operator()(const Request& a1, const Request& a2) {
		if (a1.priority != a2.priority) {
			return a1.priority < a2.priority;
		}
		return a1.timestamp > a2.timestamp;
	}
};

static std::priority_queue<Request, std::vector<Request>, RequestCompare> globalQueue;

double GeoMath::calculateDistance(double ax1, double ay1, double bx1, double by1) {
	const double R = 6371.0;
	const double PI = 3.14159265358979323846;
	double lat1 = ax1 * PI / 180.0;
	double lon1 = ay1 * PI / 180.0;
	double lat2 = bx1 * PI / 180.0;
	double lon2 = by1 * PI / 180.0;
	double dtLat = lat2 - lat1;
	double dtLon = lon2 - lon1;
	double a = pow(std::sin(dtLat / 2), 2) +(std::cos(lat1) * std::cos(lat2) * pow(std::sin(dtLon / 2), 2));
	double c = 2 * std::atan2(std::sqrt(a), std::sqrt(1 - a));
	return R * c;
}

void PriorityManager::addRequest(const Request& req) {
	globalQueue.push(req);
}

Request PriorityManager::getTopRequest() {
	Request topReq = globalQueue.top();
	globalQueue.pop();
	return topReq;
}

bool PriorityManager::hasRequests() {
	return !globalQueue.empty();
}

std::shared_ptr<Warehouse> ResourceFinder::findBestPath(const Request& req,const std::vector<std::shared_ptr<Warehouse>>& allWarehouses){
	std::shared_ptr<Warehouse> bestWarehouse = nullptr;
	double straightPath = GeoMath::calculateDistance(req.px, req.py, req.targetPx, req.targetPy);
	double cof = getDeviationFactor(req.priority);
	double maxAllowPath = straightPath * cof;
	double minTotalPath = 1e18;
	int bestStock = 0;
	for (auto& it : allWarehouses) {
		auto found = it->inventory.find(req.itemNeeded);
		bool hasItem = (found != it->inventory.end() && found->second > 0);
		bool hasSpace = ((req.currentLoad + req.itemWeight) <= req.maxCapacity);
		if (!hasItem || !hasSpace) continue;
		double distToWh = GeoMath::calculateDistance(req.px, req.py, it->px, it->py);
		double distFromWh = GeoMath::calculateDistance(it->px, it->py, req.targetPx, req.targetPy);
		double totalDetour = distToWh + distFromWh;
		if (totalDetour > maxAllowPath) continue;
		bool betterPath = totalDetour < minTotalPath;
		bool samePath = (totalDetour == minTotalPath);
		bool betterStock = (found->second > bestStock);
		if (betterPath || (samePath && betterStock)) {
			minTotalPath = totalDetour;
			bestStock = found->second;
			bestWarehouse = it;
		}
	}
	return bestWarehouse;
}

double getDeviationFactor(Priority p) {
	if (p == Priority::CRITICAL) return 1.05;
	if (p == Priority::HIGH)     return 1.15;
	return 1.30;
}

int main(void) {
	return 0;
}