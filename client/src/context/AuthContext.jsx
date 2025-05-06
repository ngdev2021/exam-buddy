import React, { createContext, useContext, useState, useEffect } from "react";
import { mockAuthService } from "../utils/mockAuthService";
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
    const isExpired = Date.now() > parseInt(tokenExpiry, 10);
    if (isExpired) {
      console.log("Token has expired", {
        now: new Date(Date.now()).toISOString(),
        expiry: new Date(parseInt(tokenExpiry, 10)).toISOString()
      });
    }
    return isExpired;
  };

  // Handle API responses that indicate auth failures
  const handleAuthError = (status, errorMessage = null) => {
    if (status === 401 || status === 403) {
      console.log("Auth error detected, logging out", { status, errorMessage });
      logout();
      navigate("/login", { 
        state: { 
          message: errorMessage || "Your session has expired. Please log in again." 
        } 
      });
      return true;
    }
    return false;
  };

  // Load user from storage on initial render
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    
    console.log("Checking stored auth data", { 
      hasToken: !!storedToken, 
      hasUser: !!storedUser,
      tokenExpiry: tokenExpiry ? new Date(parseInt(tokenExpiry, 10)).toISOString() : null
    });
    
    if (storedToken && storedUser) {
      // Check if token is expired
      if (isTokenExpired()) {
        console.log("Token expired, logging out");
        logout();
        navigate("/login", { state: { message: "Your session has expired. Please log in again." } });
      } else {
        try {
          const userData = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userData);
          console.log("User loaded from storage", userData);
          
          // Skip token verification with backend in mock auth mode
          if (import.meta.env.DEV && (import.meta.env.VITE_USE_MOCK_AUTH === 'true' || import.meta.env.VITE_API_URL === undefined)) {
            console.log("Using mock auth - skipping token verification");
            // Verify mock token
            mockAuthService.verifyToken(storedToken)
              .then(result => {
                if (!result.valid) {
                  console.log("Mock token verification failed");
                  logout();
                  navigate("/login", { state: { message: "Authentication error. Please log in again." } });
                }
              })
              .catch(() => {
                logout();
                navigate("/login", { state: { message: "Authentication error. Please log in again." } });
              });
          } else {
            // Verify token with backend to ensure it's still valid
            fetch(`${import.meta.env.VITE_API_URL}/api/health`, {
              headers: {
                Authorization: `Bearer ${storedToken}`
              }
            })
            .then(response => {
              if (!response.ok) {
                console.log("Token verification failed", { status: response.status });
                throw new Error("Token verification failed");
              }
              return response.json();
            })
            .catch(error => {
              console.error("Token verification error", error);
              logout();
              navigate("/login", { state: { message: "Authentication error. Please log in again." } });
            });
          }
        } catch (e) {
          console.error("Failed to parse stored user", e);
          logout();
          navigate("/login", { state: { message: "Session error. Please log in again." } });
        }
      }
    }
    setLoading(false);
  }, [navigate]);

  // Login function
  async function login(email, password) {
    try {
      console.log("Attempting login for", email);
      
      // Use mock service if VITE_USE_MOCK_AUTH is true (in both dev and prod)
      if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
        console.log("Using mock authentication service");
        const data = await mockAuthService.login(email, password);
        
        // Store token with expiration timestamp (7 days from now)
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem("token", data.token);
        localStorage.setItem("tokenExpiry", expiresAt.toString());
        localStorage.setItem("user", JSON.stringify(data.user));
        
        console.log("Mock auth data stored in localStorage");
        
        setToken(data.token);
        setUser(data.user);
        return data;
      }
      
      // Production authentication flow
      console.log("API URL:", import.meta.env.VITE_API_URL);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log("Login response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(e => ({ error: "Could not parse error response" }));
        console.error("Login failed with status", response.status, errorData);
        throw new Error(errorData.error || errorData.details || "Login failed");
      }
      
      const data = await response.json().catch(e => {
        console.error("Failed to parse login response", e);
        throw new Error("Invalid server response");
      });
      
      console.log("Login successful, received token");
      
      if (!data.token) {
        console.error("No token received in login response");
        throw new Error("No authentication token received");
      }
      
      // Store token with expiration timestamp (7 days from now)
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem("token", data.token);
      localStorage.setItem("tokenExpiry", expiresAt.toString());
      localStorage.setItem("user", JSON.stringify(data.user));
      
      console.log("Auth data stored in localStorage", {
        tokenLength: data.token.length,
        expiry: new Date(expiresAt).toISOString()
      });
      
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Register function
  async function register(name, email, password) {
    try {
      // Use mock service in development mode
      if (import.meta.env.DEV && (import.meta.env.VITE_USE_MOCK_AUTH === 'true' || import.meta.env.VITE_API_URL === undefined)) {
        console.log("Using mock registration service");
        const data = await mockAuthService.register(name, email, password);
        
        // Auto-login after successful registration
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem("token", data.token);
        localStorage.setItem("tokenExpiry", expiresAt.toString());
        localStorage.setItem("user", JSON.stringify(data.user));
        
        setToken(data.token);
        setUser(data.user);
        return data;
      }
      
      // Production registration flow
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || "Registration failed");
      }

      const data = await response.json();
      
      // Auto-login after successful registration
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

  // Verify token function
  async function verifyToken(token) {
    try {
      // Use mock service in development mode
      if (import.meta.env.DEV && (import.meta.env.VITE_USE_MOCK_AUTH === 'true' || import.meta.env.VITE_API_URL === undefined)) {
        console.log("Using mock token verification");
        const result = await mockAuthService.verifyToken(token);
        return result.valid;
      }
      
      // Production token verification
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Token verification failed");
      }

      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  }

  // Update user function
  async function updateUser(userData) {
    try {
      // Use mock service in development mode
      if (import.meta.env.DEV && (import.meta.env.VITE_USE_MOCK_AUTH === 'true' || import.meta.env.VITE_API_URL === undefined)) {
        console.log("Using mock update user service");
        const updatedUser = await mockAuthService.updateUser(userData, token);
        
        // Update local storage
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        return updatedUser;
      }
      
      // Production update user flow
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        if (handleAuthError(response.status)) return;
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || "Failed to update profile");
      }

      const updatedUser = await response.json();
      
      // Update local storage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  }
  
  // Update password function
  async function updatePassword(currentPassword, newPassword) {
    try {
      // Use mock service in development mode
      if (import.meta.env.DEV && (import.meta.env.VITE_USE_MOCK_AUTH === 'true' || import.meta.env.VITE_API_URL === undefined)) {
        console.log("Using mock update password service");
        await mockAuthService.updatePassword(currentPassword, newPassword, token);
        return true;
      }
      
      // Production update password flow
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        if (handleAuthError(response.status)) return;
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || "Failed to update password");
      }

      return true;
    } catch (error) {
      console.error("Update password error:", error);
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
      verifyToken,
      handleAuthError,
      updateUser,
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
