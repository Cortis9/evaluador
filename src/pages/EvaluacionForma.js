import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import DAO from '../components/Logic/DAO';
import Sidebar from '../components/UI/Sidebar';
import TopBar from '../components/UI/TopBar';
import PreguntaSection from '../components/UI/PreguntaSection';
import '../components/Style/evaluaciones.css'
import * as alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.css';
import { useNavigate } from "react-router-dom";

const EvaluacionForma = (props) => {
    let navigate = useNavigate();
    const [claveCartel, setClaveCartel] = useState(useParams().clave);
    const [tipoCartel, setTipoCartel] = useState(useParams().tipo.replace('-', '/'));
    const [preguntas, setPreguntas] = useState([]);
    const [preguntasIngles, setPreguntasIngles] = useState([]);
    const [respuestas, setRespuestas] = useState([]);
    const [respuestasIngles, setRespuestasIngles] = useState([]);
    const [puntajes, setPuntajes] = useState([]);
    const [puntajesIngles, setPuntajesIngles] = useState([-1, -1]);
    const [totalPuntaje, setTotalPuntaje] = useState(0);
    const isEnglishCandidate = useRef(false);
    //const [isEnglishCandidate, setIsEnglishCandidate] = useState(false);
    const [puntosInglesMin, setPuntosInglesMin] = useState(100);
    const { getWhereWhere, getById, createItem, updateItem } = DAO();

    useEffect(() => {
        let retrieve = async () => {
            let data = await getById("respuestas", "respuestas");
            let puntosMinIngles = data.puntosInglesMin[tipoCartel];
            setPuntosInglesMin(puntosMinIngles);
            setRespuestas(data.respuestasPosibles.forma);
            setRespuestasIngles(data.respuestasPosibles.ingles);
            data = await getWhereWhere("pregunta", "criterio", "==", "Forma", "tipo", "==", tipoCartel);
            let inglesIdx = data.findIndex(pregunta => pregunta.titulo === "CARTEL EN INGLÉS");
            let arrIngles = [];
            arrIngles.push(data[inglesIdx]);
            data.splice(inglesIdx, 1);
            inglesIdx = data.findIndex(pregunta => pregunta.titulo === "GRAMATICA");
            arrIngles.push(data[inglesIdx]);
            setPreguntasIngles(arrIngles);
            data.splice(inglesIdx, 1);
            setPreguntas(data);
            let res = await getById("cartel", claveCartel);
            if (res.puntajesForma) {
                let puntajesFromDatabase = res.puntajesForma;
                puntajesFromDatabase = puntajesFromDatabase.map(v => Object.values(v)[0]);
                puntosMinIngles <= puntajesFromDatabase.reduce((a, b) => b < 0 ? a : a + b, 0) ? (isEnglishCandidate.current = true) : (isEnglishCandidate.current = false);
                setPuntajes(puntajesFromDatabase);

                if (res.puntajesIngles) {
                    let puntajesInglesFromDatabase = res.puntajesIngles;
                    puntajesInglesFromDatabase = puntajesInglesFromDatabase.map(v => Object.values(v)[0]);
                    setPuntajesIngles(puntajesInglesFromDatabase);
                }
                setTotalPuntaje(Number(puntajesFromDatabase.reduce((a, b) => b < 0 ? a : a + b, 0)) +
                    ((res.puntajesIngles && isEnglishCandidate.current) ? (res.puntajesIngles.map(v => Object.values(v)[0]).every(v => v === 1) ? 5 : 0) : 0));
            } else {
                console.log("No existe en base de datos")
                setPuntajes(Array(data.length).fill(-1));
            }
        }
        retrieve();
    }, []);

    const goToContenido = () => {
        if (puntajes.some(v => v < 0) || (isEnglishCandidate.current && puntajesIngles.some(v => v < 0))) {
            alertify.alert("Atención", "Debe responder todas las preguntas para poder continuar");
        } else {
            console.log(puntajesIngles);
            alertify.confirm('Concurso de carteles', '¿Esta seguro que desea continuar?',
                function () {
                    navigate("/EvaluacionContenido/" + claveCartel + "/" + tipoCartel.replace('/', '-'));
                    alertify.success('Ok')
                }
                , function () {
                    alertify.error('Cancel')
                });
        }
    };

    const setPuntajeSeleccionado = async (idx, puntaje) => {
        try {
            let puntajesCopy = puntajes.slice();
            puntajesCopy[idx] = puntaje;
            puntosInglesMin <= puntajesCopy.reduce((a, b) => b < 0 ? a : a + b, 0) ? (isEnglishCandidate.current = true) : (isEnglishCandidate.current = false);
            setPuntajes(puntajesCopy);
            setTotalPuntaje(Number(puntajesCopy.reduce((a, b) => b < 0 ? a : a + b, 0)) +
                (isEnglishCandidate.current ? (Number(puntajesIngles.every(v => v === 1) ? 5 : 0)) : 0));
            let dataToUpdate = {
                evaluado: false,
                puntajesForma: preguntas.map((v, i) => { return { [v.titulo]: puntajesCopy[i] } }),
                totalPuntajeForma: Number(puntajesCopy.reduce((a, b) => b < 0 ? a : a + b, 0)) +
                    (isEnglishCandidate.current ? (Number(puntajesIngles.every(v => v === 1) ? 5 : 0)) : 0)
            }
            await updateItem("cartel", claveCartel, dataToUpdate);


        } catch (error) {
            console.log(error);
        }
    }

    const setPuntajeSeleccionadoIngles = async (idx, puntaje) => {
        try {
            let puntajesCopy = puntajesIngles.slice();
            puntajesCopy[idx] = puntaje;
            setPuntajesIngles(puntajesCopy);
            console.log(puntajesCopy);
            setTotalPuntaje(Number(puntajes.reduce((a, b) => b < 0 ? a : a + b, 0)) +
                Number(puntajesCopy.every(v => v === 1) ? 5 : 0));
            let dataToUpdate = {
                evaluado: false,
                puntajesIngles: preguntasIngles.map((v, i) => { return { [v.titulo]: puntajesCopy[i] } }),
                totalPuntajeForma: Number(puntajes.reduce((a, b) => b < 0 ? a : a + b, 0)) +
                    Number(puntajesCopy.every(v => v === 1) ? 5 : 0)
            }
            await updateItem("cartel", claveCartel, dataToUpdate);

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <Sidebar></Sidebar>
            <TopBar titulo="Criterios de forma"></TopBar>
            <div className="workSpace">
                {preguntas.map((pregunta, idx) => {
                    return (
                        <PreguntaSection key={idx} titulo={pregunta.titulo} pregunta={pregunta.rubrica} respuestas={respuestas}
                            idxPregunta={idx} setPuntajeSeleccionado={setPuntajeSeleccionado} puntajes={puntajes} />
                    )
                }
                )}
            </div>

            {isEnglishCandidate.current && <div className="calificaciones">
                {preguntasIngles.map((pregunta, idx) => {
                    return (
                        <PreguntaSection key={idx} titulo={pregunta.titulo} pregunta={pregunta.rubrica} respuestas={respuestasIngles}
                            idxPregunta={idx} setPuntajeSeleccionado={setPuntajeSeleccionadoIngles} puntajes={puntajesIngles} />
                    )
                }
                )}
            </div>}

            <div className="bottomPart">
                <p className="puntaje">{`Puntaje parcial por criterios de forma: ${totalPuntaje}`}</p>
                <button className="botonSiguiente" onClick={() => goToContenido()}>Siguiente</button>
            </div>
        </>

    )
}

export default EvaluacionForma