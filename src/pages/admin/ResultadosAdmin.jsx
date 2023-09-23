import React, { useState, useEffect } from "react";
import { Base } from "../admin/BaseAdmin";
import { useNavigate } from "react-router-dom";
import "../../styles/normal/Evaluacion.css";
import csvimg from "../../assets/csv.png";
import jsonimg from "../../assets/json.png";
import excelimg from "../../assets/excel.png";
import * as XLSX from "xlsx";

export const ResultadosAdmin = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("");
  const [enlaceSeleccionado, setEnlaceSeleccionado] = useState("");
  const [rubricaSeleccionada, setRubricaSeleccionada] = useState("");
  const [calificacionFinal, setCalificacionFinal] = useState(0);
  const [exportOptionsVisible, setExportOptionsVisible] = useState(false);

  useEffect(() => {
    fetch("https://api-git-main-cortis9.vercel.app/proyectos")
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          setProyectos(data);
        }
      });
  }, []);

  useEffect(() => {
    if (proyectos.length > 0 && proyectoSeleccionado !== "") {
      const proyectoEncontrado = proyectos.find(
        (proyecto) => proyecto.titulo === proyectoSeleccionado
      );

      if (proyectoEncontrado) {
        const modifiedLink = proyectoEncontrado.link
        .replace("/view?usp=sharing", "/preview");
        setEnlaceSeleccionado(modifiedLink);
 

        fetch(`https://api-git-main-cortis9.vercel.app/${proyectoEncontrado.id}`)
          .then((response) => response.json())
          .then((data) => {
            if (data && data.rubrica) {
              setRubricaSeleccionada(data.rubrica);
            }
          });
      } else {
        setEnlaceSeleccionado("");
        setRubricaSeleccionada("");
      }
    }
  }, [proyectos, proyectoSeleccionado]);

  const handleProyectoSeleccionado = (event) => {
    const proyecto = event.target.value;
    setProyectoSeleccionado(proyecto);
  };

  const navigateToEvaluacionProyecto = () => {

    const proyectoEncontrado = proyectos.find(
      (proyecto) => proyecto.titulo === proyectoSeleccionado
    );

    if (proyectoEncontrado) {
      const proyectoId = proyectoEncontrado.id;
      navigate(`/ResultadosProyectoAdmin?proyectoId=${proyectoId}`);
    }
  };

  useEffect(() => {
    obtenerResultados();
  }, []);

  const obtenerResultados = async () => {
    try {
      const response = await fetch(`https://api-git-main-cortis9.vercel.app/calificacion`);
      if (response.ok) {
        const data = await response.json();
        setCalificacionFinal(data);
      } else {
        console.error("Error al obtener los resultados");
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  };

  const handleExportResultados = (exportType) => {
    if (exportType === "toJSON-resultados") {
      const json = toJSON(calificacionFinal);
      downloadFile(json, "json", "resultados");
    } else if (exportType === "toCSV-resultados") {
      const csv = toCSV(calificacionFinal);
      downloadFile(csv, "csv", "resultados");
    } else if (exportType === "toEXCEL-resultados") {
      const excel = toExcel(calificacionFinal);
      downloadFile(excel, "xlsx", "resultados");
    }
  };

  const toJSON = (data) => {
    return JSON.stringify(data, null, 4);
  };

  const toCSV = (data) => {
    const headers = "id,proyectoId,calificacionFinal,correojuez";
    const rows = data.map(
      (calificacionFinal) =>
        `${calificacionFinal.id},${calificacionFinal.proyectoId},${calificacionFinal.calificacionFinal},${calificacionFinal.correojuez}`
    );
    return `${headers}\n${rows.join("\n")}`;
  };

  const toExcel = (data) => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");
    const excelData = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    return excelData;
  };

  const downloadFile = (data, fileType, fileName = "") => {
    const a = document.createElement("a");
    a.download = fileName + "." + fileType;
    const mimeType = {
      json: "application/json",
      csv: "text/csv",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
    const blob = new Blob([data], { type: mimeType[fileType] });
    const url = URL.createObjectURL(blob);
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleExportOptions = () => {
    setExportOptionsVisible(!exportOptionsVisible);
  };
  const eliminarInformacion = () => {
  
    const confirmarEliminacion = window.confirm("¿Estás seguro de que deseas eliminar la información de todas las tablas de resultados?");
  
    if (confirmarEliminacion) {
     
      eliminarInformacionDeTablas();
    }
  };

  const eliminarInformacionDeTablas = async () => {
    try {
     
      const response = await fetch('https://api-git-main-cortis9.vercel.app/resultados', {
        method: 'DELETE',
        
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        console.log('Información de las tablas eliminada con éxito');
        
      } else {
        console.error('Error al eliminar información de las tablas');
        
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
      
    }
  };
  
  return (
    <>
      <Base />

      <form id="form2">
        <section>
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
                <label
                  htmlFor="toJSON-resultados"
                  onClick={() => handleExportResultados("toJSON-resultados")}
                >
                  JSON <img src={jsonimg} alt="" />
                </label>
                <label
                  htmlFor="toCSV-resultados"
                  onClick={() => handleExportResultados("toCSV-resultados")}
                >
                  CSV <img src={csvimg} alt="" />
                </label>
                <label
                  htmlFor="toEXCEL-resultados"
                  onClick={() => handleExportResultados("toEXCEL-resultados")}
                >
                  EXCEL <img src={excelimg} alt="" />
                </label>
              </div>
            )}
          </div>
          <button id='botoneliminar' onClick={eliminarInformacion}>
                            <span className="icono-papelera">🗑️</span>
                          </button>
        </section>
        <h2 id="h2">Resultados</h2>
        <select
          id="proyecto"
          value={proyectoSeleccionado}
          onChange={handleProyectoSeleccionado}
        >
          <option value="">Seleccione un proyecto</option>
          {proyectos.map((proyecto) => (
            <option key={proyecto.id} value={proyecto.titulo}>
              {proyecto.titulo}
            </option>
          ))}
        </select>
        <iframe src={enlaceSeleccionado} width="340" height="480" allow="autoplay" id="pdf"></iframe>
        <button id="buttonsiguiente" onClick={navigateToEvaluacionProyecto}>
          Siguiente
        </button>
      </form>
    </>
  );
};
