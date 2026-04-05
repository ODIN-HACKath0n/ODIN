// src/components/Drivers.jsx
import { useEffect, useState } from "react"
import { getDrivers, deleteDriver } from "../api/api"

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const data = await getDrivers()
      setDrivers(data.drivers)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (driverId) => {
    if (!confirm("Видалити водія?")) return
    try {
      await deleteDriver(driverId)
      setDrivers(prev => prev.filter(d => d.id !== driverId))
    } catch (err) {
      alert("Помилка при видаленні: " + err.message)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  if (loading) return <p>Завантаження...</p>
  if (error) return <p style={{ color: "red" }}>Помилка: {error}</p>

  return (
    <div>
      <h2>Водії</h2>
      {drivers.length === 0 ? (
        <p>Немає водіїв</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ліцензія</th>
              <th>Досвід (років)</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(driver => (
              <tr key={driver.id}>
                <td>{driver.id}</td>
                <td>{driver.license_type}</td>
                <td>{driver.experience_years}</td>
                <td>
                  <button onClick={() => handleDelete(driver.id)}>
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}