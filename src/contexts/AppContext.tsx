import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { isSessionActive, clearUser } from '@/utils/auth';


interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  logout: () => void;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  logout: () => {},
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(isSessionActive());
  }, []);


  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const logout = () => {
    clearUser();
    setIsAuthenticated(false);
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        isAuthenticated,
        setIsAuthenticated,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
