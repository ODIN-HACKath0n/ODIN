import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminPage from "./pages/AdminPage";
import ManagerDashboard from "./pages/ManagerDashboard";
import LiveMap from "./pages/LiveMap"; // <-- Додано імпорт Живої карти
import "./App.css";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/map" element={<LiveMap />} /> {/* <-- Додано маршрут */}
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
