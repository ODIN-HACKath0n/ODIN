import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import LoginPage from "./pages/LoginPage";
import "./App.css";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          {/* потім додаси сюди інші сторінки, наприклад: */}
          {/* <Route path="/register" element={<RegisterPage />} /> */}
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
