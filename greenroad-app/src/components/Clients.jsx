import { useState } from "react"
import { getClientByEmail, getClientById, createClient } from "../api/api"

export default function Clients() {
  const [client, setClient] = useState(null)
  const [searchEmail, setSearchEmail] = useState("")
  const [searchId, setSearchId] = useState("")
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "" })

  const handleSearchByEmail = async () => {
    try {
      setError(null)
      const data = await getClientByEmail(searchEmail)
      setClient(data.client_data)
    } catch (err) {
      setError("Клієнта не знайдено")
      setClient(null)
    }
  }

  const handleSearchById = async () => {
    try {
      setError(null)
      const data = await getClientById(searchId)
      setClient(data.client_data)
    } catch (err) {
      setError("Клієнта не знайдено")
      setClient(null)
    }
  }

  const handleCreate = async () => {
    try {
      const data = await createClient(form)
      setClient(data.order_data)
      setShowForm(false)
      setForm({ name: "", email: "", phone: "" })
    } catch (err) {
      alert("Помилка: " + err.message)
    }
  }

  return (
    <div>
      <h2>Клієнти</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Пошук за email"
          value={searchEmail}
          onChange={e => setSearchEmail(e.target.value)}
        />
        <button onClick={handleSearchByEmail}>Знайти</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Пошук за ID"
          value={searchId}
          onChange={e => setSearchId(e.target.value)}
        />
        <button onClick={handleSearchById}>Знайти</button>
      </div>

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Скасувати" : "+ Новий клієнт"}
      </button>

      {showForm && (
        <div style={{ margin: "12px 0", display: "flex", flexDirection: "column", gap: 8, maxWidth: 300 }}>
          <input placeholder="Ім'я" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Телефон" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <button onClick={handleCreate}>Створити</button>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {client && (
        <div style={{ border: "1px solid #ccc", padding: 12, marginTop: 12 }}>
          <h4>Клієнт</h4>
          <p><b>ID:</b> {client.id}</p>
          <p><b>Email:</b> {client.email}</p>
          <p><b>Ім'я:</b> {client.name}</p>
          <p><b>Телефон:</b> {client.phone}</p>
        </div>
      )}
    </div>
  )
}
