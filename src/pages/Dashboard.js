import React, { useState, useEffect } from 'react';
import Sidebar from '../components/UI/Sidebar'
import TopBar from '../components/UI/TopBar'
import DAO from '../components/Logic/DAO'
import { BsFillExclamationCircleFill, BsFillXCircleFill } from "react-icons/bs";
import {FaCheckCircle} from 'react-icons/fa';

const Dashboard = () => {
    const [jueces, setJueces] = useState([]);
    const [carteles, setCarteles] = useState([]);
    const { getAll } = DAO();

    useEffect(() => {
        const retrieveData = async () => {
            const jueces = await getAll("juez");
            const carteles = await getAll("cartel");
            if (!jueces.error && !carteles.error) {
                setJueces(jueces);
                setCarteles(carteles);
            }
        }
        retrieveData();
    }, []);

    return (
        <>
            <Sidebar></Sidebar>
            <TopBar titulo="Dashboard"></TopBar>
            <div className="workSpace">
                {jueces.map((juez, idx)=>{
                    return (
                        <div key={idx} className="juez">
                            <p className="titulo">{juez.Id + " - " + juez.nombre.toUpperCase() + " " + juez.apellidos.toUpperCase()}</p>
                            {carteles.filter(c=>c.juez == juez.Id).map((cartel, index)=>{
                                //console.log(cartel);
                                return( 
                                    <div key={index} >
                                        {!('evaluado' in cartel) ? <BsFillXCircleFill style={{color: 'red', display: 'inline-block'}}/>
                                        : cartel.evaluado ? <FaCheckCircle style={{color: 'green', display: 'inline-block'}} /> : <BsFillExclamationCircleFill style={{color: 'orange', display: 'inline-block' }} />}
                                        <p style={{ display: 'inline-block', marginLeft: "20px"}}>{cartel.clave + " -> " + cartel.titulo}</p>
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        </>
    )
};

export default Dashboard;