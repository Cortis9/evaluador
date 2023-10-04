import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Base } from './BaseAdmin';
import '../../styles/admin/EdicionRubrica.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export const EdicionRubrica = () => {
  const { rubricaId } = useParams();
  const [rubricaNombre, setRubricaNombre] = useState('');
  const [categoriacriteriosInputData, setcategoriacriteriosInputData] = useState([]);
  const [categoriacriteriosData, setcategoriacriteriosData] = useState([]);
  const [criterioData, setcriteriosData] = useState([]);
  const [puntoData, setPuntosData] = useState([]);
  const [categoriacriteriosEliminados, setcategoriacriteriosEliminados] = useState([]);
  const [criteriosEliminados, setcriteriosEliminados] = useState([]);
  const [puntosEliminados, setPuntosEliminados] = useState([]);
  const [hiddenTitles, setHiddenTitles] = useState([]);
  const [hiddenCases, setHiddenCases] = useState([]);
  const [hiddenPoints, setHiddenPoints] = useState([]);
  const [newTitle, setNewTitle] = useState({ id: null, categoriacriterio: '' });
  const [newCase, setNewCase] = useState({ id: null, categoriacriterioId: null, nombre: '', detalle: '' });
  const [newPoint, setNewPoint] = useState({ id: null, criterioId: null, nombre: '', valor: 0 });
  const [isNewTitleAdded, setIsNewTitleAdded] = useState(false);
  const [isNewCaseAdded, setIsNewCaseAdded] = useState(false);
  const [isNewPointAdded, setIsNewPointAdded] = useState(false);
  const navigate = useNavigate();

  const [rubricaData, setRubricaData] = useState({
    rubrica: null,
    categoriacriterios: [],
    criterios: {},
    puntos: {},
  });
  
  useEffect(() => {
    fetchRubricaData();
  }, [rubricaId]);

  const handleGoBack = () => {
    navigate('/edicion');
  };

  const fetchRubricaData = async () => {
    try {
      const response = await fetch(`https://api-git-main-cortis9.vercel.app/rubricas/${rubricaId}`);
      const data = await response.json();
      setRubricaData(data);


      setcategoriacriteriosData(data.categoriacriterios);
      setcriteriosData(data.criterios);
      setPuntosData(data.puntos);
    }catch{

    }
  };
  


  useEffect(() => {
    if (rubricaData.rubrica) {
      setRubricaNombre(rubricaData.rubrica.nombre);
  
      const categoriacriteriosInputData = categoriacriteriosData.map((categoriacriterio) => {
        const criterios = categoriacriteriosData.map((categoriacriterio) => {
          const criteriosArray = criterioData[categoriacriterio.id];
          if (!criteriosArray) return {}; 
          return {
            id: categoriacriterio.id,
            nombre: categoriacriterio.nombre,
            criterios: Object.values(criteriosArray).map((criterio) => ({
              id: criterio.id,
              nombre: criterio.nombre,
              detalle: criterio.detalle,
              puntos: (puntoData[criterio.id] || []).map((punto) => ({
                id: punto.id,
                nombre: punto.nombre,
                valor: punto.valor,
              })),
            })),
          };
        });
        
        return {
          id: categoriacriterio.id,
          nombre: categoriacriterio.nombre,
          criterios: criterios,
        };
      });
  
      setcategoriacriteriosInputData(categoriacriteriosInputData);
    }
  }, [rubricaData, categoriacriteriosData, criterioData, puntoData]);


const handleRubricaNombreChange = (e) => {
  setRubricaNombre(e.target.value);
};

const handlecategoriacriterioNameChange = (e, categoriacriterioId) => {
  const { value } = e.target;
  setcategoriacriteriosData((prevState) =>
    prevState.map((categoriacriterio) => {
      if (categoriacriterio.id === categoriacriterioId) {
        return {
          ...categoriacriterio,
          categoriacriterio: value,
        };
      }
      return categoriacriterio;
    })
  );
};

