import { useEffect, useState } from "react"
import { getDrivers, deleteDriver, createDriver } from "../api/api"

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ user_id: "", dispatcher_id: "", license_type: "", experience_years: "" })

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
      alert("Помилка: " + err.message)
    }
  }

  const handleCreate = async () => {
    try {
      const data = await createDriver({
        ...form,
        experience_years: Number(form.experience_years)
      })
      setDrivers(prev => [...prev, data.driver_data])
      setShowForm(false)
      setForm({ user_id: "", dispatcher_id: "", license_type: "", experience_years: "" })
    } catch (err) {
      alert("Помилка: " + err.message)
    }
  }

  useEffect(() => { fetchDrivers() }, [])

  if (loading) return <p>Завантаження...</p>
  if (error) return <p style={{ color: "red" }}>Помилка: {error}</p>

  return (
    <div>
      <h2>Водії</h2>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Скасувати" : "+ Додати водія"}
      </button>

      {showForm && (
        <div style={{ margin: "12px 0", display: "flex", flexDirection: "column", gap: 8, maxWidth: 300 }}>
          <input placeholder="User ID" value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })} />
          <input placeholder="Dispatcher ID" value={form.dispatcher_id} onChange={e => setForm({ ...form, dispatcher_id: e.target.value })} />
          <input placeholder="Тип ліцензії" value={form.license_type} onChange={e => setForm({ ...form, license_type: e.target.value })} />
          <input placeholder="Досвід (років)" type="number" value={form.experience_years} onChange={e => setForm({ ...form, experience_years: e.target.value })} />
          <button onClick={handleCreate}>Створити</button>
        </div>
      )}

      {drivers.length === 0 ? <p>Немає водіїв</p> : (
        <table border="1" cellPadding="8">
          <thead>
            <tr><th>ID</th><th>Ліцензія</th><th>Досвід</th><th>Дії</th></tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.license_type}</td>
                <td>{d.experience_years} р.</td>
                <td><button onClick={() => handleDelete(d.id)}>Видалити</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
