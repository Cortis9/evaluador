import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import '../../styles/Login.css'
import icono from '../../assets/ico.png';

export function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      
      await auth.login(email, password);
      
      navigate("/Home");
    } catch (error) {
      setErrorMessage('Correo electrónico o contraseña incorrectos.');
      setEmail(""); 
      setPassword(""); 
      console.error(error);
    } 
  };

  const handleLoginAdmin = (e) => {
    e.preventDefault();
    navigate("/LoginAdmin");
  };

  return (
    <html lang="en" id="html">
      <section id="section">
        <div class="form-box" id="form-box">
          <div class="form-value">
            <form action="">
            <img src={icono} icono height={70} width={70} id="logoln" alt="Logo" />
            {errorMessage && <p className="error-message">{errorMessage}</p>}

              <a href="/HomeAdmin"></a>
            
              <div class="inputbox">
                <input
                id="inputl"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  type="email"
                />
                <label for="" id="email">
                  Email
                </label>
              </div>
              <div class="inputbox">
                <ion-icon name="lock-closed-outline"></ion-icon>
                <input
                id="inputl"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  type="password"
                />
                <label for="">Password</label>
              </div>

              <button
                id="enviar"
                onClick={(e) => handleLogin(e)}
                className="button"
              >
                Enviar
              </button>

              <button
                id="admin"
                onClick={(e) => handleLoginAdmin(e)}
                className="button"
              >
                Admin
              </button>
            </form>
          </div>
        </div>
      </section>
      <script
        type="module"
        src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"
      ></script>
      <script
        nomodule
        src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"
      ></script>
    </html>
  );
}
