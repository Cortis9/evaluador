import React, { useState, useEffect } from "react";
import { Base } from "../normal/Base";
import { useNavigate } from "react-router-dom";
import "../../styles/normal/Evaluacion.css";

export const Evaluacion = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("");
  const [enlaceSeleccionado2, setEnlaceSeleccionado2] = useState("");
  const [rubricaSeleccionada, setRubricaSeleccionada] = useState("");


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
      const nombreRubrica = encodeURIComponent(rubricaSeleccionada);
      const queryParams = `enlace=${enlaceSeleccionado2}&proyectoId=${proyectoId}`;
      navigate(`/EvaluacionProyecto/${nombreRubrica}?${queryParams}`);
    }
  };
  

  return (
    <>
      <Base />
      <form id="form2">
      <h2 id="h2">Evaluación</h2>
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
        <iframe src={enlaceSeleccionado2} width="340" height="480" allow="autoplay" id="pdfpreviw"></iframe>
     
        <button id="buttonsiguiente" onClick={navigateToEvaluacionProyecto}>
          Siguiente
        </button>
      </form>
    </>
  );
};



