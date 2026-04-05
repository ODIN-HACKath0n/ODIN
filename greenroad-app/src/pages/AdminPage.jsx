import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { registerCompany, registerEmployee } from "../api/api";
import { logoutUser } from "../api/auth";

// ── Icons ─────────────────────────────────────────────────────────────────────

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

function IconCompanies() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconStats() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconEnter() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ── NAV config ────────────────────────────────────────────────────────────────

const NAV = [
  { key: "companies", labelUA: "Компанії",            labelEN: "Companies",         Icon: IconCompanies },
  { key: "stats",     labelUA: "Глобальна статистика", labelEN: "Global Statistics",  Icon: IconStats     },
  { key: "settings",  labelUA: "Налаштування системи", labelEN: "System Settings",    Icon: IconSettings  },
  { key: "logout",    labelUA: "Вихід",                labelEN: "Logout",             Icon: IconLogout    },
];

// ── Add-company modal ─────────────────────────────────────────────────────────

function AddModal({ lang, onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", managerId: "", email: "", domain: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim() || !form.managerId.trim() || !form.email.trim()) {
      setError(lang === "UA" ? "Заповніть обов'язкові поля" : "Fill required fields");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const data = await registerCompany({
        name: form.name,
        manager_id: form.managerId,
      });
      onAdd({
        id: data.company_data?.id || form.managerId,
        name: data.company_data?.name || form.name,
        email: form.email,
        employees: 0,
        status: "active",
      });
      onClose();
    } catch (err) {
      setError(lang === "UA" ? "Помилка реєстрації компанії" : "Failed to register company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="admin-modal__title">
          {lang === "UA" ? "Реєстрація нової компанії" : "Register new company"}
        </h3>

        {error && <p className="form-error">{error}</p>}

        <div className="admin-modal__form">
          <input name="name" value={form.name} onChange={set} type="text"
            placeholder={lang === "UA" ? "Назва компанії *" : "Company Name *"}
            className="admin-modal__input" />
          <input name="managerId" value={form.managerId} onChange={set} type="text"
            placeholder={lang === "UA" ? "ID менеджера *" : "Manager ID *"}
            className="admin-modal__input" />
          <input name="email" value={form.email} onChange={set} type="email"
            placeholder={lang === "UA" ? "Email менеджера *" : "Manager Email *"}
            className="admin-modal__input" />
          <input name="domain" value={form.domain} onChange={set} type="text"
            placeholder={lang === "UA" ? "Домен (необов'язково)" : "Domain (optional)"}
            className="admin-modal__input" />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button className="login-btn" onClick={submit} disabled={loading}
            style={{ flex: 1 }}>
            {loading
              ? (lang === "UA" ? "ЗБЕРЕЖЕННЯ..." : "SAVING...")
              : (lang === "UA" ? "ЗАРЕЄСТРУВАТИ" : "REGISTER")}
          </button>
          <button className="login-btn" onClick={onClose}
            style={{ flex: 1, background: "var(--btn-secondary-bg, #e5e7eb)", color: "var(--text-primary)" }}>
            {lang === "UA" ? "СКАСУВАТИ" : "CANCEL"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add-employee modal ────────────────────────────────────────────────────────

function AddEmployeeModal({ lang, companyId, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!email.trim()) return;
    try {
      setError(null);
      setLoading(true);
      await registerEmployee(companyId, email);
      onSuccess();
      onClose();
    } catch (err) {
      setError(lang === "UA" ? "Помилка додавання співробітника" : "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="admin-modal__title">
          {lang === "UA" ? "Додати співробітника" : "Add Employee"}
        </h3>

        {error && <p className="form-error">{error}</p>}

        <div className="admin-modal__form">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder={lang === "UA" ? "Email користувача" : "User email"}
            className="admin-modal__input" />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button className="login-btn" onClick={submit} disabled={loading || !email.trim()} style={{ flex: 1 }}>
            {loading ? "..." : (lang === "UA" ? "ДОДАТИ" : "ADD")}
          </button>
          <button className="login-btn" onClick={onClose}
            style={{ flex: 1, background: "var(--btn-secondary-bg, #e5e7eb)", color: "var(--text-primary)" }}>
            {lang === "UA" ? "СКАСУВАТИ" : "CANCEL"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Statistics panel ──────────────────────────────────────────────────────────

function StatisticsPage({ lang, companies }) {
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter((c) => c.status === "active").length;
  const blockedCompanies = companies.filter((c) => c.status === "blocked").length;
  const onlineEmployees = companies.reduce((sum, c) => sum + (c.employees || 0), 0);

  return (
    <div>
      <div className="stats-pills-row">
        <div className="stat-pill-item">
          <span className="stat-label">{lang === "UA" ? "Всього компаній" : "Total companies"}</span>
          <span className="stat-value">{totalCompanies}</span>
        </div>
        <div className="stat-pill-item">
          <span className="stat-label">{lang === "UA" ? "Активні" : "Active"}</span>
          <span className="stat-value" style={{ color: "#4ade80" }}>{activeCompanies}</span>
        </div>
        <div className="stat-pill-item">
          <span className="stat-label">{lang === "UA" ? "Заблоковані" : "Blocked"}</span>
          <span className="stat-value" style={{ color: "#f87171" }}>{blockedCompanies}</span>
        </div>
        <div className="stat-pill-item">
          <span className="stat-label">{lang === "UA" ? "Співробітники" : "Employees"}</span>
          <span className="stat-value">{onlineEmployees}</span>
        </div>
      </div>

      <div className="stats-charts-grid">
        <div className="chart-card">
          <h3 className="chart-card-title">{lang === "UA" ? "Динаміка замовлень" : "Order dynamics"}</h3>
          <div className="line-chart-placeholder">
            <div className="fake-line-graph"></div>
          </div>
        </div>

        <div className="stats-divider"></div>

        <div className="chart-card">
          <h3 className="chart-card-title">{lang === "UA" ? "Розподіл ролей" : "Role distribution"}</h3>
          <div className="pie-chart-container">
            <div className="main-pie-chart" style={{
              background: totalCompanies > 0
                ? `conic-gradient(#4ade80 0% ${(activeCompanies / totalCompanies) * 100}%, #f87171 ${(activeCompanies / totalCompanies) * 100}% 100%)`
                : "#e5e7eb",
            }}></div>
            <div className="pie-labels">
              <div className="pie-label-item">Активні ({activeCompanies})</div>
              <div className="pie-label-item">Заблоковані ({blockedCompanies})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Company row ───────────────────────────────────────────────────────────────

function CompanyRow({ company, lang, onToggle, onAddEmployee }) {
  const isActive = company.status === "active";
  return (
    <div className="admin-table-row">
      <span className="admin-table-row__name">{company.name}</span>
      <span className="admin-table-row__id">{company.id}</span>
      <span className="admin-table-row__email">{company.email}</span>
      <span className="admin-table-row__emp">{company.employees}</span>
      <span className={`admin-table-row__status ${isActive ? "admin-table-row__status--active" : "admin-table-row__status--blocked"}`}>
        {isActive
          ? (lang === "UA" ? "Активна" : "Active")
          : (lang === "UA" ? "Заблокована" : "Blocked")}
      </span>
      <div className="admin-table-row__action" style={{ display: "flex", gap: 6 }}>
        <button className="admin-enter-btn" onClick={onToggle}>
          <IconEnter />
          {isActive
            ? (lang === "UA" ? "Блокувати" : "Block")
            : (lang === "UA" ? "Активувати" : "Activate")}
        </button>
        <button className="admin-enter-btn" onClick={onAddEmployee}
          style={{ background: "var(--btn-secondary-bg, #f1f5f9)" }}>
          <IconPlus />
          {lang === "UA" ? "Додати" : "Add"}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { theme, toggleTheme, lang, toggleLang } = useApp();
  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState("companies");
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [employeeModal, setEmployeeModal] = useState(null); // companyId or null

  const toggleStatus = (id) =>
    setCompanies((prev) =>
      prev.map((c) => c.id === id
        ? { ...c, status: c.status === "active" ? "blocked" : "active" }
        : c
      )
    );

  const addCompany = (company) => setCompanies((prev) => [...prev, company]);

  const incrementEmployees = (companyId) =>
    setCompanies((prev) =>
      prev.map((c) => c.id === companyId ? { ...c, employees: c.employees + 1 } : c)
    );

  const handleNavClick = async (key) => {
    if (key === "logout") {
      try {
        await logoutUser();
      } catch (_) {
        // token already cleared in auth.js
      }
      navigate("/login");
      return;
    }
    setActiveNav(key);
  };

  return (
    <div className={`admin-global-layout ${theme === "dark" ? "dark-theme" : ""}`}>
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="brand-logo">
          <Link to="/">
            <img src={theme === "light" ? "/logo.svg" : "/logo.2.svg"} alt="GreenRoad Logo" />
          </Link>
        </div>

        <nav className="nav-menu">
          {NAV.map(({ key, labelUA, labelEN, Icon }) => (
            <button
              key={key}
              className={`nav-item ${activeNav === key ? "active" : ""}`}
              onClick={() => handleNavClick(key)}
            >
              <Icon />
              <span>{lang === "UA" ? labelUA : labelEN}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className="main-content">
        <header className="top-header">
          <h1>
            {lang === "UA" ? "Панель Системного Адміністратора" : "System Administrator Panel"}
          </h1>
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
        </header>

        {/* Companies tab */}
        {activeNav === "companies" && (
          <div>
            <div className="admin-content-header">
              <h2 className="admin-page-title" style={{ fontSize: "24px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                {lang === "UA" ? "Керування компаніями" : "Company Management"}
              </h2>
              <button className="login-btn admin-add-btn" onClick={() => setShowModal(true)}>
                <IconPlus />
                {lang === "UA" ? "ДОДАТИ КОМПАНІЮ" : "ADD COMPANY"}
              </button>
            </div>

            <div className="admin-table-wrap">
              <div className="admin-table-head">
                {[
                  lang === "UA" ? "Назва компанії" : "Company name",
                  "ID",
                  lang === "UA" ? "Email менеджера" : "Manager email",
                  lang === "UA" ? "Співробітники" : "Employees",
                  lang === "UA" ? "Статус" : "Status",
                  lang === "UA" ? "Дія" : "Action",
                ].map((h) => (
                  <span key={h} className="admin-table-head__cell">{h}</span>
                ))}
              </div>

              {companies.map((c) => (
                <CompanyRow
                  key={c.id}
                  company={c}
                  lang={lang}
                  onToggle={() => toggleStatus(c.id)}
                  onAddEmployee={() => setEmployeeModal(c.id)}
                />
              ))}

              {companies.length === 0 && (
                <div className="admin-table-empty">
                  {lang === "UA" ? "Немає компаній" : "No companies yet"}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats tab */}
        {activeNav === "stats" && (
          <div>
            <div className="admin-content-header">
              <h2 className="admin-page-title">
                {lang === "UA" ? "Глобальна статистика" : "Global Statistics"}
              </h2>
            </div>
            <StatisticsPage lang={lang} companies={companies} />
          </div>
        )}

        {/* Settings tab */}
        {activeNav === "settings" && (
          <div style={{ color: "var(--text-primary)" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 600 }}>
              {lang === "UA" ? "Налаштування в розробці" : "Settings under development"}
            </h2>
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && (
        <AddModal
          lang={lang}
          onClose={() => setShowModal(false)}
          onAdd={addCompany}
        />
      )}

      {employeeModal && (
        <AddEmployeeModal
          lang={lang}
          companyId={employeeModal}
          onClose={() => setEmployeeModal(null)}
          onSuccess={() => incrementEmployees(employeeModal)}
        />
      )}
    </div>
  );
}
