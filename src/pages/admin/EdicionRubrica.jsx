import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Base } from './BaseAdmin';
import '../../styles/EdicionRubrica.css';

export const EdicionRubrica = () => {
  const { rubricaId } = useParams();
  const [rubricaNombre, setRubricaNombre] = useState('');
  const [titulosInputData, setTitulosInputData] = useState([]);
  const [titulosData, setTitulosData] = useState([]);
  const [casoData, setCasosData] = useState([]);
  const [puntoData, setPuntosData] = useState([]);
  const [titulosEliminados, setTitulosEliminados] = useState([]);
  const [casosEliminados, setCasosEliminados] = useState([]);
  const [puntosEliminados, setPuntosEliminados] = useState([]);
  const [hiddenTitles, setHiddenTitles] = useState([]);
  const [hiddenCases, setHiddenCases] = useState([]);
  const [hiddenPoints, setHiddenPoints] = useState([]);
  const [newTitle, setNewTitle] = useState({ id: null, titulo: '' });
  const [newCase, setNewCase] = useState({ id: null, tituloId: null, nombre: '', detalle: '' });
  const [newPoint, setNewPoint] = useState({ id: null, casoId: null, nombre: '', valor: 0 });
  const [isNewTitleAdded, setIsNewTitleAdded] = useState(false);
  const [isNewCaseAdded, setIsNewCaseAdded] = useState(false);
  const [isNewPointAdded, setIsNewPointAdded] = useState(false);

  const [rubricaData, setRubricaData] = useState({
    rubrica: null,
    titulos: [],
    casos: {},
    puntos: {},
  });
  
  useEffect(() => {
    fetchRubricaData();
  }, [rubricaId]);


  const fetchRubricaData = async () => {
    try {
      const response = await fetch(`https://api-git-main-cortis9.vercel.app/rubricas/${rubricaId}`);
      const data = await response.json();
      setRubricaData(data);
  
      const titulos = data.titulos.map((titulo) => ({
        id: titulo.id,
        titulo: titulo.titulo,
      }));

      setTitulosData(titulos);
      setCasosData(data.casos);
      setPuntosData(data.puntos);
    }catch{

    }
  };
  


  useEffect(() => {
    if (rubricaData.rubrica) {
      setRubricaNombre(rubricaData.rubrica.nombre);
  
      const titulosInputData = titulosData.map((titulo) => {
        const casos = titulosData.map((titulo) => {
          const casosArray = casoData[titulo.id];
          if (!casosArray) return {}; 
          return {
            id: titulo.id,
            nombre: titulo.nombre,
            casos: Object.values(casosArray).map((caso) => ({
              id: caso.id,
              nombre: caso.nombre,
              detalle: caso.detalle,
              puntos: (puntoData[caso.id] || []).map((punto) => ({
                id: punto.id,
                nombre: punto.nombre,
                valor: punto.valor,
              })),
            })),
          };
        });
        
        return {
          id: titulo.id,
          nombre: titulo.nombre,
          casos: casos,
        };
      });
  
      setTitulosInputData(titulosInputData);
    }
  }, [rubricaData, titulosData, casoData, puntoData]);


const handleRubricaNombreChange = (e) => {
  setRubricaNombre(e.target.value);
};

const handleTituloNameChange = (e, tituloId) => {
  const { value } = e.target;
  setTitulosData((prevState) =>
    prevState.map((titulo) => {
      if (titulo.id === tituloId) {
        return {
          ...titulo,
          titulo: value,
        };
      }
      return titulo;
    })
  );
};

const handleCasoNameChange = (e, casoId) => {
  const { value } = e.target;
  setCasosData((prevState) =>
    prevState.map((caso) => {
      if (caso.id === casoId) {
        return {
          ...caso,
          nombre: value,
        };
      }
      return caso;
    })
  );
};

const handleCasoDetalleChange = (e, casoId) => {
  const { value } = e.target;
  setCasosData((prevState) =>
    prevState.map((caso) => {
      if (caso.id === casoId) {
        return {
          ...caso,
          detalle: value,
        };
      }
      return caso;
    })
  );
};
const handlePuntoNameChange = (e, casoId, puntoId) => {
  const { value } = e.target;

  const nuevosPuntos = puntoData.map((punto) => {
    if (punto.casoId === casoId && punto.id === puntoId) {
      return {
        ...punto,
        nombre: value,
      };
    }
    return punto;
  });

  setPuntosData(nuevosPuntos);
};

const handlePuntoValorChange = (e, casoId, puntoId) => {
  const { value } = e.target;

  const nuevosPuntos = puntoData.map((punto) => {
    if (punto.casoId === casoId && punto.id === puntoId) {
      return {
        ...punto,
        valor: value,
      };
    }
    return punto;
  });

  setPuntosData(nuevosPuntos);
};

const handleAddNewTitle = (rubricaId) => {
  const newTitleId = rubricaId+1;
  const newTitle = { id: newTitleId, titulo: '' };
  const newCaseId = newTitleId;
  const newCase = { id: newCaseId, tituloId: newTitleId, nombre: '', detalle: '' };
  const newPointId = newCaseId;
  const newPoint = { id: newPointId, casoId: newCaseId, nombre: '', valor: 0 };

  setNewTitle(newTitle);
  setNewCase(newCase);
  setNewPoint(newPoint);
  setTitulosData([...titulosData, newTitle]);
  setCasosData([...casoData, newCase]);
  setPuntosData([...puntoData, newPoint]);
  setIsNewTitleAdded(true);
  setIsNewCaseAdded(true);
  setIsNewPointAdded(true);
};


const handleAddNewCaso = (tituloId) => {
  const newCaseId = tituloId + 1 ;
  const newCase = { id: newCaseId, tituloId: tituloId, nombre: '', detalle: '' };
  const newPointId = newCaseId;
  const newPoint = { id: newPointId, casoId: newCaseId, nombre: '', valor: 0 };

  setIsNewCaseAdded(true);
  setIsNewPointAdded(true);
  setCasosData([...casoData, newCase]);
  setPuntosData([...puntoData, newPoint]);
};


const handleAddNewPunto = (casoId) => {
  const newPointId = casoId + 1;
  const newPoint = { id: newPointId, casoId: casoId, nombre: '', valor: 0 };
  setIsNewPointAdded(true);
  setPuntosData([...puntoData, newPoint]);
};

const handleDeleteTitulo = async (tituloId) => {
  try {
    const casosAEliminar = casoData.filter((caso) => caso.tituloId === tituloId);

    for (const caso of casosAEliminar) {
      const puntosAEliminar = puntoData.filter((punto) => punto.casoId === caso.id);

      for (const punto of puntosAEliminar) {
        await fetchDeletePuntos(punto.casoId); 
      }

      await fetchDeleteCasos(caso.tituloId); 
      setCasosData((prevState) => prevState.filter((c) => c.id !== caso.id));
    }

    const tituloAEliminar = titulosData.find((titulo) => titulo.id === tituloId);
      await fetchDeleteTitulos(tituloAEliminar.id); 
      setTitulosData((prevState) => prevState.filter((t) => t.id !== tituloId));
      setTitulosEliminados((prevState) => [...prevState, tituloId]);
    
  } catch (error) {
    console.error("Error al eliminar el título:", error);
  }
};


const handleDeleteCaso = async (casoId, tituloId) => {
  try {
    
    const puntosAEliminar = puntoData.filter((punto) => punto.casoId === casoId);
    puntosAEliminar.forEach(async (punto) => {
      await fetchDeletePuntos(punto.casoId); 
    });
    const casoAEliminar = casoData.find((caso) => caso.id === casoId);
    await fetchDeleteCasos(casoAEliminar.id);

    setCasosData((prevState) => prevState.filter((caso) => caso.id !== casoId));
    setPuntosData((prevState) => prevState.filter((punto) => punto.casoId !== casoId));

    setCasosEliminados((prevState) => [...prevState, casoId]);

  } catch (error) {
    console.error("Error al eliminar el caso:", error);
  }
};


const handleDeletePunto = async (puntoId, casoId) => {
  try {

    const puntoAEliminar = puntoData.find((punto) => punto.casoId === casoId);

    await fetchDeletePuntos(puntoAEliminar.casoId);


    setPuntosData((prevState) => prevState.filter((punto) => punto.id !== puntoId));


    setPuntosEliminados((prevState) => [...prevState, puntoId]);

    const puntosAsociados = puntoData.filter((punto) => punto.casoId === casoId);
    const puntosOcultos = puntosAsociados.every((punto) => hiddenPoints.includes(punto.id));
    if (puntosOcultos) {
      handleDeleteCaso(casoId, casoData.find((caso) => caso.id === casoId).tituloId);
        }
  } catch (error) {
    console.error("Error al eliminar el punto:", error);
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();

  const tituloIds = titulosData.map(titulo => titulo.id);
  const casoIds = casoData.map(caso => caso.id);

  const requestData = {
    rubrica: { nombre: rubricaNombre },
    titulos: titulosData.map((titulo) => ({
      id: titulo.id,
      titulo: titulo.titulo,
      casos: casoData
        .filter((caso) => caso.tituloId === titulo.id)
        .map((caso) => ({
          id: caso.id,
          nombre: caso.nombre,
          detalle: caso.detalle,
          puntos: puntoData
            .filter((punto) => punto.casoId === caso.id)
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
        await fetchCreateTitulo();
      }

    if(isNewCaseAdded){
        await fetchCreateCasos(tituloIds);

    }

    if(isNewPointAdded){

      await fetchCreatePuntos(casoIds);
    }

   
    const response = await fetch(`https://api-git-main-cortis9.vercel.app/rubricas/${rubricaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (response.ok) {
      console.log('Rubrica actualizada con éxito');
    } else {
      console.error('Error al guardar los cambios');
    }
  } catch (error) {
    console.error('Error al guardar los cambios: ', error);
  }
};


const fetchCreateTitulo = async () => {
  const requestData = {
    titulos: titulosData.map((titulo) => ({
      id: titulo.id,
      titulo: titulo.titulo,
    })),
  }
  try {
    const response = await fetch(`http://localhost:3002/titulos/${rubricaId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData.titulos),
    });

    if (!response.ok) {
      throw new Error('Error al crear el nuevo título');
    }

  } catch (error) {
    throw new Error('Error en la solicitud para crear el nuevo título: ' + error.message);
  }
};

const fetchCreateCasos = async (tituloId) => {

  const requestData = {
   
      casos: casoData
        .map((caso) => ({
          id: caso.id,
          rubricaId:rubricaId,
          nombre: caso.nombre,
          detalle: caso.detalle,
        })),

  };
  


  try{

    const response = await fetch(`http://localhost:3002/casos/${tituloId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData.casos),
    });

    if (!response.ok) {
      throw new Error('Error al crear el nuevo caso');
    }

  } catch (error) {
    throw new Error('Error en la solicitud para crear el nuevo caso: ' + error.message);
  }

};

const fetchCreatePuntos = async (casoId) => {

  const requestData = {
          puntos: puntoData
            .map((punto) => ({
              id: punto.id,
              nombre: punto.nombre,
              valor: parseInt(punto.valor),
            })),
  };
console.log(requestData)
try{
    const response = await fetch(`http://localhost:3002/puntos/${casoId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData.puntos),
    });

    if (!response.ok) {
      throw new Error('Error al crear el nuevo puntos');
    }
 
  } catch (error) {
    throw new Error('Error en la solicitud para crear el nuevo punto: ' + error.message);
  }
};

const fetchDeleteTitulos = async (tituloId) => {
  try {
    const response = await fetch(`http://localhost:3002/titulos/${tituloId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Error al eliminar el título ${tituloId}`);
    }
  } catch (error) {
    console.error("Error al eliminar el título:", error);
  }
};


const fetchDeleteCasos = async (casoId) => {
  try {
    const response = await fetch(`http://localhost:3002/casos/${casoId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Error al eliminar el caso ${casoId}`);
    }
  } catch (error) {
    console.error("Error al eliminar el caso:", error);
  }
};

const fetchDeletePuntos = async (puntoId) => {
  try {
    const response = await fetch(`http://localhost:3002/puntos/${puntoId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Error al eliminar el punto ${puntoId}`);
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
        <h1 id='rubricat'>Editar Rúbrica</h1>

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
          
          {titulosData.length > 0 ? (
            titulosData.map((titulo) => {
              if (hiddenTitles.includes(titulo.id)) {
                return null;
              }

              return (
                <div key={titulo.id}>
                  <label htmlFor={`tituloNombre_${titulo.id}`}>Nombre del título:</label>
                  <input
                    type='text'
                    id={`tituloNombre_${titulo.id}`}
                    name={`tituloNombre_`}
                    value={titulo.titulo || ''}
                    onChange={(e) => handleTituloNameChange(e, titulo.id)}
                  />

                  <button onClick={() => handleDeleteTitulo(titulo.id)}>Eliminar Título</button>

                  {casoData.length > 0 && casoData.filter((caso) => caso.tituloId === titulo.id).length > 0 && (
                    casoData
                      .filter((caso) => caso.tituloId === titulo.id)
                      .map((caso) => {
                        if (hiddenCases.includes(caso.id)) {
                          return null;
                        }

                        return (
                          <div key={caso.id}>
                            <label htmlFor={`casoNombre_${caso.id}`}>Nombre del caso:</label>
                            <input
                              type='text'
                              id={`casoNombre_${caso.id}`}
                              name='casoNombre'
                              value={caso.nombre || ''}
                              onChange={(e) => handleCasoNameChange(e, caso.id)}
                            />

                            <div>
                              <label htmlFor={`casoDetalle_${caso.id}`}>Detalle del caso:</label>
                              <input
                                type='text'
                                id={`casoDetalle_${caso.id}`}
                                name='casoDetalle'
                                value={caso.detalle || ''}
                                onChange={(e) => handleCasoDetalleChange(e, caso.id)}
                              />
                              <button onClick={() => handleDeleteCaso(caso.id, titulo.id)}>Eliminar Caso</button>
                              <button onClick={() => handleAddNewCaso(titulo.id)}>Nuevo Caso</button>
                            </div>

                            {puntoData.length > 0 &&
                              puntoData.filter((punto) => punto.casoId === caso.id).length > 0 && (
                                puntoData
                                  .filter((punto) => punto.casoId === caso.id)
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
                                          onChange={(e) => handlePuntoNameChange(e, caso.id, punto.id)}
                                        />

                                        <label htmlFor={`puntoValor_${punto.id}`}>Valor de Punto:</label>
                                        <input
                                          type='number'
                                          id={`puntoValor_${punto.id}`}
                                          name='puntoValor'
                                          value={punto.valor || ''}
                                          onChange={(e) => handlePuntoValorChange(e, caso.id, punto.id)}
                                        />

                                        <button onClick={() => handleDeletePunto(punto.id, punto.casoId)}>Eliminar Punto</button>
                                        <button onClick={() => handleAddNewPunto(caso.id)}>Nuevo Punto</button>
                                      </div>
                                    );
                                  })
                              )}
                          </div>
                        );
                      })
                  )}
                  <button type='button' onClick={() => handleAddNewTitle(titulo.id)}>Nuevo Título</button>
                </div>
              );
            })
          ) : (
            <div>No hay títulos asociados</div>
          )}

          <button type='submit'>Guardar cambios</button>
        </form>
      </div>
    )}
  </div>
);
};