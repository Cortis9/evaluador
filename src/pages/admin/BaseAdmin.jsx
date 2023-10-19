import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import '../../styles/admin/BaseAdmin.css'
import icono from '../../assets/iconoAdmin.png';

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
    <div>
      <header>
        <a href="/HomeAdmin">
          <img src={icono} icono height={50} width={170} id="logo" alt="Logo" />
        </a>
        {isMobile ? (
          <div>
            <button className="menu-button" onClick={toggleMenu}>
              Menu
            </button>
            <ul className={`menu-dropdown ${showMenu ? "open" : ""}`}>
              <li><a href="/HomeAdmin">Home</a></li>
              <li><a href="/Registro">Registro</a></li>
              <li><a href="/Rubricas">Rúbricas</a></li>
              <li><a href="/DashboardP">Dashboard Proyectos</a></li>
              <li><a href="/DashboardR">Dashboard Rúbricas</a></li>
              <li><a href="/ResultadosAdmin">Resultados</a></li>
              <li>
                <button onClick={handleLogout} className="button" id="botonL">
                  Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <ul className="menu">
            <li><a href="/HomeAdmin">Home</a></li>
            <li><a href="/Registro">Registro</a></li>
            <li><a href="/Rubricas">Rúbricas</a></li>
            <li><a href="/DashboardP">DashboardP</a></li>
            <li><a href="/DashboardR">DashboardR</a></li>
            <li><a href="/ResultadosAdmin">Resultados</a></li>
          </ul>
        )}
        {!isMobile ? (
      <button onClick={handleLogout} className="button" id="botonL">
        Cerrar Sesión
      </button>
    ) : null}
      </header>
    </div>
  );
}