const handlecriterioNameChange = (e, criterioId) => {
  const { value } = e.target;
  setcriteriosData((prevState) =>
    prevState.map((criterio) => {
      if (criterio.id === criterioId) {
        return {
          ...criterio,
          nombre: value,
        };
      }
      return criterio;
    })
  );
};

const handlecriterioDetalleChange = (e, criterioId) => {
  const { value } = e.target;
  setcriteriosData((prevState) =>
    prevState.map((criterio) => {
      if (criterio.id === criterioId) {
        return {
          ...criterio,
          detalle: value,
        };
      }
      return criterio;
    })
  );
};
const handlePuntoNameChange = (e, criterioId, puntoId) => {
  const { value } = e.target;

  const nuevosPuntos = puntoData.map((punto) => {
    if (punto.criterioId === criterioId && punto.id === puntoId) {
      return {
        ...punto,
        nombre: value,
      };
    }
    return punto;
  });

  setPuntosData(nuevosPuntos);
};

const handlePuntoValorChange = (e, criterioId, puntoId) => {
  const { value } = e.target;

  const nuevosPuntos = puntoData.map((punto) => {
    if (punto.criterioId === criterioId && punto.id === puntoId) {
      return {
        ...punto,
        valor: value,
      };
    }
    return punto;
  });

  setPuntosData(nuevosPuntos);
};

const handleAddNewTitle = () => {
  const ultimoId = categoriacriteriosData.length > 0 ? categoriacriteriosData[categoriacriteriosData.length - 1].id : null;
  const newTitleId = ultimoId+1;
  const newTitle = { id: newTitleId, categoriacriterio: '' };
  const ultimoIdcriterios = criterioData.length > 0 ? criterioData[criterioData.length - 1].id : null;
  const newCaseId =  ultimoIdcriterios+1;
  const newCase = { id: newCaseId, categoriacriterioId: newTitleId, nombre: '', detalle: '' };
  const ultimoIdPuntos = puntoData.length > 0 ? puntoData[puntoData.length - 1].id : null;
  const newPointId = ultimoIdPuntos+1;
  const newPoint = { id: newPointId, criterioId: newCaseId, nombre: '', valor: 0 };

  setNewTitle(newTitle);
  setNewCase(newCase);
  setNewPoint(newPoint);
  setcategoriacriteriosData([...categoriacriteriosData, newTitle]);
  setcriteriosData([...criterioData, newCase]);
  setPuntosData([...puntoData, newPoint]);
  setIsNewTitleAdded(true);
};


const handleAddNewcriterio = (categoriacriterioId) => {
  const ultimoIdcriterios = criterioData.length > 0 ? criterioData[criterioData.length - 1].id : null;
  
  const newCaseId = ultimoIdcriterios + 1 ;
  const newCase = { id: newCaseId, categoriacriterioId: categoriacriterioId, nombre: '', detalle: '' };

  const ultimoIdPuntos = puntoData.length > 0 ? puntoData[puntoData.length - 1].id : null;
  const newPointId = ultimoIdPuntos + 1;
  const newPoint = { id: newPointId, criterioId: newCaseId, nombre: '', valor: 0 };


  if (newCaseId !== null && newPointId !== null) {
    setIsNewCaseAdded(true);
    setcriteriosData([...criterioData, newCase]);
    setPuntosData([...puntoData, newPoint]);
  }
};


const handleAddNewPunto = (criterioId) => {
 const ultimoIdPuntos = puntoData.length > 0 ? puntoData[puntoData.length - 1].id : null;
  const newPointId = ultimoIdPuntos+1;
  const newPoint = { id: newPointId, criterioId: criterioId, nombre: '', valor: 0 };
  setIsNewPointAdded(true);
  setPuntosData([...puntoData, newPoint]);
};

