import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16"
      stroke="currentColor" strokeWidth="2" fill="none"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14"
      stroke="currentColor" strokeWidth="2" fill="none"
      strokeLinecap="round" strokeLinejoin="round">
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

export default function HomePage() {
  const { theme, toggleTheme, lang, toggleLang } = useApp();

  return (
    <div className="page-wrapper home-wrapper">

      {/* Логотип */}
      <div className="brand-logo">
        <img src={theme === "light" ? "/logo.svg" : "/logo.2.svg"} alt="GreenRoad Logo" />
      </div>

      {/* Верхні контролі */}
      <div className="top-controls">
        <div className="control-pill lang-switch" onClick={toggleLang}>
          <span className={lang === "UA" ? "active" : ""}>UA</span>
          <span className="separator">|</span>
          <span className={lang === "EN" ? "active" : ""}>EN</span>
        </div>

        <div className="control-pill theme-switch" onClick={toggleTheme}>
          <div className={`icon-wrapper ${theme === "dark" ? "active-moon" : ""}`}>
            <MoonIcon />
          </div>
          <div className={`icon-wrapper ${theme === "light" ? "active-sun" : ""}`}>
            <SunIcon />
          </div>
        </div>
      </div>

      {/* Головний контент */}
      <div className="home-content">
        <h1 className="home-title">
          {lang === "UA"
            ? <><span>Оптимізувати. Адаптувати. </span><span className="home-title-accent">Доставити.</span></>
            : <><span>Optimize. Adapt. </span><span className="home-title-accent">Deliver.</span></>
          }
        </h1>

        <p className="home-subtitle">
          {lang === "UA"
            ? "Платформа оптимізації логістики в реальному часі"
            : "Real-time logistics optimization platform"}
        </p>

        <div className="home-buttons">
          <Link to="/login" className="home-btn home-btn-primary">
            {lang === "UA" ? "УВІЙТИ" : "SIGN IN"}
          </Link>
          <Link to="/register" className="home-btn home-btn-secondary">
            {lang === "UA" ? "ЗАРЕЄСТРУВАТИСЯ" : "SIGN UP"}
          </Link>
        </div>
      </div>

      {/* Футер */}
      <div className="home-footer">
        <div className="home-footer-line" />
        <p>© 2026 GreenRoad Logistics Platform. Built for efficiency.</p>
      </div>

    </div>
  );
}
