import React, { useState, useEffect } from 'react';
import { Base } from '../admin/BaseAdmin';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin/Edicion.css';
import csvimg from '../../assets/csv.png';
import searchimg from '../../assets/search.png';
import jsonimg from '../../assets/json.png';
import excelimg from '../../assets/excel.png';
import * as XLSX from 'xlsx';

export const Edicion = () => {
  const [proyectos, setProyectos] = useState([]);
  const [rubricas, setRubricas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [correoJuez, setCorreoJuez] = useState({});
  const [exportOptionsVisible, setExportOptionsVisible] = useState(false);
  const [exportOptionsVisible2, setExportOptionsVisible2] = useState(false);
  const [searchQueryProyectos, setSearchQueryProyectos] = useState('');
  const [searchQueryRubricas, setSearchQueryRubricas] = useState('');

  const navigate = useNavigate();

  const handleEditarProyecto = (proyectoId) => {
    const proyecto = proyectos.find((proyecto) => proyecto.id === proyectoId);
    if (proyecto) {
      setEditedData(proyecto);
      navigate(`/edicion/proyecto/${proyecto.id}`);
    }
  };


  const handleEditarRubrica = (rubricaId) => {
    const rubrica = rubricas.find((rubrica) => rubrica.id === rubricaId);
    if (rubrica) {
      setEditedData(rubrica);
      navigate(`/edicion/rubrica/${rubrica.id}`);
    }
  };

  const handleEliminarProyecto = async (proyectoId) => {
    
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar este proyecto?');
  
    if (confirmacion) {
      try {
        await fetch(`https://api-git-main-cortis9.vercel.app/proyectos/${proyectoId}`, {
          method: 'DELETE',
        });
        const updatedProyectos = proyectos.filter((proyecto) => proyecto.id !== proyectoId);
        setProyectos(updatedProyectos);
        console.log('Proyecto eliminado con éxito');
      } catch (error) {
        console.error('Error al eliminar el proyecto: ', error);
      }
    }
  };
  
  const handleEliminarRubrica = async (rubricaId) => {

    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar esta rúbrica?');
  
    if (confirmacion) {
      try {
        await fetch(`https://api-git-main-cortis9.vercel.app/rubricas/${rubricaId}`, {
          method: 'DELETE',
        });
        const updatedRubricas = rubricas.filter((rubrica) => rubrica.id !== rubricaId);
        setRubricas(updatedRubricas);
        console.log('Rúbrica eliminada con éxito');
      } catch (error) {
        console.error('Error al eliminar la rúbrica: ', error);
      }
    }
  };

  useEffect(() => {
    fetchProyectos();
    fetchRubricas();
    fetchCategorias();
  }, []);

  const fetchProyectos = async () => {
    try {
      const response = await fetch('https://api-git-main-cortis9.vercel.app/proyectos');
      const data = await response.json();
      setProyectos(data);
      const proyectosIds = data.map((proyecto) => proyecto.id);

        fetchCalificacion(proyectosIds);

      
    } catch (error) {
      console.error('Error al obtener los proyectos: ', error);
    }
  };

  const fetchRubricas = async () => {
    try {
      const response = await fetch('https://api-git-main-cortis9.vercel.app/rubricas');
      const rubricasData = await response.json();

      const rubricasWithcriterios = await Promise.all(
        rubricasData.map(async (rubrica) => {
          const criteriosResponse = await fetch(`https://api-git-main-cortis9.vercel.app/criterios?rubricaId=${rubrica.id}`);
          const criteriosData = await criteriosResponse.json();
          return { ...rubrica, criterios: criteriosData };
        })
      );

      const rubricasWithcriteriosAndPuntos = await Promise.all(
        rubricasWithcriterios.map(async (rubrica) => {
          const criteriosWithPuntos = await Promise.all(
            rubrica.criterios.map(async (criterio) => {
              const puntosResponse = await fetch(`https://api-git-main-cortis9.vercel.app/puntos?criterioId=${criterio.id}`);
              const puntosData = await puntosResponse.json();
              return { ...criterio, puntos: puntosData };
            })
          );
          return { ...rubrica, criterios: criteriosWithPuntos };
        })
      );

      setRubricas(rubricasWithcriteriosAndPuntos);
    } catch (error) {
      console.error('Error al obtener las rubricas: ', error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch('https://api-git-main-cortis9.vercel.app/categorias');
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error al obtener las categorías: ', error);
    }
  };

  const fetchCalificacion = async (proyectoId) => {
    try {
      const response = await fetch(`https://api-git-main-cortis9.vercel.app/calificacion/${proyectoId}`);
      const data = await response.json();

      if (response.ok) {
        const { correoJuez } = data;

        setCorreoJuez(correoJuez);
      } else {
        console.error('Error al obtener la calificación:', data.error);
      }
    } catch (error) {
      console.error('Error al obtener la calificación:', error);
    }
  };

  const handleExportProyectos = (exportType) => {
    if (exportType === 'toJSON') {
      const json = toJSON(proyectos);
      downloadFile(json, 'json', 'proyectos');
    } else if (exportType === 'toCSV') {
      const csv = toCSV(proyectos);
      downloadFile(csv, 'csv', 'proyectos');
    } else if (exportType === 'toEXCEL') {
      const excel = toExcel(proyectos);
      downloadFile(excel, 'xlsx', 'proyectos');
    }
  };

  const handleExportRubricas = (exportType) => {
    if (exportType === 'toJSON-rubricas') {
      const json = toJSON(rubricas);
      downloadFile(json, 'json', 'rubricas');
    } else if (exportType === 'toCSV-rubricas') {
      const csv = convertToCSV(rubricas);
      downloadFile(csv, 'csv', 'rubricas');
    } else if (exportType === 'toEXCEL-rubricas') {
      const excel = convertToExcel(rubricas);
      downloadFile(excel, 'xlsx', 'rubricas');
    }
  };

  const toJSON = (data) => {
    return JSON.stringify(data, null, 4);
  };

  const toCSV = (data) => {
    const headers = ['categoriacriterio', 'nombre', 'correo', 'categoria','rubrica', 'link'];

  const rows = data.map(
    (proyecto) =>
      `${proyecto.titulo},${proyecto.nombre},${proyecto.correo},${proyecto.categoria},${proyecto.rubrica},${proyecto.link}`
  );

  return [headers.join(','), ...rows].join('\n');
  };

  const toExcel = (data) => {
    const filteredData = data.map(({ id, estado, ...rest }) => rest);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Proyectos');
    const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return excelData;
  };

  const convertToCSV = (data) => {
    let csvContent = '';

    csvContent += '"Rubrica ID","Rubrica","Rubrica-criterio ID","criterio ID","criterio","Punto ID","criterio-Punto ID","Punto","Valor-Punto"\n';

    data.forEach((rubrica) => {
      rubrica.criterios.forEach((criterio) => {
        criterio.puntos.forEach((punto) => {
          const row = `"${rubrica.id}","${rubrica.nombre}","${criterio.rubricaId}","${criterio.id}","${criterio.nombre}","${punto.id}","${punto.criterioId}","${punto.nombre}","${punto.valor}"\n`;
          csvContent += row;
        });
      });
    });

    return csvContent;
  };

  const convertToExcel = (data) => {
    const workbook = XLSX.utils.book_new();

    data.forEach((rubrica) => {
      const worksheetData = [['Rubrica ID', 'Rubrica', 'Rubrica-criterio ID', 'criterio ID', 'criterio', 'Punto ID', 'criterio-Punto ID', 'Punto', 'Valor-Punto']];

      rubrica.criterios.forEach((criterio) => {
        criterio.puntos.forEach((punto) => {
          const row = [rubrica.id, rubrica.nombre, criterio.rubricaId, criterio.id, criterio.nombre, punto.id, punto.criterioId, punto.nombre, punto.valor];
          worksheetData.push(row);
        });
      });

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, rubrica.nombre);
    });

    const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return excelData;
  };

  const downloadFile = (data, fileType, fileName = '') => {
    const a = document.createElement('a');
    a.download = fileName + '.' + fileType;
    const mimeType = {
      json: 'application/json',
      csv: 'text/csv',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    const blob = new Blob([data], { type: mimeType[fileType] });
    const url = URL.createObjectURL(blob);
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleExportOptions = () => {
    setExportOptionsVisible((prevState) => !prevState);
  };

  const toggleExportOptions2 = () => {
    setExportOptionsVisible2((prevState) => !prevState);
  };

  const eliminarProyectos = async () => {
  const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar los datos de proyectos? Esta acción no se puede deshacer.');

  if (confirmacion) {
    try {
      const response = await fetch('https://api-git-main-cortis9.vercel.app/proyectos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json', 
        },
      });
  
      if (response.ok) {
        window.alert('Los datos se han eliminado exitosamente.');
      } else if (response.status === 404) {
        console.log('No se encontraron proyectos para eliminar');
      } else {
        console.error('Error al eliminar proyectos');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
  } 
  }

  const eliminarRubricas = async () => {
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar los datos de rubricas? Esta acción no se puede deshacer.');
  
    if (confirmacion) {
      try {
        const response = await fetch('https://api-git-main-cortis9.vercel.app/rubricas', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json', 
          },
        });
    
        if (response.ok) {
          window.alert('Los datos se han eliminado exitosamente.');
        } else if (response.status === 404) {
          console.log('No se encontraron rubricas para eliminar');
        } else {
          console.error('Error al eliminar rubricas');
        }
      } catch (error) {
        console.error('Error al realizar la solicitud:', error);
      }
    } 
    }
  

  return (
    <>
      <Base />
      
      <main className="table">
        {proyectos && rubricas && categorias && (
          <>
            <section className="table__header">
            <div className="input-group">
            <input
            id='search'
        type="search"
        placeholder="Buscar rúbricas..."
        value={searchQueryRubricas}
        onChange={(e) => setSearchQueryRubricas(e.target.value)}
      />
                <img src={searchimg} alt="" />
              </div>
              <div id='categoriacriteriotablap'> <h2 >Proyectos</h2></div>
              <div className="export__file">
                <label
                  htmlFor="export-file2"
                  className="export__file-btn"
                  title="Export File"
                  onClick={toggleExportOptions}
                ></label>
                <input type="checkbox" id="export-file" />
                {exportOptionsVisible && (
                  <div className="export__file-options">
                    <label htmlFor="toJSON-resultados" onClick={() => handleExportProyectos('toJSON')}>
                      JSON <img src={jsonimg} alt="" />
                    </label>
                    <label htmlFor="toCSV-resultados" onClick={() => handleExportProyectos('toCSV')}>
                      CSV <img src={csvimg} alt="" />
                    </label>
                    <label htmlFor="toEXCEL-resultados" onClick={() => handleExportProyectos('toEXCEL')}>
                      EXCEL <img src={excelimg} alt="" />
                    </label>
                    <label  onClick={() => eliminarProyectos()}>
                       <span  className="icono-papelera">🗑️</span>
                    </label>
                  </div>
                )}
                
              </div>
            </section>
            <div id="proyectosTable">
              {categorias.map((categoria) => (
                <div key={categoria}>
                  <div id='divc'>  <h3 id='categoriacriteriocategoria'>{categoria}</h3></div>
                  <table>
                    <thead>
                      <tr>
                        <th>Proyecto</th>
                        <th>Participante o grupo</th>
                        <th>Estado</th>
                        <th>Correo Juez</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proyectos
                        .filter((proyecto) => proyecto.categoria === categoria && proyecto.titulo.includes(searchQueryProyectos))
                        .map((proyecto) => (
                          <tr key={proyecto.id}>
                            <td>{proyecto.titulo}</td>
                            <td>{proyecto.nombre}</td>
                            <td>{proyecto.estado}</td>
                            <td>{typeof correoJuez === 'string' ? correoJuez : ''}</td>
                            <td>
                              <button id='boton' onClick={() => handleEditarProyecto(proyecto.id)}>
                                <span className="icono-lapiz">✏️</span>
                              </button>
                              <button id='boton' onClick={() => handleEliminarProyecto(proyecto.id)}>
                              <span  className="icono-papelera">🗑️</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            <section className="table__header">
            <div className="input-group">
            <input
             id='search2'
        type="search"
        placeholder="Buscar proyectos..."
        value={searchQueryProyectos}
        onChange={(e) => setSearchQueryProyectos(e.target.value)}
      />
                <img src={searchimg} alt="" />
              </div>
              <div id='categoriacriteriotablar'><h2 >Rúbricas</h2></div>
  
  <div className="export__file">
    <label
      htmlFor="export-file-rubricas"
      className="export__file-btn"
      title="Export File"
      onClick={toggleExportOptions2}
    ></label>
    <input type="checkbox" id="export-file-rubricas" />
    {exportOptionsVisible2 && (
      <div className="export__file-options">
        <label
          htmlFor="toJSON-rubricas"
          onClick={() => handleExportRubricas('toJSON-rubricas')}
        >
          JSON <img src={jsonimg} alt="" />
        </label>
        <label
          htmlFor="toCSV-rubricas"
          onClick={() => handleExportRubricas('toCSV-rubricas')}
        >
          CSV <img src={csvimg} alt="" />
        </label>
        <label
          htmlFor="toEXCEL-rubricas"
          onClick={() => handleExportRubricas('toEXCEL-rubricas')}
        >
          EXCEL <img src={excelimg} alt="" />
        </label>
        <label
          
          onClick={() => eliminarRubricas()}
        >
           <span  className="icono-papelera">🗑️</span>
        </label>
      </div>
    )}
  </div>
</section>

            <div id="rubricasTable">
              <table>
                <thead>
                  <tr>
                    <th>Numero</th>
                    <th>Rubrica</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rubricas
                    .filter((rubrica) => rubrica.nombre.includes(searchQueryRubricas))
                    .map((rubrica) => (
                      <tr key={rubrica.id}>
                        <td>{rubrica.id}</td>
                        <td>{rubrica.nombre}</td>
                        <td>
                          <button id='boton' onClick={() => handleEditarRubrica(rubrica.id)}>
                            <span className="icono-lapiz">✏️</span>
                          </button>
                          <button id='boton' onClick={() => handleEliminarRubrica(rubrica.id)}>
                            <span  className="icono-papelera">🗑️</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </>
  );
};
