import { createContext, useContext, useState } from "react";
import { loginRequest } from "../api/auth";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  async function login(email, password) {
    const res = await loginRequest(email, password);
    localStorage.setItem("token", res.token);
    localStorage.setItem("role", res.role);
    if (res.user) {
      localStorage.setItem("user", JSON.stringify(res.user));
    }
    setToken(res.token);
    setRole(res.role);
    setUser(res.user || null);
    return res.role;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setToken(null);
    setRole(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        isAdmin: role === "ADMIN",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
