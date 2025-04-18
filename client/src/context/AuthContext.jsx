import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("jwt") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Optionally decode token for user info
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({ id: payload.userId });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("jwt", token);
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("jwt");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
