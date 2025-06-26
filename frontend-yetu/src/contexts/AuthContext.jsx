// AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, getIdTokenResult } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";


const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () => signOut(auth);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const token = await getIdTokenResult(user, true);
                    setRole(token.claims.role || null);
                    setCurrentUser(user);
                } catch (err) {
                    console.error("Erreur lors de la récupération du token : ", err);
                    setCurrentUser(null);
                    setRole(null);
                }
            } else {
                setCurrentUser(null);
                setRole(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);


    return (
        <AuthContext.Provider value={{ currentUser, role, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
