import { useEffect, useState } from "react"
import { getOrders, getOrderById, createOrder } from "../api/api"

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ client: { email: "" }, description: "" })

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await getOrders()
      setOrders(data.orders)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = async (orderId) => {
    try {
      const data = await getOrderById(orderId)
      setSelected(data.order_data)
    } catch (err) {
      alert("Помилка: " + err.message)
    }
  }

  const handleCreate = async () => {
    try {
      const data = await createOrder(form)
      setOrders(prev => [...prev, data.order_data])
      setShowForm(false)
      setForm({ client: { email: "" }, description: "" })
    } catch (err) {
      alert("Помилка: " + err.message)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  if (loading) return <p>Завантаження...</p>
  if (error) return <p style={{ color: "red" }}>Помилка: {error}</p>

  return (
    <div>
      <h2>Замовлення</h2>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Скасувати" : "+ Нове замовлення"}
      </button>

      {showForm && (
        <div style={{ margin: "12px 0", display: "flex", flexDirection: "column", gap: 8, maxWidth: 300 }}>
          <input
            placeholder="Email клієнта"
            value={form.client.email}
            onChange={e => setForm({ ...form, client: { email: e.target.value } })}
          />
          <input
            placeholder="Опис"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <button onClick={handleCreate}>Створити</button>
        </div>
      )}

      {selected && (
        <div style={{ border: "1px solid #ccc", padding: 12, margin: "12px 0" }}>
          <h4>Деталі замовлення</h4>
          <p><b>ID:</b> {selected.id}</p>
          <p><b>Статус:</b> {selected.status}</p>
          <button onClick={() => setSelected(null)}>Закрити</button>
        </div>
      )}

      {orders.length === 0 ? <p>Немає замовлень</p> : (
        <table border="1" cellPadding="8">
          <thead>
            <tr><th>ID</th><th>Статус</th><th>Клієнт</th><th>Дії</th></tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.status}</td>
                <td>{o.client_email}</td>
                <td><button onClick={() => handleSelect(o.id)}>Деталі</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
