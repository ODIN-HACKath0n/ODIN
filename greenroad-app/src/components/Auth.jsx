import { useState } from "react"
import { loginUser, registerUser, logoutUser } from "../api/auth"

export default function Auth() {
  const [mode, setMode] = useState("login") // "login" | "register"
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"))

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
  })

  const handleLogin = async () => {
    try {
      setError(null)
      setLoading(true)
      await loginUser(loginForm.email, loginForm.password)
      setIsLoggedIn(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    try {
      setError(null)
      setLoading(true)
      await registerUser(registerForm)
      setMode("login")
      setError(null)
      alert("Реєстрація успішна! Тепер увійдіть.")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      // user_id можна зберігати в localStorage після логіну якщо потрібно
      await logoutUser()
      setIsLoggedIn(false)
    } catch (err) {
      // Навіть якщо сервер не відповів — токен вже видалено в api/auth.js
      setIsLoggedIn(false)
    }
  }

  // ── Якщо вже залогінений ──────────────────────────────
  if (isLoggedIn) {
    return (
      <div style={styles.card}>
        <h2>Ви увійшли</h2>
        <p>Роль: <b>{localStorage.getItem("role") || "—"}</b></p>
        <button style={styles.button} onClick={handleLogout}>Вийти</button>
      </div>
    )
  }

  // ── Форма входу ───────────────────────────────────────
  if (mode === "login") {
    return (
      <div style={styles.card}>
        <h2>Вхід</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          placeholder="Email"
          type="email"
          value={loginForm.email}
          onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
        />
        <input
          style={styles.input}
          placeholder="Пароль"
          type="password"
          value={loginForm.password}
          onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
        />

        <button style={styles.button} onClick={handleLogin} disabled={loading}>
          {loading ? "Завантаження..." : "Увійти"}
        </button>

        <p style={styles.link} onClick={() => { setMode("register"); setError(null) }}>
          Немає акаунту? <u>Зареєструватися</u>
        </p>
      </div>
    )
  }

  // ── Форма реєстрації ──────────────────────────────────
  return (
    <div style={styles.card}>
      <h2>Реєстрація</h2>

      {error && <p style={styles.error}>{error}</p>}

      <input
        style={styles.input}
        placeholder="Ім'я"
        value={registerForm.first_name}
        onChange={e => setRegisterForm({ ...registerForm, first_name: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Прізвище"
        value={registerForm.last_name}
        onChange={e => setRegisterForm({ ...registerForm, last_name: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Email"
        type="email"
        value={registerForm.email}
        onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Пароль"
        type="password"
        value={registerForm.password}
        onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Телефон"
        value={registerForm.phone}
        onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
      />

      <button style={styles.button} onClick={handleRegister} disabled={loading}>
        {loading ? "Завантаження..." : "Зареєструватися"}
      </button>

      <p style={styles.link} onClick={() => { setMode("login"); setError(null) }}>
        Вже є акаунт? <u>Увійти</u>
      </p>
    </div>
  )
}

const styles = {
  card: {
    maxWidth: 360,
    margin: "60px auto",
    padding: 32,
    border: "1px solid #ddd",
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
  },
  button: {
    padding: "10px 12px",
    borderRadius: 6,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
  },
  error: {
    color: "red",
    margin: 0,
  },
  link: {
    textAlign: "center",
    cursor: "pointer",
    fontSize: 13,
    color: "#555",
  }
}
