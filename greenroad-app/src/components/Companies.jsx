import { useState } from "react"
import { registerCompany, registerEmployee } from "../api/api"

export default function Companies() {
  const [companyForm, setCompanyForm] = useState({ name: "", manager_id: "" })
  const [employeeForm, setEmployeeForm] = useState({ company_id: "", user_email: "" })
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleRegisterCompany = async () => {
    try {
      setError(null)
      const data = await registerCompany(companyForm)
      setMessage(`Компанія "${data.company_data.name}" створена успішно`)
      setCompanyForm({ name: "", manager_id: "" })
    } catch (err) {
      setError("Помилка: " + err.message)
    }
  }

  const handleRegisterEmployee = async () => {
    try {
      setError(null)
      const data = await registerEmployee(employeeForm.company_id, employeeForm.user_email)
      setMessage(`Співробітника додано успішно`)
      setEmployeeForm({ company_id: "", user_email: "" })
    } catch (err) {
      setError("Помилка: " + err.message)
    }
  }

  return (
    <div>
      <h2>Компанії</h2>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: 24 }}>
        <h3>Реєстрація компанії</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 300 }}>
          <input
            placeholder="Назва компанії"
            value={companyForm.name}
            onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
          />
          <input
            placeholder="ID менеджера"
            value={companyForm.manager_id}
            onChange={e => setCompanyForm({ ...companyForm, manager_id: e.target.value })}
          />
          <button onClick={handleRegisterCompany}>Зареєструвати компанію</button>
        </div>
      </div>

      <div>
        <h3>Додати співробітника</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 300 }}>
          <input
            placeholder="ID компанії"
            value={employeeForm.company_id}
            onChange={e => setEmployeeForm({ ...employeeForm, company_id: e.target.value })}
          />
          <input
            placeholder="Email користувача"
            value={employeeForm.user_email}
            onChange={e => setEmployeeForm({ ...employeeForm, user_email: e.target.value })}
          />
          <button onClick={handleRegisterEmployee}>Додати співробітника</button>
        </div>
      </div>
    </div>
  )
}
