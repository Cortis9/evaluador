import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import '../../styles/normal/Base.css';;
import icono from '../../assets/ico.png';

export function Base() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

return (
  <header>
    <a href="/Home">
      <img src={icono} icono height={50} width={50} id="logo" alt="Logo" />
    </a>
    {isMobile ? (
      <div>
        <button className="menu-button" onClick={toggleMenu}>
          Menu
        </button>
        <ul className={`menu-dropdown ${showMenu ? "open" : ""}`}>
          <li><a href="/Home">Home</a></li>
          <li><a href="/Evaluacion">Evaluación</a></li>
          <li><a href="/Resultados">Resultados</a></li>
          <li>
            <button onClick={handleLogout} className="button" id="botonL">
             Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>
    ) : (
      <ul className="menu">
        <li><a href="/Home">Home</a></li>
        <li><a href="/Evaluacion">Evaluación</a></li>
        <li><a href="/Resultados">Resultados</a></li>
      </ul>
    )}
    {!isMobile ? (
      <button onClick={handleLogout} className="button" id="botonL">
        Cerrar Sesión
      </button>
    ) : null}
  </header>
);
}
