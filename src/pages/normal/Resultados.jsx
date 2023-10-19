import React, { useState, useEffect } from "react";
import { Base } from "../normal/Base";
import { useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import "../../styles/normal/Evaluacion.css";
import ImagenR from "../../assets/rojo-verde.png";

export const Resultados = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("");
  const [rubricaSeleccionada, setRubricaSeleccionada] = useState("");
  const [enlaceSeleccionado2, setEnlaceSeleccionado2] = useState("");
  const [loading, setLoading] = useState(false);

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
      setLoading(true);

      const proyectoEncontrado = proyectos.find(
        (proyecto) => proyecto.titulo === proyectoSeleccionado
      );

      if (proyectoEncontrado) {
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
            }
          })
          .finally(() => {
            setTimeout(() => {
              setLoading(false);
            }, 4000);
          });
      } else {
        setEnlaceSeleccionado2("");
        setRubricaSeleccionada("");
        setLoading(false);
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

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <>
      <Base />
      <form id="form2">
        <h2 id="h2">Resultados</h2>
        <div><img id="rojoverde" src={ImagenR} width={250}  /></div>
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
        <div className="iframe-container">
          {loading && (
            <BarLoader color={"#36D7B7"} loading={loading} id="barra" width={300} />
          )}
          <iframe
            src={enlaceSeleccionado2}
            width="340"
            height="480"
            allow="autoplay"
            id="pdfpreviw"
            onLoad={handleIframeLoad}
          ></iframe>
        </div>
        <button id="buttonsiguiente" onClick={navigateToEvaluacionProyecto}>
          Siguiente
        </button>
      </form>
    </>
  );
};
