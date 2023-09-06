import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/UI/Sidebar'
import TopBar from '../components/UI/TopBar'
import DAO from '../components/Logic/DAO'
import { MdCreate } from "react-icons/md";
import PuntajeEditable from '../components/UI/PuntajeEditable';
import PuntajeEditableIngles from '../components/UI/PuntajesEditablesIngles';
import * as alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.css';
import '../components/Style/adminPuntajes.css';

const AdminPuntajes = () => {
    const [respuestas, setRespuestas] = useState({});
    const { getById, updateItem } = DAO();

    useEffect(() => {
        const getData = async () => {
            var data = await getById("respuestas", "respuestas");
            setRespuestas(data);
            console.log(data);
        }
        getData();
    }, []);

    const savePuntajes = async (puntajesActualizados, criterio) => {
        console.log(puntajesActualizados, criterio);
        let res = await updateItem("respuestas", "respuestas", { ...respuestas, respuestasPosibles: { ...respuestas.respuestasPosibles, [criterio]: puntajesActualizados } });
        if(!res.error){
            setRespuestas({ ...respuestas, respuestasPosibles: { ...respuestas.respuestasPosibles, [criterio]: puntajesActualizados } });
            alertify.success("Puntajes actualizados")
        }else{
            alertify.error("Error al actualizar los puntajes")
        }
    }

    const createNewPuntaje = async(criterio) =>{
        let res = await updateItem("respuestas", "respuestas", 
        { ...respuestas, respuestasPosibles: { ...respuestas.respuestasPosibles, [criterio]: [...respuestas.respuestasPosibles[criterio],"Editar Descripción"] } });
        if(!res.error){
            window.location.reload();
            alertify.success("Creado correctamente")
        }else{
            alertify.error("Error al crear, intentelo de nuevo")
        }
    }

    const deletePuntaje = async(idx, criterio) =>{
        let res = await updateItem("respuestas", "respuestas",
        { ...respuestas, respuestasPosibles: { ...respuestas.respuestasPosibles, [criterio]: [...respuestas.respuestasPosibles[criterio].filter((v,i)=>i!=idx)] } });
        if(!res.error){
            window.location.reload();
            alertify.success("Eliminado correctamente")
        }else{
            alertify.error("Error al eliminar, intentelo de nuevo")
        }
    }

    const savePuntajesMinIngles = async(valor, tipo) =>{
        let res = await updateItem("respuestas", "respuestas", { ...respuestas, puntosInglesMin: { ...respuestas.puntosInglesMin, [tipo]: valor } });
        if(!res.error){
            window.location.reload();
            alertify.success("Puntajes actualizados")
        }else{
            alertify.error("Error al actualizar los puntajes")
        }
    }

    const createNewPuntajeMinIngles = async() =>{
        let res = await updateItem("respuestas", "respuestas", { ...respuestas, puntosInglesMin: { ...respuestas.puntosInglesMin, "Editar Tipo": 0 } });
        if(!res.error){
            window.location.reload();
            alertify.success("Creado correctamente")
        }else{
            alertify.error("Error al crear, intentelo de nuevo")
        }
    }

    const createNewTipoMinIngles = async(newTipo, oldTipo, puntaje) =>{
        let newObj = respuestas.puntosInglesMin;
        newObj[newTipo] = puntaje;
        delete newObj[oldTipo];
        let res = await updateItem("respuestas", "respuestas", { ...respuestas, puntosInglesMin: newObj });
        if(!res.error){
            window.location.reload();
            alertify.success("Creado correctamente")
        }else{
            alertify.error("Error al crear, intentelo de nuevo")
        }
    }

    const deleteTipo = async(tipo) =>{
        let newObj = respuestas.puntosInglesMin;
        delete newObj[tipo];
        let res = await updateItem("respuestas", "respuestas", { ...respuestas, puntosInglesMin: newObj });
        if(!res.error){
            window.location.reload();
            alertify.success("Eliminado correctamente")
        }else{
            alertify.error("Error al eliminar, intentelo de nuevo")
        }
    }

    return (
        <>
            <Sidebar></Sidebar>
            <TopBar titulo="Administración de puntajes"></TopBar>
            <div className="workSpace">
                <p className="titulo centrado">Administración de puntajes por criterio</p>
                {respuestas.respuestasPosibles &&
                    Object.entries(respuestas.respuestasPosibles).map((entry, index) => {
                        return (
                            <div key={index}>
                                <p className="titulo" key={index + (Object.entries(respuestas.respuestasPosibles).length * 2)} >{entry[0]}
                                <MdCreate onClick={()=>createNewPuntaje(entry[0])} style={{ color: "green", "fontSize": "1.2em", "marginLeft": "10px" }} /></p>
                                <PuntajeEditable key={index + (Object.entries(respuestas.respuestasPosibles).length * 3)} puntajesIniciales={entry[1]} savePuntajes={savePuntajes}
                                    criterio={entry[0]} deletePuntaje={deletePuntaje} ></PuntajeEditable>
                            </div>
                        )
                    })
                }
                <p className="titulo centrado">Puntajes minimos para puntos en ingles por tipo
                <MdCreate onClick={()=>createNewPuntajeMinIngles()} style={{ color: "green", "fontSize": "1.2em", "marginLeft": "10px" }} /></p>
                {respuestas.puntosInglesMin &&
                    Object.entries(respuestas.puntosInglesMin).map((entry, index) => {
                        return (
                            <div key={index}>
                                <PuntajeEditableIngles key={index + (Object.entries(respuestas.puntosInglesMin).length * 2)} tipo={entry[0]} puntosMinimos={entry[1]}
                                    deletePuntaje={deletePuntaje} save={savePuntajesMinIngles} saveTipo={createNewTipoMinIngles} deleteTipo={deleteTipo} ></PuntajeEditableIngles>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}

export default AdminPuntajes