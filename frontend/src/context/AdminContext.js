import { createContext, useContext } from 'react';
import { useAuthStore } from '../hooks/useAuth'; // Import from zustand store

export const AdminContext = createContext();

export const AdminContextProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore(); // Get user and authentication status from AuthStore

  const isAdmin = user?.role === 'admin'; // Check if the current user has an admin role

  return (
    <AdminContext.Provider value={{ isAdmin, isAuthenticated }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used inside an AdminContextProvider");
  }
  return context;
};