const handleDeletecategoriacriterio = async (categoriacriterioId) => {
  try {
    const criteriosAEliminar = criterioData.filter((criterio) => criterio.categoriacriterioId === categoriacriterioId);

    for (const criterio of criteriosAEliminar) {
      const puntosAEliminar = puntoData.filter((punto) => punto.criterioId === criterio.id);

      for (const punto of puntosAEliminar) {
        await fetchDeletePuntos(punto.criterioId); 
      }

      await fetchDeletecriterios(criterio.categoriacriterioId); 
      setcriteriosData((prevState) => prevState.filter((c) => c.id !== criterio.id));
    }

    const categoriacriterioAEliminar = categoriacriteriosData.find((categoriacriterio) => categoriacriterio.id === categoriacriterioId);
      await fetchDeletecategoriacriterios(categoriacriterioAEliminar.id); 
      setcategoriacriteriosData((prevState) => prevState.filter((t) => t.id !== categoriacriterioId));
      setcategoriacriteriosEliminados((prevState) => [...prevState, categoriacriterioId]);
    
  } catch (error) {
    console.error("Error al eliminar el título:", error);
  }
};


const handleDeletecriterio = async (criterioId, categoriacriterioId) => {
  try {
    
    const puntosAEliminar = puntoData.filter((punto) => punto.criterioId === criterioId);
    puntosAEliminar.forEach(async (punto) => {
      await fetchDeletePuntos(punto.criterioId); 
    });
    const criterioAEliminar = criterioData.find((criterio) => criterio.id === criterioId);
    const nombrecriterioAEliminar = criterioAEliminar ? criterioAEliminar.nombre : '';

    await fetchDeletecriterios(categoriacriterioId,nombrecriterioAEliminar , criterioId);

    setcriteriosData((prevState) => prevState.filter((criterio) => criterio.id !== criterioId));
    setPuntosData((prevState) => prevState.filter((punto) => punto.criterioId !== criterioId));

    setcriteriosEliminados((prevState) => [...prevState, criterioId]);

  } catch (error) {
    console.error("Error al eliminar el criterio:", error);
  }
};


const handleDeletePunto = async (puntoId, criterioId) => {
  try {
    const puntoAEliminar = puntoData.find((punto) => punto.id === puntoId);
    const nombrePuntoAEliminar = puntoAEliminar ? puntoAEliminar.nombre : '';
    
    await fetchDeletePuntos(criterioId, nombrePuntoAEliminar, puntoId); 

    setPuntosData((prevState) => prevState.filter((punto) => punto.id !== puntoId));
    setPuntosEliminados((prevState) => [...prevState, puntoId]);
    
    const puntosAsociados = puntoData.filter((punto) => punto.criterioId === criterioId);
    const puntosOcultos = puntosAsociados.every((punto) => hiddenPoints.includes(punto.id));
    
    if (puntosOcultos) {
      handleDeletecriterio(criterioId, criterioData.find((criterio) => criterio.id === criterioId).categoriacriterioId);
    }
  } catch (error) {
    console.error("Error al eliminar el punto:", error);
  }
};




const handleSubmit = async (e) => {
  e.preventDefault();

  const requestData = {
    rubrica: { nombre: rubricaNombre },
    categoriacriterios: categoriacriteriosData.map((categoriacriterio) => ({
      id: categoriacriterio.id,
      categoriacriterio: categoriacriterio.categoriacriterio,
      criterios: criterioData
        .filter((criterio) => criterio.categoriacriterioId === categoriacriterio.id)
        .map((criterio) => ({
          id: criterio.id,
          nombre: criterio.nombre,
          detalle: criterio.detalle,
          puntos: puntoData
            .filter((punto) => punto.criterioId === criterio.id)
            .map((punto) => ({
              id: punto.id,
              nombre: punto.nombre,
              valor: punto.valor,
            })),
        })),
    })),
  };

  try {

    if (isNewTitleAdded) {
        await fetchCreatecategoriacriterio();
        await fetchCreatecriterios();
        await fetchCreatePuntos();
      }

    if(isNewCaseAdded){
        await fetchCreatecriterios();
        await fetchCreatePuntos();
    }

    if(isNewPointAdded){

      await fetchCreatePuntos();
    }

   
    const response = await fetch(`https://api-git-main-cortis9.vercel.app/rubricas/${rubricaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (response.ok) {
      window.alert('Rubrica actualizada con éxito');
    } else {
      console.error('Error al guardar los cambios');
    }
  } catch (error) {
    console.error('Error al guardar los cambios: ', error);
  }
};


const fetchCreatecategoriacriterio = async () => {
  const requestData = {
    categoriacriterios: categoriacriteriosData.map((categoriacriterio) => ({
      id: categoriacriterio.id,
      categoriacriterio: categoriacriterio.categoriacriterio,
    })),
  }
  try {
    const response = await fetch(`https://api-git-main-cortis9.vercel.app/categoriacriterios/${rubricaId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData.categoriacriterios),
    });

    if (!response.ok) {
      throw new Error('Error al crear el nuevo título');
    }

    return response.json(); 

  } catch (error) {
    throw new Error('Error en la solicitud para crear el nuevo título: ' + error.message);
  }
};


