import React, { useEffect, useState, useRef } from 'react';
import { Base } from "../admin/BaseAdmin";
import { Chart } from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../../styles/ResultadosProyecto.css';
import csvimg from '../../assets/csv.png';
import jsonimg from '../../assets/json.png';
import excelimg from '../../assets/excel.png';
import * as XLSX from 'xlsx';


export function ResultadosProyectoAdmin() {
  const [resultados, setResultados] = useState([]);
  const [calificacionFinal, setCalificacionFinal] = useState(0);
  const [correoDestino, setCorreoDestino] = useState('');
  const [asunto, setAsunto] = useState('');
  const [contenidoCorreo, setContenidoCorreo] = useState('');
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [archivoAdjunto, setArchivoAdjunto] = useState(null);
  const [exportOptionsVisible, setExportOptionsVisible] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const proyectoId = searchParams.get('proyectoId');

    const obtenerResultados = async () => {
      try {
        const response = await fetch(`http://localhost:3002/resultados/${proyectoId}`);
        if (response.ok) {
          const data = await response.json();
          setResultados(data);
          console.log(resultados)
        } else {
          console.error('Error al obtener los resultados');
        }
      } catch (error) {
        console.error('Error al realizar la solicitud:', error);
      }
    };

    obtenerResultados();

    const obtenerCalificacionFinal = async () => {
      try {
        const response = await fetch(`http://localhost:3002/calificacion/${proyectoId}`);
        if (response.ok) {
          const data = await response.json();
          setCalificacionFinal(data.calificacionFinal);
          setCorreoDestino(data.correoJuez);
        } else {
          console.error('Error al obtener la calificación final');
        }
      } catch (error) {
        console.error('Error al realizar la solicitud:', error);
      }
    };

    obtenerCalificacionFinal();
  }, []);

  useEffect(() => {
    if (resultados.length > 0) {
      
      let labels = [];

      for (const result of resultados) {
        
        if (result.puntos && Array.isArray(result.puntos)) {
          labels = result.puntos.map(punto => punto.nombre);
        }
      }
  
      const datasets = resultados.map(result => ({
        label: '', 
        data: result.puntos.map(punto => punto.valor),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }));

      const calificacionFinalData = new Array(labels.length).fill(0);
      calificacionFinalData.push(calificacionFinal);

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const chartConfig = {
        type: 'bar',
        data: {
          labels: ['puntos', 'Calificación Final'],
          datasets: [
            ...datasets,
            {
              label: 'Calificación Final',
              data: calificacionFinalData,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          tooltips: {
            callbacks: {
              title: function (tooltipItem) {
                const index = tooltipItem[0].datasetIndex;
                return datasets[index].label; 
              },
              label: function (tooltipItem) {
                return tooltipItem.formattedValue; 
              },
            },
          },
        },
      };

      const ctx = chartRef.current.getContext('2d');
      chartInstanceRef.current = new Chart(ctx, chartConfig);
    }
  }, [resultados, calificacionFinal]);


  const exportarImagen = () => {
    html2canvas(chartRef.current).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'grafica.png';
      link.click();
    });
  };

  const exportarPDF = () => {
    const pdf = new jsPDF();
    html2canvas(chartRef.current).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 100);
      pdf.save('grafica.pdf');
    });
  };

  const actualizarCalificacionFinal = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const proyectoId = searchParams.get('proyectoId');

    try {
      const response = await fetch(`http://localhost:3002/calificacion/${proyectoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ calificacionFinal }),
      });

      if (response.ok) {
        console.log('Calificación final actualizada correctamente');
      } else {
        console.error('Error al actualizar la calificación final');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
  };

  const handleFileUpload = (files) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setArchivoAdjunto(selectedFile);
    }
  };

  const sendDataToAPI = async () => {
    const formData = new FormData();
    formData.append("text", contenidoCorreo);
    formData.append("to", correoDestino);
    formData.append("subject", asunto);
    formData.append("archivoAdjunto", archivoAdjunto);
  
    try {
      const response = await fetch("http://localhost:3002/send-email", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        console.log("Datos enviados correctamente");
      } else {
        console.error("Error al enviar los datos");
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  };
  
  const enviarCorreo = () => {
    sendDataToAPI();
  };

  const handleExportProyecto = (exportType) => {
    if (exportType === 'toJSON') {
      const json = toJSON(resultados);
      downloadFile(json, 'json', 'proyecto');
    } else if (exportType === 'toCSV') {
      const csv = toCSV(resultados);
      downloadFile(csv, 'csv', 'proyecto');
    } else if (exportType === 'toEXCEL') {
      const excel = toExcel(resultados);
      downloadFile(excel, 'xlsx', 'proyecto');
    }
  };
  const toJSON = (data) => {
    return JSON.stringify(data, null, 4);
  };

  const toCSV = (data) => {
    const headers = ['Caso', 'Puntos'];
    const rows = data.map((item) => {
      const casoNombre = item.caso.nombre;
      const puntos = item.puntos.map((punto) => `${punto.nombre}: ${punto.valor}`).join(', '); 
      return `"${casoNombre}", "${puntos}"`;
    });
    return [headers.join(','), ...rows].join('\n');
  };
  
  const toExcel = (data) => {
    const excelData = [];
  
    excelData.push(['Casos', 'Puntos']);
  
    data.forEach((item) => {
      const casoNombre = item.caso.nombre;
      const puntos = item.puntos.map((punto) => `${punto.nombre}: ${punto.valor}`).join(', ');
      excelData.push([casoNombre, puntos]);
    });
  
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Proyecto');
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  };
  
  

  const toggleExportOptions = () => {
    setExportOptionsVisible((prevState) => !prevState);
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

  return (
    <div>
      <Base />

   
      <div id="contenedor">
      <div className="export__file2">
                <label
                  htmlFor="export-file2"
                  className="export__file-btn2"
                  title="Export File"
                  onClick={toggleExportOptions}
                ></label>
                <input type="checkbox" id="export-file2" />
                {exportOptionsVisible && (
                  <div className="export__file-options2">
                    <label htmlFor="toJSON-resultados" onClick={() => handleExportProyecto('toJSON')}>
                      JSON <img src={jsonimg} alt="" />
                    </label>
                    <label htmlFor="toCSV-resultados" onClick={() => handleExportProyecto('toCSV')}>
                      CSV <img src={csvimg} alt="" />
                    </label>
                    <label htmlFor="toEXCEL-resultados" onClick={() => handleExportProyecto('toEXCEL')}>
                      EXCEL <img src={excelimg} alt="" />
                    </label>
                  </div>
                )}
              </div>
        <h2 id="titulo">Resultados</h2>
        <div className="chart-container">
          <canvas ref={chartRef} id="grafica"></canvas>
          <div className="export-buttons">
            <button onClick={exportarImagen}>Exportar como imagen</button>
            <button onClick={exportarPDF}>Exportar como PDF</button>
          </div>
        </div>

        <label htmlFor="input-calificacion-final">Calificación Final:</label>
        <input
          id="input-calificacion-final"
          type="text"
          name="calificacionFinal"
          value={calificacionFinal}
          onChange={(e) => setCalificacionFinal(e.target.value)}
        />

        <div>
          <label htmlFor="input-correo-destino">Correo de destino:</label>
          <input
            id="input-correo-destino"
            type="text"
            name="correoDestino"
            value={correoDestino}
            onChange={(e) => setCorreoDestino(e.target.value)}
          />

          <label htmlFor="input-asunto">Asunto del correo:</label>
          <input
            id="input-asunto"
            type="text"
            name="asunto"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
          />
        <div>
        <input
        type="file"
        id="input-adjuntar-archivo"
         onChange={(e) => handleFileUpload(e.target.files)}
        />
        <span style={{ color: 'black' }}>
        {archivoAdjunto ? `${archivoAdjunto.name}` : 'Ningún archivo seleccionado'}
      </span>
        </div>
          <label htmlFor="input-correo">Contenido del correo:</label>
          <textarea
            id="input-correo"
            name="contenidoCorreo"
            value={contenidoCorreo}
            onChange={(e) => setContenidoCorreo(e.target.value)}
          ></textarea>
        </div>


        <button onClick={enviarCorreo}>Enviar Correo</button>

        <button onClick={actualizarCalificacionFinal}>Guardar Cambios</button>
      </div>
    </div>
  );
}
