import { useEffect, useState } from "react"
import { getManagers, createManager, updateManager, deleteManager } from "../api/api"

export default function Managers() {
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", phone: "" })
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", phone: "" })

  const fetchManagers = async () => {
    try {
      setLoading(true)
      const data = await getManagers()
      setManagers(data.managers)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const data = await createManager(form)
      setManagers(prev => [...prev, data.manager_data])
      setShowForm(false)
      setForm({ first_name: "", last_name: "", email: "", password: "", phone: "" })
    } catch (err) {
      alert("Помилка: " + err.message)
    }
  }

  const handleUpdate = async (managerId) => {
    try {
      const data = await updateManager(managerId, editForm)
      setManagers(prev => prev.map(m => m.id === managerId ? data.manager_data : m))
      setEditId(null)
    } catch (err) {
      alert("Помилка: " + err.message)
    }
  }

  const handleDelete = async (managerId) => {
    if (!confirm("Видалити менеджера?")) return
    try {
      await deleteManager(managerId)
      setManagers(prev => prev.filter(m => m.id !== managerId))
    } catch (err) {
      alert("Помилка: " + err.message)
    }
  }

  const startEdit = (manager) => {
    setEditId(manager.id)
    setEditForm({ first_name: manager.first_name, last_name: manager.last_name, phone: manager.phone })
  }

  useEffect(() => { fetchManagers() }, [])

  if (loading) return <p>Завантаження...</p>
  if (error) return <p style={{ color: "red" }}>Помилка: {error}</p>

  return (
    <div>
      <h2>Менеджери</h2>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Скасувати" : "+ Додати менеджера"}
      </button>

      {showForm && (
        <div style={{ margin: "12px 0", display: "flex", flexDirection: "column", gap: 8, maxWidth: 300 }}>
          <input placeholder="Ім'я" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
          <input placeholder="Прізвище" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
          <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Пароль" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <input placeholder="Телефон" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <button onClick={handleCreate}>Створити</button>
        </div>
      )}

      {managers.length === 0 ? <p>Немає менеджерів</p> : (
        <table border="1" cellPadding="8">
          <thead>
            <tr><th>Ім'я</th><th>Email</th><th>Телефон</th><th>Дії</th></tr>
          </thead>
          <tbody>
            {managers.map(m => (
              <tr key={m.id}>
                <td>
                  {editId === m.id ? (
                    <span style={{ display: "flex", gap: 4 }}>
                      <input value={editForm.first_name} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} style={{ width: 80 }} />
                      <input value={editForm.last_name} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} style={{ width: 80 }} />
                    </span>
                  ) : `${m.first_name} ${m.last_name}`}
                </td>
                <td>{m.email}</td>
                <td>
                  {editId === m.id
                    ? <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} style={{ width: 120 }} />
                    : m.phone}
                </td>
                <td style={{ display: "flex", gap: 4 }}>
                  {editId === m.id ? (
                    <>
                      <button onClick={() => handleUpdate(m.id)}>Зберегти</button>
                      <button onClick={() => setEditId(null)}>Скасувати</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(m)}>Редагувати</button>
                      <button onClick={() => handleDelete(m.id)}>Видалити</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