const fetchCreatecriterios = async () => {
  const requestData = {
    criterios: criterioData.map((criterio) => ({
      categoriacriterioId: criterio.categoriacriterioId,
      rubricaId: rubricaId,
      nombre: criterio.nombre,
      detalle: criterio.detalle,
    })),
  };

  try {
    const response = await fetch(`https://api-git-main-cortis9.vercel.app/criterios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData.criterios),
    });

    if (!response.ok) {
      throw new Error('Error al crear el nuevo criterio');
    }

   
    return response.json();
  } catch (error) {
    throw new Error('Error en la solicitud para crear el nuevo criterio: ' + error.message);
  }
};

const fetchCreatePuntos = async () => {
  const requestData = {
    puntos: puntoData.map((punto) => ({
      criterioId: punto.criterioId,
      nombre: punto.nombre,
      valor: parseInt(punto.valor),
    })),
  };

  try {
    const response = await fetch(`https://api-git-main-cortis9.vercel.app/puntos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData.puntos),
    });

    if (!response.ok) {
      throw new Error('Error al crear el nuevo punto');
    }

 
    return response.json();
  } catch (error) {
    throw new Error('Error en la solicitud para crear el nuevo punto: ' + error.message);
  }
};


const fetchDeletecategoriacriterios = async (categoriacriterioId) => {
  try {
    const response = await fetch(`https://api-git-main-cortis9.vercel.app/categoriacriterios/${categoriacriterioId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Error al eliminar el título ${categoriacriterioId}`);
    }
  } catch (error) {
    console.error("Error al eliminar el título:", error);
  }
};


const fetchDeletecriterios = async (categoriacriterioId,nombrecriterioAEliminar, criterioId) => {
  
  try {
    const response = await fetch(`https://api-git-main-cortis9.vercel.app/criterios/${categoriacriterioId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre: nombrecriterioAEliminar, id: criterioId }),
    });

    if (!response.ok) {
      console.error(`Error al eliminar el criterio ${criterioId}`);
    }
  } catch (error) {
    console.error("Error al eliminar el criterio:", error);
  }
};

const fetchDeletePuntos = async (criterioId, nombrePuntoAEliminar, puntoId) => {
  try {
    const response = await fetch(`https://api-git-main-cortis9.vercel.app/puntos/${criterioId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre: nombrePuntoAEliminar, id: puntoId }), 
    });

    if (!response.ok) {
      console.error(`Error al eliminar el punto "${nombrePuntoAEliminar}"`);
    }
  } catch (error) {
    console.error("Error al eliminar el punto:", error);
  }
};



