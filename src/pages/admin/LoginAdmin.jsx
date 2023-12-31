import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/firebase.config";
import '../../styles/Login.css'
import {signInWithEmailAndPassword} from "firebase/auth";
import icono from '../../assets/iconoAdmin.png';


export function LoginAdmin() {
  const [user, setUser] = useState({ email: "", password: "", isAdmin: false });
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    try { 
      if (user.email === 'prueba@prueba.com' && user.password === 'Hola1234') {
        const response = await signInWithEmailAndPassword(auth, user.email, user.password);
        setUser(prevUser => ({ ...prevUser, isAdmin: true })); 
        localStorage.setItem("user", JSON.stringify({ ...response.user, isAdmin: true }));
        navigate("/HomeAdmin");
      } else {
        setErrorMessage('Correo electrónico o contraseña incorrectos.');
        setUser(prevUser => ({ ...prevUser, email: '', password: '' }));
      }
    } catch (error) {
      console.log(error);
      setErrorMessage('Correo electrónico o contraseña incorrectos.');
      setUser(prevUser => ({ ...prevUser, email: '', password: '' }));
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({ ...prevUser, [name]: value }));
  };

  return (
    <html lang="en">
     <section id="section">
         <div class="form-box">
             <div class="form-value">
                 <form onSubmit={handleSubmit}>
                 <img src={icono} icono height={100} width={300} id="logola" alt="Logo" />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <a href="/HomeAdmin">
        
        </a>
          
                     <div class="inputbox">
                     <input
                     id="inputl"
                     value={user.email} onChange={handleChange}
                     name="email"
                     className="input"
                     type="email"
                     />
                         <label for="" id="email">Email</label>
                     </div>
                     <div class="inputbox">
                         <ion-icon name="lock-closed-outline"></ion-icon>
                         <input
                           id="inputl"
                          name="password" value={user.password} onChange={handleChange}
                         className="input"
                         type="password"
                          />
                         <label for="">Password</label>
                     </div>
                     
                      <button id="enviar" type="submit">Iniciar sesión</button>

      <button id="admin"onClick={(e) => handleLogin(e)} className="button">
        Login Normal
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
