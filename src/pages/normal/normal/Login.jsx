import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {useNavigate} from "react-router-dom";
import '../../styles/Login.css'

export function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleLogin = (e) => {
    e.preventDefault();
    
    auth.login(email, password)
    .then(() => {
      navigate("/Home");
    })
    .catch(() => {
    
      setErrorMessage('Correo electrónico o contraseña incorrectos.');
    }); 
   
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
                     {errorMessage && <p>{errorMessage}</p>}
                     <h2 id="login">Login</h2>
                     <div class="inputbox">
                     <input
                     onChange={(e) => setEmail(e.target.value)}
                     className="input"
                     type="email"
                     />
                         <label for="" id="email">Email</label>
                     </div>
                     <div class="inputbox">
                         <ion-icon name="lock-closed-outline"></ion-icon>
                         <input
                         onChange={(e) => setPassword(e.target.value)}
                         className="input"
                         type="password"
                          />
                         <label for="">Password</label>
                     </div>
                     
                     <button id="enviar" onClick={(e) => handleLogin(e)} className="button">
                      Enviar
                     </button>
  
                     <button id="admin" onClick={(e) =>handleLoginAdmin(e)} className="button">
                     Admin
                    </button>
                    
                 </form>
             </div>
         </div>
     </section>
     <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
     <script nomodule src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
     </html>
  );
 
}
