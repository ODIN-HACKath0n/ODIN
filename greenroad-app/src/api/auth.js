const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token")}`
})

// ─── AUTH ───────────────────────────────────────────────
export const loginUser = async (email, password) => {
  const body = new URLSearchParams()
  body.append("username", email)
  body.append("password", password)

  const res = await fetch(`${API_URL}/auth/login_user`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!res.ok) throw new Error("Невірний email або пароль")
  const data = await res.json()

  localStorage.setItem("token", data.access_token)
  localStorage.setItem("role", data.role)

  return data
}

export const registerUser = async (userData) => {
  const res = await fetch(`${API_URL}/auth/register_user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  })

  if (!res.ok) throw new Error("Помилка реєстрації")
  return res.json()
}

export const logoutUser = async (userId) => {
  const res = await fetch(`${API_URL}/auth/logout_user`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ user_id: userId }),
  })

  localStorage.removeItem("token")
  localStorage.removeItem("role")

  if (!res.ok) throw new Error("Помилка виходу")
  return true
}
