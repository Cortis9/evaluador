import React, { useState, useEffect } from "react";
import { Base } from "../normal/Base";
import { useNavigate } from "react-router-dom";
import "../../styles/Evaluacion.css";

export const Resultados = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("");
  const [enlaceSeleccionado, setEnlaceSeleccionado] = useState("");
  const [rubricaSeleccionada, setRubricaSeleccionada] = useState("");

  useEffect(() => {
    fetch("https://evaluadoruam.netlify.app/proyectos")
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          setProyectos(data);
        }
      });
  }, []);

  useEffect(() => {
    if (proyectos.length > 0 && proyectoSeleccionado !== "") {
      const proyectoEncontrado = proyectos.find(
        (proyecto) => proyecto.titulo === proyectoSeleccionado
      );

      if (proyectoEncontrado) {
        const modifiedLink = proyectoEncontrado.link
          .replace("/file/d/", "/uc?export=view&id=")
          .replace("/view?usp=sharing", "");
        setEnlaceSeleccionado(modifiedLink);

        fetch(`https://evaluadoruam.netlify.app/proyectos/${proyectoEncontrado.id}`)
          .then((response) => response.json())
          .then((data) => {
            if (data && data.rubrica) {
              setRubricaSeleccionada(data.rubrica);
            }
          });
      } else {
        setEnlaceSeleccionado("");
        setRubricaSeleccionada("");
      }
    }
  }, [proyectos, proyectoSeleccionado]);

  const handleProyectoSeleccionado = (event) => {
    const proyecto = event.target.value;
    setProyectoSeleccionado(proyecto);
  };

  const navigateToEvaluacionProyecto = () => {
    const modifiedLink = enlaceSeleccionado
      .replace("/file/d/", "/uc?export=view&id=")
      .replace("/view?usp=sharing", "");
  
    const proyectoEncontrado = proyectos.find(
      (proyecto) => proyecto.titulo === proyectoSeleccionado
    );
  
    if (proyectoEncontrado) {
      const proyectoId = proyectoEncontrado.id;
      navigate(`/ResultadosProyecto?proyectoId=${proyectoId}`);
    }
  };
  

  return (
    <>
      <Base />
      <form id="form2">
        <h2 id="h2">Resultados</h2>
        <select
          id="proyecto"
          value={proyectoSeleccionado}
          onChange={handleProyectoSeleccionado}
        >
          <option value="">Seleccione un proyecto</option>
          {proyectos.map((proyecto) => (
            <option key={proyecto.id} value={proyecto.titulo}>
              {proyecto.titulo}
            </option>
          ))}
        </select>
        {enlaceSeleccionado && (
          <div id="img">
            <img src={enlaceSeleccionado} width="300" alt="Proyecto" />
          </div>
        )}
        <button id="buttonsiguiente" onClick={navigateToEvaluacionProyecto}>
          Siguiente
        </button>
      </form>
    </>
  );
};
