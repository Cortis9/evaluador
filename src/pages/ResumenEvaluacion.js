import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import DAO from '../components/Logic/DAO';
import Sidebar from '../components/UI/Sidebar';
import TopBar from '../components/UI/TopBar';
import { useNavigate } from "react-router-dom";
import '../components/Style/resumen.css';
import CanvasJSReact from '../assets/canvasjs.react';

const ResumenEvaluacion = (props) => {
  let navigate = useNavigate();
  const [claveCartel, setClaveCartel] = useState(useParams().clave);
  const [tipoCartel, setTipoCartel] = useState(useParams().tipo);
  const [cartel, setCartel] = useState({});
  const { getWhereWhere, getById, updateItem } = DAO();
  const [options, setOptions] = useState({});
  var CanvasJS = CanvasJSReact.CanvasJS;
  var CanvasJSChart = CanvasJSReact.CanvasJSChart;

  useEffect(() => {
    const getData = async () => {
      let data = await getById("cartel", claveCartel);
      setCartel(data);
    }
    getData();
  }, [])

  useEffect(() => {
    setOptions({
      title: {
        text: "Puntos por criterio"
      },
      data: [{
        type: "column",
        dataPoints: [
          { label: "Forma", y: cartel.totalPuntajeForma },
          { label: "Contenido", y: cartel.totalPuntajeContenido },
          { label: "Pertinencia", y: cartel.totalPuntajePertinencia }
        ]
      }]
    });
  }, [cartel]);

  return (
    <>
      <Sidebar></Sidebar>
      <TopBar titulo="Resumen de la Evaluación"></TopBar>
      <div className="workSpace">
        <p className="titulo">Por favor, revise el siguiente resumen de la evaluación</p>
        <div className="row">
          <p className="t1">Código</p>
          <p className="t2">{cartel.clave}</p>
        </div>
        <div className="row">
          <p className="t1">Título</p>
          <p className="t2">{cartel.titulo}</p>
        </div>
        <div className="row">
          <p className="t1">Autor</p>
          <p className="t2">{cartel.autor}</p>
        </div>
        <div className="row">
          <p className="t1">Juez</p>
          <p className="t2">{cartel.juez}</p>
        </div>
        <div className="row">
          <p className="t1">Tipo de cartel</p>
          <p className="t2">{cartel.tipo}</p>
        </div>
        <div className="row">
          <p className="t1">Puntaje total de criterios de forma</p>
          <p className="t2">{cartel.totalPuntajeForma}</p>
        </div>
        <div className="row">
          <p className="t1">Puntaje total de criterios de contenido</p>
          <p className="t2">{cartel.totalPuntajeContenido}</p>
        </div>
        <div className="row">
          <p className="t1">Puntaje total de criterios de pertinencia</p>
          <p className="t2">{cartel.totalPuntajePertinencia}</p>
        </div>
      </div>


      <div className="calificaciones">
        <p className="titulo">Criterios de forma</p>
        {cartel.puntajesForma && cartel.puntajesForma.map((val, i) => {
          return (
            <div key={i} className="row2">
              <p className="t2">{Object.keys(val)[0]}</p>
              <p className="t2">{Object.values(val)[0]}</p>
            </div>
          )
        })}
        <p className="titulo">{`Total de puntos en el criterio de Forma: ${cartel.totalPuntajeForma}`}</p>


        <p className="titulo">Criterios de contenido</p>
        {cartel.puntajesContenido && cartel.puntajesContenido.map((val, i) => {
          return (
            <div key={i} className="row2">
              <p className="t2">{Object.keys(val)[0]}</p>
              <p className="t2">{Object.values(val)[0]}</p>
            </div>
          )
        })}
        <p className="titulo">{`Total de puntos en el criterio de Contenido: ${cartel.totalPuntajeContenido}`}</p>


        <p className="titulo">Criterios de pertinencia</p>
        {cartel.puntajesPertinencia && cartel.puntajesPertinencia.map((val, i) => {
          return (
            <div key={i} className="row2">
              <p className="t2">{Object.keys(val)[0]}</p>
              <p className="t2">{Object.values(val)[0]}</p>
            </div>
          )
        })}
        <p className="titulo">{`Total de puntos en el criterio de Pertinencia: ${cartel.totalPuntajePertinencia}`}</p>
      </div>

      <div className="bottomPart">
        <CanvasJSChart options={options}/>
        <p className="titulo">Estimado juez, por favor continúe con la evaluación del siguiente cartel. Presione comenzar nueva evaluación.</p>
        <button className="botonSiguiente" onClick={() => navigate("/NuevaEvaluacion")}>Comenzar nueva evaluación</button>
      </div>
    </>
  )
}

export default ResumenEvaluacion

