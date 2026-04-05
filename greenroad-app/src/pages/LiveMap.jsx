import React from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, Link } from "react-router-dom";

// Іконки
function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
const IconDash = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconMap = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16m8-4V6" />
  </svg>
);
const IconOrder = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export default function LiveMap() {
  const { theme, lang, toggleTheme, toggleLang } = useApp();
  const navigate = useNavigate();

  return (
    <div className={`manager-layout ${theme === "dark" ? "dark-theme" : ""}`}>
      {/* САЙДБАР */}
      <aside className="manager-sidebar">
        <div className="brand-logo">
          <Link to="/">
            <img
              src={theme === "light" ? "/logo.svg" : "/logo.2.svg"}
              alt="Logo"
            />
          </Link>
        </div>
        <nav className="manager-nav">
          <button className="nav-item" onClick={() => navigate("/manager")}>
            <IconDash /> <span>{lang === "UA" ? "Дашборд" : "Dashboard"}</span>
          </button>
          <button className="nav-item active">
            <IconMap /> <span>{lang === "UA" ? "Жива карта" : "Live Map"}</span>
          </button>
          <button className="nav-item">
            <IconOrder /> <span>{lang === "UA" ? "Замовлення" : "Orders"}</span>
          </button>
          <button
            className="nav-item logout"
            onClick={() => navigate("/admin")}
          >
            <span>{lang === "UA" ? "Вихід" : "Exit"}</span>
          </button>
        </nav>
      </aside>

      {/* КОНТЕНТ */}
      <main className="manager-main">
        <div className="manager-content-wrapper">
          <header className="manager-header">
            <span className="cabinet-label">
              {lang === "UA" ? "Кабінет Менеджера" : "Manager Cabinet"}
            </span>
            <div className="top-controls">
              <div className="control-pill lang-switch" onClick={toggleLang}>
                <span className={lang === "UA" ? "active" : ""}>UA</span>
                <span className="separator">|</span>
                <span className={lang === "EN" ? "active" : ""}>EN</span>
              </div>
              <div className="control-pill theme-switch" onClick={toggleTheme}>
                <div
                  className={`icon-wrapper ${theme === "dark" ? "active-moon" : ""}`}
                >
                  <MoonIcon />
                </div>
                <div
                  className={`icon-wrapper ${theme === "light" ? "active-sun" : ""}`}
                >
                  <SunIcon />
                </div>
              </div>
            </div>
          </header>

          <h1 className="panel-title">
            {lang === "UA" ? "Панель керування" : "Control Panel"}:{" "}
            <span className="highlight">Nova Trans</span>
          </h1>

          <div className="manager-search-bar">
            <input
              type="text"
              placeholder={
                lang === "UA" ? "Пошук водіїв..." : "Search drivers..."
              }
            />
          </div>

          <div className="map-page-grid">
            {/* Блок з картою */}
            <div className="map-iframe-container">
              <iframe
                title="Map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=23.862304687500004%2C49.33231310651786%2C25.960693359375004%2C50.11370830491068&amp;layer=mapnik"
                style={{ border: "none", width: "100%", height: "100%" }}
              />
            </div>

            {/* Праві інформаційні панелі */}
            <div className="map-info-panels">
              <div className="map-panel">
                <div className="map-panel-title">Масштаб</div>
                <div className="zoom-controls">
                  <button className="zoom-btn">+</button>
                  <button className="zoom-btn">-</button>
                  <button className="zoom-btn">⌖</button>
                </div>
              </div>

              <div className="map-panel">
                <div className="info-row">
                  <span className="info-label">Ім'я:</span>{" "}
                  <span className="info-val">Максим В. (Водій)</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Авто:</span>{" "}
                  <span className="info-val">MAN TGX (AA 1234 OO)</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Маршрут:</span>{" "}
                  <span className="info-val">Львів ➔ Тернопіль</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Швидкість:</span>{" "}
                  <span className="info-val">78 км/год</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Запас палива:</span>{" "}
                  <span className="info-val">65%</span>
                </div>
              </div>

              <div className="map-panel">
                <div className="info-row">
                  <span className="info-label">Дедлайн:</span>{" "}
                  <span className="info-val">18:00 (Сьогодні)</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Статус:</span>{" "}
                  <span className="info-val">В дорозі 🟢</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
