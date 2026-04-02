# 🚛 Logistics Algorithm Core

Algorithmic core of a real-time logistics system. Written in C++17.

---

## 📦 Data Structures

**`Request`** — delivery request:
- driver and destination coordinates
- priority, timestamp
- required item, current truck load and capacity

**`Warehouse`** — warehouse node:
- coordinates
- inventory `unordered_map<string, int>` (item name → quantity)

---

## ⚙️ Modules

### `GeoMath::calculateDistance`
Calculates the distance between two geographic points in kilometers using the Haversine formula.
```cpp
GeoMath::calculateDistance(lat1, lon1, lat2, lon2);
```

### `PriorityManager`
Priority queue for delivery requests. Sorting rules:
1. Higher priority goes first (`CRITICAL` > `HIGH` > `NORMAL`)
2. Among equal priorities — older timestamp goes first (longest waiting)
```cpp
PriorityManager manager;
manager.addRequest(req);
Request next = manager.getTopRequest();
```

### `ResourceFinder::findBestPath`
Smart warehouse search algorithm. Finds the optimal warehouse for a detour based on:

| Priority | Max Detour | Use Case |
|----------|------------|----------|
| CRITICAL | +5% | Medications, urgent parts |
| HIGH | +15% | Important goods |
| NORMAL | +30% | Standard logistics |

A warehouse passes the filter only if **all 3 conditions** are met:
- ✅ Required item is in stock (`quantity > 0`)
- ✅ Truck has enough capacity (`current_load + item_weight <= max_capacity`)
- ✅ Detour is within the allowed corridor (`D_detour <= D_straight * factor`)
  
Among qualifying warehouses the winner is selected by:
1. Minimum total detour distance
2. Largest stock quantity as a tiebreaker (load balancing)


## 🔧 Requirements
- C++17 or higher
- STL only, no external dependencies
