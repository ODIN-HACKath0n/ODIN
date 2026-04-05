import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const mockOrders = [
  { id: "#GR-310", route: "Харків → Вінниця", deadline: "10:00 (Сьогодні)", status: "Запізнення", statusType: "late" },
  { id: "#GR-195", route: "Львів → Тернопіль", deadline: "18:00 (Сьогодні)", status: "В дорозі", statusType: "moving" },
  { id: "#GR-047", route: "Дніпро → Краків (PL)", deadline: "07.04 (Завтра)", status: "Очікує", statusType: "waiting" },
];

const mockTeam = [{ name: "Іван П.", online: true }];

// ── ІКОНКИ ────────────────────────────────────────────────────────────────────
function MoonIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
}
function SunIcon() {
  return <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="5" /><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>;
}
function IconDashboard() {
  return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
}
function IconMap() {
  return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>;
}
function IconOrders() {
  return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
}
function IconTeam() {
  return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function IconReports() {
  return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>;
}
function IconLogout() {
  return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
}
function ShieldIcon() {
  return <svg width="14" height="16" viewBox="0 0 14 16" fill="none"><path d="M7 0L0 2.8V7.7C0 11.76 3.01 15.54 7 16C10.99 15.54 14 11.76 14 7.7V2.8L7 0ZM7 14.42C4.13 13.97 1.87 11.06 1.5 7.97V4L7 1.93L12.5 4V7.97C12.13 11.06 9.87 13.97 7 14.42ZM6.38 10.5L3.62 7.75L4.68 6.69L6.38 8.39L9.32 5.45L10.38 6.51L6.38 10.5Z" fill="#94A3B8" /></svg>;
}

const NAV = [
  { key: "dashboard", labelUA: "Дашборд",   labelEN: "Dashboard", Icon: IconDashboard },
  { key: "map",       labelUA: "Жива карта", labelEN: "Live Map",  Icon: IconMap },
  { key: "orders",    labelUA: "Замовлення", labelEN: "Orders",    Icon: IconOrders },
  { key: "team",      labelUA: "Команда",    labelEN: "Team",      Icon: IconTeam },
  { key: "reports",   labelUA: "Звіти",      labelEN: "Reports",   Icon: IconReports },
  { key: "logout",    labelUA: "Вихід",      labelEN: "Logout",    Icon: IconLogout },
];

// ── МОДАЛКА ДОДАВАННЯ ПРАЦІВНИКА ─────────────────────────────────────────────
function AddWorkerModal({ lang, theme, onClose }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const roles = lang === "UA"
    ? ["Диспетчер", "Водій"]
    : ["Dispatcher", "Driver"];

  const canSubmit = email && role;

  return (
    <div className="worker-modal-overlay" onClick={onClose}>
      <div className={`worker-modal-card ${theme === "dark" ? "dark" : ""}`} onClick={(e) => e.stopPropagation()}>

        <h3 className="worker-modal-title">
          {lang === "UA" ? "Додати до команди" : "Add to team"}
        </h3>

        <p className="worker-modal-desc">
          {lang === "UA"
            ? "Введіть дані користувача, щоб надати йому доступ до компанії"
            : "Enter user details to grant access to the company"}
        </p>

        <div className="worker-modal-field">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="worker-modal-input"
          />
        </div>

        <div className="worker-modal-field">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="worker-modal-input worker-modal-select"
          >
            <option value="" disabled>
              {lang === "UA" ? "Оберіть роль" : "Select role"}
            </option>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <button
          className="worker-modal-btn"
          disabled={!canSubmit}
          onClick={onClose}
        >
          + {lang === "UA" ? "ДОДАТИ ПРАЦІВНИКА" : "ADD WORKER"}
        </button>

        <button className="worker-modal-back" onClick={onClose}>
          {lang === "UA" ? "ПОВЕРНУТИСЯ НА ГОЛОВНУ" : "BACK TO MAIN"}
        </button>

        <div className="worker-modal-divider" />

        <div className="worker-modal-secure">
          <ShieldIcon />
          <span>End-to-end encrypted</span>
        </div>

      </div>
    </div>
  );
}

// ── ГОЛОВНИЙ КОМПОНЕНТ ────────────────────────────────────────────────────────
export default function ManagerDashboard() {
  const { theme, toggleTheme, lang, toggleLang } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);

  const filtered = mockOrders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.route.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`admin-global-layout ${theme === "dark" ? "dark-theme" : ""}`}>

      {/* Сайдбар */}
      <aside className="sidebar">
        <div className="brand-logo">
          <Link to="/">
            <img src={theme === "light" ? "/logo.svg" : "/logo.2.svg"} alt="Logo" />
          </Link>
        </div>
        <nav className="nav-menu">
          {NAV.map(({ key, labelUA, labelEN, Icon }) => (
            <button
              key={key}
              className={`nav-item ${key === "logout" ? "nav-item-logout" : ""} ${activePage === key ? "active" : ""}`}
              onClick={() => key === "logout" ? navigate("/") : setActivePage(key)}
            >
              <Icon /> <span>{lang === "UA" ? labelUA : labelEN}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Основний контент */}
      <main className="main-content">

        {/* Хедер */}
        <header className="top-header">
          <h1>{lang === "UA" ? "Кабінет Менеджера" : "Manager Cabinet"}</h1>
          <div className="top-controls">
            <div className="control-pill lang-switch" onClick={toggleLang}>
              <span className={lang === "UA" ? "active" : ""}>UA</span>
              <span>|</span>
              <span className={lang === "EN" ? "active" : ""}>EN</span>
            </div>
            <div className="control-pill theme-switch" onClick={toggleTheme}>
              <div className={`icon-wrapper ${theme === "dark" ? "active-moon" : ""}`}><MoonIcon /></div>
              <div className={`icon-wrapper ${theme === "light" ? "active-sun" : ""}`}><SunIcon /></div>
            </div>
          </div>
        </header>

        {/* Дашборд */}
        {activePage === "dashboard" && (
          <div className="manager-content">
            <h2 className="manager-company-title">
              {lang === "UA" ? "Панель керування: " : "Management Panel: "}
              <span className="manager-company-name">Nova Trans</span>
            </h2>

            <div className="manager-grid">
              <div className="manager-left">
                <div className="manager-search-wrapper">
                  <input
                    className="manager-search"
                    type="text"
                    placeholder={lang === "UA" ? "Пошук замовлень або водіїв..." : "Search orders or drivers..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <span className="manager-search-icon">🔍</span>
                </div>

                <div className="manager-orders">
                  <h3 className="manager-section-title">
                    {lang === "UA" ? "Актуальні замовлення" : "Current Orders"}
                  </h3>
                  <table className="manager-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>{lang === "UA" ? "Маршрут" : "Route"}</th>
                        <th>{lang === "UA" ? "Дедлайн" : "Deadline"}</th>
                        <th>{lang === "UA" ? "Статус" : "Status"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((order) => (
                        <tr key={order.id}>
                          <td className="order-id">{order.id}</td>
                          <td>{order.route}</td>
                          <td>{order.deadline}</td>
                          <td>
                            <span className={`order-status ${order.statusType}`}>
                              <span className="status-dot" />
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="manager-right">
                <button className="add-worker-btn" onClick={() => setShowModal(true)}>
                  + {lang === "UA" ? "ДОДАТИ ПРАЦІВНИКА" : "ADD WORKER"}
                </button>

                <div className="manager-team">
                  <h3 className="manager-section-title">
                    {lang === "UA" ? "Команда в мережі" : "Team Online"}
                  </h3>
                  <div className="team-list">
                    {mockTeam.map((member, i) => (
                      <div key={i} className="team-member">
                        <div className="team-avatar">
                          <span>{member.name[0]}</span>
                          {member.online && <div className="online-dot" />}
                        </div>
                        <span className="team-name">{member.name}</span>
                        <div className="team-actions">
                          <button className="team-action-btn">💬</button>
                          <button className="team-action-btn">📞</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activePage === "map" && (
          <div className="manager-content">
            <h2 className="manager-company-title">{lang === "UA" ? "Жива карта" : "Live Map"}</h2>
            <div className="manager-placeholder">{lang === "UA" ? "Карта буде тут" : "Map coming soon"}</div>
          </div>
        )}
        {activePage === "orders" && (
          <div className="manager-content">
            <h2 className="manager-company-title">{lang === "UA" ? "Замовлення" : "Orders"}</h2>
            <div className="manager-placeholder">{lang === "UA" ? "Список замовлень" : "Orders list"}</div>
          </div>
        )}
        {activePage === "team" && (
          <div className="manager-content">
            <h2 className="manager-company-title">{lang === "UA" ? "Команда" : "Team"}</h2>
            <div className="manager-placeholder">{lang === "UA" ? "Список команди" : "Team list"}</div>
          </div>
        )}
        {activePage === "reports" && (
          <div className="manager-content">
            <h2 className="manager-company-title">{lang === "UA" ? "Звіти" : "Reports"}</h2>
            <div className="manager-placeholder">{lang === "UA" ? "Звіти будуть тут" : "Reports coming soon"}</div>
          </div>
        )}

      </main>

      {/* Модалка */}
      {showModal && (
        <AddWorkerModal
          lang={lang}
          theme={theme}
          onClose={() => setShowModal(false)}
        />
      )}

    </div>
  );
}
