import React, { useState, useEffect } from "react";
import { Base } from "../normal/Base";
import "../../styles/EvaluacionProyecto.css";
import { useNavigate } from "react-router-dom";

export function EvaluacionProyecto ()  {
  const [rubricaData, setRubricaData] = useState({
    rubrica: {
      id: 0,
      nombre: "",
    },
    titulos: [],
    casos: [],
    puntos: [],
  });

  const [puntosSeleccionados, setPuntosSeleccionados] = useState([]);
  const [casosPuntosRelacionados, setCasosPuntosRelacionados] = useState([]);
  const [sumaValores, setSumaValores] = useState(0);
  const [correojuez, setCorreoJuez] = useState("");
  const [NombreRubrica, setNombreRubrica] = useState("");
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();
  const [titulosData, setTitulosData] = useState([]);

  const pathname = window.location.pathname;
  const parts = pathname.split("/");
  const rubricaId = parts[parts.length - 1];
  const searchParams = new URLSearchParams(window.location.search);
  const enlaceSeleccionado = searchParams.get("enlace");
  const id = searchParams.get("id");
  const proyectoId = searchParams.get("proyectoId");

  useEffect(() => {
    fetchRubricaData();
  }, [rubricaId]);

  useEffect(() => {
    const correoUsuario = localStorage.getItem("user");
    const parsedUsuario = JSON.parse(correoUsuario);
    setUsuario(parsedUsuario);
    setCorreoJuez(parsedUsuario?.email || "");
  }, []);

  const fetchRubricaData = async () => {
    try {
      const response = await fetch(`http://localhost:3002/rubricas/${rubricaId}`);
      const data = await response.json();
      setRubricaData(data);
      setNombreRubrica(data.rubrica.nombre);

      const sortedTitulosData = data.titulos ? data.titulos.sort((a, b) => a.id - b.id) : [];
      setTitulosData(sortedTitulosData);
    } catch (error) {
      console.error("Error al obtener los datos de la rubrica: ", error);
    }
  };

  const openImageInNewWindow = () => {
    if (enlaceSeleccionado && id) {
      window.open(enlaceSeleccionado + "&id=" + id, "_blank");
    }
  };

  const enviarCalificacionFinal = async (calificacion) => {
    try {
      const response = await fetch("http://localhost:3002/calificacion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ proyectoId, calificacion, correojuez: usuario?.email, NombreRubrica }),
      });

      if (response.ok) {
        console.log("Calificación final enviada correctamente");
        navigate('/Enviado');
      } else {
        console.error("Error al enviar la calificación final");
      }
    } catch (error) {
      console.error("Error al enviar la calificación final: ", error);
    }
  };

  const enviarResultados = async () => {
    try {
      for (const casoPunto of casosPuntosRelacionados) {
        const { casoId, casoNombre, casoDetalle } = casoPunto;
        const puntosSeleccionadosCaso = puntosSeleccionados.filter(
          (punto) => punto.casoId === casoId 
        );
  
        const resultados = {
          proyectoId,
          casosPuntosRelacionados: [
            {
              casoId,
              casoNombre,
              casoDetalle,
              puntos: puntosSeleccionadosCaso,
            },
          ],
        };

        const response = await fetch("http://localhost:3002/resultados", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(resultados),
        });

        if (response.ok) {
          console.log("Resultados enviados correctamente");
  
          await fetch(`http://localhost:3002/proyectos/${proyectoId}/estado`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ estado: "evaluado" }),
          });
  
          console.log("Estado del proyecto actualizado correctamente");
  
          enviarCalificacionFinal(parseInt(sumaValores)) ;
          console.log(parseInt(sumaValores))
          navigate('/Enviado');
        } else {
          console.error("Error al enviar los resultados");
        }
 
      }
  
      
    } catch (error) {
      console.error("Error al enviar los resultados: ", error);
    }
    
  };
  

  const handlePuntoSeleccionado = (casoId, puntoId, isChecked) => {
    setCasosPuntosRelacionados((prevState) => {
      return prevState.map((caso) => {
        if (caso.casoId === casoId) {
          const updatedPuntos = caso.puntos.map((punto) => {
            return {
              ...punto,
              seleccionado: punto.id === puntoId,
            };
          });
          return {
            ...caso,
            puntos: updatedPuntos,
          };
        }
        return caso;
      });
    });
  
    setPuntosSeleccionados((prevSelected) => {
     
      const filteredSelected = prevSelected.filter((punto) => punto.casoId !== casoId);
  
    
      if (isChecked) {
        const puntoSeleccionado = casosPuntosRelacionados
          .find((caso) => caso.casoId === casoId)
          .puntos.find((punto) => punto.id === puntoId);
  
        if (puntoSeleccionado) {
          filteredSelected.push(puntoSeleccionado);
        }
      }
  
      return filteredSelected;
    });
  };
  

  const calcularSumaValores = () => {
    let suma = 0;
    casosPuntosRelacionados.forEach((caso) => {
      caso.puntos.forEach((punto) => {
        if (punto.seleccionado) {
          suma += punto.valor;
        }
      });
    });
    return suma;
  };


  useEffect(() => {
    const suma = calcularSumaValores();
    setSumaValores(suma);
  }, [casosPuntosRelacionados]);


  useEffect(() => {
    const casosPuntos = rubricaData.casos.map(caso => {
      const puntosRelacionados = rubricaData.puntos.filter(
        punto => punto.casoId === caso.id
      );
      return {
        casoId: caso.id,
        tituloId: caso.tituloId,
        casoNombre: caso.nombre,
        casoDetalle: caso.detalle, 
        puntos: puntosRelacionados,
      };
    });
    

    setCasosPuntosRelacionados(casosPuntos);

  }, [rubricaData]);

  return (
    <>
      <Base />

      <div id="todo">
        <div id="img2">
          {enlaceSeleccionado && (
            <div id="img">
              <img src={enlaceSeleccionado + "&id=" + id} alt="Imagen" />
            </div>
          )}
        </div>
        <div> <button id="imgboton" onClick={openImageInNewWindow}>Abrir imagen en nueva ventana</button></div>
        {rubricaData && rubricaData.titulos && rubricaData.puntos ? (
          <div>
            {titulosData.map((titulo, index) => (
              <div key={titulo.id}>
                <h3 id="titulo">{titulo.titulo}</h3>
                <ul id="casos">
                  {casosPuntosRelacionados
                    .filter(casoPunto => casoPunto.tituloId === titulo.id)
                    .map((caso, casoId) => (
                      <li key={casoId}>
                        <h3>{caso.casoNombre}</h3>
                        <div>{caso.casoDetalle}</div>
                        <ul id="puntos">
                        {caso.puntos.map((punto, puntoId) => (
                          <li key={puntoId}>
     <label id="labelp">
    <input
      type="checkbox"
      name={`punto-${caso.id}`}
      checked={punto.seleccionado}
      onChange={(e) =>
        handlePuntoSeleccionado(caso.casoId, punto.id, e.target.checked)
      }
    />
    {punto.nombre} - Valor: {punto.valor}
  </label>
</li>

))}
                        </ul>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            <p id="total">Total: {sumaValores}</p>
            <button id="envio" onClick={enviarResultados}>Enviar</button>
          </div>
        ) : (
          <p>Cargando...</p>
        )}
      </div>
    </>
  );
};
