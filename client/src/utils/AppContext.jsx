import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

// Mock credential store
const MOCK_USERS = [
  { email: "admin@communityfinder.org", password: "admin123", role: "admin", name: "Admin User" },
  { email: "user@communityfinder.org",  password: "user123",  role: "user",  name: "Community User" },
];

export const AppProvider = ({ children }) => {
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [language, setLanguage] = useState("en");

  // Restore session from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cf_user")) || null; }
    catch { return null; }
  });

  // Persist session
  useEffect(() => {
    if (currentUser) localStorage.setItem("cf_user", JSON.stringify(currentUser));
    else localStorage.removeItem("cf_user");
  }, [currentUser]);

  const login = (email, password) => {
    const found = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      const { password: _, ...safe } = found;
      setCurrentUser(safe);
      return { success: true, user: safe };
    }
    return { success: false, message: "Invalid email or password" };
  };

  const logout = () => setCurrentUser(null);

  return (
    <AppContext.Provider value={{
      lowBandwidth, setLowBandwidth,
      language, setLanguage,
      currentUser, login, logout,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
