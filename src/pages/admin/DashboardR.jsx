import React, { useState, useEffect } from 'react';
import { Base } from './BaseAdmin';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin/Edicion.css';
import csvimg from '../../assets/csv.png';
import searchimg from '../../assets/search.png';
import jsonimg from '../../assets/json.png';
import excelimg from '../../assets/excel.png';
import * as XLSX from 'xlsx';

export const DashboardR= () => {
  const [rubricas, setRubricas] = useState([]);
  const [exportOptionsVisible2, setExportOptionsVisible2] = useState(false);
  const [searchQueryProyectos, setSearchQueryProyectos] = useState('');
  const [searchQueryRubricas, setSearchQueryRubricas] = useState('');

  const navigate = useNavigate();



  const handleEditarRubrica = (rubricaId) => {
    const rubrica = rubricas.find((rubrica) => rubrica.id === rubricaId);
    if (rubrica) {
      setEditedData(rubrica);
      navigate(`/edicion/rubrica/${rubrica.id}`);
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

    fetchRubricas();
  }, []);



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



  const toggleExportOptions2 = () => {
    setExportOptionsVisible2((prevState) => !prevState);
  };

 

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
          {rubricas && (
            <>
              <section className={`table__header ${rubricas ? 'table__header-rubricas' : ''}`}>
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
                    <th>Número</th> 
                    <th>Rúbrica</th> 
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
