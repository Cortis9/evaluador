import React, { useState, useEffect } from "react";
import { Base } from "../normal/Base";
import { useNavigate } from "react-router-dom";
import "../../styles/normal/Evaluacion.css";

export const Resultados = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("");
  const [rubricaSeleccionada, setRubricaSeleccionada] = useState("");
  const [enlaceSeleccionado2, setEnlaceSeleccionado2] = useState("");

  useEffect(() => {
    fetch("https://api-git-main-cortis9.vercel.app/proyectos")
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

        const modifiedLink2 = proyectoEncontrado.link
        .replace("/view?usp=sharing", "/preview");
        setEnlaceSeleccionado2(modifiedLink2);


        fetch(`https://api-git-main-cortis9.vercel.app/proyectos/${proyectoEncontrado.id}`)
          .then((response) => response.json())
          .then((data) => {
            if (data && data.rubrica) {
              setRubricaSeleccionada(data.rubrica);
            }
          });
      } else {
        setEnlaceSeleccionado2("");
        setRubricaSeleccionada("");
      }
    }
  }, [proyectos, proyectoSeleccionado]);

  const handleProyectoSeleccionado = (event) => {
    const proyecto = event.target.value;
    setProyectoSeleccionado(proyecto);
  };

  const navigateToEvaluacionProyecto = () => {
  
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
        <iframe src={enlaceSeleccionado2} width="340" height="480" allow="autoplay" id="pdfpreview"></iframe>
        <button id="buttonsiguiente" onClick={navigateToEvaluacionProyecto}>
          Siguiente
        </button>
      </form>
    </>
  );
};
