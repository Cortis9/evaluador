import React, { useEffect, useState } from 'react'
import Sidebar from '../components/UI/Sidebar'
import TopBar from '../components/UI/TopBar'
import '../components/Style/nuevaEvaluacion.css'
import DAO from '../components/Logic/DAO'
import { FaFilePdf } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Cookies from 'universal-cookie';
import { BsFillExclamationCircleFill, BsFillXCircleFill } from "react-icons/bs";
import { FaCheckCircle } from 'react-icons/fa';

const NuevaEvaluacion = () => {
    let navigate = useNavigate();
    const { getWhere } = DAO();
    const cookies = new Cookies();
    const [carteles, setCarteles] = useState([]);
    const [cartelSeleccionado, setCartelSeleccionado] = useState({});
    const [showCartelInfo, setShowCartelInfo] = useState(false);

    useEffect(() => {
        let retrieve = async () => {
            let data = await getWhere("cartel", "juez", "==", cookies.get('idJuez'));
            setCarteles(Array.isArray(data) ? data : [data]);
        }
        retrieve();
    }, []);

    const showCartelInfoFn = async (idxSelected) => {
        let data = await getWhere("cartel", "clave", "==", carteles[idxSelected - 1].clave);
        setCartelSeleccionado(data);
        setShowCartelInfo(true);
    }

    return (
        <>
            <Sidebar></Sidebar>
            <TopBar titulo="Nueva evaluación"></TopBar>
            <div className="workSpace">
                <div className="carteles">
                    <p className="indicacionesNuevaEvaluacion">Seleccione el código de cartel a evaluar</p>
                    <select onChange={(e) => showCartelInfoFn(e.target.selectedIndex)} id="listaCarteles">
                        <option disabled selected> -- Seleccione un cartel -- </option>
                        {carteles.length > 0 && carteles.map((cartel, idx) => {
                            return <option key={idx} value={cartel.Id}>{cartel.titulo}</option>
                        })}
                    </select>
                </div>
                {showCartelInfo && <div className="infoCartel">
                    {!('evaluado' in cartelSeleccionado) ? <BsFillXCircleFill style={{ color: 'red', display: 'inline-block' }} />
                        : cartelSeleccionado.evaluado ? <FaCheckCircle style={{ color: 'green', display: 'inline-block' }} /> : <BsFillExclamationCircleFill style={{ color: 'orange', display: 'inline-block' }} />}
                    <p className="labelTitulo">Clave:</p>
                    <p className="info">{cartelSeleccionado.clave}</p>
                    <p className="labelTitulo">Titulo:</p>
                    <p className="info">{cartelSeleccionado.titulo}</p>
                    <p className="labelTitulo">Autor:</p>
                    <p className="info">{cartelSeleccionado.autor}</p>
                    <p className="labelTitulo">Tipo de cartel:</p>
                    <p className="info">{cartelSeleccionado.tipo}</p>
                    <br />
                    <a href={cartelSeleccionado.link} target="_blank" rel="noreferrer noopener" className="linkCartel">Ver Cartel <FaFilePdf /></a>
                </div>}
                <button id="botonSiguiente" disabled={!showCartelInfo} className="botonSiguiente" onClick={() => window.location.href = ("/EvaluacionForma/" + cartelSeleccionado.clave + "/" + cartelSeleccionado.tipo.replace('/','-'))}>Comenzar Evaluación</button>
            </div>
        </>
    )
}

export default NuevaEvaluacion
