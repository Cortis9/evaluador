import React, { useState, useEffect } from "react";
import { Base } from "../normal/Base";
import "../../styles/normal/EvaluacionProyecto.css";
import { useNavigate } from "react-router-dom";

export const EvaluacionProyecto = () => {
  const [rubricaData, setRubricaData] = useState({
    rubrica: {
      id: 0,
      nombre: "",
    },
    categoriacriterios: [],
    criterios: [],
    puntos: [],
  });

  const [puntosSeleccionados, setPuntosSeleccionados] = useState([]);
  const [criteriosPuntosRelacionados, setcriteriosPuntosRelacionados] = useState([]);
  const [sumaValores, setSumaValores] = useState(0);
  const [correojuez, setCorreoJuez] = useState("");
  const [NombreRubrica, setNombreRubrica] = useState("");
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();
  const [categoriacriteriosData, setcategoriacriteriosData] = useState([]);

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
      const response = await fetch(`https://api-git-main-cortis9.vercel.app/rubricas/${rubricaId}`);
      const data = await response.json();
      setRubricaData(data);
      setNombreRubrica(data.rubrica.nombre);

      const sortedcategoriacriteriosData = data.categoriacriterios ? data.categoriacriterios.sort((a, b) => a.id - b.id) : [];
      setcategoriacriteriosData(sortedcategoriacriteriosData);
    } catch (error) {
      console.error("Error al obtener los datos de la rubrica: ", error);
      window.alert('Error al obtener los datos de la rubrica, falta asignar una rubrica')
      navigate('/Home')
      location.reload(); 

    }
  };

  const openImageInNewWindow = () => {
    if (enlaceSeleccionado && id) {
      window.open(enlaceSeleccionado + "&id=" + id, "_blank");
    }
    console.log(enlaceSeleccionado)
  };

  const enviarCalificacionFinal = async (calificacion) => {
    try {
      const response = await fetch("https://api-git-main-cortis9.vercel.app/calificacion", {
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
      for (const criterioPunto of criteriosPuntosRelacionados) {
        const { criterioId, criterioNombre, criterioDetalle } = criterioPunto;
        const puntosSeleccionadoscriterio = puntosSeleccionados.filter(
          (punto) => punto.criterioId === criterioId 
        );
  
        const resultados = {
          proyectoId,
          criteriosPuntosRelacionados: [
            {
              criterioId,
              criterioNombre,
              criterioDetalle,
              puntos: puntosSeleccionadoscriterio,
            },
          ],
        };

        const criteriosSinPuntos = criteriosPuntosRelacionados.some((criterio) => {
          return criterio.puntos.every((punto) => !punto.seleccionado);
        });
    
        if (criteriosSinPuntos) {
          window.alert('Por favor, selecciona al menos un punto para cada criterio antes de enviar.');
        }else{

        const response = await fetch("https://api-git-main-cortis9.vercel.app/resultados", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(resultados),
        });

        if (response.ok) {
          console.log("Resultados enviados correctamente");
  
          await fetch(`https://api-git-main-cortis9.vercel.app/proyectos/${proyectoId}/estado`, {
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
 
      }
  
      
    } catch (error) {
      console.error("Error al enviar los resultados: ", error);
    }
    
  };
  

  const handlePuntoSeleccionado = (criterioId, puntoId, isChecked) => {
    setcriteriosPuntosRelacionados((prevState) => {
      return prevState.map((criterio) => {
        if (criterio.criterioId === criterioId) {
          const updatedPuntos = criterio.puntos.map((punto) => {
            return {
              ...punto,
              seleccionado: punto.id === puntoId,
            };
          });
          return {
            ...criterio,
            puntos: updatedPuntos,
          };
        }
        return criterio;
      });
    });
  
    setPuntosSeleccionados((prevSelected) => {
     
      const filteredSelected = prevSelected.filter((punto) => punto.criterioId !== criterioId);
  
    
      if (isChecked) {
        const puntoSeleccionado = criteriosPuntosRelacionados
          .find((criterio) => criterio.criterioId === criterioId)
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
    criteriosPuntosRelacionados.forEach((criterio) => {
      criterio.puntos.forEach((punto) => {
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
  }, [criteriosPuntosRelacionados]);


  useEffect(() => {
    const criteriosPuntos = rubricaData.criterios.map(criterio => {
      const puntosRelacionados = rubricaData.puntos.filter(
        punto => punto.criterioId === criterio.id
      );
      return {
        criterioId: criterio.id,
        categoriacriterioId: criterio.categoriacriterioId,
        criterioNombre: criterio.nombre,
        criterioDetalle: criterio.detalle, 
        puntos: puntosRelacionados,
      };
    });
    

    setcriteriosPuntosRelacionados(criteriosPuntos);

  }, [rubricaData]);
    
    const estiloParrafo = {
      fontSize: '24px',
    };

  return (
    <>
      <Base />

      <div id="todo">

        <div id="img2">
        <iframe src={enlaceSeleccionado}  allow="autoplay" id="pdf"></iframe>
        </div>
        {rubricaData && rubricaData.categoriacriterios && rubricaData.puntos ? (
          <div>
            {categoriacriteriosData.map((categoriacriterio, index) => (
              <div key={categoriacriterio.id}>
                <h3 id="categoriacriterio">{categoriacriterio.categoriacriterio}</h3>
                <ul id="criterios">
                  {criteriosPuntosRelacionados
                    .filter(criterioPunto => criterioPunto.categoriacriterioId === categoriacriterio.id)
                    .map((criterio, criterioId) => (
                      <li key={criterioId}>
                        <h3>{criterio.criterioNombre}</h3>
                        <div>{criterio.criterioDetalle}</div>
                        <ul id="puntos">
                        {criterio.puntos.map((punto, puntoId) => (
                          <li key={puntoId}>
     <label id="labelp">
    <input
      type="checkbox"
      name={`punto-${criterio.id}`}
      checked={punto.seleccionado}
      onChange={(e) =>
        handlePuntoSeleccionado(criterio.criterioId, punto.id, e.target.checked)
      }
    />
    {punto.nombre} ({punto.valor})
  </label>
</li>

))}
                        </ul>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            <p id="total" style={estiloParrafo}>Total: {sumaValores}</p>
            <button id="envio" onClick={enviarResultados}>Enviar</button>
          </div>
        ) : (
          <p>Cargando...</p>
        )}
      </div>
    </>
  );
};
