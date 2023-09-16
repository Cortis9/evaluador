import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Base } from "../normal/Base";
import '../../styles/normal/Enviado.css'
import leonel from '../../assets/giphy.gif';


export const Enviado = () => {
  
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/Home');
  };

  return (
    <>
    <Base />
    <div id='evaluacion'>

    <h1 id='h1'>Evaluación Enviada</h1>
    <div> <img src={leonel} width={500} id='leonel'/></div>
   
    <button onClick={handleGoBack} id='btr'>Home</button>

    </div>
    </>
  );
};


