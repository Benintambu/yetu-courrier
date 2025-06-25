// AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, getIdTokenResult, signOut, setPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () => signOut(auth);

    useEffect(() => {
        console.log("AuthStateChanged triggered for role:", role);
        let isMounted = true;
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!isMounted) return;

            if (user) {
                const token = await getIdTokenResult(user, true);
                setRole(token.claims.role || null);
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
                setRole(null);
            }
            setLoading(false);
        });
        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, role, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
