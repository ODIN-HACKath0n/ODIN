import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [theme, setTheme] = useState("light"); // "light" | "dark"
  const [lang, setLang] = useState("UA");      // "UA" | "EN"

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const toggleLang = () =>
    setLang((prev) => (prev === "UA" ? "EN" : "UA"));

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, toggleLang }}>
      <div className={theme}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
