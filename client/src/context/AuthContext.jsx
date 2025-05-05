import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if token is expired
  const isTokenExpired = () => {
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    if (!tokenExpiry) return true;
    return Date.now() > parseInt(tokenExpiry, 10);
  };

  // Handle API responses that indicate auth failures
  const handleAuthError = (status) => {
    if (status === 401 || status === 403) {
      console.log("Auth error detected, logging out");
      logout();
      navigate("/login", { state: { message: "Your session has expired. Please log in again." } });
      return true;
    }
    return false;
  };

  // Load user from storage on initial render
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken && storedUser) {
      // Check if token is expired
      if (isTokenExpired()) {
        console.log("Token expired, logging out");
        logout();
      } else {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse stored user", e);
          logout();
        }
      }
    }
    setLoading(false);
  }, []);

  // Login function
  async function login(email, password) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }
      
      const data = await response.json();
      
      // Store token with expiration timestamp (7 days from now)
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem("token", data.token);
      localStorage.setItem("tokenExpiry", expiresAt.toString());
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Register function
  async function register(email, password) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed");
      }
      
      const data = await response.json();
      
      // Store token with expiration timestamp (7 days from now)
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem("token", data.token);
      localStorage.setItem("tokenExpiry", expiresAt.toString());
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register,
      logout, 
      loading,
      isTokenExpired,
      handleAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
