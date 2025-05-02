import React, { createContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (adminData: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('adminData')
  );

  const login = (adminData: any) => {
    localStorage.setItem('adminData', JSON.stringify(adminData));
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('adminData');
    setIsAuthenticated(false);
  };

  // Theo dõi thay đổi trong localStorage (ví dụ: từ tab khác)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('adminData'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};