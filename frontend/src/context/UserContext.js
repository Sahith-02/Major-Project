import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to verify token with improved error handling
  const verifyToken = async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/verify-token",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true, // Important for CORS with credentials
          }
        );
        return response.data;
      } catch (error) {
        console.error("Token verification error:", error);
        // Only remove token if it's an auth error (401) or token issue (422)
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 422)
        ) {
          localStorage.removeItem("access_token");
          setCurrentUser(null);
        }
        throw error;
      }
    }
    return null;
  };

  // Initial authentication check
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          const userData = await verifyToken();
          if (userData && userData.user) {
            setCurrentUser(userData.user);
          } else {
            // Clear token if no valid user data returned
            localStorage.removeItem("access_token");
            setCurrentUser(null);
          }
        }
      } catch (error) {
        // Error already logged in verifyToken
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Logout function to clear token and user state
  const logout = () => {
    localStorage.removeItem("access_token");
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoading,
        logout,
        verifyToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
