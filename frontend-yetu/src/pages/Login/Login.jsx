// Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
// CSS
import './Login.css';
import logo from '../../assets/img/Logo_yetu.png';
import imgSvg from '../../assets/img/8385578_3897496.svg';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const showPassword = () => {
        const passwordField = document.getElementById('password');
        const showBtn = document.querySelector('.bxr');

        if (passwordField.type === "password") {
            passwordField.type = "text";
            showBtn.className = "bxr bx-eye-slash";
        } else {
            passwordField.type = "password";
            showBtn.className = "bxr bx-eye";
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Pas besoin de redirection ici, elle sera gérée par onAuthStateChanged
        } catch (err) {
            setError("Email ou mot de passe incorrect.");
        }
    };



    return (
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
                            <i className='bxr bx-eye' onClick={showPassword}></i>
                        </div>

                        <button type="submit">Valider</button>
                        <div className="error-message">{error && <p>{error}</p>}</div>
                    </form>
                </div>
            </div>
        </div>
    );
}
