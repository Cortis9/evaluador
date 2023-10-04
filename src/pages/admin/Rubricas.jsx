import React, { useState } from 'react';
import '../../styles/admin/Rubricas.css';
import { Base } from '../admin/BaseAdmin';

export const Rubricas = () => {
  const [nombre, setRubricaNombre] = useState("");
  const [categoriacriterios, setcategoriacriterios] = useState([]);
  const [categoriacriterio, setcategoriacriterio] = useState("");
  const [nuevoNombrecriterio, setNuevoNombrecriterio] = useState(''); 
  const [nuevoDetallecriterio, setNuevoDetallecriterio] = useState('');
  const [puntos, setPuntos] = useState([{ nombre: "", valor: 0 }]);
  const [existeRubrica, setExisteRubrica] = useState(false);

  const agregarcategoriacriterio = () => {
    const nuevocategoriacriterio = { categoriacriterio: categoriacriterio, criterios: [] };
    setcategoriacriterios([...categoriacriterios, nuevocategoriacriterio]);
    setcategoriacriterio("");
  };

  const agregarcriterio = (categoriacriterioIndex) => {
    const nuevocriterio = {
      nombre: nuevoNombrecriterio,
      detalle: nuevoDetallecriterio,
      puntos: puntos.map((punto) => ({ nombre: punto.nombre || '', valor: punto.valor || 0 })),
    };

    const updatedcategoriacriterios = [...categoriacriterios];
    updatedcategoriacriterios[categoriacriterioIndex].criterios.push(nuevocriterio);

    setcategoriacriterios(updatedcategoriacriterios);
    setNuevoNombrecriterio("");
    setNuevoDetallecriterio("");
    setPuntos([{ nombre: "", valor: 0 }]);
  };

  const agregarPunto = (categoriacriterioIndex, criterioIndex) => {
    const updatedcategoriacriterios = [...categoriacriterios];
    const criterioActualizado = { ...updatedcategoriacriterios[categoriacriterioIndex] };
    const nuevosPuntos = [...criterioActualizado.criterios[criterioIndex].puntos, { nombre: "", valor: 0 }];
    criterioActualizado.criterios[criterioIndex].puntos = nuevosPuntos;
    updatedcategoriacriterios[categoriacriterioIndex] = criterioActualizado;
    setcategoriacriterios(updatedcategoriacriterios);
  };

  const eliminarcategoriacriterio = (categoriacriterioIndex) => {
    const updatedcategoriacriterios = categoriacriterios.filter((_, index) => index !== categoriacriterioIndex);
    setcategoriacriterios(updatedcategoriacriterios);
  };

  const eliminarcriterio = (categoriacriterioIndex, criterioIndex) => {
    const updatedcategoriacriterios = [...categoriacriterios];
    const nuevoscriterios = updatedcategoriacriterios[categoriacriterioIndex].criterios.filter((_, index) => index !== criterioIndex);
    updatedcategoriacriterios[categoriacriterioIndex].criterios = nuevoscriterios;
    setcategoriacriterios(updatedcategoriacriterios);
  };

  const eliminarPunto = (categoriacriterioIndex, criterioIndex, puntoIndex) => {
    const updatedcategoriacriterios = [...categoriacriterios];
    const nuevosPuntos = updatedcategoriacriterios[categoriacriterioIndex].criterios[criterioIndex].puntos.filter((_, index) => index !== puntoIndex);
    updatedcategoriacriterios[categoriacriterioIndex].criterios[criterioIndex].puntos = nuevosPuntos;
    setcategoriacriterios(updatedcategoriacriterios);
  };

  const handlecriterioChange = (categoriacriterioIndex, criterioIndex, campo, value) => {
    const updatedcategoriacriterios = [...categoriacriterios];
    updatedcategoriacriterios[categoriacriterioIndex].criterios[criterioIndex][campo] = value;
    setcategoriacriterios(updatedcategoriacriterios);
  };

  const handlePuntoChange = (categoriacriterioIndex, criterioIndex, puntoIndex, campo, value) => {
    const updatedcategoriacriterios = [...categoriacriterios];
    updatedcategoriacriterios[categoriacriterioIndex].criterios[criterioIndex].puntos[puntoIndex][campo] = value;
    setcategoriacriterios(updatedcategoriacriterios);
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
        categoriacriterios: categoriacriterios.map((categoriacriterio) => ({
          categoriacriterio: categoriacriterio.categoriacriterio,
          criterios: categoriacriterio.criterios.map((criterio) => ({
            nombre: criterio.nombre,
            detalle: criterio.detalle,
            puntos: criterio.puntos.map((punto) => ({ nombre: punto.nombre, valor: punto.valor })),
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
        setcategoriacriterios([]);
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
      <h1 id='h2r'>Crear Rúbrica</h1>
      <div>
        <label>Nombre de la Rúbrica:</label>
        <input
          type="text"
          id='input'
          value={nombre}
          onChange={(e) => setRubricaNombre(e.target.value)}
          onBlur={() => verificarExistenciaRubrica(nombre)}
        />
      </div>
      <div>
        {categoriacriterios.map((categoriacriterio, categoriacriterioIndex) => (
          <div key={categoriacriterioIndex}>
            <h3 id='h2r'>{categoriacriterio.categoriacriterio}</h3>
            {categoriacriterio.criterios.map((criterio, criterioIndex) => (
              <div key={criterioIndex}>
                <div>
                  <label>Nombre del criterio:</label>
                  <input
                    type="text"
                    id='input'
                    placeholder="Criterio"
                    value={criterio.nombre}
                    onChange={(e) =>
                      handlecriterioChange(categoriacriterioIndex, criterioIndex, "nombre", e.target.value)
                    }
                  />
                </div>
                <div>
                  <input
                    type="text"
                    id='input'
                    placeholder="Detalle del criterio"
                    value={criterio.detalle}
                    onChange={(e) =>
                      handlecriterioChange(categoriacriterioIndex, criterioIndex, "detalle", e.target.value)
                    }
                  />
                </div>
                {criterio.puntos.map((punto, puntoIndex) => (
                  <div key={puntoIndex}>
                    <label>Punto:</label>
                    <input
                      id='input'
                      type="text"
                      placeholder={`Nombre del punto ${puntoIndex + 1}`}
                      value={punto.nombre}
                      onChange={(e) =>
                        handlePuntoChange(
                          categoriacriterioIndex,
                          criterioIndex,
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
                          categoriacriterioIndex,
                          criterioIndex,
                          puntoIndex,
                          "valor",
                          parseInt(e.target.value)
                        )
                      }
                    />
               

                    <button id='buttone' onClick={() => eliminarPunto(categoriacriterioIndex, criterioIndex, puntoIndex)}>
                      Eliminar Punto
                    </button>
                    <div><button onClick={() => agregarPunto(categoriacriterioIndex, criterioIndex)} id='buttonc'>
                  Agregar Punto
                </button></div> 
                  </div>
                ))}
            
                <button onClick={() => eliminarcriterio(categoriacriterioIndex, criterioIndex)} id='buttone'>
                  Eliminar Criterio
                </button>
              </div>
            ))}
         <div><button onClick={() => agregarcriterio(categoriacriterioIndex)} id='buttonc'>Agregar Criterio</button></div>
            <button onClick={() => eliminarcategoriacriterio(categoriacriterioIndex)} id='buttone'>
              Eliminar Categoría
            </button>
           
            
          </div>
        ))}
        <div>
          <label>Categoría:</label>
          <input
            type="text"
            value={categoriacriterio}
            id='input'
            onChange={(e) => setcategoriacriterio(e.target.value)}
          />
        </div>
        <button onClick={agregarcategoriacriterio} id='button'>Guardar Categoria</button>
      </div>
      <button onClick={enviarDatos} id='guardar'>Crear Rubrica</button>
    </div>
  );
};
