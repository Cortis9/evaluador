import React, { useState, useEffect } from "react";
import { Base } from "../normal/Base";
import { useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import "../../styles/normal/Evaluacion.css";
import ImagenR from "../../assets/rojo-verde.png";

export const Evaluacion = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("");
  const [enlaceSeleccionado2, setEnlaceSeleccionado2] = useState("");
  const [rubricaSeleccionada, setRubricaSeleccionada] = useState("");
  const [rubricaN, setRubricaN] = useState("");
  const [loading, setLoading] = useState(false);
  const [proyectoEvaluado, setProyectoEvaluado] = useState(false);


  useEffect(() => {
    fetch("https://api-git-main-cortis9.vercel.app/proyectos")
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          setProyectos(data);
        }
      });
  }, []);

  const handleProyectoSeleccionado = (event) => {
    const proyecto = event.target.value;
    setProyectoSeleccionado(proyecto);
  };

  useEffect(() => {
    if (proyectos.length > 0 && proyectoSeleccionado !== "") {
      setLoading(true);

      const proyectoEncontrado = proyectos.find(
        (proyecto) => proyecto.titulo === proyectoSeleccionado
      );

      if (proyectoEncontrado) {
        
        if (proyectoEncontrado.estado === "evaluado") {
          setProyectoEvaluado(true);
        } else {
          setProyectoEvaluado(false);
        }

        const modifiedLink2 = proyectoEncontrado.link.replace(
          "/view?usp=sharing",
          "/preview"
        );
        setEnlaceSeleccionado2(modifiedLink2);

        fetch(
          `https://api-git-main-cortis9.vercel.app/proyectos/${proyectoEncontrado.id}`
        )
          .then((response) => response.json())
          .then((data) => {
            if (data && data.rubrica) {
              setRubricaSeleccionada(data.rubrica);
              rubricanombre(data.rubrica);

            }
          })
          .finally(() => {
         
          });
      } else {
        setEnlaceSeleccionado2("");
        setRubricaSeleccionada("");
        setLoading(false); 
      }
    }

  }, [proyectos, proyectoSeleccionado]);


  const rubricanombre = async (rubricaSeleccionada) => {
    try {
          const response = await fetch(`https://api-git-main-cortis9.vercel.app/rubricas/${rubricaSeleccionada}`);
          const data = await response.json();
    
          if (response.ok) {
        

            console.log(data.rubrica.nombre)

            setRubricaN(data.rubrica.nombre)
         
          } else {
            console.error('Error al obtener el nombre:', data.error);
          }
        } catch (error) {
          console.error('Error al obtener el nombre:', error);
        }
      };



  const handleIframeLoad = () => {
    setLoading(false); 
  };


  const handleSiguienteClick = () => {
    if (proyectoEvaluado) {
      
      const confirmEvaluarDeNuevo = window.confirm(
        "Este proyecto ya ha sido evaluado. ¿Deseas evaluarlo de nuevo?"
      );

      if (!confirmEvaluarDeNuevo) {
      
        return;
      }
    }
    navigateToEvaluacionProyecto();
  }

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

        <div><h5 id="seleccion">Seleccione y evalúe cada uno de los trabajos que se muestran en la lista desplegable.</h5></div>
        <div><img id="rojoverde" src={ImagenR}  /></div>
        <select
  id="proyecto"
  value={proyectoSeleccionado}
  onChange={handleProyectoSeleccionado}
>
<option value="">Seleccione un proyecto</option>
{proyectos.map((proyecto) => (
  <option
    key={proyecto.id}
    value={proyecto.titulo}
    style={{ color: proyecto.estado === "evaluado" ? "green" : "red" }}
    title={proyecto.titulo.length > 20 ? proyecto.titulo : null} 
  >
    {proyecto.titulo.length > 20 ? proyecto.titulo.slice(0, 20) + "..." : proyecto.titulo}
  </option>
))}

</select>
<div id="rubricase"><h5 id="h5">Rúbrica del proyecto: {rubricaN}</h5></div>

        {loading && <BarLoader color={"#36D7B7"} loading={loading} id="barra" width={300}/>}
        <iframe
          src={enlaceSeleccionado2}
          allow="autoplay"
          id="pdfpreviw"
          onLoad={handleIframeLoad}
        ></iframe>
        <button id="buttonsiguiente" onClick={handleSiguienteClick}>
          Siguiente
        </button>
      </form>
    </>
  );
};
