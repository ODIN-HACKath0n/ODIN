import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

// ── ІКОНКИ ────────────────────────────────────────────────────────────────────
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
function IconCompanies() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
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
}
function IconStats() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function IconEnter() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ── СТОРІНКА СТАТИСТИКИ ───────────────────────────────────────────────────────
function StatisticsPage({ lang, companies }) {
  const total = companies.length;
  const active = companies.filter((c) => c.status === "active").length;
  const employees = companies.reduce(
    (sum, c) => sum + (Number(c.employees) || 0),
    0,
  );

  return (
    <div className="stats-container">
      <div className="stats-main-pills">
        <div className="stat-pill-item">
          <span className="stat-label">
            {lang === "UA" ? "Всього компаній" : "Total companies"}
          </span>
          <span className="stat-value">{total}</span>
        </div>
        <div className="stat-pill-item">
          <span className="stat-label">
            {lang === "UA" ? "Активні замовлення" : "Active orders"}
          </span>
          <span className="stat-value">2.654</span>
        </div>
        <div className="stat-pill-item">
          <span className="stat-label">
            {lang === "UA" ? "Працівників онлайн" : "Employees online"}
          </span>
          <span className="stat-value">{employees}</span>
        </div>
        <div className="stat-pill-item">
          <span className="stat-label">
            {lang === "UA" ? "Ефективність системи" : "System efficiency"}
          </span>
          <span className="stat-value">98%</span>
        </div>
      </div>
      <div className="stats-charts-grid">
        <div className="chart-card">
          <h3 className="chart-card-title">
            {lang === "UA" ? "Динаміка замовлень" : "Order dynamics"}
          </h3>
          <div className="line-chart-placeholder">
            <div className="fake-line-graph"></div>
          </div>
        </div>
        <div className="stats-divider"></div>
        <div className="chart-card">
          <h3 className="chart-card-title">
            {lang === "UA" ? "Розподіл ролей" : "Role distribution"}
          </h3>
          <div className="pie-chart-container">
            <div
              className="main-pie-chart"
              style={{
                background: `conic-gradient(#4ade80 0% ${(active / total) * 100}%, #f87171 ${(active / total) * 100}% 100%)`,
              }}
            ></div>
            <div className="pie-labels">
              <div className="pie-label-item">Активні ({active})</div>
              <div className="pie-label-item">
                Заблоковані ({total - active})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── МОДАЛКА ───────────────────────────────────────────────────────────────────
function AddModal({ lang, onClose, onAdd }) {
  const [form, setForm] = useState({
    name: "",
    managerId: "",
    email: "",
    domain: "",
  });
  const set = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const submit = () => {
    if (!form.name.trim() || !form.managerId.trim() || !form.email.trim())
      return;
    onAdd({
      id: form.managerId,
      name: form.name,
      email: form.email,
      employees: 0,
      status: "active",
    });
    onClose();
  };
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="admin-modal__title">
          {lang === "UA" ? "Реєстрація нової компанії" : "Register company"}
        </h3>
        <div className="admin-modal__form">
          <input
            name="name"
            placeholder="Назва"
            onChange={set}
            className="admin-modal__input"
          />
          <input
            name="managerId"
            placeholder="ID Менеджера"
            onChange={set}
            className="admin-modal__input"
          />
          <input
            name="email"
            placeholder="Email"
            onChange={set}
            className="admin-modal__input"
          />
          <input
            name="domain"
            placeholder="Домен"
            onChange={set}
            className="admin-modal__input"
          />
        </div>
        <button className="login-btn admin-modal__save" onClick={submit}>
          {lang === "UA" ? "СТВОРИТИ" : "CREATE"}
        </button>
      </div>
    </div>
  );
}

// ── РЯДОК ТАБЛИЦІ ─────────────────────────────────────────────────────────────
function CompanyRow({ company, lang, onToggle }) {
  const navigate = useNavigate();
  const isActive = company.status === "active";
  return (
    <div className="admin-table-row">
      <span className="admin-table-row__name">{company.name}</span>
      <span className="admin-table-row__id">{company.id}</span>
      <span className="admin-table-row__email">{company.email}</span>
      <span className="admin-table-row__emp">{company.employees}</span>
      <span
        className={`admin-table-row__status ${isActive ? "admin-table-row__status--active" : "admin-table-row__status--blocked"}`}
      >
        {isActive
          ? lang === "UA"
            ? "Активна"
            : "Active"
          : lang === "UA"
            ? "Заблокована"
            : "Blocked"}
      </span>
      <div className="admin-table-row__action">
        <button
          className="admin-enter-btn"
          onClick={() => navigate("/manager")}
        >
          <IconEnter /> {lang === "UA" ? "Увійти" : "Enter"}
        </button>
      </div>
    </div>
  );
}

// ── ГОЛОВНА СТОРІНКА ──────────────────────────────────────────────────────────
const INITIAL = [
  {
    id: "NT-001",
    name: "Nova Trans",
    email: "admin@novatrans.com",
    employees: 124,
    status: "active",
  },
  {
    id: "GT-101",
    name: "Global Trans",
    email: "admin@globaltrans.com",
    employees: 14,
    status: "blocked",
  },
];

const NAV = [
  {
    key: "companies",
    labelUA: "Компанії",
    labelEN: "Companies",
    Icon: IconCompanies,
  },
  {
    key: "stats",
    labelUA: "Глобальна статистика",
    labelEN: "Global Statistics",
    Icon: IconStats,
  },
  {
    key: "settings",
    labelUA: "Налаштування",
    labelEN: "Settings",
    Icon: IconSettings,
  },
  { key: "logout", labelUA: "Вихід", labelEN: "Logout", Icon: IconLogout },
];

export default function AdminPage() {
  const { theme, toggleTheme, lang, toggleLang } = useApp();
  const [activeNav, setActiveNav] = useState("companies");
  const [companies, setCompanies] = useState(INITIAL);
  const [showModal, setShowModal] = useState(false);

  return (
    <div
      className={`admin-global-layout ${theme === "dark" ? "dark-theme" : ""}`}
    >
      <aside className="sidebar">
        <div className="brand-logo">
          <Link to="/">
            <img
              src={theme === "light" ? "/logo.svg" : "/logo.2.svg"}
              alt="Logo"
            />
          </Link>
        </div>
        <nav className="nav-menu">
          {NAV.map(({ key, labelUA, labelEN, Icon }) => (
            <button
              key={key}
              className={`nav-item ${activeNav === key ? "active" : ""}`}
              onClick={() => setActiveNav(key)}
            >
              <Icon /> <span>{lang === "UA" ? labelUA : labelEN}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <h1>{lang === "UA" ? "Панель Адміністратора" : "Admin Panel"}</h1>
          <div className="top-controls">
            <div className="control-pill lang-switch" onClick={toggleLang}>
              <span className={lang === "UA" ? "active" : ""}>UA</span>
              <span>|</span>
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

        {activeNav === "companies" && (
          <div>
            <div className="admin-content-header">
              <h2 className="admin-page-title">
                {lang === "UA" ? "Керування компаніями" : "Companies"}
              </h2>
              <button
                className="login-btn admin-add-btn"
                onClick={() => setShowModal(true)}
              >
                <IconPlus /> {lang === "UA" ? "ДОДАТИ" : "ADD"}
              </button>
            </div>
            <div className="admin-table-wrap">
              <div className="admin-table-head">
                <span>{lang === "UA" ? "Назва" : "Name"}</span>
                <span>ID</span>
                <span>Email</span>
                <span>{lang === "UA" ? "Співр." : "Emp."}</span>
                <span>{lang === "UA" ? "Статус" : "Status"}</span>
                <span>{lang === "UA" ? "Дія" : "Action"}</span>
              </div>
              {companies.map((c) => (
                <CompanyRow key={c.id} company={c} lang={lang} />
              ))}
            </div>
          </div>
        )}

        {activeNav === "stats" && (
          <StatisticsPage lang={lang} companies={companies} />
        )}
      </main>

      {showModal && (
        <AddModal
          lang={lang}
          onClose={() => setShowModal(false)}
          onAdd={(c) => setCompanies([...companies, c])}
        />
      )}
    </div>
  );
}
