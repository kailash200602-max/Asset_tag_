import { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";
import "./index.css";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken") || "");

  const handleLogin = (newToken) => {
    localStorage.setItem("adminToken", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken("");
  };

  return token ? (
    <Dashboard token={token} onLogout={handleLogout} />
  ) : (
    <LoginScreen onLogin={handleLogin} />
  );
}