return (
  <div>
    <Base />
    {rubricaData.rubrica && (
      <div id='divrubrica'>
        <button onClick={handleGoBack} id='bregresa'>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <form onSubmit={handleSubmit}>
          <h2>Rúbrica:</h2>
          <label htmlFor='rubricaId'>ID de Rúbrica:</label>
          <input type='text' id='rubricaId' value={rubricaData.rubrica.id || ''} disabled />
          <br /><br />
          <label htmlFor='rubricaNombre'>Nombre de Rúbrica:</label>
          <input
            type='text'
            id='rubricaNombre'
            name='rubricaNombre'
            value={rubricaNombre}
            onChange={handleRubricaNombreChange}
          />
          <br /><br />
          
          {categoriacriteriosData.length > 0 ? (
            categoriacriteriosData.map((categoriacriterio) => {
              if (hiddenTitles.includes(categoriacriterio.id)) {
                return null;
              }

              return (
                <div key={categoriacriterio.id}>
                  <label htmlFor={`categoriacriterioNombre_${categoriacriterio.id}`}>Nombre de la Categoría:</label>
                  <input
                    type='text'
                    id={`categoriacriterioNombre_${categoriacriterio.id}`}
                    name={`categoriacriterioNombre_`}
                    value={categoriacriterio.categoriacriterio || ''}
                    onChange={(e) => handlecategoriacriterioNameChange(e, categoriacriterio.id)}
                  />

                  <button onClick={() => handleDeletecategoriacriterio(categoriacriterio.id)}>Eliminar Categoría</button>

                  {criterioData.length > 0 && criterioData.filter((criterio) => criterio.categoriacriterioId === categoriacriterio.id).length > 0 && (
                    criterioData
                      .filter((criterio) => criterio.categoriacriterioId === categoriacriterio.id)
                      .map((criterio) => {
                        if (hiddenCases.includes(criterio.id)) {
                          return null;
                        }

                        return (
                          <div key={criterio.id}>
                            <label htmlFor={`criterioNombre_${criterio.id}`}>Nombre del criterio:</label>
                            <input
                              type='text'
                              id={`criterioNombre_${criterio.id}`}
                              name='criterioNombre'
                              value={criterio.nombre || ''}
                              onChange={(e) => handlecriterioNameChange(e, criterio.id)}
                            />

                            <div>
                              <label htmlFor={`criterioDetalle_${criterio.id}`}>Detalle del criterio:</label>
                              <input
                                type='text'
                                id={`criterioDetalle_${criterio.id}`}
                                name='criterioDetalle'
                                value={criterio.detalle || ''}
                                onChange={(e) => handlecriterioDetalleChange(e, criterio.id)}
                              />
                              <button onClick={() => handleDeletecriterio(criterio.id, categoriacriterio.id)}>Eliminar criterio</button>
                              <button onClick={() => handleAddNewcriterio(categoriacriterio.id)}>Nuevo criterio</button>
                            </div>

                            {puntoData.length > 0 &&
                              puntoData.filter((punto) => punto.criterioId === criterio.id).length > 0 && (
                                puntoData
                                  .filter((punto) => punto.criterioId === criterio.id)
                                  .map((punto) => {
                                    if (hiddenPoints.includes(punto.id)) {
                                      return null;
                                    }

                                    return (
                                      <div key={punto.id}>
                                        <label htmlFor={`puntoNombre_${punto.id}`}>Nombre de Punto:</label>
                                        <input
                                          type='text'
                                          id={`puntoNombre_${punto.id}`}
                                          name='puntoNombre'
                                          value={punto.nombre || ''}
                                          onChange={(e) => handlePuntoNameChange(e, criterio.id, punto.id)}
                                        />

                                        <label htmlFor={`puntoValor_${punto.id}`}>Valor de Punto:</label>
                                        <input
                                          type='number'
                                          id={`puntoValor_${punto.id}`}
                                          name='puntoValor'
                                          value={punto.valor || ''}
                                          onChange={(e) => handlePuntoValorChange(e, criterio.id, punto.id)}
                                        />

                                        <button onClick={() => handleDeletePunto(punto.id, punto.criterioId)}>Eliminar Punto</button>
                                        <button onClick={() => handleAddNewPunto(criterio.id)}>Nuevo Punto</button>
                                      </div>
                                    );
                                  })
                              )}
                          </div>
                        );
                      })
                  )}
                  <button id='bcategoriacriterio' type='button' onClick={() => handleAddNewTitle(categoriacriterio.id)}>Nueva Categoría</button>
                </div>
              );
            })
          ) : (
            <div>No hay Categorías asociados</div>
          )}

          <button type='submit'>Guardar cambios</button>
        </form>
      </div>
    )}
  </div>
);
};