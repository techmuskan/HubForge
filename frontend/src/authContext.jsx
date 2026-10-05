import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

// Context hook intentionally lives beside its provider for a compact auth boundary.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try { return localStorage.getItem("userId"); } catch { return null; }
  });

  const value = {
    currentUser,
    setCurrentUser,
    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setCurrentUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
