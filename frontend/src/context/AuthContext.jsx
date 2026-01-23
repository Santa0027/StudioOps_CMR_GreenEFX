import React, { createContext, useState, useContext, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

const AuthContext = createContext(null);

// Helper function to safely decode user from tokens
const getDecodedUserFromTokens = () => {
  const storedTokens = localStorage.getItem('tokens');
  if (storedTokens) {
    try {
      const { access } = JSON.parse(storedTokens);
      const decodedUser = jwtDecode(access);
      // Add expiration check for access token here if needed
      // const currentTime = Date.now() / 1000;
      // if (decodedUser.exp < currentTime) {
      //   console.warn("Access token expired during initialization.");
      //   localStorage.removeItem('tokens');
      //   return null;
      // }
      return { ...decodedUser, tokens: JSON.parse(storedTokens) };
    } catch (e) {
      console.error("Failed to decode token from localStorage:", e);
      localStorage.removeItem('tokens'); // Clear invalid tokens
      return null;
    }
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getDecodedUserFromTokens);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('tokens');
  });

  const [loading, setLoading] = useState(true);

  const backendUrl = "http://localhost:8000/api";

  useEffect(() => {
    // This useEffect will run once after initial render
    // and whenever 'user' changes.
    // The initial 'loading' state is managed here.
    if (user && user.tokens) {
      localStorage.setItem('tokens', JSON.stringify(user.tokens));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('tokens');
      setIsAuthenticated(false);
    }
    setLoading(false); // Authentication status (or lack thereof) has been determined
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const decodedUser = jwtDecode(data.access);
        const userData = { ...decodedUser, tokens: data };
        setUser(userData);
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        // It's good practice to log the actual error detail from the backend if available
        console.error("Login API error:", data.detail);
        return { success: false, error: data.detail || 'Login failed' };
      }
    } catch (error) {
      setLoading(false);
      console.error("Network or unexpected login error:", error);
      return { success: false, error: 'Network error or server unavailable' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tokens');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
