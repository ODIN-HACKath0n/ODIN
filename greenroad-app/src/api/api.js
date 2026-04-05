// src/api/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token")}`
})

// ─── DRIVERS ───────────────────────────────────────────
export const getDrivers = async (skip = 0, limit = 100) => {
  const res = await fetch(`${API_URL}/api/v1/drivers/?skip=${skip}&limit=${limit}`, {
    headers: authHeaders()
  })
  if (!res.ok) throw new Error("Failed to fetch drivers")
  return res.json()
}

export const getDriverById = async (driverId) => {
  const res = await fetch(`${API_URL}/api/v1/drivers/${driverId}`, {
    headers: authHeaders()
  })
  if (!res.ok) throw new Error("Driver not found")
  return res.json()
}

export const createDriver = async (driverData) => {
  const res = await fetch(`${API_URL}/api/v1/drivers/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(driverData)
  })
  if (!res.ok) throw new Error("Failed to create driver")
  return res.json()
}

export const updateDriverTransport = async (driverId, transportId) => {
  const res = await fetch(`${API_URL}/api/v1/drivers/${driverId}/transport?transport_id=${transportId}`, {
    method: "PATCH",
    headers: authHeaders()
  })
  if (!res.ok) throw new Error("Failed to update transport")
  return res.json()
}

export const deleteDriver = async (driverId) => {
  const res = await fetch(`${API_URL}/api/v1/drivers/${driverId}`, {
    method: "DELETE",
    headers: authHeaders()
  })
  if (!res.ok) throw new Error("Failed to delete driver")
  return true
}

// ─── ORDERS ────────────────────────────────────────────
export const getOrders = async (skip = 0, limit = 100) => {
  const res = await fetch(`${API_URL}/api/v1/orders/?skip=${skip}&limit=${limit}`, {
    headers: authHeaders()
  })
  if (!res.ok) throw new Error("Failed to fetch orders")
  return res.json()
}

export const getOrderById = async (orderId) => {
  const res = await fetch(`${API_URL}/api/v1/orders/${orderId}`, {
    headers: authHeaders()
  })
  if (!res.ok) throw new Error("Order not found")
  return res.json()
}

export const createOrder = async (orderData) => {
  const res = await fetch(`${API_URL}/api/v1/orders/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(orderData)
  })
  if (!res.ok) throw new Error("Failed to create order")
  return res.json()
}

// ─── CLIENTS ───────────────────────────────────────────
export const getClientByEmail = async (email) => {
  const res = await fetch(`${API_URL}/api/v1/clients/by_email?client_email=${email}`, {
    headers: authHeaders()
  })
  if (!res.ok) throw new Error("Client not found")
  return res.json()
}

export const getClientById = async (clientId) => {
  const res = await fetch(`${API_URL}/api/v1/clients/by_id?client_id=${clientId}`, {
    headers: authHeaders()
  })
  if (!res.ok) throw new Error("Client not found")
  return res.json()
}

export const createClient = async (clientData) => {
  const res = await fetch(`${API_URL}/api/v1/clients/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(clientData)
  })
  if (!res.ok) throw new Error("Failed to create client")
  return res.json()
}

// ─── DIRECTORS ─────────────────────────────────────────
export const getDirectors = async (skip = 0, limit = 100) => {
  const res = await fetch(`${API_URL}/api/v1/directors/?skip=${skip}&limit=${limit}`, {
    headers: authHeaders()
  })
  if (!res.ok) throw new Error("Failed to fetch directors")
  return res.json()
}

export const promoteToDirector = async (userId) => {
  const res = await fetch(`${API_URL}/api/v1/directors/${userId}`, {
    method: "POST",
    headers: authHeaders()
  })
  if (!res.ok) throw new Error("Failed to promote user")
  return res.json()
}

export const fireDirector = async (directorId) => {
  const res = await fetch(`${API_URL}/api/v1/directors/${directorId}`, {
    method: "DELETE",
    headers: authHeaders()
  })
  if (!res.ok) throw new Error("Failed to remove director")
  return true
}

// ─── MANAGERS ──────────────────────────────────────────
export const getManagers = async (skip = 0, limit = 100) => {
  const res = await fetch(`${API_URL}/api/v1/managers/?skip=${skip}&limit=${limit}`, {
    headers: authHeaders()
  })
  if (!res.ok) throw new Error("Failed to fetch managers")
  return res.json()
}

export const createManager = async (managerData) => {
  const res = await fetch(`${API_URL}/api/v1/managers/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(managerData)
  })
  if (!res.ok) throw new Error("Failed to create manager")
  return res.json()
}

export const updateManager = async (managerId, updateData) => {
  const res = await fetch(`${API_URL}/api/v1/managers/${managerId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(updateData)
  })
  if (!res.ok) throw new Error("Failed to update manager")
  return res.json()
}

export const deleteManager = async (managerId) => {
  const res = await fetch(`${API_URL}/api/v1/managers/${managerId}`, {
    method: "DELETE",
    headers: authHeaders()
  })
  if (!res.ok) throw new Error("Failed to delete manager")
  return true
}

// ─── COMPANIES ─────────────────────────────────────────
export const registerCompany = async (companyData) => {
  const res = await fetch(`${API_URL}/api/v1/companies/register_company`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(companyData)
  })
  if (!res.ok) throw new Error("Failed to register company")
  return res.json()
}

export const registerEmployee = async (companyId, userEmail) => {
  const res = await fetch(`${API_URL}/api/v1/companies/register_employee?company_id=${companyId}&user_email=${userEmail}`, {
    method: "POST",
    headers: authHeaders()
  })
  if (!res.ok) throw new Error("Failed to register employee")
  return res.json()
}

// ─── ROUTING ───────────────────────────────────────────
export const recalculateRoute = async () => {
  const res = await fetch(`${API_URL}/api/v1/routing/recalculate`, {
    method: "POST",
    headers: authHeaders()
  })
  if (!res.ok) throw new Error("Failed to recalculate route")
  return res.json()
}