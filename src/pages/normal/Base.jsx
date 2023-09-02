import React from "react";
import {useNavigate} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import '../../styles/Base.css'

export function Base() {

  const navigate = useNavigate();
  const auth = useAuth();
  
    const HandleLogout = () => {
        auth.logout();
        navigate("/");
      }

  return (

 <header>
  <a href="/Home">
 <img src="./src/assets/icono.png" height={50} width={50} id="logo"/>
 </a>
 <ul>
 <li><a href="/Home">Home</a></li> 
 <li><a href="/Evaluacion">Evaluación</a></li> 
 <li><a href="/Resultados">Resultados</a></li>
 </ul> 
 
 <button onClick={()=> HandleLogout()} className="button" id="botonL">Logout</button>
 </header>



  );

}


