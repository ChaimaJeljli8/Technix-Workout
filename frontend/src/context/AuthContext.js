import { createContext, useContext } from "react";
import { useAuthStore } from "../hooks/useAuth"; // Path to your zustand store

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const authStore = useAuthStore();

    return (
        <AuthContext.Provider value={authStore}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used inside an AuthContextProvider");
    }
    return context;
};
