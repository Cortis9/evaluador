import React from 'react';
import Sidebar from '../components/UI/Sidebar'
import TopBar from '../components/UI/TopBar'
import '../components/Style/acercaDe.css'

const AcercaDe = () => {
    return (
        <>
            <Sidebar></Sidebar>
            <TopBar titulo="Acerca de"></TopBar>
            <div className="workSpace">
                <p className="subtituloAcercaDe">Acerca de este sistema</p>
                <p>El sistema de evaluación de carteles de investigación es empleado anualmente en el marco del
                    Concurso de Carteles de Investigación de nuestra Universidad cuya organización depende de la
                    Coordinación de
                    Investigación y Publicaciones de la Vicerrectoría Académica.</p>
                <p>Este sistema fue desarrollado por alumnos inscritos al Programa de Servicio Social de la
                    Universidad Anáhuac Mayab.</p>
                <p className="subtituloAcercaDe">Versión 1.</p>
                <p className="subtituloAcercaDe">Desarrolladores</p>
                <p>Leonel Vera Sosa (Ingeniería en informática y negocios digitales)</p>
                <p>Veronica Rodríguez Millán (Ingeniería en informática y negocios digitales)</p>
                <p>Ricardo Hernández Águila (Ingeniería en informática y negocios digitales)</p>
                <p className="subtituloAcercaDe">Asesores</p>
                <p>Jaime A. Zaldívar Rae (Director de desarrollo académico e investigación)</p>
                <p>Mariana B. González Leija (En Coordinación de Investigación y Publicaciones)</p>
                <p>José L. Barrera Canto (Profesor-Investigador de la División de Cs. Exactas e Ingeniería)</p>
            </div>
        </>
    )
};

export default AcercaDe;
