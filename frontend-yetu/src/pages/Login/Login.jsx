// Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
// CSS
import './Login.css'
import logo from '../../assets/img/Logo_yetu.png'
import imgSvg from '../../assets/img/8385578_3897496.svg'

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [error, setError] = useState("");

    /* Function pour montrer et cacher le mot de passe au clic */
    function showPassword() {
        const password = document.getElementById('password')
        const showBtn = document.querySelector('.bxr')

        if (password.type === "password") {
            password.type = "text"
            showBtn.className = "bxr bx-eye-slash"
        } else if (password.type === "text") {
            password.type = "password"
            showBtn.className = "bxr bx-eye"
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            const user = userCred.user;

            // Attendre les custom claims
            const token = await user.getIdTokenResult();
            const role = token.claims.role;

            if (role === "admin") navigate("/dashboard");
            else if (role === "gerant") navigate("/gerant");
            else if (role === "chauffeur") navigate("/chauffeur");
            else if (role === "client") navigate("/client");
            else navigate("/login"); // au cas où
        } catch (err) {
            console.error("Erreur de connexion :", err.message);
            setError("Email ou mot de passe incorrect.");
        }
    };


    return (
        <>
            <div className="container-login">
                <div className="container-left">
                    <img src={imgSvg} alt="Image de livraison" />
                </div>
                <div className="container-right">
                    <img src={logo} alt="Logo de Yetu" className="logo" />
                    <div className="container-form-bot">
                        <div className="container-right-form">
                            <div className="container-right-text">
                                <h2>Interface Agents</h2>
                                <p>Entrez vos identifiants pour vous connecter</p>
                            </div>
                        </div>

                        <form onSubmit={handleLogin}>
                            <div className="input-container">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="input-container">
                                <input
                                    type="password"
                                    placeholder="Mot de passe"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    id="password"
                                />
                                <i className='bxr  bx-eye' onClick={showPassword}></i>
                            </div>

                            <button type="submit">Valider</button>

                            <div className="error-message">{error && <p>{error}</p>}</div>
                        </form>
                    </div>
                </div>
            </div>

        </>

    );
}
