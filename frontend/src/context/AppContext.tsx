import { createContext, useState, type ReactNode } from "react";
import type { AppContextType, User } from "../types";

const defaultContextValue: AppContextType = {
    currentUser: null,
    loginUser: () => null,
    logoutUser: () => null
}
export const AppContext = createContext<AppContextType>(defaultContextValue);

function AppContextProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    function loginUser(userData: User) {
        setCurrentUser(userData);
    }
    function logoutUser() {
        setCurrentUser(null);
        localStorage.removeItem("authToken");
    }
    const appContextValue: AppContextType = {
        currentUser,
        loginUser,
        logoutUser
    }

    return (
        <AppContext.Provider value={appContextValue}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;