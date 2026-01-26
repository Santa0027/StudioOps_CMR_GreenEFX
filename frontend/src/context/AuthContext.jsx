import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

// const decoded = jwtDecode(token);


const AuthContext = createContext(null);

const getDecodedUserFromTokens = () => {
  const storedTokens = localStorage.getItem('tokens');
  if (storedTokens) {
    try {
      const { access } = JSON.parse(storedTokens);
      const decodedUser = jwtDecode(access);
      return { ...decodedUser, tokens: JSON.parse(storedTokens) };
    } catch (e) {
      console.error("Failed to decode token:", e);
      localStorage.removeItem('tokens');
      return null;
    }
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getDecodedUserFromTokens);
  const [loading, setLoading] = useState(true);

  console.log("AuthContext: Initial user state:", user); // Added log

  const backendUrl = "http://localhost:8000/api";

  const isAuthenticated = !!user;

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        const decodedUser = jwtDecode(data.access);
        const userData = { ...decodedUser, tokens: data };
        setUser(userData);
        console.log("AuthContext: User set after login:", userData); // Added log
        localStorage.setItem('tokens', JSON.stringify(data));
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: data.detail || 'Login failed' };
      }
    } catch (err) { // Renamed 'error' to 'err' to avoid conflict if 'error' state exists
      setLoading(false);
      console.error("Network error during login:", err); // Log the error
      return { success: false, error: 'Network error' };
    }
  }, [backendUrl]); // backendUrl is a dependency

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('tokens');
  }, []); // useCallback to memoize logout

  // Auto-logout timer
  useEffect(() => {
    console.log("AuthContext: useEffect user:", user); // Added log
    if (!user || !user.tokens) return;

    const decoded = jwtDecode(user.tokens.access);
    const currentTime = Date.now() / 1000;
    const timeout = (decoded.exp - currentTime) * 1000; // milliseconds

    if (timeout <= 0) {
      logout(); // token already expired
    } else {
      const timer = setTimeout(() => {
        logout();
        alert("Session expired. You have been logged out.");
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [user, logout]); // Add logout to dependency array

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
