// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    // Déconnexion
    const logout = () => signOut(auth);

    useEffect(() => {
        return onAuthStateChanged(auth, async (user) => {
            if (user) {
                const token = await getIdTokenResult(user, true);
                setRole(token.claims.role); // ← Le rôle donné par ton backend
            } else {
                setRole(null);
            }
            setCurrentUser(user);
            setLoading(false);
        });
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, role, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
