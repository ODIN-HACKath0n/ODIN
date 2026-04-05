import { useEffect, useState } from "react"
import { getDirectors, promoteToDirector, fireDirector } from "../api/api"

export default function Directors() {
  const [directors, setDirectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState("")

  const fetchDirectors = async () => {
    try {
      setLoading(true)
      const data = await getDirectors()
      setDirectors(data.directors)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePromote = async () => {
    if (!userId.trim()) return
    try {
      const data = await promoteToDirector(userId)
      setDirectors(prev => [...prev, data.user])
      setUserId("")
    } catch (err) {
      alert("Помилка: " + err.message)
    }
  }

  const handleFire = async (directorId) => {
    if (!confirm("Зняти роль директора?")) return
    try {
      await fireDirector(directorId)
      setDirectors(prev => prev.filter(d => d.id !== directorId))
    } catch (err) {
      alert("Помилка: " + err.message)
    }
  }

  useEffect(() => { fetchDirectors() }, [])

  if (loading) return <p>Завантаження...</p>
  if (error) return <p style={{ color: "red" }}>Помилка: {error}</p>

  return (
    <div>
      <h2>Директори</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          placeholder="User ID для призначення"
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
        <button onClick={handlePromote}>Призначити директором</button>
      </div>

      {directors.length === 0 ? <p>Немає директорів</p> : (
        <table border="1" cellPadding="8">
          <thead>
            <tr><th>ID</th><th>Ім'я</th><th>Email</th><th>Дії</th></tr>
          </thead>
          <tbody>
            {directors.map(d => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.first_name} {d.last_name}</td>
                <td>{d.email}</td>
                <td><button onClick={() => handleFire(d.id)}>Зняти роль</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
