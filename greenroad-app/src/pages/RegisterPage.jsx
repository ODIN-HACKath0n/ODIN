import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { registerUser } from "../api/auth";

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor"
      strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor"
      strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
      <path d="M7 0L0 2.8V7.7C0 11.76 3.01 15.54 7 16C10.99 15.54 14 11.76 14 7.7V2.8L7 0ZM7 14.42C4.13 13.97 1.87 11.06 1.5 7.97V4L7 1.93L12.5 4V7.97C12.13 11.06 9.87 13.97 7 14.42ZM6.38 10.5L3.62 7.75L4.68 6.69L6.38 8.39L9.32 5.45L10.38 6.51L6.38 10.5Z" fill="#94A3B8" />
    </svg>
  );
}

export default function RegisterPage() {
  const { theme, toggleTheme, lang, toggleLang } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    const { first_name, last_name, email, password, phone } = form;
    if (!first_name.trim() || !last_name.trim() || !email.trim() || !password.trim()) {
      setError(lang === "UA" ? "Заповніть усі обов'язкові поля" : "Fill in all required fields");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      await registerUser({ first_name, last_name, email, password, phone });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(lang === "UA" ? "Помилка реєстрації. Можливо, email вже використовується." : "Registration error. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="page-wrapper">
      <div className="brand-logo">
        <Link to="/">
          <img src={theme === "light" ? "/logo.svg" : "/logo.2.svg"} alt="GreenRoad Logo" />
        </Link>
      </div>

      <div className="top-controls">
        <div className="control-pill lang-switch" onClick={toggleLang}>
          <span className={lang === "UA" ? "active" : ""}>UA</span>
          <span className="separator">|</span>
          <span className={lang === "EN" ? "active" : ""}>EN</span>
        </div>
        <div className="control-pill theme-switch" onClick={toggleTheme}>
          <div className={`icon-wrapper ${theme === "dark" ? "active-moon" : ""}`}><MoonIcon /></div>
          <div className={`icon-wrapper ${theme === "light" ? "active-sun" : ""}`}><SunIcon /></div>
        </div>
      </div>

      <div className="login-card register-card">
        <h2>{lang === "UA" ? "Реєстрація" : "Sign Up"}</h2>

        {error && <p className="form-error">{error}</p>}

        <div className="input-group">
          <input
            type="text"
            placeholder={lang === "UA" ? "Ім'я" : "First Name"}
            value={form.first_name}
            onChange={set("first_name")}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder={lang === "UA" ? "Прізвище" : "Last Name"}
            value={form.last_name}
            onChange={set("last_name")}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <input
            type="email"
            placeholder={lang === "UA" ? "Електронна пошта" : "Email"}
            value={form.email}
            onChange={set("email")}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder={lang === "UA" ? "Пароль" : "Password"}
            value={form.password}
            onChange={set("password")}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <input
            type="tel"
            placeholder={lang === "UA" ? "Номер телефону" : "Phone"}
            value={form.phone}
            onChange={set("phone")}
            disabled={loading}
          />
        </div>

        <button className="login-btn" onClick={handleRegister} disabled={loading}>
          {loading
            ? (lang === "UA" ? "ЗАВАНТАЖЕННЯ..." : "LOADING...")
            : (lang === "UA" ? "СТВОРИТИ АКАУНТ" : "CREATE ACCOUNT")}
        </button>

        <button className="google-btn" disabled>
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg" alt="Google" />
          <span>{lang === "UA" ? "Продовжити з Google" : "Continue with Google"}</span>
        </button>

        <div className="signup-link">
          {lang === "UA" ? "Вже маєте акаунт?" : "Already have an account?"}{" "}
          <Link to="/login">{lang === "UA" ? "Увійти" : "Sign In"}</Link>
        </div>

        <div className="divider" />

        <div className="secure-text">
          <ShieldIcon />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
}
