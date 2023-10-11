import React from 'react';
import { Base } from "../normal/Base";
import '../../styles/normal/Enviado.css'
import leonel from '../../assets/giphy.gif';


export const Enviado = () => {
  

  return (
    <>
    <Base />
    <div id='evaluacion'>

    <h1 id='h1'>Evaluación Enviada</h1>
    <div> <img src={leonel} width={500} id='leonel'/></div>
    <h3 id='h3'>Vaya al menú y elija otro trabajo para evaluar.</h3>
   


    </div>
    </>
  );
};


