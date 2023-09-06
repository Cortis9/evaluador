import React, { useState } from 'react';
import '../../styles/Rubricas.css';
import { Base } from '../admin/BaseAdmin';

export function Rubricas  ()  {
  
  const [nombre, setRubricaNombre] = useState("");
  const [titulos, setTitulos] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [nuevoNombreCaso, setNuevoNombreCaso] = useState(''); 
  const [nuevoDetalleCaso, setNuevoDetalleCaso] = useState('');
  const [puntos, setPuntos] = useState([{ nombre: "", valor: 0 }]);
  const [existeRubrica, setExisteRubrica] = useState(false);

  const agregarTitulo = () => {
    const nuevoTitulo = { titulo: titulo, casos: [] };
    setTitulos([...titulos, nuevoTitulo]);
    setTitulo("");
  };

  const agregarCaso = (tituloIndex) => {
    const nuevoCaso = {
      nombre: nuevoNombreCaso,
      detalle: nuevoDetalleCaso,
      puntos: puntos.map((punto) => ({ nombre: punto.nombre || '', valor: punto.valor || 0 })),
    };

    const updatedTitulos = [...titulos];
    updatedTitulos[tituloIndex].casos.push(nuevoCaso);

    setTitulos(updatedTitulos);
    setNuevoNombreCaso("");
    setNuevoDetalleCaso("");
    setPuntos([{ nombre: "", valor: 0 }]);
  };

  const agregarPunto = (tituloIndex, casoIndex) => {
    const updatedTitulos = [...titulos];
    const casoActualizado = { ...updatedTitulos[tituloIndex] };
    const nuevosPuntos = [...casoActualizado.casos[casoIndex].puntos, { nombre: "", valor: 0 }];
    casoActualizado.casos[casoIndex].puntos = nuevosPuntos;
    updatedTitulos[tituloIndex] = casoActualizado;
    setTitulos(updatedTitulos);
  };

  const eliminarTitulo = (tituloIndex) => {
    const updatedTitulos = titulos.filter((_, index) => index !== tituloIndex);
    setTitulos(updatedTitulos);
  };

  const eliminarCaso = (tituloIndex, casoIndex) => {
    const updatedTitulos = [...titulos];
    const nuevosCasos = updatedTitulos[tituloIndex].casos.filter((_, index) => index !== casoIndex);
    updatedTitulos[tituloIndex].casos = nuevosCasos;
    setTitulos(updatedTitulos);
  };

  const eliminarPunto = (tituloIndex, casoIndex, puntoIndex) => {
    const updatedTitulos = [...titulos];
    const nuevosPuntos = updatedTitulos[tituloIndex].casos[casoIndex].puntos.filter((_, index) => index !== puntoIndex);
    updatedTitulos[tituloIndex].casos[casoIndex].puntos = nuevosPuntos;
    setTitulos(updatedTitulos);
  };

  const handleCasoChange = (tituloIndex, casoIndex, campo, value) => {
    const updatedTitulos = [...titulos];
    updatedTitulos[tituloIndex].casos[casoIndex][campo] = value;
    setTitulos(updatedTitulos);
  };

  const handlePuntoChange = (tituloIndex, casoIndex, puntoIndex, campo, value) => {
    const updatedTitulos = [...titulos];
    updatedTitulos[tituloIndex].casos[casoIndex].puntos[puntoIndex][campo] = value;
    setTitulos(updatedTitulos);
  };

  const verificarExistenciaRubrica = async (nombreRubrica) => {
    try {
      const response = await fetch(`https://api-git-main-cortis9.vercel.app/rubricas`);
      if (response.ok) {
        const data = await response.json();
        const existeRubrica = data.some((rubrica) => rubrica.nombre === nombreRubrica);
        setExisteRubrica(existeRubrica);
      } else {
        console.error("Error al obtener las rúbricas:", response.status);
      }
    } catch (error) {
      console.error("Error al obtener las rúbricas:", error);
    }
  };

  const enviarDatos = async () => {
    if (existeRubrica) {
      alert('Ya existe una rúbrica con ese nombre.');
      return;
    }
  
    try {
      const requestData = {
        rubricaNombre: nombre,
        titulos: titulos.map((titulo) => ({
          titulo: titulo.titulo,
          casos: titulo.casos.map((caso) => ({
            nombre: caso.nombre,
            detalle: caso.detalle,
            puntos: caso.puntos.map((punto) => ({ nombre: punto.nombre, valor: punto.valor })),
          })),
        })),
      };    
  
      const response = await fetch('https://api-git-main-cortis9.vercel.app/rubricas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
  
      if (response.ok) {
        setRubricaNombre('');
        setTitulos([]);
        setExisteRubrica(false);
        alert('Rúbrica creada con éxito.');
      } else {
        console.error('Error al guardar la rúbrica:', response.status);
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
    }
  };
  return (
    <div id='divr'>
       <Base />
      <h1 id='h2r'> Crear Rubrica</h1>
      <div>
        <label>Nombre de la Rubrica:</label>
        <input
          type="text"
          id='input'
          value={nombre}
          onChange={(e) => setRubricaNombre(e.target.value)}
          onBlur={() => verificarExistenciaRubrica(nombre)}
        />
      </div>
      <div>
        {titulos.map((titulo, tituloIndex) => (
          <div key={tituloIndex}>
            <h3 id='h2r'>{titulo.titulo}</h3>
            {titulo.casos.map((caso, casoIndex) => (
              <div key={casoIndex}>
                <div>
                  <label>Caso:</label>
                  <input
                    type="text"
                    id='input'
                    placeholder="Nombre del caso"
                    value={caso.nombre}
                    onChange={(e) =>
                      handleCasoChange(tituloIndex, casoIndex, "nombre", e.target.value)
                    }
                  />
                </div>
                <div>
                  <input
                    type="text"
                    id='input'
                    placeholder="Detalle del caso"
                    value={caso.detalle}
                    onChange={(e) =>
                      handleCasoChange(tituloIndex, casoIndex, "detalle", e.target.value)
                    }
                  />
                </div>
                {caso.puntos.map((punto, puntoIndex) => (
                  <div key={puntoIndex}>
                    <label>Punto:</label>
                    <input
                      id='input'
                      type="text"
                      placeholder={`Nombre del punto ${puntoIndex + 1}`}
                      value={punto.nombre}
                      onChange={(e) =>
                        handlePuntoChange(
                          tituloIndex,
                          casoIndex,
                          puntoIndex,
                          "nombre",
                          e.target.value
                        )
                      }
                    />
                    <input
                      type="number"
                      placeholder={`Valor del punto ${puntoIndex + 1}`}
                      value={punto.valor}
                      id='input'
                      onChange={(e) =>
                        handlePuntoChange(
                          tituloIndex,
                          casoIndex,
                          puntoIndex,
                          "valor",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <button id='button' onClick={() => eliminarPunto(tituloIndex, casoIndex, puntoIndex)}>
                      Eliminar Punto
                    </button>
                  </div>
                ))}
                <button onClick={() => agregarPunto(tituloIndex, casoIndex)} id='button'>
                  Agregar Punto
                </button>
                <button onClick={() => eliminarCaso(tituloIndex, casoIndex)} id='button'>
                  Eliminar Caso
                </button>
              </div>
            ))}
            <button onClick={() => agregarCaso(tituloIndex)} id='button'>Agregar Caso</button>
            <button onClick={() => eliminarTitulo(tituloIndex)} id='button'>
              Eliminar Título
            </button>
          </div>
        ))}
        <div>
          <label>Titulo:</label>
          <input
            type="text"
            value={titulo}
            id='input'
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>
        <button onClick={agregarTitulo} id='button'>Guardar Título</button>
      </div>
      <button onClick={enviarDatos} id='guardar'>Crear Rubrica</button>
    </div>
  );
};
