import React from "react";
import {useNavigate} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import '../../styles/BaseAdmin.css'


export function Base() {

  const navigate = useNavigate();
  const auth = useAuth();
  
    const HandleLogout = () => {
        auth.logout();
        navigate("/");
      }

  return (


<div>
 <header>
 <a href="/HomeAdmin">
  <img src="/src/assets/icono.png" height={50} width={50} id="logo" />
</a>

 <ul>
 <li><a href="/HomeAdmin">Home</a></li> 
 <li><a href="/Registro">Registro</a></li>
 <li><a href="/Rubricas">Rubricas</a></li> 
 <li><a href="/Edicion">Dashboard</a></li> 
 <li><a href="/ResultadosAdmin">Resultados</a></li> 
 </ul> 
 
 <button onClick={()=> HandleLogout()} className="button" id="botonL">Logout</button>
 </header>
 </div>

  );

}


