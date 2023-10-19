import React, { useState, useEffect } from 'react';
import { Base } from './BaseAdmin';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin/Dashboards.css';
import csvimg from '../../assets/csv.png';
import searchimg from '../../assets/search.png';
import jsonimg from '../../assets/json.png';
import excelimg from '../../assets/excel.png';
import * as XLSX from 'xlsx';

export const DashboardP = () => {
  const [proyectos, setProyectos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [correoJuez, setCorreoJuez] = useState({});
  const [exportOptionsVisible, setExportOptionsVisible] = useState(false);
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
  

  useEffect(() => {
    fetchProyectos();
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

 
  
    return (
      <>
        <Base />
          
        <main className="table">
          {proyectos && categorias && (
            <>
              <section className={`table__header`}>
                <div className="input-group">
                  <input
                    id='search'
                    type="search"
                    placeholder=""
                    value={searchQueryRubricas}
                    onChange={(e) => setSearchQueryRubricas(e.target.value)}
                  />
                  <img src={searchimg} alt="" />
                </div>
                <div id='categoriacriteriotablap'><h2 >Proyectos</h2></div>
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
                          <th>Correo del Juez</th>
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
            </>
          )}
        </main>
      </>
    );
    
};
